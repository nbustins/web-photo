import { FC } from 'react';
import { HashRouter, Route, Routes } from "react-router-dom";
import { AppRoutes } from '../model/routes.model';
import { MainLayout } from '../layouts/main.layout';
import { HomePage } from '../pages/home.page';
import { PregnantPage } from '../pages/pregnancy/pregnant.page';
import { NewBornPage } from '../pages/newborn/newborn.page';
import { UnderConstruction } from '../pages/under.construction';
import { ScrollToTop } from '../components/scrollToTop';
import { FamiliarPage } from '../pages/familiar/familiar.page';
import { SmashCakePage } from '../pages/smashcake/smashcake.page';
import { BookSession } from '../pages/booksession/booksession';
import { StorePage } from '../pages/store/store.page';
import { BookStore } from '../pages/bookstore/bookstore';
import { AboutMe } from '../pages/aboutme/aboutme';
import { Workshop } from '../pages/workshop/workshop.page';

import { GenericWedding } from '../pages/weddings/WeddingGuest/custom/GenericWedding';
import { WeddingManagerPage } from '../pages/weddings/WeddingManager/WeddingManagerPage';
import { AdminLogin } from '../pages/admin/AdminLogin';
import { AdminPanel } from '../pages/admin/AdminPanel';
import { RequireAuth } from '../pages/admin/RequireAuth';


const privateRoutes: Partial<Record<AppRoutes, FC>> = {
    [AppRoutes.home]: () => <HomePage/>,
    [AppRoutes.pregnant] : () => <PregnantPage/>,
    [AppRoutes.newBorn] : () => <NewBornPage/>,
    [AppRoutes.familiar] : () => <FamiliarPage/>,
    [AppRoutes.materials] : () => <UnderConstruction/>,
    [AppRoutes.store] : () => <StorePage/>,
    [AppRoutes.smashCake] : () => <SmashCakePage/>,
    [AppRoutes.bookSession] : () => <BookSession/>,
    [AppRoutes.bookStore] : () => <BookStore/>,
    [AppRoutes.aboutMe] : () => <AboutMe/>,
    [AppRoutes.workshop] : () => <Workshop/>

};

export const AppRouter: FC = () => {
  return (
    <HashRouter>
      <ScrollToTop />
      <Routes>
        <Route path="/" element={<MainLayout />}>
          {Object.entries(privateRoutes).map(([route, Component]) => (
            <Route 
              key={route}
              path={route} 
              element={<Component />} 
            />
          ))}
          <Route path={`${AppRoutes.bookSession}/:sessionTypeId`} element={<BookSession />} />
        </Route>
        <Route path="/weddings/:slug" element={<GenericWedding />} />
        <Route path="/weddings/:slug/manager" element={<WeddingManagerPage />} />

        <Route path="/admin/login" element={<AdminLogin />} />
        <Route path="/admin" element={<RequireAuth><AdminPanel /></RequireAuth>} />

        /* Custom wedding routes */
        {/* <Route path="/weddings/carla-joel" element={<CarlaJoelCustomWedding />} /> */}
      </Routes>
    </HashRouter>
  );
};
