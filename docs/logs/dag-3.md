# Logg - Dag 3

- **07:30** - Vurdering av forløpet for dagen. Ligger godt foran skjema og antar å fullføre funksjonaliteten i appen i dag, setter av morgendagen til korrektur og så dag 5 og 6 til dokumentasjon og forberedelser til fremføring.

- **08:10** - Begynner på bestillingslogikk. Ber Cursor implementere Resend og ordre til trykkeriet per e-post, på grunn av god tid utvider jeg idéen til å inkludere ordrestatus sendt fra trykkeri som svar på e-post. Tanken er at de kan svare på tråden med nøkkelord (confirmed, cancelled, etc.) som skal tas i mot av webshop-en og oppdatere status i grensesnittet.

    > Add order fulfillment and tracking. Orders should be sent to the print shops per email, and the user should be able to track it. Use Resend for delivering emails. Send e-mails from webshop@targeter.tech. The email should CC the user. The print shop should be able to reply keywords such as CONFIRMED, DELIVERED, CANCELLED, etc. to update the status in the webshop.

    Implementering av mottakelser støter på problemer med at inbound håndteres av Domeneshop, der vi har en egen innboks for domenet. I stedet for å route alt til Resend, som hadde skapt problemer for andre innbokser, velger jeg å sette opp alt på mitt eget domene. For å lese og registrere svar bruker jeg en webhook-funksjon Resend eksponerer, men denne kan da ikke benyttes lokalt, så her velger jeg å deploye appen til Vercel.

    Jobber meg da gjennom en byggfeil som klager på typing av roller i oppretting av bruker, her skal den da tolkes som enten admin og user, ikke bare en string. Legger så til et domene og oppdater DNS i Cloudflare.

- **11:30** - Velger å gå vekk fra e-postbasert ordreoppfølging, dette kan skape feiltolkninger og problemer siden det er basert på nøkkelord. Det la dog grunnlag for e-postutsendelser og ordrestatus som vi fortsetter å bruke. Jeg går heller for å opprette partnertilgang til nettsiden, som tillater trykkerier å manuelt logge seg inn og endre ordrer. Bruker skal også få mulighet til å kansellere ordre.

- **12:00** - Lunsj

- **12:30** - Satt opp et eget grensesnitt for trykkeriene samt en ny brukerrolle, der hvert trykker har en bruker knytttet til seg. Denne brukeren kan logge inn og se bestillingsoversikten for sitt trykkeri, bekrefte og kansellere bestillinger. Kjørte denne prompten til Cursor:

    > Replace the print shop reply order management. I want the print shops to have access to the webshop so they can log in and manage their orders in our app. Users should also be able to cancel orders. Both users and print shops should still be notified via e-mail, but without reply webhooks.
