import { cx } from '@codegouvfr/react-dsfr/fr/cx';
import { startReactDsfr } from '@codegouvfr/react-dsfr/spa';
import React from 'react';
import { Provider } from 'react-redux';
import { Link, Navigate, Route, Routes } from 'react-router-dom';
import FetchInterceptor from 'src/components/FetchInterceptor/FetchInterceptor';
import Footer from 'src/components/Footer/Footer';
import Header from 'src/components/Header/Header';
import ScrollToTop from 'src/components/ScrollToTop/ScrollToTop';
import { useAuthentication } from 'src/hooks/useAuthentication';
import { useAppSelector } from 'src/hooks/useStore';
import './App.scss';
import { store } from './store/store';

declare module '@codegouvfr/react-dsfr/spa' {
  interface RegisterLink {
    Link: typeof Link;
  }
}

function AppWrapper() {
  startReactDsfr({ defaultColorScheme: 'light', Link });

  return (
    <Provider store={store}>
      <ScrollToTop />
      <App />
    </Provider>
  );
}

function App() {
  const { availableRoutes } = useAuthentication();
  const isSomeQueryPending = useAppSelector((state) =>
    Object.values(state.api.queries).some(
      (query) => query?.status === 'pending'
    )
  );

  FetchInterceptor();

  return (
    <React.Suspense fallback={<></>}>
      <Header />
      {isSomeQueryPending && (
        <div className="toast">Chargement en cours...</div>
      )}

      <main
        className={cx('fr-container', 'fr-pt-2w')}
        style={{ minHeight: 'calc(100vh - 440px)' }}
      >
        <Routes>
          {[
            ...availableRoutes.map((route) => (
              <Route
                path={route.path}
                element={<route.component />}
                key={route.key}
              />
            )),
            <Route
              path="/*"
              element={<Navigate replace to="/" />}
              key="redirection_route"
            />,
          ]}
        </Routes>
      </main>
      <Footer />
    </React.Suspense>
  );
}

export default AppWrapper;
