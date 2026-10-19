/* Optional end-to-end check: npm install --no-save playwright, then node tests/browser-smoke.cjs.
 * CHROMIUM_PATH can point to an existing browser. Screenshots go outside the repository.
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const http = require('node:http');
const os = require('node:os');
const { chromium } = require('playwright');
const root = path.resolve(__dirname, '..');
const types = {'.html':'text/html','.js':'text/javascript','.css':'text/css','.json':'application/json','.webmanifest':'application/manifest+json','.woff2':'font/woff2','.png':'image/png','.jpg':'image/jpeg','.webp':'image/webp'};
const server = http.createServer((req,res) => {
  const name = decodeURIComponent(new URL(req.url,'http://localhost').pathname);
  const file = path.resolve(root, '.' + (name === '/' ? '/index.html' : name));
  if (!file.startsWith(root + path.sep)) { res.writeHead(403).end(); return; }
  fs.readFile(file, (error, data) => { res.writeHead(error ? 404 : 200, {'Content-Type':types[path.extname(file)] || 'application/octet-stream'}); res.end(error ? 'Not found' : data); });
});
(async () => {
  await new Promise(resolve => server.listen(0,'127.0.0.1',resolve));
  const base = `http://127.0.0.1:${server.address().port}`;
  const snapshot = JSON.parse(fs.readFileSync(path.join(root,'data/bulgarian-football.json'),'utf8'));
  const lastRound=String(Math.max(...snapshot.events.map(event=>Number(event.intRound)||0)));
  const lastRoundEvents=snapshot.events.filter(event=>String(event.intRound)===lastRound);
  const focusTeam=snapshot.table[0].strTeam;
  const completedRound=snapshot.events.find(event=>event.status==='finished')?.intRound;
  const browser = await chromium.launch({headless:true, ...(process.env.CHROMIUM_PATH ? {executablePath:process.env.CHROMIUM_PATH,args:['--no-sandbox','--disable-dev-shm-usage','--no-zygote','--single-process']} : {})});
  try {
    const context = await browser.newContext({viewport:{width:1440,height:1000},timezoneId:'Pacific/Honolulu',reducedMotion:'reduce'});
    const page = await context.newPage();
    const errors = [];
    page.on('pageerror', error => errors.push(String(error)));
    await page.goto(base);
    await page.waitForSelector('.hero');
    assert.match(await page.locator('.hero-stat').innerText(), new RegExp(snapshot.table[0].strTeam));
    assert.match(await page.locator('.hero-stat').innerText(), new RegExp(String(snapshot.table[0].intPoints)));
    await page.evaluate(() => navigator.serviceWorker.ready);
    await page.reload();
    await page.waitForFunction(() => navigator.serviceWorker.controller !== null);
    await page.waitForSelector('.hero');
    for(const width of [1440,768,390,320]) {
      await page.setViewportSize({width,height:1000});
      assert.equal(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth),false,`home overflow at ${width}`);
      await page.screenshot({path:path.join(os.tmpdir(),`football-home-${width}.png`),fullPage:true});
      await page.locator('nav:visible [data-page="standings"]').click();
      assert.equal(await page.locator('.full-table tbody tr').count(),snapshot.table.length);
      assert.equal(await page.locator('.full-table tbody tr:first-child .table-team span').innerText(),snapshot.table[0].strTeam);
      assert.equal(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth),false,`standings overflow at ${width}`);
      await page.locator('nav:visible [data-page="matches"]').click();
      await page.selectOption('#round-select',lastRound);
      assert.equal(await page.locator('.round-row').count(),lastRoundEvents.length);
      if(lastRoundEvents.some(event=>!event.strTime)) assert.match(await page.locator('.round-list').innerText(),/Час предстои/);
      assert.equal(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth),false,`fixtures overflow at ${width}`);
      await page.screenshot({path:path.join(os.tmpdir(),`football-fixtures-${width}.png`),fullPage:true});
      await page.locator('nav:visible [data-page="home"]').click();
    }
    await page.setViewportSize({width:1440,height:1000});
    await page.locator('nav:visible [data-page="matches"]').click();
    await page.selectOption('#team-filter',focusTeam);
    await page.selectOption('#round-select',lastRound);
    assert.equal(await page.locator('.round-row').count(),lastRoundEvents.filter(event=>event.strHomeTeam===focusTeam||event.strAwayTeam===focusTeam).length);
    await page.selectOption('#team-filter','all');
    await page.selectOption('#round-select',completedRound);
    await page.locator('.round-row').first().focus();
    await page.keyboard.press('Enter');
    assert.equal(await page.locator('.rr-detail').count(),1);
    await page.keyboard.press('Enter');
    assert.equal(await page.locator('.rr-detail').count(),0);
    await page.locator('nav:visible [data-page="teams"]').click();
    assert.equal(await page.locator('.team-card').count(),snapshot.table.length);
    await page.locator('.team-card').first().click();
    assert.match(await page.locator('.profile-head h1').innerText(),new RegExp(snapshot.table[0].strTeam));
    await page.locator('nav:visible [data-page="europe"]').click();
    assert.equal(await page.locator('.europe-card').count(),snapshot.europe.events.length);
    assert.doesNotMatch(await page.locator('#app').innerText(),/undefined|NaN|null/);
    // Refresh is serialized, replaces Europe data, and retains unfinished form input/focus.
    await page.evaluate(() => {state.page='live';render();});
    await page.locator('[name="title"]').fill('Незапазен линк');
    await page.locator('[name="url"]').fill('https://example.com/football');
    await page.locator('[name="title"]').focus();
    await page.evaluate(async () => {await Promise.all([loadData(true),loadData(true)]);});
    assert.equal(await page.locator('[name="title"]').inputValue(),'Незапазен линк');
    assert.equal(await page.evaluate(()=>document.activeElement.name),'title');
    await page.locator('#live-link-form button[type="submit"]').click();
    assert.match(await page.locator('.live-library').innerText(),/Незапазен линк/);
    assert.equal(await page.locator('[name="title"]').inputValue(),'');
    // Malformed saved values never stop startup or the network refresh.
    await page.evaluate(() => localStorage.setItem('a-grupa-data-v11',JSON.stringify({table:[null],events:[],updatedAt:new Date().toISOString()})));
    await page.reload();
    await page.waitForSelector('.hero');
    assert.match(await page.locator('.hero-stat').innerText(),new RegExp(snapshot.table[0].strTeam));
    // PWA shell + helper + latest source snapshot remain usable without network.
    await context.setOffline(true);
    await page.reload();
    await page.waitForSelector('.hero');
    assert.match(await page.locator('.data-health').innerText(),/Запазени данни|без връзка/);
    await page.locator('nav:visible [data-page="matches"]').click();
    assert.ok(await page.locator('.round-row').count() > 0);
    await context.setOffline(false);
    await page.locator('#refresh').click();
    await page.waitForFunction(() => !state.loading && !state.data.offline);
    // A published points correction survives reload exactly, without deriving points from results.
    const revised=structuredClone(snapshot); revised.table[0].intPoints=123;
    let networkRefreshes=0;
    // Service workers forward these requests: routing their own fetch needs a server-side switch,
    // so use the page fetch stub here to exercise the client response boundary deterministically.
    await page.evaluate(data => {
      window.originalFetch=window.fetch;
      window.testRefreshes=0;
      window.fetch=async (...args)=>{
        if(String(args[0]).includes('bulgarian-football.json')) { window.testRefreshes++; return new Response(JSON.stringify(data),{headers:{'Content-Type':'application/json'}}); }
        return window.originalFetch(...args);
      };
    },revised);
    await page.evaluate(()=>Promise.all([loadData(true),loadData(true)]));
    assert.equal(await page.evaluate(()=>window.testRefreshes),1);
    assert.equal(await page.evaluate(()=>state.data.table[0].intPoints),123);
    const stale=structuredClone(snapshot);stale.updatedAt=stale.lastSuccessAt='2026-10-17T08:00:00Z';
    await page.evaluate(async data=>{window.fetch=async()=>new Response(JSON.stringify(data));await loadData(true);},stale);
    assert.equal(await page.evaluate(()=>FootballData.health(state.data).level),'stale');
    const invalid=structuredClone(snapshot);invalid.table[0].intPoints=null;
    await page.evaluate(async data=>{window.fetch=async()=>new Response(JSON.stringify(data));await loadData(true);},invalid);
    assert.equal(await page.evaluate(()=>state.refreshError),true);
    assert.notEqual(await page.evaluate(()=>state.data.table[0].intPoints),null);
    await page.evaluate(async()=>{window.fetch=window.originalFetch;await loadData(true);});
    // Denied persistence is a supported browsing mode.
    await page.addInitScript(()=>Object.defineProperty(window,'localStorage',{get(){throw new Error('storage denied')}}));
    await page.reload();await page.waitForSelector('.hero');
    assert.match(await page.locator('.hero-stat').innerText(),new RegExp(snapshot.table[0].strTeam));
    if(process.env.CHECK_ACCESSIBILITY === '1') {
      const AxeBuilder=require('@axe-core/playwright').default;
      for(const name of ['home','standings','matches','teams','europe']) {
        await page.evaluate(name=>{state.page=name;render()},name);
        const audit=await new AxeBuilder({page}).withTags(['wcag2a','wcag2aa','wcag21aa']).analyze();
        assert.deepEqual(audit.violations.map(item=>({id:item.id,impact:item.impact,targets:item.nodes.map(node=>node.target)})),[],`accessibility ${name}`);
      }
    }
    assert.deepEqual(errors,[]);
    console.log(JSON.stringify({status:'passed',viewports:[1440,768,390,320],timezone:'Pacific/Honolulu',tableRows:snapshot.table.length,fixtures:snapshot.events.length,europe:snapshot.europe.events.length,consoleErrors:errors.length,offlineReload:true,corruptCacheRecovery:true,draftPreservation:true,sourceCorrections:true,storageDenied:true,accessibility:process.env.CHECK_ACCESSIBILITY==='1'}));
  } finally { await browser.close(); }
})().catch(error => {console.error(error);process.exitCode=1;}).finally(()=>server.close());
