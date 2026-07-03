// import React, { useState } from 'react';
// import {
//   IonPage,
//   IonContent,
//   IonHeader,
//   IonToolbar,
//   IonTitle,
//   IonButtons,
//   IonIcon,
//   IonMenuButton,
//   IonModal,
// } from '@ionic/react';
// import {
//   searchOutline,
//   logInOutline,
//   logOutOutline,
//   timeOutline,
//   peopleOutline,
//   checkmarkCircleOutline,
//   filterOutline,
//   calendarOutline,
// } from 'ionicons/icons';
// import '../super-admin/super-admin.css';

// const VisitorLogPage: React.FC = () => {
//   const [searchQuery, setSearchQuery] = useState('');
//   const [showCheckInModal, setShowCheckInModal] = useState(false);
//   const [showDetailsModal, setShowDetailsModal] = useState(false);
//   const [selectedVisitor, setSelectedVisitor] = useState<any>(null);
  
//   // Mock data for the current branch (Uptown Sanctuary)
//   const [visitors, setVisitors] = useState([
//     { id: 1, name: 'John Smith', phone: '+91 98765 43210', purpose: 'Consultation', checkIn: '09:15 AM', checkOut: '10:30 AM', status: 'checked-out', date: '2024-04-24' },
//     { id: 2, name: 'Anita Rao', phone: '+91 98765 43211', purpose: 'Healing Session', checkIn: '10:00 AM', checkOut: null, status: 'checked-in', date: '2024-04-24' },
//     { id: 3, name: 'Priya Sharma', phone: '+91 98765 43213', purpose: 'Healing Session', checkIn: '11:30 AM', checkOut: null, status: 'checked-in', date: '2024-04-24' },
//     { id: 4, name: 'Caroline Forbes', phone: '+91 98765 43214', purpose: 'Consultation', checkIn: '12:00 PM', checkOut: null, status: 'checked-in', date: '2024-04-24' },
//   ]);

//   const [newVisitor, setNewVisitor] = useState({
//     name: '',
//     phone: '',
//     purpose: 'Healing Session',
//   });

//   const handleCheckIn = () => {
//     if (!newVisitor.name || !newVisitor.phone) return;
    
//     const visitorObj = {
//       id: visitors.length + 1,
//       ...newVisitor,
//       checkIn: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
//       checkOut: null,
//       status: 'checked-in',
//       date: new Date().toISOString().split('T')[0]
//     };

//     setVisitors([visitorObj, ...visitors]);
//     setNewVisitor({ name: '', phone: '', purpose: 'Healing Session' });
//     setShowCheckInModal(false);
//   };

//   const handleCheckOut = (id: number) => {
//     setVisitors(visitors.map(v => 
//       v.id === id 
//         ? { ...v, status: 'checked-out', checkOut: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) } 
//         : v
//     ));
//   };

//   const filteredVisitors = visitors.filter(visitor => 
//     visitor.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
//     visitor.purpose.toLowerCase().includes(searchQuery.toLowerCase())
//   );

//   return (
//     <IonPage className="sa-page">
//       <IonHeader className="ion-no-border">
//         <IonToolbar className="sa-page__toolbar">
//           <IonButtons slot="start">
//             <IonMenuButton />
//           </IonButtons>
//           <IonTitle className="sa-page__toolbar-title">Branch Visitor Log</IonTitle>
//           <IonButtons slot="end">
//             <ProfileDropdown />
//           </IonButtons>
//         </IonToolbar>
//       </IonHeader>

//       <IonContent className="sa-page__content">
//         <div className="sa-page__body">
//           <div className="sa-page__header">
//             <div className="sa-page__header-row">
//               <div>
//                 <h1 className="sa-page__title">Visitor Management</h1>
//                 <p className="sa-page__subtitle">Daily visitor tracking for Uptown Sanctuary</p>
//               </div>
//               <div className="sa-page__header-actions">
//                 <button className="sa-btn sa-btn--primary" onClick={() => setShowCheckInModal(true)}>
//                   <IonIcon icon={logInOutline} /> Check-In Visitor
//                 </button>
//               </div>
//             </div>
//           </div>

