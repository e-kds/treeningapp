// Äpi loogika. Kava ise on failis kava.js (muutuja KAVA).

const KUUD = ['jaan', 'veebr', 'märts', 'apr', 'mai', 'juuni', 'juuli', 'aug', 'sept', 'okt', 'nov', 'dets'];
const NADALAPAEVAD = ['P', 'E', 'T', 'K', 'N', 'R', 'L']; // Date.getDay(): pühapäev = 0

// Millised lahtrid on seeria juures, olenevalt variandi tüübist (vt kava.js).
// "kordused" lahtris on plangu puhul sekundid.
const LAHTRID = {
  raskus: { raskus: 'kg', kordused: 'korda' },
  lisaraskus: { raskus: 'lisa kg', kordused: 'korda' },
  abi: { raskus: 'abi kg', kordused: 'korda' },
  kordused: { kordused: 'korda' },
  aeg: { kordused: 'sek' },
};

// ---------- Telefoni mälu (localStorage) ----------

const VOTI_TRENNID = 'treeningapp.trennid';
const VOTI_POOLELI = 'treeningapp.pooleli';
const VOTI_VARUKOOPIA = 'treeningapp.varukoopia'; // viimase varukoopia kuupäev

function loe(voti, vaikimisi) {
  try {
    const tekst = localStorage.getItem(voti);
    return tekst ? JSON.parse(tekst) : vaikimisi;
  } catch {
    return vaikimisi;
  }
}

function kirjuta(voti, vaartus) {
  try {
    if (vaartus === null) {
      localStorage.removeItem(voti);
    } else {
      localStorage.setItem(voti, JSON.stringify(vaartus));
    }
  } catch {
    alert('Salvestamine ebaõnnestus: telefoni mälu pole kättesaadav.');
  }
}

// Kõik salvestatud trennid
let trennid = loe(VOTI_TRENNID, []);

// Praegu pooleli olev trenn (või null). Salvestub iga muudatusega, et see ei kaoks.
let pooleli = loe(VOTI_POOLELI, null);

function salvestaPooleli() {
  kirjuta(VOTI_POOLELI, pooleli);
}

// ---------- Abifunktsioonid ----------

// Tagastab selle nädala esmaspäeva (kell 00:00).
function nadalaAlgus(kuupaev) {
  const paev = new Date(kuupaev.getFullYear(), kuupaev.getMonth(), kuupaev.getDate());
  const nihe = (paev.getDay() + 6) % 7; // esmaspäev = 0, pühapäev = 6
  paev.setDate(paev.getDate() - nihe);
  return paev;
}

// Nt "2.–8. nov" või "30. nov – 6. dets"
function nadalaVahemik(esmaspaev) {
  const pyhapaev = new Date(esmaspaev);
  pyhapaev.setDate(pyhapaev.getDate() + 6);
  if (esmaspaev.getMonth() === pyhapaev.getMonth()) {
    return `${esmaspaev.getDate()}.–${pyhapaev.getDate()}. ${KUUD[pyhapaev.getMonth()]}`;
  }
  return `${esmaspaev.getDate()}. ${KUUD[esmaspaev.getMonth()]} – ${pyhapaev.getDate()}. ${KUUD[pyhapaev.getMonth()]}`;
}

// Kuupäev kujul "2026-11-04" (nii tahab kuupäevalahter ja nii on seda lihtne võrrelda)
function kuupaevTekstina(d) {
  const kk = String(d.getMonth() + 1).padStart(2, '0');
  const pp = String(d.getDate()).padStart(2, '0');
  return `${d.getFullYear()}-${kk}-${pp}`;
}

function tana() {
  return kuupaevTekstina(new Date());
}

// "2026-11-04" -> "K, 4. nov"
function lyhikeKuupaev(tekst) {
  const [a, k, p] = tekst.split('-').map(Number);
  const d = new Date(a, k - 1, p);
  return `${NADALAPAEVAD[d.getDay()]}, ${p}. ${KUUD[k - 1]}`;
}

// "22,5" -> 22.5; tühi või vigane -> null
function arvuks(tekst) {
  const arv = parseFloat(String(tekst).replace(',', '.'));
  return Number.isFinite(arv) ? arv : null;
}

// 22.5 -> "22,5"; null -> ""
function arvTekstiks(arv) {
  return arv === null || arv === undefined ? '' : String(arv).replace('.', ',');
}

