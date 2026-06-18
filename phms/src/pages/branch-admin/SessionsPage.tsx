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
  IonModal,
  useIonToast,
  useIonViewWillEnter,
} from '@ionic/react';
import {
  searchOutline,
  calendarOutline,
  checkmarkCircleOutline,
  timeOutline,
  closeCircleOutline,
  chevronBackOutline,
  chevronForwardOutline,
  addOutline,
  peopleOutline,
  medkitOutline,
  alertCircleOutline,
  cashOutline,
  starOutline,
  star,
  pencilOutline,
  eyeOutline,
  trashOutline,
  notificationsOutline,
  downloadOutline,
  shieldCheckmarkOutline,
} from 'ionicons/icons';
import { useHistory } from 'react-router-dom';
import { useAuthStore } from '../../store/auth.store';
import { ROUTES } from '../../constants/routes.constant';
import { getSessions, deleteSession } from '../../api/session.api';
import './branch-admin.css';

export interface HealingSession {
  id: string | number;
  sessionNo: string; // S-0001 per patient sequential
  date: string;
  startTime: string;
  endTime: string;
  patient: string;
  healer: string;
  type: string;
  status: 'Completed' | 'Scheduled' | 'Cancelled';
  paymentStatus: 'Paid' | 'Pending';
  paymentMethod?: 'Cash' | 'UPI';
  followUp: {
    required: boolean;
    urgency: 'Urgent' | 'Pending' | 'None';
  };
  notes?: {
    treatmentType: string;
    observations: string;
    detailedNotes: string;
    recommendation: string;
  };
  feedback?: {
    rating: number;
    comment: string;
  };
}

