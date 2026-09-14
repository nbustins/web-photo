import { FC, ReactNode } from 'react';
import { CONTACT_EMAIL } from '@components';

// Dades del titular: omplir abans de publicar. El text l'hauria de revisar un professional.
const OWNER = {
  name: 'Laura Trias',
  nif: '41649068R',
  address: 'C/blanes s/n, Vidreres',
  email: CONTACT_EMAIL,
};

const LegalLayout: FC<{ title: string; children: ReactNode }> = ({ title, children }) => (
  <article style={{ maxWidth: 'var(--lt-container-text)', margin: '0 auto', textAlign: 'left' }}>
    <h1>{title}</h1>
    {children}
  </article>
);

export const AvisLegalPage: FC = () => (
  <LegalLayout title="Avís legal">
    <p>
      En compliment de l'article 10 de la Llei 34/2002, de serveis de la societat de la informació i de
      comerç electrònic (LSSI-CE), s'informa de les dades del titular d'aquest lloc web:
    </p>
    <ul>
      <li>Titular: {OWNER.name}</li>
      <li>NIF: {OWNER.nif}</li>
      <li>Adreça: {OWNER.address}</li>
      <li>Email: {OWNER.email}</li>
      <li>Activitat: serveis de fotografia.</li>
    </ul>
    <h2>Propietat intel·lectual</h2>
    <p>
      Totes les fotografies i continguts d'aquest web són propietat de {OWNER.name}. Queda prohibida la
      seva reproducció, distribució o modificació sense autorització expressa.
    </p>
    <h2>Responsabilitat</h2>
    <p>
      El titular no es fa responsable de l'ús indegut dels continguts ni de la informació de webs de
      tercers enllaçades des d'aquest lloc.
    </p>
  </LegalLayout>
);

export const PrivacitatPage: FC = () => (
  <LegalLayout title="Política de privacitat">
    <h2>Responsable del tractament</h2>
    <p>{OWNER.name} · NIF {OWNER.nif} · {OWNER.address} · {OWNER.email}</p>

    <h2>Dades que recollim</h2>
    <p>
      Quan reserves una sessió: nom i cognoms, email, telèfon, DNI/NIE, adreça, nom i edat dels
      participants (inclosos menors) i la teva elecció sobre els drets d'imatge.
    </p>

    <h2>Finalitat i base legal</h2>
    <p>
      Gestionar la reserva, elaborar i signar el contracte de la sessió i comunicar-nos amb tu. La base
      legal és l'execució del contracte (art. 6.1.b RGPD). L'ús de les imatges amb finalitats
      promocionals només es fa amb el teu consentiment exprés (art. 6.1.a RGPD).
    </p>

    <h2>Conservació</h2>
    <p>
      Conservem les dades mentre duri la relació contractual i, després, durant els terminis legals
      obligatoris (fiscals i comptables).
    </p>

    <h2>Destinataris</h2>
    <p>
      No cedim dades a tercers, excepte obligació legal. Les dades s'allotgen en proveïdors
      d'infraestructura (Microsoft Azure, GitHub) que actuen com a encarregats del tractament.
    </p>

    <h2>Els teus drets</h2>
    <p>
      Pots exercir els drets d'accés, rectificació, supressió, oposició, limitació i portabilitat
      escrivint a {OWNER.email}. També pots presentar una reclamació a l'Autoritat Catalana de Protecció
      de Dades (apdcat.gencat.cat) o a l'Agència Espanyola de Protecció de Dades (aepd.es).
    </p>
  </LegalLayout>
);