//           <div className="sa-stats sa-stats--3">
//             <div className="sa-stat-card">
//               <div className="sa-stat-card__icon sa-stat-card__icon--primary">
//                 <IonIcon icon={peopleOutline} />
//               </div>
//               <div>
//                 <div className="sa-stat-card__label">Total (Today)</div>
//                 <div className="sa-stat-card__value">{visitors.length}</div>
//               </div>
//             </div>
//             <div className="sa-stat-card">
//               <div className="sa-stat-card__icon sa-stat-card__icon--warning">
//                 <IonIcon icon={timeOutline} />
//               </div>
//               <div>
//                 <div className="sa-stat-card__label">In Branch</div>
//                 <div className="sa-stat-card__value">{visitors.filter(v => v.status === 'checked-in').length}</div>
//               </div>
//             </div>
//             <div className="sa-stat-card">
//               <div className="sa-stat-card__icon sa-stat-card__icon--success">
//                 <IonIcon icon={checkmarkCircleOutline} />
//               </div>
//               <div>
//                 <div className="sa-stat-card__label">Checked Out</div>
//                 <div className="sa-stat-card__value">{visitors.filter(v => v.status === 'checked-out').length}</div>
//               </div>
//             </div>
//           </div>

//           <div className="sa-section-header" style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
//             <div className="sa-search">
//               <IonIcon icon={searchOutline} />
//               <input 
//                 placeholder="Search by visitor name or purpose..." 
//                 value={searchQuery}
//                 onChange={(e) => setSearchQuery(e.target.value)}
//               />
//             </div>
//             <button className="sa-btn sa-btn--outline" style={{ marginBottom: '20px' }}>
//               <IonIcon icon={filterOutline} /> Filter
//             </button>
//           </div>

//           <div className="sa-section" style={{ padding: 0, overflow: 'hidden' }}>
//             <table className="sa-table">
//               <thead>
//                 <tr>
//                   <th>Visitor</th>
//                   <th>Purpose</th>
//                   <th>Check In</th>
//                   <th>Check Out</th>
//                   <th>Status</th>
//                   <th>Actions</th>
//                 </tr>
//               </thead>
//               <tbody>
//                 {filteredVisitors.map((visitor) => (
//                   <tr key={visitor.id}>
//                     <td>
//                       <div className="sa-table__user">
//                         <div className="sa-table__avatar sa-table__avatar--visitor">
//                           {visitor.name.split(' ').map(n => n[0]).join('')}
//                         </div>
//                         <div className="sa-table__user-info">
//                           <span className="sa-table__user-name">{visitor.name}</span>
//                           <span className="sa-table__user-email">{visitor.phone}</span>
//                         </div>
//                       </div>
//                     </td>
//                     <td>
//                       <span className="sa-visitor-purpose">{visitor.purpose}</span>
//                     </td>
//                     <td>
//                       <div className="sa-table__time">
//                         <IonIcon icon={timeOutline} /> {visitor.checkIn}
//                       </div>
//                     </td>
//                     <td>
//                       <div className="sa-table__time">
//                         {visitor.checkOut ? (
//                           <><IonIcon icon={timeOutline} /> {visitor.checkOut}</>
//                         ) : (
//                           <span className="sa-text-muted">--:--</span>
//                         )}
//                       </div>
//                     </td>
//                     <td>
//                       <span className={`sa-badge sa-badge--${visitor.status}`}>
//                         {visitor.status.replace('-', ' ')}
//                       </span>
//                     </td>
//                     <td>
//                       <div className="sa-table__actions">
//                         {visitor.status === 'checked-in' && (
//                           <button 
//                             className="sa-btn sa-btn--sm sa-btn--primary"
//                             onClick={() => handleCheckOut(visitor.id)}
//                           >
//                             <IonIcon icon={logOutOutline} /> Check Out
//                           </button>
//                         )}
//                         <button className="sa-table__action-btn" onClick={() => { setSelectedVisitor(visitor); setShowDetailsModal(true); }}>
//                           <IonIcon icon={calendarOutline} />
//                         </button>
//                       </div>
//                     </td>
//                   </tr>
//                 ))}
//               </tbody>
//             </table>
//           </div>
//         </div>
//       </IonContent>

