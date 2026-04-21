import React from 'react';
import {
  IonContent,
  IonIcon,
  IonMenu,
  IonHeader,
  IonFooter,
} from '@ionic/react';
import { useLocation, useHistory } from 'react-router-dom';
import {
  gridOutline,
  businessOutline,
  peopleOutline,
  barChartOutline,
  settingsOutline,
  logOutOutline,
  leafOutline,
} from 'ionicons/icons';
import { ROUTES } from '../constants/routes.constant';
import { useAuthStore } from '../store/auth.store';
import './Menu.css';

interface NavItem {
  title: string;
  url: string;
  icon: string;
}

const superAdminNav: NavItem[] = [
  { title: 'Dashboard', url: ROUTES.SUPER_ADMIN.DASHBOARD, icon: gridOutline },
  { title: 'Branches', url: ROUTES.SUPER_ADMIN.BRANCHES, icon: businessOutline },
  { title: 'Users', url: ROUTES.SUPER_ADMIN.USERS, icon: peopleOutline },
  { title: 'Reports', url: ROUTES.SUPER_ADMIN.REPORTS, icon: barChartOutline },
  { title: 'Settings', url: ROUTES.SUPER_ADMIN.SETTINGS, icon: settingsOutline },
];

const Menu: React.FC = () => {
  const location = useLocation();
  const history = useHistory();
  const { user, logout } = useAuthStore();

  const navItems = superAdminNav;

  const handleNavClick = (url: string) => {
    history.push(url);
  };

  const handleLogout = () => {
    logout();
    history.push(ROUTES.AUTH.LOGIN);
  };

  const userInitials = user
    ? `${user.firstName?.[0] || ''}${user.lastName?.[0] || ''}`.toUpperCase() || 'SA'
    : 'SA';

  const userName = user
    ? `${user.firstName || ''} ${user.lastName || ''}`.trim() || 'Super Admin'
    : 'Super Admin';

  return (
    <IonMenu contentId="main" type="overlay" className="app-menu">
      <IonHeader className="ion-no-border">
        {/* Brand Header */}
        <div className="app-menu__brand">
          <div className="app-menu__brand-icon">
            <IonIcon icon={leafOutline} />
          </div>
          <div className="app-menu__brand-text">
            <span className="app-menu__brand-name">Pranic Healing</span>
            <span className="app-menu__brand-sub">Manager</span>
          </div>
        </div>
      </IonHeader>

      <IonContent className="app-menu__content">
        {/* Navigation Items */}
        <nav className="app-menu__nav">
          {navItems.map((item) => {
            const isActive = location.pathname === item.url;
            return (
              <button
                key={item.url}
                className={`app-menu__nav-item ${isActive ? 'app-menu__nav-item--active' : ''}`}
                onClick={() => handleNavClick(item.url)}
              >
                <IonIcon icon={item.icon} className="app-menu__nav-icon" />
                <span className="app-menu__nav-label">{item.title}</span>
              </button>
            );
          })}
        </nav>
      </IonContent>

      <IonFooter className="ion-no-border">
        {/* User Profile at Bottom */}
        <div className="app-menu__footer">
          <div className="app-menu__user">
            <div className="app-menu__user-avatar">{userInitials}</div>
            <div className="app-menu__user-info">
              <span className="app-menu__user-name">{userName}</span>
              <span className="app-menu__user-role">Aria Seraphina</span>
            </div>
          </div>
          <button className="app-menu__logout-btn" onClick={handleLogout} title="Logout">
            <IonIcon icon={logOutOutline} />
          </button>
        </div>
      </IonFooter>
    </IonMenu>
  );
};

export default Menu;
