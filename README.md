# eMonopoly
> Progetto realizzato per gioco, con finalità più didattiche che di uso
> in un progetto "real-world".

Gioca a Monopoly mantenendo i soldi digitali.
### Caratteristiche
- Le transazioni sono registrate in un modello in stile blockchain
- Server implementato interamente in OOP
- Uso di Socket.io per la comunicazione bidirezionale
- Client estremamente banale che usa Vue Petite per l'interattività e la banca non è realizzata, quindi funziona solo come client
per lo scambio di denaro.
- Opt-out per il client, quindi è possibile costruire
il proprio client rispettando semplicemente gli eventi necessari.

### Motivazioni
Ho realizzato questo progetto per applicare un modello OOP in NodeJS (non si adatta particolarmente bene, 
ma il risultato mi piace).
<br>
È stato un buon modo per imparare le basi di Typescript e del Unit-testing (con Tape).
<p>
Le transazioni sono registrate in una lista linkata giusto per implementare un approccio ricorsivo agli algoritmi, così
come l'uso di un modello in stile blockchain l'ho inserito solo per vedere le basi delle
blockchain e aggiungere un "livello di sicurezza maggiore" alla lista.
</p>

### Sto facendo...
Al momento sto realizzando un semplice client molto più completo usando Vitesse
(sì, mi piace molto VueJS).
<br>
Qui il link: [eMonopoly Client](https://github.com/mattiapra/eMonopoly_client)

### Come usarlo
```shell
npm install -g pnpm
pnpm i

pnpm start --port <number> --serve-client <boolean> --initial-money <number>
```
