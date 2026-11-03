// Äpi loogika. Kava ise on failis kava.js (muutuja KAVA).

const KUUD = ['jaan', 'veebr', 'märts', 'apr', 'mai', 'juuni', 'juuli', 'aug', 'sept', 'okt', 'nov', 'dets'];

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

// Ohutu tekst HTML-i sisse panemiseks
function puhasta(tekst) {
  return String(tekst)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function naitaAvalehte() {
  const esmaspaev = nadalaAlgus(new Date());
  const tehtud = 0; // tuleb hiljem salvestatud trennidest

  const kaardid = KAVA.map((trenn) => {
    const harjutused = trenn.harjutused
      .map((h) => h.variandid[0].nimi)
      .join(', ');
    return `
      <button class="kaart" data-trenn="${trenn.id}">
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

naitaAvalehte();
