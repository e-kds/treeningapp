// Treeningkava: kõik 4 trenni ja nende harjutused.
//
// Iga harjutuse juures:
//   seeriad     [vähim, suurim] seeriate arv
//   kordused    [vähim, suurim] korduste vahemik (plangul sekundid), null = vahemikku pole
//   valikuline  true, kui harjutuse võib vahele jätta
//   variandid   harjutuse variandid, millest trenni ajal valid ühe
//
// Iga variandi juures:
//   id         püsiv nimi, mille järgi äpp seeriad meelde jätab.
//              ÄRA MUUDA olemasolevat id-d, muidu kaob seos varasemate tulemustega.
//              Sama id kahes trennis (nt "biitseps") tähendab, et „eelmine kord" on ühine.
//   nimi       nimi, mida äpp näitab (seda võib vabalt muuta)
//   tyyp       "raskus"     kilogrammid ja kordused
//              "lisaraskus" lisaraskus kg (0 = keharaskus) ja kordused
//              "abi"        abi kg (väiksem on parem) ja kordused
//              "kordused"   ainult kordused
//              "aeg"        ainult sekundid
//   samm       kui palju kilogramme soovitus raskust muudab
//   kummalegi  true, kui kordused on kummalegi jalale/käele/poole

const KAVA = [
  {
    id: 'trenn1',
    nimi: 'Trenn 1',
    teema: 'Jalad',
    harjutused: [
      {
        seeriad: [3, 3], kordused: [5, 8],
        variandid: [
          { id: 'tagakykk', nimi: 'Tagakükk', tyyp: 'raskus', samm: 2.5 },
          { id: 'esikykk', nimi: 'Esikükk', tyyp: 'raskus', samm: 2.5 },
          { id: 'hack-squat', nimi: 'Hack squat', tyyp: 'raskus', samm: 5 },
        ],
      },
      {
        seeriad: [3, 3], kordused: [6, 8],
        variandid: [
          { id: 'rumeenia-jt', nimi: 'Rumeenia jõutõmme', tyyp: 'raskus', samm: 2.5 },
        ],
      },
      {
        seeriad: [2, 3], kordused: [8, 8],
        variandid: [
          { id: 'bulgaaria-kykk', nimi: 'Bulgaaria kükk', tyyp: 'raskus', samm: 2, kummalegi: true },
          { id: 'tagasiaste', nimi: 'Tagasiaste', tyyp: 'raskus', samm: 2, kummalegi: true },
        ],
      },
      {
        seeriad: [3, 3], kordused: [10, 15],
        variandid: [
          { id: 'saaretosted', nimi: 'Sääretõsted', tyyp: 'raskus', samm: 5 },
        ],
      },
    ],
  },
  {
    id: 'trenn2',
    nimi: 'Trenn 2',
    teema: 'Ülakeha',
    harjutused: [
      {
        seeriad: [3, 3], kordused: [6, 10],
        variandid: [
          { id: 'lamades-surumine', nimi: 'Lamades surumine', tyyp: 'raskus', samm: 2.5 },
          { id: 'hantli-surumine', nimi: 'Hantlitega surumine', tyyp: 'raskus', samm: 2 },
        ],
      },
      {
        seeriad: [3, 3], kordused: [6, 10],
        variandid: [
          { id: 'louatombed', nimi: 'Lõuatõmbed', tyyp: 'lisaraskus', samm: 2.5 },
          { id: 'abistatud-louatombed', nimi: 'Abistatud lõuatõmbed', tyyp: 'abi', samm: 5 },
          { id: 'allatomme', nimi: 'Plokil allatõmme', tyyp: 'raskus', samm: 5 },
        ],
      },
      {
        seeriad: [2, 3], kordused: [8, 12],
        variandid: [
          { id: 'plokil-soudmine', nimi: 'Istudes plokil sõudmine', tyyp: 'raskus', samm: 5 },
          { id: 'rinnatoega-soudmine', nimi: 'Rinnatoega sõudmine', tyyp: 'raskus', samm: 2 },
        ],
      },
      {
        seeriad: [3, 3], kordused: [10, 12],
        variandid: [
          { id: 'pallof', nimi: 'Pallof press', tyyp: 'raskus', samm: 2.5, kummalegi: true },
          { id: 'anti-rotation', nimi: 'Kaabliga anti-rotation', tyyp: 'raskus', samm: 2.5, kummalegi: true },
        ],
      },
      {
        seeriad: [2, 3], kordused: [10, 12], valikuline: true,
        variandid: [
          { id: 'biitseps', nimi: 'Biitseps', tyyp: 'raskus', samm: 2 },
        ],
      },
      {
        seeriad: [2, 3], kordused: [10, 12], valikuline: true,
        variandid: [
          { id: 'triitseps', nimi: 'Triitseps', tyyp: 'raskus', samm: 2.5 },
        ],
      },
    ],
  },
  {
    id: 'trenn3',
    nimi: 'Trenn 3',
    teema: 'Jalad',
    harjutused: [
      {
        seeriad: [3, 3], kordused: [5, 6],
        variandid: [
          { id: 'trapbar-jt', nimi: 'Trap-bar jõutõmme', tyyp: 'raskus', samm: 2.5 },
        ],
      },
      {
        seeriad: [3, 3], kordused: [8, 10],
        variandid: [
          { id: 'jalapress', nimi: 'Jalapress', tyyp: 'raskus', samm: 5 },
        ],
      },
      {
        seeriad: [3, 3], kordused: [8, 12],
        variandid: [
          { id: 'puusatosted', nimi: 'Puusatõsted', tyyp: 'raskus', samm: 2.5 },
          { id: 'glute-bridge', nimi: 'Kangiga glute bridge', tyyp: 'raskus', samm: 2.5 },
        ],
      },
      {
        seeriad: [2, 3], kordused: [10, 12],
        variandid: [
          { id: 'reie-koverdus', nimi: 'Reie tagaosa kõverdus masinal', tyyp: 'raskus', samm: 5 },
        ],
      },
    ],
  },
  {
    id: 'trenn4',
    nimi: 'Trenn 4',
    teema: 'Ülakeha',
    harjutused: [
      {
        seeriad: [3, 3], kordused: [8, 10],
        variandid: [
          { id: 'kaldpingil-hantel', nimi: 'Kaldpingil hantlitega surumine', tyyp: 'raskus', samm: 2 },
        ],
      },
      {
        seeriad: [3, 3], kordused: [8, 12],
        variandid: [
          { id: 'yhe-kae-soudmine', nimi: 'Ühe käega hantliga sõudmine', tyyp: 'raskus', samm: 2, kummalegi: true },
          { id: 'kaabliga-soudmine', nimi: 'Kaabliga sõudmine', tyyp: 'raskus', samm: 5 },
        ],
      },
      {
        seeriad: [2, 3], kordused: [8, 10],
        variandid: [
          { id: 'landmine-press', nimi: 'Landmine press', tyyp: 'raskus', samm: 2.5 },
          { id: 'hantli-olapress', nimi: 'Hantlitega õlapress', tyyp: 'raskus', samm: 2 },
        ],
      },
      {
        seeriad: [2, 3], kordused: [12, 15],
        variandid: [
          { id: 'face-pull', nimi: 'Face pull', tyyp: 'raskus', samm: 2.5 },
          { id: 'tagumise-ola-lendamine', nimi: 'Tagumise õla lendamine', tyyp: 'raskus', samm: 2 },
        ],
      },
      {
        seeriad: [3, 3], kordused: null,
        variandid: [
          { id: 'dead-bug', nimi: 'Dead bug', tyyp: 'kordused' },
          { id: 'plank', nimi: 'Plangu variatsioon', tyyp: 'aeg' },
        ],
      },
      {
        seeriad: [2, 3], kordused: [10, 12], valikuline: true,
        variandid: [
          { id: 'biitseps', nimi: 'Biitseps', tyyp: 'raskus', samm: 2 },
        ],
      },
      {
        seeriad: [2, 3], kordused: [10, 12], valikuline: true,
        variandid: [
          { id: 'triitseps', nimi: 'Triitseps', tyyp: 'raskus', samm: 2.5 },
        ],
      },
    ],
  },
];