//       {/* Check-In Modal */}
//       <IonModal isOpen={showCheckInModal} onDidDismiss={() => setShowCheckInModal(false)} className="sa-modal sa-modal--sm">
//         <div className="sa-modal__content">
//           <div className="sa-modal__header">
//             <h2>Visitor Check-In</h2>
//             <button className="sa-modal__close-btn" onClick={() => setShowCheckInModal(false)}>×</button>
//           </div>
//           <div className="sa-modal__body">
//             <div className="sa-settings__form-group">
//               <label className="sa-settings__label">Full Name</label>
//               <input 
//                 className="sa-settings__input" 
//                 placeholder="Visitor Name"
//                 value={newVisitor.name}
//                 onChange={(e) => setNewVisitor({ ...newVisitor, name: e.target.value })}
//               />
//             </div>
//             <div className="sa-settings__form-group">
//               <label className="sa-settings__label">Phone Number</label>
//               <input 
//                 className="sa-settings__input" 
//                 placeholder="+91 XXXXX XXXXX"
//                 value={newVisitor.phone}
//                 onChange={(e) => setNewVisitor({ ...newVisitor, phone: e.target.value })}
//               />
//             </div>
//             <div className="sa-settings__form-group">
//               <label className="sa-settings__label">Purpose</label>
//               <select 
//                 className="sa-settings__input"
//                 value={newVisitor.purpose}
//                 onChange={(e) => setNewVisitor({ ...newVisitor, purpose: e.target.value })}
//               >
//                 <option>Healing Session</option>
//                 <option>Consultation</option>
//                 <option>Inquiry</option>
//                 <option>Other</option>
//               </select>
//             </div>
//           </div>
//           <div className="sa-modal__footer">
//             <button className="sa-btn sa-btn--outline" onClick={() => setShowCheckInModal(false)}>Cancel</button>
//             <button className="sa-btn sa-btn--primary" onClick={handleCheckIn}>Check-In</button>
//           </div>
//         </div>
//       </IonModal>

//       {/* Details Modal */}
//       <IonModal isOpen={showDetailsModal} onDidDismiss={() => setShowDetailsModal(false)} className="sa-modal sa-modal--sm">
//         <div className="sa-modal__content">
//           <div className="sa-modal__header">
//             <h2>Visitor Details</h2>
//             <button className="sa-modal__close-btn" onClick={() => setShowDetailsModal(false)}>×</button>
//           </div>
//           {selectedVisitor && (
//             <div className="sa-modal__body">
//               <div className="sa-visitor-detail-item">
//                 <span className="sa-visitor-detail-label">Name:</span>
//                 <span className="sa-visitor-detail-value">{selectedVisitor.name}</span>
//               </div>
//               <div className="sa-visitor-detail-item">
//                 <span className="sa-visitor-detail-label">Phone:</span>
//                 <span className="sa-visitor-detail-value">{selectedVisitor.phone}</span>
//               </div>
//               <div className="sa-visitor-detail-item">
//                 <span className="sa-visitor-detail-label">Purpose:</span>
//                 <span className="sa-visitor-detail-value">{selectedVisitor.purpose}</span>
//               </div>
//               <div className="sa-visitor-detail-item">
//                 <span className="sa-visitor-detail-label">In:</span>
//                 <span className="sa-visitor-detail-value">{selectedVisitor.checkIn}</span>
//               </div>
//               {selectedVisitor.checkOut && (
//                 <div className="sa-visitor-detail-item">
//                   <span className="sa-visitor-detail-label">Out:</span>
//                   <span className="sa-visitor-detail-value">{selectedVisitor.checkOut}</span>
//                 </div>
//               )}
//             </div>
//           )}
//           <div className="sa-modal__footer">
//             <button className="sa-btn sa-btn--primary" onClick={() => setShowDetailsModal(false)}>Close</button>
//           </div>
//         </div>
//       </IonModal>
//     </IonPage>
//   );
// };

// export default VisitorLogPage;



import React, { useState, useEffect } from 'react';
import axiosInstance from '../../api/axois.instance';
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
} from '@ionic/react';
import {
  peopleOutline,
  timeOutline,
  checkmarkCircleOutline,
  calendarOutline,
  documentTextOutline,
  downloadOutline,
  addOutline,
  chevronBackOutline,
  chevronForwardOutline,
  radioOutline,
  filterOutline,
  logoWhatsapp,
  logInOutline,
  logOutOutline,
  searchOutline,
  closeOutline,
  alertCircleOutline,
} from 'ionicons/icons';
import { useAuthStore } from '../../store/auth.store';
import { useHistory } from 'react-router-dom';
import './branch-admin.css';
import './visitor-log.css';
import ProfileDropdown from '../../components/common/ProfileDropdown';


