export enum AppRoutes {

    home = '/',
    pregnant = '/pregnant',
    newBorn = '/new-born',
    familiar = '/familiar',
    smashCake = "/smash-cake",
    pets = "/pets",
    store = "/store",
    materials = "/materials",
    bookSession = "/book-session",
    bookStore = "/book-store",
    aboutMe = "/about-me"

}

export const appRoutesTitle: Partial<Record<AppRoutes, string>> = {
    [AppRoutes.home]: 'Inici',
    [AppRoutes.pregnant]: 'Embaras',
    [AppRoutes.newBorn]: 'Recent Nascut',
    [AppRoutes.smashCake] : "Smash Cake",
    [AppRoutes.bookSession] : "Reservar Sessió"
  };