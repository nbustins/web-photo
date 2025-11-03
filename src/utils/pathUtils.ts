export const getPublicPath = (path: string) => {
  // Vite expone la base de la app en import.meta.env.BASE_URL
  const fullPath = `${import.meta.env.BASE_URL}${path}`;
  //console.log('getPublicPath:', fullPath);
  return fullPath;
};