interface Props {
  onBack: () => void;
  onGoToTool: () => void;
}

/**
 * Article SEO : Guide formulaire 3916-bis
 *
 * Mots-cles cibles :
 * - "formulaire 3916 bis crypto"
 * - "declarer compte crypto etranger"
 * - "3916 bis binance coinbase kraken"
 * - "amende compte crypto non declare"
 * - "declaration compte actifs numeriques"
 */
export default function Guide3916bis({ onBack, onGoToTool }: Props) {
  return (
    <div className="max-w-3xl mx-auto">
      <button onClick={onBack} className="text-sm text-blue-400 hover:text-blue-300 mb-6 flex items-center gap-1">
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
        Retour
      </button>

      <h1 className="text-3xl md:text-4xl font-bold text-white mb-4 leading-tight">
        Formulaire 3916-bis : comment declarer ses comptes crypto a l'etranger (2026)
      </h1>
      <p className="text-gray-400 mb-2">Mis a jour en avril 2026</p>
      <p className="text-sm text-gray-500 mb-8">Temps de lecture : 5 minutes</p>

      <article className="space-y-10 text-gray-300 leading-relaxed">

        <section>
          <p>
            Si vous avez un compte sur Coinbase, Kraken, KuCoin ou tout autre
            exchange non enregistre en France, vous devez le declarer aux impots
            via le formulaire 3916-bis. Meme si le solde est a zero. Meme si
            vous n'avez fait aucune transaction dans l'annee.
          </p>
          <Callout type="warning">
            L'amende pour un compte non declare est de <strong>750 EUR par compte</strong>.
            Si le solde du compte depasse 50 000 EUR, l'amende passe a <strong>1 500 EUR</strong>.
            Ces amendes se cumulent : 3 comptes non declares = 2 250 EUR minimum.
          </Callout>
        </section>

        {/* Sommaire */}
        <nav className="p-5 rounded-xl bg-gray-800/50 border border-gray-700">
          <p className="text-sm font-semibold text-white mb-3">Sommaire</p>
          <ol className="space-y-2 text-sm text-blue-400">
            <li><a href="#qui-declare" className="hover:underline">1. Qui doit remplir le 3916-bis ?</a></li>
            <li><a href="#quels-comptes" className="hover:underline">2. Quels comptes declarer ?</a></li>
            <li><a href="#comment" className="hover:underline">3. Comment remplir le formulaire</a></li>
            <li><a href="#ou" className="hover:underline">4. Ou trouver le formulaire</a></li>
            <li><a href="#sanctions" className="hover:underline">5. Sanctions en cas d'oubli</a></li>
            <li><a href="#faq3916" className="hover:underline">6. FAQ</a></li>
          </ol>
        </nav>

        {/* Section 1 */}
        <section id="qui-declare">
          <H2>1. Qui doit remplir le 3916-bis ?</H2>
          <p>
            Tout resident fiscal francais qui a ouvert, detenu, utilise ou
            cloture un compte d'actifs numeriques aupres d'un organisme
            etabli hors de France.
          </p>
          <p className="mt-3">
            En pratique : si vous avez un compte sur un exchange dont le siege
            n'est pas en France, vous devez le declarer. Et ce, meme si :
          </p>
          <ul className="space-y-2 ml-1 mt-2">
            <Li>Le solde du compte est de 0 EUR</Li>
            <Li>Vous n'avez fait aucune transaction dans l'annee</Li>
            <Li>Le compte est inactif ou ferme</Li>
            <Li>Vous n'avez jamais retire de fonds</Li>
          </ul>
          <Callout type="info">
            La declaration est obligatoire pour chaque annee ou le compte etait ouvert,
            meme si vous l'avez ouvert et ferme la meme annee.
          </Callout>
        </section>

        {/* Section 2 */}
        <section id="quels-comptes">
          <H2>2. Quels comptes declarer ?</H2>

          <H3>A declarer (3916-bis obligatoire)</H3>
          <div className="mt-3 rounded-lg border border-gray-700 overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-gray-800">
                <tr>
                  <th className="px-4 py-3 text-left text-gray-400">Plateforme</th>
                  <th className="px-4 py-3 text-left text-gray-400">Pays</th>
                  <th className="px-4 py-3 text-center text-gray-400">3916-bis</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800">
                <ExchangeRow name="Kraken" country="USA" required />
                <ExchangeRow name="Coinbase" country="USA (Irlande pour l'UE)" required />
                <ExchangeRow name="KuCoin" country="Seychelles" required />
                <ExchangeRow name="Bybit" country="Emirats arabes unis" required />
                <ExchangeRow name="OKX" country="Seychelles" required />
                <ExchangeRow name="Bitfinex" country="Iles Vierges" required />
                <ExchangeRow name="Gate.io" country="Iles Caimans" required />
                <ExchangeRow name="Crypto.com" country="Singapour" required />
              </tbody>
            </table>
          </div>

          <H3>Pas besoin de declarer</H3>
          <div className="mt-3 rounded-lg border border-gray-700 overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-gray-800">
                <tr>
                  <th className="px-4 py-3 text-left text-gray-400">Plateforme</th>
                  <th className="px-4 py-3 text-left text-gray-400">Raison</th>
                  <th className="px-4 py-3 text-center text-gray-400">3916-bis</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800">
                <tr>
                  <td className="px-4 py-2 text-gray-300">Binance France (SAS)</td>
                  <td className="px-4 py-2 text-gray-400">Enregistre PSAN en France</td>
                  <td className="px-4 py-2 text-center text-emerald-400">Non</td>
                </tr>
                <tr>
                  <td className="px-4 py-2 text-gray-300">Coinhouse</td>
                  <td className="px-4 py-2 text-gray-400">Enregistre PSAN en France</td>
                  <td className="px-4 py-2 text-center text-emerald-400">Non</td>
                </tr>
                <tr>
                  <td className="px-4 py-2 text-gray-300">Paymium</td>
                  <td className="px-4 py-2 text-gray-400">Enregistre PSAN en France</td>
                  <td className="px-4 py-2 text-center text-emerald-400">Non</td>
                </tr>
                <tr>
                  <td className="px-4 py-2 text-gray-300">Meria (ex-Just Mining)</td>
                  <td className="px-4 py-2 text-gray-400">Enregistre PSAN en France</td>
                  <td className="px-4 py-2 text-center text-emerald-400">Non</td>
                </tr>
                <tr>
                  <td className="px-4 py-2 text-gray-300">Ledger, Trezor</td>
                  <td className="px-4 py-2 text-gray-400">Wallets self-custody</td>
                  <td className="px-4 py-2 text-center text-emerald-400">Non</td>
                </tr>
                <tr>
                  <td className="px-4 py-2 text-gray-300">MetaMask</td>
                  <td className="px-4 py-2 text-gray-400">Wallet self-custody</td>
                  <td className="px-4 py-2 text-center text-emerald-400">Non</td>
                </tr>
                <tr>
                  <td className="px-4 py-2 text-gray-300">Uniswap, Aave, etc.</td>
                  <td className="px-4 py-2 text-gray-400">Protocoles decentralises</td>
                  <td className="px-4 py-2 text-center text-emerald-400">Non</td>
                </tr>
              </tbody>
            </table>
          </div>

          <Callout type="warning">
            <strong>Attention a Binance :</strong> Seul Binance France (SAS), enregistre
            PSAN, est dispense. Si votre compte est lie a Binance.com (entite internationale)
            et pas a l'entite francaise, vous devez declarer. Verifiez dans les parametres
            de votre compte a quelle entite vous etes rattache.
          </Callout>
        </section>

        {/* Section 3 */}
        <section id="comment">
          <H2>3. Comment remplir le formulaire</H2>
          <p>
            Vous devez remplir un formulaire 3916-bis par compte. Voici les
            informations demandees :
          </p>

          <div className="mt-4 space-y-3">
            <FormField label="Designation de l'organisme" example="Kraken (Payward Ltd)" />
            <FormField label="Adresse de l'organisme" example="Suite 4000, 237 Kearny Street, San Francisco, CA 94108, USA" />
            <FormField label="Numero de compte" example="Votre identifiant client / User ID sur la plateforme" />
            <FormField label="Date d'ouverture" example="La date a laquelle vous avez cree le compte" />
            <FormField label="Date de cloture" example="Si vous avez ferme le compte dans l'annee (sinon laissez vide)" />
            <FormField label="Pays" example="Le pays du siege de la plateforme" />
          </div>

          <Callout type="info">
            <strong>Ou trouver votre numero de compte ?</strong> Sur Kraken : Settings &gt;
            Account. Sur Coinbase : Settings &gt; Account details. Sur KuCoin :
            votre UID visible en haut a droite.
          </Callout>
        </section>

        {/* Section 4 */}
        <section id="ou">
          <H2>4. Ou trouver le formulaire</H2>
          <p>
            Le formulaire 3916-bis est accessible directement depuis votre
            espace personnel sur impots.gouv.fr :
          </p>
          <ol className="space-y-2 ml-1 mt-3">
            <Li>Connectez-vous a impots.gouv.fr</Li>
            <Li>Allez dans "Declarer" &gt; "Declaration en ligne"</Li>
            <Li>A l'etape 3 ("Revenus et charges"), cochez la case "Comptes a l'etranger, comptes d'actifs numeriques"</Li>
            <Li>Le formulaire 3916-bis apparaitra dans les annexes</Li>
            <Li>Remplissez un formulaire par compte</Li>
          </ol>
          <p className="mt-3">
            Le formulaire papier (cerfa 3916) est aussi disponible sur
            impots.gouv.fr dans la rubrique "Formulaires".
          </p>
        </section>

        {/* Section 5 */}
        <section id="sanctions">
          <H2>5. Sanctions en cas d'oubli</H2>
          <div className="mt-4 rounded-lg border border-gray-700 overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-gray-800">
                <tr>
                  <th className="px-4 py-3 text-left text-gray-400">Situation</th>
                  <th className="px-4 py-3 text-right text-gray-400">Amende</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800">
                <tr>
                  <td className="px-4 py-2 text-gray-300">Compte non declare (solde &lt; 50 000 EUR)</td>
                  <td className="px-4 py-2 text-right text-red-400 font-medium">750 EUR / compte</td>
                </tr>
                <tr>
                  <td className="px-4 py-2 text-gray-300">Compte non declare (solde &gt; 50 000 EUR)</td>
                  <td className="px-4 py-2 text-right text-red-400 font-medium">1 500 EUR / compte</td>
                </tr>
                <tr>
                  <td className="px-4 py-2 text-gray-300">Exemple : 3 comptes non declares (&lt; 50K)</td>
                  <td className="px-4 py-2 text-right text-red-400 font-medium">2 250 EUR</td>
                </tr>
                <tr>
                  <td className="px-4 py-2 text-gray-300">Recidive ou fraude deliberee</td>
                  <td className="px-4 py-2 text-right text-red-400 font-medium">Jusqu'a 10 000 EUR + majoration</td>
                </tr>
              </tbody>
            </table>
          </div>
          <p className="mt-3 text-sm">
            Ces amendes s'appliquent par compte et par annee de non-declaration.
            Si vous avez oublie de declarer un compte les 3 dernieres annees,
            l'amende peut atteindre 2 250 EUR pour un seul compte.
          </p>
          <Callout type="info">
            <strong>Regularisation possible :</strong> Si vous avez oublie de declarer
            un compte les annees precedentes, vous pouvez faire une declaration
            rectificative. L'administration fiscale est generalement plus clemente
            en cas de regularisation spontanee qu'en cas de controle.
          </Callout>
        </section>

        {/* FAQ */}
        <section id="faq3916">
          <H2>6. Questions frequentes</H2>
          <div className="space-y-4 mt-4">
            <FAQ q="Je n'ai plus de crypto sur mon compte Kraken, je dois quand meme declarer ?" a="Oui. Tant que le compte est ouvert (non cloture), il doit etre declare, meme avec un solde a zero." />
            <FAQ q="Mon compte Binance est-il concerne ?" a="Ca depend. Si vous etes sur Binance France (SAS, enregistre PSAN), non. Si votre compte est rattache a l'entite internationale (Binance.com), oui." />
            <FAQ q="MetaMask doit-il etre declare ?" a="Non. MetaMask est un wallet self-custody, pas un compte chez un organisme tiers. Les wallets personnels (Ledger, Trezor, MetaMask) ne sont pas concernes par le 3916-bis." />
            <FAQ q="Je dois declarer mon compte meme si je n'ai fait aucune transaction ?" a="Oui. L'obligation de declaration porte sur la detention du compte, pas sur l'activite." />
            <FAQ q="Combien de formulaires 3916-bis dois-je remplir ?" a="Un par compte. Si vous avez un compte Kraken et un compte Coinbase, vous remplissez deux formulaires." />
            <FAQ q="J'ai oublie de declarer les annees precedentes, que faire ?" a="Faites une declaration rectificative le plus vite possible. La regularisation spontanee est vue favorablement par l'administration." />
          </div>
        </section>

        {/* CTA */}
        <section className="p-8 rounded-xl bg-gradient-to-br from-blue-900/30 to-blue-800/10 border border-blue-700/30 text-center">
          <h2 className="text-xl font-bold text-white mb-3">
            Le 3916-bis c'est fait. Passez aux plus-values.
          </h2>
          <p className="text-gray-400 text-sm mb-5 max-w-md mx-auto">
            Calculez vos plus-values crypto pour le formulaire 2086.
            Gratuit, sans inscription, 100% dans votre navigateur.
          </p>
          <button onClick={onGoToTool} className="px-8 py-3 rounded-lg bg-blue-600 text-white font-medium hover:bg-blue-500 transition-colors">
            Calculer mes impots crypto
          </button>
        </section>
      </article>

      <p className="text-xs text-gray-700 mt-8">Derniere mise a jour : avril 2026</p>
    </div>
  );
}

