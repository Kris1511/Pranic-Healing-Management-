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
//   timeOutline,
//   peopleOutline,
//   checkmarkCircleOutline,
//   closeCircleOutline,
//   calendarOutline,
//   alertCircleOutline,
//   logInOutline,
//   logOutOutline,
//   filterOutline,
// } from 'ionicons/icons';
// import '../super-admin/super-admin.css';

// const AttendancePage: React.FC = () => {
//   const [searchQuery, setSearchQuery] = useState('');
//   const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
//   const [showMarkModal, setShowMarkModal] = useState(false);
//   const [selectedWorker, setSelectedWorker] = useState<any>(null);
  
//   // Mock data for the current branch (Uptown Sanctuary)
//   const [attendance, setAttendance] = useState([
//     { id: 1, name: 'Dr. Aris Varma', role: 'Healer', checkIn: '08:50 AM', checkOut: '05:30 PM', status: 'present', shift: 'Full Day' },
//     { id: 2, name: 'Julian Mars', role: 'Healer', checkIn: '09:00 AM', checkOut: null, status: 'present', shift: 'Morning' },
//     { id: 3, name: 'Elena Gilbert', role: 'Staff', checkIn: '08:45 AM', checkOut: null, status: 'present', shift: 'Full Day' },
//     { id: 4, name: 'Caroline Forbes', role: 'Staff', checkIn: null, checkOut: null, status: 'on-leave', shift: 'Full Day' },
//     { id: 5, name: 'Bonnie Bennett', role: 'Admin Assistant', checkIn: '09:15 AM', checkOut: null, status: 'late', shift: 'Full Day' },
//   ]);

//   const filteredAttendance = attendance.filter(record => 
//     record.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
//     record.role.toLowerCase().includes(searchQuery.toLowerCase())
//   );

//   const handleUpdateStatus = (id: number, newStatus: string) => {
//     const now = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
//     setAttendance(attendance.map(a => {
//       if (a.id === id) {
//         let update = { ...a, status: newStatus };
//         if (newStatus === 'present' && !a.checkIn) {
//           update.checkIn = now;
//         } else if (newStatus === 'absent' || newStatus === 'on-leave') {
//           update.checkIn = null;
//           update.checkOut = null;
//         }
//         return update;
//       }
//       return a;
//     }));
//     setShowMarkModal(false);
//   };

//   const handleCheckOut = (id: number) => {
//     // const now = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
//     // setAttendance(attendance.map(a => 
//     //   a.id === id ? { ...a, checkOut: now } : a
//     // ));
//   };

//   return (
//     <IonPage className="sa-page">
//       <IonHeader className="ion-no-border">
//         <IonToolbar className="sa-page__toolbar">
//           <IonButtons slot="start">
//             <IonMenuButton />
//           </IonButtons>
//           <IonTitle className="sa-page__toolbar-title">Branch Attendance</IonTitle>
//           <IonButtons slot="end">
//             <button className="sa-page__toolbar-avatar">BA</button>
//           </IonButtons>
//         </IonToolbar>
//       </IonHeader>

//       <IonContent className="sa-page__content">
//         <div className="sa-page__body">
//           <div className="sa-page__header">
//             <div className="sa-page__header-row">
//               <div>
//                 <h1 className="sa-page__title">Staff Attendance</h1>
//                 <p className="sa-page__subtitle">Mark and monitor daily attendance for Uptown Sanctuary</p>
//               </div>
//               <div className="sa-page__header-actions">
//                 <div className="sa-date-picker">
//                   <IonIcon icon={calendarOutline} />
//                   <input 
//                     type="date" 
//                     value={selectedDate} 
//                     onChange={(e) => setSelectedDate(e.target.value)} 
//                   />
//                 </div>
//               </div>
//             </div>
//           </div>

//           <div className="sa-stats sa-stats--4">
//             <div className="sa-stat-card">
//               <div className="sa-stat-card__icon sa-stat-card__icon--primary">
//                 <IonIcon icon={peopleOutline} />
//               </div>
//               <div>
//                 <div className="sa-stat-card__label">Total Staff</div>
//                 <div className="sa-stat-card__value">{attendance.length}</div>
//               </div>
//             </div>
//             <div className="sa-stat-card">
//               <div className="sa-stat-card__icon sa-stat-card__icon--success">
//                 <IonIcon icon={checkmarkCircleOutline} />
//               </div>
//               <div>
//                 <div className="sa-stat-card__label">Present</div>
//                 <div className="sa-stat-card__value">{attendance.filter(a => a.status === 'present' || a.status === 'late').length}</div>
//               </div>
//             </div>
//             <div className="sa-stat-card">
//               <div className="sa-stat-card__icon sa-stat-card__icon--warning">
//                 <IonIcon icon={alertCircleOutline} />
//               </div>
//               <div>
//                 <div className="sa-stat-card__label">Late/Leave</div>
//                 <div className="sa-stat-card__value">{attendance.filter(a => a.status === 'late' || a.status === 'on-leave').length}</div>
//               </div>
//             </div>
//             <div className="sa-stat-card">
//               <div className="sa-stat-card__icon sa-stat-card__icon--danger">
//                 <IonIcon icon={closeCircleOutline} />
//               </div>
//               <div>
//                 <div className="sa-stat-card__label">Absent</div>
//                 <div className="sa-stat-card__value">{attendance.filter(a => a.status === 'absent').length}</div>
//               </div>
//             </div>
//           </div>