interface Visitor {
  id: string | number;
  visitorId: string; // VIS-0001
  name: string;
  type: 'Walk-in' | 'Meditation' | 'Session' | 'Camp' | 'Healer' | 'Conversion';
  contact: string;
  entry: string;
  exit: string;
  duration: string;
  status: 'Inside' | 'Exited';
  dateStr: string;
  gender?: string;
  idProof?: string;
  address?: string;
  notes?: string;
  referenceSource?: string[];
  referralName?: string;
}

const VisitorLogPage: React.FC = () => {
  const { user, token } = useAuthStore();
  const history = useHistory();
  const [showCheckInModal, setShowCheckInModal] = useState(false);
  const [selectedVisitor, setSelectedVisitor] = useState<Visitor | null>(null);

  // Advanced Search & Filter States
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState('All');
  const [filterDate, setFilterDate] = useState(''); // Default empty to display all logs
  const [filterStatus, setFilterStatus] = useState<'All' | 'Inside' | 'Exited'>('All');

  // Export Modal States
  const [showExportModal, setShowExportModal] = useState(false);
  const [exportFormat, setExportFormat] = useState<'PDF' | 'Excel' | null>(null);
  const [exportProgress, setExportProgress] = useState(0);
  const [exportState, setExportState] = useState<'idle' | 'generating' | 'completed'>('idle');

  // Helper sequential generator for VIS-XXXX
  const genVisId = (existing: Visitor[]) => {
    const maxNum = existing.reduce((max, v) => {
      const match = v.visitorId?.match(/VIS-(\d+)/);
      return match ? Math.max(max, parseInt(match[1], 10)) : max;
    }, 0);
    return `VIS-${String(maxNum + 1).padStart(4, '0')}`;
  };

  const [visitors, setVisitors] = useState<Visitor[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchVisitors = async () => {
    try {
      setIsLoading(true);
      const response = await axiosInstance.get("/visitors/log");
      
      if (response.data && response.data.data) {
         const fetchedVisitors = response.data.data.map((v: any) => {
           const checkInDate = new Date(v.checkIn);
           const checkOutDate = v.checkOut ? new Date(v.checkOut) : null;
           
           // map backend types to UI types
           let mappedType = v.visitorType || 'Walk-in';
           if (mappedType === 'Healing Session' || mappedType === 'Consultation') mappedType = 'Session';
           if (mappedType === 'Other' || mappedType === 'Inquiry') mappedType = 'Walk-in';

           return {
             id: v.id,
             visitorId: v.visitorId || (v.id ? `VIS-${String(v.id).padStart(4, '0')}` : `VIS-0000`),
             name: v.name || '',
             type: mappedType as any,
             contact: v.phone || '',
             entry: isNaN(checkInDate.getTime()) ? '—' : checkInDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
             exit: checkOutDate && !isNaN(checkOutDate.getTime()) ? checkOutDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '—',
             duration: '—', // Could calculate if needed
             status: v.checkOut ? 'Exited' : 'Inside',
             dateStr: isNaN(checkInDate.getTime()) ? '' : checkInDate.toLocaleDateString('en-CA'),
             gender: v.gender || 'Male',
             idProof: v.idProof || '',
             address: v.address || '',
             notes: v.purpose || '',
             referenceSource: Array.isArray(v.referenceSource) ? v.referenceSource : [],
             referralName: v.referralName || ''
           };
        });
        
        fetchedVisitors.sort((a: any, b: any) => String(b.visitorId).localeCompare(String(a.visitorId)));
        setVisitors(fetchedVisitors);
      }
    } catch (error) {
      console.error('Error fetching visitor logs:', error);
    } finally {
      setIsLoading(false);
    }
  };


  useIonViewWillEnter(() => {
    fetchVisitors();
  });

  useEffect(() => {
    fetchVisitors();
  }, []);

  // Modal State for New Entry
  const [newVisitor, setNewVisitor] = useState({
    name: '',
    contact: '',
    type: 'Session' as 'Walk-in' | 'Meditation' | 'Session' | 'Camp' | 'Healer' | 'Conversion',
  });

  // const handleCheckIn = () => {
  //   if (!newVisitor.name || !newVisitor.contact) return;

  //   const now = new Date();
  //   const formattedTime = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  //   const added: Visitor = {
  //     id: Date.now(),
  //     visitorId: genVisId(visitors),
  //     name: newVisitor.name,
  //     type: newVisitor.type,
  //     contact: newVisitor.contact,
  //     entry: formattedTime,
  //     exit: '—',
  //     duration: '5m',
  //     status: 'Inside',
  //     dateStr: now.toISOString().split('T')[0],
  //   };

  //   setVisitors([added, ...visitors]);
  //   setNewVisitor({ name: '', contact: '', type: 'Session' });
  //   setShowCheckInModal(false);
  // };

  const handleCheckOut = async (id: number) => {
    try {
      await axiosInstance.put(`/visitors/check-out/${id}`);
      triggerToast('Visitor checked out successfully!');
      fetchVisitors();
    } catch (error) {
      console.error('Error checking out visitor:', error);
      alert('Failed to check out visitor.');
    }
  };

  // Toast notification helper
  const [toastMessage, setToastMessage] = useState('');
  const [showToast, setShowToast] = useState(false);

  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);
  };

  // Interactive Exporter progress trigger
  const handleExportReport = (format: 'PDF' | 'Excel') => {
    setExportFormat(format);
    setExportProgress(0);
    setExportState('generating');
    setShowExportModal(true);

    let progress = 0;
    const interval = setInterval(() => {
      progress += Math.floor(Math.random() * 15) + 8;
      if (progress >= 100) {
        progress = 100;
        clearInterval(interval);
        setExportProgress(100);
        setTimeout(() => {
          setExportState('completed');
          triggerToast(`${format} statement compiled and cached successfully!`);
        }, 300);
      } else {
        setExportProgress(progress);
      }
    }, 120);
  };

  // Dynamic stats calculation from actual database records for today
  const todayStr = new Date().toLocaleDateString('en-CA');
  const todayVisitors = visitors.filter(v => v.dateStr === todayStr);

  const countTotalToday = todayVisitors.length;
  const countInside = visitors.filter(v => v.status === 'Inside').length;
  const countCheckedOutToday = todayVisitors.filter(v => v.status === 'Exited').length;

  const countWalkins = visitors.filter(v => v.type === 'Walk-in').length;
  const countMeditation = visitors.filter(v => v.type === 'Meditation').length;
  const countSessions = visitors.filter(v => v.type === 'Session').length;
  const countCamp = visitors.filter(v => v.type === 'Camp').length;
  const countHealers = visitors.filter(v => v.type === 'Healer').length;
  const countConversion = visitors.filter(v => v.type === 'Conversion').length;

  // Advanced query filtering logic
  const filteredVisitors = visitors.filter((v) => {
    const matchesSearch =
      v.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      v.contact.includes(searchQuery) ||
      (v.visitorId || '').toLowerCase().includes(searchQuery.toLowerCase());

    const matchesType = filterType === 'All' || v.type === filterType;
    const matchesDate = !filterDate || v.dateStr === filterDate;
    const matchesStatus = filterStatus === 'All' || v.status === filterStatus;

    return matchesSearch && matchesType && matchesDate && matchesStatus;
  });

  // const activeVisitorsInsideCount = visitors.filter((v) => v.status === 'Inside').length;

  return (
    <IonPage className="sa-page">
      <IonHeader className="ion-no-border">
        <IonToolbar className="sa-page__toolbar">
          <IonButtons slot="start">
            <IonMenuButton />
          </IonButtons>
          <IonTitle className="sa-page__toolbar-title">Visitors Log</IonTitle>
          <IonButtons slot="end">
            <ProfileDropdown />
          </IonButtons>
        </IonToolbar>
      </IonHeader>

      <IonContent className="sa-page__content">
        <div className="sa-page__body">
          {/* Header Info */}
          <div className="vl-header">
            <div className="bf-header-row">
              <div className="vl-title-group">
                <h1 className="vl-title">Daily Visitor Log</h1>
                <p className="vl-subtitle">
                  Auditing center arrivals and departures for {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'short', day: 'numeric' })}
                </p>
              </div>
              <div className="vl-header-actions">
                <button className="vl-btn-action" onClick={() => handleExportReport('PDF')}>
                  <IonIcon icon={downloadOutline} /> Export PDF
                </button>
                {/* <button className="vl-btn-action" style={{ background: '#16a34a', borderColor: '#16a34a' }} onClick={() => handleExportReport('Excel')}>
                  <IonIcon icon={downloadOutline} /> Export Excel
                </button> */}
                <button className="vl-btn-add" onClick={() => history.push('/branch-admin/visitor-log/checkin', { from: '/branch-admin/visitor-log' })}>
                  <IonIcon icon={addOutline} /> Add Visitor
                </button>
              </div>
            </div>
          </div>

          {/* Top Level Summary Stats Grid */}
          <div className="sa-stats sa-stats--3" style={{ marginBottom: '20px' }}>
            <div className="sa-stat-card">
              <div className="sa-stat-card__icon sa-stat-card__icon--primary">
                <IonIcon icon={peopleOutline} />
              </div>
              <div>
                <div className="sa-stat-card__label">Total Visitors (Today)</div>
                <div className="sa-stat-card__value">{countTotalToday}</div>
              </div>
            </div>
            <div className="sa-stat-card">
              <div className="sa-stat-card__icon sa-stat-card__icon--warning">
                <IonIcon icon={timeOutline} />
              </div>
              <div>
                <div className="sa-stat-card__label">Currently Inside</div>
                <div className="sa-stat-card__value">{countInside}</div>
              </div>
            </div>
            <div className="sa-stat-card">
              <div className="sa-stat-card__icon sa-stat-card__icon--success">
                <IonIcon icon={checkmarkCircleOutline} />
              </div>
              <div>
                <div className="sa-stat-card__label">Check-outs Today</div>
                <div className="sa-stat-card__value">{countCheckedOutToday}</div>
              </div>
            </div>
          </div>

          {/* 5 Stats Cards Grid — Enforced BRD Visitor Categories */}
          <div className="vl-stats-grid">
            {/* Card 1: Walk-ins */}
            <div className="vl-stat-card vl-stat-card--total">
              <div className="vl-stat-info">
                <div className="vl-stat-label">WALK-INS</div>
                <div className="vl-stat-value">{countWalkins}</div>
              </div>
              <div className="vl-stat-icon-wrapper">
                <IonIcon icon={checkmarkCircleOutline} />
              </div>
            </div>

            {/* Card 2: Meditation */}
            <div className="vl-stat-card vl-stat-card--meditation">
              <div className="vl-stat-info">
                <div className="vl-stat-label">MEDITATION</div>
                <div className="vl-stat-value">{countMeditation}</div>
              </div>
              <div className="vl-stat-icon-wrapper">
                <IonIcon icon={calendarOutline} />
              </div>
            </div>

            {/* Card 3: Sessions */}
            <div className="vl-stat-card vl-stat-card--sessions">
              <div className="vl-stat-info">
                <div className="vl-stat-label">SESSIONS</div>
                <div className="vl-stat-value">{countSessions}</div>
              </div>
              <div className="vl-stat-icon-wrapper">
                <IonIcon icon={timeOutline} />
              </div>
            </div>

            {/* Card 4: Camp */}
            <div className="vl-stat-card vl-stat-card--camp">
              <div className="vl-stat-info">
                <div className="vl-stat-label">CAMP</div>
                <div className="vl-stat-value">{countCamp}</div>
              </div>
              <div className="vl-stat-icon-wrapper">
                <IonIcon icon={peopleOutline} />
              </div>
            </div>

            {/* Card 5: Healers */}
            <div className="vl-stat-card vl-stat-card--healers">
              <div className="vl-stat-info">
                <div className="vl-stat-label">HEALERS</div>
                <div className="vl-stat-value">{countHealers}</div>
              </div>
              <div className="vl-stat-icon-wrapper">
                <IonIcon icon={radioOutline} />
              </div>
            </div>

            {/* Card 6: Conversion */}
            <div className="vl-stat-card vl-stat-card--conversion">
              <div className="vl-stat-info">
                <div className="vl-stat-label">CONVERSION</div>
                <div className="vl-stat-value">{countConversion}</div>
              </div>
              <div className="vl-stat-icon-wrapper">
                <IonIcon icon={checkmarkCircleOutline} />
              </div>
            </div>
          </div>

          {/* Spacious Main Grid Layout */}
          <div className="vl-main-grid" style={{ gridTemplateColumns: '1fr' }}>
            {/* Left Column */}
            <div className="vl-left-col">
              {/* Current Logs Card */}
              <div className="vl-card">
                <div className="vl-card-header" style={{ marginBottom: '16px' }}>
                  <h2 className="vl-card-title">Current Logs</h2>
                  <div className="vl-live-badge">
                    <span className="vl-live-dot" /> Live Update
                  </div>
                </div>

                {/* Advanced Search & Filtering Controls */}
                <div className="sa-section" style={{ margin: '0 0 20px 0', padding: '16px', borderRadius: '12px' }}>
                  <div className="vl-filter-grid">
                    {/* Visitor Search Textbox */}
                    <div className="sa-search" style={{ margin: 0, width: '100%' }}>
                      <IonIcon icon={searchOutline} style={{ fontSize: '16px' }} />
                      <input
                        placeholder="Search Name, ID, or Phone..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        style={{ border: 'none', background: 'transparent', outline: 'none', width: '100%', fontSize: '13px' }}
                      />
                    </div>

                    {/* Visitor Type Filter */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', textAlign: 'left' }}>
                      <select
                        className="sa-input"
                        value={filterType}
                        onChange={(e) => setFilterType(e.target.value)}
                        style={{ padding: '8px 12px', borderRadius: '8px', width: '100%', fontSize: '13px', outline: 'none' }}
                      >
                        <option value="All">All Visitor Types</option>
                        <option value="Walk-in">Walk-in</option>
                        <option value="Meditation">Meditation</option>
                        <option value="Session">Session</option>
                        <option value="Camp">Camp</option>
                        <option value="Healer">Healer</option>
                        <option value="Conversion">Conversion</option>
                      </select>
                    </div>

                    {/* Date Picker Filter */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', textAlign: 'left' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <input
                          type="date"
                          className="sa-input"
                          value={filterDate}
                          onChange={(e) => setFilterDate(e.target.value)}
                          style={{ padding: '8px 12px', borderRadius: '8px', width: '100%', fontSize: '13px', outline: 'none' }}
                        />
                        {filterDate && (
                          <button
                            onClick={() => setFilterDate('')}
                            style={{
                              background: '#f1f5f9',
                              border: '1px solid #cbd5e1',
                              borderRadius: '8px',
                              padding: '8px',
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              color: '#475569',
                            }}
                            title="Clear Date"
                          >
                            <IonIcon icon={closeOutline} />
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Status Filter */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', textAlign: 'left' }}>
                      <select
                        className="sa-input"
                        value={filterStatus}
                        onChange={(e) => setFilterStatus(e.target.value as any)}
                        style={{ padding: '8px 12px', borderRadius: '8px', width: '100%', fontSize: '13px', outline: 'none' }}
                      >
                        <option value="All">All Statuses</option>
                        <option value="Inside">Inside</option>
                        <option value="Exited">Exited</option>
                      </select>
                    </div>
                  </div>
                </div>

                <div className="sa-table-responsive" style={{ border: 'none' }}>
                  <table className="vl-table">
                    <thead>
                      <tr>
                        <th>Visitor ID</th>
                        <th>Visitor Name</th>
                        <th>Type</th>
                        <th>Contact</th>
                        <th>Date</th>
                        <th>Entry</th>
                        <th>Exit</th>
                        {/* <th>Duration</th> */}
                        <th>Status</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredVisitors.length > 0 ? (
                        filteredVisitors.map((visitor) => (
                          <tr key={visitor.id}>
                            <td style={{ fontWeight: 700, color: '#7c2d12', fontFamily: 'monospace', fontSize: '11px' }}>{visitor.visitorId || '—'}</td>
                            <td>
                              <div className="vl-avatar-wrapper">
                                <div className="vl-avatar">
                                  {visitor.name.split(' ').map((n) => n[0]).join('')}
                                </div>
                                <div className="vl-visitor-info">
                                  <span className="vl-visitor-name">{visitor.name}</span>
                                </div>
                              </div>
                            </td>
                            <td>
                              <span 
                                className={`vl-badge-type vl-badge-type--${
                                  visitor.type === 'Meditation' ? 'meditation' : visitor.type === 'Session' ? 'session' : visitor.type === 'Walk-in' ? 'walkin' : visitor.type === 'Camp' ? 'camp' : visitor.type === 'Conversion' ? 'conversion' : 'healer'
                                }`}
                                style={{
                                  textTransform: 'uppercase', fontSize: '9px', padding: '2px 8px', borderRadius: '12px', fontWeight: 800,
                                  background: visitor.type === 'Session' ? '#eff6ff' : visitor.type === 'Walk-in' ? '#ecfdf5' : visitor.type === 'Meditation' ? '#fffbeb' : visitor.type === 'Camp' ? '#fdf4ff' : visitor.type === 'Conversion' ? '#f0fdf4' : '#ecfeff',
                                  color: visitor.type === 'Session' ? '#2563eb' : visitor.type === 'Walk-in' ? '#10b981' : visitor.type === 'Meditation' ? '#d97706' : visitor.type === 'Camp' ? '#c084fc' : visitor.type === 'Conversion' ? '#15803d' : '#0891b2',
                                  border: `1px solid ${visitor.type === 'Session' ? '#bfdbfe' : visitor.type === 'Walk-in' ? '#a7f3d0' : visitor.type === 'Meditation' ? '#fde68a' : visitor.type === 'Camp' ? '#f3e8ff' : visitor.type === 'Conversion' ? '#bbf7d0' : '#cffafe'}`
                                }}
                              >
                                {visitor.type}
                              </span>
                            </td>
                            <td>
                              <span className="vl-visitor-sub">{visitor.contact}</span>
                            </td>
                            <td>{visitor.dateStr}</td>
                            <td>{visitor.entry}</td>
                            <td>{visitor.exit}</td>
                            {/* <td>{visitor.duration}</td> */}
                            <td>
                              <span 
                                className={`vl-badge-status vl-badge-status--${
                                  visitor.status === 'Inside' ? 'inside' : 'exited'
                                }`}
                              >
                                {visitor.status === 'Inside' && <span className="vl-now-inside-dot" />}
                                {visitor.status}
                              </span>
                            </td>
                            <td>
                              <div className="sa-table__actions" style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                                {/* {visitor.status === 'Inside' ? (
                                  <button
                                    className="sa-btn sa-btn--sm sa-btn--primary"
                                    onClick={() => handleCheckOut(visitor.id as number)}
                                  >
                                    <IonIcon icon={logOutOutline} style={{ marginRight: '4px' }} /> Check-Out
                                  </button>
                                ) : (
                                  <button
                                    className="sa-btn sa-btn--sm sa-btn--outline"
                                    disabled
                                  >
                                    Exited
                                  </button>
                                )} */}
                                <button 
                                  className="sa-btn sa-btn--sm sa-btn--outline" 
                                  onClick={() => history.push(`/branch-admin/visitor-log/details/${visitor.id}`)}
                                  style={{ minWidth: '40px', padding: '0 8px' }}
                                >
                                  Details
                                </button>
                                 <button 
                                   className="sa-btn sa-btn--sm sa-btn--outline" 
                                   onClick={() => history.push(`/branch-admin/visitor-log/edit/${visitor.id}`)}
                                   style={{ minWidth: '40px', padding: '0 8px' }}
                                 >
                                   Edit
                                 </button>
                              </div>
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan={9} style={{ textAlign: 'center', padding: '40px 0' }}>
                            <div style={{ textAlign: 'center', color: '#64748b' }}>
                              <IonIcon icon={alertCircleOutline} style={{ fontSize: '32px', color: '#94a3b8', marginBottom: '8px' }} />
                              <div style={{ fontWeight: 600, fontSize: '13px' }}>No visitors match selected filter queries.</div>
                            </div>
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>

                {/* Table Footer / Pagination */}
                <div className="vl-table-footer">
                  <span className="vl-table-info">Showing {filteredVisitors.length} of {visitors.length} visitors</span>
                  <div className="vl-table-pagination">
                    <button className="vl-pagination-btn" disabled>
                      <IonIcon icon={chevronBackOutline} />
                    </button>
                    <button className="vl-pagination-btn" disabled>
                      <IonIcon icon={chevronForwardOutline} />
                    </button>
                  </div>
                </div>
              </div>

            </div>
          </div>




        </div>
      </IonContent>

    </IonPage>
  );
};

export default VisitorLogPage;