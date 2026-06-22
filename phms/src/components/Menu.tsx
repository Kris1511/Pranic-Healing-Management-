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
  shieldCheckmarkOutline,
  medkitOutline,
  personOutline,
  cashOutline,
  listOutline,
  timeOutline,
  walletOutline,
  calendarOutline,
  documentTextOutline,
  chevronDownOutline,
  chevronForwardOutline,
  chatboxOutline,
} from 'ionicons/icons';
import { ROUTES } from '../constants/routes.constant';
import { useAuthStore } from '../store/auth.store';
import { formatUtil } from '../utils/format.util';
import './Menu.css';

interface NavItem {
  title: string;
  url?: string;
  icon: string;
  section?: string;
  subItems?: { title: string; url: string; icon: string }[];
}

const superAdminNav: NavItem[] = [
  /* Main Section */
  { title: 'Dashboard', url: ROUTES.SUPER_ADMIN.DASHBOARD, icon: gridOutline, section: 'Main' },
  { title: 'Branches', url: ROUTES.SUPER_ADMIN.BRANCHES, icon: businessOutline },
  // { title: 'Users', url: ROUTES.SUPER_ADMIN.USERS, icon: peopleOutline },

  /* Roles Section */
  // { title: 'Super Admin', url: ROUTES.SUPER_ADMIN.DASHBOARD, icon: shieldCheckmarkOutline, section: 'Roles' },
  { title: 'Branch Admin', url: ROUTES.SUPER_ADMIN.BRANCH_ADMINS, icon: businessOutline, section: 'Users' },
  { title: 'Healers', url: ROUTES.SUPER_ADMIN.HEALERS, icon: medkitOutline },
  { title: 'Patients', url: ROUTES.SUPER_ADMIN.PATIENTS, icon: peopleOutline },

  /* Daily Operations Section */
  { title: 'Daily Visitor Log', url: ROUTES.SUPER_ADMIN.VISITOR_LOG, icon: listOutline, section: 'Daily Logs' },
  { title: 'Worker Attendance', url: ROUTES.SUPER_ADMIN.ATTENDANCE, icon: timeOutline },

  /* Treatment Section */
  { title: 'Treatment Type', url: ROUTES.SUPER_ADMIN.TREATMENT_TYPE_LIST, icon: leafOutline, section: 'Treatment' },

  /* Finance Section */
  { title: 'Daily Income & Expense', url: ROUTES.SUPER_ADMIN.DAILY_FINANCE, icon: cashOutline, section: 'Finance' },
  { title: 'Revenue', url: ROUTES.SUPER_ADMIN.REVENUE, icon: walletOutline },
  { title: 'Reports', url: ROUTES.SUPER_ADMIN.REPORTS, icon: barChartOutline },
  

  /* System Section */
  { title: 'Settings', url: ROUTES.SUPER_ADMIN.SETTINGS, icon: settingsOutline, section: 'System' },
];

const branchAdminNav: NavItem[] = [
  { title: 'Dashboard', url: ROUTES.BRANCH_ADMIN.DASHBOARD, icon: gridOutline, section: 'Main' },
  { title: 'Healers', url: ROUTES.BRANCH_ADMIN.HEALERS, icon: medkitOutline },
  { title: 'Patients', url: ROUTES.BRANCH_ADMIN.PATIENTS, icon: peopleOutline },
  { title: 'Sessions', url: ROUTES.BRANCH_ADMIN.SESSIONS, icon: timeOutline },
  { title: 'Attendance', url: ROUTES.BRANCH_ADMIN.ATTENDANCE, icon: timeOutline, section: 'Operations' },
  { title: 'Visitor Log', url: ROUTES.BRANCH_ADMIN.VISITOR_LOG, icon: listOutline },
  { title: 'Documents', url: ROUTES.BRANCH_ADMIN.DOCUMENTS, icon: documentTextOutline, section: 'Finance' },
  { title: 'Finance', url: ROUTES.BRANCH_ADMIN.FINANCE, icon: cashOutline},
  { title: 'Reports', url: ROUTES.BRANCH_ADMIN.REPORTS, icon: barChartOutline },
  { title: 'Settings', url: ROUTES.BRANCH_ADMIN.SETTINGS, icon: settingsOutline, section: 'System' },
];

const healerNav: NavItem[] = [
  { title: 'Dashboard', url: ROUTES.HEALER.DASHBOARD, icon: gridOutline, section: 'Main' },
  { title: 'Assigned Patients', url: ROUTES.HEALER.PATIENTS, icon: peopleOutline },
  { title: 'Sessions', url: ROUTES.HEALER.SESSIONS, icon: timeOutline },
  { title: 'Session Notes', url: ROUTES.HEALER.SESSION_NOTES, icon: documentTextOutline },
  { title: 'Documents', url: ROUTES.HEALER.DOCUMENTS, icon: listOutline },
  // { title: 'Schedule', url: ROUTES.HEALER.SCHEDULE, icon: calendarOutline },
  // { title: 'Availability', url: ROUTES.HEALER.AVAILABILITY, icon: listOutline },
  { title: 'Profile', url: ROUTES.HEALER.PROFILE, icon: personOutline },
];

