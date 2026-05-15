import React, { useState } from 'react';
import {
  IonPage,
  IonContent,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonButtons,
  IonIcon,
  IonMenuButton,
  IonModal,
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
import './super-admin.css';

const AttendancePage: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [showMarkModal, setShowMarkModal] = useState(false);
  const [selectedWorker, setSelectedWorker] = useState<any>(null);
  
  const [attendance, setAttendance] = useState([
    { id: 1, name: 'Dr. Aris Varma', role: 'Healer', branch: 'Uptown Sanctuary', checkIn: '08:50 AM', checkOut: '05:30 PM', status: 'present', shift: 'Full Day' },
    { id: 2, name: 'Maya Rose', role: 'Healer', branch: 'Coastal Healing Center', checkIn: '09:15 AM', checkOut: null, status: 'late', shift: 'Full Day' },
    { id: 3, name: 'Samuel Chen', role: 'Healer', branch: 'Green Valley Branch', checkIn: null, checkOut: null, status: 'on-leave', shift: 'Full Day' },
    { id: 4, name: 'Lila Thorne', role: 'Healer', branch: 'Downtown Sanctuary', checkIn: '08:55 AM', checkOut: null, status: 'present', shift: 'Full Day' },
    { id: 5, name: 'Julian Mars', role: 'Healer', branch: 'Uptown Sanctuary', checkIn: '09:00 AM', checkOut: null, status: 'present', shift: 'Morning' },
    { id: 6, name: 'Sarah Connor', role: 'Branch Admin', branch: 'Coastal Healing Center', checkIn: '08:30 AM', checkOut: '04:30 PM', status: 'present', shift: 'Full Day' },
    { id: 7, name: 'Michael Scott', role: 'Staff', branch: 'Downtown Sanctuary', checkIn: null, checkOut: null, status: 'absent', shift: 'Full Day' },
  ]);

  const filteredAttendance = attendance.filter(record => 
    record.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    record.branch.toLowerCase().includes(searchQuery.toLowerCase()) ||
    record.role.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleUpdateStatus = (id: number, newStatus: string) => {
    setAttendance(attendance.map(a => 
      a.id === id ? { ...a, status: newStatus } : a
    ));
    setShowMarkModal(false);
  };

  return (
    <IonPage className="sa-page">
      <IonHeader className="ion-no-border">
        <IonToolbar className="sa-page__toolbar">
          <IonButtons slot="start">
            <IonMenuButton />
          </IonButtons>
          <IonTitle className="sa-page__toolbar-title">Worker Attendance</IonTitle>
          <IonButtons slot="end">
            <button className="sa-page__toolbar-avatar">SA</button>
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
                  <IonIcon icon={calendarOutline} />
                  <input 
                    type="date" 
                    value={selectedDate} 
                    onChange={(e) => setSelectedDate(e.target.value)} 
                  />
                </div>
                <button className="sa-btn sa-btn--primary">
                  <IonIcon icon={downloadOutline} /> Export Report
                </button>
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
                <div className="sa-stat-card__value">{attendance.length}</div>
              </div>
            </div>
            <div className="sa-stat-card">
              <div className="sa-stat-card__icon sa-stat-card__icon--success">
                <IonIcon icon={checkmarkCircleOutline} />
              </div>
              <div>
                <div className="sa-stat-card__label">Present</div>
                <div className="sa-stat-card__value">{attendance.filter(a => a.status === 'present' || a.status === 'late').length}</div>
              </div>
            </div>
            <div className="sa-stat-card">
              <div className="sa-stat-card__icon sa-stat-card__icon--warning">
                <IonIcon icon={alertCircleOutline} />
              </div>
              <div>
                <div className="sa-stat-card__label">Late/On Leave</div>
                <div className="sa-stat-card__value">{attendance.filter(a => a.status === 'late' || a.status === 'on-leave').length}</div>
              </div>
            </div>
            <div className="sa-stat-card">
              <div className="sa-stat-card__icon sa-stat-card__icon--danger">
                <IonIcon icon={closeCircleOutline} />
              </div>
              <div>
                <div className="sa-stat-card__label">Absent</div>
                <div className="sa-stat-card__value">{attendance.filter(a => a.status === 'absent').length}</div>
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

          <div className="sa-section" style={{ padding: 0, overflow: 'hidden' }}>
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
                {filteredAttendance.map((record) => (
                  <tr key={record.id}>
                    <td>
                      <div className="sa-table__user">
                        <div className="sa-table__avatar sa-table__avatar--staff">
                          {record.name.split(' ').map(n => n[0]).join('')}
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
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </IonContent>
    </IonPage>
  );
};

export default AttendancePage;
