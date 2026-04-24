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
  logInOutline,
  logOutOutline,
  timeOutline,
  peopleOutline,
  checkmarkCircleOutline,
  filterOutline,
  calendarOutline,
} from 'ionicons/icons';
import '../super-admin/super-admin.css';

const VisitorLogPage: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [showCheckInModal, setShowCheckInModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedVisitor, setSelectedVisitor] = useState<any>(null);
  
  // Mock data for the current branch (Uptown Sanctuary)
  const [visitors, setVisitors] = useState([
    { id: 1, name: 'John Smith', phone: '+91 98765 43210', purpose: 'Consultation', checkIn: '09:15 AM', checkOut: '10:30 AM', status: 'checked-out', date: '2024-04-24' },
    { id: 2, name: 'Anita Rao', phone: '+91 98765 43211', purpose: 'Healing Session', checkIn: '10:00 AM', checkOut: null, status: 'checked-in', date: '2024-04-24' },
    { id: 3, name: 'Priya Sharma', phone: '+91 98765 43213', purpose: 'Healing Session', checkIn: '11:30 AM', checkOut: null, status: 'checked-in', date: '2024-04-24' },
    { id: 4, name: 'Caroline Forbes', phone: '+91 98765 43214', purpose: 'Consultation', checkIn: '12:00 PM', checkOut: null, status: 'checked-in', date: '2024-04-24' },
  ]);

  const [newVisitor, setNewVisitor] = useState({
    name: '',
    phone: '',
    purpose: 'Healing Session',
  });

  const handleCheckIn = () => {
    if (!newVisitor.name || !newVisitor.phone) return;
    
    const visitorObj = {
      id: visitors.length + 1,
      ...newVisitor,
      checkIn: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      checkOut: null,
      status: 'checked-in',
      date: new Date().toISOString().split('T')[0]
    };

    setVisitors([visitorObj, ...visitors]);
    setNewVisitor({ name: '', phone: '', purpose: 'Healing Session' });
    setShowCheckInModal(false);
  };

  const handleCheckOut = (id: number) => {
    setVisitors(visitors.map(v => 
      v.id === id 
        ? { ...v, status: 'checked-out', checkOut: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) } 
        : v
    ));
  };

  const filteredVisitors = visitors.filter(visitor => 
    visitor.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    visitor.purpose.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <IonPage className="sa-page">
      <IonHeader className="ion-no-border">
        <IonToolbar className="sa-page__toolbar">
          <IonButtons slot="start">
            <IonMenuButton />
          </IonButtons>
          <IonTitle className="sa-page__toolbar-title">Branch Visitor Log</IonTitle>
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
                <h1 className="sa-page__title">Visitor Management</h1>
                <p className="sa-page__subtitle">Daily visitor tracking for Uptown Sanctuary</p>
              </div>
              <div className="sa-page__header-actions">
                <button className="sa-btn sa-btn--primary" onClick={() => setShowCheckInModal(true)}>
                  <IonIcon icon={logInOutline} /> Check-In Visitor
                </button>
              </div>
            </div>
          </div>

          <div className="sa-stats sa-stats--3">
            <div className="sa-stat-card">
              <div className="sa-stat-card__icon sa-stat-card__icon--primary">
                <IonIcon icon={peopleOutline} />
              </div>
              <div>
                <div className="sa-stat-card__label">Total (Today)</div>
                <div className="sa-stat-card__value">{visitors.length}</div>
              </div>
            </div>
            <div className="sa-stat-card">
              <div className="sa-stat-card__icon sa-stat-card__icon--warning">
                <IonIcon icon={timeOutline} />
              </div>
              <div>
                <div className="sa-stat-card__label">In Branch</div>
                <div className="sa-stat-card__value">{visitors.filter(v => v.status === 'checked-in').length}</div>
              </div>
            </div>
            <div className="sa-stat-card">
              <div className="sa-stat-card__icon sa-stat-card__icon--success">
                <IonIcon icon={checkmarkCircleOutline} />
              </div>
              <div>
                <div className="sa-stat-card__label">Checked Out</div>
                <div className="sa-stat-card__value">{visitors.filter(v => v.status === 'checked-out').length}</div>
              </div>
            </div>
          </div>

          <div className="sa-section-header" style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
            <div className="sa-search">
              <IonIcon icon={searchOutline} />
              <input 
                placeholder="Search by visitor name or purpose..." 
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
                  <th>Visitor</th>
                  <th>Purpose</th>
                  <th>Check In</th>
                  <th>Check Out</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredVisitors.map((visitor) => (
                  <tr key={visitor.id}>
                    <td>
                      <div className="sa-table__user">
                        <div className="sa-table__avatar sa-table__avatar--visitor">
                          {visitor.name.split(' ').map(n => n[0]).join('')}
                        </div>
                        <div className="sa-table__user-info">
                          <span className="sa-table__user-name">{visitor.name}</span>
                          <span className="sa-table__user-email">{visitor.phone}</span>
                        </div>
                      </div>
                    </td>
                    <td>
                      <span className="sa-visitor-purpose">{visitor.purpose}</span>
                    </td>
                    <td>
                      <div className="sa-table__time">
                        <IonIcon icon={timeOutline} /> {visitor.checkIn}
                      </div>
                    </td>
                    <td>
                      <div className="sa-table__time">
                        {visitor.checkOut ? (
                          <><IonIcon icon={timeOutline} /> {visitor.checkOut}</>
                        ) : (
                          <span className="sa-text-muted">--:--</span>
                        )}
                      </div>
                    </td>
                    <td>
                      <span className={`sa-badge sa-badge--${visitor.status}`}>
                        {visitor.status.replace('-', ' ')}
                      </span>
                    </td>
                    <td>
                      <div className="sa-table__actions">
                        {visitor.status === 'checked-in' && (
                          <button 
                            className="sa-btn sa-btn--sm sa-btn--primary"
                            onClick={() => handleCheckOut(visitor.id)}
                          >
                            <IonIcon icon={logOutOutline} /> Check Out
                          </button>
                        )}
                        <button className="sa-table__action-btn" onClick={() => { setSelectedVisitor(visitor); setShowDetailsModal(true); }}>
                          <IonIcon icon={calendarOutline} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </IonContent>

      {/* Check-In Modal */}
      <IonModal isOpen={showCheckInModal} onDidDismiss={() => setShowCheckInModal(false)} className="sa-modal sa-modal--sm">
        <div className="sa-modal__content">
          <div className="sa-modal__header">
            <h2>Visitor Check-In</h2>
            <button className="sa-modal__close-btn" onClick={() => setShowCheckInModal(false)}>×</button>
          </div>
          <div className="sa-modal__body">
            <div className="sa-settings__form-group">
              <label className="sa-settings__label">Full Name</label>
              <input 
                className="sa-settings__input" 
                placeholder="Visitor Name"
                value={newVisitor.name}
                onChange={(e) => setNewVisitor({ ...newVisitor, name: e.target.value })}
              />
            </div>
            <div className="sa-settings__form-group">
              <label className="sa-settings__label">Phone Number</label>
              <input 
                className="sa-settings__input" 
                placeholder="+91 XXXXX XXXXX"
                value={newVisitor.phone}
                onChange={(e) => setNewVisitor({ ...newVisitor, phone: e.target.value })}
              />
            </div>
            <div className="sa-settings__form-group">
              <label className="sa-settings__label">Purpose</label>
              <select 
                className="sa-settings__input"
                value={newVisitor.purpose}
                onChange={(e) => setNewVisitor({ ...newVisitor, purpose: e.target.value })}
              >
                <option>Healing Session</option>
                <option>Consultation</option>
                <option>Inquiry</option>
                <option>Other</option>
              </select>
            </div>
          </div>
          <div className="sa-modal__footer">
            <button className="sa-btn sa-btn--outline" onClick={() => setShowCheckInModal(false)}>Cancel</button>
            <button className="sa-btn sa-btn--primary" onClick={handleCheckIn}>Check-In</button>
          </div>
        </div>
      </IonModal>

      {/* Details Modal */}
      <IonModal isOpen={showDetailsModal} onDidDismiss={() => setShowDetailsModal(false)} className="sa-modal sa-modal--sm">
        <div className="sa-modal__content">
          <div className="sa-modal__header">
            <h2>Visitor Details</h2>
            <button className="sa-modal__close-btn" onClick={() => setShowDetailsModal(false)}>×</button>
          </div>
          {selectedVisitor && (
            <div className="sa-modal__body">
              <div className="sa-visitor-detail-item">
                <span className="sa-visitor-detail-label">Name:</span>
                <span className="sa-visitor-detail-value">{selectedVisitor.name}</span>
              </div>
              <div className="sa-visitor-detail-item">
                <span className="sa-visitor-detail-label">Phone:</span>
                <span className="sa-visitor-detail-value">{selectedVisitor.phone}</span>
              </div>
              <div className="sa-visitor-detail-item">
                <span className="sa-visitor-detail-label">Purpose:</span>
                <span className="sa-visitor-detail-value">{selectedVisitor.purpose}</span>
              </div>
              <div className="sa-visitor-detail-item">
                <span className="sa-visitor-detail-label">In:</span>
                <span className="sa-visitor-detail-value">{selectedVisitor.checkIn}</span>
              </div>
              {selectedVisitor.checkOut && (
                <div className="sa-visitor-detail-item">
                  <span className="sa-visitor-detail-label">Out:</span>
                  <span className="sa-visitor-detail-value">{selectedVisitor.checkOut}</span>
                </div>
              )}
            </div>
          )}
          <div className="sa-modal__footer">
            <button className="sa-btn sa-btn--primary" onClick={() => setShowDetailsModal(false)}>Close</button>
          </div>
        </div>
      </IonModal>
    </IonPage>
  );
};

export default VisitorLogPage;