//           <div className="sa-section-header" style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
//             <div className="sa-search">
//               <IonIcon icon={searchOutline} />
//               <input 
//                 placeholder="Search staff by name or role..." 
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
//                   <th>Staff Name</th>
//                   <th>Role</th>
//                   <th>Check In</th>
//                   <th>Check Out</th>
//                   <th>Status</th>
//                   <th>Date</th>
//                   <th>Actions</th>
//                 </tr>
//               </thead>
//               <tbody>
//                 {filteredAttendance.map((record) => (
//                   <tr key={record.id}>
//                     <td>
//                       <div className="sa-table__user">
//                         <div className="sa-table__avatar sa-table__avatar--staff">
//                           {record.name.split(' ').map(n => n[0]).join('')}
//                         </div>
//                         <div className="sa-table__user-info">
//                           <span className="sa-table__user-name">{record.name}</span>
//                           <span className="sa-table__user-email">{record.shift} Shift</span>
//                         </div>
//                       </div>
//                     </td>
//                     <td>{record.role}</td>
//                     <td>
//                       <div className="sa-table__time">
//                         <IonIcon icon={logInOutline} /> {record.checkIn || '--:--'}
//                       </div>
//                     </td>
//                     <td>
//                       <div className="sa-table__time">
//                         <IonIcon icon={logOutOutline} /> {record.checkOut || '--:--'}
//                       </div>
//                     </td>
//                     <td>
//                       <span className={`sa-badge sa-badge--${record.status}`}>
//                         {record.status.replace('-', ' ')}
//                       </span>
//                     </td>
//                     <td>
//                       <div className="sa-table__date">
//                         <IonIcon icon={calendarOutline} />
//                         {selectedDate}
//                       </div>
//                     </td>
//                     <td>
//                       <div className="sa-table__actions">
//                         <button 
//                           className="sa-btn sa-btn--sm sa-btn--primary"
//                           onClick={() => { setSelectedWorker(record); setShowMarkModal(true); }}
//                         >
//                           Mark Status
//                         </button>
//                         {record.status === 'present' && !record.checkOut && (
//                           <button 
//                             className="sa-btn sa-btn--sm sa-btn--outline"
//                             onClick={() => handleCheckOut(record.id)}
//                           >
//                             Check Out
//                           </button>
//                         )}
//                       </div>
//                     </td>
//                   </tr>
//                 ))}
//               </tbody>
//             </table>
//           </div>
//         </div>
//       </IonContent>

//       {/* Mark Attendance Modal */}
//       <IonModal isOpen={showMarkModal} onDidDismiss={() => setShowMarkModal(false)} className="sa-modal sa-modal--sm">
//         <div className="sa-modal__content">
//           <div className="sa-modal__header">
//             <h2>Update Attendance</h2>
//             <button className="sa-modal__close-btn" onClick={() => setShowMarkModal(false)}>×</button>
//           </div>
//           <div className="sa-modal__body">
//             {selectedWorker && (
//               <div style={{ textAlign: 'center', marginBottom: '20px' }}>
//                 <h3 style={{ margin: '0 0 4px 0' }}>{selectedWorker.name}</h3>
//                 <p className="sa-text-muted">{selectedWorker.role}</p>
//               </div>
//             )}
//             <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
//               <button 
//                 className={`sa-btn ${selectedWorker?.status === 'present' ? 'sa-btn--primary' : 'sa-btn--outline'}`}
//                 onClick={() => handleUpdateStatus(selectedWorker.id, 'present')}
//               >
//                 Mark Present
//               </button>
//               <button 
//                 className={`sa-btn ${selectedWorker?.status === 'late' ? 'sa-btn--primary' : 'sa-btn--outline'}`}
//                 onClick={() => handleUpdateStatus(selectedWorker.id, 'late')}
//               >
//                 Mark Late
//               </button>
//               <button 
//                 className={`sa-btn ${selectedWorker?.status === 'absent' ? 'sa-btn--primary' : 'sa-btn--outline'}`}
//                 onClick={() => handleUpdateStatus(selectedWorker.id, 'absent')}
//               >
//                 Mark Absent
//               </button>
//               <button 
//                 className={`sa-btn ${selectedWorker?.status === 'on-leave' ? 'sa-btn--primary' : 'sa-btn--outline'}`}
//                 onClick={() => handleUpdateStatus(selectedWorker.id, 'on-leave')}
//               >
//                 On Leave
//               </button>
//             </div>
//           </div>
//           <div className="sa-modal__footer">
//             <button className="sa-btn sa-btn--outline" onClick={() => setShowMarkModal(false)}>Cancel</button>
//           </div>
//         </div>
//       </IonModal>
//     </IonPage>
//   );
// };

