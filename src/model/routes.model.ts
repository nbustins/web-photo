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
    aboutMe = "/about-me",
    workshop = "/workshop",
    christmas = "/christmas",
    avisLegal = "/avis-legal",
    privacitat = "/privacitat"

}

export const appRoutesTitle: Partial<Record<AppRoutes, string>> = {
    [AppRoutes.home]: 'Inici',
    [AppRoutes.pregnant]: 'Embaras',
    [AppRoutes.newBorn]: 'Recent Nascut',
    [AppRoutes.smashCake] : "Smash Cake",
    [AppRoutes.bookSession] : "Reservar Sessió",
    [AppRoutes.workshop] : "Taller",
    [AppRoutes.christmas] : "Nadal",
    [AppRoutes.familiar]: "Familiar",
    [AppRoutes.store]: "Botiga",
    [AppRoutes.bookStore]: "Comprar",
    [AppRoutes.aboutMe]: "Sobre mi",
    [AppRoutes.avisLegal]: "Avís legal",
    [AppRoutes.privacitat]: "Privacitat"
  };

export const bookSessionPath = (sessionTypeId: number) => `${AppRoutes.bookSession}/${sessionTypeId}`;
export const bookingPath = (token: string) => `/bookings/${token}`;
export const bookingContractPath = (token: string) => `${bookingPath(token)}/contract`;
export const weddingPath = (slug: string) => `/weddings/${slug}`;
export const weddingManagerPath = (slug: string) => `/weddings/${slug}/manager`;
