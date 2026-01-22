export enum AppRoutes {

    home = '/',
    pregnant = '/embaras',
    newBorn = '/new-born',
    familiar = '/familiar',
    smashCake = "/smashCake",
    revelation = "/revelacio",
    pets = "/mascotes",
    store = "/store",
    materials = "/materials",
    bookSession = "/bookSession",
    bookStore = "/bookStore"

}

export const appRoutesTitle: Partial<Record<AppRoutes, string>> = {
    [AppRoutes.home]: 'Inici',
    [AppRoutes.pregnant]: 'Embaras',
    [AppRoutes.newBorn]: 'Recent Nascut',
    [AppRoutes.smashCake] : "Smash Cake",
    [AppRoutes.bookSession] : "Reservar Sessió"
  };