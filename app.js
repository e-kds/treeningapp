// Äpi loogika. Kava ise on failis kava.js (muutuja KAVA).

const KUUD = ['jaan', 'veebr', 'märts', 'apr', 'mai', 'juuni', 'juuli', 'aug', 'sept', 'okt', 'nov', 'dets'];

// Millised lahtrid on seeria juures, olenevalt variandi tüübist (vt kava.js).
// "kordused" lahtris on plangu puhul sekundid.
const LAHTRID = {
  raskus: { raskus: 'kg', kordused: 'korda' },
  lisaraskus: { raskus: 'lisa kg', kordused: 'korda' },
  abi: { raskus: 'abi kg', kordused: 'korda' },
  kordused: { kordused: 'korda' },
  aeg: { kordused: 'sek' },
};

// Praegu avatud trenn. Hiljem salvestatakse see ka telefoni mällu.
let pooleli = null;

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

// Tänane kuupäev kujul "2026-11-04" (nii tahab kuupäevalahter)
function tana() {
  const d = new Date();
  const kk = String(d.getMonth() + 1).padStart(2, '0');
  const pp = String(d.getDate()).padStart(2, '0');
  return `${d.getFullYear()}-${kk}-${pp}`;
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
  const tehtud = 0; // tuleb hiljem salvestatud trennidest

  const kaardid = KAVA.map((trenn) => {
    const harjutused = trenn.harjutused
      .map((h) => h.variandid[0].nimi)
      .join(', ');
    return `
      <button class="kaart" data-tegevus="ava-trenn" data-trenn="${trenn.id}">
        <span class="kaart-pealkiri">${puhasta(trenn.nimi)} – ${puhasta(trenn.teema)}</span>
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

// ---------- Trenni sisestamine ----------

// Uus tühi trenn: iga harjutuse juures esimene variant ja suurim seeriate arv
function uusTrenn(trenn) {
  return {
    trennId: trenn.id,
    kuupaev: tana(),
    soojendus: '',
    harjutused: trenn.harjutused.map((h) => ({
      variant: h.variandid[0].id,
      seeriad: Array.from({ length: h.seeriad[1] }, () => ({ raskus: '', kordused: '' })),
    })),
  };
}

function seeriaRida(hi, si, seeria, variant) {
  const lahtrid = LAHTRID[variant.tyyp];
  const lahter = (nimi) => `
    <label class="lahter">
      <input type="text" inputmode="${nimi === 'raskus' ? 'decimal' : 'numeric'}"
        data-h="${hi}" data-s="${si}" data-lahter="${nimi}"
        value="${puhasta(seeria[nimi])}" autocomplete="off">
      <span>${lahtrid[nimi]}</span>
    </label>`;

  const osad = [];
  if (lahtrid.raskus) osad.push(lahter('raskus'), '<span class="korda-mark">×</span>');
  osad.push(lahter('kordused'));

  return `
    <div class="seeria ${lahtrid.raskus ? '' : 'seeria-yks'}">
      <span class="seeria-nr">${si + 1}</span>
      ${osad.join('')}
    </div>`;
}

function harjutuseKaart(harjutus, hi) {
  const sisestus = pooleli.harjutused[hi];
  const variant = harjutus.variandid.find((v) => v.id === sisestus.variant);

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
      <div class="seeriad">${seeriad}</div>
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
      <input type="date" id="kuupaev" value="${pooleli.kuupaev}">
    </label>

    <label class="valja">
      <span>Soojendus</span>
      <textarea id="soojendus" rows="2" placeholder="Mida soojenduseks tegid?">${puhasta(pooleli.soojendus)}</textarea>
    </label>

    ${trenn.harjutused.map(harjutuseKaart).join('')}`;
}

// ---------- Mis vaade on lahti ----------

// Aadressi lõpp (#trenn1) ütleb, mis vaade on lahti. Nii töötab ka Safari „tagasi" žest.
function naitaVaadet() {
  const trenn = leiaTrenn(location.hash.slice(1));
  if (trenn) {
    naitaTrenni(trenn);
  } else {
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
    case 'variant':
      pooleli.harjutused[hi].variant = nupp.dataset.variant;
      break;
    case 'lisa-seeria': {
      const seeriad = pooleli.harjutused[hi].seeriad;
      // Uus seeria saab eelmise seeria väärtused, et oleks vähem trükkimist
      seeriad.push({ ...seeriad[seeriad.length - 1] });
      break;
    }
    case 'eemalda-seeria':
      pooleli.harjutused[hi].seeriad.pop();
      break;
  }

  // Joonista trenn uuesti, aga jäta kerimise koht samaks
  const y = window.scrollY;
  naitaTrenni(leiaTrenn(pooleli.trennId));
  window.scrollTo(0, y);
});

sisu.addEventListener('input', (e) => {
  const el = e.target;
  if (el.id === 'kuupaev') pooleli.kuupaev = el.value;
  if (el.id === 'soojendus') pooleli.soojendus = el.value;
  if (el.dataset.lahter) {
    pooleli.harjutused[el.dataset.h].seeriad[el.dataset.s][el.dataset.lahter] = el.value;
  }
});

window.addEventListener('hashchange', naitaVaadet);
naitaVaadet();
