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

function naitaAvalehte() {
  const esmaspaev = nadalaAlgus(new Date());
  const pyhapaev = new Date(esmaspaev);
  pyhapaev.setDate(pyhapaev.getDate() + 6);
  const algus = kuupaevTekstina(esmaspaev);
  const lopp = kuupaevTekstina(pyhapaev);

  // Iga trenni kohta: selle nädala viimane salvestatud kord (või undefined)
  const selNadalal = {};
  for (const t of trennid) {
    if (t.kuupaev >= algus && t.kuupaev <= lopp) {
      const eelmine = selNadalal[t.trennId];
      if (!eelmine || t.kuupaev > eelmine.kuupaev) selNadalal[t.trennId] = t;
    }
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
      olek = `<span class="olek olek-tehtud">✓ ${lyhikeKuupaev(tehtudKord.kuupaev)}</span>`;
    }

    return `
      <button class="kaart ${tehtudKord ? 'kaart-tehtud' : ''}" data-tegevus="ava-trenn" data-trenn="${trenn.id}">
        <span class="kaart-ylarida">
          <span class="kaart-pealkiri">${puhasta(trenn.nimi)} – ${puhasta(trenn.teema)}</span>
          ${olek}
        </span>
        <span class="kaart-harjutused">${puhasta(harjutused)}</span>
      </button>`;
  }).join('');

  document.getElementById('sisu').innerHTML = `
    <header class="paeis">
      <h1>See nädal</h1>
      <p class="nadal">${nadalaVahemik(esmaspaev)}</p>
    </header>
    <p class="tehtud-kokku">Sel nädalal tehtud: ${tehtud}/${KAVA.length}</p>
    <div class="kaardid">${kaardid}</div>`;
}

// ---------- Eelmine kord ----------

// Viimane salvestatud kord, kus seda varianti tehti: { kuupaev, seeriad } või null
function viimaneKord(variantId) {
  let parim = null;
  for (const t of trennid) {
    const h = t.harjutused.find((x) => x.variant === variantId);
    if (!h) continue;
    // Hilisem kuupäev võidab; sama päeva puhul hiljem salvestatud
    if (!parim || t.kuupaev > parim.kuupaev || (t.kuupaev === parim.kuupaev && t.id > parim.id)) {
      parim = { id: t.id, kuupaev: t.kuupaev, seeriad: h.seeriad };
    }
  }
  return parim;
}

// Harjutuse viimati tehtud variant (mis tahes trennist) või esimene variant
function viimatiTehtudVariant(harjutus) {
  let parim = null;
  for (const v of harjutus.variandid) {
    const kord = viimaneKord(v.id);
    if (kord && (!parim || kord.kuupaev > parim.kord.kuupaev ||
        (kord.kuupaev === parim.kord.kuupaev && kord.id > parim.kord.id))) {
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
    harjutused: trenn.harjutused.map((h) => {
      const variant = viimatiTehtudVariant(h);
      return { variant, seeriad: seeriadEelmisest(h, variant) };
    }),
  };
}

// Kas pooleli trennis on midagi tehtud? (Eeltäidetud numbrid ei loe.)
function onSisestatud(t) {
  return t.soojendus.trim() !== '' ||
    t.harjutused.some((h) => h.seeriad.some((s) => s.tehtud));
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

  const seeriad = sisestus.seeriad
    .map((s, si) => seeriaRida(hi, si, s, variant))
    .join('');

  return `
    <section class="harjutus">
      <h2>${puhasta(variant.nimi)}${harjutus.valikuline ? ' <span class="silt">valikuline</span>' : ''}</h2>
      <p class="kava-tekst">${kavaTekst(harjutus, variant)}</p>
      ${variandid}
      ${eelmine}
      <div class="seeriad">${seeriaPais(variant)}${seeriad}</div>
      <div class="nupu-rida">
        <button class="nupp" data-tegevus="eemalda-seeria" data-h="${hi}"
          ${sisestus.seeriad.length <= 1 ? 'disabled' : ''}>− Seeria</button>
        <button class="nupp" data-tegevus="lisa-seeria" data-h="${hi}">+ Seeria</button>
      </div>
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

    ${trenn.harjutused.map(harjutuseKaart).join('')}

    <div class="trenni-lopp">
      <button class="nupp nupp-pea" data-tegevus="salvesta">Salvesta trenn</button>
      <button class="nupp nupp-ohtlik" data-tegevus="tyhista">Tühista trenn</button>
    </div>`;
}

// Teeb pooleli trennist salvestatava kirje: ainult ✓-ga seeriad, numbrid arvudeks.
// Harjutused, kus ühtki seeriat ei tehtud (nt vahele jäetud valikulised), jäävad välja.
function valmisTrenn(t) {
  const harjutused = t.harjutused
    .map((h) => ({
      variant: h.variant,
      seeriad: h.seeriad
        .filter((s) => s.tehtud)
        .map((s) => ({ raskus: arvuks(s.raskus), kordused: arvuks(s.kordused) }))
        .filter((s) => s.raskus !== null || s.kordused !== null),
    }))
    .filter((h) => h.seeriad.length > 0);

  return {
    id: String(Date.now()),
    trennId: t.trennId,
    kuupaev: t.kuupaev || tana(),
    soojendus: t.soojendus.trim(),
    harjutused,
  };
}

function salvestaTrenn() {
  const kirje = valmisTrenn(pooleli);
  if (kirje.kuupaev > tana()) {
    alert('Trenni kuupäev ei saa olla tulevikus.');
    return;
  }
  if (kirje.harjutused.length === 0) {
    alert('Märgi enne salvestamist vähemalt üks seeria ✓-ga tehtuks.');
    return;
  }
  trennid.push(kirje);
  kirjuta(VOTI_TRENNID, trennid);
  pooleli = null;
  salvestaPooleli();
  location.hash = '';
}

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
      break;
    }
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
  if (el.dataset.lahter) {
    pooleli.harjutused[el.dataset.h].seeriad[el.dataset.s][el.dataset.lahter] = el.value;
  }
  salvestaPooleli();
});

window.addEventListener('hashchange', naitaVaadet);
naitaVaadet();
