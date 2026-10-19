import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import vm from 'node:vm';
import { test } from 'node:test';

const source = await fs.readFile(new URL('../service-worker.js', import.meta.url), 'utf8');
const scope = 'https://example.com/FootballLeague/';
function harness() {
  const listeners = {}, stores = new Map(), deleted = [];
  const key = request => typeof request === 'string' ? request : request.url;
  const makeCache = () => {
    const entries = new Map();
    return {
      async addAll(urls) { for (const url of urls) entries.set(url, new Response(`shell:${url}`)); },
      async put(request, response) { entries.set(key(request), response.clone()); },
      async match(request) { return entries.get(key(request))?.clone(); },
      async keys() { return [...entries.keys()].map(url => ({url})); },
      async delete(request) { return entries.delete(key(request)); }
    };
  };
  const context = {
    URL, Response, Headers,
    self: { registration: {scope}, addEventListener(name, handler) { listeners[name] = handler; },
      async skipWaiting() {}, clients: { async claim() {} } },
    caches: {
      async open(name) { if (!stores.has(name)) stores.set(name, makeCache()); return stores.get(name); },
      async keys() { return [...stores.keys()]; },
      async delete(name) { deleted.push(name); return stores.delete(name); }
    },
    fetch: async () => { throw new Error('offline'); }
  };
  vm.runInNewContext(source, context);
  async function lifecycle(name) { let pending; listeners[name]({waitUntil(value) { pending = value; }}); await pending; }
  async function request(path, options = {}) {
    const pending = []; let answer;
    listeners.fetch({request: { url: new URL(path, scope).href, method: 'GET', mode: 'cors', ...options },
      waitUntil(value) { pending.push(value); }, respondWith(value) { answer = value; }});
    const response = answer ? await answer : undefined;
    await Promise.all(pending);
    return response;
  }
  return { context, stores, deleted, lifecycle, request };
}

test('install precaches the scoped shell and activation deletes only owned outdated caches', async () => {
  const h = harness();
  await h.context.caches.open('unrelated-app-cache');
  await h.context.caches.open('a-grupa:/AnotherApp/:shell-v1');
  await h.context.caches.open('a-grupa:/FootballLeague/:shell-v27');
  await h.lifecycle('install'); await h.lifecycle('activate');
  assert.deepEqual(h.deleted, ['a-grupa:/FootballLeague/:shell-v27']);
  const response = await h.request('index.html');
  assert.match(await response.text(), /shell:https:\/\/example.com\/FootballLeague\/index.html/);
});

test('successful JSON refresh replaces stale data for offline access and revalidates HTTP cache', async () => {
  const h = harness(); await h.lifecycle('install');
  const calls = [];
  h.context.fetch = async (request, options) => { calls.push(options.cache); return new Response('{"round":12}', {headers:{'Content-Type':'application/json'}}); };
  assert.equal(await (await h.request('data/bulgarian-football.json?ts=123')).text(), '{"round":12}');
  h.context.fetch = async () => { throw new Error('offline'); };
  assert.equal(await (await h.request('data/bulgarian-football.json?ts=456')).text(), '{"round":12}');
  assert.deepEqual(calls, ['no-cache']);
});

test('HTTP errors never poison successful data, and uncached errors retain their status', async () => {
  const h = harness(); await h.lifecycle('install');
  h.context.fetch = async () => new Response('good-data');
  await h.request('data/2026-2027.json');
  h.context.fetch = async () => new Response('upstream-error', {status:502});
  assert.equal(await (await h.request('data/2026-2027.json')).text(), 'good-data');
  assert.equal((await h.request('data/missing.json')).status, 502);
  h.context.fetch = async () => { throw new Error('offline'); };
  assert.equal((await h.request('data/missing.json')).status, 503);
});

test('external, out-of-scope, non-GET and arbitrary same-origin requests are left alone', async () => {
  const h = harness();
  for (const path of ['https://cdn.example.com/assets/logo.png', '/OtherApp/index.html', 'api/private']) {
    assert.equal(await h.request(path), undefined);
  }
  assert.equal(await h.request('data/bulgarian-football.json', {method:'POST'}), undefined);
});

test('offline navigation uses scoped index fallback and query strings never mix JSON responses', async () => {
  const h = harness(); await h.lifecycle('install');
  assert.match(await (await h.request('some-route', {mode:'navigate'})).text(), /index.html/);
  h.context.fetch = async () => new Response('one');
  await h.request('data/season.json?year=2026');
  h.context.fetch = async () => { throw new Error('offline'); };
  assert.equal((await h.request('data/season.json?year=2027')).status, 503);
  assert.equal(await (await h.request('data/season.json?year=2026')).text(), 'one');
});

test('runtime cache stays bounded while retaining all install shell assets', async () => {
  const h = harness(); await h.lifecycle('install');
  h.context.fetch = async () => new Response('ok');
  for (let i=0; i<150; i++) await h.request(`assets/temporary-${i}.png`);
  const cache = [...h.stores.values()][0];
  assert.equal((await cache.keys()).length, 120);
  assert.ok(await cache.match(scope+'index.html'));
});


test('versioned shell URLs use the install copy on the first offline reload', async () => {
  const h = harness(); await h.lifecycle('install');
  assert.match(await (await h.request('app.js?v=29')).text(), /shell:.*app.js$/);
  assert.match(await (await h.request('football-data.js?v=30')).text(), /shell:.*football-data.js$/);
});

test('redirected responses are returned but never replace an offline dataset', async () => {
  const h = harness(); await h.lifecycle('install');
  h.context.fetch = async () => {
    const response = new Response('redirected-login');
    Object.defineProperty(response, 'redirected', {value:true});
    return response;
  };
  assert.equal(await (await h.request('data/new-season.json')).text(), 'redirected-login');
  h.context.fetch = async () => { throw new Error('offline'); };
  assert.equal((await h.request('data/new-season.json')).status, 503);
});


test('cached JSON fallback is explicitly marked offline while preserving status, body and headers', async () => {
  const h = harness(); await h.lifecycle('install');
  h.context.fetch = async () => new Response('{"round":14}', {status:200, headers:{'Content-Type':'application/json', 'X-Source':'official'}});
  const online = await h.request('data/2026-2027.json?ts=1');
  assert.equal(online.headers.get('X-Football-Cache'), null);
  h.context.fetch = async () => { throw new Error('offline'); };
  const offline = await h.request('data/2026-2027.json?ts=2');
  assert.equal(offline.headers.get('X-Football-Cache'), 'offline');
  assert.equal(offline.headers.get('Content-Type'), 'application/json');
  assert.equal(offline.headers.get('X-Source'), 'official');
  assert.equal(offline.status, 200);
  assert.equal(await offline.text(), '{"round":14}');
  assert.equal((await h.request('app.js?v=30')).headers.get('X-Football-Cache'), null);
});