// export default AttendancePage;


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
  notificationsOutline,
  helpCircleOutline,
  ellipsisVerticalOutline,
  checkmarkCircleOutline,
  closeCircleOutline,
  timeOutline,
  calendarOutline,
  downloadOutline,
  documentTextOutline,
  chevronBackOutline,
  chevronForwardOutline,
  peopleOutline,
} from 'ionicons/icons';
import { useAuthStore } from '../../store/auth.store';
import { getAttendanceHistory, saveAttendanceRecord } from '../../api/attendence.api';
import { getUsers } from '../../api/user.api';
import '../super-admin/super-admin.css';
import './branch-admin.css';

interface WorkerDailyAttendance {
  id: number | string;
  userId?: number | string;
  name: string;
  role: string;
  branchId?: string;
  branchName?: string;
  checkIn: string;
  checkOut: string;
  status: 'Present' | 'Absent' | 'Half Day' | 'Select...';
}

interface HistoricalLog {
  id: number;
  date: string;
  workerName: string;
  status: 'Present' | 'Absent' | 'Half Day';
  hours: string;
  remarks: string;
}

const getFormattedDate = (date: Date) => {
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const monthStr = months[date.getMonth()];
  const dayStr = date.getDate();
  const yearStr = date.getFullYear();
  return `${monthStr} ${dayStr}, ${yearStr}`;
};

const getFormattedTime = (date: Date) => {
  let hours = date.getHours();
  const minutes = date.getMinutes();
  const ampm = hours >= 12 ? 'PM' : 'AM';
  hours = hours % 12;
  hours = hours ? hours : 12; // the hour '0' should be '12'
  const minutesStr = minutes < 10 ? '0' + minutes : minutes;
  const hoursStr = hours < 10 ? '0' + hours : hours;
  return `${hoursStr}:${minutesStr} ${ampm}`;
};

