import { HttpResponse } from 'msw';
import type { ContractSection, ImageRightsConsent } from '../../services/booking/booking.api';

/**
 * The contract's legal text, copied from the API
 * (Modules/Booking/Services/ContractTemplate.cs). The API substitutes the %placeholder%
 * tokens server-side so the page and the PDF can never disagree; renderContractSections()
 * below is the mock's single substitution point, for the same reason.
 */
export const CONTRACT_TEMPLATE_VERSION = 'sessions-v1';

const PHOTOGRAPHER_NAME = 'Laura Trias Corredor';
const PHOTOGRAPHER_DNI = '41649068R';
const PHOTOGRAPHER_CITY = 'Vidreres';

const TEMPLATE_SECTIONS: ContractSection[] = [
  {
    title: '1. Parts',
    paragraphs: [
      `D'una banda, ${PHOTOGRAPHER_NAME} amb DNI ${PHOTOGRAPHER_DNI} i domicili a ${PHOTOGRAPHER_CITY}, d'ara endavant, la Fotògrafa.`,
      "I, de l'altra, %client_name%, amb DNI/NIE %client_document_number%, domiciliat/da a %client_address%, correu electrònic %client_email% i telèfon %client_phone%, actuant en nom propi i, si escau, com a representant legal dels menors que participaran en la sessió fotogràfica, d'ara endavant, el/la Client/a.",
      'Ambdues parts es reconeixen mútuament la capacitat legal necessària per formalitzar aquest contracte i,',
    ],
  },
  {
    title: 'MANIFESTEN',
    paragraphs: [
      "Que la Fotògrafa es dedica professionalment a la realització de reportatges fotogràfics d'embaràs, nounats, nadons i famílies.",
      "Que el/la Client/a manifesta el seu interès a contractar els serveis professionals de la Fotògrafa per a la realització d'una sessió fotogràfica, coneixent prèviament el seu estil de treball i acceptant les condicions establertes en aquest contracte.",
      "En conseqüència, ambdues parts acorden formalitzar el present contracte de prestació de serveis fotogràfics, que es regirà per les clàusules que s'exposen a continuació.",
    ],
  },
  {
    title: '2. Objecte del contracte',
    paragraphs: [
      "Aquest contracte té per objecte regular la prestació del servei fotogràfic contractat entre les parts, corresponent a una sessió %pack_name%. La data, l'hora, el lloc i les característiques del servei seran les que constin a la reserva efectuada.",
    ],
  },
  {
    title: '3. Reserva i pagament',
    paragraphs: [
      "La reserva de la sessió quedarà confirmada una vegada s'hagi abonat l'import establert en concepte de paga i senyal %pack_pay_prepaid%, quedant pendent %pack_pay_pending% que s'abonaran el dia de la sessió. Aquest import forma part del preu total del servei i garanteix la disponibilitat de la data reservada, motiu pel qual no serà reemborsable excepte en aquells casos previstos expressament en aquest contracte.",
      "La resta de l'import s'abonarà en la forma i dins el termini acordats entre les parts, i en qualsevol cas abans del lliurament de les fotografies.",
    ],
  },
  {
    title: '4. Canvis de data i cancel·lacions',
    paragraphs: [
      "Si el client necessita modificar la data de la sessió, haurà de comunicar-ho tan aviat com sigui possible. Sempre que la disponibilitat de l'agenda ho permeti, la sessió es podrà reprogramar sense cap cost addicional.",
      "En cas de malaltia de la mare, del nadó o d'algun dels participants principals de la sessió, la data es podrà modificar sense perdre l'import de la reserva.",
      'Si el client decideix cancel·lar definitivament la sessió o no es presenta el dia acordat sense causa justificada, la paga i senyal no serà retornada.',
      "En cas que la fotògrafa no pugui prestar el servei per motius de força major, s'oferirà una nova data. Si aquesta no fos possible, es retornarà íntegrament qualsevol import abonat.",
    ],
  },
  {
    title: '5. Desenvolupament de la sessió amb menors',
    paragraphs: [
      "La durada de la sessió és orientativa i pot variar en funció del ritme dels infants, de les necessitats del nadó o de qualsevol circumstància que pugui afectar el correcte desenvolupament del servei.",
      'En les sessions de nounat, la seguretat i el benestar del nadó prevaldran sempre per sobre de qualsevol fotografia. La fotògrafa adaptarà la sessió al ritme natural del nadó, respectant els seus temps de descans, alimentació i confort. En cap cas es realitzarà una postura o situació que pugui comprometre la seva seguretat.',
      'Els pares o tutors legals seran responsables dels menors durant tota la sessió i col·laboraran en tot moment perquè aquesta es desenvolupi de manera tranquil·la i segura.',
    ],
  },
  {
    title: '6. Estil fotogràfic i edició',
    paragraphs: [
      "El client manifesta conèixer l'estil fotogràfic i d'edició de la fotògrafa, havent consultat prèviament el seu treball. Les imatges seran editades seguint aquest estil, que forma part de la identitat artística del servei contractat.",
      "No es lliuraran fotografies sense editar ni arxius originals en format RAW. Tampoc s'inclouen modificacions que alterin substancialment l'aspecte físic de les persones o l'estil propi de la fotògrafa, llevat que s'hagin contractat expressament.",
    ],
  },
  {
    title: '7. Lliurament de les fotografies',
    paragraphs: [
      "Les fotografies es lliuraran en un termini d'una a dues setmanes i mitjançant una galeria privada en línia.",
      'El client és responsable de descarregar i conservar les seves fotografies. Tot i que la fotògrafa procurarà mantenir-ne una còpia de seguretat durant un període aproximat de sis mesos, no pot garantir-ne la conservació indefinida.',
    ],
  },
  {
    title: "8. Drets d'autor i ús de les fotografies",
    paragraphs: [
      "La fotògrafa conserva tots els drets d'autor sobre les fotografies realitzades, d'acord amb la legislació vigent.",
      "El client rep una llicència d'ús personal i privat de les imatges.",
      'No està permès: vendre les fotografies; cedir-les a tercers amb finalitats comercials; presentar-les a concursos sense autorització; modificar-les mitjançant filtres o edicions que alterin el treball original de la fotògrafa.',
    ],
  },
  {
    title: "9. Autorització d'ús d'imatge",
    paragraphs: [
      'El client autoritza la fotògrafa a utilitzar les fotografies únicament amb finalitats de promoció professional.',
      'Marqueu si AUTORITZA o NO AUTORITZA la publicació de les fotografies en xarxes socials i web de l\'estudi:',
      '%check_authorization%',
      'Aquesta autorització és totalment voluntària i la seva negativa no afectarà la qualitat del servei contractat.',
    ],
  },
  {
    title: '10. Protecció de dades',
    paragraphs: [
      "Les dades personals facilitades seran tractades exclusivament amb la finalitat de gestionar la reserva, prestar el servei contractat, emetre la corresponent factura i mantenir les comunicacions relacionades amb aquest servei.",
      "Aquest tractament es durà a terme de conformitat amb la normativa vigent en matèria de protecció de dades personals, i el client podrà exercir els seus drets d'accés, rectificació, supressió, oposició, limitació del tractament i portabilitat quan ho consideri oportú.",
    ],
  },
  {
    title: '11. Acceptació',
    paragraphs: [
      "Amb la signatura d'aquest document, les parts manifesten haver llegit íntegrament el seu contingut, comprendre'l i acceptar totes les condicions que s'hi estableixen, comprometent-se a complir-les de bona fe.",
      'I, en prova de conformitat, signen aquest contracte en la data indicada.',
    ],
  },
];

