import { cx } from '@codegouvfr/react-dsfr/fr/cx';
import { Header as DSFRHeader } from '@codegouvfr/react-dsfr/Header';
import { useLocation } from 'react-router-dom';
import { UserRole, UserRoleLabels } from 'shared/schema/User/UserRole';
import { isDefined } from 'shared/utils/utils';
import { useAuthentication } from 'src/hooks/useAuthentication';
import { useAppDispatch } from 'src/hooks/useStore';
import authSlice from 'src/store/reducers/authSlice';

const Header = () => {
  const dispatch = useAppDispatch();
  const location = useLocation();

  const { isAuthenticated, hasPermission, userInfos } = useAuthentication();

  return (
    <DSFRHeader
      brandTop={
        <>
          Ministère
          <br />
          de l'Agriculture
          <br />
          et de la Souveraineté
          <br />
          alimentaire
        </>
      }
      homeLinkProps={{
        to: '/',
        title: 'Accueil',
      }}
      id="header"
      // serviceTagline="baseline - précisions sur l'organisation"
      serviceTitle={
        <>
          Plan de Surveillance
          <br />
          Plan de Contrôle
        </>
      }
      navigation={(isAuthenticated
        ? [
            hasPermission('readProgrammingPlans')
              ? {
                  linkProps: {
                    to: '/plans',
                    target: '_self',
                  },
                  text: 'Mes plans',
                  isActive: location.pathname.startsWith('/plans'),
                }
              : undefined,
            hasPermission('readSamples')
              ? {
                  linkProps: {
                    to: '/prelevements',
                    target: '_self',
                  },
                  text: 'Mes prélèvements',
                  isActive: location.pathname.startsWith('/prelevements'),
                }
              : undefined,
          ]
        : []
      ).filter(isDefined)}
      quickAccessItems={
        isAuthenticated
          ? [
              <span className={cx('fr-text--sm', 'fr-mt-1v')}>
                {UserRoleLabels[userInfos?.role as UserRole]}
              </span>,
              {
                buttonProps: {
                  onClick: () => {
                    dispatch(authSlice.actions.signoutUser());
                  },
                },
                iconId: 'fr-icon-logout-box-r-line',
                text: 'Se déconnecter',
              },
            ]
          : [
              {
                linkProps: {
                  to: '/connexion',
                },
                iconId: 'fr-icon-user-fill',
                text: 'Se connecter',
              },
            ]
      }
    />
  );
};

export default Header;
