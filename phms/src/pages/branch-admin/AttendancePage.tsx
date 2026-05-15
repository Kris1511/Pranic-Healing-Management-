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
  peopleOutline,
  checkmarkCircleOutline,
  closeCircleOutline,
  calendarOutline,
  alertCircleOutline,
  logInOutline,
  logOutOutline,
  filterOutline,
} from 'ionicons/icons';
import '../super-admin/super-admin.css';

const AttendancePage: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [showMarkModal, setShowMarkModal] = useState(false);
  const [selectedWorker, setSelectedWorker] = useState<any>(null);
  
  // Mock data for the current branch (Uptown Sanctuary)
  const [attendance, setAttendance] = useState([
    { id: 1, name: 'Dr. Aris Varma', role: 'Healer', checkIn: '08:50 AM', checkOut: '05:30 PM', status: 'present', shift: 'Full Day' },
    { id: 2, name: 'Julian Mars', role: 'Healer', checkIn: '09:00 AM', checkOut: null, status: 'present', shift: 'Morning' },
    { id: 3, name: 'Elena Gilbert', role: 'Staff', checkIn: '08:45 AM', checkOut: null, status: 'present', shift: 'Full Day' },
    { id: 4, name: 'Caroline Forbes', role: 'Staff', checkIn: null, checkOut: null, status: 'on-leave', shift: 'Full Day' },
    { id: 5, name: 'Bonnie Bennett', role: 'Admin Assistant', checkIn: '09:15 AM', checkOut: null, status: 'late', shift: 'Full Day' },
  ]);

  const filteredAttendance = attendance.filter(record => 
    record.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    record.role.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleUpdateStatus = (id: number, newStatus: string) => {
    const now = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    setAttendance(attendance.map(a => {
      if (a.id === id) {
        let update = { ...a, status: newStatus };
        if (newStatus === 'present' && !a.checkIn) {
          update.checkIn = now;
        } else if (newStatus === 'absent' || newStatus === 'on-leave') {
          update.checkIn = null;
          update.checkOut = null;
        }
        return update;
      }
      return a;
    }));
    setShowMarkModal(false);
  };

  const handleCheckOut = (id: number) => {
    // const now = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    // setAttendance(attendance.map(a => 
    //   a.id === id ? { ...a, checkOut: now } : a
    // ));
  };

  return (
    <IonPage className="sa-page">
      <IonHeader className="ion-no-border">
        <IonToolbar className="sa-page__toolbar">
          <IonButtons slot="start">
            <IonMenuButton />
          </IonButtons>
          <IonTitle className="sa-page__toolbar-title">Branch Attendance</IonTitle>
          <IonButtons slot="end">
            <button className="sa-page__toolbar-avatar">BA</button>
          </IonButtons>
        </IonToolbar>
      </IonHeader>

      <IonContent className="sa-page__content">
        <div className="sa-page__body">
          <div className="sa-page__header">
            <div className="sa-page__header-row">
              <div>
                <h1 className="sa-page__title">Staff Attendance</h1>
                <p className="sa-page__subtitle">Mark and monitor daily attendance for Uptown Sanctuary</p>
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
                <div className="sa-stat-card__label">Late/Leave</div>
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
                placeholder="Search staff by name or role..." 
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
                  <th>Staff Name</th>
                  <th>Role</th>
                  <th>Check In</th>
                  <th>Check Out</th>
                  <th>Status</th>
                  <th>Date</th>
                  <th>Actions</th>
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
                    <td>
                      <div className="sa-table__actions">
                        <button 
                          className="sa-btn sa-btn--sm sa-btn--primary"
                          onClick={() => { setSelectedWorker(record); setShowMarkModal(true); }}
                        >
                          Mark Status
                        </button>
                        {record.status === 'present' && !record.checkOut && (
                          <button 
                            className="sa-btn sa-btn--sm sa-btn--outline"
                            onClick={() => handleCheckOut(record.id)}
                          >
                            Check Out
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </IonContent>

      {/* Mark Attendance Modal */}
      <IonModal isOpen={showMarkModal} onDidDismiss={() => setShowMarkModal(false)} className="sa-modal sa-modal--sm">
        <div className="sa-modal__content">
          <div className="sa-modal__header">
            <h2>Update Attendance</h2>
            <button className="sa-modal__close-btn" onClick={() => setShowMarkModal(false)}>×</button>
          </div>
          <div className="sa-modal__body">
            {selectedWorker && (
              <div style={{ textAlign: 'center', marginBottom: '20px' }}>
                <h3 style={{ margin: '0 0 4px 0' }}>{selectedWorker.name}</h3>
                <p className="sa-text-muted">{selectedWorker.role}</p>
              </div>
            )}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <button 
                className={`sa-btn ${selectedWorker?.status === 'present' ? 'sa-btn--primary' : 'sa-btn--outline'}`}
                onClick={() => handleUpdateStatus(selectedWorker.id, 'present')}
              >
                Mark Present
              </button>
              <button 
                className={`sa-btn ${selectedWorker?.status === 'late' ? 'sa-btn--primary' : 'sa-btn--outline'}`}
                onClick={() => handleUpdateStatus(selectedWorker.id, 'late')}
              >
                Mark Late
              </button>
              <button 
                className={`sa-btn ${selectedWorker?.status === 'absent' ? 'sa-btn--primary' : 'sa-btn--outline'}`}
                onClick={() => handleUpdateStatus(selectedWorker.id, 'absent')}
              >
                Mark Absent
              </button>
              <button 
                className={`sa-btn ${selectedWorker?.status === 'on-leave' ? 'sa-btn--primary' : 'sa-btn--outline'}`}
                onClick={() => handleUpdateStatus(selectedWorker.id, 'on-leave')}
              >
                On Leave
              </button>
            </div>
          </div>
          <div className="sa-modal__footer">
            <button className="sa-btn sa-btn--outline" onClick={() => setShowMarkModal(false)}>Cancel</button>
          </div>
        </div>
      </IonModal>
    </IonPage>
  );
};

export default AttendancePage;
