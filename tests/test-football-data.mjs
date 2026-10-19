import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { createRequire } from 'node:module';
const require = createRequire(import.meta.url);
const F = require('../football-data.js');
const event = {dateEvent:'2026-10-19', strTime:'18:00:00', intHomeScore:null, intAwayScore:null, status:'scheduled'};
test('scores require both sides and final state, with nil and active results excluded', () => {
  assert.equal(F.played({...event,intHomeScore:'0',intAwayScore:'0',status:'finished'}),true);
  for (const scores of [[null,null],['1',null],['1',''],['-','-'],['-1','0']]) assert.equal(F.played({...event,intHomeScore:scores[0],intAwayScore:scores[1]}),false);
  assert.equal(F.played({...event,intHomeScore:1,intAwayScore:0,status:'LIVE'}),false);
  assert.equal(F.played({...event,intHomeScore:3,intAwayScore:0,status:'awarded'}),true);
});
test('Sofia kickoff observes both DST and winter offset, independent of browser timezone', () => {
  assert.equal(new Date(F.kickoff(event)).toISOString(),'2026-10-19T15:00:00.000Z');
  assert.equal(new Date(F.kickoff({...event,dateEvent:'2026-11-01'})).toISOString(),'2026-11-01T16:00:00.000Z');
  assert.equal(new Date(F.kickoff({...event,dateEvent:'2027-03-28'})).toISOString(),'2027-03-28T15:00:00.000Z');
  assert.ok(Number.isNaN(F.kickoff({...event,strTime:''})));
  assert.ok(Number.isNaN(F.kickoff({...event,dateEvent:'2026-02-31'})));
  assert.ok(Number.isNaN(F.kickoff({...event,strTime:'25:00'})));
});
test('unknown times remain upcoming throughout Bulgarian date, never ancient postponed matches', () => {
  const now=Date.parse('2026-10-19T16:00:00Z');
  assert.equal(F.upcoming(event,now),false);
  assert.equal(F.upcoming({...event,strTime:''},now),true);
  assert.equal(F.upcoming({...event,strTime:'',dateEvent:'2026-10-18'},now),false);
  assert.equal(F.upcoming({...event,status:'postponed',dateEvent:'2026-11-01'},now),false);
  assert.equal(F.dateKey(new Date('2026-10-18T22:00:00Z')),'2026-10-19');
});
test('freshness is based on successful source time, not browser load time', () => {
  const now=Date.parse('2026-10-19T15:00:00Z');
  const snapshot={updatedAt:'2026-10-19T14:00:00Z'};
  assert.equal(F.health(snapshot,now).level,'fresh');
  assert.equal(F.health({...snapshot,updatedAt:'2026-10-18T14:00:00Z'},now).level,'stale');
  assert.equal(F.health({...snapshot,offline:true},now).level,'offline');
  assert.equal(F.health({...snapshot,warnings:['europe unavailable']},now).level,'partial');
  assert.equal(F.health({updatedAt:'not a date'},now).level,'unknown');
});
test('canonical table preserves source points/order and rejects broken snapshots', () => {
  const table=JSON.parse(fs.readFileSync(new URL('../data/bulgarian-football.json',import.meta.url))).table;
  const snapshot={updatedAt:'2026-10-19T08:00:00Z',season:'2026-2027',table,events:JSON.parse(fs.readFileSync(new URL('../data/bulgarian-football.json',import.meta.url))).events};
  assert.equal(F.validateSnapshot(snapshot),true);
  assert.deepEqual(table,snapshot.table);
  assert.equal(F.validateSnapshot({...snapshot,table:[table[0],table[0]]}),false);
  assert.equal(F.validateSnapshot({...snapshot,table:[]}),false);
  assert.equal(F.validateSnapshot({...snapshot,updatedAt:'invalid'}),false);
});

test('malformed cache cannot crash validation or appear fresh', () => {
  for(const table of [[null],[{}],null]) assert.equal(F.validateSnapshot({table,events:[],updatedAt:new Date().toISOString()}),false);
  const table=JSON.parse(fs.readFileSync(new URL('../data/bulgarian-football.json',import.meta.url))).table;
  const data={table,events:[],season:'2026-2027',updatedAt:'2026-10-19T08:00:00Z'};
  assert.equal(F.validateSnapshot({...data,table:[{...table[0],intPoints:null},...table.slice(1)]}),false);
  assert.equal(F.validateSnapshot({...data,events:[null]}),false);
  assert.equal(F.validateSnapshot({...data,europe:{events:[null],participants:[]}}),false);
  assert.equal(F.validateSnapshot({...data,scorers:[null]}),false);
  assert.equal(F.validateSnapshot({...data,updatedAt:'2099-01-01T00:00:00Z'}),false);
  assert.equal(F.validateSnapshot(data,true),false);
  assert.equal(F.health({updatedAt:'2099-01-01T00:00:00Z'}).level,'unknown');
  assert.equal(F.upcoming({dateEvent:'2099-01-01',status:'finished',intHomeScore:null,intAwayScore:null}),false);
});
