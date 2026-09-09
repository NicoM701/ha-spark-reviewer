import test from 'node:test';
import assert from 'node:assert/strict';
import { readOptions } from './scheduler.mjs';
test('starts only with explicit enabled and publish flags', () => {
  assert.deepEqual(readOptions({enabled:false,publish:false,interval_minutes:10}), {enabled:false,publish:false,interval_minutes:10});
  for (const v of [{}, {enabled:'true',publish:true,interval_minutes:10}, {enabled:true,publish:true,interval_minutes:1}, {enabled:true,publish:true,interval_minutes:NaN}]) assert.throws(() => readOptions(v));
});
