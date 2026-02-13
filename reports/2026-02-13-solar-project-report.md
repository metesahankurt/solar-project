# Solar Project Research + Implementation Report

Date: 2026-02-13

## Scope
This report documents the scientific data sources, catalog integrations, and implementation changes applied to the solar-system-to-cosmos visualization. It covers planetary parameters, moons, ring systems, Kuiper/Oort/heliosphere updates, and extragalactic catalog layers.

## Summary of Work
- Updated planetary physical parameters using official NASA/JPL sources.
- Added major moons with official orbital elements and physical data; made moons clickable and orbit-visible.
- Implemented physically scaled ring systems for Jupiter, Saturn, Uranus, Neptune.
- Replaced procedural Kuiper belt with real MPCORB-derived Kuiper objects, plus resonance classes (Plutinos, Twotinos) and resonance markers.
- Updated heliosphere parameters using Voyager-era heliopause/termination shock values and applied asymmetry.
- Reworked Oort Cloud into a two-layer model (inner/outer) with scientifically plausible ranges.
- Added real catalogs for NGC/IC (positions + matched distances), Abell clusters (redshift distances), 2MRS galaxies (cz-based distances), and SDSS local modes (density nodes).
- Added cosmic web and density field layers derived from 2MRS distributions.
- Enabled orbit visualization by default.

## Sources (Official / Primary)
### Planetary parameters
- JPL Planetary Physical Parameters (mass, radius, semi-major axis, etc.)
  - https://ssd.jpl.nasa.gov/planets/phys_par.html

### Planetary satellites (orbital elements)
- JPL Planetary Satellite Mean Elements (a, e, i, node, omega, M, period)
  - https://ssd.jpl.nasa.gov/sats/elem/

### Moon physical parameters
- NSSDC fact sheets (major moons)
  - Jupiter system: https://nssdc.gsfc.nasa.gov/planetary/factsheet/joviansatfact.html
  - Saturn system: https://nssdc.gsfc.nasa.gov/planetary/factsheet/satringsfact.html
  - Uranus system: https://nssdc.gsfc.nasa.gov/planetary/factsheet/uranussatfact.html
  - Neptune system: https://nssdc.gsfc.nasa.gov/planetary/factsheet/neptunesatfact.html
  - Mars moons: https://nssdc.gsfc.nasa.gov/planetary/factsheet/marssatfact.html

### Ring systems
- NSSDC ring fact sheets (ring radii and general structure)
  - Jupiter rings: https://nssdc.gsfc.nasa.gov/planetary/factsheet/jupringfact.html
  - Saturn rings: https://nssdc.gsfc.nasa.gov/planetary/factsheet/satringfact.html
  - Uranus rings: https://nssdc.gsfc.nasa.gov/planetary/factsheet/uranusringfact.html
  - Neptune rings: https://nssdc.gsfc.nasa.gov/planetary/factsheet/neptuneringfact.html

### Kuiper objects
- MPCORB (Minor Planet Center) orbital elements used to compute Kuiper object positions
  - https://www.minorplanetcenter.net/iau/MPCORB/MPCORB.DAT

### NGC/IC catalog
- NGC 2000.0 catalog (positions and object types)
  - https://cdsarc.cds.unistra.fr/ftp/cats/VII/118/ngc2000.dat
  - https://cdsarc.cds.unistra.fr/ftp/cats/VII/118/ReadMe

### NGC/IC distances
- NED-D distances (matched to NGC/IC by name)
  - https://ned.ipac.caltech.edu/Library/Distances/

### Abell clusters (redshift catalog)
- Measured redshifts of Abell clusters (Andernach 1991; CDS)
  - https://cdsarc.cds.unistra.fr/ftp/cats/VII/165A/catalog.dat
  - https://cdsarc.cds.unistra.fr/ftp/cats/VII/165A/ReadMe

### 2MRS (nearby galaxies)
- 2MASS Redshift Survey (2MRS) catalog (Huchra et al. 2012)
  - VizieR ASU query: https://vizier.cds.unistra.fr/viz-bin/asu-tsv?-source=J/ApJS/199/26/table3&-out=ID,RAJ2000,DEJ2000,cz&-out.max=unlimited

### SDSS-IV local modes (cosmic web nodes)
- SDSS-IV Cosmic Web Catalog (local modes)
  - https://zenodo.org/records/6244866

## Key Implementation Notes
- Orbital positions for Kuiper objects and moons are computed from Keplerian elements.
- 2MRS and Abell distances are estimated using cz/H0 (H0 = 70 km/s/Mpc).
- NGC/IC distances are matched via NED-D by object name where available; unmatched objects remain on the sky sphere.
- Oort Cloud is modeled (no direct observations) using log-distributed points with inner (2,000–20,000 AU) and outer (20,000–100,000 AU) shells.
- Heliosphere boundaries are modeled with termination shock ~90 AU and heliopause ~122 AU, with a faint bow-wave shell.

