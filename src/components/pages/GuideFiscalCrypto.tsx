import { useDocumentMeta } from '../../hooks/useDocumentMeta';
import { useStructuredData } from '../../hooks/useStructuredData';

interface Props {
  onBack: () => void;
  onGoToTool: () => void;
}

/**
 * FAQPage schema — helps Google render rich snippets directly in search
 * results. The answers are intentionally short so they fit the "People also
 * ask" blocks that Google displays.
 */
const GUIDE_FAQ_SCHEMA = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: 'Comment declarer ses cryptomonnaies en France en 2026 ?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: "En France, les plus-values crypto sont imposees au PFU de 30% (12,8% IR + 17,2% prelevements sociaux), majore d'une CEHR pour les hauts revenus. Il faut remplir le formulaire 2086 (detail des cessions) et reporter les montants sur la 2042-C (cases 3AN/3BN/3CN). Si la valeur totale des cessions de l'annee est inferieure a 305 EUR, la plus-value est exoneree.",
      },
    },
    {
      '@type': 'Question',
      name: 'Quelle est la formule de calcul des plus-values crypto (Article 150 VH bis) ?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: "L'article 150 VH bis du CGI impose une methode de PA global (prix d'acquisition global) decremente proportionnellement a chaque cession. Formule : plus-value = prix de cession - (prix total d'acquisition x prix de cession / valeur globale du portefeuille). Ce n'est pas un FIFO par lots, contrairement a ce qu'on voit souvent.",
      },
    },
    {
      '@type': 'Question',
      name: "Qu'est-ce que le formulaire 3916-bis et qui doit le remplir ?",
      acceptedAnswer: {
        '@type': 'Answer',
        text: "Le formulaire 3916-bis doit etre rempli par tous les residents fiscaux francais qui detiennent un compte de cryptoactifs ouvert, detenu, utilise ou clos a l'etranger. Cela inclut Binance, Kraken, Coinbase, Bitstamp et les autres exchanges non francais. L'absence de declaration est sanctionnee de 750 EUR par compte.",
      },
    },
    {
      '@type': 'Question',
      name: 'Les echanges crypto-crypto sont-ils imposables en France ?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: "Jusqu'au 30 juin 2026 : non, les echanges crypto contre crypto sont neutres fiscalement. A partir du 1er juillet 2026 (ordonnance 2024-936 transposant DAC8) : oui, chaque swap devient un evenement imposable et il faut calculer une plus-value a chaque conversion. Verifiez toujours la regle applicable a l'annee concernee.",
      },
    },
    {
      '@type': 'Question',
      name: 'Peut-on deduire les frais de transaction des plus-values crypto ?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: "Oui. Le BOFIP (BOI-RPPM-PVBMC-30-20) confirme que les frais d'exchange et les gas fees lies a une cession sont deductibles du prix de cession. Les frais lies a un achat augmentent le prix d'acquisition. Dans les deux cas, ils doivent etre convertis en euros au cours du jour de la transaction.",
      },
    },
    {
      '@type': 'Question',
      name: 'Flat tax ou bareme progressif : quoi choisir pour mes cryptos ?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: "Par defaut, la flat tax (PFU 30% + eventuelle CEHR) s'applique. Vous pouvez opter globalement pour le bareme progressif via la case 2OP. Cette option est interessante si votre TMI est a 0% ou 11% car vous economisez sur la part IR. Elle est penalisante aux TMI superieurs a 12,8%. Elle s'applique obligatoirement a tous vos revenus de capitaux mobiliers de l'annee.",
      },
    },
    {
      '@type': 'Question',
      name: 'Quelle est la deadline pour declarer ses cryptos en 2026 ?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: "Les dates limites 2026 pour la declaration en ligne : 21 mai pour les departements 01 a 19, 28 mai pour les departements 20 a 54, et 4 juin pour les departements 55 a 976. La declaration papier doit etre postee avant le 20 mai 2026.",
      },
    },
  ],
};

