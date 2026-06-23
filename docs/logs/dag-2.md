# Logg - Dag 2

- **08:30** - Ankom kontoret
- **09:00** - Prosjektstart:

    Satt opp repository og Next.js-app i ett med kommandoen; `bunx create-next-app@latest targeter-webshop --yes —empty`. Jeg satt så opp et komponentregister hentet fra ui.shadcn.com og justerte verdier og farger til å matche stilen til Targeter, hovedprosjektet vårt som dette er basert på. Jeg hentet først ut de viktigste komponenente jeg forventer å bruke (button, input, textarea).

    Setter så opp en ny Postgres-database på neon.tech, da bestiller jeg her en i Frankfurt som er nærmeste AWS-region de har tilgjengelig. Deretter legger jeg til Drizzle ORM i kodebasen (bruker kommandoen `bun add` for å legge til NPM-pakkene som hører med) for å koble til databasen, oppretter de nødvendige konfigurasjonsfilene og nevneverdig `.env`-filen som holder på database-lenken som jeg henter fra neon.tech. Bruker dokumentasjon fra orm.drizzle.team under oppsettet.

    Her publiserer jeg også et GitHub-repository og passer på at dette er satt til public slik at det ikke byr på problemer senere.

    Siste steg av oppsettet er initialisering av Better Auth, her følger jeg dokumentasjon på better-auth.com/docs og passer på at jeg velger Drizzle-adapteret slik at de kan snakke sammen direkte samt skrur på emailAndPassword-autentisering. Her begynner også utformingen av schema til databasen, Better Auth legger selv til de tabellene og kolonnene den trenger (session, user, account, etc.) men jeg holder an med å migrere endringene til jeg har skissert resten av funksjonaliteten for selve app-en.

- **10:00** - Her ligger jeg litt foran skjema og begynner utvikling av hovedfunksjonalitet. Setter først opp login-skjerm og administratorside, passer på at beskytta sider håndteres av Next.js gjennom `proxy.ts`-filen. Bruker Cursor til å skrive koden, forteller den:

    > Setup a login page with no sign up using auth-client.ts and an admin subpage with user table using shadcn components. Protect the root page using proxy.ts and better auth. Admin subpage should be scoped to users with the admin role, set this up using the admin plugin: https://better-auth.com/llms.txt/docs/plugins/admin.md

    Jeg tar en gjennomgang av endringene og må oversette det meste til norsk da dette ikke var opplyst i prompt-en.

    Før jeg får testet funksjonaliteten av app-en med innlogging og opprettelse av brukere er jeg nødt til å migrere schema-en til databasen, som jeg utsatte tidligere i vente på resten av appen for å få en «clean» første migrasjon, men siden jeg gjør ting litt stykkvis velger jeg å kjøre på å sender de nye tabellene til databasen min med `bunx drizzle-kit generate` også `bunx drizzle-kit migrate`.

    Første feilmeldingen jeg får er ved innlogging, «Unable to sign in». Ser i server-loggen at den kommer av Better Auth som ikke finner schema-en og kan derfor ikke verifisere, dette er heldigivis en enkel fiks og jeg sender feilmeldingen rett til Cursor og den legger til manglende konfigurasjon i auth.ts. Etter det fullføres kallene til autentiseringen, men jeg blir nektet adgang da det ikke er opprettet noen brukere enda, og siden dette kun kan gjøres internt i grensesnittet må jeg opprette dette manuelt. ber Cursor om å skrive et enkelt script som snakker med internfunksjonene, her skriver jeg da:

    > create a script in /scripts to create a user with better auth, use parameters for email and password and add it to package.json

    Den tok også for seg roller og navn som parametre, og da kan jeg enkelt lage min første bruker med `bun run create-user -- --email henrik@fortress.no --password secret --name "Henrik" --role admin`.

    Videre i testingen ser alt fint ut, men jeg ser at admin-siden mangler muligheten til å fjerne og opprette brukere så da jeg ber jeg Cursor legge til det:

    > Add user managment dialogs to the admin page for creating, updating and deleting users.

    Funksjonaliteten er god og det er ingenting å rette på.

    Før jeg går videre til selve bestilling- og produktfunksjonalitet ønsker jeg å oppdatere navigasjonen, legger da til en «sidebar» komponent fra det samme registeret som før. Prompt til Cursor:

    > Replace current navigation with a simple sidebar from shadcn

- **12:00** - Lunsj

- **12:45** - Her setter jeg i gang med kjernefunksjonaliteten til appen, prøver å gjøre så mye i et forsøk med KI her, så skriver følgende prompt:

    > Implement core product management and order functionality. To the home page, add orderable products that can be managed by admins in /admin/products, with live stock, different sizes and descriptions but no images. During ordering, the user can choose which print shop (trykkeri) from a drop down, this list should also be managed by admins in /admin/fulfillment. User management should be moved to /admin/users and these should appear as sub pages in the sidebar. Add a order summary and submit screen, for now just add a dummy function that logs the order instead of fulfilling it.

    Resultatet var om lag 2000 berørte linjer, jeg kjører først migrering av ny schema (den la til tabeller slik som products, order, print shop, etc.), som går smertefritt, uten noen feil. Jeg tester de nye funksjonene og synes alt ser greit ut, den gjør som den skal og bestilling fungerer. Den reduserer lagerantallet og printer følgende i loggen:

    ```json
    [ORDER SUBMITTED] {
    "orderId": "08ae79fa-2c4c-4b0b-8815-af7c459cd1a7",
    "userId": "Z0MvGzG5n9k303DdQVYJp5QaMMMT9wko",
    "userEmail": "henrik@fortress.no",
    "printShop": "Fredrikstad Trykk AS",
    "items": [
    {
    "product": "Visningsskilt",
    "size": "60cm",
    "quantity": 1
    }
    ],
    "submittedAt": "2026-06-23T11:09:07.673Z"
    }
    ```

    Litt småpuss gjenstår, kort oppsummert:
    - Fikset redigeringsdialog for produkter, manglet data
    - Flyttet bestillingsskjerm til et «sheet» på høyre side av skjermen
    - Satt trykkerivalget til å være per-produkt, ikke per-bestilling slik at bruker kan velge ulike trykkerier for hvert enkelt produkt
    - La til e-postadresse til trykkeriet i databasen, i tabellen og dialogboksen
    - Fikset produkter som ikke kunne slettes
    - Flyttet lagerstatus til å være per-trykker fremfor per-produkt

    La til diverse produkter som beachflagg, kulepenn, visningsbukk, mm.

- **14:15** - På tampen av dagen gjorde jeg en siste implementering for ordens skyld, la til en «bestillinger»-side for brukeren slik at de kan se aktive bestillinger. Per nå er det ingenting som fullfører eller følger opp bestillingen i det hele tatt, så det blir mer enn historikk. Her kjørte jeg også en kjapp prompt gjennom Cursor:

    > Make a order history page for the user

    Fullførte så dokumentasjonen og la denne inn i GitHub, skrev en oppsummert versjon og sendte på e-post.