export const CHECK_AUTHORIZATION: Record<ImageRightsConsent, string> = {
  GrantAll: 'AUTORITZO la publicació de les fotografies, incloses les dels menors.',
  DenyAll: 'NO AUTORITZO la publicació de les fotografies.',
  GrantMineDenyMinors: 'AUTORITZO la publicació de les meves fotografies, però NO la de les dels menors.',
};

export function renderContractSections(values: Record<string, string>): ContractSection[] {
  const fill = (text: string) =>
    Object.entries(values).reduce((acc, [key, value]) => acc.split(`%${key}%`).join(value), text);

  return TEMPLATE_SECTIONS.map(section => ({
    title: section.title,
    paragraphs: section.paragraphs.map(fill),
  }));
}

/**
 * A minimal but valid one-page PDF, so the download path (apiGetBlob -> Blob) can be
 * exercised end to end without shipping a real document.
 */
export const CONTRACT_PDF_BASE64 =
  'JVBERi0xLjQKMSAwIG9iago8PC9UeXBlL0NhdGFsb2cvUGFnZXMgMiAwIFI+PgplbmRvYmoKMiAw' +
  'IG9iago8PC9UeXBlL1BhZ2VzL0tpZHNbMyAwIFJdL0NvdW50IDE+PgplbmRvYmoKMyAwIG9iago8' +
  'PC9UeXBlL1BhZ2UvUGFyZW50IDIgMCBSL01lZGlhQm94WzAgMCA1OTUgODQyXS9SZXNvdXJjZXM8' +
  'PC9Gb250PDwvRjE8PC9UeXBlL0ZvbnQvU3VidHlwZS9UeXBlMS9CYXNlRm9udC9IZWx2ZXRpY2E+' +
  'Pj4+Pi9Db250ZW50cyA0IDAgUj4+CmVuZG9iago0IDAgb2JqCjw8L0xlbmd0aCA2OD4+CnN0cmVh' +
  'bQpCVAovRjEgMTYgVGYKNzIgNzYwIFRkCihDb250cmFjdGUgc2ltdWxhdCAtIE1TVyBtb2NrKSBU' +
  'agpFVAplbmRzdHJlYW0KZW5kb2JqCnhyZWYKMCA1CjAwMDAwMDAwMDAgNjU1MzUgZiAKMDAwMDAw' +
  'MDAwOSAwMDAwMCBuIAowMDAwMDAwMDU2IDAwMDAwIG4gCjAwMDAwMDAxMTEgMDAwMDAgbiAKMDAw' +
  'MDAwMDI2MSAwMDAwMCBuIAp0cmFpbGVyCjw8L1NpemUgNS9Sb290IDEgMCBSPj4Kc3RhcnR4cmVm' +
  'CjM4MAolJUVPRgo=';


/** The contract PDF as the API serves it: real bytes, real Content-Type, real filename. */
export function pdfResponse(filename: string) {
  const bytes = Uint8Array.from(atob(CONTRACT_PDF_BASE64), char => char.charCodeAt(0));
  return HttpResponse.arrayBuffer(bytes.buffer as ArrayBuffer, {
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename=${filename}`,
    },
  });
}
