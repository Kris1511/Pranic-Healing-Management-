import React, { useRef, useState } from 'react';
import { IonIcon, IonPopover } from '@ionic/react';
import { logOutOutline, personCircleOutline } from 'ionicons/icons';
import { useAuthStore } from '../../store/auth.store';
import { formatUtil } from '../../utils/format.util';
import { useHistory } from 'react-router-dom';
import { ROUTES } from '../../constants/routes.constant';
import './ProfileDropdown.css';

const ProfileDropdown: React.FC = () => {
  const { user, logout } = useAuthStore();
  const history = useHistory();
  const [popoverState, setPopoverState] = useState({
    showPopover: false,
    event: undefined,
  });

  const userInitials = formatUtil.getInitials(user?.name, user?.firstName, user?.lastName);
  const userName = formatUtil.userName(user?.firstName, user?.lastName, user?.name) || 'Super Admin';
  const userRole = user?.role ? formatUtil.roleLabel(user.role) : 'System Administrator';

  const handleLogout = () => {
    logout();
    setPopoverState({ showPopover: false, event: undefined });
    history.push(ROUTES.AUTH.LOGIN);
  };

  return (
    <>
      <div 
        className="sa-page__toolbar-avatar" 
        onClick={(e: any) => setPopoverState({ showPopover: true, event: e })}
        style={{ cursor: 'pointer' }}
      >
        {userInitials}
      </div>
      <IonPopover
        isOpen={popoverState.showPopover}
        event={popoverState.event}
        onDidDismiss={() => setPopoverState({ showPopover: false, event: undefined })}
        className="profile-dropdown-popover"
      >
        <div className="profile-dropdown-content">
          <div className="profile-dropdown-header">
            <div className="profile-dropdown-avatar">{userInitials}</div>
            <div className="profile-dropdown-info">
              <span className="profile-dropdown-name">{userName}</span>
              <span className="profile-dropdown-role">{userRole}</span>
            </div>
          </div>
          <div className="profile-dropdown-actions">
            <button className="profile-dropdown-btn logout-btn" onClick={handleLogout}>
              <IonIcon icon={logOutOutline} className="profile-dropdown-icon" />
              <span>Logout</span>
            </button>
          </div>
        </div>
      </IonPopover>
    </>
  );
};

export default ProfileDropdown;
