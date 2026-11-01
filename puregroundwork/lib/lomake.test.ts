import test from 'node:test';
import assert from 'node:assert/strict';
import { tarkistaYhteydenotto } from './lomake.ts';

test('kelvollinen yhteydenotto siistitään', () => {
  const r = tarkistaYhteydenotto({ nimi: '  Anna   Asiakas ', email: 'Anna@Yritys.FI', yritys: 'Yritys Oy', viesti: 'Hei!\nSivut ovat hitaat.' });
  assert.equal(r.ok, true);
  if (r.ok) {
    assert.equal(r.data.nimi, 'Anna Asiakas');
    assert.equal(r.data.email, 'anna@yritys.fi');
    assert.equal(r.data.viesti, 'Hei!\nSivut ovat hitaat.');
    assert.equal(r.data.sivusto, '');
  }
});

test('nimi ja sähköposti ovat pakollisia', () => {
  assert.deepEqual(tarkistaYhteydenotto({ email: 'a@b.fi' }), { ok: false, virhe: 'nimi' });
  assert.deepEqual(tarkistaYhteydenotto({ nimi: 'A', email: 'ei-osoite' }), { ok: false, virhe: 'email' });
});

test('pitkät kentät katkaistaan', () => {
  const r = tarkistaYhteydenotto({ nimi: 'x'.repeat(500), email: 'a@b.fi', viesti: 'y'.repeat(5000) });
  assert.equal(r.ok && r.data.nimi.length, 120);
  assert.equal(r.ok && r.data.viesti.length, 3000);
});
