import React, { useState, useEffect } from 'react';
import {
  IonPage,
  IonContent,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonButtons,
  IonIcon,
  IonMenuButton,
  useIonViewDidEnter,
  useIonViewDidLeave,
} from '@ionic/react';
import {
  searchOutline,
  timeOutline,
  businessOutline,
  peopleOutline,
  checkmarkCircleOutline,
  closeCircleOutline,
  calendarOutline,
  filterOutline,
  downloadOutline,
  alertCircleOutline,
  logInOutline,
  logOutOutline,
} from 'ionicons/icons';
import { getAttendanceHistory } from '../../api/attendence.api';
import { getUsers } from '../../api/user.api';
import './super-admin.css';
import ProfileDropdown from '../../components/common/ProfileDropdown';


const AttendancePage: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  
  const [healers, setHealers] = useState<any[]>([]);
  const [attendanceRecords, setAttendanceRecords] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isPageVisible, setIsPageVisible] = useState(false);

  useIonViewDidEnter(() => {
    setIsPageVisible(true);
  });

  useIonViewDidLeave(() => {
    setIsPageVisible(false);
  });

  // Fetch healers once on mount
  useEffect(() => {
    const fetchHealers = async () => {
      try {
        const response = await getUsers({ role: 'HEALER' });
        const data = response.data || response || [];
        setHealers(data);
      } catch (error) {
        console.error('Error fetching healers:', error);
      }
    };
    fetchHealers();
  }, []);

  // Fetch attendance records for the selected date with auto-refresh
  useEffect(() => {
    if (!isPageVisible) return;

    const fetchAttendanceRecords = async (isPolling = false) => {
      try {
        if (!isPolling) setIsLoading(true);
        const response = await getAttendanceHistory(undefined, { date: selectedDate });
        const data = response.data || response || [];
        setAttendanceRecords(data);
      } catch (error) {
        console.error('Error fetching attendance records:', error);
      } finally {
        if (!isPolling) setIsLoading(false);
      }
    };

    fetchAttendanceRecords(false);

    // removed setInterval // 10 seconds auto-refresh

  }, [selectedDate, isPageVisible]);

  // Merge healers with their attendance record for the selected date
  const mergedAttendance = healers.map((healer: any) => {
    const record = attendanceRecords.find((r: any) => (r.userId || r.user?.id) === healer.id);

    if (record) {
      return {
        id: record.id || healer.id,
        name: healer.name || 'Unknown',
        role: 'Healer',
        branch: record.branch?.name || healer.branch?.name || 'Unassigned',
        checkIn: record.checkIn ? new Date(record.checkIn).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : null,
        checkOut: record.checkOut ? new Date(record.checkOut).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : null,
        status: record.status ? record.status.toLowerCase() : 'present',
        shift: 'Full Day'
      };
    } else {
      return {
        id: healer.id,
        name: healer.name || 'Unknown',
        role: 'Healer',
        branch: healer.branch?.name || 'Unassigned',
        checkIn: null,
        checkOut: null,
        status: 'absent',
        shift: 'Full Day'
      };
    }
  });

  const filteredAttendance = mergedAttendance.filter(record => 
    record.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    record.branch.toLowerCase().includes(searchQuery.toLowerCase()) ||
    record.role.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <IonPage className="sa-page">
      <IonHeader className="ion-no-border">
        <IonToolbar className="sa-page__toolbar">
          <IonButtons slot="start">
            <IonMenuButton />
          </IonButtons>
          <IonTitle className="sa-page__toolbar-title">Worker Attendance</IonTitle>
          <IonButtons slot="end">
            <ProfileDropdown />
          </IonButtons>
        </IonToolbar>
      </IonHeader>

      <IonContent className="sa-page__content">
        <div className="sa-page__body">
          <div className="sa-page__header">
            <div className="sa-page__header-row">
              <div>
                <h1 className="sa-page__title">Daily Attendance Log</h1>
                <p className="sa-page__subtitle">Manage and monitor staff attendance across all branches</p>
              </div>
              <div className="sa-page__header-actions">
                <div className="sa-date-picker">
                  <input 
                    type="date" 
                    value={selectedDate} 
                    onChange={(e) => setSelectedDate(e.target.value)} 
                  />
                  <IonIcon icon={calendarOutline} />
                </div>
                {/* <button className="sa-btn sa-btn--primary">
                  <IonIcon icon={downloadOutline} /> Export Report
                </button> */}
              </div>
            </div>
          </div>

          <div className="sa-stats sa-stats--4">
            <div className="sa-stat-card">
              <div className="sa-stat-card__icon sa-stat-card__icon--primary">
                <IonIcon icon={peopleOutline} />
              </div>
              <div>
                <div className="sa-stat-card__label">Total Staff</div>
                <div className="sa-stat-card__value">{mergedAttendance.length}</div>
              </div>
            </div>
            <div className="sa-stat-card">
              <div className="sa-stat-card__icon sa-stat-card__icon--success">
                <IonIcon icon={checkmarkCircleOutline} />
              </div>
              <div>
                <div className="sa-stat-card__label">Present</div>
                <div className="sa-stat-card__value">{mergedAttendance.filter(a => a.status === 'present' || a.status === 'late').length}</div>
              </div>
            </div>
            <div className="sa-stat-card">
              <div className="sa-stat-card__icon sa-stat-card__icon--warning">
                <IonIcon icon={alertCircleOutline} />
              </div>
              <div>
                <div className="sa-stat-card__label">Late/On Leave</div>
                <div className="sa-stat-card__value">{mergedAttendance.filter(a => a.status === 'late' || a.status === 'on-leave').length}</div>
              </div>
            </div>
            <div className="sa-stat-card">
              <div className="sa-stat-card__icon sa-stat-card__icon--danger">
                <IonIcon icon={closeCircleOutline} />
              </div>
              <div>
                <div className="sa-stat-card__label">Absent</div>
                <div className="sa-stat-card__value">{mergedAttendance.filter(a => a.status === 'absent').length}</div>
              </div>
            </div>
          </div>

          <div className="sa-section-header" style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
            <div className="sa-search">
              <IonIcon icon={searchOutline} />
              <input 
                placeholder="Search by name, role or branch..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <button className="sa-btn sa-btn--outline" style={{ marginBottom: '20px' }}>
              <IonIcon icon={filterOutline} /> Filter
            </button>
          </div>

          <div className="sa-section" style={{ padding: 0, overflowX: 'auto', WebkitOverflowScrolling: 'touch' }}>
            <table className="sa-table">
              <thead>
                <tr>
                  <th>Worker Name</th>
                  <th>Role</th>
                  <th>Branch</th>
                  <th>Check In</th>
                  <th>Check Out</th>
                  <th>Status</th>
                  <th>Date</th>
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  <tr>
                    <td colSpan={7} style={{ textAlign: 'center', padding: '32px' }}>
                      Loading attendance records...
                    </td>
                  </tr>
                ) : filteredAttendance.length === 0 ? (
                  <tr>
                    <td colSpan={7} style={{ textAlign: 'center', padding: '32px' }}>
                      No attendance records found.
                    </td>
                  </tr>
                ) : (
                  filteredAttendance.map((record) => (
                    <tr key={record.id}>
                      <td>
                        <div className="sa-table__user">
                          <div className="sa-table__avatar sa-table__avatar--staff">
                            {record.name.split(' ').map((n: string) => n[0]).join('')}
                          </div>
                          <div className="sa-table__user-info">
                            <span className="sa-table__user-name">{record.name}</span>
                            <span className="sa-table__user-email">{record.shift} Shift</span>
                          </div>
                        </div>
                      </td>
                      <td>{record.role}</td>
                      <td>
                        <div className="sa-table__branch-info">
                          <IonIcon icon={businessOutline} /> {record.branch}
                        </div>
                      </td>
                      <td>
                        <div className="sa-table__time">
                          <IonIcon icon={logInOutline} /> {record.checkIn || '--:--'}
                        </div>
                      </td>
                      <td>
                        <div className="sa-table__time">
                          <IonIcon icon={logOutOutline} /> {record.checkOut || '--:--'}
                        </div>
                      </td>
                      <td>
                        <span className={`sa-badge sa-badge--${record.status}`}>
                          {record.status.replace('-', ' ')}
                        </span>
                      </td>
                      <td>
                        <div className="sa-table__date">
                          <IonIcon icon={calendarOutline} />
                          {selectedDate}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </IonContent>
    </IonPage>
  );
};

export default AttendancePage;