/**
 * Guide SEO : Declaration crypto France 2026
 *
 * Cible les mots-cles :
 * - "declaration crypto france 2026"
 * - "impot crypto france"
 * - "formulaire 2086 crypto"
 * - "flat tax crypto 31.4"
 * - "plus value crypto france"
 * - "comment declarer ses cryptomonnaies"
 */
export default function GuideFiscalCrypto({ onBack, onGoToTool }: Props) {
  useDocumentMeta({
    title: 'Declaration crypto France 2026 — Guide fiscal complet | CryptoTaxLocal',
    description: "Comment declarer vos cryptomonnaies en France en 2026 ? PFU 31,4%, formulaire 2086, Article 150 VH bis, seuil 305 EUR, DAC8. Guide complet et gratuit mis a jour.",
    canonical: 'https://cryptotaxlocal.com/guide-fiscal-crypto',
  });
  useStructuredData('faq-guide-fiscal', GUIDE_FAQ_SCHEMA);

  return (
    <div className="max-w-3xl mx-auto">
      <button onClick={onBack} className="text-sm text-blue-400 hover:text-blue-300 mb-6 flex items-center gap-1">
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
        Retour a l'outil
      </button>

      {/* H1 optimise SEO */}
      <h1 className="text-3xl md:text-4xl font-bold text-white mb-4 leading-tight">
        Declaration crypto France 2026 : le guide complet
      </h1>
      <p className="text-gray-400 mb-2">
        Mis a jour en avril 2026 — Saison fiscale en cours
      </p>
      <p className="text-sm text-gray-500 mb-8">
        Temps de lecture : 8 minutes
      </p>

      {/* CTA rapide */}
      <div className="p-5 rounded-xl bg-blue-900/20 border border-blue-700/40 mb-10">
        <p className="text-blue-300 text-sm">
          <strong>Pas envie de lire ?</strong> Importez votre CSV et obtenez votre rapport fiscal en 2 minutes.
        </p>
        <button onClick={onGoToTool} className="mt-3 px-5 py-2 rounded-lg bg-blue-600 text-white text-sm font-medium hover:bg-blue-500 transition-colors">
          Calculer mes impots crypto
        </button>
      </div>

      <article className="space-y-10 text-gray-300 leading-relaxed">
        {/* Sommaire */}
        <nav className="p-5 rounded-xl bg-gray-800/50 border border-gray-700">
          <p className="text-sm font-semibold text-white mb-3">Sommaire</p>
          <ol className="space-y-2 text-sm text-blue-400">
            <li><a href="#qui" className="hover:underline">1. Qui doit declarer ses cryptos ?</a></li>
            <li><a href="#quoi" className="hover:underline">2. Qu'est-ce qui est imposable ?</a></li>
            <li><a href="#taux" className="hover:underline">3. Quel taux d'imposition ? (PFU 31,4%)</a></li>
            <li><a href="#calcul" className="hover:underline">4. Comment calculer sa plus-value ?</a></li>
            <li><a href="#formulaires" className="hover:underline">5. Quels formulaires remplir ?</a></li>
            <li><a href="#3916bis" className="hover:underline">6. Declarer ses comptes a l'etranger (3916-bis)</a></li>
            <li><a href="#dates" className="hover:underline">7. Dates limites 2026</a></li>
            <li><a href="#nouveautes" className="hover:underline">8. Nouveautes 2026</a></li>
            <li><a href="#erreurs" className="hover:underline">9. Erreurs courantes a eviter</a></li>
          </ol>
        </nav>

        {/* Section 1 */}
        <section id="qui">
          <H2>1. Qui doit declarer ses cryptomonnaies ?</H2>
          <p>
            Si vous etes resident fiscal francais et que vous avez vendu, echange
            ou utilise des cryptomonnaies pour payer des biens ou services en 2025,
            vous devez declarer vos operations dans votre declaration de revenus 2026.
          </p>
          <p className="mt-3">
            Cela concerne tous les actifs numeriques : Bitcoin (BTC), Ethereum (ETH),
            stablecoins, tokens DeFi, NFTs — sans exception.
          </p>
          <Callout type="info">
            Meme si vous avez realise une moins-value (perdu de l'argent), vous devez
            quand meme declarer. Les moins-values ne sont pas reportables sur les
            annees suivantes, mais elles reduisent votre base imposable de l'annee en cours.
          </Callout>
        </section>

        {/* Section 2 */}
        <section id="quoi">
          <H2>2. Qu'est-ce qui est imposable ?</H2>

          <H3>Imposable</H3>
          <ul className="space-y-2 ml-1">
            <Li>Vente de crypto contre euros (ou toute monnaie fiat)</Li>
            <Li>Paiement d'un bien ou service avec de la crypto</Li>
            <Li>Conversion de crypto en stablecoin (USDT, USDC, etc.)</Li>
          </ul>

          <H3>Non imposable (jusqu'au 30 juin 2026)</H3>
          <ul className="space-y-2 ml-1">
            <Li>Echange d'une crypto contre une autre (ex: BTC vers ETH)</Li>
            <Li>Transfert entre vos propres wallets</Li>
            <Li>Achat de crypto avec des euros</Li>
            <Li>Reception d'un airdrop ou de rewards de staking (impose a la revente)</Li>
          </ul>

          <Callout type="warning">
            <strong>Changement au 1er juillet 2026 :</strong> L'ordonnance 2024-936
            prevoit que les echanges crypto-contre-crypto deviendront imposables.
            Pour les operations realisees en 2025 (declarees en 2026), ils restent non imposables.
          </Callout>
        </section>

        {/* Section 3 */}
        <section id="taux">
          <H2>3. Quel taux d'imposition ?</H2>
          <p>
            Les plus-values sur actifs numeriques sont soumises au Prelevement
            Forfaitaire Unique (PFU), aussi appele "flat tax".
          </p>

          <div className="mt-4 rounded-lg border border-gray-700 overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-gray-800">
                <tr>
                  <th className="px-4 py-3 text-left text-gray-400">Composante</th>
                  <th className="px-4 py-3 text-right text-gray-400">Taux</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800">
                <tr><td className="px-4 py-2">Impot sur le revenu (IR)</td><td className="px-4 py-2 text-right">12,8%</td></tr>
                <tr><td className="px-4 py-2">CSG</td><td className="px-4 py-2 text-right">10,6%</td></tr>
                <tr><td className="px-4 py-2">CRDS</td><td className="px-4 py-2 text-right">0,5%</td></tr>
                <tr><td className="px-4 py-2">Prelevement de solidarite</td><td className="px-4 py-2 text-right">7,5%</td></tr>
                <tr className="bg-blue-900/20 font-semibold text-white">
                  <td className="px-4 py-3">Total PFU</td>
                  <td className="px-4 py-3 text-right">31,4%</td>
                </tr>
              </tbody>
            </table>
          </div>

          <Callout type="info">
            <strong>Option bareme progressif :</strong> Vous pouvez opter pour le
            bareme progressif de l'impot sur le revenu (case 3CN) si votre taux
            marginal d'imposition est inferieur a 12,8%. Attention : les prelevements
            sociaux de 18,6% s'appliquent toujours en plus.
          </Callout>

          <H3>Seuil d'exoneration : 305 EUR</H3>
          <p>
            Si le total de vos cessions (ventes) de l'annee est inferieur a 305 EUR
            par foyer fiscal, vos gains sont exoneres d'impot. Vous devez quand meme
            remplir le formulaire 2086.
          </p>
        </section>

        {/* Section 4 */}
        <section id="calcul">
          <H2>4. Comment calculer sa plus-value ?</H2>
          <p>
            La France utilise une formule specifique (article 150 VH bis du CGI) :
          </p>
          <div className="mt-4 p-4 rounded-lg bg-gray-800 border border-gray-700 font-mono text-sm text-center">
            <p className="text-blue-300">Plus-value = Prix de cession</p>
            <p className="text-gray-400">-</p>
            <p className="text-amber-300">(Prix total d'acquisition x Prix de cession / Valeur globale du portefeuille)</p>
          </div>

          <p className="mt-4">En pratique :</p>
          <ul className="space-y-2 ml-1 mt-2">
            <Li><strong className="text-white">Prix de cession :</strong> combien vous avez recu en euros lors de la vente</Li>
            <Li><strong className="text-white">Prix total d'acquisition :</strong> combien vous avez investi au total dans votre portefeuille crypto</Li>
            <Li><strong className="text-white">Valeur globale du portefeuille :</strong> la valeur totale de toutes vos cryptos au moment de la vente</Li>
          </ul>

          <H3>Exemple concret</H3>
          <div className="mt-2 p-4 rounded-lg bg-gray-800/50 border border-gray-700 text-sm">
            <p>Vous avez investi <strong className="text-white">10 000 EUR</strong> au total en crypto.</p>
            <p className="mt-1">Votre portefeuille vaut <strong className="text-white">25 000 EUR</strong> au moment de la vente.</p>
            <p className="mt-1">Vous vendez pour <strong className="text-white">5 000 EUR</strong> de Bitcoin.</p>
            <p className="mt-3 text-blue-300">
              Plus-value = 5 000 - (10 000 x 5 000 / 25 000) = 5 000 - 2 000 = <strong>3 000 EUR</strong>
            </p>
            <p className="mt-1 text-amber-300">
              Impot = 3 000 x 31,4% = <strong>942 EUR</strong>
            </p>
          </div>

          <div className="mt-6 p-5 rounded-xl bg-blue-900/20 border border-blue-700/40">
            <p className="text-blue-300 text-sm">
              <strong>Ce calcul est fastidieux a faire a la main.</strong> Notre outil
              le fait automatiquement pour toutes vos transactions.
            </p>
            <button onClick={onGoToTool} className="mt-3 px-5 py-2 rounded-lg bg-blue-600 text-white text-sm font-medium hover:bg-blue-500 transition-colors">
              Calculer automatiquement
            </button>
          </div>
        </section>

        {/* Section 5 */}
        <section id="formulaires">
          <H2>5. Quels formulaires remplir ?</H2>

          <div className="space-y-4 mt-4">
            <FormCard
              number="2086"
              title="Declaration des plus ou moins-values sur actifs numeriques"
              desc="Le formulaire principal. Vous y detaillez chaque operation de cession : date, actif vendu, prix de cession, prix d'acquisition, plus ou moins-value. C'est une annexe de la declaration 2042."
            />
            <FormCard
              number="2042-C"
              title="Declaration complementaire"
              desc="Reportez le total de vos plus-values en case 3AN, ou vos moins-values en case 3BN. Si vous optez pour le bareme progressif, cochez la case 3CN."
            />
            <FormCard
              number="3916-bis"
              title="Declaration des comptes d'actifs numeriques a l'etranger"
              desc="Obligatoire pour chaque compte ouvert sur un exchange non enregistre en France. Un formulaire par plateforme."
            />
          </div>
        </section>

        {/* Section 6 */}
        <section id="3916bis">
          <H2>6. Declarer ses comptes a l'etranger (3916-bis)</H2>
          <p>
            Tout compte ouvert sur une plateforme non enregistree PSAN en France
            doit etre declare, meme si le solde est de zero, meme si vous n'avez
            pas fait de transaction dans l'annee.
          </p>

          <H3>Qui doit declarer ?</H3>
          <div className="mt-3 rounded-lg border border-gray-700 overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-gray-800">
                <tr>
                  <th className="px-4 py-3 text-left text-gray-400">Plateforme</th>
                  <th className="px-4 py-3 text-center text-gray-400">3916-bis ?</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800">
                <tr><td className="px-4 py-2">Kraken</td><td className="px-4 py-2 text-center text-red-400">Oui</td></tr>
                <tr><td className="px-4 py-2">Coinbase</td><td className="px-4 py-2 text-center text-red-400">Oui</td></tr>
                <tr><td className="px-4 py-2">KuCoin, Bybit</td><td className="px-4 py-2 text-center text-red-400">Oui</td></tr>
                <tr><td className="px-4 py-2">Binance France (SAS)</td><td className="px-4 py-2 text-center text-emerald-400">Non (PSAN)</td></tr>
                <tr><td className="px-4 py-2">Ledger, Trezor (wallets)</td><td className="px-4 py-2 text-center text-emerald-400">Non (self-custody)</td></tr>
                <tr><td className="px-4 py-2">Uniswap, Aave (DeFi)</td><td className="px-4 py-2 text-center text-emerald-400">Non (decentralise)</td></tr>
              </tbody>
            </table>
          </div>

          <Callout type="warning">
            <strong>Sanctions :</strong> 750 EUR d'amende par compte non declare.
            1 500 EUR si la valeur du compte depasse 50 000 EUR.
          </Callout>
        </section>

        {/* Section 7 */}
        <section id="dates">
          <H2>7. Dates limites 2026</H2>
          <p>Pour la declaration des revenus 2025 :</p>
          <div className="mt-4 space-y-3">
            <DateCard date="Avril 2026" event="Ouverture du service de declaration en ligne" />
            <DateCard date="19 mai 2026" event="Date limite declaration papier (minuit)" />
            <DateCard date="21 mai 2026" event="Date limite departements 01 a 19 + non-residents" />
            <DateCard date="28 mai 2026" event="Date limite departements 20 a 54" />
            <DateCard date="4 juin 2026" event="Date limite departements 55 a 976" />
          </div>
          <Callout type="info">
            Les dates exactes sont confirmees par impots.gouv.fr chaque annee.
            Verifiez sur votre espace personnel.
          </Callout>
        </section>

        {/* Section 8 */}
        <section id="nouveautes">
          <H2>8. Nouveautes 2026</H2>
          <ul className="space-y-3 ml-1">
            <Li>
              <strong className="text-white">PFU passe a 31,4% :</strong> La CSG sur
              les revenus du capital augmente de 9,2% a 10,6% (PLFSS 2026).
              L'IR reste a 12,8%.
            </Li>
            <Li>
              <strong className="text-white">Option bareme progressif simplifiee :</strong> L'election
              n'est plus irrevocable. Vous pouvez changer d'avis d'une annee sur l'autre.
            </Li>
            <Li>
              <strong className="text-white">DAC8 entre en vigueur :</strong> Depuis le 1er janvier 2026,
              les plateformes crypto doivent transmettre vos donnees de transactions
              aux autorites fiscales europeennes. Premier reporting : septembre 2027.
            </Li>
            <Li>
              <strong className="text-white">Crypto-to-crypto bientot taxe :</strong> L'ordonnance 2024-936
              prevoit la taxation des echanges crypto-crypto a partir du 1er juillet 2026.
              Pour la declaration 2026 (revenus 2025), ils restent non imposables.
            </Li>
          </ul>
        </section>

        {/* Section 9 */}
        <section id="erreurs">
          <H2>9. Erreurs courantes a eviter</H2>
          <ul className="space-y-3 ml-1">
            <Li>
              <strong className="text-white">Oublier le formulaire 3916-bis :</strong> C'est
              l'erreur la plus courante et la plus couteuse (750 EUR par compte).
            </Li>
            <Li>
              <strong className="text-white">Confondre achat et vente :</strong> Acheter
              du Bitcoin avec des euros n'est PAS un evenement imposable.
            </Li>
            <Li>
              <strong className="text-white">Ignorer les stablecoins :</strong> Convertir
              du BTC en USDT EST une cession imposable (le USDT est considere comme du fiat).
            </Li>
            <Li>
              <strong className="text-white">Ne pas declarer les moins-values :</strong> Meme
              si vous avez perdu de l'argent, declarez. Les moins-values compensent
              vos plus-values de la meme annee.
            </Li>
            <Li>
              <strong className="text-white">Utiliser un mauvais taux de change :</strong> Le
              taux de change doit etre celui du jour de la transaction, pas du jour
              de la declaration.
            </Li>
          </ul>
        </section>

        {/* Ressources */}
        <section>
          <H2>Ressources utiles</H2>
          <div className="space-y-3 mt-4">
            <a href="https://www.binance.com/activity/referral-entry/CPA?ref=CPA_00UHT5WR0G" target="_blank" rel="noopener noreferrer sponsored" className="block p-4 rounded-lg bg-gray-800/50 border border-gray-700 hover:border-amber-600/50 transition-colors">
              <div className="flex items-center gap-3">
                <span className="text-amber-400 text-lg">&#8383;</span>
                <div>
                  <p className="text-sm font-medium text-white">Binance — Premiere plateforme crypto mondiale</p>
                  <p className="text-xs text-gray-500 mt-1">Creez un compte et exportez votre historique CSV pour utiliser CryptoTaxLocal. Lien d'affiliation.</p>
                </div>
              </div>
            </a>
          </div>
        </section>

        {/* CTA final */}
        <section className="p-8 rounded-xl bg-gradient-to-br from-blue-900/30 to-blue-800/10 border border-blue-700/30 text-center">
          <h2 className="text-xl font-bold text-white mb-3">
            Calculez vos impots crypto en 2 minutes
          </h2>
          <p className="text-gray-400 text-sm mb-5 max-w-md mx-auto">
            Importez votre historique CSV, obtenez votre rapport fiscal avec
            les montants a reporter sur le formulaire 2086. Gratuit, sans
            inscription, 100% dans votre navigateur.
          </p>
          <button onClick={onGoToTool} className="px-8 py-3 rounded-lg bg-blue-600 text-white font-medium hover:bg-blue-500 transition-colors">
            Lancer le calcul
          </button>
        </section>

        {/* Sources */}
        <section className="text-xs text-gray-600">
          <p className="font-medium text-gray-500 mb-2">Sources</p>
          <ul className="space-y-1">
            <li>impots.gouv.fr — Declaration des plus-values sur actifs numeriques</li>
            <li>Article 150 VH bis du Code General des Impots (CGI)</li>
            <li>Loi de Finances 2025, article 54 (transposition DAC8)</li>
            <li>PLFSS 2026 (modification CSG revenus du capital)</li>
            <li>Ordonnance 2024-936 du 15 octobre 2024</li>
            <li>bofip.impots.gouv.fr — BOI-RPPM-PVBMC-30-30</li>
          </ul>
        </section>
      </article>

      <p className="text-xs text-gray-700 mt-8">Derniere mise a jour : avril 2026</p>
    </div>
  );
}

// --- Sub-components ---

function H2({ children }: { children: React.ReactNode }) {
  return <h2 className="text-xl font-bold text-white mb-3">{children}</h2>;
}

function H3({ children }: { children: React.ReactNode }) {
  return <h3 className="text-base font-semibold text-gray-200 mt-5 mb-2">{children}</h3>;
}

function Li({ children }: { children: React.ReactNode }) {
  return (
    <li className="flex gap-2">
      <span className="text-blue-400 mt-1 shrink-0">-</span>
      <span>{children}</span>
    </li>
  );
}

function Callout({ type, children }: { type: 'info' | 'warning'; children: React.ReactNode }) {
  const styles = {
    info: 'bg-blue-900/20 border-blue-700/40 text-blue-300',
    warning: 'bg-amber-900/20 border-amber-700/40 text-amber-300',
  };
  return (
    <div className={`mt-4 p-4 rounded-lg border text-sm ${styles[type]}`}>
      {children}
    </div>
  );
}

function FormCard({ number, title, desc }: { number: string; title: string; desc: string }) {
  return (
    <div className="p-4 rounded-lg bg-gray-800/50 border border-gray-700">
      <div className="flex items-center gap-3 mb-2">
        <span className="px-2 py-1 rounded bg-blue-600 text-white text-xs font-bold">{number}</span>
        <span className="text-sm font-medium text-white">{title}</span>
      </div>
      <p className="text-sm text-gray-400">{desc}</p>
    </div>
  );
}

function DateCard({ date, event }: { date: string; event: string }) {
  return (
    <div className="flex gap-4 items-start">
      <span className="px-3 py-1 rounded bg-gray-800 text-blue-400 text-xs font-medium whitespace-nowrap border border-gray-700">{date}</span>
      <span className="text-sm text-gray-300">{event}</span>
    </div>
  );
}
