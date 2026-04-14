interface Props {
  onBack: () => void;
  onGoToTool: () => void;
}

/**
 * Article SEO : Comparatif outils fiscaux crypto France 2026
 *
 * Mots-cles cibles :
 * - "meilleur outil impot crypto"
 * - "koinly vs waltio"
 * - "comparatif logiciel fiscal crypto"
 * - "outil declaration crypto gratuit"
 * - "alternative koinly gratuite"
 */
export default function ComparatifOutils({ onBack, onGoToTool }: Props) {
  return (
    <div className="max-w-3xl mx-auto">
      <button onClick={onBack} className="text-sm text-blue-400 hover:text-blue-300 mb-6 flex items-center gap-1">
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
        Retour
      </button>

      <h1 className="text-3xl md:text-4xl font-bold text-white mb-4 leading-tight">
        Koinly vs Waltio vs CryptoTaxLocal : quel outil pour declarer ses cryptos en 2026 ?
      </h1>
      <p className="text-gray-400 mb-2">Mis a jour en avril 2026</p>
      <p className="text-sm text-gray-500 mb-8">Temps de lecture : 6 minutes</p>

      <article className="space-y-10 text-gray-300 leading-relaxed">

        {/* Intro */}
        <section>
          <p>
            La saison fiscale est la, et si vous avez des cryptos a declarer,
            vous avez le choix entre une dizaine d'outils. Le probleme : la
            plupart sont payants, en anglais, et vous obligent a uploader vos
            transactions sur leurs serveurs.
          </p>
          <p className="mt-3">
            On a compare les trois options les plus pertinentes pour un
            contribuable francais en 2026 : Koinly (le leader international),
            Waltio (le specialiste francais), et CryptoTaxLocal (l'alternative
            gratuite et locale).
          </p>
        </section>

        {/* Tableau comparatif principal */}
        <section>
          <H2>Comparatif en un coup d'oeil</H2>
          <div className="mt-4 rounded-lg border border-gray-700 overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-800">
                <tr>
                  <th className="px-4 py-3 text-left text-gray-400"></th>
                  <th className="px-4 py-3 text-center text-gray-400">Koinly</th>
                  <th className="px-4 py-3 text-center text-gray-400">Waltio</th>
                  <th className="px-4 py-3 text-center text-blue-400">CryptoTaxLocal</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800">
                <Row label="Prix" v1="49 - 199 $/an" v2="39 - 999 EUR/an" v3="Gratuit" highlight />
                <Row label="Inscription requise" v1="Oui" v2="Oui" v3="Non" highlight />
                <Row label="Donnees sur serveur" v1="Oui (cloud)" v2="Oui (cloud)" v3="Non (local)" highlight />
                <Row label="Open source" v1="Non" v2="Non" v3="Oui" highlight />
                <Row label="Fiscal France" v1="Oui" v2="Oui (specialiste)" v3="Oui" />
                <Row label="PFU 31,4% (2026)" v1="Oui" v2="Oui" v3="Oui" />
                <Row label="Formulaire 2086" v1="Oui" v2="Oui" v3="Oui" />
                <Row label="Exchanges supportes" v1="700+" v2="200+" v3="3 (Binance, Kraken, Coinbase)" />
                <Row label="Import API" v1="Oui" v2="Oui" v3="Non (CSV)" />
                <Row label="DeFi / NFT" v1="Oui" v2="Oui" v3="Non (prevu)" />
                <Row label="Support client" v1="Email + chat" v2="Email + chat FR" v3="GitHub issues" />
                <Row label="PWA / Hors-ligne" v1="Non" v2="Non" v3="Oui" />
                <Row label="Export PDF" v1="Oui (payant)" v2="Oui (payant)" v3="Oui (gratuit)" />
              </tbody>
            </table>
          </div>
        </section>

        {/* Koinly */}
        <section>
          <H2>Koinly : le leader mondial</H2>
          <p>
            Koinly est l'outil le plus complet du marche. Il supporte plus de
            700 exchanges et wallets, gere le DeFi, le staking, les NFTs, et
            propose des rapports fiscaux pour une vingtaine de pays dont la France.
          </p>
          <H3>Points forts</H3>
          <ul className="space-y-2 ml-1">
            <Li>Enorme nombre d'integrations (API + CSV)</Li>
            <Li>Support DeFi, NFT, staking, mining</Li>
            <Li>Interface claire et bien traduite</Li>
            <Li>Detection automatique des transferts entre wallets</Li>
          </ul>
          <H3>Points faibles</H3>
          <ul className="space-y-2 ml-1">
            <Li>Payant des qu'on veut un rapport fiscal (a partir de 49 $)</Li>
            <Li>Les donnees sont sur leurs serveurs (cloud)</Li>
            <Li>Le plan gratuit est frustrant : on voit le resultat mais pas le PDF</Li>
            <Li>Entreprise basee en dehors de France</Li>
          </ul>
          <PriceTag plans={[
            { name: 'Newbie', price: '49 $/an', detail: '100 transactions' },
            { name: 'Hodler', price: '99 $/an', detail: '1 000 transactions' },
            { name: 'Trader', price: '199 $/an', detail: '3 000+ transactions' },
            { name: 'Gratuit', price: '0 $', detail: 'Limite (pas de PDF)' },
          ]} />
          <p className="mt-3 text-sm text-gray-500">
            <em>Ideal pour : les traders actifs avec beaucoup d'exchanges et du DeFi.</em>
          </p>
        </section>

        {/* Waltio */}
        <section>
          <H2>Waltio : le specialiste francais</H2>
          <p>
            Waltio est la reference francaise. L'outil est concu specifiquement
            pour la fiscalite francaise et produit directement le formulaire 2086
            et le 3916-bis. Le support est en francais.
          </p>
          <H3>Points forts</H3>
          <ul className="space-y-2 ml-1">
            <Li>Concu pour la France (2086, 3916-bis)</Li>
            <Li>Support client en francais</Li>
            <Li>Bonne integration avec les exchanges principaux</Li>
            <Li>Partenariats avec des experts-comptables</Li>
          </ul>
          <H3>Points faibles</H3>
          <ul className="space-y-2 ml-1">
            <Li>Payant (a partir de 39 EUR pour 50 transactions)</Li>
            <Li>Moins d'integrations que Koinly</Li>
            <Li>Donnees hebergees sur leurs serveurs</Li>
            <Li>Le plan gratuit ne genere pas de rapport fiscal</Li>
          </ul>
          <PriceTag plans={[
            { name: 'Lite', price: '39 EUR/an', detail: '50 transactions' },
            { name: 'Starter', price: '99 EUR/an', detail: '1 000 transactions' },
            { name: 'Smart', price: '249 EUR/an', detail: '10 000 transactions' },
            { name: 'Unlimited', price: '999 EUR/an', detail: 'Illimite' },
          ]} />
          <p className="mt-3 text-sm text-gray-500">
            <em>Ideal pour : ceux qui veulent un produit francais avec un support humain.</em>
          </p>
        </section>

        {/* CryptoTaxLocal */}
        <section>
          <H2>CryptoTaxLocal : l'alternative gratuite et locale</H2>
          <p>
            CryptoTaxLocal prend le contre-pied des deux autres : tout est
            gratuit, tout tourne dans votre navigateur, et le code est open-source.
            Pas de compte, pas de serveur, pas de tracking.
          </p>
          <H3>Points forts</H3>
          <ul className="space-y-2 ml-1">
            <Li>100% gratuit, sans limite de transactions</Li>
            <Li>Aucune donnee envoyee a un serveur</Li>
            <Li>Open-source (code verifiable sur GitHub)</Li>
            <Li>PWA : fonctionne hors-ligne, installable sur mobile</Li>
            <Li>Export PDF gratuit avec aide formulaire 2086</Li>
          </ul>
          <H3>Points faibles</H3>
          <ul className="space-y-2 ml-1">
            <Li>Seulement 3 exchanges pour l'instant (Binance, Kraken, Coinbase)</Li>
            <Li>Pas de DeFi / NFT (prevu dans une prochaine version)</Li>
            <Li>Import CSV uniquement (pas d'API)</Li>
            <Li>Taux de change simplifies (pas de taux historiques au jour le jour)</Li>
            <Li>Pas de support client humain (GitHub issues)</Li>
          </ul>
          <div className="mt-4 p-4 rounded-lg bg-blue-900/20 border border-blue-700/40">
            <p className="text-blue-300 text-sm">
              <strong>Prix : gratuit.</strong> Pour toujours. Le code est open-source sous licence MIT.
            </p>
          </div>
          <p className="mt-3 text-sm text-gray-500">
            <em>Ideal pour : ceux qui ont un portefeuille simple (1-3 exchanges),
            qui valorisent leur vie privee, et qui ne veulent pas payer pour un PDF.</em>
          </p>
        </section>

        {/* Verdict */}
        <section>
          <H2>Notre verdict</H2>
          <div className="space-y-4 mt-4">
            <Verdict
              emoji="1."
              title="Vous avez un portefeuille simple (BTC, ETH, quelques altcoins)"
              text="CryptoTaxLocal suffit largement. Importez votre CSV, exportez votre PDF, c'est regle en 2 minutes et ca ne vous coute rien."
            />
            <Verdict
              emoji="2."
              title="Vous faites du DeFi, des NFTs, ou avez 10+ exchanges"
              text="Koinly est votre meilleur choix. Le nombre d'integrations et le support DeFi justifient le prix."
            />
            <Verdict
              emoji="3."
              title="Vous voulez un accompagnement humain en francais"
              text="Waltio est fait pour vous. Le support client francais et les partenariats experts-comptables sont un vrai plus."
            />
          </div>
        </section>

        {/* Affiliation Binance */}
        <section>
          <H2>Vous n'avez pas encore de compte exchange ?</H2>
          <a href="https://www.binance.com/activity/referral-entry/CPA?ref=CPA_00UHT5WR0G" target="_blank" rel="noopener noreferrer sponsored" className="block mt-4 p-4 rounded-lg bg-gray-800/50 border border-gray-700 hover:border-amber-600/50 transition-colors">
            <div className="flex items-center gap-3">
              <span className="text-amber-400 text-lg">&#8383;</span>
              <div>
                <p className="text-sm font-medium text-white">Binance — Creez un compte gratuitement</p>
                <p className="text-xs text-gray-500 mt-1">La plateforme la plus utilisee au monde. Enregistree PSAN en France (pas besoin de 3916-bis). Lien d'affiliation.</p>
              </div>
            </div>
          </a>
        </section>

        {/* CTA */}
        <section className="p-8 rounded-xl bg-gradient-to-br from-blue-900/30 to-blue-800/10 border border-blue-700/30 text-center">
          <h2 className="text-xl font-bold text-white mb-3">
            Essayez CryptoTaxLocal gratuitement
          </h2>
          <p className="text-gray-400 text-sm mb-5 max-w-md mx-auto">
            Importez votre CSV, obtenez votre rapport fiscal en 2 minutes.
            Gratuit, sans inscription, 100% dans votre navigateur.
          </p>
          <button onClick={onGoToTool} className="px-8 py-3 rounded-lg bg-blue-600 text-white font-medium hover:bg-blue-500 transition-colors">
            Lancer le calcul
          </button>
        </section>

        {/* FAQ SEO */}
        <section>
          <H2>Questions frequentes</H2>
          <div className="space-y-4 mt-4">
            <FAQ q="Koinly est-il fiable pour la fiscalite francaise ?" a="Oui, Koinly supporte la fiscalite francaise et genere le formulaire 2086. Cependant, verifiez toujours les resultats — aucun outil n'est infaillible." />
            <FAQ q="Waltio est-il mieux que Koinly pour la France ?" a="Waltio est specialise France avec un support en francais, ce qui est un avantage. Koinly a plus d'integrations. Le choix depend de vos besoins." />
            <FAQ q="Peut-on faire sa declaration crypto gratuitement ?" a="Oui. CryptoTaxLocal est entierement gratuit, y compris l'export PDF. Vous pouvez aussi faire le calcul manuellement avec un tableur, mais c'est fastidieux." />
            <FAQ q="Les donnees sont-elles en securite avec ces outils ?" a="Koinly et Waltio hebergent vos donnees sur leurs serveurs (cloud). CryptoTaxLocal est le seul outil ou vos donnees ne quittent jamais votre navigateur." />
          </div>
        </section>
      </article>

      <p className="text-xs text-gray-700 mt-8">
        Derniere mise a jour : avril 2026. Les prix affiches sont ceux constates sur les sites officiels de chaque outil.
      </p>
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
  return <li className="flex gap-2"><span className="text-blue-400 mt-1 shrink-0">-</span><span>{children}</span></li>;
}

function Row({ label, v1, v2, v3, highlight }: { label: string; v1: string; v2: string; v3: string; highlight?: boolean }) {
  return (
    <tr className={highlight ? 'bg-blue-900/10' : ''}>
      <td className="px-4 py-2 text-gray-400 font-medium">{label}</td>
      <td className="px-4 py-2 text-center text-gray-300">{v1}</td>
      <td className="px-4 py-2 text-center text-gray-300">{v2}</td>
      <td className={`px-4 py-2 text-center font-medium ${highlight ? 'text-emerald-400' : 'text-blue-300'}`}>{v3}</td>
    </tr>
  );
}

function PriceTag({ plans }: { plans: { name: string; price: string; detail: string }[] }) {
  return (
    <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-2">
      {plans.map((p) => (
        <div key={p.name} className="p-3 rounded-lg bg-gray-800/50 border border-gray-700 text-center">
          <p className="text-xs text-gray-500">{p.name}</p>
          <p className="text-sm font-semibold text-white mt-1">{p.price}</p>
          <p className="text-xs text-gray-500 mt-1">{p.detail}</p>
        </div>
      ))}
    </div>
  );
}

function Verdict({ emoji, title, text }: { emoji: string; title: string; text: string }) {
  return (
    <div className="p-4 rounded-lg bg-gray-800/50 border border-gray-700">
      <p className="font-medium text-white"><span className="text-blue-400 mr-2">{emoji}</span>{title}</p>
      <p className="text-sm text-gray-400 mt-1">{text}</p>
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
