# Treeningäpp – projekti kirjeldus

## Kes ma olen ja kuidas minuga töötada

- Olen programmeerimises täielik algaja. **Räägi minuga eesti keeles** ja seleta lihtsalt, ilma žargoonita.
- Enne suuremat muudatust ütle lühidalt, mida kavatsed teha ja miks.
- Tee muudatusi **väikeste sammudena**. Pärast iga töötavat sammu tee Git commit, et saaksime vajadusel tagasi minna.
- Pärast iga sammu ütle mulle täpselt, kuidas ma tulemust ise järele proovin.
- Kui midagi on ebaselge, küsi enne, kui teed.

## Mis äpp see on

Isiklik jõutreeningu päevik **iPhone'ile**. Kasutan seda jõusaalis trenni ajal: näen oma kava, kannan sisse iga seeria ja jälgin progressi.

## Tehnilised otsused

- **Veebiäpp (PWA)**, mille lisan iPhone'is Safari kaudu avaekraanile („Add to Home Screen").
- Lihtne ülesehitus: HTML, CSS ja JavaScript, **ilma build-sammu ja raamistikuta**, et oleks lihtne mõista ja internetti panna (GitHub Pages).
- Peab **töötama ka ilma internetita** (service worker), sest jõusaalis võib levi olla halb.
- Andmed salvestatakse **telefoni mällu** (IndexedDB või localStorage). Serverit ega kontot pole.
- **Varukoopia:** nupp, mis ekspordib kõik andmed ühte faili, ja nupp, mis impordib need tagasi.
- Disain: **mobiil eelkõige**, suured nupud (kasutan trenni ajal, vahel higiste kätega), tume teema, numbrite sisestamiseks numbriklaviatuur.
- Kogu kasutajaliides on **eesti keeles**. Raskused kilogrammides.

## Treeningkava

Neli trenni. Nädalapäevadeks need jagatud ei ole: nädala jooksul tuleb kõik neli ära teha, mis järjekorras sobib.

Iga trenni alguses on **soojenduse lahter**: vaba tekstiväli, kuhu kirjutan, mida soojenduseks tegin.

Kus on kaldkriipsuga mitu nime, on need **variandid**: trenni ajal valin, millise tegin.

### Trenn 1 – Jalad
| Harjutus (variandid) | Seeriad | Kordused |
|---|---|---|
| Tagakükk / Esikükk / Hack squat | 3 | 5–8 |
| Rumeenia jõutõmme | 3 | 6–8 |
| Bulgaaria kükk / Tagasiaste | 2–3 | 8 kummalegi jalale |
| Sääretõsted | 3 | 10–15 |

### Trenn 2 – Ülakeha
| Harjutus (variandid) | Seeriad | Kordused |
|---|---|---|
| Lamades surumine / Hantlitega surumine | 3 | 6–10 |
| Lõuatõmbed / Abistatud lõuatõmbed / Plokil allatõmme | 3 | 6–10 |
| Istudes plokil sõudmine / Rinnatoega sõudmine | 2–3 | 8–12 |
| Pallof press / Kaabliga anti-rotation | 3 | 10–12 kummalegi poole |
| Biitseps (valikuline) | 2–3 | 10–12 |
| Triitseps (valikuline) | 2–3 | 10–12 |

### Trenn 3 – Jalad
| Harjutus (variandid) | Seeriad | Kordused |
|---|---|---|
| Trap-bar jõutõmme | 3 | 5–6 |
| Jalapress | 3 | 8–10 |
| Puusatõsted / Kangiga glute bridge | 3 | 8–12 |
| Reie tagaosa kõverdus masinal | 2–3 | 10–12 |

### Trenn 4 – Ülakeha
| Harjutus (variandid) | Seeriad | Kordused |
|---|---|---|
| Kaldpingil hantlitega surumine | 3 | 8–10 |
| Ühe käega hantliga sõudmine / Kaabliga sõudmine | 3 | 8–12 |
| Landmine press / Hantlitega õlapress | 2–3 | 8–10 |
| Face pull / Tagumise õla lendamine | 2–3 | 12–15 |
| Dead bug / Plangu variatsioon | 3 | – (aeg või kordused) |
| Biitseps (valikuline) | 2–3 | 10–12 |
| Triitseps (valikuline) | 2–3 | 10–12 |

Harjutusi ei jagata põhi- ja abiharjutusteks: kõik on lihtsalt kava harjutused.

Kava peab olema äpis **muudetav** (harjutuse lisamine, eemaldamine, seeriate ja korduste muutmine), aga see võib tulla hilisemas versioonis.

### Progressiooni reeglid (treenerilt)
- Kui kõik seeriad tulevad kordusvahemiku **ülemises otsas** ja tehnika püsib, võib järgmisel korral raskust veidi tõsta.
- Iga 4–6 nädala tagant võiks vajadusel teha kergema nädala.

