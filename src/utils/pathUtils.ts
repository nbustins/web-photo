export const getPublicPath = (path: string) => {
  if (/^https?:\/\//i.test(path) || path.startsWith('data:')) {
    return path;
  }

  // Vite expone la base de la app en import.meta.env.BASE_URL
  const fullPath = `${import.meta.env.BASE_URL}${path}`;
  //console.log('getPublicPath:', fullPath);
  return fullPath;
};