// Ohutu tekst HTML-i sisse panemiseks
function puhasta(tekst) {
  return String(tekst)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function leiaTrenn(id) {
  return KAVA.find((t) => t.id === id);
}

// Nt "3 × 5–8" või "2–3 × 8 kummalegi poole"
function kavaTekst(harjutus, variant) {
  const vahemik = ([a, b]) => (a === b ? `${a}` : `${a}–${b}`);
  let tekst = `${vahemik(harjutus.seeriad)} seeriat`;
  if (harjutus.kordused) {
    tekst += ` × ${vahemik(harjutus.kordused)}`;
    if (variant.tyyp === 'aeg') tekst += ' sek';
  }
  if (variant.kummalegi) tekst += ' kummalegi poole';
  return tekst;
}

// ---------- Avaleht ----------

// Selle nädala esmaspäev ja pühapäev, nt { algus: "2026-11-02", lopp: "2026-11-08" }
function nadalaPiirid() {
  const esmaspaev = nadalaAlgus(new Date());
  const pyhapaev = new Date(esmaspaev);
  pyhapaev.setDate(pyhapaev.getDate() + 6);
  return { esmaspaev, algus: kuupaevTekstina(esmaspaev), lopp: kuupaevTekstina(pyhapaev) };
}

// Selle trenni sel nädalal tehtud korrad, millel on linnuke.
// (linnuke: false tähendab, et linnuke on käsitsi eemaldatud, aga trenn jääb ajalukku.)
function selleNadalaKorrad(trennId) {
  const { algus, lopp } = nadalaPiirid();
  return trennid.filter((t) => t.trennId === trennId &&
    t.kuupaev >= algus && t.kuupaev <= lopp && t.linnuke !== false);
}

function vahetaLinnukest(trennId) {
  const korrad = selleNadalaKorrad(trennId);

  if (korrad.length === 0) {
    // Käsitsi pandud linnuke: ilma harjutusteta kirje tänase kuupäevaga
    trennid.push({ id: String(Date.now()), trennId, kuupaev: tana(), kasitsi: true, soojendus: '', harjutused: [] });
  } else {
    const paris = korrad.some((t) => !t.kasitsi);
    if (paris && !confirm('Kas eemaldad linnukese? Salvestatud trenn jääb ajalukku alles.')) return;
    // Käsitsi pandud linnukestes pole andmeid, need võib kustutada. Päris trennid jäävad alles.
    trennid = trennid.filter((t) => !(korrad.includes(t) && t.kasitsi));
    for (const t of korrad) t.linnuke = false;
  }

  kirjuta(VOTI_TRENNID, trennid);
  naitaAvalehte();
}

function naitaAvalehte() {
  const { esmaspaev } = nadalaPiirid();

  // Iga trenni kohta: selle nädala viimane kord (või undefined)
  const selNadalal = {};
  for (const trenn of KAVA) {
    const korrad = selleNadalaKorrad(trenn.id).sort((a, b) => a.kuupaev.localeCompare(b.kuupaev));
    selNadalal[trenn.id] = korrad[korrad.length - 1];
  }
  const tehtud = KAVA.filter((trenn) => selNadalal[trenn.id]).length;

  const kaardid = KAVA.map((trenn) => {
    const tehtudKord = selNadalal[trenn.id];
    const harjutused = trenn.harjutused
      .map((h) => h.variandid[0].nimi)
      .join(', ');

    let olek = '';
    if (pooleli && pooleli.trennId === trenn.id) {
      olek = '<span class="olek olek-pooleli">Pooleli</span>';
    } else if (tehtudKord) {
      olek = `<span class="olek olek-tehtud">${lyhikeKuupaev(tehtudKord.kuupaev)}</span>`;
    }

    return `
      <div class="kaart ${tehtudKord ? 'kaart-tehtud' : ''}">
        <button class="kaart-ava" data-tegevus="ava-trenn" data-trenn="${trenn.id}">
          <span class="kaart-ylarida">
            <span class="kaart-pealkiri">${puhasta(trenn.nimi)} – ${puhasta(trenn.teema)}</span>
            ${olek}
          </span>
          <span class="kaart-harjutused">${puhasta(harjutused)}</span>
        </button>
        <button class="kaart-linnuke" data-tegevus="linnuke" data-trenn="${trenn.id}"
          aria-label="${puhasta(trenn.nimi)} tehtud" aria-pressed="${Boolean(tehtudKord)}">✓</button>
      </div>`;
  }).join('');

  document.getElementById('sisu').innerHTML = `
    <header class="paeis">
      <h1>See nädal</h1>
      <p class="nadal">${nadalaVahemik(esmaspaev)}</p>
    </header>
    <p class="tehtud-kokku">Sel nädalal tehtud: ${tehtud}/${KAVA.length}</p>
    <div class="kaardid">${kaardid}</div>
    ${varukoopiaJaotis()}`;
}

// ---------- Varukoopia ----------

function varukoopiaJaotis() {
  const viimane = loe(VOTI_VARUKOOPIA, null);
  let info;
  if (!viimane) {
    info = '<p class="varukoopia-info hoiatus">Varukoopiat pole veel tehtud. Andmed on ainult selles telefonis.</p>';
  } else {
    const paevi = Math.round((new Date(tana()) - new Date(viimane)) / 86400000);
    const klass = paevi > 14 ? 'hoiatus' : '';
    info = `<p class="varukoopia-info ${klass}">Viimane varukoopia: ${lyhikeKuupaev(viimane)}</p>`;
  }

  return `
    <section class="varukoopia">
      <h2>Varukoopia</h2>
      ${info}
      <div class="nupu-rida">
        <button class="nupp" data-tegevus="ekspordi">Salvesta varukoopia</button>
        <button class="nupp" data-tegevus="impordi">Taasta</button>
      </div>
      <input type="file" id="varukoopia-fail" hidden>
    </section>`;
}

// Kõik andmed ühte faili. iPhone'is avaneb jagamismenüü („Salvesta failidesse" jne),
// arvutis laaditakse fail alla.
async function ekspordi() {
  const andmed = {
    rakendus: 'treeningapp',
    versioon: 1,
    eksporditud: new Date().toISOString(),
    trennid,
    pooleli,
  };
  const nimi = `treeningpaevik-${tana()}.json`;
  const fail = new File([JSON.stringify(andmed, null, 2)], nimi, { type: 'application/json' });

  try {
    if (navigator.canShare && navigator.canShare({ files: [fail] })) {
      await navigator.share({ files: [fail] });
    } else {
      const link = document.createElement('a');
      link.href = URL.createObjectURL(fail);
      link.download = nimi;
      link.click();
      setTimeout(() => URL.revokeObjectURL(link.href), 10000);
    }
  } catch (e) {
    if (e.name === 'AbortError') return; // jagamismenüü suleti
    alert(`Varukoopia tegemine ebaõnnestus: ${e.message}`);
    return;
  }

  kirjuta(VOTI_VARUKOOPIA, tana());
  naitaAvalehte();
}

// Loeb varukoopia failist ja asendab praegused andmed
async function impordi(fail) {
  let andmed;
  try {
    andmed = JSON.parse(await fail.text());
  } catch {
    andmed = null;
  }
  if (!andmed || andmed.rakendus !== 'treeningapp' || !Array.isArray(andmed.trennid)) {
    alert('See fail ei ole treeningpäeviku varukoopia.');
    return;
  }

  const millal = lyhikeKuupaev(kuupaevTekstina(new Date(andmed.eksporditud)));
  const kysimus = `Varukoopia on tehtud ${millal}.\n\n` +
    `Trenne varukoopias: ${andmed.trennid.length}\n` +
    `Trenne praegu telefonis: ${trennid.length}\n\n` +
    'Taastamine asendab praegused andmed. Kas jätkad?';
  if (!confirm(kysimus)) return;

  trennid = andmed.trennid;
  pooleli = andmed.pooleli || null;
  kirjuta(VOTI_TRENNID, trennid);
  salvestaPooleli();
  alert('Andmed on taastatud.');
  naitaAvalehte();
}

// ---------- Eelmine kord ----------

// Kas kirje a on hilisem kui b? Hilisem kuupäev võidab; sama päeva puhul hiljem salvestatud.
function onHilisem(a, b) {
  return !b || a.kuupaev > b.kuupaev || (a.kuupaev === b.kuupaev && a.id > b.id);
}

// Viimane salvestatud kord, kus seda varianti tehti: { kuupaev, seeriad } või null
function viimaneKord(variantId) {
  let parim = null;
  for (const t of trennid) {
    const h = t.harjutused.find((x) => x.variant === variantId && x.seeriad.length > 0);
    if (h && onHilisem(t, parim)) {
      parim = { id: t.id, kuupaev: t.kuupaev, seeriad: h.seeriad };
    }
  }
  return parim;
}

// Viimane märkus selle variandi kohta: { kuupaev, markus } või null
function viimaneMarkus(variantId) {
  let parim = null;
  for (const t of trennid) {
    const h = t.harjutused.find((x) => x.variant === variantId && x.markus);
    if (h && onHilisem(t, parim)) {
      parim = { id: t.id, kuupaev: t.kuupaev, markus: h.markus };
    }
  }
  return parim;
}

// Harjutuse viimati tehtud variant (mis tahes trennist) või esimene variant
function viimatiTehtudVariant(harjutus) {
  let parim = null;
  for (const v of harjutus.variandid) {
    const kord = viimaneKord(v.id);
    if (kord && (!parim || onHilisem(kord, parim.kord))) {
      parim = { id: v.id, kord };
    }
  }
  return parim ? parim.id : harjutus.variandid[0].id;
}

// Üks seeria lühidalt, nt "60×8", "+10×8", "abi 20×8", "12" või "45 s"
function seeriaTekst(s, tyyp) {
  const kordused = arvTekstiks(s.kordused) || '?';
  if (tyyp === 'aeg') return `${kordused} s`;
  if (tyyp === 'kordused') return kordused;
  const kg = arvTekstiks(s.raskus);
  if (kg === '') return `${kordused} korda`;
  const raskus = tyyp === 'lisaraskus' ? `+${kg}` : tyyp === 'abi' ? `abi ${kg}` : kg;
  return s.kordused === null ? `${raskus} kg` : `${raskus}×${kordused}`;
}

// Seeriad eelmise korra väärtustega (või tühjad, kui varianti pole veel tehtud)
function seeriadEelmisest(harjutus, variantId) {
  const kord = viimaneKord(variantId);
  if (!kord) {
    return Array.from({ length: harjutus.seeriad[1] }, () => ({ raskus: '', kordused: '', tehtud: false }));
  }
  return kord.seeriad.map((s) => ({
    raskus: arvTekstiks(s.raskus),
    kordused: arvTekstiks(s.kordused),
    tehtud: false,
  }));
}

// ---------- Trenni sisestamine ----------

// Uus trenn: iga harjutuse juures viimati tehtud variant ja selle eelmise korra seeriad
function uusTrenn(trenn) {
  return {
    trennId: trenn.id,
    kuupaev: tana(),
    soojendus: '',
    enesetunne: null, // 1–5
    tunne: '',        // „Kuidas ennast tundsin"
    harjutused: trenn.harjutused.map((h) => {
      const variant = viimatiTehtudVariant(h);
      return { variant, seeriad: seeriadEelmisest(h, variant), markus: '' };
    }),
  };
}

// Kas pooleli trennis on midagi tehtud? (Eeltäidetud numbrid ei loe.)
function onSisestatud(t) {
  return t.soojendus.trim() !== '' || (t.tunne || '').trim() !== '' || Boolean(t.enesetunne) ||
    t.harjutused.some((h) => (h.markus || '').trim() !== '' || h.seeriad.some((s) => s.tehtud));
}

const ENESETUNDED = [
  { hinne: 1, emo: '😫', nimi: 'Väga halb' },
  { hinne: 2, emo: '😕', nimi: 'Halb' },
  { hinne: 3, emo: '😐', nimi: 'Keskmine' },
  { hinne: 4, emo: '🙂', nimi: 'Hea' },
  { hinne: 5, emo: '💪', nimi: 'Väga hea' },
];

function enesetundeKaart() {
  const nupud = ENESETUNDED.map((e) => `
    <button class="tunne-nupp ${pooleli.enesetunne === e.hinne ? 'valitud' : ''}"
      data-tegevus="enesetunne" data-hinne="${e.hinne}"
      aria-label="${e.nimi}" aria-pressed="${pooleli.enesetunne === e.hinne}">
      <span class="tunne-emo">${e.emo}</span><span>${e.hinne}</span>
    </button>`).join('');

  return `
    <section class="harjutus">
      <h2>Kuidas ennast tundsin</h2>
      <div class="tunne-nupud">${nupud}</div>
      <textarea id="tunne" rows="2" aria-label="Kuidas ennast tundsin"
        placeholder="Energia, uni, valud, meeleolu…">${puhasta(pooleli.tunne || '')}</textarea>
    </section>`;
}

function seeriaRida(hi, si, seeria, variant) {
  const lahtrid = LAHTRID[variant.tyyp];
  const lahter = (nimi) => `
    <input type="text" inputmode="${nimi === 'raskus' ? 'decimal' : 'numeric'}"
      data-h="${hi}" data-s="${si}" data-lahter="${nimi}" aria-label="${lahtrid[nimi]}"
      value="${puhasta(seeria[nimi])}" autocomplete="off">`;

  const osad = [];
  if (lahtrid.raskus) osad.push(lahter('raskus'), '<span class="korda-mark">×</span>');
  osad.push(lahter('kordused'));

  return `
    <div class="seeria ${lahtrid.raskus ? '' : 'seeria-yks'} ${seeria.tehtud ? 'seeria-tehtud' : ''}">
      <span class="seeria-nr">${si + 1}</span>
      ${osad.join('')}
      <button class="linnuke" data-tegevus="tehtud" data-h="${hi}" data-s="${si}"
        aria-label="Seeria ${si + 1} tehtud" aria-pressed="${seeria.tehtud}">✓</button>
    </div>`;
}

// Ühikud seeriate kohal, nt "kg  ×  korda"
function seeriaPais(variant) {
  const lahtrid = LAHTRID[variant.tyyp];
  if (!lahtrid.raskus) {
    return `<div class="seeria seeria-yks seeria-pais"><span></span><span>${lahtrid.kordused}</span><span></span></div>`;
  }
  return `
    <div class="seeria seeria-pais">
      <span></span><span>${lahtrid.raskus}</span><span></span><span>${lahtrid.kordused}</span><span></span>
    </div>`;
}

function harjutuseKaart(harjutus, hi) {
  const sisestus = pooleli.harjutused[hi];
  const variant = harjutus.variandid.find((v) => v.id === sisestus.variant);

  const kord = viimaneKord(variant.id);
  const eelmine = kord
    ? `<p class="eelmine">Eelmine kord (${lyhikeKuupaev(kord.kuupaev)}):
        <strong>${kord.seeriad.map((s) => seeriaTekst(s, variant.tyyp)).join(', ')}</strong></p>`
    : '';

  const variandid = harjutus.variandid.length > 1
    ? `<div class="variandid">${harjutus.variandid.map((v) => `
        <button class="variant ${v.id === variant.id ? 'valitud' : ''}"
          data-tegevus="variant" data-h="${hi}" data-variant="${v.id}">${puhasta(v.nimi)}</button>`).join('')}
      </div>`
    : '';

  const vanaMarkus = viimaneMarkus(variant.id);
  const eelmineMarkus = vanaMarkus
    ? `<p class="eelmine">Eelmine märkus (${lyhikeKuupaev(vanaMarkus.kuupaev)}):
        <em>${puhasta(vanaMarkus.markus)}</em></p>`
    : '';

  const seeriad = sisestus.seeriad
    .map((s, si) => seeriaRida(hi, si, s, variant))
    .join('');

  return `
    <section class="harjutus">
      <h2>${puhasta(variant.nimi)}${harjutus.valikuline ? ' <span class="silt">valikuline</span>' : ''}</h2>
      <p class="kava-tekst">${kavaTekst(harjutus, variant)}</p>
      ${variandid}
      ${eelmine}
      ${eelmineMarkus}
      <div class="seeriad">${seeriaPais(variant)}${seeriad}</div>
      <div class="nupu-rida">
        <button class="nupp" data-tegevus="eemalda-seeria" data-h="${hi}"
          ${sisestus.seeriad.length <= 1 ? 'disabled' : ''}>− Seeria</button>
        <button class="nupp" data-tegevus="lisa-seeria" data-h="${hi}">+ Seeria</button>
      </div>
      <textarea class="markus" rows="1" data-markus="${hi}" aria-label="Märkus"
        placeholder="Märkus (nt istme kõrgus, tehnika)">${puhasta(sisestus.markus || '')}</textarea>
    </section>`;
}

function naitaTrenni(trenn) {
  if (!pooleli || pooleli.trennId !== trenn.id) {
    pooleli = uusTrenn(trenn);
  }

  document.getElementById('sisu').innerHTML = `
    <header class="trenni-paeis">
      <button class="tagasi" data-tegevus="tagasi" aria-label="Tagasi avalehele">‹ Tagasi</button>
      <h1>${puhasta(trenn.nimi)} – ${puhasta(trenn.teema)}</h1>
    </header>

    <label class="valja">
      <span>Kuupäev</span>
      <input type="date" id="kuupaev" value="${pooleli.kuupaev}" max="${tana()}">
    </label>

    <label class="valja">
      <span>Soojendus</span>
      <textarea id="soojendus" rows="2" placeholder="Mida soojenduseks tegid?">${puhasta(pooleli.soojendus)}</textarea>
    </label>

    <div class="valja">
      <span>Puhkeaeg seeriate vahel</span>
      <div class="puhkeaeg-rida">
        <button class="nupp" data-tegevus="puhkeaeg" data-muutus="-15">−15 s</button>
        <strong id="puhkeaeg">${aegTekstina(puhkeaeg)}</strong>
        <button class="nupp" data-tegevus="puhkeaeg" data-muutus="15">+15 s</button>
      </div>
    </div>

    ${trenn.harjutused.map(harjutuseKaart).join('')}

    ${enesetundeKaart()}

    <div class="trenni-lopp">
      <button class="nupp nupp-pea" data-tegevus="salvesta">Salvesta trenn</button>
      <button class="nupp nupp-ohtlik" data-tegevus="tyhista">Tühista trenn</button>
    </div>`;
}

// Teeb pooleli trennist salvestatava kirje: ainult ✓-ga seeriad, numbrid arvudeks.
// Harjutused, kus ühtki seeriat ei tehtud ega märkust kirjutatud
// (nt vahele jäetud valikulised), jäävad välja.
function valmisTrenn(t) {
  const harjutused = t.harjutused
    .map((h) => ({
      variant: h.variant,
      seeriad: h.seeriad
        .filter((s) => s.tehtud)
        .map((s) => ({ raskus: arvuks(s.raskus), kordused: arvuks(s.kordused) }))
        .filter((s) => s.raskus !== null || s.kordused !== null),
      markus: (h.markus || '').trim(),
    }))
    .filter((h) => h.seeriad.length > 0 || h.markus !== '');

  return {
    id: String(Date.now()),
    trennId: t.trennId,
    kuupaev: t.kuupaev || tana(),
    soojendus: t.soojendus.trim(),
    enesetunne: t.enesetunne || null,
    tunne: (t.tunne || '').trim(),
    harjutused,
  };
}

function salvestaTrenn() {
  const kirje = valmisTrenn(pooleli);
  if (kirje.kuupaev > tana()) {
    alert('Trenni kuupäev ei saa olla tulevikus.');
    return;
  }
  if (!kirje.harjutused.some((h) => h.seeriad.length > 0)) {
    alert('Märgi enne salvestamist vähemalt üks seeria ✓-ga tehtuks.');
    return;
  }
  trennid.push(kirje);
  kirjuta(VOTI_TRENNID, trennid);
  pooleli = null;
  salvestaPooleli();
  location.hash = '';
}

// ---------- Puhkeaja taimer ----------

const VOTI_TAIMER = 'treeningapp.taimer';     // käimasolev taimer: { lopp, labi }
const VOTI_PUHKEAEG = 'treeningapp.puhkeaeg'; // vaikimisi puhkeaeg sekundites

let puhkeaeg = loe(VOTI_PUHKEAEG, 120);
let taimer = loe(VOTI_TAIMER, null);
let taimeriKell = null; // setInterval, mis numbrit uuendab
let heli = null;        // AudioContext piiksu jaoks
let ekraaniLukk = null; // hoiab ekraani sees, kui telefon lubab

// 95 -> "1:35"
function aegTekstina(sek) {
  return `${Math.floor(sek / 60)}:${String(sek % 60).padStart(2, '0')}`;
}

// iPhone lubab heli ainult siis, kui see on käivitatud puudutusega.
// Seepärast valmistame heli ette juba ✓-nupu vajutamisel.
function valmistaHeli() {
  try {
    heli = heli || new (window.AudioContext || window.webkitAudioContext)();
    if (heli.state === 'suspended') heli.resume();
  } catch {
    heli = null;
  }
}

// Kolm lühikest piiksu
function piiks() {
  if (!heli) return;
  const t0 = heli.currentTime;
  for (let i = 0; i < 3; i++) {
    const algus = t0 + i * 0.4;
    const osc = heli.createOscillator();
    const vol = heli.createGain();
    osc.frequency.value = 880;
    osc.connect(vol);
    vol.connect(heli.destination);
    vol.gain.setValueAtTime(0.0001, algus);
    vol.gain.exponentialRampToValueAtTime(0.6, algus + 0.02);
    vol.gain.exponentialRampToValueAtTime(0.0001, algus + 0.3);
    osc.start(algus);
    osc.stop(algus + 0.32);
  }
}

async function hoiaEkraanSees(sees) {
  try {
    if (sees && !ekraaniLukk && navigator.wakeLock) {
      ekraaniLukk = await navigator.wakeLock.request('screen');
      ekraaniLukk.addEventListener('release', () => { ekraaniLukk = null; });
    } else if (!sees && ekraaniLukk) {
      await ekraaniLukk.release();
      ekraaniLukk = null;
    }
  } catch {
    ekraaniLukk = null;
  }
}

function kaivitaTaimer() {
  taimer = { lopp: Date.now() + puhkeaeg * 1000, labi: false };
  kirjuta(VOTI_TAIMER, taimer);
  naitaTaimerit();
}

function sulgeTaimer() {
  taimer = null;
  kirjuta(VOTI_TAIMER, null);
  naitaTaimerit();
}

// Taimeri riba ekraani allservas. Number uueneb 4 korda sekundis,
// aga nupud joonistatakse ainult korra, et vajutused kaotsi ei läheks.
function naitaTaimerit() {
  const riba = document.getElementById('taimer');
  clearInterval(taimeriKell);

  if (!taimer) {
    riba.hidden = true;
    document.body.classList.remove('taimer-lahti');
    hoiaEkraanSees(false);
    return;
  }

  riba.hidden = false;
  document.body.classList.add('taimer-lahti');

  const naitaLabi = () => {
    riba.className = 'taimer taimer-labi';
    riba.innerHTML = `
      <button class="taimer-labi-nupp" data-taimer="sulge">
        Puhkus läbi!<span>Puuduta sulgemiseks</span>
      </button>`;
  };

  if (taimer.labi) {
    naitaLabi();
    return;
  }

  riba.className = 'taimer';
  riba.innerHTML = `
    <div class="taimer-aeg-ala">
      <span class="taimer-silt">Puhkus</span>
      <span class="taimer-aeg" id="taimer-aeg"></span>
    </div>
    <div class="taimer-nupud">
      <button class="taimer-nupp" data-taimer="miinus" aria-label="15 sekundit vähem">−15</button>
      <button class="taimer-nupp" data-taimer="pluss" aria-label="15 sekundit juurde">+15</button>
      <button class="taimer-nupp" data-taimer="sulge">Stopp</button>
    </div>`;
  hoiaEkraanSees(true);

  const uuenda = () => {
    const jaanud = Math.ceil((taimer.lopp - Date.now()) / 1000);
    if (jaanud <= 0) {
      clearInterval(taimeriKell);
      taimer.labi = true;
      kirjuta(VOTI_TAIMER, taimer);
      piiks();
      hoiaEkraanSees(false);
      naitaLabi();
      return;
    }
    document.getElementById('taimer-aeg').textContent = aegTekstina(jaanud);
  };
  uuenda();
  taimeriKell = setInterval(uuenda, 250);
}

document.getElementById('taimer').addEventListener('click', (e) => {
  const nupp = e.target.closest('[data-taimer]');
  if (!nupp || !taimer) return;

  switch (nupp.dataset.taimer) {
    case 'miinus':
      taimer.lopp -= 15000;
      break;
    case 'pluss':
      valmistaHeli();
      taimer.lopp = Math.max(taimer.lopp, Date.now()) + 15000;
      break;
    case 'sulge':
      sulgeTaimer();
      return;
  }
  kirjuta(VOTI_TAIMER, taimer);
  naitaTaimerit();
});

// Kui äpp tuleb taustalt tagasi, palu uuesti ekraani sees hoida
document.addEventListener('visibilitychange', () => {
  if (document.visibilityState === 'visible' && taimer && !taimer.labi) hoiaEkraanSees(true);
});

// ---------- Mis vaade on lahti ----------

// Aadressi lõpp (#trenn1) ütleb, mis vaade on lahti. Nii töötab ka Safari „tagasi" žest.
function naitaVaadet() {
  const trenn = leiaTrenn(location.hash.slice(1));
  if (trenn) {
    // Teine trenn on pooleli: küsi enne, kui selle üle kirjutame
    if (pooleli && pooleli.trennId !== trenn.id && onSisestatud(pooleli)) {
      const nimi = leiaTrenn(pooleli.trennId).nimi;
      if (!confirm(`${nimi} on pooleli. Kui alustad uut trenni, kustuvad selle sisestused. Kas jätkad?`)) {
        location.hash = pooleli.trennId;
        return;
      }
    }
    naitaTrenni(trenn);
    salvestaPooleli();
  } else {
    // Tühja trenni pole mõtet „pooleli" märkida
    if (pooleli && !onSisestatud(pooleli)) {
      pooleli = null;
      salvestaPooleli();
    }
    naitaAvalehte();
  }
  window.scrollTo(0, 0);
}

// ---------- Nupuvajutused ja sisestused ----------

const sisu = document.getElementById('sisu');

sisu.addEventListener('click', (e) => {
  const nupp = e.target.closest('[data-tegevus]');
  if (!nupp) return;
  const hi = Number(nupp.dataset.h);

  switch (nupp.dataset.tegevus) {
    case 'ava-trenn':
      location.hash = nupp.dataset.trenn;
      return;
    case 'tagasi':
      location.hash = '';
      return;
    case 'linnuke':
      vahetaLinnukest(nupp.dataset.trenn);
      return;
    case 'ekspordi':
      ekspordi();
      return;
    case 'impordi':
      document.getElementById('varukoopia-fail').click();
      return;
    case 'salvesta':
      salvestaTrenn();
      return;
    case 'tyhista':
      if (confirm('Kas kustutad selle trenni sisestused?')) {
        pooleli = null;
        salvestaPooleli();
        location.hash = '';
      }
      return;
    case 'tehtud': {
      const seeria = pooleli.harjutused[hi].seeriad[Number(nupp.dataset.s)];
      seeria.tehtud = !seeria.tehtud;
      if (seeria.tehtud) {
        valmistaHeli();
        kaivitaTaimer();
      }
      break;
    }
    case 'enesetunne': {
      const hinne = Number(nupp.dataset.hinne);
      pooleli.enesetunne = pooleli.enesetunne === hinne ? null : hinne;
      break;
    }
    case 'puhkeaeg':
      puhkeaeg = Math.min(600, Math.max(30, puhkeaeg + Number(nupp.dataset.muutus)));
      kirjuta(VOTI_PUHKEAEG, puhkeaeg);
      document.getElementById('puhkeaeg').textContent = aegTekstina(puhkeaeg);
      return;
    case 'variant': {
      const sisestus = pooleli.harjutused[hi];
      sisestus.variant = nupp.dataset.variant;
      // Kui selles harjutuses pole veel midagi tehtud, too uue variandi eelmise korra numbrid
      if (!sisestus.seeriad.some((s) => s.tehtud)) {
        const harjutus = leiaTrenn(pooleli.trennId).harjutused[hi];
        sisestus.seeriad = seeriadEelmisest(harjutus, sisestus.variant);
      }
      break;
    }
    case 'lisa-seeria': {
      const seeriad = pooleli.harjutused[hi].seeriad;
      // Uus seeria saab eelmise seeria väärtused, et oleks vähem trükkimist
      seeriad.push({ ...seeriad[seeriad.length - 1], tehtud: false });
      break;
    }
    case 'eemalda-seeria':
      pooleli.harjutused[hi].seeriad.pop();
      break;
  }

  salvestaPooleli();

  // Joonista trenn uuesti, aga jäta kerimise koht samaks
  const y = window.scrollY;
  naitaTrenni(leiaTrenn(pooleli.trennId));
  window.scrollTo(0, y);
});

sisu.addEventListener('input', (e) => {
  if (!pooleli) return;
  const el = e.target;
  if (el.id === 'kuupaev') {
    // iPhone'i kalender ei pruugi max-piirangut arvestada, seega kontrollime ise
    if (el.value > tana()) {
      alert('Trenni kuupäev ei saa olla tulevikus.');
      el.value = tana();
    }
    pooleli.kuupaev = el.value;
  }
  if (el.id === 'soojendus') pooleli.soojendus = el.value;
  if (el.id === 'tunne') pooleli.tunne = el.value;
  if (el.dataset.markus) pooleli.harjutused[el.dataset.markus].markus = el.value;
  if (el.dataset.lahter) {
    pooleli.harjutused[el.dataset.h].seeriad[el.dataset.s][el.dataset.lahter] = el.value;
  }
  salvestaPooleli();
});

sisu.addEventListener('change', (e) => {
  if (e.target.id === 'varukoopia-fail' && e.target.files[0]) {
    impordi(e.target.files[0]);
    e.target.value = ''; // et sama faili saaks uuesti valida
  }
});

window.addEventListener('hashchange', naitaVaadet);
naitaVaadet();

// Taimer, mis oli äpi sulgemise ajal käimas. Kui see lõppes rohkem kui 5 min tagasi, unusta.
if (taimer && taimer.lopp < Date.now() - 5 * 60 * 1000) {
  sulgeTaimer();
} else {
  naitaTaimerit();
}
