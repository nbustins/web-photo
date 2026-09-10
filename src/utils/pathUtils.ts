const CLD = 'res.cloudinary.com';
const UPLOAD = '/image/upload/';

/** Resol qualsevol src d'imatge: ruta dins public/, URL de Cloudinary o URL externa. */
export const imageUrl = (src: string, width?: number) => {
  // Local = tot el que no és URL absoluta ni data:. Només mirant l'string.
  if (!src.startsWith('http') && !src.startsWith('data:')) {
    return `${import.meta.env.BASE_URL}${src}`; // ponytail: local sense optimitzar; width ignorat
  }
  if (src.includes(CLD) && !src.includes(`${UPLOAD}f_auto`)) {
    const t = `f_auto,q_auto${width ? `,w_${width},c_limit` : ''}/`;
    return src.replace(UPLOAD, `${UPLOAD}${t}`);
  }
  return src; // altres externes o data: (signatura contracte)
};
