# Kompetanseoverføring

## Tilgang

Appen driftes i Vercel. Deployments følger Git, så det holder med å pushe for at ny versjon prodsettes. Her skal også environment variables for prod-miljø opprettes og redigeres ved behov. Prosjektnavn i Vercel er "targeter-webshop".

Databasen er tilgjengelig i Neon på Fortress sitt prosjekt. Region er Frankfurt. Passord og adresse ligger tilgjengelig på forsiden av prosjektet.

E-posttjener er Resend, her er domene "targeter.tech" tilgjengelig. Egen API-nøkkel kan opprettes here for lokalt bruk om ønskelig.

Domenet (webshop.targeter.tech) har DNS i Cloudflare, her også under Fortress sin bedriftskonto.

Antar at ny utvikler har tilgang til bedriftskonto hos Vercel, Resend og Neon.

## Rutiner

Ved schema-endring genereres migrasjonsfil ved hjelp av drizzle-kit ´bunx drizzle-kit generate´ og migrasjonen blir overført med ´bunx drizzle-kit migrate´.

Opprettelser av bruker skjer kun i grensesnittet (/admin/users), men et skript finnes og er tilgjengelig i package.json dersom dette ikke er tilgjengelig (hvis det er første brukeren, f.eks.). Dette brukes slik ´bun run create-user -- --email ... --password ...´. Hvis brukeren skal ha tilknytning til trykker kan man legge til ´--role print_shop --print-shop-id <uuid>´.

## Beslutninger

- Ett produkt kan finnes hos flere trykkerier i flere størrelser. Produkter er altså ikke spesifikke til visse trykkerier, og tilsvarende produkterer skal håndteres som ett, men med mulighet for ulike størrelser.
- Fakturering/betaling håndteres direkte av trykkeriene, vi tilrettelegger ikke for noe grunnlag av dette eller betalingshåndtering.

## Framtidsplaner

Vurderer framtiden av appen slik: skill ut datamodell til å være multi-tenant, tillat flere kjeder å samhandle med adskilte produkter og trykkerier. Åpne opp mot API-er, lag routes i app/api/ for eksempel et GET /orders endepunkt hvis trykkerier ønsker interne integrasjoner og POST /products for å åpne opp for ekstern opprettelse av produkter, fra enten kunde eller trykkeri.

## Referanser

- Systemdokumentasjon: [README.md](../README.md)
- Testbrukere: [DEMO.md](demo.md)
