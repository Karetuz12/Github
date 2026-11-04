import { test } from 'node:test';
import assert from 'node:assert/strict';
import { normalizeEmail, normalizeGroup, suggestEmail } from './validate.ts';
import { fill } from './strings.ts';

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

test('fill', () => {
  assert.equal(fill('Hi {email}, {days} days', { email: 'a@b.fi', days: 30 }), 'Hi a@b.fi, 30 days');
});

test('groupCode and groupLabel', async () => {
  const { groupCode, groupLabel } = await import('./validate.ts');
  assert.equal(groupCode('bus', '7'), '7');
  assert.equal(groupCode('bus', '07'), '7');
  assert.equal(groupCode('small', 12), 'S12');
  assert.equal(groupCode('small', '0'), null);
  assert.equal(groupCode('bus', 'x'), null);
  assert.equal(groupLabel('S12'), 'Small Group 12');
  assert.equal(groupLabel('7'), 'Group 7');
  assert.equal(groupLabel('B2'), 'Group B2');
});

test('normalizeText', async () => {
  const { normalizeText } = await import('./validate.ts');
  assert.equal(normalizeText('  Matti   Meikäläinen ', 40), 'Matti Meikäläinen');
  assert.equal(normalizeText('Canon 3', 20), 'Canon 3');
  assert.equal(normalizeText('', 40), null);
  assert.equal(normalizeText('=IMPORTXML("x")', 40), null);
  assert.equal(normalizeText('x'.repeat(41), 40), null);
});
