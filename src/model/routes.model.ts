export enum AppRoutes {

    home = '/',
    pregnant = '/embaras',
    newBorn = '/new-born',
    familiar = '/familiar',
    smashCake = "/smashCake",
    revelation = "/revelacio",
    pets = "/mascotes",
    dni = "/dni",
    materials = "/materials"

}

export const appRoutesTitle: Partial<Record<AppRoutes, string>> = {
    [AppRoutes.home]: 'Inici',
    [AppRoutes.pregnant]: 'Embaras',
    [AppRoutes.newBorn]: 'Recent Nascut',
    [AppRoutes.smashCake] : "Smash Cake"
  };