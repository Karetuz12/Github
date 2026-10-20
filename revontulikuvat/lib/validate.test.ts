import { test } from 'node:test';
import assert from 'node:assert/strict';
import { normalizeEmail, normalizeGroup, suggestEmail } from './validate.ts';
import { detectLang, fill } from './i18n.ts';

test('normalizeEmail', () => {
  assert.equal(normalizeEmail('  Anna.Smith@Gmail.com '), 'anna.smith@gmail.com');
  assert.equal(normalizeEmail("o'brien+tour@mail.co.uk"), "o'brien+tour@mail.co.uk");
  assert.equal(normalizeEmail('no-at-sign.com'), null);
  assert.equal(normalizeEmail('a@b'), null);
  assert.equal(normalizeEmail('a b@c.com'), null);
  assert.equal(normalizeEmail('=HYPERLINK("x")@a.com'), null);
  assert.equal(normalizeEmail('+cmd@a.com'), null);
  assert.equal(normalizeEmail(42), null);
});

test('normalizeGroup', () => {
  assert.equal(normalizeGroup(' 7 '), '7');
  assert.equal(normalizeGroup(12), '12');
  assert.equal(normalizeGroup('b2'), 'B2');
  assert.equal(normalizeGroup(''), null);
  assert.equal(normalizeGroup('=1+1'), null);
  assert.equal(normalizeGroup('-5'), null);
  assert.equal(normalizeGroup('group 7'), null);
});

test('suggestEmail', () => {
  assert.equal(suggestEmail('anna@gmial.com'), 'anna@gmail.com');
  assert.equal(suggestEmail('anna@hotmial.com'), 'anna@hotmail.com');
  assert.equal(suggestEmail('anna@gmail.con'), 'anna@gmail.com');
  assert.equal(suggestEmail('anna@yahooo.com'), 'anna@yahoo.com');
  assert.equal(suggestEmail('anna@gmail.com'), null);
  assert.equal(suggestEmail('anna@booklapland.fi'), null);
  assert.equal(suggestEmail('anna@uni-koeln.de'), null);
  assert.equal(suggestEmail('anna@mo.com'), null);
});

test('detectLang', () => {
  assert.equal(detectLang('de-DE,de;q=0.9,en;q=0.8'), 'de');
  assert.equal(detectLang('pt-BR,es;q=0.5'), 'es');
  assert.equal(detectLang('zh-CN,zh;q=0.9'), 'zh');
  assert.equal(detectLang('en;q=0.3,fi;q=0.9'), 'fi');
  assert.equal(detectLang('ja'), 'en');
  assert.equal(detectLang(null), 'en');
});

test('fill', () => {
  assert.equal(fill('Hi {email}, {days} days', { email: 'a@b.fi', days: 30 }), 'Hi a@b.fi, 30 days');
});
