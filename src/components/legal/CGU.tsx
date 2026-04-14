interface Props {
  onBack: () => void;
}

/**
 * Conditions Generales d'Utilisation
 */
export default function CGU({ onBack }: Props) {
  return (
    <div className="max-w-3xl mx-auto">
      <button onClick={onBack} className="text-sm text-blue-400 hover:text-blue-300 mb-6 flex items-center gap-1">
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
        Retour
      </button>

      <h1 className="text-2xl font-bold text-white mb-8">Conditions generales d'utilisation</h1>

      <div className="space-y-8 text-sm text-gray-300 leading-relaxed">
        <Section title="1. Objet">
          <p>
            Les presentes Conditions Generales d'Utilisation (CGU) regissent
            l'acces et l'utilisation du site CryptoTaxLocal et de ses services
            de calcul fiscal pour les actifs numeriques.
          </p>
          <p className="mt-2">
            En utilisant le site, vous acceptez les presentes CGU dans leur
            integralite. Si vous n'acceptez pas ces conditions, veuillez ne
            pas utiliser le service.
          </p>
        </Section>

        <Section title="2. Description du service">
          <p>
            CryptoTaxLocal est un outil gratuit d'estimation fiscale pour les
            plus-values sur actifs numeriques (cryptomonnaies). Le service
            permet :
          </p>
          <ul className="mt-2 space-y-1 ml-4">
            <li>— L'import de fichiers CSV d'historique de transactions</li>
            <li>— Le calcul automatique des plus-values et moins-values (formule Art. 150 VH bis)</li>
            <li>— L'estimation de l'impot selon la fiscalite francaise</li>
            <li>— L'export d'un rapport au format PDF</li>
          </ul>
          <p className="mt-2">
            L'ensemble des traitements s'effectue localement dans votre
            navigateur. Aucune donnee n'est transmise a un serveur.
          </p>
        </Section>

        <Section title="3. Nature indicative des resultats">
          <p className="p-3 rounded bg-amber-900/20 border border-amber-700/50 text-amber-300">
            <strong>IMPORTANT :</strong> Les resultats fournis par CryptoTaxLocal
            sont des estimations a titre indicatif. Ils ne constituent en aucun
            cas un conseil fiscal, juridique ou financier, et ne sauraient se
            substituer a l'avis d'un professionnel qualifie (expert-comptable,
            conseiller fiscal).
          </p>
          <p className="mt-3">
            Les calculs sont bases sur :
          </p>
          <ul className="mt-2 space-y-1 ml-4">
            <li>— La formule de l'article 150 VH bis du CGI (PA global decremente)</li>
            <li>— Les taux de change simplifies (non historiques)</li>
            <li>— Les regles fiscales francaises connues au moment du developpement</li>
          </ul>
          <p className="mt-2">
            L'editeur ne garantit pas l'exactitude, l'exhaustivite ou
            l'actualite des calculs. L'utilisateur reste seul responsable
            de sa declaration fiscale.
          </p>
        </Section>

        <Section title="4. Responsabilite de l'utilisateur">
          <p>L'utilisateur s'engage a :</p>
          <ul className="mt-2 space-y-1 ml-4">
            <li>— Verifier les resultats avant toute utilisation officielle</li>
            <li>— Ne pas se fier exclusivement a cet outil pour sa declaration fiscale</li>
            <li>— Consulter un professionnel en cas de doute</li>
            <li>— Utiliser le service conformement aux lois en vigueur</li>
          </ul>
        </Section>

        <Section title="5. Limitation de responsabilite">
          <p>
            Dans les limites autorisees par la loi, l'editeur ne pourra etre
            tenu responsable :
          </p>
          <ul className="mt-2 space-y-1 ml-4">
            <li>— Des erreurs ou inexactitudes dans les calculs</li>
            <li>— Des consequences financieres, fiscales ou juridiques liees a l'utilisation des resultats</li>
            <li>— Des dommages directs ou indirects resultant de l'utilisation du service</li>
            <li>— Des interruptions temporaires du service</li>
            <li>— De l'incompatibilite avec certains navigateurs ou appareils</li>
          </ul>
        </Section>

        <Section title="6. Propriete intellectuelle">
          <p>
            Le code source de l'application est distribue sous licence MIT
            et est disponible sur GitHub. Le contenu redactionnel (textes,
            guides, articles de blog) reste la propriete de l'editeur.
          </p>
        </Section>

        <Section title="7. Disponibilite du service">
          <p>
            L'editeur s'efforce de maintenir le service accessible, mais ne
            garantit pas une disponibilite permanente. Le service peut etre
            interrompu pour maintenance, mise a jour, ou en cas de force majeure.
          </p>
        </Section>

        <Section title="8. Modification des CGU">
          <p>
            L'editeur se reserve le droit de modifier les presentes CGU.
            Les utilisateurs seront informes des modifications significatives
            par un avis sur le site. La poursuite de l'utilisation du service
            apres modification vaut acceptation des nouvelles CGU.
          </p>
        </Section>

        <Section title="9. Droit applicable et juridiction">
          <p>
            Les presentes CGU sont regies par le droit francais.
            En cas de litige, et apres tentative de resolution amiable,
            les tribunaux francais seront seuls competents.
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