const AttendancePage: React.FC = () => {
  const { user } = useAuthStore();
  const [searchQuery, setSearchQuery] = useState('');
  
  // Historical Log Filters
  const [filterDate, setFilterDate] = useState('');
  const [filterRole, setFilterRole] = useState('All');
  const [filterStatus, setFilterStatus] = useState('All');
  const [filterWorkerName, setFilterWorkerName] = useState('');

  // Fetch from API
  const [isLoading, setIsLoading] = useState(false);
  
  React.useEffect(() => {
    const fetchAttendance = async () => {
      try {
        setIsLoading(true);
        const today = new Date().toISOString().split('T')[0];
        
        // Fetch today's records
        const response = await getAttendanceHistory(undefined, { date: today });
        const records = response.data || [];
        
        // Fetch all healers for the current branch
        const branchId = (user as any)?.branchId || (typeof user?.branch === 'object' && user?.branch !== null ? (user.branch as any).id : undefined);
        const usersRes = await getUsers({ role: 'HEALER', branchId });
        const healersList = usersRes.data || [];

        // Map healers list to daily attendance entries, merging with existing records
        const mappedDaily = healersList.map((healer: any) => {
          const record = records.find((r: any) => (r.userId || r.user?.id) === healer.id);
          if (record) {
            return {
              id: record.id,
              userId: healer.id,
              name: healer.name || 'Unknown',
              role: healer.role === 'HEALER' ? 'Healer' : (healer.role || 'Staff'),
              branchId: record.branch?.id || healer.branch?.id || 'N/A',
              branchName: record.branch?.name || healer.branch?.name || 'Unassigned',
              checkIn: record.checkIn ? new Date(record.checkIn).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'N/A',
              checkOut: record.checkOut ? new Date(record.checkOut).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '--',
              status: record.status ? record.status.charAt(0).toUpperCase() + record.status.slice(1) : 'Present',
            };
          } else {
            return {
              id: healer.id,
              userId: healer.id,
              name: healer.name || 'Unknown',
              role: healer.role === 'HEALER' ? 'Healer' : (healer.role || 'Staff'),
              branchId: healer.branch?.id || 'N/A',
              branchName: healer.branch?.name || healer.branch?.name || 'Unassigned',
              checkIn: 'N/A',
              checkOut: 'N/A',
              status: 'Select...',
            };
          }
        });

        // Add any other attendance records that are not healers
        records.forEach((record: any) => {
          const userId = record.userId || record.user?.id;
          const exists = mappedDaily.some((d: any) => d.userId === userId);
          if (!exists) {
            mappedDaily.push({
              id: record.id,
              userId: userId,
              name: record.user?.name || 'Unknown',
              role: record.user?.role || 'Staff',
              branchId: record.branch?.id || 'N/A',
              branchName: record.branch?.name || 'Unassigned',
              checkIn: record.checkIn ? new Date(record.checkIn).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'N/A',
              checkOut: record.checkOut ? new Date(record.checkOut).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '--',
              status: record.status ? record.status.charAt(0).toUpperCase() + record.status.slice(1) : 'Present',
            });
          }
        });
        
        setDailyAttendance(mappedDaily);
      } catch (error) {
        console.error('Failed to fetch attendance history', error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchAttendance();
  }, [user]);

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 5;
  const [dailyCurrentPage, setDailyCurrentPage] = useState(1);
  const DAILY_ITEMS_PER_PAGE = 5;

  React.useEffect(() => {
    setDailyCurrentPage(1);
  }, [searchQuery]);

  const handleWorkerClick = (workerName: string) => {
    setFilterWorkerName(workerName);
    setCurrentPage(1);
    const element = document.getElementById('historical-attendance-logs');
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  // Modal / Modify States
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [selectedWorker, setSelectedWorker] = useState<WorkerDailyAttendance | null>(null);

  const [editCheckIn, setEditCheckIn] = useState('');
  const [editCheckOut, setEditCheckOut] = useState('');
  const [editStatus, setEditStatus] = useState<'Present' | 'Absent' | 'Half Day' | 'Select...'>('Present');

  // Daily staff attendance data matching the screenshot!
  const [dailyAttendance, setDailyAttendance] = useState<WorkerDailyAttendance[]>([
    { id: 1, name: 'Elena Rodriguez', role: 'Senior Healer', branchId: 'B-001', branchName: 'Uptown Sanctuary', checkIn: '08:15 AM', checkOut: '--', status: 'Present' },
    { id: 2, name: 'David Park', role: 'Admin Staff', branchId: 'B-001', branchName: 'Uptown Sanctuary', checkIn: 'N/A', checkOut: 'N/A', status: 'Absent' },
    { id: 3, name: 'Ayesha Khan', role: 'Lead Healer', branchId: 'B-001', branchName: 'Uptown Sanctuary', checkIn: '09:30 AM', checkOut: '--', status: 'Half Day' },
    { id: 4, name: 'Samuel Peterson', role: 'Physician', branchId: 'B-001', branchName: 'Uptown Sanctuary', checkIn: '08:00 AM', checkOut: '--', status: 'Select...' },
  ]);

  // Historical log items matching the screenshot (expanded for pagination support)!
  const [historicalLogs, setHistoricalLogs] = useState<HistoricalLog[]>([
    { id: 1, date: 'Oct 24, 2023', workerName: 'David Park', status: 'Present', hours: '8.5h', remarks: 'Regular shift.' },
    { id: 2, date: 'Oct 24, 2023', workerName: 'Elena Rodriguez', status: 'Half Day', hours: '4.0h', remarks: "Doctor's appointment in the afternoon." },
    { id: 3, date: 'Oct 23, 2023', workerName: 'Samuel Peterson', status: 'Absent', hours: '0.0h', remarks: 'Medical leave (Cert submitted).' },
    { id: 4, date: 'Oct 23, 2023', workerName: 'Ayesha Khan', status: 'Present', hours: '9.0h', remarks: 'Completed healer session logs.' },
    { id: 5, date: 'Oct 22, 2023', workerName: 'Elena Rodriguez', status: 'Present', hours: '8.0h', remarks: 'Regular shift.' },
    { id: 6, date: 'Oct 22, 2023', workerName: 'David Park', status: 'Present', hours: '8.5h', remarks: 'Regular shift.' },
    { id: 7, date: 'Oct 21, 2023', workerName: 'Samuel Peterson', status: 'Present', hours: '8.0h', remarks: 'Regular shift.' },
    { id: 8, date: 'Oct 21, 2023', workerName: 'Ayesha Khan', status: 'Half Day', hours: '4.5h', remarks: 'Left early for personal reasons.' },
    { id: 9, date: 'Oct 20, 2023', workerName: 'David Park', status: 'Present', hours: '8.5h', remarks: 'Regular shift.' },
    { id: 10, date: 'Oct 20, 2023', workerName: 'Elena Rodriguez', status: 'Present', hours: '8.0h', remarks: 'Regular shift.' },
    { id: 11, date: 'Oct 19, 2023', workerName: 'Samuel Peterson', status: 'Present', hours: '8.0h', remarks: 'Regular shift.' },
    { id: 12, date: 'Oct 19, 2023', workerName: 'Ayesha Khan', status: 'Present', hours: '8.5h', remarks: 'Regular shift.' },
  ]);

  const handleSaveAttendance = async () => {
    if (!selectedWorker) return;
    
    try {
      const today = new Date().toISOString().split('T')[0];
      
      const payload: any = {
        userId: selectedWorker.userId || selectedWorker.id, // Fallback for mock data if needed
        date: today,
        status: editStatus.toLowerCase(),
      };

      if (editCheckIn) {
        payload.checkIn = new Date(`${today}T${editCheckIn}`).toISOString();
      } else {
        payload.checkIn = null;
      }
      
      if (editCheckOut) {
        payload.checkOut = new Date(`${today}T${editCheckOut}`).toISOString();
      } else {
        payload.checkOut = null;
      }

      await saveAttendanceRecord(payload);
      
      // Update local state for immediate feedback
      let displayCheckIn = editCheckIn ? new Date(`${today}T${editCheckIn}`).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'N/A';
      let displayCheckOut = editCheckOut ? new Date(`${today}T${editCheckOut}`).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '--';

      if (editStatus === 'Absent') {
        displayCheckIn = 'N/A';
        displayCheckOut = 'N/A';
      }

      setDailyAttendance(
        dailyAttendance.map((w) =>
          w.id === selectedWorker.id
            ? {
                ...w,
                status: editStatus,
                checkIn: displayCheckIn,
                checkOut: displayCheckOut,
              }
            : w
        )
      );

      setShowStatusModal(false);
      setSelectedWorker(null);
    } catch (error) {
      console.error('Failed to save attendance', error);
      alert('Failed to save attendance record.');
    }
  };

  const filteredDaily = dailyAttendance.filter((w) =>
    w.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    w.role.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const dailyTotalPages = Math.ceil(filteredDaily.length / DAILY_ITEMS_PER_PAGE);
  const dailyActivePage = Math.min(dailyCurrentPage, Math.max(dailyTotalPages, 1));
  const dailyIndexOfLastItem = dailyActivePage * DAILY_ITEMS_PER_PAGE;
  const dailyIndexOfFirstItem = dailyIndexOfLastItem - DAILY_ITEMS_PER_PAGE;
  const paginatedDaily = filteredDaily.slice(dailyIndexOfFirstItem, dailyIndexOfLastItem);

  const filteredHistory = historicalLogs.filter((log) => {
    let matchesDate = true;
    if (filterDate) {
      const [year, month, day] = filterDate.split('-');
      const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      const monthStr = months[parseInt(month, 10) - 1];
      const dayStr = parseInt(day, 10).toString(); // remove leading zero
      const expectedDateStr = `${monthStr} ${dayStr}, ${year}`;
      matchesDate = log.date === expectedDateStr;
    }
    const matchesStatus = filterStatus === 'All' || log.status === filterStatus;
    const matchesWorker = !filterWorkerName || log.workerName.toLowerCase().includes(filterWorkerName.toLowerCase());
    
    // For role check in mock: David Park is Admin Staff, Elena Rodriguez is Senior Healer, Samuel Peterson is Physician, Ayesha Khan is Lead Healer
    let matchesRole = true;
    if (filterRole !== 'All') {
      if (filterRole === 'Healer' && !log.workerName.includes('Rodriguez') && !log.workerName.includes('Khan')) matchesRole = false;
      if (filterRole === 'Staff' && !log.workerName.includes('Park')) matchesRole = false;
      if (filterRole === 'Physician' && !log.workerName.includes('Peterson')) matchesRole = false;
    }

    return matchesDate && matchesStatus && matchesRole && matchesWorker;
  });

  const totalPages = Math.ceil(filteredHistory.length / ITEMS_PER_PAGE);
  const activePage = Math.min(currentPage, Math.max(totalPages, 1));
  const indexOfLastItem = activePage * ITEMS_PER_PAGE;
  const indexOfFirstItem = indexOfLastItem - ITEMS_PER_PAGE;
  const paginatedHistory = filteredHistory.slice(indexOfFirstItem, indexOfLastItem);

  return (
    <IonPage className="sa-page">
      <IonHeader className="ion-no-border">
        <IonToolbar className="sa-page__toolbar">
          <IonButtons slot="start">
            <IonMenuButton />
          </IonButtons>
          <IonTitle className="sa-page__toolbar-title">Worker Attendance</IonTitle>
          <IonButtons slot="end">
            <div className="sa-page__toolbar-actions">
              <button className="sa-page__toolbar-avatar">BA</button>
            </div>
          </IonButtons>
        </IonToolbar>
      </IonHeader>

      <IonContent className="sa-page__content">
        <div className="sa-page__body">
          {/* Header row with search */}
          <div className="sa-page__header">
            <div className="sa-page__header-row">
              <div>
                <h1 className="sa-page__title">Worker Attendance</h1>
                <p className="sa-page__subtitle">Mark and monitor daily attendance</p>
              </div>
              {/* <div className="sa-search">
                <IonIcon icon={searchOutline} />
                <input
                  placeholder="Search staff by name or role..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div> */}
            </div>
          </div>

          {/* Stats Cards Row */}
          <div className="sa-stats sa-stats--4">
            {/* Card 1 */}
            <div className="sa-stat-card">
              <div>
                <div className="sa-stat-card__label">TOTAL STAFF</div>
                <div className="sa-stat-card__value">{dailyAttendance.length}</div>
                {/* <div className="sa-stat-card__detail">
                  <span style={{ color: '#10b981' }}>~ +2</span>
                </div> */}
              </div>
              <div className="sa-stat-card__icon">
                <IonIcon icon={peopleOutline} style={{ color: '#3b82f6' }} />
              </div>
            </div>

            {/* Card 2 */}
            <div className="sa-stat-card">
              <div>
                <div className="sa-stat-card__label">PRESENT TODAY</div>
                <div className="sa-stat-card__value">{dailyAttendance.filter(w => w.status === 'Present').length}</div>
                {/* <div className="sa-stat-card__detail">
                  <span style={{ color: '#10b981' }}>~ 82%</span>
                </div> */}
              </div>
              <div className="sa-stat-card__icon">
                <IonIcon icon={checkmarkCircleOutline} style={{ color: '#10b981' }} />
              </div>
            </div>

            {/* Card 3 */}
            <div className="sa-stat-card">
              <div>
                <div className="sa-stat-card__label">ABSENT</div>
                <div className="sa-stat-card__value">{dailyAttendance.filter(w => w.status === 'Absent').length}</div>
                {/* <div className="sa-stat-card__detail">
                  <span style={{ color: '#ef4444' }}>~ -1</span>
                </div> */}
              </div>
              <div className="sa-stat-card__icon">
                <IonIcon icon={closeCircleOutline} style={{ color: '#ef4444' }} />
              </div>
            </div>

            {/* Card 4 */}
            <div className="sa-stat-card">
              <div>
                <div className="sa-stat-card__label">HALF DAY</div>
                <div className="sa-stat-card__value">{dailyAttendance.filter(w => w.status === 'Half Day').length}</div>
                {/* <div className="sa-stat-card__detail">
                  <span style={{ color: '#f59e0b' }}>~ Stable</span>
                </div> */}
              </div>
              <div className="sa-stat-card__icon">
                <IonIcon icon={timeOutline} style={{ color: '#f59e0b' }} />
              </div>
            </div>
          </div>

          {/* Daily Attendance Grid (Full-Width) */}
          <div className="sa-section">
            <div className="sa-section__header">
              <div>
                <h2 className="sa-section__title">Mark Daily Attendance</h2>
              </div>
            </div>

            <table className="sa-table">
              <thead>
                <tr>
                  <th>WORKER NAME</th>
                  <th>ROLE</th>
                  {/* <th>BRANCH ID</th> */}
                  <th>BRANCH NAME</th>
                  <th>CHECK-IN</th>
                  <th>CHECK-OUT</th>
                  <th>STATUS</th>
                  <th>ACTIONS</th>
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  <tr><td colSpan={8} style={{ textAlign: 'center', padding: '20px' }}>Loading...</td></tr>
                ) : paginatedDaily.map((worker) => (
                  <tr key={worker.id}>
                    <td>
                      <div 
                        className="sa-table__user"
                        onClick={() => handleWorkerClick(worker.name)}
                        style={{ cursor: 'pointer', transition: 'all 0.2s ease' }}
                        title={`Click to view ${worker.name}'s attendance history`}
                      >
                        <div className="sa-table__avatar sa-table__avatar--primary">
                          {worker.name.split(' ').map(n => n[0]).join('')}
                        </div>
                        <div className="sa-table__user-info">
                          <span className="sa-table__user-name" style={{ textDecoration: 'underline' }}>{worker.name}</span>
                        </div>
                      </div>
                    </td>
                    <td>{worker.role}</td>
                    {/* <td>
                      <span className="sa-text-muted" style={{ fontSize: '0.85rem' }}>
                        {worker.branchId || 'N/A'}
                      </span>
                    </td> */}
                    <td>
                      <span style={{ fontWeight: 500 }}>
                        {worker.branchName || 'Unassigned'}
                      </span>
                    </td>
                    <td>
                      <div className="sa-table__time">
                        {worker.checkIn}
                      </div>
                    </td>
                    <td>
                      <div className="sa-table__time">
                        {worker.checkOut}
                      </div>
                    </td>
                    <td>
                      
                        <span
                          className={`sa-badge sa-badge--${
                            worker.status === 'Present'
                              ? 'active'
                              : worker.status === 'Absent'
                              ? 'inactive'
                              : 'maintenance'
                          }`}
                        >
                          {worker.status}
                        </span>
                    </td>
                    <td>
                      <button
                        className="sa-table__action-btn"
                        onClick={() => {
                          setSelectedWorker(worker);
                          setEditStatus(worker.status === 'Select...' ? 'Present' : worker.status);
                          
                          // Convert '08:15 AM' to '08:15'
                          const parseTime = (timeStr: string) => {
                            if (!timeStr || timeStr === 'N/A' || timeStr === '--') return '';
                            const match = timeStr.match(/(\d+):(\d+)\s*(AM|PM)/i);
                            if (match) {
                              let [_, h, m, modifier] = match;
                              let hours = parseInt(h, 10);
                              if (modifier.toUpperCase() === 'PM' && hours < 12) hours += 12;
                              if (modifier.toUpperCase() === 'AM' && hours === 12) hours = 0;
                              return `${hours.toString().padStart(2, '0')}:${m}`;
                            }
                            return '';
                          };

                          const now = new Date();
                          const current24h = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
                          
                          let defaultIn = parseTime(worker.checkIn);
                          let defaultOut = parseTime(worker.checkOut);

                          if (!defaultIn) {
                            // morning current time default or fallback to 09:00
                            defaultIn = now.getHours() < 12 ? current24h : '09:00';
                          }
                          // We don't automatically fill defaultOut anymore, leaving it empty
                          // so the user can just set Check-In in the morning and Check-Out in the evening.

                          setEditCheckIn(defaultIn);
                          setEditCheckOut(defaultOut);
                          setShowStatusModal(true);
                        }}
                      >
                        <IonIcon icon={ellipsisVerticalOutline} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            <div className="sa-pagination" style={{ marginTop: '16px' }}>
              <span className="sa-pagination__info">
                {filteredDaily.length > 0 ? (
                  `Showing ${dailyIndexOfFirstItem + 1}-${Math.min(dailyIndexOfLastItem, filteredDaily.length)} of ${filteredDaily.length} records`
                ) : (
                  'Showing 0-0 of 0 records'
                )}
              </span>
              <div className="sa-pagination__controls">
                <button
                  className="sa-pagination__btn"
                  onClick={() => setDailyCurrentPage((p) => Math.max(p - 1, 1))}
                  disabled={dailyActivePage === 1}
                >
                  <IonIcon icon={chevronBackOutline} />
                </button>
                {Array.from({ length: dailyTotalPages }, (_, i) => i + 1).map((pageNum) => (
                  <button
                    key={pageNum}
                    className={`sa-pagination__btn ${dailyActivePage === pageNum ? 'sa-pagination__btn--active' : ''}`}
                    onClick={() => setDailyCurrentPage(pageNum)}
                  >
                    {pageNum}
                  </button>
                ))}
                {dailyTotalPages === 0 && (
                  <button className="sa-pagination__btn sa-pagination__btn--active" disabled>
                    1
                  </button>
                )}
                <button
                  className="sa-pagination__btn"
                  onClick={() => setDailyCurrentPage((p) => Math.min(p + 1, dailyTotalPages))}
                  disabled={dailyActivePage === dailyTotalPages || dailyTotalPages === 0}
                >
                  <IonIcon icon={chevronForwardOutline} />
                </button>
              </div>
            </div>
          </div>

          {/* Historical Logs Full-Width Section */}
          {/* <div className="sa-section" id="historical-attendance-logs">
            <div className="sa-section__header">
              <div>
                <h2 className="sa-section__title">Historical Attendance Logs</h2>
                <p className="sa-section__subtitle">View and manage past attendance records across the enterprise.</p>
              </div>
              <div style={{ display: 'flex', gap: '8px' }}>
                <button className="sa-btn sa-btn--outline">
                  <IonIcon icon={downloadOutline} /> Export PDF
                </button>
                <button className="sa-btn sa-btn--outline">
                  <IonIcon icon={documentTextOutline} /> Export Excel
                </button>
              </div>
            </div>

            <div className="sa-filters">
              <input
                type="text"
                placeholder="Search Worker Name..."
                className="sa-input"
                style={{ width: '200px' }}
                value={filterWorkerName}
                onChange={(e) => {
                  setFilterWorkerName(e.target.value);
                  setCurrentPage(1);
                }}
              />

              <input
                type="date"
                className="sa-input"
                style={{ width: '160px' }}
                value={filterDate}
                onChange={(e) => {
                  setFilterDate(e.target.value);
                  setCurrentPage(1);
                }}
              />

              <select
                className="sa-input"
                style={{ width: '150px' }}
                value={filterRole}
                onChange={(e) => {
                  setFilterRole(e.target.value);
                  setCurrentPage(1);
                }}
              >
                <option value="All">All Roles</option>
                <option value="Healer">Healer</option>
                <option value="Staff">Staff</option>
                <option value="Physician">Physician</option>
              </select>

              <select
                className="sa-input"
                style={{ width: '150px' }}
                value={filterStatus}
                onChange={(e) => {
                  setFilterStatus(e.target.value);
                  setCurrentPage(1);
                }}
              >
                <option value="All">All Statuses</option>
                <option value="Present">Present</option>
                <option value="Absent">Absent</option>
                <option value="Half Day">Half Day</option>
              </select>

              <button
                className="sa-btn sa-btn--outline"
                onClick={() => {
                  setFilterDate('');
                  setFilterRole('All');
                  setFilterStatus('All');
                  setFilterWorkerName('');
                  setCurrentPage(1);
                }}
              >
                Clear
              </button>
            </div>

            <table className="sa-table">
              <thead>
                <tr>
                  <th>DATE</th>
                  <th>WORKER</th>
                  <th>STATUS</th>
                  <th>TOTAL HOURS</th>
                  <th>REMARKS</th>
                </tr>
              </thead>
              <tbody>
                {paginatedHistory.length > 0 ? (
                  paginatedHistory.map((log) => (
                    <tr key={log.id}>
                      <td>{log.date}</td>
                      <td>
                        <span style={{ fontWeight: 600 }}>{log.workerName}</span>
                      </td>
                      <td>
                        <span
                          className={`sa-badge sa-badge--${
                            log.status === 'Present'
                              ? 'active'
                              : log.status === 'Absent'
                              ? 'inactive'
                              : 'maintenance'
                          }`}
                        >
                          {log.status}
                        </span>
                      </td>
                      <td>{log.hours}</td>
                      <td>{log.remarks}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} style={{ textAlign: 'center', color: '#64748b', padding: '30px' }}>
                      No historical attendance records match your search filters.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>

            <div className="sa-pagination">
              <span className="sa-pagination__info">
                {filteredHistory.length > 0 ? (
                  `Showing ${indexOfFirstItem + 1}-${Math.min(indexOfLastItem, filteredHistory.length)} of ${filteredHistory.length} records`
                ) : (
                  'Showing 0-0 of 0 records'
                )}
              </span>
              <div className="sa-pagination__controls">
                <button
                  className="sa-pagination__btn"
                  onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
                  disabled={activePage === 1}
                >
                  <IonIcon icon={chevronBackOutline} />
                </button>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => (
                  <button
                    key={pageNum}
                    className={`sa-pagination__btn ${activePage === pageNum ? 'sa-pagination__btn--active' : ''}`}
                    onClick={() => setCurrentPage(pageNum)}
                  >
                    {pageNum}
                  </button>
                ))}
                {totalPages === 0 && (
                  <button className="sa-pagination__btn sa-pagination__btn--active" disabled>
                    1
                  </button>
                )}
                <button
                  className="sa-pagination__btn"
                  onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
                  disabled={activePage === totalPages || totalPages === 0}
                >
                  <IonIcon icon={chevronForwardOutline} />
                </button>
              </div>
            </div>
          </div> */}
        </div>
      </IonContent>

      {/* Mark Attendance Modal */}
      <IonModal isOpen={showStatusModal} onDidDismiss={() => setShowStatusModal(false)} className="sa-modal sa-modal--sm">
        <div className="sa-modal__content">
          <div className="sa-modal__header">
            <h2>Mark Worker Attendance</h2>
            <button className="sa-modal__close-btn" onClick={() => setShowStatusModal(false)}>×</button>
          </div>
          <div className="sa-modal__body">
            {selectedWorker && (
              <div style={{ textAlign: 'center'}}>
                <h3 style={{ margin: '0 0 4px 0' }}>{selectedWorker.name}</h3>
                <p className="sa-text-muted">{selectedWorker.role}</p>
              </div>
            )}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <div className="sa-form-group">
                <label className="sa-form-label">Status</label>
                <select 
                  className="sa-input" 
                  value={editStatus} 
                  onChange={(e: any) => setEditStatus(e.target.value)}
                >
                  <option value="Present">Present</option>
                  <option value="Half Day">Half Day</option>
                  <option value="Absent">Absent</option>
                </select>
              </div>
              
              {editStatus !== 'Absent' && (
                <>
                  <div className="sa-form-group">
                    <label className="sa-form-label">Check-In Time</label>
                    <input 
                      type="time" 
                      className="sa-input" 
                      value={editCheckIn} 
                      onChange={(e) => setEditCheckIn(e.target.value)} 
                    />
                  </div>
                  <div className="sa-form-group">
                    <label className="sa-form-label">Check-Out Time</label>
                    <input 
                      type="time" 
                      className="sa-input" 
                      value={editCheckOut} 
                      onChange={(e) => setEditCheckOut(e.target.value)} 
                    />
                  </div>
                </>
              )}

              <button 
                className="sa-btn sa-btn--primary"
                style={{ width: '100%', justifyContent: 'center', marginTop: '10px' }}
                onClick={handleSaveAttendance}
              >
                Save Attendance
              </button>
            </div>
          </div>
          <div className="sa-modal__footer">
            <button className="sa-btn sa-btn--outline" onClick={() => setShowStatusModal(false)} style={{ width: '100%', justifyContent: 'center' }}>Cancel</button>
          </div>
        </div>
      </IonModal>
    </IonPage>
  );
};

export default AttendancePage;