## Files Added or Updated
- `data/planets.ts` (NASA/JPL planet parameters)
- `data/moons.ts` (moon physical/orbital data)
- `data/rings.ts` (ring radii and structure)
- `data/kuiper_mpc.json` (Kuiper objects from MPCORB)
- `data/ngc2000_distances.json` (NGC/IC + NED-D distances)
- `data/abellzcat.json` (Abell cluster catalog)
- `data/2mrs.json` (2MRS galaxy catalog)
- `data/2mrs_filaments.json` (2MRS filament graph)
- `data/2mrs_density.json` (2MRS density field)
- `data/sdss_localmodes.json` (SDSS local modes)
- `components/solar-system/planet-moons.tsx` (moons + orbits + click)
- `components/solar-system/planet-rings.tsx` (ring rendering)
- `components/solar-system/kuiper-belt.tsx` (MPCORB-driven Kuiper)
- `components/solar-system/heliosphere.tsx` (updated heliosphere)
- `components/solar-system/oort-cloud.tsx` (2-layer model)
- `components/solar-system/ngc-layer.tsx` / `ngc-details-panel.tsx`
- `components/solar-system/abell-layer.tsx` / `abell-details-panel.tsx`
- `components/solar-system/twomrs-layer.tsx` / `twomrs-details-panel.tsx`
- `components/solar-system/cosmic-web.tsx`
- `components/solar-system/density-field.tsx`
- `components/solar-system/sdss-local-modes.tsx`

## Open Items / Known Limits
- Oort Cloud remains a modeled distribution (no direct observational catalog).
- Full Horizons ephemeris integration is not yet applied (mean elements used for moons).
- Ring sub-structures (e.g., fine ringlets) are simplified.
- NGC/IC distances are only available where NED-D provides matches.

---
End of report.

# Gunes Sistemi Projesi Arastirma + Uygulama Raporu

Tarih: 2026-02-13

## Kapsam
Bu rapor, Gunes Sistemi'nden evren olcegine uzanan gorsellestirmeye uygulanan bilimsel veri kaynaklarini, katalog entegrasyonlarini ve uygulama degisikliklerini belgeler. Gezegen parametreleri, uydular, halka sistemleri, Kuiper/Oort/heliosfer guncellemeleri ve dis-galaktik katalog katmanlarini kapsar.

## Yapilan Islerin Ozeti
- Resmi NASA/JPL kaynaklari ile gezegen fiziksel parametreleri guncellendi.
- Resmi orbital elemanlar ve fiziksel verilerle buyuk uydular eklendi; uydular tiklanabilir ve orbitleri gorunur hale getirildi.
- Jupiter, Saturn, Uranus, Neptune icin fiziksel olcekli halka sistemleri uygulandi.
- Rastgele Kuiper kusagi yerine MPCORB verisinden turetilmis gercek Kuiper objeleri kullanildi; rezonans siniflari (Plutino, Twotino) ve rezonans isaretleri eklendi.
- Heliosfer parametreleri (termination shock/heliopause) guncellendi ve asimetri uygulandi.
- Oort Bulutu iki katmanli bilimsel modele cevrildi (ic/dis katman).
- NGC/IC, Abell, 2MRS ve SDSS local modes gibi gercek katalog katmanlari eklendi.
- 2MRS verisinden turetilmis kozmik ag ve yogunluk katmanlari eklendi.
- Orbit gorsellestirmesi varsayilan olarak acildi.

## Kaynaklar (Resmi / Birincil)
### Gezegen parametreleri
- JPL Planetary Physical Parameters (kutle, yaricap, yarim-buyuk eksen, vb.)
  - https://ssd.jpl.nasa.gov/planets/phys_par.html

### Uydu orbital elemanlari
- JPL Planetary Satellite Mean Elements (a, e, i, node, omega, M, period)
  - https://ssd.jpl.nasa.gov/sats/elem/

### Uydu fiziksel parametreleri
- NSSDC fact sheets (buyuk uydular)
  - Jupiter: https://nssdc.gsfc.nasa.gov/planetary/factsheet/joviansatfact.html
  - Saturn: https://nssdc.gsfc.nasa.gov/planetary/factsheet/satringsfact.html
  - Uranus: https://nssdc.gsfc.nasa.gov/planetary/factsheet/uranussatfact.html
  - Neptune: https://nssdc.gsfc.nasa.gov/planetary/factsheet/neptunesatfact.html
  - Mars: https://nssdc.gsfc.nasa.gov/planetary/factsheet/marssatfact.html

