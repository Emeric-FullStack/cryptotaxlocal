import { legalConfig } from '../../config/legal';

interface Props {
  onBack: () => void;
}

/**
 * Politique de confidentialite — RGPD (Reglement UE 2016/679)
 *
 * Les informations personnelles sont injectees via des variables d'environnement.
 * Voir .env.example pour la configuration.
 */
export default function PolitiqueConfidentialite({ onBack }: Props) {
  return (
    <div className="max-w-3xl mx-auto">
      <button onClick={onBack} className="text-sm text-blue-400 hover:text-blue-300 mb-6 flex items-center gap-1">
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
        Retour
      </button>

      <h1 className="text-2xl font-bold text-white mb-8">Politique de confidentialite</h1>

      <div className="space-y-8 text-sm text-gray-300 leading-relaxed">
        <Section title="1. Responsable du traitement">
          <p>
            Le responsable du traitement des donnees est :<br />
            <strong className="text-white">{legalConfig.name}</strong> — {legalConfig.businessName} (entrepreneur individuel)<br />
            SIRET : {legalConfig.siret}<br />
            Email : {legalConfig.email}
          </p>
        </Section>

        <Section title="2. Principe fondamental : aucune collecte de donnees">
          <p>
            <strong className="text-white">CryptoTaxLocal ne collecte, ne stocke et ne transmet aucune
            donnee personnelle.</strong>
          </p>
          <p className="mt-2">
            L'ensemble des calculs s'effectue integralement dans votre navigateur
            web (cote client). Vos fichiers CSV, vos transactions, vos resultats
            fiscaux et toute autre information que vous saisissez ne quittent
            jamais votre appareil.
          </p>
          <p className="mt-2">
            Aucune donnee n'est envoyee a nos serveurs, a des tiers, ou a des
            services d'analyse. Il n'existe aucune base de donnees utilisateur.
          </p>
        </Section>

        <Section title="3. Cookies et traceurs">
          <p>
            <strong className="text-white">CryptoTaxLocal n'utilise aucun cookie</strong> a des fins
            de suivi, de publicite ou d'analyse.
          </p>
          <p className="mt-2">
            Notre hebergeur Cloudflare peut deposer des cookies techniques
            strictement necessaires au fonctionnement et a la securite du site
            (protection DDoS, routage CDN). Ces cookies sont consideres comme
            essentiels au sens de l'article 82 de la loi Informatique et Libertes
            et ne necessitent pas de consentement prealable.
          </p>
          <div className="mt-3 p-3 rounded bg-gray-800 border border-gray-700">
            <p className="text-xs text-gray-400">
              <strong>Cookies Cloudflare potentiels :</strong><br />
              <code className="text-gray-300">__cf_bm</code> — Protection anti-bot (30 min)<br />
              <code className="text-gray-300">__cflb</code> — Routage load balancer (24h)
            </p>
          </div>
        </Section>

        <Section title="4. Stockage local dans le navigateur">
          <p>
            L'application peut utiliser le stockage local de votre navigateur
            (localStorage, Origin Private File System) pour sauvegarder
            temporairement vos donnees entre deux sessions. Ces donnees :
          </p>
          <ul className="mt-2 space-y-1 ml-4">
            <li>— Restent exclusivement sur votre appareil</li>
            <li>— Ne sont jamais transmises a un serveur</li>
            <li>— Peuvent etre supprimees a tout moment via les parametres de votre navigateur</li>
            <li>— Sont automatiquement supprimees si vous effacez les donnees du site</li>
          </ul>
        </Section>

        <Section title="5. Liens externes et affiliations">
          <p>
            Le site peut contenir des liens vers des services tiers (exchanges,
            outils fiscaux, etc.). Ces sites tiers ont leurs propres politiques
            de confidentialite sur lesquelles nous n'avons aucun controle.
          </p>
          <p className="mt-2">
            Certains liens peuvent etre des liens d'affiliation. Le cas echeant,
            cela sera clairement indique. Le clic sur un lien d'affiliation ne
            transmet aucune de vos donnees depuis CryptoTaxLocal vers le site tiers.
          </p>
        </Section>

        <Section title="6. Vos droits (RGPD)">
          <p>
            Conformement au Reglement General sur la Protection des Donnees
            (UE 2016/679) et a la loi Informatique et Libertes, vous disposez
            des droits suivants :
          </p>
          <ul className="mt-2 space-y-1 ml-4">
            <li>— <strong className="text-white">Droit d'acces :</strong> Puisqu'aucune donnee n'est collectee, il n'y a rien a communiquer.</li>
            <li>— <strong className="text-white">Droit de rectification :</strong> Non applicable (aucune donnee stockee).</li>
            <li>— <strong className="text-white">Droit a l'effacement :</strong> Vos donnees locales peuvent etre supprimees via les parametres de votre navigateur.</li>
            <li>— <strong className="text-white">Droit a la portabilite :</strong> L'export PDF constitue votre portabilite de donnees.</li>
            <li>— <strong className="text-white">Droit d'opposition :</strong> Aucun traitement automatise n'est effectue sur vos donnees.</li>
          </ul>
          <p className="mt-3">
            Pour toute question relative a vos donnees, contactez : {legalConfig.email}
          </p>
        </Section>

        <Section title="7. Autorite de controle">
          <p>
            Si vous estimez que vos droits ne sont pas respectes, vous pouvez
            introduire une reclamation aupres de la CNIL :<br />
            <a href="https://www.cnil.fr" target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline">www.cnil.fr</a> —
            3 Place de Fontenoy, TSA 80715, 75334 Paris Cedex 07
          </p>
        </Section>

        <Section title="8. Securite">
          <p>
            Le site est servi exclusivement en HTTPS via Cloudflare.
            Aucune donnee sensible ne transite par le reseau puisque tous
            les calculs sont effectues localement. Le code source est
            public et auditable sur GitHub.
          </p>
        </Section>

        <Section title="9. Modifications">
          <p>
            Cette politique peut etre mise a jour. La date de derniere
            modification est indiquee ci-dessous. En cas de changement
            significatif, un avis sera affiche sur le site.
          </p>
        </Section>
      </div>

      <p className="text-xs text-gray-600 mt-12">Derniere mise a jour : avril 2026</p>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h2 className="text-lg font-semibold text-white mb-3">{title}</h2>
      {children}
    </div>
  );
}
