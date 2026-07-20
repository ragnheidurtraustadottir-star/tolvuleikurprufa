# Vinnulota – 20. júlí 2026

## Yfirlit

Í þessari vinnulotu var fyrsta spilanlega útgáfan af **Boltabita** búin til, verkefnið tengt við GitHub og leikurinn birtur á GitHub Pages.

## Það sem var gert

- Búinn til grunnur leiksins með `index.html`, `style.css` og `game.js`.
- Búið til leikjasvæði sem virkar með mús og snertiskjá.
- Spilarinn stjórnar bláum bolta sem eltir bendilinn.
- Grænir boltar eru minni en spilarinn og hægt er að éta þá.
- Rauðir boltar eru stærri og valda leikslokum við árekstur.
- Blái boltinn vex þegar hann étur minni bolta.
- Bætt við stigatalningu, stærðarmæli, byrjunarvalmynd og möguleika á að spila aftur.
- Fjöldi bolta var minnkaður úr 24 í 18 til að gera leiksvæðið greiðfærara.
- Að minnsta kosti 12 boltar byrja ætir.
- Aukaboltar stækka og minnka stöðugt og árekstrarsvæði þeirra fylgir sýnilegri stærð.
- Rauður bolti getur því minnkað, orðið grænn og opnað leið fyrir spilarann.
- Git var sett upp og verkefnið sett undir útgáfustýringu á `main`.
- Verkefnið var tengt við GitHub-geymsluna `ragnheidurtraustadottir-star/tolvuleikurprufa`.
- GitHub Pages og sjálfvirk útgáfa með GitHub Actions voru sett upp.

## Tenglar

- [Spila leikinn](https://ragnheidurtraustadottir-star.github.io/tolvuleikurprufa/)
- [GitHub-geymsla](https://github.com/ragnheidurtraustadottir-star/tolvuleikurprufa)

## Núverandi staða

Leikurinn er spilanlegur í vafra og allar breytingar sem fara á `main` eru birtar sjálfkrafa á GitHub Pages.

## Hugmyndir fyrir næstu vinnulotu

- Fínstilla hraða og erfiðleikastig eftir meiri spilaprófun.
- Bæta við hljóðum og einföldum sjónrænum áhrifum þegar bolti er étinn.
- Skoða hreyfingu aukabolta um leiksvæðið.

## Viðbót – frysting og tveggja manna keppni

Síðar í sömu vinnulotu var lagfærð villa sem gat fryst leikinn og komið í veg fyrir að hægt væri að byrja aftur. Einnig var tveggja manna hamnum breytt úr lotuskiptum leik í beina keppni þar sem báðir spila samtímis á sama borði.

### Villugreining og lagfæring

- Frystingin stafaði af endalausri leit að lausum stað fyrir nýjan bolta þegar leikmaðurinn var orðinn mjög stór.
- Leit að staðsetningu hefur nú hámark upp á 80 tilraunir og getur því ekki lengur stöðvað leikjalykkjuna.
- Endurræsing býr til nýja leikmenn, ný stig og nýja bolta í hvert skipti.
- Virkir lyklar eru hreinsaðir við leikslok og þegar vafraglugginn missir fókus.

### Tveggja manna hamur

- Báðir leikmenn spila nú samtímis og keppa um boltana á sama leiksvæði.
- Leikmaður 1 stýrir með `W`, `A`, `S` og `D`.
- Leikmaður 2 stýrir með örvatökkunum.
- Leikmenn hafa sitt hvorn litinn, nafnið og stigateljarann.
- Sá sem lifir lengur vinnur; stig ráða úrslitum ef báðir falla saman.
- Hægt er að hefja nýja tveggja manna keppni beint úr leikslokaskjánum.

### GitHub og útgáfa

- Breytingarnar voru vistaðar í commit `0e4d699` með skilaboðunum `Fix game restart and add live two-player mode`.
- Commit-inu var ýtt á `main` í GitHub-geymslunni.
- GitHub Actions birti nýju útgáfuna með góðum árangri.
- Staðfest var að birta síðan svaraði með `200 OK` og innihéldi nýja tveggja manna haminn.

### Staða eftir breytingu

Leikurinn er birtur á [GitHub Pages](https://ragnheidurtraustadottir-star.github.io/tolvuleikurprufa/) og nú er bæði hægt að spila einn með mús eða fingri og tvo samtímis með lyklaborði.
