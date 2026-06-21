import React, { useState, useRef } from 'react';
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
  useIonViewWillEnter,
  useIonViewDidEnter,
  useIonViewDidLeave,
} from '@ionic/react';
import {
  searchOutline,
  timeOutline,
  businessOutline,
  peopleOutline,
  checkmarkCircleOutline,
  filterOutline,
  calendarOutline,
} from 'ionicons/icons';
import { getVisitorLog } from '../../api/visitor.api';
import './super-admin.css';

const VisitorLogPage: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [showCheckInModal, setShowCheckInModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedVisitor, setSelectedVisitor] = useState<any>(null);
  
  const [visitors, setVisitors] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const intervalRef = useRef<any>(null);

  useIonViewWillEnter(() => {
    fetchVisitors();
  });

  useIonViewDidEnter(() => {
    // Auto-refresh every 10 seconds while the page is visible
    intervalRef.current = setInterval(() => {
      fetchVisitors();
    }, 10000);
  });

  useIonViewDidLeave(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
  });

  const fetchVisitors = async () => {
    setLoading(true);
    try {
      const res = await getVisitorLog();
      const data = res.data || res;
      if (Array.isArray(data)) {
        setVisitors(data);
      }
    } catch (error) {
      console.error('Failed to fetch visitors:', error);
    } finally {
      setLoading(false);
    }
  };

  const [newVisitor, setNewVisitor] = useState({
    name: '',
    phone: '',
    purpose: 'Healing Session',
    branch: 'Uptown Sanctuary',
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
    setNewVisitor({ name: '', phone: '', purpose: 'Healing Session', branch: 'Uptown Sanctuary' });
    setShowCheckInModal(false);
  };

  const handleCheckOut = (id: number) => {
    setVisitors(visitors.map(v => 
      v.id === id 
        ? { ...v, status: 'checked-out', checkOut: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) } 
        : v
    ));
  };

  const filteredVisitors = visitors.filter(visitor => {
    const branchName = visitor.branch?.name || '';
    const matchesSearch = visitor.name?.toLowerCase().includes(searchQuery.toLowerCase()) || 
           branchName.toLowerCase().includes(searchQuery.toLowerCase()) ||
           visitor.purpose?.toLowerCase().includes(searchQuery.toLowerCase());

    let visitorDateStr = '';
    if (visitor.checkIn) {
      const d = new Date(visitor.checkIn);
      const year = d.getFullYear();
      const month = String(d.getMonth() + 1).padStart(2, '0');
      const day = String(d.getDate()).padStart(2, '0');
      visitorDateStr = `${year}-${month}-${day}`;
    }

    const matchesDate = !selectedDate || visitorDateStr === selectedDate;

    return matchesSearch && matchesDate;
  });

  const getStatus = (visitor: any) => visitor.checkOut ? 'checked-out' : 'checked-in';

  return (
    <IonPage className="sa-page">
      <IonHeader className="ion-no-border">
        <IonToolbar className="sa-page__toolbar">
          <IonButtons slot="start">
            <IonMenuButton />
          </IonButtons>
          <IonTitle className="sa-page__toolbar-title">Daily Visitor Log</IonTitle>
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
                <h1 className="sa-page__title">Visitor Tracking</h1>
                <p className="sa-page__subtitle">Real-time log of all visitors across branch locations</p>
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

          <div className="sa-stats sa-stats--3">
            <div className="sa-stat-card">
              <div className="sa-stat-card__icon sa-stat-card__icon--primary">
                <IonIcon icon={peopleOutline} />
              </div>
              <div>
                <div className="sa-stat-card__label">Total Visitors (Today)</div>
                <div className="sa-stat-card__value">{visitors.length}</div>
              </div>
            </div>
            <div className="sa-stat-card">
              <div className="sa-stat-card__icon sa-stat-card__icon--warning">
                <IonIcon icon={timeOutline} />
              </div>
              <div>
                <div className="sa-stat-card__label">Currently Inside</div>
                <div className="sa-stat-card__value">{visitors.filter(v => getStatus(v) === 'checked-in').length}</div>
              </div>
            </div>
            <div className="sa-stat-card">
              <div className="sa-stat-card__icon sa-stat-card__icon--success">
                <IonIcon icon={checkmarkCircleOutline} />
              </div>
              <div>
                <div className="sa-stat-card__label">Check-outs Today</div>
                <div className="sa-stat-card__value">{visitors.filter(v => getStatus(v) === 'checked-out').length}</div>
              </div>
            </div>
          </div>

          <div className="sa-section-header" style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
            <div className="sa-search">
              <IonIcon icon={searchOutline} />
              <input 
                placeholder="Search by visitor name, branch or purpose..." 
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
                  <th>Visitor Details</th>
                  <th>Purpose</th>
                  <th>Branch</th>
                  <th>Check In</th>
                  <th>Check Out</th>
                  <th>Status</th>
                  <th>Date</th>
                </tr>
              </thead>
              <tbody>
                {filteredVisitors.length > 0 ? (
                  filteredVisitors.map((visitor) => {
                    const checkInDate = new Date(visitor.checkIn);
                    const checkOutDate = visitor.checkOut ? new Date(visitor.checkOut) : null;
                    const status = getStatus(visitor);
                    
                    return (
                      <tr key={visitor.id}>
                        <td>
                          <div className="sa-table__user">
                            <div className="sa-table__avatar sa-table__avatar--visitor">
                              {visitor.name?.split(' ').map((n: string) => n[0]).join('').substring(0,2).toUpperCase() || 'V'}
                            </div>
                            <div className="sa-table__user-info">
                              <span className="sa-table__user-name">{visitor.name}</span>
                              <span className="sa-table__user-email">{visitor.phone || 'No Phone'}</span>
                            </div>
                          </div>
                        </td>
                        <td>
                          <span className="sa-visitor-purpose">{visitor.purpose || visitor.visitorType || 'N/A'}</span>
                        </td>
                        <td>
                          <div className="sa-table__branch-info">
                            <IonIcon icon={businessOutline} /> {visitor.branch?.name || 'Unknown'}
                          </div>
                        </td>
                        <td>
                          <div className="sa-table__time">
                            <IonIcon icon={timeOutline} /> {checkInDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </div>
                        </td>
                        <td>
                          <div className="sa-table__time">
                            {checkOutDate ? (
                              <><IonIcon icon={timeOutline} /> {checkOutDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</>
                            ) : (
                              <span className="sa-text-muted">--:--</span>
                            )}
                          </div>
                        </td>
                        <td>
                          <span className={`sa-badge sa-badge--${status}`}>
                            {status.replace('-', ' ')}
                          </span>
                        </td>
                        <td>
                          <div className="sa-table__date">
                            <IonIcon icon={calendarOutline} />
                            {checkInDate.toLocaleDateString()}
                          </div>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan={7} style={{ textAlign: 'center', padding: '40px 20px', color: 'var(--color-text-muted)' }}>
                      No visitors found matching your criteria.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </IonContent>
    </IonPage>
  );
};

export default VisitorLogPage;