const SessionsPage: React.FC = () => {
  const history = useHistory();
  const { user } = useAuthStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('All');
  const [dateRange, setDateRange] = useState('All Sessions');
  const [selectedDate, setSelectedDate] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  
  // Modals & States
  const [selectedSession, setSelectedSession] = useState<HealingSession | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [sessionToDelete, setSessionToDelete] = useState<string | number | null>(null);
  const [present] = useIonToast();

  const triggerToast = (msg: string, color: 'success' | 'danger' = 'success') => {
    present({
      message: msg,
      duration: 3000,
      position: 'top',
      color: color,
    });
  };

  const itemsPerPage = 5;

  const rawRole = user?.role || 'BRANCH_ADMIN'; // BRANCH_ADMIN | HEALER | PATIENT
  const rawBranch = typeof user?.branch === 'object' && user?.branch !== null
    ? (user.branch as any).name
    : (user?.branch || 'Mumbai');
  const branchName = rawBranch.toLowerCase().includes('branch') ? rawBranch : `${rawBranch} Branch`;

  const todayStr = new Date().toISOString().split('T')[0];
  const yesterdayStr = new Date(Date.now() - 86400000).toISOString().split('T')[0];

  const [sessions, setSessions] = useState<HealingSession[]>([]);

  const fetchSessions = async () => {
    try {
      const res = await getSessions();
      if (res.success && res.data) {
        const mappedSessions: HealingSession[] = res.data.map((s: any, index: number) => ({
          id: s.id || index,
          sessionNo: `S-${String(index + 1).padStart(4, '0')}`,
          date: s.session_date ? s.session_date.split('T')[0] : todayStr,
          startTime: s.start_time || '10:00 AM',
          endTime: s.end_time || '11:00 AM',
          patient: s.patient_name || 'Unknown Patient',
          healer: s.healer_name || 'Unknown Healer',
          type: s.treatment_type || 'Pranic Healing',
          status: s.status === 'scheduled' ? 'Scheduled' : s.status === 'completed' ? 'Completed' : s.status === 'cancelled' ? 'Cancelled' : s.status || 'Scheduled',
          paymentStatus: s.payment_status || 'Pending',
          paymentMethod: s.payment_method || 'Cash',
          followUp: {
            required: !!s.followup_required,
            urgency: s.followup_priority || 'None'
          },
          notes: s.notes ? { detailedNotes: s.notes, treatmentType: s.treatment_type || '', observations: '', recommendation: '' } : undefined,
        }));
        console.log("Full API Response:", res);
    console.log("Response Data:", res.data);
        setSessions(mappedSessions);
      }
    } catch (error) {
      console.error('Failed to fetch sessions:', error);
      triggerToast('Failed to load sessions from database', 'danger');
    }
  };

  useEffect(() => {
    fetchSessions();
  }, []);

  useIonViewWillEnter(() => {
    fetchSessions();
  });





  // Helper: Sequentially calculate S-XXXX per patient name
  const getNextSessionNo = (patientName: string): string => {
    const patientSessions = sessions.filter(
      s => s.patient.toLowerCase().trim() === patientName.toLowerCase().trim()
    );
    const nextSeq = patientSessions.length + 1;
    return `S-${String(nextSeq).padStart(4, '0')}`;
  };



  // Delete Session Trigger
  const handleDeleteSession = (id: string | number) => {
    setSessionToDelete(id);
    setShowDeleteConfirm(true);
  };

  // Confirm Delete Handler
  const confirmDeleteSession = async () => {
    if (sessionToDelete !== null) {
      const session = sessions.find(s => s.id === sessionToDelete);
      if (session) {
        try {
          // Check if it's a UUID (string) or standard ID. If it's a UUID, call backend delete.
          if (typeof sessionToDelete === 'string' && sessionToDelete.includes('-')) {
            await deleteSession(sessionToDelete);
          }
          const updated = sessions.filter(s => s.id !== sessionToDelete);
          setSessions(updated);
          localStorage.setItem('phms_sessions', JSON.stringify(updated));

          // Audit Log recording
          const savedAudits = localStorage.getItem('phms_audits') || '[]';
          const audits = JSON.parse(savedAudits);
          const newAudit = {
            id: `A-${Math.floor(1000 + Math.random() * 9000)}`,
            action: 'SESSION_DELETION',
            details: `Deleted Session record ${session.sessionNo} for Patient ${session.patient} assigned to Healer ${session.healer}.`,
            changedBy: user?.name || user?.email || 'Aria Seraphina',
            timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19),
          };
          localStorage.setItem('phms_audits', JSON.stringify([newAudit, ...audits]));

          triggerToast(`Session record ${session.sessionNo} removed successfully.`);
        } catch (error) {
          console.error(error);
          triggerToast('Failed to delete session from database', 'danger');
        }
      }
      setShowDeleteConfirm(false);
      setSessionToDelete(null);
    }
  };



  // Mock PDF & Excel Export triggers
  const handleExport = (format: 'PDF' | 'Excel') => {
    alert(`Exporting Session Logs in ${format} format... Report will download momentarily.`);
  };

  // Filter Registry based on Scoped Roles
  const filteredSessions = sessions.filter((session) => {
    // 1. Role Scoped Restrictions
    if (rawRole === 'HEALER') {
      // Healer only sees their assigned patients' sessions
      if (session.healer !== user?.name && session.healer !== 'Dr. Aris Varma') {
        return false;
      }
    } else if (rawRole === 'PATIENT') {
      // Patient only views their own sessions
      if (session.patient.toLowerCase() !== 'elena gilbert') {
        return false;
      }
    }

    // 2. Main Search Match
    const matchesSearch =
      session.patient.toLowerCase().includes(searchQuery.toLowerCase()) ||
      session.healer.toLowerCase().includes(searchQuery.toLowerCase()) ||
      session.type.toLowerCase().includes(searchQuery.toLowerCase()) ||
      session.sessionNo.toLowerCase().includes(searchQuery.toLowerCase());

    // 3. Status Filters
    const matchesStatus = filterStatus === 'All' || session.status === filterStatus;

    // 4. Date Range Filters
    let matchesDate = true;
    if (dateRange === 'Today') {
      matchesDate = session.date === todayStr;
    } else if (dateRange === 'Yesterday') {
      matchesDate = session.date === yesterdayStr;
    } else if (dateRange === 'Last 7 Days') {
      const sevenDaysAgo = new Date(Date.now() - 7 * 86400000).toISOString().split('T')[0];
      matchesDate = session.date >= sevenDaysAgo;
    } else if (dateRange === 'Select Date' && selectedDate) {
      matchesDate = session.date === selectedDate;
    }

    return matchesSearch && matchesStatus && matchesDate;
  });

  // Calculate dynamic totals
  const totalCount = filteredSessions.length;
  const completedCount = filteredSessions.filter((s) => s.status === 'Completed').length;
  const scheduledCount = filteredSessions.filter((s) => s.status === 'Scheduled').length;
  const cancelledCount = filteredSessions.filter((s) => s.status === 'Cancelled').length;

  const totalPages = Math.ceil(totalCount / itemsPerPage) || 1;
  const paginatedSessions = filteredSessions.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, filterStatus, dateRange, selectedDate]);

  const getStatusBadgeClass = (status: string) => {
    switch (status.toLowerCase()) {
      case 'completed':
        return 'sa-badge--active'; // Green
      case 'scheduled':
        return 'sa-badge--pending'; // Orange
      case 'cancelled':
        return 'sa-badge--inactive'; // Red
      default:
        return '';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case 'completed':
        return checkmarkCircleOutline;
      case 'scheduled':
        return timeOutline;
      case 'cancelled':
        return closeCircleOutline;
      default:
        return timeOutline;
    }
  };

  const getPaymentBadgeClass = (status: string) => {
    switch (status.toLowerCase()) {
      case 'paid':
        return 'st-panel-badge--green';
      case 'pending':
        return 'sa-badge--inactive';
      default:
        return '';
    }
  };

  return (
    <IonPage className="sa-page">
      <IonHeader className="ion-no-border">
        <IonToolbar className="sa-page__toolbar">
          <IonButtons slot="start">
            <IonMenuButton />
          </IonButtons>
          <IonTitle className="sa-page__toolbar-title">Branch Healing Sessions</IonTitle>
          <IonButtons slot="end">
            <button className="sa-page__toolbar-avatar">{rawRole === 'HEALER' ? 'H' : rawRole === 'PATIENT' ? 'P' : 'BA'}</button>
          </IonButtons>
        </IonToolbar>
      </IonHeader>

      <IonContent className="sa-page__content">
        <div className="sa-page__body">
          
          {/* Page Title & Scoped Headers */}
          <div className="sa-page__header">
            <div className="sa-page__header-row">
              <div>
                <h1 className="sa-page__title">Session Management</h1>
                <p className="sa-page__subtitle">Book and monitor daily healing sessions for {branchName}</p>
              </div>
              <div className="sa-page__header-actions" style={{ display: 'flex', gap: '8px' }}>
                {/* <button className="sa-btn sa-btn--outline" onClick={() => handleExport('PDF')}>
                  <IonIcon icon={downloadOutline} style={{ marginRight: '4px' }} /> PDF
                </button>
                <button className="sa-btn sa-btn--outline" onClick={() => handleExport('Excel')}>
                  <IonIcon icon={downloadOutline} style={{ marginRight: '4px' }} /> Excel
                </button> */}
                {rawRole !== 'PATIENT' && (
                  <button className="sa-btn sa-btn--primary" onClick={() => history.push(ROUTES.BRANCH_ADMIN.BOOK_SESSION)}>
                    <IonIcon icon={addOutline} style={{ marginRight: '4px' }} /> Book Session
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Core Analytics Cards */}
          <div className="sa-stats sa-stats--4">
            <div className="sa-stat-card">
              <div className="sa-stat-card__icon sa-stat-card__icon--primary">
                <IonIcon icon={peopleOutline} />
              </div>
              <div>
                <div className="sa-stat-card__label">Total Sessions</div>
                <div className="sa-stat-card__value">{totalCount}</div>
              </div>
            </div>

            <div className="sa-stat-card">
              <div className="sa-stat-card__icon sa-stat-card__icon--warning">
                <IonIcon icon={timeOutline} style={{ color: '#c47a20' }} />
              </div>
              <div>
                <div className="sa-stat-card__label">Scheduled</div>
                <div className="sa-stat-card__value">{scheduledCount}</div>
              </div>
            </div>

            <div className="sa-stat-card">
              <div className="sa-stat-card__icon sa-stat-card__icon--success">
                <IonIcon icon={checkmarkCircleOutline} style={{ color: '#1a8a5a' }} />
              </div>
              <div>
                <div className="sa-stat-card__label">Completed</div>
                <div className="sa-stat-card__value">{completedCount}</div>
              </div>
            </div>

            <div className="sa-stat-card">
              <div className="sa-stat-card__icon sa-stat-card__icon--danger">
                <IonIcon icon={closeCircleOutline} style={{ color: '#e11d48' }} />
              </div>
              <div>
                <div className="sa-stat-card__label">Cancelled</div>
                <div className="sa-stat-card__value">{cancelledCount}</div>
              </div>
            </div>
          </div>

          {/* Advanced Filters Block */}
          <div className="sa-section-header" style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', marginTop: '32px' }}>
            <div className="sa-search" style={{ margin: 0, flex: 1.5 }}>
              <IonIcon icon={searchOutline} />
              <input
                placeholder="Search by ID, patient, healer, or treatment..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            <div className="sa-filter-group" style={{ display: 'flex', gap: '8px', flex: 3.5, flexWrap: 'wrap' }}>
              <select
                className="sa-input"
                style={{ flex: 1, minWidth: '130px' }}
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
              >
                <option value="All">All Statuses</option>
                <option value="Scheduled">Scheduled</option>
                <option value="Completed">Completed</option>
                <option value="Cancelled">Cancelled</option>
              </select>

              <select
                className="sa-input"
                style={{ flex: 1, minWidth: '140px' }}
                value={dateRange}
                onChange={(e) => setDateRange(e.target.value)}
              >
                <option value="All Sessions">All Sessions</option>
                <option value="Today">Today</option>
                <option value="Yesterday">Yesterday</option>
                <option value="Last 7 Days">Last 7 Days</option>
                <option value="Select Date">Select Date</option>
              </select>

              {dateRange === 'Select Date' && (
                <input
                  type="date"
                  className="sa-input"
                  style={{ flex: 1, minWidth: '140px' }}
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                />
              )}

              <button
                className="sa-btn sa-btn--outline"
                onClick={() => {
                  setSearchQuery('');
                  setFilterStatus('All');
                  setDateRange('All Sessions');
                  setSelectedDate('');
                }}
              >
                Clear
              </button>
            </div>
          </div>

          {/* Directory Ledger Table */}
          <div className="sa-section" style={{ padding: 0, overflow: 'hidden', marginTop: '20px' }}>
            <div className="sa-table-responsive">
              <table className="sa-table">
                <thead>
                  <tr>
                    {/* <th>Session ID</th> */}
                    <th>Patient</th>
                    <th>Healer</th>
                    <th>Treatment Type</th>
                    <th>Date &amp; Time</th>
                    <th>Status</th>
                    <th>Payment Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedSessions.length > 0 ? (
                    paginatedSessions.map((session) => (
                      <tr 
                        key={session.id} 
                        // style={{
                        //   background: session.followUp?.urgency === 'Urgent' ? '#fdf2f2' : 'transparent',
                        //   transition: 'all 0.2s ease',
                        // }}
                      >
                        {/* <td style={{ fontWeight: 'bold', color: 'var(--ba-color-primary)' }}>{session.sessionNo}</td> */}
                        <td>
                          <div className="sa-table__user">
                            <div className="sa-table__avatar sa-table__avatar--primary" style={{ width: '32px', height: '32px', fontSize: '12px' }}>
                              {session.patient.split(' ').map((n) => n[0]).join('')}
                            </div>
                            <span className="sa-table__user-name">{session.patient}</span>
                          </div>
                        </td>
                        <td>
                          <span style={{ fontWeight: 500 }}>{session.healer}</span>
                        </td>
                        <td>{session.type}</td>
                        <td>
                          <div style={{ display: 'flex', flexDirection: 'column' }}>
                            <span style={{ fontWeight: 600 }}>{session.date}</span>
                            <span style={{ fontSize: '12px', color: '#64748b' }}>
                              {session.startTime} - {session.endTime}
                            </span>
                          </div>
                        </td>
                        <td>
                          <span className={`sa-badge ${getStatusBadgeClass(session.status)}`} style={{ gap: '4px' }}>
                            <IonIcon icon={getStatusIcon(session.status)} style={{ fontSize: '14px' }} />
                            {session.status}
                          </span>
                        </td>
                        <td>
                          <span className={`st-panel-badge ${getPaymentBadgeClass(session.paymentStatus)}`}>
                            {session.paymentStatus}
                          </span>
                        </td>
                        <td>
                          <div className="sa-table__actions">
                            {/* View Notes */}
                            <button
                              className="sa-table__action-btn"
                              title="View Observations"
                              onClick={() => {
                                history.push(ROUTES.BRANCH_ADMIN.SESSION_DETAILS.replace(':id', session.id.toString()));
                              }}
                            >
                              <IonIcon icon={eyeOutline} />
                            </button>

                             {/* Edit Session Scoped for non-patients */}
                             {rawRole !== 'PATIENT' && (
                              <button
                                className="sa-table__action-btn"
                                title="Edit Session"
                                onClick={() => history.push(ROUTES.BRANCH_ADMIN.EDIT_SESSION.replace(':id', session.id.toString()))}
                              >
                                <IonIcon icon={pencilOutline} style={{ color: '#6366f1' }} />
                              </button>
                            )}

                            {/* Record Payment Action Scoped for non-patients */}
                            {/* {rawRole !== 'PATIENT' && session.paymentStatus === 'Pending' && (
                              <button
                                className="sa-table__action-btn"
                                title="Record Payment"
                                style={{ background: '#ecfdf5', borderColor: '#a7f3d0' }}
                                onClick={() => {
                                  history.push(`/branch-admin/finance?tab=payments&recordPayment=true&patientName=${encodeURIComponent(session.patient)}&sessionNo=${encodeURIComponent(session.sessionNo)}`);
                                }}
                              >
                                <IonIcon icon={cashOutline} style={{ color: '#0d5c46' }} />
                              </button>
                            )} */}

                            {/* Delete Action Scoped for Admins */}
                            {rawRole === 'BRANCH_ADMIN' && (
                              <button
                                className="sa-table__action-btn sa-table__action-btn--danger"
                                title="Delete Session"
                                onClick={() => handleDeleteSession(session.id)}
                              >
                                <IonIcon icon={trashOutline} />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={8} style={{ textAlign: 'center', padding: '40px 0' }}>
                        <div className="sa-empty-state" style={{ border: 'none', background: 'transparent', margin: '0' }}>
                          <div className="sa-empty-state__icon">
                            <IonIcon icon={calendarOutline} />
                          </div>
                          <h3 className="sa-empty-state__title">No sessions registered</h3>
                          <p className="sa-empty-state__text">
                            {searchQuery
                              ? `No session matching "${searchQuery}" was found.`
                              : `There are currently no sessions logged for the selected filters.`}
                          </p>
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="sa-table__footer">
                <div className="sa-pagination__controls" style={{ order: 2 }}>
                  <button
                    className="sa-pagination__btn"
                    disabled={currentPage === 1}
                    onClick={() => setCurrentPage((c) => Math.max(c - 1, 1))}
                  >
                    <IonIcon icon={chevronBackOutline} />
                  </button>
                  {[...Array(totalPages)].map((_, i) => (
                    <button
                      key={i}
                      className={`sa-pagination__btn ${currentPage === i + 1 ? 'sa-pagination__btn--active' : ''}`}
                      onClick={() => setCurrentPage(i + 1)}
                    >
                      {i + 1}
                    </button>
                  ))}
                  <button
                    className="sa-pagination__btn"
                    disabled={currentPage === totalPages}
                    onClick={() => setCurrentPage((c) => Math.min(c + 1, totalPages))}
                  >
                    <IonIcon icon={chevronForwardOutline} />
                  </button>
                </div>
                <div className="sa-pagination__info" style={{ order: 1 }}>
                  Showing {(currentPage - 1) * itemsPerPage + 1} to{' '}
                  {Math.min(currentPage * itemsPerPage, filteredSessions.length)} of{' '}
                  {filteredSessions.length} registered sessions
                </div>
              </div>
            )}
          </div>
        </div>

        {/* ── MODAL: CONFIRM DELETE SESSION ────────────────────────────── */}
        {showDeleteConfirm && sessionToDelete !== null && (
          <div style={{ position: 'fixed', inset: 0, background: 'rgba(15,23,42,0.6)', zIndex: 100000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px' }}>
            <div style={{ background: '#fff', borderRadius: '16px', padding: '32px', maxWidth: '450px', width: '100%', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)', textAlign: 'center' }}>
              <div style={{ fontSize: '50px', color: '#ef4444', marginBottom: '16px' }}><IonIcon icon={alertCircleOutline} /></div>
              <h2 style={{ margin: 0, fontSize: '18px', fontWeight: 800, color: '#1e293b' }}>Delete Session</h2>
              
              <p style={{ fontSize: '13px', color: '#64748b', marginTop: '10px', lineHeight: 1.6 }}>
                Are you sure you want to delete this session record? This operation permanently removes all diagnostic observations, notes, and billing history from the branch database registry.
              </p>

              <div style={{ display: 'flex', gap: '10px', marginTop: '24px', justifyContent: 'center' }}>
                <button onClick={() => { setShowDeleteConfirm(false); setSessionToDelete(null); }} className="sa-btn sa-btn--outline" style={{ fontSize: '12px', padding: '8px 20px', flex: 1 }}>Cancel</button>
                <button 
                  onClick={confirmDeleteSession} 
                  className="sa-btn sa-btn--primary" 
                  style={{ fontSize: '12px', padding: '8px 20px', flex: 1, background: '#ef4444', borderColor: '#ef4444' }}
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        )}
      </IonContent>
    </IonPage>
  );
};

export default SessionsPage;
