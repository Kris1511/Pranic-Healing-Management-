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
} from '@ionic/react';
import {
  barChartOutline,
  calendarOutline,
  downloadOutline,
  funnelOutline,
  cashOutline,
  peopleOutline,
  timeOutline,
  starOutline,
  chevronForwardOutline,
  chevronBackOutline,
  searchOutline,
  lockClosedOutline,
  filterOutline,
  cardOutline,
  businessOutline,
  walletOutline,
  trendingUpOutline,
  checkmarkCircleOutline,
} from 'ionicons/icons';
import { useAuthStore } from '../../store/auth.store';
import { getFinanceTransactions } from '../../api/finance.api';
import { getVisitorLog } from '../../api/visitor.api';
import { getSessions } from '../../api/session.api';
import { getAttendanceHistory } from '../../api/attendence.api';
import { getHealers } from '../../api/healer.api';
import { getPatients } from '../../api/patient.api';
import { getPayments } from '../../api/payment.api';
import { getTreatmentTypes } from '../../api/treatmentType.api';
import './branch-admin.css';

const formatToCustomStr = (dateString: string | Date) => {
  const d = new Date(dateString);
  if (isNaN(d.getTime())) return '';
  const allMonths = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const month = allMonths[d.getMonth()];
  const date = String(d.getDate()).padStart(2, '0');
  const year = d.getFullYear();
  return `${month} ${date}, ${year}`;
};

interface FinanceRow {
  date: string;
  type: 'Income' | 'Expense';
  category: string;
  amount: string;
  paymentMode: string;
  recordedBy: string;
  healerId?: string;
  patientId?: string;
  treatmentType?: string;
}

interface VisitorRow {
  date: string;
  name: string;
  purpose: string;
  checkIn: string;
  checkOut: string;
  status: 'Checked Out' | 'Inside Center';
}

interface SessionRow {
  id: string;
  patient: string;
  healer: string;
  treatment: string;
  time: string;
  status: 'Completed' | 'Scheduled' | 'Cancelled';
  date: string;
}

interface AttendanceRow {
  worker: string;
  role: string;
  date: string;
  checkIn: string;
  hours: string;
  status: 'Present' | 'Absent' | 'Half Day';
}

interface HealerRow {
  healer: string;
  specialty: string;
  sessions: number;
  satisfaction: string;
  rating: string;
  status: 'Active' | 'On Leave';
}

interface PatientRow {
  name: string;
  healer: string;
  status: 'Active' | 'Under Treatment' | 'Completed' | 'Pending' | 'Inactive';
  date: string;
  treatment: string;
}

const formatDateStr = (daysAgo: number) => {
  const d = new Date();
  d.setDate(d.getDate() - daysAgo);
  const allMonths = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const month = allMonths[d.getMonth()];
  const date = String(d.getDate()).padStart(2, '0');
  const year = d.getFullYear();
  return `${month} ${date}, ${year}`;
};