### Halka sistemleri
- NSSDC ring fact sheets (halka yaricaplari ve genel yapi)
  - Jupiter halkalari: https://nssdc.gsfc.nasa.gov/planetary/factsheet/jupringfact.html
  - Saturn halkalari: https://nssdc.gsfc.nasa.gov/planetary/factsheet/satringfact.html
  - Uranus halkalari: https://nssdc.gsfc.nasa.gov/planetary/factsheet/uranusringfact.html
  - Neptune halkalari: https://nssdc.gsfc.nasa.gov/planetary/factsheet/neptuneringfact.html

### Kuiper objeleri
- MPCORB (Minor Planet Center) orbital elemanlari kullanilarak Kuiper objeleri konumlandirildi
  - https://www.minorplanetcenter.net/iau/MPCORB/MPCORB.DAT

### NGC/IC katalog
- NGC 2000.0 katalogu (konum ve tipler)
  - https://cdsarc.cds.unistra.fr/ftp/cats/VII/118/ngc2000.dat
  - https://cdsarc.cds.unistra.fr/ftp/cats/VII/118/ReadMe

### NGC/IC mesafe verileri
- NED-D mesafeleri (NGC/IC isimleri ile eslestirildi)
  - https://ned.ipac.caltech.edu/Library/Distances/

### Abell kume katalogu (kirmiziya kayma)
- Abell kumeleri olculmus kirmiziya kayma katalogu (Andernach 1991; CDS)
  - https://cdsarc.cds.unistra.fr/ftp/cats/VII/165A/catalog.dat
  - https://cdsarc.cds.unistra.fr/ftp/cats/VII/165A/ReadMe

### 2MRS (yakin galaksiler)
- 2MASS Redshift Survey (2MRS) katalogu (Huchra et al. 2012)
  - VizieR ASU sorgusu: https://vizier.cds.unistra.fr/viz-bin/asu-tsv?-source=J/ApJS/199/26/table3&-out=ID,RAJ2000,DEJ2000,cz&-out.max=unlimited

### SDSS-IV local modes (kozmik ag dugumleri)
- SDSS-IV Cosmic Web Catalog (local modes)
  - https://zenodo.org/records/6244866

## Uygulama Notlari
- Kuiper objeleri ve uydularin konumlari Kepler elemanlari ile hesaplanir.
- 2MRS ve Abell mesafeleri cz/H0 ile hesaplanir (H0 = 70 km/s/Mpc).
- NGC/IC mesafeleri NED-D ile isim eslestirilerek eklenir; eslesmeyenler gokyuzu kuresinde kalir.
- Oort Bulutu (dogrudan gozlemsel veri olmadigi icin) ic/dis katmanli log dagilimla modellenmistir.
- Heliosfer sinirlari termination shock ~90 AU, heliopause ~122 AU olacak sekilde modellenmistir.

## Eklenen veya Guncellenen Dosyalar
- `data/planets.ts` (NASA/JPL gezegen parametreleri)
- `data/moons.ts` (uydu fiziksel/orbital verileri)
- `data/rings.ts` (halka yaricaplari ve yapi)
- `data/kuiper_mpc.json` (MPCORB Kuiper objeleri)
- `data/ngc2000_distances.json` (NGC/IC + NED-D mesafeleri)
- `data/abellzcat.json` (Abell kume katalogu)
- `data/2mrs.json` (2MRS galaksi katalogu)
- `data/2mrs_filaments.json` (2MRS filament grafigi)
- `data/2mrs_density.json` (2MRS yogunluk alani)
- `data/sdss_localmodes.json` (SDSS local modes)
- `components/solar-system/planet-moons.tsx` (uydular + orbit + tiklama)
- `components/solar-system/planet-rings.tsx` (halka cizimi)
- `components/solar-system/kuiper-belt.tsx` (MPCORB tabanli Kuiper)
- `components/solar-system/heliosphere.tsx` (guncel heliosfer)
- `components/solar-system/oort-cloud.tsx` (2 katmanli model)
- `components/solar-system/ngc-layer.tsx` / `ngc-details-panel.tsx`
- `components/solar-system/abell-layer.tsx` / `abell-details-panel.tsx`
- `components/solar-system/twomrs-layer.tsx` / `twomrs-details-panel.tsx`
- `components/solar-system/cosmic-web.tsx`
- `components/solar-system/density-field.tsx`
- `components/solar-system/sdss-local-modes.tsx`

## Acik Noktalar / Bilinen Sinirlar
- Oort Bulutu modeli temsili (dogrudan gozlemsel katalog yok).
- JPL Horizons tam ephemeris entegrasyonu henuz yok (uydular icin mean elements kullaniliyor).
- Halka mikro yapilari (ince ringlet'ler) sadeleştirilmiş.
- NGC/IC mesafeleri sadece NED-D eslesmesi olanlar icin var.

---
Rapor sonu.