### Kuidas seeriaid sisestatakse (kokku lepitud)
- **Hantlid:** sisestan ühe hantli raskuse (nt 20 kg, mitte 40 kg).
- **Lõuatõmbed:** sisestan lisaraskuse (0 = ainult keharaskus).
- **Abistatud lõuatõmbed:** sisestan abi suuruse kilogrammides. **Väiksem number on parem**: progress tähendab abi vähendamist.
- **Plokil allatõmme:** masina raskus.
- **Ühe jala või käega harjutused** (nt Bulgaaria kükk, Pallof press, ühe käega sõudmine): üks korduste number, mis tähendab kummalegi poole.
- **Dead bug:** ainult kordused (raskust pole).
- **Plank:** sekundites (raskust pole).
- **Raskuse tõstmise samm** progressioonisoovituses: kang +2,5 kg, hantlid +2 kg, masinad +5 kg (üks plaat). Sammud on kirjas failis `kava.js` ja neid saab seal muuta.

### Muud kokkulepped
- Möödunud trenne saab hiljem **muuta ja kustutada** (trükivigade parandamiseks).
- „2–3 seeriat": esimesel korral pakutakse 3 seeriat, edaspidi nii mitu, kui eelmisel korral tegin.
- **Valikulised harjutused** (biitseps, triitseps) on näha, aga neid võib vahele jätta. See ei mõjuta linnukest.
- Linnuke läheb **trenni kuupäeva** järgi õigesse nädalasse. Käsitsi pandud linnuke saab tänase kuupäeva.
- Hinnanguline 1RM arvutatakse Epley valemiga.
- Kui sama harjutus on kahes trennis (nt biitseps), on „eelmine kord" ühine.

## Funktsioonid

### Avaleht: see nädal
- Neli kaarti: Trenn 1, Trenn 2, Trenn 3, Trenn 4.
- Kui trenn on sel nädalal tehtud, on kaardil **linnuke** ja kuupäev. Linnuke tekib automaatselt, kui trenn salvestatakse, aga seda saab ka käsitsi panna või eemaldada.
- Näha on „Sel nädalal tehtud: 2/4". Nädal algab esmaspäeval ja linnukesed lähtestuvad uue nädala alguses (ajalugu jääb alles).

### Trenni sisestamine
- Kuupäev (vaikimisi täna, saab muuta).
- Iga harjutuse juures:
  - variandi valik (kui variante on mitu),
  - **eelmise korra tulemus** sama variandi kohta, nt „Eelmine kord: 60×8, 60×8, 60×7",
  - **soovitus**, kui progressioonireegel on täidetud, nt „Kõik seeriad ülemises otsas → proovi 62,5 kg",
  - **iga seeria eraldi**: raskus (kg) ja kordused. Väljad on eeltäidetud eelmise korra väärtustega, et sisestamine oleks kiire.
  - võimalus seeriat lisada või eemaldada,
  - märkus harjutuse kohta.
- Trenni lõpus: **enesetunde hinnang** (1–5 või emotikonid) ja vaba tekst „Kuidas ennast tundsin".
- Pooleli olev trenn ei tohi kaduda, kui äpi vahepeal kinni panen.

### Puhkeaja taimer
- Pärast seeria salvestamist käivitub taimer automaatselt (vaikimisi 2 min, aega saab muuta).
- Suur ja hästi nähtav. Lõpus heli, kui äpp on lahti. (iPhone'i veebiäpp ei toeta vibratsiooni ega taustal teavitusi, seega ei pea nendega vaeva nägema.)

### Isiklikud rekordid
- Äpp märgib ära, kui seeria on rekord (suurim raskus antud korduste arvuga või hinnanguline 1RM). Iga variandi kohta eraldi.
- Rekordite nimekiri eraldi vaates.

### Ajalugu ja progress
- Kõigi tehtud trennide nimekiri: kuupäev, seeriad, märkused, enesetunne.
- Harjutuse kohta **graafik** progressist (raskus ajas).

### Kehakaal ja mõõdud
- Kehakaal ja mõõdud (nt vöökoht, puus, rind, reis, käsivars) kuupäevaga.
- Graafik ajas.

## Arendamise järjekord

0. **GitHub Pages kohe alguses**, et saaksin iga sammu iPhone'is proovida. GitHubi konto on olemas.
1. **Versioon 1:** avaleht nädala linnukestega, kava (4 trenni), trenni sisestamine seeriate kaupa, eelmise korra tulemus, andmete salvestamine telefoni, varukoopia eksport/import.
2. Puhkeaja taimer.
3. Märkused ja enesetunne.
4. Progressioonisoovitus ja isiklikud rekordid.
5. Ajalugu ja graafikud.
6. Kehakaal ja mõõdud.
7. Kava muutmine äpis.
8. PWA viimistlus: ikoon, töötamine ilma internetita, avaekraanile lisamine.

Pärast iga etappi testin äpi ära, enne kui järgmisega edasi läheme.

**Videod** jäävad esialgu välja. Võib-olla lisame need hiljem.