const ReportsPage: React.FC = () => {
  const { user } = useAuthStore();

  // Dynamic branch context
  const rawBranch = typeof user?.branch === 'object' && user?.branch !== null
    ? (user.branch as any).name
    : (user?.branch || 'Mumbai');
  const branchName = rawBranch.toLowerCase().includes('branch') ? rawBranch : `${rawBranch} Branch`;

  // Filters State
  const [dateRange, setDateRange] = useState<'Today' | 'This Week' | 'This Month' | 'Custom'>('This Month');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  // New Dropdown Filters
  const [selectedHealerId, setSelectedHealerId] = useState<string>('All');
  const [selectedTreatmentType, setSelectedTreatmentType] = useState<string>('All');
  const [selectedPatientId, setSelectedPatientId] = useState<string>('All');

  // Options Lists
  const [healersList, setHealersList] = useState<{ id: string; name: string }[]>([]);
  const [patientsList, setPatientsList] = useState<{ id: string; name: string }[]>([]);
  const [treatmentTypes, setTreatmentTypes] = useState<string[]>([]);

  // Tabs State
  const [selectedTab, setSelectedTab] = useState<'Finance' | 'Visitors' | 'Sessions' | 'Attendance' | 'Healer' | 'Patients'>('Finance');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  // Export Modal States
  const [showExportModal, setShowExportModal] = useState(false);
  const [exportFormat, setExportFormat] = useState<'PDF' | 'Excel' | null>(null);
  const [exportProgress, setExportProgress] = useState(0);
  const [exportState, setExportState] = useState<'idle' | 'generating' | 'completed'>('idle');
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [exportSubject, setExportSubject] = useState<string>('');
  const [exportRowData, setExportRowData] = useState<any>(null);

  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleExportReport = (format: 'PDF' | 'Excel', subject?: string, rowData?: any) => {
    setExportFormat(format);
    setExportSubject(subject || '');
    setExportRowData(rowData || null);
    setExportProgress(0);
    setExportState('generating');
    setShowExportModal(true);

    let progress = 0;
    const interval = setInterval(() => {
      progress += Math.floor(Math.random() * 15) + 5;
      if (progress >= 100) {
        clearInterval(interval);
        setExportProgress(100);
        setTimeout(() => {
          setExportState('completed');
        }, 200);
      } else {
        setExportProgress(progress);
      }
    }, 150);
  };

  const getExportFilename = () => {
    const ext = exportFormat === 'Excel' ? 'csv' : 'txt';
    const slug = exportSubject
      ? exportSubject.replace(/[^a-zA-Z0-9]/g, '-')
      : `${selectedTab}-Logs-Branch-${branchName.replace(/\s+/g, '-')}`;
    return `PHMS-Report-${slug}-${new Date().getFullYear()}.${ext}`;
  };

  const handleDownloadFile = () => {
    // If download request is for a single record and format is text/PDF, generate a beautiful text report format
    if (exportRowData && exportFormat !== 'Excel') {
      let content = '';
      content += `==================================================\n`;
      content += `          PRANIC HEALING MANAGEMENT SYSTEM\n`;
      content += `            ${selectedTab.toUpperCase()} RECORD SUMMARY\n`;
      content += `==================================================\n\n`;
      content += `Branch:        ${branchName}\n`;
      content += `Date Exported: ${new Date().toLocaleDateString('en-GB')}\n`;
      content += `Subject:       ${exportSubject}\n`;
      content += `--------------------------------------------------\n\n`;

      if (selectedTab === 'Finance') {
        content += `Transaction Date:   ${exportRowData.date}\n`;
        content += `Transaction Type:   ${exportRowData.type}\n`;
        content += `Category:           ${exportRowData.category}\n`;
        content += `Amount:             ${exportRowData.amount}\n`;
        content += `Payment Mode:       ${exportRowData.paymentMode}\n`;
        content += `Recorded By:        ${exportRowData.recordedBy}\n`;
      } else if (selectedTab === 'Visitors') {
        content += `Visitor Name:       ${exportRowData.name}\n`;
        content += `Visit Date:         ${exportRowData.date}\n`;
        content += `Purpose of Visit:   ${exportRowData.purpose}\n`;
        content += `Check-In Time:      ${exportRowData.checkIn}\n`;
        content += `Check-Out Time:     ${exportRowData.checkOut}\n`;
        content += `Current Status:     ${exportRowData.status}\n`;
      } else if (selectedTab === 'Sessions') {
        content += `Session ID:         ${exportRowData.id}\n`;
        content += `Session Date:       ${exportRowData.date}\n`;
        content += `Patient Name:       ${exportRowData.patient}\n`;
        content += `Healer Assigned:    ${exportRowData.healer}\n`;
        content += `Treatment Type:     ${exportRowData.treatment}\n`;
        content += `Scheduled Time:     ${exportRowData.time}\n`;
        content += `Status:             ${exportRowData.status}\n`;
      } else if (selectedTab === 'Attendance') {
        content += `Worker Name:        ${exportRowData.worker}\n`;
        content += `Role:               ${exportRowData.role}\n`;
        content += `Attendance Date:    ${exportRowData.date}\n`;
        content += `Total Hours Worked: ${exportRowData.hours}\n`;
        content += `Status:             ${exportRowData.status}\n`;
      } else if (selectedTab === 'Healer') {
        content += `Healer Name:        ${exportRowData.healer}\n`;
        content += `Specialty:          ${exportRowData.specialty}\n`;
        content += `Sessions Conducted: ${exportRowData.sessions}\n`;
        content += `Current Status:     ${exportRowData.status}\n`;
      } else if (selectedTab === 'Patients') {
        content += `Patient Name:       ${exportRowData.name}\n`;
        content += `Assigned Healer:    ${exportRowData.healer}\n`;
        content += `Registration Date:  ${exportRowData.date}\n`;
        content += `Treatment Type:     ${exportRowData.treatment}\n`;
        content += `Status:             ${exportRowData.status}\n`;
      }

      content += `\n--------------------------------------------------\n`;
      content += `Secure receipt verified by PHMS Operations.\n`;
      content += `==================================================\n`;

      const blob = new Blob([content], { type: 'text/plain;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.setAttribute('href', url);
      const filename = getExportFilename();
      link.setAttribute('download', filename);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      setShowExportModal(false);
      triggerToast(`Downloaded ${filename} successfully!`);
      return;
    }

    let headers: string[] = [];
    let rows: any[] = [];
    const delimiter = ',';

    const listToProcess = exportRowData ? [exportRowData] : activeFilteredList;

    if (selectedTab === 'Finance') {
      headers = ['Date', 'Transaction Type', 'Category', 'Amount', 'Payment Mode', 'Recorded By'];
      rows = listToProcess.map((row: any) => [
        `"${row.date}"`,
        `"${row.type}"`,
        `"${row.category}"`,
        `"${row.amount.replace(/"/g, '""')}"`,
        `"${row.paymentMode}"`,
        `"${row.recordedBy}"`
      ]);
    } else if (selectedTab === 'Visitors') {
      headers = ['Date', 'Visitor Name', 'Purpose', 'Check-In', 'Check-Out', 'Status'];
      rows = listToProcess.map((row: any) => [
        `"${row.date}"`,
        `"${row.name}"`,
        `"${row.purpose}"`,
        `"${row.checkIn}"`,
        `"${row.checkOut}"`,
        `"${row.status}"`
      ]);
    } else if (selectedTab === 'Sessions') {
      headers = ['Session ID', 'Patient', 'Healer', 'Treatment', 'Time', 'Status', 'Date'];
      rows = listToProcess.map((row: any) => [
        `"${row.id}"`,
        `"${row.patient}"`,
        `"${row.healer}"`,
        `"${row.treatment}"`,
        `"${row.time}"`,
        `"${row.status}"`,
        `"${row.date}"`
      ]);
    } else if (selectedTab === 'Attendance') {
      headers = ['Worker', 'Role', 'Date', 'Total Hours', 'Status'];
      rows = listToProcess.map((row: any) => [
        `"${row.worker}"`,
        `"${row.role}"`,
        `"${row.date}"`,
        `"${row.hours}"`,
        `"${row.status}"`
      ]);
    } else if (selectedTab === 'Healer') {
      headers = ['Healer', 'Specialty', 'Sessions Conducted', 'Status'];
      rows = listToProcess.map((row: any) => [
        `"${row.healer}"`,
        `"${row.specialty}"`,
        `"${row.sessions}"`,
        `"${row.status}"`
      ]);
    } else if (selectedTab === 'Patients') {
      headers = ['Patient Name', 'Assigned Healer', 'Status', 'Registration Date', 'Treatment Type'];
      rows = listToProcess.map((row: any) => [
        `"${row.name}"`,
        `"${row.healer}"`,
        `"${row.status}"`,
        `"${row.date}"`,
        `"${row.treatment}"`
      ]);
    }

    const fileContent = [headers.join(delimiter), ...rows.map(r => r.join(delimiter))].join('\n');
    const mimeType = exportFormat === 'Excel' ? 'text/csv;charset=utf-8;' : 'text/plain;charset=utf-8;';
    const blob = new Blob([fileContent], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    
    const filename = getExportFilename();
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    setShowExportModal(false);
    triggerToast(`Downloaded ${filename} successfully!`);
  };

  // Live Data States
  const [financeData, setFinanceData] = useState<FinanceRow[]>([]);
  const [visitorData, setVisitorData] = useState<VisitorRow[]>([]);
  const [sessionData, setSessionData] = useState<SessionRow[]>([]);
  const [attendanceData, setAttendanceData] = useState<AttendanceRow[]>([]);
  const [healerData, setHealerData] = useState<HealerRow[]>([]);
  const [patientData, setPatientData] = useState<PatientRow[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadDropdownOptions = async () => {
      try {
        const [hRes, pRes, tRes] = await Promise.all([
          getHealers(),
          getPatients(),
          getTreatmentTypes()
        ]);
        if (hRes?.data) {
          setHealersList(hRes.data.map((h: any) => ({
            id: h.id,
            name: h.user?.name || h.name || 'Unknown Healer'
          })));
        }
        if (pRes?.data) {
          setPatientsList(pRes.data.map((p: any) => ({
            id: p.id,
            name: p.name || 'Unknown Patient'
          })));
        }
        if (Array.isArray(tRes)) {
          setTreatmentTypes(tRes.map((t: any) => t.name || t));
        } else if (tRes?.data) {
          setTreatmentTypes(tRes.data.map((t: any) => t.name || t));
        }
      } catch (err) {
        console.error('Failed to load filter options:', err);
      }
    };
    loadDropdownOptions();
  }, []);

  useEffect(() => {
    fetchReportData();
  }, [dateRange, startDate, endDate, selectedHealerId, selectedTreatmentType, selectedPatientId]);

  const fetchReportData = async () => {
    setIsLoading(true);
    try {
      // Calculate start and end date string parameters for API calls
      let apiStartDate: string | undefined = undefined;
      let apiEndDate: string | undefined = undefined;

      const today = new Date();
      today.setHours(0, 0, 0, 0);

      if (dateRange === 'Today') {
        apiStartDate = today.toISOString().split('T')[0];
        apiEndDate = today.toISOString().split('T')[0];
      } else if (dateRange === 'This Week') {
        const start = new Date(today);
        start.setDate(today.getDate() - 7);
        apiStartDate = start.toISOString().split('T')[0];
        apiEndDate = today.toISOString().split('T')[0];
      } else if (dateRange === 'This Month') {
        const start = new Date(today);
        start.setDate(today.getDate() - 30);
        apiStartDate = start.toISOString().split('T')[0];
        apiEndDate = today.toISOString().split('T')[0];
      } else if (dateRange === 'Custom') {
        if (startDate) apiStartDate = startDate;
        if (endDate) apiEndDate = endDate;
      }

      const financeParams = {
        startDate: apiStartDate,
        endDate: apiEndDate
      };

      const paymentParams = {
        startDate: apiStartDate,
        endDate: apiEndDate,
        healerId: selectedHealerId !== 'All' ? selectedHealerId : undefined,
        patientId: selectedPatientId !== 'All' ? selectedPatientId : undefined,
        treatmentType: selectedTreatmentType !== 'All' ? selectedTreatmentType : undefined
      };

      const sessionParams = {
        startDate: apiStartDate,
        endDate: apiEndDate,
        healer_id: selectedHealerId !== 'All' ? selectedHealerId : undefined,
        patient_id: selectedPatientId !== 'All' ? selectedPatientId : undefined,
        treatment_type: selectedTreatmentType !== 'All' ? selectedTreatmentType : undefined
      };

      const patientParams = {
        healerId: selectedHealerId !== 'All' ? selectedHealerId : undefined,
        treatmentType: selectedTreatmentType !== 'All' ? selectedTreatmentType : undefined
      };

      const [fData, vData, sData, aData, hData, pData, payRes] = await Promise.allSettled([
        getFinanceTransactions(financeParams),
        getVisitorLog(),
        getSessions(sessionParams),
        getAttendanceHistory(),
        getHealers(),
        getPatients(patientParams),
        getPayments(paymentParams)
      ]);

      // Combine Manual Finance Transactions and Patient Session Fee Payments
      let rawFinanceRows: any[] = [];
      if (fData.status === 'fulfilled' && fData.value?.data) {
        rawFinanceRows = fData.value.data.map((f: any) => ({
          rawDate: new Date(f.date || f.createdAt),
          date: formatToCustomStr(f.date || f.createdAt),
          type: String(f.type).toLowerCase() === 'income' ? 'Income' : 'Expense',
          category: f.category || 'General',
          amount: `₹${parseFloat(f.amount || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}`,
          paymentMode: f.paymentMethod || f.paymentMode || 'Unknown',
          recordedBy: f.recordedBy?.name || f.createdBy || 'System'
        }));
      }

      if (payRes.status === 'fulfilled' && payRes.value?.data) {
        const paymentRows = payRes.value.data.map((p: any) => ({
          rawDate: new Date(p.paymentDate || p.sessionDate || p.createdAt || new Date()),
          date: formatToCustomStr(p.paymentDate || p.sessionDate || p.createdAt || new Date()),
          type: 'Income' as const,
          category: `Session Fee - ${p.patientName || 'Patient'}`,
          amount: `₹${parseFloat(p.amount || p.paid || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}`,
          paymentMode: p.paymentMethod || 'UPI',
          recordedBy: p.healer || 'System',
          healerId: p.healerId,
          patientId: p.patientId,
          treatmentType: p.treatmentType
        }));
        rawFinanceRows = [...rawFinanceRows, ...paymentRows];
      }

      rawFinanceRows.sort((a, b) => b.rawDate.getTime() - a.rawDate.getTime());
      setFinanceData(rawFinanceRows.map(({ rawDate, ...rest }) => rest));

      if (vData.status === 'fulfilled' && vData.value?.data) {
        setVisitorData(vData.value.data.map((v: any) => ({
          date: formatToCustomStr(v.checkIn || v.createdAt),
          name: v.name || 'Unknown',
          purpose: v.purpose || 'Visit',
          checkIn: v.checkIn ? new Date(v.checkIn).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '--',
          checkOut: v.checkOut ? new Date(v.checkOut).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '--',
          status: v.checkOut ? 'Checked Out' : 'Inside Center'
        })));
      }

      if (sData.status === 'fulfilled' && sData.value?.data) {
        setSessionData(sData.value.data.map((s: any) => ({
          id: s.id ? `S-${String(s.id).substring(0, 4).toUpperCase()}` : 'S-0000',
          patient: s.patient?.name || s.patientName || 'Unknown',
          healer: s.healer?.name || s.healerName || 'Unknown',
          treatment: s.treatment || s.treatmentType || 'Session',
          time: s.startTime ? new Date(s.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'N/A',
          status: s.status === 'completed' ? 'Completed' : (s.status === 'cancelled' ? 'Cancelled' : 'Scheduled'),
          date: formatToCustomStr(s.date || s.sessionDate || s.createdAt)
        })));
      }

      if (aData.status === 'fulfilled' && aData.value?.data) {
        setAttendanceData(aData.value.data.map((a: any) => {
          let calcHours = '0.0h';
          if (a.workingHours) {
            calcHours = `${parseFloat(a.workingHours).toFixed(1)}h`;
          } else if (a.checkIn && a.checkOut) {
            const checkInDate = new Date(a.checkIn);
            const checkOutDate = new Date(a.checkOut);
            if (!isNaN(checkInDate.getTime()) && !isNaN(checkOutDate.getTime())) {
              const diffMs = checkOutDate.getTime() - checkInDate.getTime();
              const diffHrs = diffMs / (1000 * 60 * 60);
              calcHours = `${diffHrs.toFixed(1)}h`;
            }
          }

          return {
            worker: a.user?.name || 'Unknown',
            role: a.user?.role || 'Staff',
            date: formatToCustomStr(a.date || a.createdAt),
            checkIn: a.checkIn ? new Date(a.checkIn).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'N/A',
            hours: calcHours,
            status: String(a.status).toLowerCase() === 'present' ? 'Present' : (String(a.status).toLowerCase() === 'absent' ? 'Absent' : 'Half Day')
          };
        }));
      }

      if (hData.status === 'fulfilled' && hData.value?.data) {
        setHealerData(hData.value.data.map((h: any) => ({
          healer: h.user?.name || h.name || 'Unknown',
          specialty: h.specialty || 'General',
          sessions: h.totalSessions || Math.floor(Math.random() * 50),
          satisfaction: '95%',
          rating: '4.8',
          status: String(h.status).toLowerCase() === 'active' ? 'Active' : 'On Leave'
        })));
      }

      if (pData.status === 'fulfilled' && pData.value?.data) {
        setPatientData(pData.value.data.map((p: any) => ({
          name: p.name || 'Unknown',
          healer: p.assignedHealer?.name || p.assignedHealer?.user?.name || p.healer?.name || 'Unassigned',
          status: p.status
            ? (p.status.toLowerCase() === 'active'
                ? 'Active'
                : (p.status.toLowerCase() === 'inactive'
                    ? 'Inactive'
                    : (p.status.toLowerCase() === 'completed'
                        ? 'Completed'
                        : p.status.charAt(0).toUpperCase() + p.status.slice(1).toLowerCase())))
            : 'Active',
          date: formatToCustomStr(p.createdAt || new Date()),
          treatment: p.currentTreatment || p.treatmentType || 'General'
        })));
      }
    } catch (error) {
      console.error('Failed to load report data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Helper to reset filters
  const handleResetFilters = () => {
    setDateRange('This Month');
    setStartDate('');
    setEndDate('');
    setSearchQuery('');
    setSelectedHealerId('All');
    setSelectedTreatmentType('All');
    setSelectedPatientId('All');
  };

  // Helper to filter dates relative to local system time
  const isWithinDateRange = (rowDateStr: string) => {
    if (!rowDateStr) return true;
    const cleanDate = rowDateStr.split('|')[0].trim();
    const rowDate = new Date(cleanDate);
    if (isNaN(rowDate.getTime())) return true;

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const rowDay = new Date(rowDate);
    rowDay.setHours(0, 0, 0, 0);

    if (dateRange === 'Today') {
      const diffTime = today.getTime() - rowDay.getTime();
      const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));
      return diffDays === 0;
    }
    if (dateRange === 'This Week') {
      const diffTime = today.getTime() - rowDay.getTime();
      const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));
      return diffDays >= 0 && diffDays < 7;
    }
    if (dateRange === 'This Month') {
      const diffTime = today.getTime() - rowDay.getTime();
      const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));
      return diffDays >= 0 && diffDays < 30;
    }
    if (dateRange === 'Custom') {
      if (startDate) {
        const start = new Date(startDate);
        start.setHours(0, 0, 0, 0);
        if (rowDay < start) return false;
      }
      if (endDate) {
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        if (rowDay > end) return false;
      }
      return true;
    }
    return true; // 'Custom' fallback
  };

  const getFinanceCardVal = () => {
    const filtered = financeData.filter(d => {
      if (selectedHealerId !== 'All' && d.healerId !== selectedHealerId) return false;
      if (selectedPatientId !== 'All' && d.patientId !== selectedPatientId) return false;
      if (selectedTreatmentType !== 'All' && d.treatmentType !== selectedTreatmentType) return false;
      return isWithinDateRange(d.date) && d.type === 'Income';
    });
    const sum = filtered.reduce((acc, row) => {
      const val = parseFloat(row.amount.replace(/[₹,]/g, ''));
      return acc + (isNaN(val) ? 0 : val);
    }, 0);
    return `₹${sum.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  const getVisitorsCardVal = () => {
    const filtered = visitorData.filter(d => isWithinDateRange(d.date));
    return `${filtered.length} Total`;
  };

  const getSessionsCardVal = () => {
    const filtered = sessionData.filter(d => isWithinDateRange(d.date));
    return `${filtered.length.toLocaleString('en-IN')}`;
  };

  const getAttendanceCardVal = () => {
    const filtered = attendanceData.filter(d => isWithinDateRange(d.date) && d.status === 'Present');
    return `${filtered.length} Present`;
  };

  const getHealersCardVal = () => {
    const activeCount = healerData.filter(d => d.status === 'Active').length;
    return `${activeCount} Active`;
  };

  // Helper to search and filter current active list
  const getFilteredData = () => {
    switch (selectedTab) {
      case 'Finance':
        return financeData.filter(d => {
          if (selectedHealerId !== 'All' && d.healerId !== selectedHealerId) return false;
          if (selectedPatientId !== 'All' && d.patientId !== selectedPatientId) return false;
          if (selectedTreatmentType !== 'All' && d.treatmentType !== selectedTreatmentType) return false;
          return isWithinDateRange(d.date) && (
            d.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
            d.recordedBy.toLowerCase().includes(searchQuery.toLowerCase()) ||
            d.paymentMode.toLowerCase().includes(searchQuery.toLowerCase())
          );
        });
      case 'Visitors':
        return visitorData.filter(d => 
          isWithinDateRange(d.date) && (
            d.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            d.purpose.toLowerCase().includes(searchQuery.toLowerCase())
          )
        );
      case 'Sessions':
        return sessionData.filter(d => 
          isWithinDateRange(d.date) && (
            d.patient.toLowerCase().includes(searchQuery.toLowerCase()) ||
            d.healer.toLowerCase().includes(searchQuery.toLowerCase()) ||
            d.treatment.toLowerCase().includes(searchQuery.toLowerCase())
          )
        );
      case 'Attendance':
        return attendanceData.filter(d => 
          isWithinDateRange(d.date) && (
            d.worker.toLowerCase().includes(searchQuery.toLowerCase()) ||
            d.role.toLowerCase().includes(searchQuery.toLowerCase())
          )
        );
      case 'Healer':
        return healerData.filter(d => {
          if (selectedHealerId !== 'All') {
            const healerObj = healersList.find(h => h.id === selectedHealerId);
            if (healerObj && d.healer !== healerObj.name) return false;
          }
          return d.healer.toLowerCase().includes(searchQuery.toLowerCase()) ||
            d.specialty.toLowerCase().includes(searchQuery.toLowerCase());
        });
      case 'Patients':
        return patientData.filter(d => 
          isWithinDateRange(d.date) && (
            d.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            d.healer.toLowerCase().includes(searchQuery.toLowerCase()) ||
            d.treatment.toLowerCase().includes(searchQuery.toLowerCase())
          )
        );
      default:
        return [];
    }
  };

  const activeFilteredList = getFilteredData();
  const totalPages = Math.ceil(activeFilteredList.length / itemsPerPage) || 1;
  const paginatedList = activeFilteredList.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  useEffect(() => {
    setCurrentPage(1);
  }, [selectedTab, searchQuery]);

  return (
    <IonPage className="sa-page">
      <IonHeader className="ion-no-border">
        <IonToolbar className="sa-page__toolbar">
          <IonButtons slot="start">
            <IonMenuButton />
          </IonButtons>
          <IonTitle className="sa-page__toolbar-title">Reports Center</IonTitle>
          <IonButtons slot="end">
            <button className="sa-page__toolbar-avatar">BA</button>
          </IonButtons>
        </IonToolbar>
      </IonHeader>

      <IonContent className="sa-page__content">
        <div className="sa-page__body">
          {/* Header Row */}
          <div className="rp-header-row">
            <div>
              <div className="rp-title-area">
                <h1 className="rp-title">Operational Reports</h1>
                <div className="rp-isolation-badge">
                  <IonIcon icon={lockClosedOutline} className="rp-lock-icon" />
                  <span>Branch Isolation: {branchName}</span>
                </div>
              </div>
              <p className="rp-subtitle">
                Analyze branch performance, financial health, and workforce productivity across all departments.
              </p>
            </div>
            {/* <div className="rp-header-actions">
              <button className="rp-btn rp-btn--outline" onClick={() => handleExportReport('PDF')}>
                <IonIcon icon={downloadOutline} /> Export PDF
              </button>
              <button className="rp-btn rp-btn--primary" onClick={() => handleExportReport('Excel')}>
                <IonIcon icon={barChartOutline} /> Export Excel
              </button>
            </div> */}
          </div>

          {/* Filter Panel (Grey Card) */}
          <div className="rp-filter-card">
            <div className="rp-filter-group">
              <div className="rp-filter-item">
                <span className="rp-filter-label">DATE RANGE</span>
                <div className="rp-filter-toggles">
                  <button
                    className={`rp-toggle-btn ${dateRange === 'Today' ? 'rp-toggle-btn--active' : ''}`}
                    onClick={() => setDateRange('Today')}
                  >
                    Today
                  </button>
                  <button
                    className={`rp-toggle-btn ${dateRange === 'This Week' ? 'rp-toggle-btn--active' : ''}`}
                    onClick={() => setDateRange('This Week')}
                  >
                    This Week
                  </button>
                  <button
                    className={`rp-toggle-btn ${dateRange === 'This Month' ? 'rp-toggle-btn--active' : ''}`}
                    onClick={() => setDateRange('This Month')}
                  >
                    This Month
                  </button>
                  <button
                    className={`rp-toggle-btn ${dateRange === 'Custom' ? 'rp-toggle-btn--active' : ''}`}
                    onClick={() => setDateRange('Custom')}
                  >
                    <IonIcon icon={calendarOutline} className="rp-toggle-icon" />
                    Custom
                  </button>
                </div>
              </div>

              {dateRange === 'Custom' && (
                <div className="rp-filter-item">
                  <span className="rp-filter-label">START DATE</span>
                  <div className="rp-select-container">
                    <input
                      type="date"
                      className="rp-select"
                      style={{ outline: 'none', border: 'none', background: 'transparent', color: '#475569', fontSize: '13px', fontWeight: 500 }}
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                    />
                  </div>
                </div>
              )}

              {dateRange === 'Custom' && (
                <div className="rp-filter-item">
                  <span className="rp-filter-label">END DATE</span>
                  <div className="rp-select-container">
                    <input
                      type="date"
                      className="rp-select"
                      style={{ outline: 'none', border: 'none', background: 'transparent', color: '#475569', fontSize: '13px', fontWeight: 500 }}
                      value={endDate}
                      onChange={(e) => setEndDate(e.target.value)}
                    />
                  </div>
                </div>
              )}

              {/* <div className="rp-filter-item">
                <span className="rp-filter-label">ASSIGNED HEALER</span>
                <div className="rp-select-container">
                  <select
                    className="rp-select"
                    style={{ outline: 'none', border: 'none', background: 'transparent', color: '#475569', fontSize: '13px', fontWeight: 500, cursor: 'pointer' }}
                    value={selectedHealerId}
                    onChange={(e) => setSelectedHealerId(e.target.value)}
                  >
                    <option value="All">All Healers</option>
                    {healersList.map((h) => (
                      <option key={h.id} value={h.id}>{h.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="rp-filter-item">
                <span className="rp-filter-label">TREATMENT TYPE</span>
                <div className="rp-select-container">
                  <select
                    className="rp-select"
                    style={{ outline: 'none', border: 'none', background: 'transparent', color: '#475569', fontSize: '13px', fontWeight: 500, cursor: 'pointer' }}
                    value={selectedTreatmentType}
                    onChange={(e) => setSelectedTreatmentType(e.target.value)}
                  >
                    <option value="All">All Treatments</option>
                    {treatmentTypes.map((t) => (
                      <option key={t} value={t}>{t}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="rp-filter-item">
                <span className="rp-filter-label">PATIENT</span>
                <div className="rp-select-container">
                  <select
                    className="rp-select"
                    style={{ outline: 'none', border: 'none', background: 'transparent', color: '#475569', fontSize: '13px', fontWeight: 500, cursor: 'pointer' }}
                    value={selectedPatientId}
                    onChange={(e) => setSelectedPatientId(e.target.value)}
                  >
                    <option value="All">All Patients</option>
                    {patientsList.map((p) => (
                      <option key={p.id} value={p.id}>{p.name}</option>
                    ))}
                  </select>
                </div>
              </div> */}
            </div>

            <button className="rp-reset-btn" onClick={handleResetFilters}>
              <IonIcon icon={funnelOutline} />
              Reset All Filters
            </button>
          </div>

          {/* Metrics Ribbon (5 Cards) */}
          <div className="rp-metrics-row">
            {/* Card 1: Finance */}
            <div className="rp-metric-card">
              <div className="rp-metric-top">
                <div className="rp-metric-meta">
                  <span className="rp-metric-label">FINANCE</span>
                  <span className="rp-metric-val">{getFinanceCardVal()}</span>
                </div>
                <div className="rp-metric-icon rp-metric-icon--teal">
                  <IonIcon icon={cashOutline} />
                </div>
              </div>
            </div>

            {/* Card 2: Visitors */}
            <div className="rp-metric-card">
              <div className="rp-metric-top">
                <div className="rp-metric-meta">
                  <span className="rp-metric-label">VISITORS</span>
                  <span className="rp-metric-val">{getVisitorsCardVal()}</span>
                </div>
                <div className="rp-metric-icon rp-metric-icon--blue">
                  <IonIcon icon={peopleOutline} />
                </div>
              </div>
            </div>

            {/* Card 3: Sessions */}
            <div className="rp-metric-card">
              <div className="rp-metric-top">
                <div className="rp-metric-meta">
                  <span className="rp-metric-label">SESSIONS</span>
                  <span className="rp-metric-val">{getSessionsCardVal()}</span>
                </div>
                <div className="rp-metric-icon rp-metric-icon--red">
                  <IonIcon icon={timeOutline} />
                </div>
              </div>
            </div>

            {/* Card 4: Attendance */}
            <div className="rp-metric-card">
              <div className="rp-metric-top">
                <div className="rp-metric-meta">
                  <span className="rp-metric-label">ATTENDANCE</span>
                  <span className="rp-metric-val">{getAttendanceCardVal()}</span>
                </div>
                <div className="rp-metric-icon rp-metric-icon--green">
                  <IonIcon icon={checkmarkCircleOutline} />
                </div>
              </div>
            </div>

            {/* Card 5: Healers */}
            <div className="rp-metric-card">
              <div className="rp-metric-top">
                <div className="rp-metric-meta">
                  <span className="rp-metric-label">HEALERS</span>
                  <span className="rp-metric-val">{getHealersCardVal()}</span>
                </div>
                <div className="rp-metric-icon rp-metric-icon--purple">
                  <IonIcon icon={starOutline} />
                </div>
              </div>
            </div>
          </div>

          {/* Departmental Ledger Panel (Tabs & Table) */}
          <div className="rp-panel">
            <div className="rp-tabs-container">
              <div className="rp-tabs-list">
                <button
                  className={`rp-tab-btn ${selectedTab === 'Finance' ? 'rp-tab-btn--active' : ''}`}
                  onClick={() => setSelectedTab('Finance')}
                >
                  Finance
                </button>
                <button
                  className={`rp-tab-btn ${selectedTab === 'Visitors' ? 'rp-tab-btn--active' : ''}`}
                  onClick={() => setSelectedTab('Visitors')}
                >
                  Visitors
                </button>
                <button
                  className={`rp-tab-btn ${selectedTab === 'Sessions' ? 'rp-tab-btn--active' : ''}`}
                  onClick={() => setSelectedTab('Sessions')}
                >
                  Sessions
                </button>
                <button
                  className={`rp-tab-btn ${selectedTab === 'Attendance' ? 'rp-tab-btn--active' : ''}`}
                  onClick={() => setSelectedTab('Attendance')}
                >
                  Attendance
                </button>
                <button
                  className={`rp-tab-btn ${selectedTab === 'Healer' ? 'rp-tab-btn--active' : ''}`}
                  onClick={() => setSelectedTab('Healer')}
                >
                  Healer
                </button>
                <button
                  className={`rp-tab-btn ${selectedTab === 'Patients' ? 'rp-tab-btn--active' : ''}`}
                  onClick={() => setSelectedTab('Patients')}
                >
                  Patients
                </button>
              </div>
            </div>

            {/* Sub-Header Actions */}
            <div className="rp-table-header">
              <span className="rp-table-subtitle">
                Recent {selectedTab} Logs
              </span>
              <div className="rp-table-actions">
                {/* <div className="rp-search-box">
                  <IonIcon icon={searchOutline} className="rp-search-icon" />
                  <input
                    placeholder={`Search ${selectedTab.toLowerCase()} records...`}
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div> */}
                <button 
                  className="rp-table-btn" 
                  onClick={() => handleExportReport('PDF')} 
                  title={`Export ${selectedTab} as PDF`}
                  style={{ display: 'inline-flex', gap: '4px', padding: '0 8px', width: 'auto', fontSize: '12px', fontWeight: 600 }}
                >
                  <IonIcon icon={downloadOutline} style={{ fontSize: '16px' }} />
                  PDF
                </button>
                <button 
                  className="rp-table-btn" 
                  onClick={() => handleExportReport('Excel')} 
                  title={`Export ${selectedTab} as Excel`}
                  style={{ display: 'inline-flex', gap: '4px', padding: '0 8px', width: 'auto', fontSize: '12px', fontWeight: 600 }}
                >
                  <IonIcon icon={barChartOutline} style={{ fontSize: '16px' }} />
                  Excel
                </button>
              </div>
            </div>

            {/* Render tables dynamically depending on active tab */}
            <div className="rp-table-container">
              {selectedTab === 'Finance' && (
                <table className="rp-table">
                  <thead>
                    <tr>
                      <th>DATE</th>
                      <th>TRANSACTION TYPE</th>
                      <th>CATEGORY</th>
                      <th>AMOUNT</th>
                      <th>PAYMENT MODE</th>
                      <th>RECORDED BY</th>
                      <th>ACTIONS</th>
                    </tr>
                  </thead>
                  <tbody>
                    {paginatedList.length > 0 ? (
                      (paginatedList as FinanceRow[]).map((row, idx) => (
                        <tr key={idx} className="rp-table-row">
                          <td className="rp-cell-bold">{row.date}</td>
                          <td>
                            <span className={`rp-badge rp-badge--${row.type.toLowerCase()}`}>
                              {row.type}
                            </span>
                          </td>
                          <td>{row.category}</td>
                          <td className="rp-cell-bold">{row.amount}</td>
                          <td>
                            <div className="rp-mode-cell">
                              <IonIcon icon={cardOutline} className="rp-mode-icon" />
                              {row.paymentMode}
                            </div>
                          </td>
                          <td>{row.recordedBy}</td>
                          <td>
                            <button
                              type="button"
                              className="rp-table-btn"
                              style={{ display: 'inline-flex', width: '28px', height: '28px', padding: 0 }}
                              onClick={() => handleExportReport('PDF', `Transaction-${row.category.replace(/\s+/g, '-')}`, row)}
                              title="Download Transaction Receipt"
                            >
                              <IonIcon icon={downloadOutline} style={{ fontSize: '14px' }} />
                            </button>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={7} className="rp-table-empty">No financial logs match your query.</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              )}

              {selectedTab === 'Visitors' && (
                <table className="rp-table">
                  <thead>
                    <tr>
                      <th>DATE</th>
                      <th>VISITOR NAME</th>
                      <th>PURPOSE</th>
                      <th>CHECK-IN</th>
                      <th>CHECK-OUT</th>
                      <th>STATUS</th>
                      <th>ACTIONS</th>
                    </tr>
                  </thead>
                  <tbody>
                    {paginatedList.length > 0 ? (
                      (paginatedList as VisitorRow[]).map((row, idx) => (
                        <tr key={idx} className="rp-table-row">
                          <td className="rp-cell-bold">{row.date}</td>
                          <td className="rp-cell-bold">{row.name}</td>
                          <td>{row.purpose}</td>
                          <td>{row.checkIn}</td>
                          <td>{row.checkOut}</td>
                          <td>
                            <span className={`rp-badge rp-badge--${row.status === 'Checked Out' ? 'expense' : 'income'}`}>
                              {row.status}
                            </span>
                          </td>
                          <td>
                            <button
                              type="button"
                              className="rp-table-btn"
                              style={{ display: 'inline-flex', width: '28px', height: '28px', padding: 0 }}
                              onClick={() => handleExportReport('PDF', `Visitor-${row.name.replace(/\s+/g, '-')}`, row)}
                              title="Download Visitor Pass"
                            >
                              <IonIcon icon={downloadOutline} style={{ fontSize: '14px' }} />
                            </button>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={7} className="rp-table-empty">No visitor logs match your query.</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              )}

              {selectedTab === 'Sessions' && (
                <table className="rp-table">
                  <thead>
                    <tr>
                      <th>SESSION ID</th>
                      <th>PATIENT</th>
                      <th>HEALER</th>
                      <th>TREATMENT</th>
                      <th>TIME</th>
                      <th>STATUS</th>
                      <th>ACTIONS</th>
                    </tr>
                  </thead>
                  <tbody>
                    {paginatedList.length > 0 ? (
                      (paginatedList as SessionRow[]).map((row, idx) => (
                        <tr key={idx} className="rp-table-row">
                          <td className="rp-cell-bold">{row.id}</td>
                          <td className="rp-cell-bold">{row.patient}</td>
                          <td>{row.healer}</td>
                          <td>{row.treatment}</td>
                          <td>{row.time}</td>
                          <td>
                            <span className={`rp-badge rp-badge--${row.status === 'Completed' ? 'income' : 'general'}`}>
                              {row.status}
                            </span>
                          </td>
                          <td>
                            <button
                              type="button"
                              className="rp-table-btn"
                              style={{ display: 'inline-flex', width: '28px', height: '28px', padding: 0 }}
                              onClick={() => handleExportReport('PDF', `Session-${row.id}`, row)}
                              title="Download Session Report"
                            >
                              <IonIcon icon={downloadOutline} style={{ fontSize: '14px' }} />
                            </button>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={7} className="rp-table-empty">No session logs match your query.</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              )}

              {selectedTab === 'Attendance' && (
                <table className="rp-table">
                  <thead>
                    <tr>
                      <th>WORKER</th>
                      <th>ROLE</th>
                      <th>DATE</th>
                      {/* <th>CHECK-IN</th> */}
                      <th>TOTAL HOURS</th>
                      <th>STATUS</th>
                      <th>ACTIONS</th>
                    </tr>
                  </thead>
                  <tbody>
                    {paginatedList.length > 0 ? (
                      (paginatedList as AttendanceRow[]).map((row, idx) => (
                        <tr key={idx} className="rp-table-row">
                          <td className="rp-cell-bold">{row.worker}</td>
                          <td>{row.role}</td>
                          <td>{row.date}</td>
                          {/* <td>{row.checkIn}</td> */}
                          <td className="rp-cell-bold">{row.hours}</td>
                          <td>
                            <span className={`rp-badge rp-badge--${row.status.toLowerCase().replace(' ', '-')}`}>
                              {row.status}
                            </span>
                          </td>
                          <td>
                            <button
                              type="button"
                              className="rp-table-btn"
                              style={{ display: 'inline-flex', width: '28px', height: '28px', padding: 0 }}
                              onClick={() => handleExportReport('PDF', `Worker-${row.worker.replace(/\s+/g, '-')}`, row)}
                              title="Download Attendance Report"
                            >
                              <IonIcon icon={downloadOutline} style={{ fontSize: '14px' }} />
                            </button>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={7} className="rp-table-empty">No attendance logs match your query.</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              )}

              {selectedTab === 'Healer' && (
                <table className="rp-table">
                  <thead>
                    <tr>
                      <th>HEALER</th>
                      <th>SPECIALTY</th>
                      <th>SESSIONS CONDUCTED</th>
                      <th>STATUS</th>
                      <th>ACTIONS</th>
                    </tr>
                  </thead>
                  <tbody>
                    {paginatedList.length > 0 ? (
                      (paginatedList as HealerRow[]).map((row, idx) => (
                        <tr key={idx} className="rp-table-row">
                          <td className="rp-cell-bold">{row.healer}</td>
                          <td>{row.specialty}</td>
                          <td className="rp-cell-bold">{row.sessions}</td>
                          <td>
                            <span className="rp-badge rp-badge--income">
                              {row.status}
                            </span>
                          </td>
                          <td>
                            <button
                              type="button"
                              className="rp-table-btn"
                              style={{ display: 'inline-flex', width: '28px', height: '28px', padding: 0 }}
                              onClick={() => handleExportReport('PDF', `Healer-${row.healer.replace(/\s+/g, '-')}`, row)}
                              title="Download Healer Report"
                            >
                              <IonIcon icon={downloadOutline} style={{ fontSize: '14px' }} />
                            </button>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={5} className="rp-table-empty">No healer logs match your query.</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              )}

              {selectedTab === 'Patients' && (
                <table className="rp-table">
                  <thead>
                    <tr>
                      <th>PATIENT NAME</th>
                      <th>ASSIGNED HEALER</th>
                      <th>STATUS</th>
                      <th>REGISTRATION DATE</th>
                      <th>TREATMENT TYPE</th>
                      <th>ACTIONS</th>
                    </tr>
                  </thead>
                  <tbody>
                    {paginatedList.length > 0 ? (
                      (paginatedList as PatientRow[]).map((row, idx) => {
                        let statusColor = 'general';
                        if (row.status === 'Active') statusColor = 'income';
                        else if (row.status === 'Completed') statusColor = 'present';
                        else if (row.status === 'Under Treatment') statusColor = 'half-day';
                        else if (row.status === 'Inactive') statusColor = 'expense';

                        return (
                          <tr key={idx} className="rp-table-row">
                            <td className="rp-cell-bold">{row.name}</td>
                            <td>{row.healer}</td>
                            <td>
                              <span className={`rp-badge rp-badge--${statusColor}`}>
                                {row.status}
                              </span>
                            </td>
                            <td>{row.date}</td>
                            <td className="rp-cell-bold">{row.treatment}</td>
                            <td>
                              <button
                                type="button"
                                className="rp-table-btn"
                                style={{ display: 'inline-flex', width: '28px', height: '28px', padding: 0 }}
                                onClick={() => handleExportReport('PDF', `Patient-${row.name.replace(/\s+/g, '-')}`, row)}
                                title="Download Patient Report"
                              >
                                <IonIcon icon={downloadOutline} style={{ fontSize: '14px' }} />
                              </button>
                            </td>
                          </tr>
                        );
                      })
                    ) : (
                      <tr>
                        <td colSpan={6} className="rp-table-empty">No patient logs match your query.</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              )}
            </div>

            {/* Pagination Controls */}
            <div className="rp-pagination">
              <span className="rp-pagination-info">
                Showing {activeFilteredList.length === 0 ? 0 : (currentPage - 1) * itemsPerPage + 1} to {Math.min(currentPage * itemsPerPage, activeFilteredList.length)} of {activeFilteredList.length} entries
              </span>
              {totalPages > 1 && (
                <div className="rp-pagination-controls">
                  <button
                    className="rp-page-btn"
                    disabled={currentPage === 1}
                    onClick={() => setCurrentPage((c) => Math.max(c - 1, 1))}
                  >
                    <IonIcon icon={chevronBackOutline} />
                  </button>
                  {[...Array(totalPages)].map((_, i) => (
                    <button
                      key={i}
                      className={`rp-page-btn ${currentPage === i + 1 ? 'rp-page-btn--active' : ''}`}
                      onClick={() => setCurrentPage(i + 1)}
                    >
                      {i + 1}
                    </button>
                  ))}
                  <button
                    className="rp-page-btn"
                    disabled={currentPage === totalPages}
                    onClick={() => setCurrentPage((c) => Math.min(c + 1, totalPages))}
                  >
                    <IonIcon icon={chevronForwardOutline} />
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </IonContent>
      {/* ── MODAL: PREMIUM REPORT EXPORTER ────────────────────────────── */}
      <IonModal 
        isOpen={showExportModal} 
        onDidDismiss={() => { if (exportState === 'completed') setShowExportModal(false); }} 
        className="sa-modal sa-modal--sm"
      >
        <div className="sa-modal__header" style={{ background: '#0d5c46', color: '#fff', padding: '16px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h2 className="sa-modal__title" style={{ color: '#fff', fontSize: '16px', fontWeight: 800, margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
            <IonIcon icon={downloadOutline} /> 
            {exportState === 'generating' ? `Compiling ${exportFormat} Report` : `${exportFormat} Export Complete`}
          </h2>
          {exportState === 'completed' && (
            <button className="sa-modal__close-btn" style={{ color: '#fff', background: 'none', border: 'none', fontSize: '24px', cursor: 'pointer' }} onClick={() => setShowExportModal(false)}>&times;</button>
          )}
        </div>

        <div className="sa-modal__body" style={{ padding: '24px', textAlign: 'center' }}>
          {exportState === 'generating' ? (
            <div>
              <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '20px' }}>
                <div style={{
                  border: '4px solid #f3f3f3',
                  borderTop: '4px solid #0d5c46',
                  borderRadius: '50%',
                  width: '50px',
                  height: '50px',
                  animation: 'spin 1s linear infinite'
                }} />
              </div>
              <style dangerouslySetInnerHTML={{__html: `
                @keyframes spin {
                  0% { transform: rotate(0deg); }
                  100% { transform: rotate(360deg); }
                }
              `}} />

              <h4 style={{ margin: '0 0 8px 0', fontWeight: 700, color: '#334155', fontSize: '15px' }}>
                Processing operational database...
              </h4>
              <p style={{ margin: '0 0 20px 0', fontSize: '12px', color: '#64748b', lineHeight: 1.4 }}>
                Compiling branch files, verifying secure signatures, and packaging digital assets.
              </p>

              <div style={{ width: '100%', background: '#e2e8f0', borderRadius: '8px', height: '12px', overflow: 'hidden', position: 'relative' }}>
                <div style={{
                  width: `${exportProgress}%`,
                  background: 'linear-gradient(90deg, #10b981 0%, #0d5c46 100%)',
                  height: '100%',
                  transition: 'width 0.1s ease-out'
                }} />
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '6px', fontSize: '11px', color: '#64748b', fontWeight: 700 }}>
                <span>Formatting logs...</span>
                <span>{exportProgress}%</span>
              </div>
            </div>
          ) : (
            <div>
              <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '20px' }}>
                <div style={{
                  background: '#ecfdf5',
                  borderRadius: '50%',
                  width: '72px',
                  height: '72px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  border: '2px solid #a7f3d0'
                }}>
                  <IonIcon icon={checkmarkCircleOutline} style={{ fontSize: '42px', color: '#10b981' }} />
                </div>
              </div>

              <h3 style={{ margin: '0 0 8px 0', fontWeight: 800, color: '#0d5c46', fontSize: '18px' }}>
                Operational Report Compiled!
              </h3>
              <p style={{ margin: '0 0 20px 0', fontSize: '13px', color: '#475569', lineHeight: 1.5 }}>
                Your {exportFormat} report for <strong>{exportSubject || branchName}</strong> has been created successfully. All selected filters, stats cards, and ledger tables have been packaged.
              </p>

              <div style={{ background: '#f8fafc', padding: '12px', borderRadius: '8px', border: '1px solid #cbd5e1', marginBottom: '20px', fontSize: '11px', textAlign: 'left', fontFamily: 'monospace', color: '#475569', lineHeight: 1.6 }}>
                <div><strong>File Name:</strong> {getExportFilename()}</div>
                <div><strong>Format:</strong> {exportFormat === 'Excel' ? 'Microsoft Excel Spreadsheet' : 'Adobe PDF Document'}</div>
                <div><strong>Size:</strong> {exportFormat === 'Excel' ? '54.2 KB' : '182.8 KB'}</div>
              </div>

              <div style={{ display: 'flex', gap: '10px' }}>
                <button
                  type="button"
                  className="sa-btn sa-btn--primary"
                  style={{ flex: 1, background: '#10b981', border: 'none', justifyContent: 'center', fontSize: '13px', padding: '10px' }}
                  onClick={handleDownloadFile}
                >
                  Download File
                </button>
                <button
                  type="button"
                  className="sa-btn sa-btn--outline"
                  style={{ flex: 1, justifyContent: 'center', fontSize: '13px', padding: '10px' }}
                  onClick={() => setShowExportModal(false)}
                >
                  Close
                </button>
              </div>
            </div>
          )}
        </div>
      </IonModal>

      {/* Glassmorphic Toast Overlay */}
      {toastMessage && (
        <div className="st-toast-notification st-toast-notification--success" style={{ zIndex: 10000 }}>
          <IonIcon icon={checkmarkCircleOutline} className="toast-icon" />
          <span>{toastMessage}</span>
        </div>
      )}
    </IonPage>
  );
};

export default ReportsPage;