const patientNav: NavItem[] = [
  { title: 'Dashboard', url: ROUTES.PATIENT.DASHBOARD, icon: gridOutline, section: 'Main' },
  { title: 'Session History', url: ROUTES.PATIENT.SESSION_HISTORY, icon: timeOutline },
  { title: 'Session Notes', url: ROUTES.PATIENT.SESSION_NOTES, icon: documentTextOutline },
  { title: 'Health Records', url: ROUTES.PATIENT.HEALTH_RECORDS, icon: documentTextOutline },
  { title: 'Payments', url: ROUTES.PATIENT.PAYMENT_HISTORY, icon: cashOutline },
  { title: 'Feedback', url: ROUTES.PATIENT.FEEDBACK, icon: chatboxOutline },
  { title: 'Profile', url: ROUTES.PATIENT.PROFILE, icon: personOutline},   // , section: 'Settings' 
];

const Menu: React.FC = () => {
  const location = useLocation();
  const history = useHistory();
  const { user, logout } = useAuthStore();
  const [expandedItems, setExpandedItems] = React.useState<string[]>([]);

  let navItems = branchAdminNav;
  const role = user?.role?.toUpperCase() || '';
  if (role === 'SUPER_ADMIN' || role === 'SUPER ADMIN') {
    navItems = superAdminNav;
  } else if (role === 'HEALER') {
    navItems = healerNav;
  } else if (role === 'PATIENT') {
    navItems = patientNav;
  }

  const handleNavClick = (item: NavItem) => {
    if (item.subItems) {
      setExpandedItems(prev =>
        prev.includes(item.title)
          ? prev.filter(t => t !== item.title)
          : [...prev, item.title]
      );
    } else if (item.url) {
      history.push(item.url);
    }
  };

  const handleSubNavClick = (url: string) => {
    history.push(url);
  };

  const handleLogout = () => {
    logout();
    history.push(ROUTES.AUTH.LOGIN);
  };

  const userInitials = formatUtil.getInitials(user?.name, user?.firstName, user?.lastName);
  const userName = formatUtil.userName(user?.firstName, user?.lastName, user?.name) || 'Super Admin';
  const userRole = user?.role ? formatUtil.roleLabel(user.role) : 'System Administrator';

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
          {navItems.map((item, index) => {
            const isActive = item.url ? location.pathname === item.url : false;
            const hasSubItems = !!item.subItems;
            const isExpanded = expandedItems.includes(item.title);
            const isSubItemActive = hasSubItems && item.subItems?.some(sub => location.pathname === sub.url);
            
            return (
              <React.Fragment key={(item.url || item.title) + index}>
                {item.section && <div className="app-menu__section-title">{item.section}</div>}
                <button
                  className={`app-menu__nav-item ${(isActive || (isSubItemActive && !isExpanded)) ? 'app-menu__nav-item--active' : ''}`}
                  onClick={() => handleNavClick(item)}
                >
                  <IonIcon icon={item.icon} className="app-menu__nav-icon" />
                  <span className="app-menu__nav-label">{item.title}</span>
                  {hasSubItems && (
                    <IonIcon 
                      icon={isExpanded ? chevronDownOutline : chevronForwardOutline} 
                      className="app-menu__nav-chevron" 
                      style={{ marginLeft: 'auto', opacity: 0.7 }}
                    />
                  )}
                </button>
                
                {hasSubItems && isExpanded && (
                  <div className="app-menu__sub-items" style={{ background: 'rgba(0,0,0,0.03)' }}>
                    {item.subItems!.map((subItem, subIndex) => {
                      const isSubActive = location.pathname === subItem.url;
                      return (
                        <button
                          key={subItem.url + subIndex}
                          className={`app-menu__nav-item app-menu__sub-nav-item ${isSubActive ? 'app-menu__nav-item--active' : ''}`}
                          onClick={() => handleSubNavClick(subItem.url)}
                          style={{ paddingLeft: '3rem', fontSize: '0.9em', minHeight: '40px' }}
                        >
                          <IonIcon icon={subItem.icon} className="app-menu__nav-icon" style={{ fontSize: '1.2em' }} />
                          <span className="app-menu__nav-label">{subItem.title}</span>
                        </button>
                      );
                    })}
                  </div>
                )}
              </React.Fragment>
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
              <span className="app-menu__user-role">{userRole}</span>
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
