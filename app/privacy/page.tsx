import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
    title: 'Personvern | Targeter Webshop',
    description: 'Personvernerklæring for Targeter Webshop',
};

export default function PrivacyPage() {
    return (
        <main className="min-h-svh bg-background">
            <div className="mx-auto max-w-3xl px-6 py-12">
                <div className="mb-10 space-y-3">
                    <Link href="/login" className="text-sm text-muted-foreground underline-offset-4 hover:underline">
                        ← Tilbake til innlogging
                    </Link>
                    <h1 className="text-3xl font-semibold tracking-tight">Personvernerklæring</h1>
                    <p className="text-sm text-muted-foreground">Sist oppdatert: 26. juni 2026</p>
                </div>

                <article className="space-y-10 text-sm leading-relaxed text-foreground">
                    <section className="space-y-3">
                        <h2 className="text-lg font-semibold">1. Om tjenesten</h2>
                        <p>
                            Targeter Webshop er en bestillingsportal for trykkeriartikler. Tjenesten lar kunder legge
                            inn bestillinger, og trykkerier behandle og oppdatere status på disse. Betaling og
                            fakturering skjer direkte mellom kunde og trykkeri, vi behandler ikke betalingsinformasjon.
                        </p>
                        <p>
                            Tjenesten er tilgjengelig på{' '}
                            <a href="https://webshop.targeter.tech" className="underline underline-offset-4">
                                webshop.targeter.tech
                            </a>
                            .
                        </p>
                    </section>

                    <section className="space-y-3">
                        <h2 className="text-lg font-semibold">2. Behandlingsansvarlig</h2>
                        <p>Behandlingsansvarlig for personopplysninger i Targeter Webshop er Fortress Digital AS.</p>
                        <p>
                            Spørsmål om personvern eller henvendelser knyttet til dine rettigheter kan sendes til{' '}
                            <a href="mailto:support@targeter.tech" className="underline underline-offset-4">
                                support@targeter.tech
                            </a>
                            .
                        </p>
                    </section>

                    <section className="space-y-3">
                        <h2 className="text-lg font-semibold">3. Hvem erklæringen gjelder for</h2>
                        <p>Erklæringen gjelder for brukere av Targeter Webshop, herunder:</p>
                        <ul className="list-disc space-y-1 pl-5">
                            <li>
                                <strong>Kunder</strong> som logger inn og legger inn bestillinger
                            </li>
                            <li>
                                <strong>Trykkerier</strong> som behandler bestillinger tilknyttet sitt trykkeri
                            </li>
                            <li>
                                <strong>Administratorer</strong> som administrerer brukere, produkter og trykkerier
                            </li>
                        </ul>
                        <p>
                            Brukerkontoer opprettes av administrator. Det er ikke mulig å registrere seg selv i
                            portalen.
                        </p>
                    </section>

                    <section className="space-y-3">
                        <h2 className="text-lg font-semibold">4. Hvilke opplysninger vi behandler</h2>

                        <div className="space-y-4">
                            <div>
                                <h3 className="font-medium">Kontoinformasjon</h3>
                                <p className="text-muted-foreground">
                                    Navn, e-postadresse, passord (lagret i hash-form), brukerrolle og eventuell
                                    tilknytning til trykkeri.
                                </p>
                            </div>

                            <div>
                                <h3 className="font-medium">Innlogging og sesjon</h3>
                                <p className="text-muted-foreground">
                                    Sesjons-token, utløpstidspunkt, IP-adresse og nettleserinformasjon (user agent) ved
                                    innlogging.
                                </p>
                            </div>

                            <div>
                                <h3 className="font-medium">Bestillinger</h3>
                                <p className="text-muted-foreground">
                                    Bestillinger knyttet til din brukerkonto, inkludert produkter, størrelser, antall,
                                    valgt trykkeri og status på leveranse.
                                </p>
                            </div>

                            <div>
                                <h3 className="font-medium">Trykkeriinformasjon</h3>
                                <p className="text-muted-foreground">
                                    Navn og e-postadresse til registrerte trykkerier som mottar og behandler
                                    bestillinger.
                                </p>
                            </div>

                            <div>
                                <h3 className="font-medium">E-postvarsler</h3>
                                <p className="text-muted-foreground">
                                    Ved bestilling og statusoppdateringer sendes e-post til relevant trykkeri og kopi
                                    til kunden. E-posten kan inneholde referansenummer, produktdetaljer og status.
                                </p>
                            </div>

                            <div>
                                <h3 className="font-medium">Teknisk informasjon i nettleseren</h3>
                                <p className="text-muted-foreground">
                                    Handlekurv lagres lokalt i nettleseren (localStorage) frem til bestilling sendes. En
                                    funksjonell informasjonskapsel brukes for å huske om sidemenyen er åpen eller
                                    lukket.
                                </p>
                            </div>
                        </div>

                        <p>
                            Vi samler ikke inn betalingsinformasjon, leveringsadresser eller markedsføringsdata gjennom
                            portalen.
                        </p>
                    </section>

                    <section className="space-y-3">
                        <h2 className="text-lg font-semibold">5. Formål og rettslig grunnlag</h2>
                        <p>Vi behandler personopplysninger for følgende formål:</p>
                        <ul className="list-disc space-y-2 pl-5">
                            <li>
                                <strong>Tilby og administrere tilgang</strong> — for å identifisere deg og gi riktig
                                tilgang basert på rolle (GDPR art. 6 nr. 1 bokstav b).
                            </li>
                            <li>
                                <strong>Behandle bestillinger</strong> — for å opprette, vise og følge opp bestillinger
                                mellom kunde og trykkeri (GDPR art. 6 nr. 1 bokstav b).
                            </li>
                            <li>
                                <strong>Sende varsler</strong> — for å informere kunder og trykkerier om nye
                                bestillinger, statusendringer og kanselleringer (GDPR art. 6 nr. 1 bokstav b).
                            </li>
                            <li>
                                <strong>Sikkerhet og drift</strong> — for å beskytte tjenesten, hindre misbruk og
                                feilsøke tekniske problemer (GDPR art. 6 nr. 1 bokstav f).
                            </li>
                        </ul>
                    </section>

                    <section className="space-y-3">
                        <h2 className="text-lg font-semibold">6. Deling av opplysninger</h2>
                        <p>Personopplysninger deles i følgende situasjoner:</p>
                        <ul className="list-disc space-y-2 pl-5">
                            <li>
                                <strong>Mellom roller i portalen:</strong> Trykkerier ser bestillinger tilknyttet sitt
                                trykkeri, inkludert kundens navn og e-post. Kunder ser egne bestillinger.
                            </li>
                            <li>
                                <strong>Via e-post:</strong> Ved bestilling og statusoppdateringer mottar trykkeri og
                                kunde e-post med relevant ordreinformasjon.
                            </li>
                            <li>
                                <strong>Med databehandlere:</strong> Vi bruker eksterne tjenester for drift av løsningen
                                (se punkt 7). Disse behandler data på våre vegne og etter avtale.
                            </li>
                        </ul>
                        <p>Vi selger ikke personopplysninger til tredjeparter.</p>
                    </section>

                    <section className="space-y-3">
                        <h2 className="text-lg font-semibold">7. Databehandlere og lagring</h2>
                        <p>Personopplysninger lagres og behandles gjennom følgende tjenester:</p>
                        <ul className="list-disc space-y-2 pl-5">
                            <li>
                                <strong>Neon (PostgreSQL)</strong> — database, lagret i EU (Frankfurt)
                            </li>
                            <li>
                                <strong>Vercel</strong> — hosting av applikasjonen
                            </li>
                            <li>
                                <strong>Resend</strong> — utsending av e-postvarsler
                            </li>
                            <li>
                                <strong>Cloudflare</strong> — DNS for domenet
                            </li>
                        </ul>
                        <p>
                            Overføring av data utenfor EØS kan forekomme dersom en underleverandør har behandlingssted
                            utenfor EU. I slike tilfeller sikres overføringen gjennom gyldige overføringsmekanismer, som
                            standard kontraktsklausuler.
                        </p>
                    </section>

                    <section className="space-y-3">
                        <h2 className="text-lg font-semibold">8. Oppbevaring</h2>
                        <p>Vi lagrer personopplysninger så lenge det er nødvendig for formålene over:</p>
                        <ul className="list-disc space-y-2 pl-5">
                            <li>
                                <strong>Brukerkontoer</strong> beholdes til kontoen slettes av administrator, eller til
                                den ikke lenger er nødvendig.
                            </li>
                            <li>
                                <strong>Sesjoner</strong> slettes automatisk når de utløper.
                            </li>
                            <li>
                                <strong>Bestillinger</strong> beholdes for historikk og oppfølging av leveranser.
                                Sletting kan skje ved behov etter avtale med kunde eller administrator.
                            </li>
                            <li>
                                <strong>E-post hos Resend</strong> oppbevares i henhold til Resends egne retningslinjer.
                            </li>
                        </ul>
                    </section>

                    <section className="space-y-3">
                        <h2 className="text-lg font-semibold">9. Sikkerhet</h2>
                        <p>Vi iverksetter tekniske tiltak for å beskytte personopplysninger, herunder:</p>
                        <ul className="list-disc space-y-1 pl-5">
                            <li>Kryptert overføring (HTTPS)</li>
                            <li>Passord lagres i hashform</li>
                            <li>Rollebasert tilgang i portalen</li>
                            <li>Begrenset tilgang til driftsmiljø og databaser</li>
                        </ul>
                        <p>
                            Ingen metode for lagring eller overføring er fullstendig sikker. Vi kan derfor ikke
                            garantere absolutt sikkerhet, men jobber løpende for å redusere risiko.
                        </p>
                    </section>

                    <section className="space-y-3">
                        <h2 className="text-lg font-semibold">10. Informasjonskapsler og lokal lagring</h2>
                        <p>Targeter Webshop bruker:</p>
                        <ul className="list-disc space-y-2 pl-5">
                            <li>
                                <strong>Nødvendige informasjonskapsler</strong> for innlogging og sesjonshåndtering.
                            </li>
                            <li>
                                <strong>Funksjonell informasjonskapsel</strong> (<code>sidebar_state</code>) for å huske
                                preferanse for sidemeny.
                            </li>
                            <li>
                                <strong>Lokal lagring (localStorage)</strong> for handlekurv før bestilling sendes.
                            </li>
                        </ul>
                        <p>Vi bruker ikke informasjonskapsler til markedsføring eller tredjepartsanalyse.</p>
                    </section>

                    <section className="space-y-3">
                        <h2 className="text-lg font-semibold">11. Dine rettigheter</h2>
                        <p>Etter personvernforordningen (GDPR) har du rett til å:</p>
                        <ul className="list-disc space-y-1 pl-5">
                            <li>Be om innsyn i opplysninger vi har om deg</li>
                            <li>Be om retting av uriktige opplysninger</li>
                            <li>Be om sletting der vilkårene for dette er oppfylt</li>
                            <li>Be om begrensning av behandling</li>
                            <li>Be om dataportabilitet der det er relevant</li>
                            <li>Protestere mot behandling basert på berettiget interesse</li>
                        </ul>
                        <p>
                            For å utøve rettighetene dine, kontakt{' '}
                            <a href="mailto:support@targeter.tech" className="underline underline-offset-4">
                                support@targeter.tech
                            </a>
                            . Vi svarer normalt innen 30 dager.
                        </p>
                        <p>
                            Du kan også klage til Datatilsynet dersom du mener behandlingen bryter med regelverket:{' '}
                            <a
                                href="https://www.datatilsynet.no"
                                className="underline underline-offset-4"
                                target="_blank"
                                rel="noopener noreferrer"
                            >
                                datatilsynet.no
                            </a>
                            .
                        </p>
                    </section>

                    <section className="space-y-3">
                        <h2 className="text-lg font-semibold">12. Endringer</h2>
                        <p>
                            Vi kan oppdatere denne erklæringen ved endringer i tjenesten eller regelverket. Vesentlige
                            endringer vil bli gjort kjent i portalen eller på annen hensiktsmessig måte. Dato for siste
                            oppdatering står øverst på siden.
                        </p>
                    </section>
                </article>
            </div>
        </main>
    );
}
