import { legalConfig } from '../../config/legal';

interface Props {
  onBack: () => void;
}

/**
 * Mentions legales — obligatoires en France (LCEN, article 6)
 *
 * Les informations personnelles sont injectees via des variables d'environnement.
 * Voir .env.example pour la configuration.
 */
export default function MentionsLegales({ onBack }: Props) {
  return (
    <div className="max-w-3xl mx-auto">
      <button onClick={onBack} className="text-sm text-blue-400 hover:text-blue-300 mb-6 flex items-center gap-1">
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
        Retour
      </button>

      <h1 className="text-2xl font-bold text-white mb-8">Mentions legales</h1>

      <div className="space-y-8 text-sm text-gray-300 leading-relaxed">
        <Section title="1. Editeur du site">
          <p>Le site CryptoTaxLocal est edite par :</p>
          <p className="mt-2">
            <strong className="text-white">{legalConfig.name}</strong><br />
            Entrepreneur individuel — {legalConfig.businessName}<br />
            SIRET : {legalConfig.siret}<br />
            {legalConfig.address}<br />
            Email : {legalConfig.email}
          </p>
        </Section>

        <Section title="2. Hebergement">
          <p>
            Ce site est heberge par :<br />
            <strong className="text-white">Cloudflare, Inc.</strong><br />
            101 Townsend St, San Francisco, CA 94107, USA<br />
            Site web : <a href="https://www.cloudflare.com" target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline">cloudflare.com</a>
          </p>
        </Section>

        <Section title="3. Directeur de la publication">
          <p>{legalConfig.name}, en qualite d'editeur du site.</p>
        </Section>

        <Section title="4. Propriete intellectuelle">
          <p>
            Le code source de CryptoTaxLocal est distribue sous licence MIT.
            Le contenu redactionnel (textes, guides, articles) reste la propriete
            de l'editeur et ne peut etre reproduit sans autorisation.
          </p>
        </Section>

        <Section title="5. Limitation de responsabilite">
          <p>
            CryptoTaxLocal est un outil d'estimation fiscale fourni a titre indicatif.
            Il ne constitue en aucun cas un conseil fiscal, juridique ou financier.
            Les calculs sont bases sur les regles fiscales francaises en vigueur au
            moment du developpement et peuvent ne pas refleter les dernieres
            modifications legislatives.
          </p>
          <p className="mt-2">
            L'editeur ne saurait etre tenu responsable des erreurs de calcul,
            des inexactitudes dans les resultats, ou des consequences directes ou
            indirectes de l'utilisation de cet outil, notamment en matiere de
            declaration fiscale. L'utilisateur est invite a consulter un
            expert-comptable ou un conseiller fiscal pour toute declaration officielle.
          </p>
        </Section>

        <Section title="6. Donnees personnelles">
          <p>
            Aucune donnee personnelle n'est collectee par CryptoTaxLocal.
            L'ensemble des traitements s'effectue localement dans le navigateur
            de l'utilisateur. Voir notre{' '}
            <button onClick={onBack} className="text-blue-400 hover:underline">
              Politique de confidentialite
            </button>{' '}
            pour plus de details.
          </p>
        </Section>

        <Section title="7. Droit applicable">
          <p>
            Les presentes mentions legales sont regies par le droit francais.
            En cas de litige, les tribunaux francais seront seuls competents.
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
