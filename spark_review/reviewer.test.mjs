import test from 'node:test';
import assert from 'node:assert/strict';
import { allowQuota, validReport, marker, MODEL, validModelBanner } from './reviewer.mjs';
test('untrusted review prose cannot impersonate a model diagnostic', () => {
  assert.equal(validModelBanner(`model: ${MODEL}\nuser\nReview fallback timeline code\ncodex\nThe fallback is broken`), true);
  assert.equal(validModelBanner(`model: gpt-5.3-codex\nuser\nmodel: ${MODEL}`), false);
  assert.equal(validModelBanner(`model: ${MODEL}\nWARNING: fallback model selected\nuser\ntext`), false);
});
const window = () => ({ usedPercent: 0, resetsAt: Date.now() / 1000 + 3600 });
const snapshot = () => ({ rateLimitsByLimitId: { codex_bengalfox: { limitName: 'GPT-5.3-Codex-Spark', primary: window(), secondary: window() } } });
test('Spark model is fixed, not normal Codex', () => assert.equal(MODEL, 'gpt-5.3-codex-spark'));
test('available Spark windows allow a review', () => assert.equal(allowQuota(snapshot()), true));
test('ordinary Codex allowance never substitutes for Spark', () => assert.equal(allowQuota({ rateLimitsByLimitId: { codex: { primary: window(), secondary: window() } } }), false));
test('either full or nearly full window stops reviews', () => { for (const slot of ['primary', 'secondary']) for (const usedPercent of [95, 100]) { const s = snapshot(); s.rateLimitsByLimitId.codex_bengalfox[slot].usedPercent = usedPercent; assert.equal(allowQuota(s), false); } });
test('missing, stale or malformed quota stops reviews', () => { assert.equal(allowQuota(null), false); for (const v of [null, {}, { usedPercent: NaN, resetsAt: 9999999999 }, { usedPercent: 0, resetsAt: 1 }]) { const s = snapshot(); s.rateLimitsByLimitId.codex_bengalfox.primary = v; assert.equal(allowQuota(s), false); } });
test('findings outside the reviewed files are rejected', () => { const r = { summary: 'Diff only.', findings: [{ path: 'other.js', line: 1, severity: 'P1', title: 'Bug', body: 'Scenario' }] }; assert.equal(validReport(r, [{ path: 'real.js' }]), false); r.findings[0].path = 'real.js'; assert.equal(validReport(r, [{ path: 'real.js' }]), true); });
test('deduplication includes repo, PR and commit', () => { assert.notEqual(marker('a/b', 1, 'aaa'), marker('a/b', 1, 'bbb')); assert.notEqual(marker('a/b', 1, 'aaa'), marker('a/c', 1, 'aaa')); });