function H2({ children }: { children: React.ReactNode }) {
  return <h2 className="text-xl font-bold text-white mb-3">{children}</h2>;
}

function H3({ children }: { children: React.ReactNode }) {
  return <h3 className="text-base font-semibold text-gray-200 mt-5 mb-2">{children}</h3>;
}

function Li({ children }: { children: React.ReactNode }) {
  return <li className="flex gap-2"><span className="text-blue-400 mt-1 shrink-0">-</span><span>{children}</span></li>;
}

function Callout({ type, children }: { type: 'info' | 'warning'; children: React.ReactNode }) {
  const styles = { info: 'bg-blue-900/20 border-blue-700/40 text-blue-300', warning: 'bg-amber-900/20 border-amber-700/40 text-amber-300' };
  return <div className={`mt-4 p-4 rounded-lg border text-sm ${styles[type]}`}>{children}</div>;
}

function ExchangeRow({ name, country, required }: { name: string; country: string; required?: boolean }) {
  return (
    <tr>
      <td className="px-4 py-2 text-gray-300 font-medium">{name}</td>
      <td className="px-4 py-2 text-gray-400">{country}</td>
      <td className={`px-4 py-2 text-center font-medium ${required ? 'text-red-400' : 'text-emerald-400'}`}>
        {required ? 'Oui' : 'Non'}
      </td>
    </tr>
  );
}

function FormField({ label, example }: { label: string; example: string }) {
  return (
    <div className="p-3 rounded-lg bg-gray-800/50 border border-gray-700">
      <p className="text-sm font-medium text-white">{label}</p>
      <p className="text-xs text-gray-500 mt-1">Exemple : {example}</p>
    </div>
  );
}

function FAQ({ q, a }: { q: string; a: string }) {
  return (
    <div className="p-4 rounded-lg bg-gray-800/30 border border-gray-700/50">
      <p className="font-medium text-white text-sm">{q}</p>
      <p className="text-sm text-gray-400 mt-2">{a}</p>
    </div>
  );
}
