import { FC } from 'react';
import { AppRoutes } from '../model/routes.model';
import { Route, RouterProvider, createBrowserRouter, createRoutesFromElements } from 'react-router-dom';
import { HomePage } from '../pages/home.page';
import { MainLayout } from '../layouts/main.layout';
import { FamiliarPage } from '../pages/familiar.page';
import { PregnantPage } from '../pages/pregnancy/pregnant.page';
import { NewBornPage } from '../pages/newborn/newborn.page';
import { UnderConstruction } from '../pages/under.construction';

const privateRoutes: Partial<Record<AppRoutes, FC>> = {
    [AppRoutes.home]: () => <HomePage/>,
    [AppRoutes.pregnant] : () => <PregnantPage/>,
    [AppRoutes.newBorn] : () => <NewBornPage/>,
    [AppRoutes.familiar] : () => <FamiliarPage/>,
    [AppRoutes.materials] : () => <UnderConstruction/>,
    [AppRoutes.dni] : () => <UnderConstruction/>

}

export const AppRouter: FC = () => {
    const router = createBrowserRouter(
      createRoutesFromElements(
        <>
        
          <Route path="/" element={<MainLayout />}>
          
          <Route path={AppRoutes.home} Component={privateRoutes[AppRoutes.home]} />
          <Route path={AppRoutes.pregnant} Component={privateRoutes[AppRoutes.pregnant]} />
          <Route path={AppRoutes.newBorn} Component={privateRoutes[AppRoutes.newBorn]} />
          <Route path={AppRoutes.familiar} Component={privateRoutes[AppRoutes.familiar]} />
          <Route path={AppRoutes.dni} Component={privateRoutes[AppRoutes.dni]} />
          <Route path={AppRoutes.materials} Component={privateRoutes[AppRoutes.materials]} />

          </Route>
        </>
      )
    );
  
    return <RouterProvider router={router} />;
  };