import React, { useState, useEffect } from 'react';
import { useHistory } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
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
  downloadOutline,
  calendarOutline,
  trendingUpOutline,
  trendingDownOutline,
  addCircleOutline,
  removeCircleOutline,
  cardOutline,
  walletOutline,
  swapHorizontalOutline,
  documentTextOutline,
  peopleOutline,
  businessOutline,
  receiptOutline,
  arrowUpOutline,
  arrowDownOutline,
  searchOutline,
  filterOutline,
  trashOutline,
  pencilOutline,
  alertCircleOutline,
  checkmarkCircleOutline,
  pieChartOutline,
  printOutline,
  eyeOutline,
} from 'ionicons/icons';
import { useAuthStore } from '../../store/auth.store';
import { ROUTES } from '../../constants/routes.constant';
import { getPayments, processPayment } from '../../api/payment.api';
import { getPatients } from '../../api/patient.api';
import { getSessions } from '../../api/session.api';
import {
  getFinanceTransactions,
  addFinanceTransaction,
  updateFinanceTransaction,
  deleteFinanceTransaction,
} from '../../api/finance.api';
import './branch-admin.css';

interface Transaction {
  id: string | number;
  category: string;
  type: 'income' | 'expense';
  amount: number;
  mode: string;
  description?: string;
  remarks?: string;
  dateStr: string; // YYYY-MM-DD
  timestamp: string; // formatted display
}

interface PatientPayment {
  id: string;
  patientId: string;
  patientName: string;
  sessionNo: string;
  totalBilled: number;
  paid: number;
  outstanding: number;
  status: 'Paid' | 'Partial' | 'Pending';
  assignedHealer: string;
  caseId: string;
  history: Array<{
    date: string;
    amount: number;
    mode: 'Cash' | 'UPI' | 'Bank Transfer';
    status: 'Paid';
  }>;
}

const mapPaymentRes = (item: any): PatientPayment => {
  return {
    id: item.id || `INV-?`,
    patientId: item.patientId || '',
    patientName: item.patientName || 'Unknown Patient',
    sessionNo: item.sessionNo || '—',
    totalBilled: parseFloat(item.totalBilled) || 0,
    paid: parseFloat(item.paid) || 0,
    outstanding: parseFloat(item.outstanding) || 0,
    status: item.paymentStatus || 'Pending',
    assignedHealer: item.healer || 'Unknown Healer',
    caseId: item.sessionId || '',
    history: item.paymentDate ? [{
      date: item.paymentDate.split('T')[0],
      amount: parseFloat(item.paid) || 0,
      mode: item.paymentMethod || 'UPI',
      status: 'Paid'
    }] : []
  };
};

const FinancePage: React.FC = () => {
  const { user } = useAuthStore();
  const [present] = useIonToast();
  const history = useHistory();
  const [isPageActive, setIsPageActive] = useState(true);

  // Branch is fixed to current branch admin's branch (not selectable)
  const BRANCH_NAME = user?.branchName || 'Current Branch';

  // Tab control state
  const [activeTab, setActiveTab] = useState<'transactions' | 'payments' | 'reports'>('transactions');

  // Modals & States
  const [showAddModal, setShowAddModal] = useState(false);
  const [addModalType, setAddModalType] = useState<'income' | 'expense'>('income');
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedTx, setSelectedTx] = useState<Transaction | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [txToDelete, setTxToDelete] = useState<string | number | null>(null);

  // Export Modal States
  const [showExportModal, setShowExportModal] = useState(false);
  const [exportFormat, setExportFormat] = useState<'PDF' | 'Excel' | null>(null);
  const [exportProgress, setExportProgress] = useState(0);
  const [exportState, setExportState] = useState<'idle' | 'generating' | 'completed'>('idle');

  /*
  Raise Invoice
  Generate Invoice
  
  // Raise Invoice & Dues List Modal States
  const [showRaiseInvoiceModal, setShowRaiseInvoiceModal] = useState(false);
  const [invoiceForm, setInvoiceForm] = useState({
    patientName: '',
    sessionNo: 'S-0001',
    amount: '',
    remarks: ''
  });
  */
  const [showDuesListModal, setShowDuesListModal] = useState(false);

  // Search & Filter States for Transactions
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState('All');
  const [filterMode, setFilterMode] = useState('All');
  const [filterMonth, setFilterMonth] = useState('All');
  const [filterQuarter, setFilterQuarter] = useState('All');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  /*
  Receipt Preview
  Transaction ID
  Download Receipt
  Print Receipt
  
  // Receipt Modal State
  const [showReceiptModal, setShowReceiptModal] = useState(false);
  const [receiptTx, setReceiptTx] = useState<Transaction | null>(null);
  */

  const queryClient = useQueryClient();

  // ─── LIVE QUERY: Finance Transactions from DB ───────────────────────────
  const apiFilters = {
    branchId: (user as any)?.branchId,
    search: searchQuery || undefined,
    type: filterType !== 'All' ? filterType.toLowerCase() : undefined,
    paymentMode: filterMode !== 'All' ? filterMode : undefined,
    startDate: startDate || undefined,
    endDate: endDate || undefined,
  };

  const { data: transactionsData, refetch: refetchTransactions } = useQuery({
    queryKey: ['branch-finance-transactions', apiFilters],
    queryFn: async () => {
      const res = await getFinanceTransactions(apiFilters);
      const raw: any[] = Array.isArray(res?.data) ? res.data : (Array.isArray(res) ? res : []);
      return raw.map((r: any): Transaction => ({
        id: r.id,
        category: r.category || 'General',
        type: r.type?.toLowerCase() === 'income' ? 'income' : 'expense',
        amount: parseFloat(r.amount) || 0,
        mode: r.paymentMode || r.payment_mode || r.mode || r.paymentMethod || 'UPI',
        description: r.description || '',
        remarks: r.remarks || '',
        dateStr: r.date ? new Date(r.date).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
        timestamp: r.date
          ? `${new Date(r.date).toISOString().split('T')[0]}, ${new Date(r.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`
          : '—',
      }));
    },
    enabled: !!user,
    refetchInterval: isPageActive ? 5000 : false,
    staleTime: 0,
  });

  const transactions: Transaction[] = transactionsData || [];

  // Live query for branch payments
  const { data: paymentsData, refetch: refetchPayments } = useQuery({
    queryKey: ['branch-payments'],
    queryFn: async () => {
      const res = await getPayments();
      const raw = Array.isArray(res?.data) ? res.data : [];
      return raw.map(mapPaymentRes);
    },
    enabled: !!user,
    refetchInterval: isPageActive ? 3000 : false,
    staleTime: 0,
  });

  const patientPayments: PatientPayment[] = paymentsData || [];

  // Live query for patients
  const { data: patientsData, refetch: refetchPatients } = useQuery({
    queryKey: ['branch-patients'],
    queryFn: async () => {
      const res = await getPatients();
      return Array.isArray(res?.data) ? res.data : [];
    },
    enabled: !!user,
    refetchInterval: isPageActive ? 3000 : false,
    staleTime: 0,
  });

  const activePatients = patientsData || [];

  // Record Payment Modal & Form State
  const [showRecordPaymentModal, setShowRecordPaymentModal] = useState(false);
  const [paymentForm, setPaymentForm] = useState({
    patientId: '',
    sessionId: '',
    sessionNo: '',
    amountBilled: 0,
    outstanding: 0,
    amountPaid: '',
    paymentMode: 'UPI' as 'UPI' | 'Cash' | 'Bank Transfer',
    remarks: ''
  });

  // Patient Billing Summary Drawer States
  const [showDrawer, setShowDrawer] = useState(false);
  const [drawerPayment, setDrawerPayment] = useState<PatientPayment | null>(null);
  const [patientSessions, setPatientSessions] = useState<any[]>([]);

  // Search & Filters for Patient Payments
  const [paySearchQuery, setPaySearchQuery] = useState('');
  const [payFilterStatus, setPayFilterStatus] = useState('All');
  const [payFilterHealer, setPayFilterHealer] = useState('');
  const [payFilterSession, setPayFilterSession] = useState('');
  const [payStartDate, setPayStartDate] = useState('');
  const [payEndDate, setPayEndDate] = useState('');

  // Pre-fill modal from URL parameters (Session Integration)
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const openRecordPay = params.get('recordPayment');
    const patientName = params.get('patientName');
    const sessionNo = params.get('sessionNo');
    
    if (openRecordPay === 'true' && (paymentsData || activePatients.length > 0)) {
      setActiveTab('payments');
      setShowRecordPaymentModal(true);
      
      const liveSession = (paymentsData || []).find((s: any) => s.sessionNo === sessionNo || s.caseId === sessionNo);
      
      let targetPatientId = '';
      if (liveSession) {
        targetPatientId = liveSession.patientId || '';
      } else if (patientName) {
        const matchedPatient = activePatients.find(
          (p: any) => p.name.toLowerCase() === patientName.toLowerCase() || p.id === patientName
        );
        targetPatientId = matchedPatient ? matchedPatient.id : patientName;
      }

      if (targetPatientId) {
        getSessions({ patient_id: targetPatientId }).then(res => {
          const sessions = res?.data ?? (Array.isArray(res) ? res : []);
          setPatientSessions(sessions);
          
          const matchedSession = sessions.find((s: any) => 
            s.sessionNo === sessionNo || 
            s.id === sessionNo || 
            `SES-${s.id.substring(0, 6).toUpperCase()}` === sessionNo
          ) || sessions[0];

          if (matchedSession) {
            const billed = matchedSession.sessionFee !== null && matchedSession.sessionFee !== undefined
              ? parseFloat(matchedSession.sessionFee)
              : (parseFloat(matchedSession.totalAmount) || 0);

            const rawStatus = (matchedSession.paymentStatus || 'pending').toLowerCase();
            let paidAmount = 0;
            let outstanding = 0;

            if (rawStatus === 'paid') {
              outstanding = 0;
            } else if (rawStatus === 'pending' || rawStatus === 'unpaid') {
              outstanding = billed;
            } else {
              paidAmount = matchedSession.payment ? parseFloat(matchedSession.payment.amount) || 0 : 0;
              outstanding = Math.max(0, billed - paidAmount);
            }

            setPaymentForm({
              patientId: targetPatientId,
              sessionId: matchedSession.id,
              sessionNo: matchedSession.sessionNo || `SES-${matchedSession.id.substring(0, 6).toUpperCase()}`,
              amountBilled: billed,
              outstanding: outstanding,
              amountPaid: String(outstanding),
              paymentMode: 'UPI',
              remarks: `Recorded via Session Manager (${sessionNo || ''})`
            });
          } else {
            setPaymentForm({
              patientId: targetPatientId,
              sessionId: '',
              sessionNo: sessionNo || '',
              amountBilled: 1200,
              outstanding: 1200,
              amountPaid: '1200',
              paymentMode: 'UPI',
              remarks: `Recorded via Session Manager (${sessionNo || ''})`
            });
          }
        }).catch(err => {
          console.error(err);
          setPaymentForm({
            patientId: targetPatientId,
            sessionId: liveSession ? liveSession.caseId : '',
            sessionNo: liveSession ? liveSession.sessionNo : (sessionNo || ''),
            amountBilled: liveSession ? liveSession.totalBilled : 1200,
            outstanding: liveSession ? liveSession.outstanding : 1200,
            amountPaid: liveSession ? String(liveSession.outstanding) : '1200',
            paymentMode: 'UPI',
            remarks: `Recorded via Session Manager (${sessionNo || ''})`
          });
        });
      }

      // Clear search params to prevent reopening on reload
      window.history.replaceState({}, document.title, window.location.pathname + window.location.hash);
    }
  }, [paymentsData, activePatients]);

  useIonViewWillEnter(() => {
    setIsPageActive(true);
    refetchPayments();
    refetchTransactions();
  });


  // Form input states
  const [newTx, setNewTx] = useState({
    category: 'Session Fee',
    amount: '',
    mode: 'UPI (GPay)',
    description: '',
  });

  const [editTxState, setEditTxState] = useState({
    category: 'Session Fee',
    amount: '',
    mode: 'UPI (GPay)',
    description: '',
  });

  // Toast helper
  const triggerToast = (msg: string, color: 'success' | 'danger' = 'success') => {
    present({
      message: msg,
      duration: 3000,
      position: 'top',
      color: color,
    });
  };

  // ─── LIVE MUTATIONS: Add / Update / Delete ────────────────────────────
  const addTxMutation = useMutation({
    mutationFn: (data: any) => addFinanceTransaction(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['branch-finance-transactions'] });
      refetchTransactions();
    },
  });

  const updateTxMutation = useMutation({
    mutationFn: ({ id, data }: { id: string | number; data: any }) => updateFinanceTransaction(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['branch-finance-transactions'] });
      refetchTransactions();
    },
  });

  const deleteTxMutation = useMutation({
    mutationFn: (id: string | number) => deleteFinanceTransaction(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['branch-finance-transactions'] });
      refetchTransactions();
    },
  });

  // ─── TOTALS: Computed purely from live DB records ─────────────────────

  // Compute live real-time totals dynamically from DB records only
  const incomeFromTransactions = transactions
    .filter((t) => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0);

  const expenseFromTransactions = transactions
    .filter((t) => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);

  const totalRevenue = incomeFromTransactions;
  const totalExpenses = expenseFromTransactions;
  const netBalance = totalRevenue - totalExpenses;

  // Today's finance summary
  const todayStr = new Date().toISOString().split('T')[0];
  const todayIncome = transactions
    .filter(t => t.type === 'income' && t.dateStr === todayStr)
    .reduce((sum, t) => sum + t.amount, 0);
  const todayExpense = transactions
    .filter(t => t.type === 'expense' && t.dateStr === todayStr)
    .reduce((sum, t) => sum + t.amount, 0);

  // Real-time audit balances
  const cashInHand = transactions
    .filter((t) => t.type === 'income' && t.mode.toLowerCase().includes('cash'))
    .reduce((sum, t) => sum + t.amount, 0) - transactions
    .filter((t) => t.type === 'expense' && t.mode.toLowerCase().includes('cash'))
    .reduce((sum, t) => sum + t.amount, 0);

  const onlineBalance = transactions
    .filter((t) => t.type === 'income' && !t.mode.toLowerCase().includes('cash'))
    .reduce((sum, t) => sum + t.amount, 0) - transactions
    .filter((t) => t.type === 'expense' && !t.mode.toLowerCase().includes('cash'))
    .reduce((sum, t) => sum + t.amount, 0);

  const totalBalance = cashInHand + onlineBalance;
  const cashPct = totalBalance > 0 ? Math.round((cashInHand / totalBalance) * 100) : 0;
  const upiPct = 100 - cashPct;

  // Add transaction popup
  const handleOpenAddModal = (type: 'income' | 'expense') => {
    setAddModalType(type);
    setNewTx({
      category: type === 'income' ? 'Session Fee' : 'Utilities',
      amount: '',
      mode: type === 'income' ? 'UPI (GPay)' : 'Cash',
      description: '',
    });
    setShowAddModal(true);
  };

  // Transaction Validation & Submit — calls live API
  const handleRecordTx = async () => {
    const parsedAmount = parseFloat(newTx.amount);
    if (!newTx.amount.trim() || isNaN(parsedAmount) || parsedAmount <= 0) {
      alert('Validation Error: Transaction amount must be a positive number greater than zero.');
      return;
    }
    if (!newTx.category.trim()) {
      alert('Validation Error: Please specify a transaction category.');
      return;
    }
    if (!newTx.mode.trim()) {
      alert('Validation Error: Please select a valid payment mode.');
      return;
    }
    try {
      await addTxMutation.mutateAsync({
        branch_id: (user as any)?.branchId,
        type: addModalType === 'income' ? 'INCOME' : 'EXPENSE',
        category: newTx.category,
        amount: parsedAmount,
        payment_mode: newTx.mode,
        description: newTx.description.trim() || 'No description provided.',
        remarks: newTx.description.trim() || 'No remarks provided.',
        created_by: user?.name || user?.email || 'System',
        date: new Date().toISOString(),
      });
      setShowAddModal(false);
      triggerToast(`${addModalType.toUpperCase()} transaction recorded under category "${newTx.category}". All analytics updated!`);
    } catch (err: any) {
      console.error(err);
      triggerToast('Failed to record transaction: ' + (err?.response?.data?.message || err.message), 'danger');
    }
  };

  // Soft Edit Dialog Trigger
  const handleOpenEditModal = (tx: Transaction) => {
    setSelectedTx(tx);
    setEditTxState({
      category: tx.category,
      amount: String(tx.amount),
      mode: tx.mode,
      description: tx.remarks || tx.description || '',
    });
    setShowEditModal(true);
  };

  // Save changes — calls live API
  const handleEditTxSubmit = async () => {
    if (!selectedTx) return;
    const parsedAmount = parseFloat(editTxState.amount);
    if (!editTxState.amount.trim() || isNaN(parsedAmount) || parsedAmount <= 0) {
      alert('Validation Error: Transaction amount must be a positive number greater than zero.');
      return;
    }
    if (!editTxState.category.trim()) {
      alert('Validation Error: Please specify a transaction category.');
      return;
    }
    if (!editTxState.mode.trim()) {
      alert('Validation Error: Please select a valid payment mode.');
      return;
    }
    try {
      await updateTxMutation.mutateAsync({
        id: selectedTx.id,
        data: {
          category: editTxState.category,
          amount: parsedAmount,
          payment_mode: editTxState.mode,
          description: editTxState.description.trim() || 'No description provided.',
          remarks: editTxState.description.trim() || 'No remarks provided.',
        },
      });
      setShowEditModal(false);
      setSelectedTx(null);
      triggerToast('Transaction record updated successfully.');
    } catch (err: any) {
      console.error(err);
      triggerToast('Failed to update transaction: ' + (err?.response?.data?.message || err.message), 'danger');
    }
  };

  // Delete — calls live API
  const handleDeleteTx = async (id: string | number) => {
    try {
      await deleteTxMutation.mutateAsync(id);
      triggerToast('Payment record deleted successfully.');
      setShowDeleteModal(false);
      setTxToDelete(null);
    } catch (err: any) {
      console.error('Error deleting transaction:', err);
      triggerToast('Failed to delete transaction: ' + (err?.response?.data?.message || err.message), 'danger');
    }
  };

  /*
  Receipt Preview
  Transaction ID
  Download Receipt
  Print Receipt
  
  // Print Receipt simulator
  const handlePrintReceipt = (tx: Transaction) => {
    setReceiptTx(tx);
    setShowReceiptModal(true);
  };
  */

  // Premium Report Export Triggers
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

  const handleDownloadFile = () => {
    // Generate CSV data from database records (filteredTransactions)
    const headers = ["Timestamp", "Category", "Remarks", "Type", "Amount", "Mode"];
    const rows = filteredTransactions.map(tx => [
      `"${tx.timestamp}"`,
      `"${tx.category}"`,
      `"${(tx.remarks || tx.description || '').replace(/"/g, '""')}"`,
      `"${tx.type.toUpperCase()}"`,
      tx.amount,
      `"${tx.mode}"`
    ]);
    
    const csvContent = [headers.join(","), ...rows.map(e => e.join(","))].join("\n");
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    
    const extension = exportFormat === 'Excel' ? 'csv' : 'txt';
    const filename = `PHMS-Finance-Report-${BRANCH_NAME.replace(/\s+/g, '-')}-${new Date().getFullYear()}.${extension}`;
    
    link.setAttribute("download", filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    setShowExportModal(false);
    triggerToast(`Downloaded ${filename} successfully!`);
  };

  // Comprehensive Search & Advanced Filtering calculations
  const filteredTransactions = transactions.filter((tx) => {
    const matchesSearch =
      tx.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (tx.description || '').toLowerCase().includes(searchQuery.toLowerCase());

    const matchesType = filterType === 'All' || tx.type === filterType.toLowerCase();
    const matchesMode = filterMode === 'All' || tx.mode.toLowerCase().includes(filterMode.toLowerCase());

    let matchesMonth = true;
    if (filterMonth !== 'All') {
      const parts = tx.dateStr.split('-');
      const yearMonth = `${parts[0]}-${parts[1]}`;
      matchesMonth = yearMonth === filterMonth;
    }

    let matchesQuarter = true;
    if (filterQuarter !== 'All') {
      const monthInt = parseInt(tx.dateStr.split('-')[1], 10);
      if (filterQuarter === 'Q1') {
        matchesQuarter = monthInt >= 1 && monthInt <= 3;
      } else if (filterQuarter === 'Q2') {
        matchesQuarter = monthInt >= 4 && monthInt <= 6;
      } else if (filterQuarter === 'Q3') {
        matchesQuarter = monthInt >= 7 && monthInt <= 9;
      } else if (filterQuarter === 'Q4') {
        matchesQuarter = monthInt >= 10 && monthInt <= 12;
      }
    }

    let matchesCustomRange = true;
    if (startDate) {
      matchesCustomRange = matchesCustomRange && tx.dateStr >= startDate;
    }
    if (endDate) {
      matchesCustomRange = matchesCustomRange && tx.dateStr <= endDate;
    }

    return matchesSearch && matchesType && matchesMode && matchesMonth && matchesQuarter && matchesCustomRange;
  });

  // Comprehensive Patient Payments search & filter calculations
  const filteredPatientPayments = patientPayments.filter(p => {
    const matchesSearch = p.patientName.toLowerCase().includes(paySearchQuery.toLowerCase());
    const matchesStatus = payFilterStatus === 'All' || p.status === payFilterStatus;
    const matchesHealer = !payFilterHealer.trim() || p.assignedHealer.toLowerCase().includes(payFilterHealer.toLowerCase());
    const matchesSession = !payFilterSession.trim() || p.sessionNo.toLowerCase().includes(payFilterSession.toLowerCase());
    
    let matchesDate = true;
    if (payStartDate || payEndDate) {
      matchesDate = p.history.some(h => {
        let isAfter = true;
        let isBefore = true;
        if (payStartDate) isAfter = h.date >= payStartDate;
        if (payEndDate) isBefore = h.date <= payEndDate;
        return isAfter && isBefore;
      });
      if (p.history.length === 0) matchesDate = false;
    }
    
    return matchesSearch && matchesStatus && matchesHealer && matchesSession && matchesDate;
  });

  // Handle patient autocomplete / billing defaults inside modal
  const handlePaymentFormPatientChange = async (patientId: string) => {
    if (!patientId) {
      setPatientSessions([]);
      setPaymentForm(prev => ({
        ...prev,
        patientId: '',
        sessionId: '',
        sessionNo: '',
        amountBilled: 0,
        outstanding: 0,
        amountPaid: '',
      }));
      return;
    }

    try {
      const res = await getSessions({ patient_id: patientId });
      const sessions = res?.data ?? (Array.isArray(res) ? res : []);
      setPatientSessions(sessions);

      const firstSession = sessions[0];
      if (firstSession) {
        const billed = firstSession.sessionFee !== null && firstSession.sessionFee !== undefined
          ? parseFloat(firstSession.sessionFee)
          : (parseFloat(firstSession.totalAmount) || 0);

        const rawStatus = (firstSession.paymentStatus || 'pending').toLowerCase();
        let paidAmount = 0;
        let outstanding = 0;

        if (rawStatus === 'paid') {
          outstanding = 0;
        } else if (rawStatus === 'pending' || rawStatus === 'unpaid') {
          outstanding = billed;
        } else {
          paidAmount = firstSession.payment ? parseFloat(firstSession.payment.amount) || 0 : 0;
          outstanding = Math.max(0, billed - paidAmount);
        }

        setPaymentForm(prev => ({
          ...prev,
          patientId,
          sessionId: firstSession.id,
          sessionNo: firstSession.sessionNo || `SES-${firstSession.id.substring(0, 6).toUpperCase()}`,
          amountBilled: billed,
          outstanding: outstanding,
          amountPaid: String(outstanding),
        }));
      } else {
        setPaymentForm(prev => ({
          ...prev,
          patientId,
          sessionId: '',
          sessionNo: '',
          amountBilled: 0,
          outstanding: 0,
          amountPaid: '',
        }));
      }
    } catch (error) {
      console.error('Error loading patient sessions:', error);
    }
  };

  const handlePaymentFormSessionChange = (sessionId: string) => {
    const session = patientSessions.find((s: any) => s.id === sessionId);
    if (session) {
      const billed = session.sessionFee !== null && session.sessionFee !== undefined
        ? parseFloat(session.sessionFee)
        : (parseFloat(session.totalAmount) || 0);

      const rawStatus = (session.paymentStatus || 'pending').toLowerCase();
      let paidAmount = 0;
      let outstanding = 0;

      if (rawStatus === 'paid') {
        outstanding = 0;
      } else if (rawStatus === 'pending' || rawStatus === 'unpaid') {
        outstanding = billed;
      } else {
        paidAmount = session.payment ? parseFloat(session.payment.amount) || 0 : 0;
        outstanding = Math.max(0, billed - paidAmount);
      }

      setPaymentForm(prev => ({
        ...prev,
        sessionId,
        sessionNo: session.sessionNo || `SES-${session.id.substring(0, 6).toUpperCase()}`,
        amountBilled: billed,
        outstanding: outstanding,
        amountPaid: String(outstanding),
      }));
    } else {
      setPaymentForm(prev => ({
        ...prev,
        sessionId: '',
        sessionNo: '',
        amountBilled: 0,
        outstanding: 0,
        amountPaid: '',
      }));
    }
  };

  // Submit recorded patient payment
  const handleRecordPaymentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const paidVal = parseFloat(paymentForm.amountPaid);
    if (isNaN(paidVal) || paidVal < 0) {
      alert('Error: Please enter a valid non-negative payment amount.');
      return;
    }
    if (paidVal > paymentForm.outstanding) {
      alert(`Error: Amount paid (₹${paidVal}) cannot exceed outstanding amount (₹${paymentForm.outstanding}).`);
      return;
    }
    if (!paymentForm.sessionId) {
      alert('Error: Please select a valid session.');
      return;
    }

    try {
      await processPayment({
        sessionId: paymentForm.sessionId,
        amount: paidVal,
        paymentMethod: paymentForm.paymentMode,
        branchId: (user as any)?.branchId
      });

      // Refetch live payments list from DB
      refetchPayments();

      if (paymentForm.patientId) {
        getSessions({ patient_id: paymentForm.patientId }).then(res => {
          const sessions = res?.data ?? (Array.isArray(res) ? res : []);
          setPatientSessions(sessions);
        }).catch(err => console.error(err));
      }

      // Refetch live transactions from DB to reflect payment
      refetchTransactions();

      setShowRecordPaymentModal(false);
      triggerToast(`Payment of ₹${paidVal} successfully recorded for session ${paymentForm.sessionNo}.`);
    } catch (err: any) {
      console.error(err);
      alert('Failed to record payment: ' + (err.response?.data?.message || err.message));
    }
  };

  // Patient Payments Billed & Paid aggregates calculation
  const totalPatientBilled = patientPayments.reduce((sum, p) => sum + p.totalBilled, 0);
  const totalPatientPaid = patientPayments.reduce((sum, p) => sum + p.paid, 0);
  const totalPatientOutstanding = totalPatientBilled - totalPatientPaid;
  const totalPendingCases = patientPayments.filter(p => p.status !== 'Paid').length;

  return (
    <IonPage className="sa-page">
      <IonHeader className="ion-no-border">
        <IonToolbar className="sa-page__toolbar">
          <IonButtons slot="start">
            <IonMenuButton />
          </IonButtons>
          <IonTitle className="sa-page__toolbar-title">Finance &amp; Ledger Control</IonTitle>
          <IonButtons slot="end">
            <button className="sa-page__toolbar-avatar">BA</button>
          </IonButtons>
        </IonToolbar>
      </IonHeader>

      <IonContent className="sa-page__content">
        <div className="sa-page__body">
          
          {/* Header row — Branch is auto-assigned */}
          <div className="bf-header">
            <div className="bf-breadcrumb">
              <span>Accounting &amp; Finance</span> / <span>Ledger Management</span>
            </div>
            <div className="bf-header-row" style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px', alignItems: 'flex-start' }}>
              <div>
                <h1 className="bf-title">Finance Management</h1>
                <p style={{ margin: '4px 0 0 0', fontSize: '13px', color: '#64748b', fontWeight: 500 }}>
                  Monitor treasury accounts, cash flows, and record branch collections
                </p>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 14px', background: '#ecfdf5', borderRadius: '8px', border: '1px solid #a7f3d0' }}>
                <span style={{ fontSize: '11px', fontWeight: 700, color: '#065f46' }}>BRANCH:</span>
                <span style={{ fontSize: '13px', fontWeight: 800, color: '#0d5c46' }}>{BRANCH_NAME}</span>
              </div>
            </div>
          </div>

          {/* Premium Tab Bar for BRD compliant navigation */}
          <div className="bf-tabs" style={{ display: 'flex', borderBottom: '2px solid #cbd5e1', gap: '24px', margin: '20px 0' }}>
            <button 
              type="button"
              onClick={() => setActiveTab('transactions')}
              style={{
                background: 'none', border: 'none', padding: '12px 4px', fontSize: '14px', fontWeight: 600,
                color: activeTab === 'transactions' ? '#0D5C46' : '#64748b',
                borderBottom: activeTab === 'transactions' ? '3px solid #0D5C46' : '3px solid transparent',
                cursor: 'pointer', outline: 'none', transition: 'all 0.15s ease'
              }}
            >
              Transactions
            </button>
            <button 
              type="button"
              onClick={() => setActiveTab('payments')}
              style={{
                background: 'none', border: 'none', padding: '12px 4px', fontSize: '14px', fontWeight: 600,
                color: activeTab === 'payments' ? '#0D5C46' : '#64748b',
                borderBottom: activeTab === 'payments' ? '3px solid #0D5C46' : '3px solid transparent',
                cursor: 'pointer', outline: 'none', transition: 'all 0.15s ease'
              }}
            >
              Patient Payments
            </button>
            {/* <button 
              type="button"
              onClick={() => setActiveTab('reports')}
              style={{
                background: 'none', border: 'none', padding: '12px 4px', fontSize: '14px', fontWeight: activeTab === 'reports' ? 800 : 500,
                color: activeTab === 'reports' ? '#0D5C46' : '#64748b',
                borderBottom: activeTab === 'reports' ? '3px solid #0D5C46' : 'none',
                cursor: 'pointer', outline: 'none', transition: 'all 0.15s ease'
              }}
            >
              Reports
            </button> */}
          </div>

          {activeTab === 'transactions' && (
            <>
              {/* Stats Analytics Cards Panel with dynamic balances */}
              <div className="bf-stats-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '16px', marginTop: '20px' }}>
                
                {/* Revenue card */}
                <div className="bf-stat-card bf-stat-card--revenue">
                  <div className="bf-stat-label">TOTAL REVENUE</div>
                  <div className="bf-stat-value">₹{totalRevenue.toLocaleString()}</div>
                  {/* <div className="bf-stat-trend bf-stat-trend--up">
                    <IonIcon icon={trendingUpOutline} /> +12.5% vs last month
                  </div> */}
                </div>

                {/* Expenses card */}
                <div className="bf-stat-card bf-stat-card--expenses">
                  <div className="bf-stat-label">TOTAL EXPENSES</div>
                  <div className="bf-stat-value">₹{totalExpenses.toLocaleString()}</div>
                  {/* <div className="bf-stat-trend bf-stat-trend--down">
                    <IonIcon icon={trendingDownOutline} /> -2.4% vs last week
                  </div> */}
                </div>

                {/* NEW Net Balance card (Rule 1) */}
                <div className="bf-stat-card" style={{ background: 'linear-gradient(135deg, #0f766e 0%, #115e59 100%)', color: 'white' }}>
                  <div className="bf-stat-label" style={{ color: 'rgba(255,255,255,0.8)' }}>NET TREASURY BALANCE</div>
                  <div className="bf-stat-value" style={{ color: 'white' }}>₹{netBalance.toLocaleString()}</div>
                  <div style={{ fontSize: '11px', fontWeight: 600, color: '#e6fffa', marginTop: '4px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <IonIcon icon={checkmarkCircleOutline} /> Dynamic Balance Sheet Clear
                  </div>
                </div>

               

                {/* Insights card */}
                {/* <div className="bf-stat-card" style={{ background: '#f8fafc', border: '1px solid #cbd5e1' }}>
                  <div className="bf-stat-label" style={{ color: '#475569' }}>PROFIT RATIO INSIGHTS</div>
                  <div style={{ display: 'flex', gap: '12px', marginTop: '8px' }}>
                    <div>
                      <div style={{ fontSize: '10px', color: '#64748b', fontWeight: 700 }}>MARGIN</div>
                      <strong style={{ fontSize: '16px', color: '#0f766e' }}>{profitMarginPct}%</strong>
                    </div>
                    <div>
                      <div style={{ fontSize: '10px', color: '#64748b', fontWeight: 700 }}>EXPENSE RATIO</div>
                      <strong style={{ fontSize: '16px', color: '#b91c1c' }}>{expenseRatioPct}%</strong>
                    </div>
                  </div>
                  <div className="bf-stat-subtext" style={{ color: '#64748b', fontSize: '10px', marginTop: '6px' }}>
                    Based on active operational margins
                  </div>
                </div> */}

              </div>

              {/* Daily Finance Summary Row */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '16px', marginTop: '16px' }}>

                {/* Today Income */}
                <div className="bf-stat-card" style={{ background: 'linear-gradient(135deg, #ecfdf5 0%, #d1fae5 100%)', border: '1px solid #a7f3d0' }}>
                  <div className="bf-stat-label" style={{ color: '#065f46', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <IonIcon icon={calendarOutline} style={{ fontSize: '12px' }} /> TODAY'S INCOME
                  </div>
                  <div className="bf-stat-value" style={{ color: '#059669' }}>₹{todayIncome.toLocaleString()}</div>
                  <div style={{ fontSize: '10px', fontWeight: 600, color: '#10b981', marginTop: '4px' }}>
                    {new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                  </div>
                </div>

                {/* Today Expense */}
                <div className="bf-stat-card" style={{ background: 'linear-gradient(135deg, #fef2f2 0%, #fee2e2 100%)', border: '1px solid #fecaca' }}>
                  <div className="bf-stat-label" style={{ color: '#991b1b', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <IonIcon icon={calendarOutline} style={{ fontSize: '12px' }} /> TODAY'S EXPENSE
                  </div>
                  <div className="bf-stat-value" style={{ color: '#ef4444' }}>₹{todayExpense.toLocaleString()}</div>
                  <div style={{ fontSize: '10px', fontWeight: 600, color: '#b91c1c', marginTop: '4px' }}>
                    {new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                  </div>
                </div>

                {/* Today Net */}
                {/* <div className="bf-stat-card" style={{ background: todayNet >= 0 ? 'linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%)' : 'linear-gradient(135deg, #fef9c3 0%, #fef08a 100%)', border: `1px solid ${todayNet >= 0 ? '#bfdbfe' : '#fde047'}` }}>
                  <div className="bf-stat-label" style={{ color: todayNet >= 0 ? '#1e40af' : '#92400e', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <IonIcon icon={calendarOutline} style={{ fontSize: '12px' }} /> TODAY'S NET
                  </div>
                  <div className="bf-stat-value" style={{ color: todayNet >= 0 ? '#2563eb' : '#d97706' }}>
                    {todayNet >= 0 ? '+' : ''}₹{todayNet.toLocaleString()}
                  </div>
                  <div style={{ fontSize: '10px', fontWeight: 600, color: todayNet >= 0 ? '#3b82f6' : '#b45309', marginTop: '4px' }}>
                    {todayNet >= 0 ? 'Positive today' : 'Net loss today'}
                  </div>
                </div> */}

                {/* Outstanding Payments Alert */}
                <div className="bf-stat-card" style={{ background: 'linear-gradient(135deg, #fff7ed 0%, #ffedd5 100%)', border: '1px solid #fed7aa' }}>
                  <div className="bf-stat-label" style={{ color: '#7c2d12', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <IonIcon icon={alertCircleOutline} style={{ fontSize: '12px' }} /> OUTSTANDING
                  </div>
                  <div className="bf-stat-value" style={{ color: '#ea580c' }}>₹{totalPatientOutstanding.toLocaleString()}</div>
                  <div style={{ fontSize: '10px', fontWeight: 600, color: '#c2410c', marginTop: '4px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <IonIcon icon={peopleOutline} /> {totalPendingCases} pending cases
                  </div>
                </div>

              </div>

              {/* Advanced Filtering Controls Block */}
              <div className="sa-section" style={{ marginTop: '24px', padding: '16px', borderRadius: '12px', border: '1px solid #cbd5e1', background: 'white' }}>
                <h3 style={{ margin: '0 0 12px 0', fontSize: '14px', fontWeight: 800, color: '#334155', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <IonIcon icon={filterOutline} style={{ color: 'var(--ba-color-primary)' }} /> Advanced Query Search Filters
                </h3>
                
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px' }}>
                  {/* Category/Remarks Search */}
                  <div className="sa-search" style={{ margin: 0, width: '100%' }}>
                    <IonIcon icon={searchOutline} />
                    <input
                      placeholder="Search by category, remarks, or creator..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                  </div>

                  {/* Type Select */}
                  <select
                    className="sa-input"
                    value={filterType}
                    onChange={(e) => setFilterType(e.target.value)}
                  >
                    <option value="All">All Types</option>
                    <option value="Income">Income (Cash In)</option>
                    <option value="Expense">Expense (Cash Out)</option>
                  </select>

                  {/* Mode Select */}
                  <select
                    className="sa-input"
                    value={filterMode}
                    onChange={(e) => setFilterMode(e.target.value)}
                  >
                    <option value="All">All Payment Modes</option>
                    <option value="Cash">Cash</option>
                    <option value="UPI">UPI / Online</option>
                  </select>

                  {/* Monthly Filter */}
                  {/* <select
                    className="sa-input"
                    value={filterMonth}
                    onChange={(e) => setFilterMonth(e.target.value)}
                  >
                    <option value="All">All Months (2026)</option>
                    <option value="2026-05">May 2026</option>
                    <option value="2026-04">April 2026</option>
                    <option value="2026-03">March 2026</option>
                  </select> */}

                  {/* Quarterly Filter */}
                  {/* <select
                    className="sa-input"
                    value={filterQuarter}
                    onChange={(e) => setFilterQuarter(e.target.value)}
                  >
                    <option value="All">All Quarters (YTD)</option>
                    <option value="Q1">Q1 (Jan - Mar)</option>
                    <option value="Q2">Q2 (Apr - Jun)</option>
                    <option value="Q3">Q3 (Jul - Sep)</option>
                    <option value="Q4">Q4 (Oct - Dec)</option>
                  </select> */}
                </div>

                {/* Custom From-To Picker Block */}
                <div className="bf-date-filter-row">
                  <span style={{ fontSize: '12px', fontWeight: 700, color: '#475569' }}>CUSTOM FROM:</span>
                  <input
                    type="date"
                    className="sa-input"
                    style={{ width: '150px', padding: '6px 10px', fontSize: '12px' }}
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                  />
                  <span style={{ fontSize: '12px', fontWeight: 700, color: '#475569' }}>TO:</span>
                  <input
                    type="date"
                    className="sa-input"
                    style={{ width: '150px', padding: '6px 10px', fontSize: '12px' }}
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                  />
                  <button 
                    className="sa-btn sa-btn--outline"
                    style={{ padding: '6px 12px', fontSize: '12px' }}
                    onClick={() => {
                      setSearchQuery('');
                      setFilterType('All');
                      setFilterMode('All');
                      setFilterMonth('All');
                      setFilterQuarter('All');
                      setStartDate('');
                      setEndDate('');
                    }}
                  >
                    Reset Filters
                  </button>

                  <div className="bf-export-btns">
                    <button className="bf-btn-export" style={{ margin: 0 }} onClick={() => handleExportReport('PDF')}>
                      <IonIcon icon={downloadOutline} style={{ marginRight: '4px' }} /> Export PDF
                    </button>
                    <button className="bf-btn-export" style={{ margin: 0, background: '#16a34a', borderColor: '#16a34a', color: 'white' }} onClick={() => handleExportReport('Excel')}>
                      <IonIcon icon={downloadOutline} style={{ marginRight: '4px' }} /> Export Excel
                    </button>
                  </div>
                </div>
              </div>

              {/* Daily Transactions Card - Full Width */}
              <div className="bf-card" style={{ marginTop: '24px' }}>
                <div className="bf-card-header" style={{ flexWrap: 'wrap', gap: '12px' }}>
                  <div>
                    <h2 className="bf-card-title">Daily Transactions</h2>
                    <p className="bf-card-subtitle">Detailed ledger of active operational collections</p>
                  </div>
                  <div className="bf-card-header-actions" style={{ display: 'flex', gap: '8px' }}>
                    <button 
                      className="bf-btn-add-income"
                      onClick={() => handleOpenAddModal('income')}
                    >
                      <IonIcon icon={addCircleOutline} /> Add Income
                    </button>
                    <button 
                      className="bf-btn-add-expense"
                      style={{ background: '#ef4444', borderColor: '#ef4444', color: 'white' }}
                      onClick={() => handleOpenAddModal('expense')}
                    >
                      <IonIcon icon={removeCircleOutline} /> Add Expense
                    </button>
                  </div>
                </div>

                {/* Ledger Table */}
                <div className="sa-table-responsive" style={{ border: 'none', overflowX: 'auto' }}>
                  <table className="bf-table" style={{ width: '100%', minWidth: '700px' }}>
                    <thead>
                      <tr>
                        {/*
                        Receipt Preview
                        Transaction ID
                        Download Receipt
                        Print Receipt
                        
                        <th>TXN ID</th>
                        */}
                        <th>TIMESTAMP</th>
                        <th>CATEGORY</th>
                        <th>REMARKS</th>
                        <th>TYPE</th>
                        <th>AMOUNT</th>
                        <th>MODE</th>
                        {/* <th>RECORDED BY</th> */}
                        <th style={{ textAlign: 'center' }}>ACTIONS</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredTransactions.length > 0 ? (
                        filteredTransactions.map((tx) => (
                          <tr key={tx.id}>
                             {/*
                             Receipt Preview
                             Transaction ID
                             Download Receipt
                             Print Receipt
                             
                             <td style={{ fontWeight: 700, color: '#0d5c46', fontFamily: 'monospace', fontSize: '11px', whiteSpace: 'nowrap' }}>{tx.transactionId || '—'}</td>
                             */}
                             <td style={{ fontWeight: 600 }}>{tx.timestamp}</td>
                            <td style={{ fontWeight: 700, color: '#0f766e' }}>{tx.category}</td>
                            <td style={{ fontSize: '12px', color: '#64748b' }}>{tx.remarks || tx.description || '—'}</td>
                            <td>
                              <span className={tx.type === 'income' ? 'bf-badge-income' : 'bf-badge-expense'} style={{ textTransform: 'uppercase', fontSize: '10px', padding: '2px 8px', borderRadius: '12px', fontWeight: 800 }}>
                                {tx.type}
                              </span>
                            </td>
                            <td>
                              <strong className={tx.type === 'income' ? 'bf-amount-income' : 'bf-amount-expense'} style={{ fontSize: '14px' }}>
                                ₹{tx.amount.toLocaleString()}
                              </strong>
                            </td>
                            <td style={{ fontWeight: 500 }}>{tx.mode}</td>
                            {/* <td style={{ fontSize: '11px', color: '#475569', fontWeight: 600 }}>{tx.recordedBy}</td> */}
                            <td style={{ textAlign: 'center' }}>
                              <div style={{ display: 'inline-flex', gap: '6px', justifyContent: 'center' }}>
                                {/*
                                Receipt Preview
                                Transaction ID
                                Download Receipt
                                Print Receipt
                                
                                <button
                                  title="Print Receipt"
                                  onClick={() => handlePrintReceipt(tx)}
                                  style={{ width: '32px', height: '32px', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', border: '1px solid #e2e8f0', borderRadius: '8px', background: '#f8fafc', cursor: 'pointer', color: '#0f766e', fontSize: '16px', transition: 'all 0.15s ease' }}
                                >
                                  <IonIcon icon={printOutline} />
                                </button>
                                */}
                                <button
                                  title="Edit Entry"
                                  onClick={() => handleOpenEditModal(tx)}
                                  style={{ width: '32px', height: '32px', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', border: '1px solid #e2e8f0', borderRadius: '8px', background: '#f8fafc', cursor: 'pointer', color: '#4f46e5', fontSize: '16px', transition: 'all 0.15s ease' }}
                                >
                                  <IonIcon icon={pencilOutline} />
                                </button>
                                <button
                                  title="Delete Record"
                                  onClick={() => { setTxToDelete(tx.id); setShowDeleteModal(true); }}
                                  style={{ width: '32px', height: '32px', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', border: '1px solid #fecaca', borderRadius: '8px', background: '#fef2f2', cursor: 'pointer', color: '#ef4444', fontSize: '16px', transition: 'all 0.15s ease' }}
                                >
                                  <IonIcon icon={trashOutline} />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))
                      ) : (
                        /* Beautiful Empty State Graphic (Rule 8) */
                        <tr>
                          <td colSpan={9} style={{ textAlign: 'center', padding: '50px 0' }}>
                            <div className="sa-empty-state" style={{ border: 'none', background: 'transparent', margin: '0' }}>
                              <div className="sa-empty-state__icon" style={{ background: '#f1f5f9', color: '#94a3b8' }}>
                                <IonIcon icon={alertCircleOutline} />
                              </div>
                              <h3 className="sa-empty-state__title" style={{ color: '#475569', fontWeight: 700 }}>
                                No transactions matching filters
                              </h3>
                              <p className="sa-empty-state__text" style={{ color: '#64748b', fontSize: '13px' }}>
                                There are currently no recorded transactions found for the selected query, date range, or category filter.
                              </p>
                            </div>
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Auditing Control — Single Row, 2 Columns */}
              <div style={{ marginTop: '24px' }}>
                <div style={{ marginBottom: '16px' }}>
                  <h2 className="bf-card-title">Auditing Control</h2>
                  <p className="bf-card-subtitle">Real-time payment mode cash balances</p>
                </div>

                <div className="bf-audit-grid">

                  {/* Column 1: Cash Balance */}
                  <div className="bf-card" style={{ margin: 0 }}>
                    <div className="bf-audit-item" style={{ border: 'none', background: 'transparent', padding: 0 }}>
                      <div className="bf-audit-icon-wrapper" style={{ background: '#ecfdf5', color: '#10b981' }}>
                        <IonIcon icon={cardOutline} />
                      </div>
                      <div className="bf-audit-info">
                        <span className="bf-audit-label">CASH BALANCE</span>
                        <span className="bf-audit-val">₹{cashInHand.toLocaleString()}</span>
                      </div>
                      <IonIcon icon={swapHorizontalOutline} className="bf-audit-swap" />
                    </div>
                  </div>

                  {/* Column 2: Online Bank/UPI */}
                  <div className="bf-card" style={{ margin: 0 }}>
                    <div className="bf-audit-item" style={{ border: 'none', background: 'transparent', padding: 0 }}>
                      <div className="bf-audit-icon-wrapper" style={{ background: '#eff6ff', color: '#3b82f6' }}>
                        <IonIcon icon={walletOutline} />
                      </div>
                      <div className="bf-audit-info">
                        <span className="bf-audit-label">ONLINE BANK/UPI</span>
                        <span className="bf-audit-val">₹{onlineBalance.toLocaleString()}</span>
                      </div>
                      <IonIcon icon={swapHorizontalOutline} className="bf-audit-swap" />
                    </div>
                  </div>

                </div>

                {/* Total summary row below */}
                <div className="bf-audit-total">
                  Total: ₹{totalBalance.toLocaleString()}
                </div>
              </div>
            </>
          )}

          {activeTab === 'payments' && (
            <>
              {/* New Patient Payments Analytics Cards Panel */}
              <div className="bf-stats-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '16px', marginTop: '20px' }}>
                
                {/* Total Billed card */}
                <div className="bf-stat-card" style={{ background: '#f8fafc', border: '1px solid #cbd5e1' }}>
                  <div className="bf-stat-label" style={{ color: '#475569' }}>TOTAL BILLED</div>
                  <div className="bf-stat-value" style={{ color: '#1e293b' }}>₹{totalPatientBilled.toLocaleString()}</div>
                  <div style={{ fontSize: '11px', fontWeight: 600, color: '#64748b', marginTop: '4px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <IonIcon icon={checkmarkCircleOutline} style={{ color: '#16a34a' }} /> Dynamic Session Invoicing
                  </div>
                </div>

                {/* Total Paid card */}
                <div className="bf-stat-card" style={{ background: '#f8fafc', border: '1px solid #cbd5e1' }}>
                  <div className="bf-stat-label" style={{ color: '#475569' }}>TOTAL PAID</div>
                  <div className="bf-stat-value" style={{ color: '#16a34a' }}>₹{totalPatientPaid.toLocaleString()}</div>
                  <div style={{ fontSize: '11px', fontWeight: 600, color: '#16a34a', marginTop: '4px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <IonIcon icon={trendingUpOutline} /> Live ledger tracking
                  </div>
                </div>

                {/* Outstanding Balance card */}
                <div className="bf-stat-card" style={{ background: '#fef2f2', border: '1px solid #fecaca' }}>
                  <div className="bf-stat-label" style={{ color: '#991b1b' }}>OUTSTANDING BALANCE</div>
                  <div className="bf-stat-value" style={{ color: '#ef4444' }}>₹{totalPatientOutstanding.toLocaleString()}</div>
                  <div style={{ fontSize: '11px', fontWeight: 600, color: '#b91c1c', marginTop: '4px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <IonIcon icon={alertCircleOutline} /> Pending outstanding collections
                  </div>
                </div>

                {/* Pending Cases card */}
                <div className="bf-stat-card" style={{ background: '#fffbeb', border: '1px solid #fde68a' }}>
                  <div className="bf-stat-label" style={{ color: '#92400e' }}>PENDING CASES</div>
                  <div className="bf-stat-value" style={{ color: '#d97706' }}>{totalPendingCases} Patients</div>
                  <div style={{ fontSize: '11px', fontWeight: 600, color: '#b45309', marginTop: '4px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <IonIcon icon={peopleOutline} /> Action required shortly
                  </div>
                </div>

              </div>

              {/* Advanced Filtering Controls Block for Patient Payments */}
              <div className="sa-section" style={{ marginTop: '24px', padding: '16px', borderRadius: '12px', border: '1px solid #cbd5e1', background: 'white' }}>
                <h3 style={{ margin: '0 0 12px 0', fontSize: '14px', fontWeight: 800, color: '#334155', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <IonIcon icon={filterOutline} style={{ color: '#0d5c46' }} /> Patient Payments Search Filters
                </h3>
                
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px' }}>
                  
                  {/* Patient Name Search */}
                  <div className="sa-search" style={{ margin: 0, width: '100%' }}>
                    <IonIcon icon={searchOutline} />
                    <input
                      placeholder="Search patient name..."
                      value={paySearchQuery}
                      onChange={(e) => setPaySearchQuery(e.target.value)}
                    />
                  </div>

                  {/* Payment Status Filter */}
                  <select
                    className="sa-input"
                    value={payFilterStatus}
                    onChange={(e) => setPayFilterStatus(e.target.value)}
                  >
                    <option value="All">All Statuses</option>
                    <option value="Paid">Paid</option>
                    <option value="Partial">Partial</option>
                    <option value="Pending">Pending</option>
                  </select>

                  {/* Healer Filter */}
                  {/* <div className="sa-search" style={{ margin: 0, width: '100%' }}>
                    <IonIcon icon={peopleOutline} style={{ fontSize: '16px', color: '#64748b' }} />
                    <input
                      placeholder="Search assigned healer..."
                      value={payFilterHealer}
                      onChange={(e) => setPayFilterHealer(e.target.value)}
                      style={{ paddingLeft: '28px' }}
                    />
                  </div> */}

                  {/* Session No Filter */}
                  {/* <div className="sa-search" style={{ margin: 0, width: '100%' }}>
                    <IonIcon icon={calendarOutline} style={{ fontSize: '16px', color: '#64748b' }} />
                    <input
                      placeholder="Search Session No..."
                      value={payFilterSession}
                      onChange={(e) => setPayFilterSession(e.target.value)}
                      style={{ paddingLeft: '28px' }}
                    />
                  </div> */}
                </div>

                {/* Custom From-To Date Picker */}
                <div className="bf-date-filter-row">
                  <span style={{ fontSize: '12px', fontWeight: 700, color: '#475569' }}>TRANSACTION FROM:</span>
                  <input
                    type="date"
                    className="sa-input"
                    style={{ width: '150px', padding: '6px 10px', fontSize: '12px' }}
                    value={payStartDate}
                    onChange={(e) => setPayStartDate(e.target.value)}
                  />
                  <span style={{ fontSize: '12px', fontWeight: 700, color: '#475569' }}>TO:</span>
                  <input
                    type="date"
                    className="sa-input"
                    style={{ width: '150px', padding: '6px 10px', fontSize: '12px' }}
                    value={payEndDate}
                    onChange={(e) => setPayEndDate(e.target.value)}
                  />
                  <button 
                    className="sa-btn sa-btn--outline"
                    style={{ padding: '6px 12px', fontSize: '12px' }}
                    onClick={() => {
                      setPaySearchQuery('');
                      setPayFilterStatus('All');
                      setPayFilterHealer('');
                      setPayFilterSession('');
                      setPayStartDate('');
                      setPayEndDate('');
                    }}
                  >
                    Reset Filters
                  </button>
                </div>
              </div>

              {/* Patient Payments Ledger Card */}
              <div className="bf-card" style={{ marginTop: '24px' }}>
                <div className="bf-card-header" style={{ flexWrap: 'wrap', gap: '12px' }}>
                  <div>
                    <h2 className="bf-card-title">Patient Payment Ledger</h2>
                    <p className="bf-card-subtitle">Detailed tracking of patient invoicing, installments, and status logs</p>
                  </div>
                  <div className="bf-card-header-actions" style={{ display: 'flex', gap: '8px' }}>
                    <button 
                      className="bf-btn-add-income"
                      style={{ background: '#0D5C46', borderColor: '#0D5C46', color: 'white' }}
                      onClick={() => {
                        const defaultPatientId = activePatients[0]?.id || '';
                        handlePaymentFormPatientChange(defaultPatientId);
                        setShowRecordPaymentModal(true);
                      }}
                    >
                      <IonIcon icon={addCircleOutline} /> Add Payment
                    </button>
                  </div>
                </div>
 
                {/* Ledger Table */}
                <div className="sa-table-responsive" style={{ border: 'none', overflowX: 'auto' }}>
                  <table className="bf-table" style={{ width: '100%', minWidth: '700px' }}>
                    <thead>
                      <tr>
                        <th>PATIENT</th>
                        <th>SESSION NO</th>
                        <th>TOTAL BILLED</th>
                        <th>PAID</th>
                        <th>OUTSTANDING</th>
                        <th>STATUS</th>
                        <th>ACTIONS</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredPatientPayments.length > 0 ? (
                        filteredPatientPayments.map((p) => (
                          <tr key={p.id}>
                            <td style={{ fontWeight: 700 }}>{p.patientName}</td>
                            <td style={{ fontWeight: 600 }}>{p.sessionNo}</td>
                            <td><strong style={{ color: '#475569' }}>₹{p.totalBilled.toLocaleString()}</strong></td>
                            <td><strong style={{ color: '#16a34a' }}>₹{p.paid.toLocaleString()}</strong></td>
                            <td>
                              <strong style={{ color: p.outstanding > 0 ? '#ef4444' : '#64748b' }}>
                                ₹{p.outstanding.toLocaleString()}
                              </strong>
                            </td>
                            <td>
                              <span 
                                style={{ 
                                  textTransform: 'uppercase', fontSize: '9px', padding: '2px 8px', borderRadius: '12px', fontWeight: 800,
                                  background: p.status === 'Paid' ? '#ecfdf5' : p.status === 'Pending' ? '#fef2f2' : '#fffbeb',
                                  color: p.status === 'Paid' ? '#10b981' : p.status === 'Pending' ? '#ef4444' : '#f59e0b',
                                  border: `1px solid ${p.status === 'Paid' ? '#a7f3d0' : p.status === 'Pending' ? '#fecaca' : '#fde68a'}`
                                }}
                              >
                                {p.status}
                              </span>
                            </td>
                            <td>
                              <div className="sa-table__actions" style={{ display: 'flex', gap: '8px' }}>
                                <button
                                  className="sa-table__action-btn"
                                  title="View Session Details"
                                  onClick={() => {
                                    history.push(ROUTES.BRANCH_ADMIN.SESSION_DETAILS.replace(':id', p.caseId), { fromFinance: true });
                                  }}
                                >
                                  <IonIcon icon={eyeOutline} />
                                </button>
                                <button
                                  className="sa-table__action-btn"
                                  title="Edit Session"
                                  onClick={() => {
                                    history.push(ROUTES.BRANCH_ADMIN.FINANCE_EDIT_SESSION.replace(':id', p.caseId));
                                  }}
                                >
                                  <IonIcon icon={pencilOutline} style={{ color: '#6366f1' }} />
                                </button>
                                <button
                                  className="sa-table__action-btn"
                                  title="View Payment Drawer"
                                  onClick={() => {
                                    setDrawerPayment(p);
                                    setShowDrawer(true);
                                  }}
                                >
                                  <IonIcon icon={receiptOutline} style={{ color: '#0D5C46' }} />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan={7} style={{ textAlign: 'center', padding: '50px 0' }}>
                            <div className="sa-empty-state" style={{ border: 'none', background: 'transparent', margin: '0' }}>
                              <div className="sa-empty-state__icon" style={{ background: '#f1f5f9', color: '#94a3b8' }}>
                                <IonIcon icon={alertCircleOutline} />
                              </div>
                              <h3 className="sa-empty-state__title" style={{ color: '#475569', fontWeight: 700 }}>
                                No payments matching query
                              </h3>
                              <p className="sa-empty-state__text" style={{ color: '#64748b', fontSize: '13px' }}>
                                We couldn't find any patient payment invoices corresponding to the selected search and status filters.
                              </p>
                            </div>
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          )}

          {/* {activeTab === 'reports' && (
            <div className="bf-card" style={{ marginTop: '20px', padding: '32px', textAlign: 'center' }}>
              <div style={{ fontSize: '48px', color: '#0d5c46', marginBottom: '16px' }}><IonIcon icon={pieChartOutline} /></div>
              <h2 style={{ fontSize: '18px', fontWeight: 800, color: '#1e293b', margin: 0 }}>Executive Reporting Suite</h2>
              <p style={{ fontSize: '13px', color: '#64748b', marginTop: '8px', maxWidth: '500px', marginInline: 'auto', lineHeight: 1.6 }}>
                Generate consolidated operational records, financial spreadsheets, tax summaries, and patient dues logs.
              </p>
              
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', maxWidth: '680px', margin: '32px auto 0 auto' }}>
                <div style={{ background: '#f8fafc', padding: '20px', borderRadius: '12px', border: '1px solid #e2e8f0', textAlign: 'left' }}>
                  <h4 style={{ margin: '0 0 6px 0', fontSize: '13px', fontWeight: 800, color: '#0d5c46' }}>Operational Ledger</h4>
                  <p style={{ margin: '0 0 16px 0', fontSize: '11px', color: '#64748b', lineHeight: 1.4 }}>Complete record of cash inflows and branch utility/supplies costs.</p>
                  <button className="sa-btn sa-btn--primary" style={{ width: '100%', fontSize: '11px', background: '#0d5c46', border: 'none', justifyContent: 'center' }} onClick={() => handleExportReport('PDF')}>
                    Export PDF
                  </button>
                </div>

                <div style={{ background: '#f8fafc', padding: '20px', borderRadius: '12px', border: '1px solid #e2e8f0', textAlign: 'left' }}>
                  <h4 style={{ margin: '0 0 6px 0', fontSize: '13px', fontWeight: 800, color: '#0d5c46' }}>Patient Accounts Outstanding</h4>
                  <p style={{ margin: '0 0 16px 0', fontSize: '11px', color: '#64748b', lineHeight: 1.4 }}>Summary spreadsheet of outstanding dues, billed totals, and paid cases.</p>
                  <button className="sa-btn sa-btn--primary" style={{ width: '100%', fontSize: '11px', background: '#16a34a', border: 'none', justifyContent: 'center' }} onClick={() => handleExportReport('Excel')}>
                    Export Excel
                  </button>
                </div>
              </div>
            </div>
          )} */}

        </div>
      </IonContent>

      {/* ── DIALOG: RECORD TRANSACTION ────────────────────────────── */}
      <IonModal isOpen={showAddModal} onDidDismiss={() => setShowAddModal(false)} className="sa-modal sa-modal--sm">
        <div className="sa-modal__content">
          <div className="sa-modal__header">
            <h2>Record Branch Transaction</h2>
            <button className="sa-modal__close-btn" onClick={() => setShowAddModal(false)}>×</button>
          </div>
          <div className="sa-modal__body">
            <div className="sa-settings__form-group">
              <label className="sa-settings__label">Transaction Type</label>
              <div style={{ display: 'flex', gap: '12px' }}>
                <button
                  className={`sa-btn ${addModalType === 'income' ? 'sa-btn--primary' : 'sa-btn--outline'}`}
                  style={{ flex: 1, justifyContent: 'center' }}
                  onClick={() => setAddModalType('income')}
                >
                  <IonIcon icon={arrowUpOutline} style={{ marginRight: '4px' }} /> Income (Cash In)
                </button>
                <button
                  className={`sa-btn ${addModalType === 'expense' ? 'sa-btn--danger' : 'sa-btn--outline'}`}
                  style={{ flex: 1, justifyContent: 'center' }}
                  onClick={() => setAddModalType('expense')}
                >
                  <IonIcon icon={arrowDownOutline} style={{ marginRight: '4px' }} /> Expense (Cash Out)
                </button>
              </div>
            </div>

            <div className="sa-settings__form-group">
              <label className="sa-settings__label">Category *</label>
              <select
                className="sa-input"
                value={newTx.category}
                onChange={(e) => setNewTx({ ...newTx, category: e.target.value })}
              >
                {addModalType === 'income' ? (
                  <>
                    <option value="Session Fee">Session Fee</option>
                    <option value="Camp Fee">Camp Fee</option>
                    <option value="Consultation">Consultation</option>
                    <option value="Misc">Miscellaneous</option>
                  </>
                ) : (
                  <>
                    <option value="Utilities">Utilities</option>
                    <option value="Supplies">Supplies</option>
                    <option value="Salaries">Salaries</option>
                    <option value="Rent">Rent</option>
                    <option value="Misc">Miscellaneous</option>
                  </>
                )}
              </select>
            </div>

            <div className="sa-settings__form-row" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <div className="sa-settings__form-group">
                <label className="sa-settings__label">Amount (₹) *</label>
                <input
                  type="number"
                  className="sa-input"
                  placeholder="0.00"
                  value={newTx.amount}
                  onChange={(e) => setNewTx({ ...newTx, amount: e.target.value })}
                />
              </div>

              <div className="sa-settings__form-group">
                <label className="sa-settings__label">Mode of Payment</label>
                <select
                  className="sa-input"
                  value={newTx.mode}
                  onChange={(e) => setNewTx({ ...newTx, mode: e.target.value })}
                >
                  {addModalType === 'income' ? (
                    <>
                      <option value="UPI (GPay)">UPI (GPay)</option>
                      <option value="UPI (PhonePe)">UPI (PhonePe)</option>
                      <option value="Cash">Cash Ledger</option>
                    </>
                  ) : (
                    <>
                      <option value="Cash">Cash Ledger</option>
                      <option value="Card Payment">Debit/Credit Card</option>
                    </>
                  )}
                </select>
              </div>
            </div>

            <div className="sa-settings__form-group">
              <label className="sa-settings__label">Remarks / Description</label>
              <textarea
                className="sa-input"
                rows={2}
                placeholder="Details of dynamic ledger entry"
                value={newTx.description}
                onChange={(e) => setNewTx({ ...newTx, description: e.target.value })}
              />
            </div>
          </div>
          <div className="sa-modal__footer">
            <button className="sa-btn sa-btn--outline" onClick={() => setShowAddModal(false)}>Cancel</button>
            <button className="sa-btn sa-btn--primary" onClick={handleRecordTx}>Record Entry</button>
          </div>
        </div>
      </IonModal>

      {/* ── DIALOG: DELETE CONFIRMATION ─────────────────────────── */}
      <IonModal isOpen={showDeleteModal} onDidDismiss={() => { setShowDeleteModal(false); setTxToDelete(null); }} className="sa-modal sa-modal--sm">
        <div className="sa-modal__content">
          <div className="sa-modal__header">
            <h2>Confirm Delete</h2>
            <button className="sa-modal__close-btn" onClick={() => { setShowDeleteModal(false); setTxToDelete(null); }}>×</button>
          </div>
          <div className="sa-modal__body" style={{ textAlign: 'center', padding: '24px 16px' }}>
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '16px' }}>
              <div style={{
                background: '#fef2f2',
                borderRadius: '50%',
                width: '64px',
                height: '64px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                border: '2px solid #fecaca'
              }}>
                <IonIcon icon={alertCircleOutline} style={{ fontSize: '36px', color: '#ef4444' }} />
              </div>
            </div>
            <p style={{ fontSize: '14px', color: '#475569', margin: '0 0 8px 0', fontWeight: 600 }}>
              Are you sure you want to delete this payment record?
            </p>
            <p style={{ fontSize: '12px', color: '#64748b', margin: 0 }}>
              This action cannot be undone. The transaction will be permanently removed from the active database ledger.
            </p>
          </div>
          <div className="sa-modal__footer" style={{ display: 'flex', justifyContent: 'center', gap: '12px', borderTop: 'none', paddingBottom: '24px' }}>
            <button className="sa-btn sa-btn--outline" style={{ minWidth: '100px', justifyContent: 'center' }} onClick={() => { setShowDeleteModal(false); setTxToDelete(null); }}>
              Cancel
            </button>
            <button className="sa-btn sa-btn--danger" style={{ minWidth: '130px', justifyContent: 'center', background: '#ef4444', borderColor: '#ef4444', color: 'white' }} onClick={() => txToDelete && handleDeleteTx(txToDelete)}>
              Confirm Delete
            </button>
          </div>
        </div>
      </IonModal>

      {/* ── DIALOG: EDIT TRANSACTION ────────────────────────────── */}
      <IonModal isOpen={showEditModal} onDidDismiss={() => setShowEditModal(false)} className="sa-modal sa-modal--sm">
        <div className="sa-modal__content">
          <div className="sa-modal__header">
            <h2>Edit Transaction</h2>
            <button className="sa-modal__close-btn" onClick={() => setShowEditModal(false)}>×</button>
          </div>
          <div className="sa-modal__body">
            <div className="sa-settings__form-group">
              <label className="sa-settings__label">Category *</label>
              <input
                className="sa-input"
                value={editTxState.category}
                onChange={(e) => setEditTxState({ ...editTxState, category: e.target.value })}
              />
            </div>

            <div className="sa-settings__form-row" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <div className="sa-settings__form-group">
                <label className="sa-settings__label">Amount (₹) *</label>
                <input
                  type="number"
                  className="sa-input"
                  value={editTxState.amount}
                  onChange={(e) => setEditTxState({ ...editTxState, amount: e.target.value })}
                />
              </div>

              <div className="sa-settings__form-group">
                <label className="sa-settings__label">Mode of Payment</label>
                <select
                  className="sa-input"
                  value={editTxState.mode}
                  onChange={(e) => setEditTxState({ ...editTxState, mode: e.target.value })}
                >
                  <option value="UPI (GPay)">UPI (GPay)</option>
                  <option value="UPI (PhonePe)">UPI (PhonePe)</option>
                  <option value="Cash">Cash Ledger</option>
                  <option value="Card Payment">Debit/Credit Card</option>
                </select>
              </div>
            </div>

            <div className="sa-settings__form-group">
              <label className="sa-settings__label">Remarks / Description</label>
              <textarea
                className="sa-input"
                rows={2}
                value={editTxState.description}
                onChange={(e) => setEditTxState({ ...editTxState, description: e.target.value })}
              />
            </div>
          </div>
          <div className="sa-modal__footer">
            <button className="sa-btn sa-btn--outline" onClick={() => setShowEditModal(false)}>Cancel</button>
            <button className="sa-btn sa-btn--primary" onClick={handleEditTxSubmit}>Save Changes</button>
          </div>
        </div>
      </IonModal>

      {/*
      Receipt Preview
      Transaction ID
      Download Receipt
      Print Receipt
      
      <IonModal isOpen={showReceiptModal} onDidDismiss={() => setShowReceiptModal(false)} className="sa-modal sa-modal--sm">
        <div className="sa-modal__content" style={{ background: '#f8fafc' }}>
          <div className="sa-modal__header" style={{ borderBottom: '1px solid #cbd5e1' }}>
            <h2 style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#0d5c46' }}>
              <IonIcon icon={receiptOutline} /> Transaction Receipt
            </h2>
            <button className="sa-modal__close-btn" onClick={() => setShowReceiptModal(false)}>×</button>
          </div>
          
          <div className="sa-modal__body" style={{ maxHeight: '65vh', overflowY: 'auto' }}>
            {receiptTx && (
              <div style={{ background: '#fff', border: '1px solid #cbd5e1', borderRadius: '8px', padding: '16px', fontFamily: 'monospace', fontSize: '11px', color: '#1e293b', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <div style={{ textAlign: 'center', borderBottom: '2px dashed #cbd5e1', paddingBottom: '10px', marginBottom: '4px' }}>
                  <strong style={{ fontSize: '14px', color: '#0d5c46' }}>PHMS WELLNESS CENTER</strong><br/>
                  <span>Branch Finance Receipt</span><br/>
                  <span style={{ fontWeight: 700 }}>Receipt No: {receiptTx.receiptId || `TXN-${new Date().getFullYear()}-0000`}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span>TRANSACTION ID:</span>
                  <strong style={{ color: '#0d5c46' }}>{receiptTx.transactionId || '—'}</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span>REFERENCE ID:</span>
                  <strong>#{receiptTx.id}</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span>TIMESTAMP:</span>
                  <strong>{receiptTx.timestamp}</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span>CATEGORY:</span>
                  <strong style={{ color: 'var(--ba-color-primary)' }}>{receiptTx.category}</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span>TX TYPE:</span>
                  <strong style={{ color: receiptTx.type === 'income' ? '#0f766e' : '#b91c1c' }}>{receiptTx.type.toUpperCase()}</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span>PAYMENT MODE:</span>
                  <strong>{receiptTx.mode}</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span>RECORDED BY:</span>
                  <strong>{receiptTx.recordedBy}</strong>
                </div>
                <div style={{ borderTop: '1px dashed #cbd5e1', paddingTop: '8px', marginTop: '4px' }}>
                  <span>REMARKS / DETAILS:</span>
                  <div style={{ color: '#475569', fontStyle: 'italic', marginTop: '2px' }}>
                    {receiptTx.description || 'No remarks logged.'}
                  </div>
                </div>
                <div style={{ borderTop: '2px dashed #cbd5e1', paddingTop: '12px', marginTop: '8px', display: 'flex', justifyContent: 'space-between', fontSize: '16px' }}>
                  <strong>TOTAL AMOUNT:</strong>
                  <strong style={{ color: 'var(--ba-color-primary)' }}>₹{receiptTx.amount.toLocaleString()}.00</strong>
                </div>
              </div>
            )}

            <div style={{ textAlign: 'center', borderTop: '1px dashed #cbd5e1', paddingTop: '12px', marginTop: '12px', fontSize: '10px', color: '#64748b' }}>
              Thank you for trusting NPHMS Wellness Services.<br/>
              Simulated security checksum node verified.
            </div>
          </div>

          <div style={{ display: 'flex', gap: '8px', marginTop: '16px' }}>
            <button className="sa-btn sa-btn--outline" style={{ flex: 1, justifyContent: 'center' }} onClick={() => setShowReceiptModal(false)}>Close</button>
            <button className="sa-btn sa-btn--primary" style={{ flex: 1, justifyContent: 'center' }} onClick={() => { alert('Receipt print command simulated. Sending to thermal printer...'); setShowReceiptModal(false); }}>
              Print thermal receipt
            </button>
          </div>
        </div>
      </IonModal>
      */}

      {/* ── DIALOG: RECORD PATIENT PAYMENT ────────────────────────────── */}
      <IonModal isOpen={showRecordPaymentModal} onDidDismiss={() => setShowRecordPaymentModal(false)} className="sa-modal sa-modal--sm">
        <form onSubmit={handleRecordPaymentSubmit} className="sa-modal__content">
          <div className="sa-modal__header">
            <h2>Record Patient Payment</h2>
            <button type="button" className="sa-modal__close-btn" onClick={() => setShowRecordPaymentModal(false)}>×</button>
          </div>
          
          <div className="sa-modal__body">
            
            {/* Patient selector */}
            <div className="sa-settings__form-group">
              <label className="sa-settings__label">Patient *</label>
              <select
                className="sa-input"
                required
                value={paymentForm.patientId}
                onChange={(e) => handlePaymentFormPatientChange(e.target.value)}
              >
                <option value="">-- Choose Patient --</option>
                {activePatients.map((p: any) => (
                  <option key={p.id} value={p.id}>{p.name} ({p.patientId || p.id.substring(0, 8)})</option>
                ))}
              </select>
            </div>
 
            {/* Session No selector */}
            <div className="sa-settings__form-group">
              <label className="sa-settings__label">Session Number *</label>
              <select
                className="sa-input"
                required
                value={paymentForm.sessionId}
                onChange={(e) => handlePaymentFormSessionChange(e.target.value)}
              >
                <option value="">-- Select Session --</option>
                {(patientSessions || []).map((s: any) => {
                  const billed = s.sessionFee !== null && s.sessionFee !== undefined
                    ? parseFloat(s.sessionFee)
                    : (parseFloat(s.totalAmount) || 0);

                  const rawStatus = (s.paymentStatus || 'pending').toLowerCase();
                  let paidAmount = 0;
                  let outstanding = 0;

                  if (rawStatus === 'paid') {
                    outstanding = 0;
                  } else if (rawStatus === 'pending' || rawStatus === 'unpaid') {
                    outstanding = billed;
                  } else {
                    paidAmount = s.payment ? parseFloat(s.payment.amount) || 0 : 0;
                    outstanding = Math.max(0, billed - paidAmount);
                  }

                  const sessionNo = s.sessionNo || `SES-${s.id.substring(0, 6).toUpperCase()}`;

                  return (
                    <option key={s.id} value={s.id}>
                      {sessionNo} ({s.treatmentType || 'Pranic Healing'} - Outstanding: ₹{outstanding})
                    </option>
                  );
                })}
              </select>
              {paymentForm.patientId && (patientSessions || []).length === 0 && (
                <div style={{ color: '#ef4444', fontSize: '11px', marginTop: '4px', fontWeight: 600 }}>
                  This patient has no recorded sessions.
                </div>
              )}
            </div>
 
            {/* Billing calculations grid */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <div className="sa-settings__form-group">
                <label className="sa-settings__label">Amount Billed (Read-only)</label>
                <input
                  type="text"
                  disabled
                  className="sa-input"
                  style={{ background: '#e2e8f0', color: '#64748b', cursor: 'not-allowed' }}
                  value={`₹${paymentForm.amountBilled}`}
                />
              </div>
 
              <div className="sa-settings__form-group">
                <label className="sa-settings__label">Amount Paid *</label>
                <input
                  type="number"
                  className="sa-input"
                  required
                  placeholder="₹0.00"
                  value={paymentForm.amountPaid}
                  onChange={(e) => setPaymentForm({ ...paymentForm, amountPaid: e.target.value })}
                />
              </div>
            </div>
 
            {/* Payment Mode Selector */}
            <div className="sa-settings__form-group">
              <label className="sa-settings__label">Payment Mode *</label>
              <select
                className="sa-input"
                required
                value={paymentForm.paymentMode}
                onChange={(e) => setPaymentForm({ ...paymentForm, paymentMode: e.target.value as any })}
              >
                <option value="UPI">UPI</option>
                <option value="Cash">Cash</option>
              </select>
            </div>
 
            {/* Remarks Textarea
            <div className="sa-settings__form-group">
              <label className="sa-settings__label">Remarks / Notes</label>
              <textarea
                className="sa-input"
                rows={2}
                placeholder="Log therapist notes regarding cash installment..."
                value={paymentForm.remarks}
                onChange={(e) => setPaymentForm({ ...paymentForm, remarks: e.target.value })}
              />
            </div> */}
 
          </div>

          <div className="sa-modal__footer">
            <button type="button" className="sa-btn sa-btn--outline" onClick={() => setShowRecordPaymentModal(false)}>Cancel</button>
            <button type="submit" className="sa-btn sa-btn--primary" style={{ background: '#0D5C46', borderColor: '#0D5C46' }}>Record Payment</button>
          </div>
        </form>
      </IonModal>

      {/* ── MODAL: PREMIUM REPORT EXPORTER ────────────────────────────── */}
      <IonModal isOpen={showExportModal} onDidDismiss={() => { if (exportState === 'completed') setShowExportModal(false); }} className="sa-modal sa-modal--sm">
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
              {/* Spinning/pulsing animation container */}
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
                Processing financial ledger...
              </h4>
              <p style={{ margin: '0 0 20px 0', fontSize: '12px', color: '#64748b', lineHeight: 1.4 }}>
                Generating signatures, computing totals, and packing spreadsheet assets.
              </p>

              {/* Progress bar */}
              <div style={{ width: '100%', background: '#e2e8f0', borderRadius: '8px', height: '12px', overflow: 'hidden', position: 'relative' }}>
                <div style={{
                  width: `${exportProgress}%`,
                  background: 'linear-gradient(90deg, #10b981 0%, #0d5c46 100%)',
                  height: '100%',
                  transition: 'width 0.1s ease-out'
                }} />
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '6px', fontSize: '11px', color: '#64748b', fontWeight: 700 }}>
                <span>Compiling file...</span>
                <span>{exportProgress}%</span>
              </div>
            </div>
          ) : (
            <div>
              {/* Success Checkmark Ring */}
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
                Consolidated Report Ready!
              </h3>
              <p style={{ margin: '0 0 20px 0', fontSize: '13px', color: '#475569', lineHeight: 1.5 }}>
                Your {exportFormat} statement for <strong>{BRANCH_NAME}</strong> has been compiled successfully. All audit balances, graphs, and transaction histories have been formatted.
              </p>

              <div style={{ background: '#f8fafc', padding: '12px', borderRadius: '8px', border: '1px solid #cbd5e1', marginBottom: '20px', fontSize: '11px', textAlign: 'left', fontFamily: 'monospace', color: '#475569', lineHeight: 1.6 }}>
                <div><strong>File Name:</strong> PHMS-Finance-Report-{BRANCH_NAME.replace(/\s+/g, '-')}-{new Date().getFullYear()}.{exportFormat?.toLowerCase() === 'excel' ? 'csv' : 'txt'}</div>
                <div><strong>Format:</strong> {exportFormat === 'Excel' ? 'Microsoft Excel Spreadsheet (CSV)' : 'Adobe PDF Document (TXT)'}</div>
                <div><strong>Size:</strong> {exportFormat === 'Excel' ? '42.8 KB' : '158.4 KB'}</div>
                <div><strong>Checksum:</strong> SHA256-f8d29b0a...</div>
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

      {/* ── MODAL: OUTSTANDING DUES LIST ────────────────────────────── */}
      <IonModal isOpen={showDuesListModal} onDidDismiss={() => setShowDuesListModal(false)} className="sa-modal sa-modal--sm">
        <div className="sa-modal__header" style={{ background: '#7c2d12', color: '#fff', padding: '16px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h2 className="sa-modal__title" style={{ color: '#fff', fontSize: '16px', fontWeight: 800, margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
            <IonIcon icon={peopleOutline} /> 
            Outstanding Patient Dues List
          </h2>
          <button className="sa-modal__close-btn" style={{ color: '#fff', background: 'none', border: 'none', fontSize: '24px', cursor: 'pointer' }} onClick={() => setShowDuesListModal(false)}>&times;</button>
        </div>

        <div className="sa-modal__body" style={{ padding: '20px', maxHeight: '450px', overflowY: 'auto' }}>
          <p style={{ margin: '0 0 16px 0', fontSize: '12px', color: '#64748b', textAlign: 'left', lineHeight: 1.4 }}>
            The following patients have outstanding billing balances for sessions conducted at the Mumbai Branch.
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {patientPayments.filter(p => p.outstanding > 0).length > 0 ? (
              patientPayments.filter(p => p.outstanding > 0).map((p) => (
                <div key={p.id} style={{ border: '1px solid #fed7aa', background: '#fff7ed', borderRadius: '8px', padding: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ textAlign: 'left' }}>
                    <div style={{ fontWeight: 800, color: '#7c2d12', fontSize: '13px' }}>{p.patientName}</div>
                    <div style={{ fontSize: '10px', color: '#9a3412', marginTop: '2px', fontWeight: 600 }}>{p.sessionNo} • {p.assignedHealer}</div>
                    <div style={{ fontSize: '11px', color: '#475569', marginTop: '4px' }}>
                      Billed: <strong>₹{p.totalBilled.toLocaleString()}</strong> | Paid: <strong style={{ color: '#16a34a' }}>₹{p.paid.toLocaleString()}</strong>
                    </div>
                  </div>
                  <div style={{ textAlign: 'right', display: 'flex', flexDirection: 'column', gap: '6px', alignItems: 'flex-end' }}>
                    <div style={{ fontSize: '14px', fontWeight: 800, color: '#ef4444' }}>
                      ₹{p.outstanding.toLocaleString()}
                    </div>
                    <button
                      className="sa-btn sa-btn--primary"
                      style={{ fontSize: '10px', padding: '3px 8px', background: '#7c2d12', border: 'none', minHeight: 'auto', height: '24px' }}
                      onClick={() => {
                        setShowDuesListModal(false);
                        handlePaymentFormPatientChange(p.patientId);
                        setPaymentForm({
                          patientId: p.patientId,
                          sessionId: p.caseId,
                          sessionNo: p.sessionNo,
                          amountBilled: p.totalBilled,
                          outstanding: p.outstanding,
                          amountPaid: String(p.outstanding),
                          paymentMode: 'UPI',
                          remarks: `Clearing outstanding dues for ${p.sessionNo}`
                        });
                        setShowRecordPaymentModal(true);
                      }}
                    >
                      Pay Due
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <div style={{ textAlign: 'center', padding: '30px 0', color: '#64748b', fontSize: '13px' }}>
                <IonIcon icon={checkmarkCircleOutline} style={{ fontSize: '32px', color: '#16a34a', marginBottom: '8px' }} />
                <div>All accounts are fully paid! No outstanding dues.</div>
              </div>
            )}
          </div>
        </div>

        <div className="sa-modal__footer" style={{ padding: '12px 20px', display: 'flex', justifyContent: 'flex-end' }}>
          <button className="sa-btn sa-btn--outline" style={{ fontSize: '12px', padding: '8px 16px' }} onClick={() => setShowDuesListModal(false)}>Close</button>
        </div>
      </IonModal>

      {/*
      Raise Invoice
      Generate Invoice
      
      <IonModal isOpen={showRaiseInvoiceModal} onDidDismiss={() => setShowRaiseInvoiceModal(false)} className="sa-modal sa-modal--sm">
        <div className="sa-modal__header" style={{ background: '#0d5c46', color: '#fff', padding: '16px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h2 className="sa-modal__title" style={{ color: '#fff', fontSize: '16px', fontWeight: 800, margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
            <IonIcon icon={documentTextOutline} /> 
            Raise Digital Invoice
          </h2>
          <button className="sa-modal__close-btn" style={{ color: '#fff', background: 'none', border: 'none', fontSize: '24px', cursor: 'pointer' }} onClick={() => setShowRaiseInvoiceModal(false)}>&times;</button>
        </div>
        <form 
          onSubmit={(e) => {
            e.preventDefault();
            if (!invoiceForm.patientName || !invoiceForm.amount) {
              triggerToast('Please complete all required fields.', 'danger');
              return;
            }
            setShowRaiseInvoiceModal(false);
            triggerToast(`Invoice successfully raised and queued for ${invoiceForm.patientName}!`);
          }} 
          className="sa-modal__content"
        >          <div className="sa-modal__body" style={{ padding: '20px' }}>
            <p style={{ margin: '0 0 16px 0', fontSize: '12px', color: '#64748b', textAlign: 'left', lineHeight: 1.4 }}>
              Fill in the parameters below to instantly compile and issue a digital invoice statement for the patient.
            </p>

            <div className="sa-settings__form-group" style={{ marginBottom: '14px', textAlign: 'left' }}>
              <label className="sa-settings__label" style={{ fontWeight: 700, fontSize: '11px', color: '#475569' }}>Select Patient *</label>
              <select
                className="sa-input"
                required
                value={invoiceForm.patientName}
                onChange={(e) => {
                  const name = e.target.value;
                  const patSessions = (paymentsData || []).filter((s: any) => s.patientName === name);
                  const firstSess = patSessions[0]?.sessionNo || 'S-0001';
                  setInvoiceForm({ ...invoiceForm, patientName: name, sessionNo: firstSess });
                }}
              >
                {activePatients.map((p: any) => (
                  <option key={p.id} value={p.name}>{p.name}</option>
                ))}
              </select>
            </div>

            <div className="sa-settings__form-group" style={{ marginBottom: '14px', textAlign: 'left' }}>
              <label className="sa-settings__label" style={{ fontWeight: 700, fontSize: '11px', color: '#475569' }}>Session Reference *</label>
              <select
                className="sa-input"
                required
                value={invoiceForm.sessionNo}
                onChange={(e) => setInvoiceForm({ ...invoiceForm, sessionNo: e.target.value })}
              >
                {(paymentsData || []).filter((s: any) => s.patientName === invoiceForm.patientName).length > 0 ? (
                  (paymentsData || []).filter((s: any) => s.patientName === invoiceForm.patientName).map((s: any) => (
                    <option key={s.caseId} value={s.sessionNo}>{s.sessionNo} ({s.treatmentType})</option>
                  ))
                ) : (
                  <option value="S-0001">S-0001 (General Consultation)</option>
                )}
              </select>
            </div>

            <div className="sa-settings__form-group" style={{ marginBottom: '14px', textAlign: 'left' }}>
              <label className="sa-settings__label" style={{ fontWeight: 700, fontSize: '11px', color: '#475569' }}>Invoice Amount (₹) *</label>
              <input
                type="number"
                className="sa-input"
                required
                placeholder="e.g. 2500"
                value={invoiceForm.amount}
                onChange={(e) => setInvoiceForm({ ...invoiceForm, amount: e.target.value })}
              />
            </div>

            <div className="sa-settings__form-group" style={{ marginBottom: '0', textAlign: 'left' }}>
              <label className="sa-settings__label" style={{ fontWeight: 700, fontSize: '11px', color: '#475569' }}>Remarks / Billing Description</label>
              <textarea
                className="sa-input"
                rows={2}
                placeholder="Specify clinical treatment category or custom item details..."
                value={invoiceForm.remarks}
                onChange={(e) => setInvoiceForm({ ...invoiceForm, remarks: e.target.value })}
              />
            </div>
          </div>

          <div className="sa-modal__footer" style={{ padding: '12px 20px', display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
            <button type="button" className="sa-btn sa-btn--outline" onClick={() => setShowRaiseInvoiceModal(false)}>Cancel</button>
            <button type="submit" className="sa-btn sa-btn--primary" style={{ background: '#0d5c46', borderColor: '#0d5c46' }}>Generate Invoice</button>
          </div>
        </form>
      </IonModal>
      */}

      {/* ── DRAWER: PATIENT BILLING SUMMARY ────────────────────────────── */}
      {showDrawer && drawerPayment && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(15,23,42,0.4)', zIndex: 100000, display: 'flex', justifyContent: 'flex-end' }} onClick={() => setShowDrawer(false)}>
          <div 
            style={{ background: '#fff', width: '100%', maxWidth: '480px', height: '100%', boxShadow: '-5px 0 25px rgba(0,0,0,0.15)', display: 'flex', flexDirection: 'column' }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Drawer Header */}
            <div style={{ padding: '24px', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#0D5C46', color: '#fff' }}>
              <div>
                <h2 style={{ margin: 0, fontSize: '18px', fontWeight: 800 }}>Billing Summary</h2>
                <span style={{ fontSize: '12px', opacity: 0.8 }}>Case ID: {drawerPayment.caseId} • {drawerPayment.sessionNo}</span>
              </div>
              <button 
                onClick={() => setShowDrawer(false)}
                style={{ background: 'none', border: 'none', color: '#fff', fontSize: '24px', cursor: 'pointer', outline: 'none' }}
              >
                ×
              </button>
            </div>

            {/* Drawer Content */}
            <div style={{ padding: '24px', flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '24px' }}>
              
              {/* Patient Info */}
              <div style={{ background: '#f8fafc', padding: '16px', borderRadius: '12px', border: '1px solid #cbd5e1' }}>
                <h3 style={{ margin: '0 0 12px 0', fontSize: '13px', fontWeight: 800, color: '#0d5c46', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Patient Information</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '13px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: '#64748b' }}>Patient Name:</span>
                    <strong style={{ color: '#334155' }}>{drawerPayment.patientName}</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: '#64748b' }}>Assigned Healer:</span>
                    <strong style={{ color: '#334155' }}>{drawerPayment.assignedHealer}</strong>
                  </div>
                </div>
              </div>

              {/* Billing Summary */}
              <div style={{ background: '#f8fafc', padding: '16px', borderRadius: '12px', border: '1px solid #cbd5e1' }}>
                <h3 style={{ margin: '0 0 12px 0', fontSize: '13px', fontWeight: 800, color: '#0d5c46', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Billing Summary</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '13px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: '#64748b' }}>Total Billed:</span>
                    <strong style={{ color: '#334155', fontSize: '14px' }}>₹{drawerPayment.totalBilled.toLocaleString()}</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: '#64748b' }}>Total Paid:</span>
                    <strong style={{ color: '#16a34a', fontSize: '14px' }}>₹{drawerPayment.paid.toLocaleString()}</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px dashed #cbd5e1', paddingTop: '8px', marginTop: '4px' }}>
                    <span style={{ color: '#64748b', fontWeight: 700 }}>Outstanding Balance:</span>
                    <strong style={{ color: '#ef4444', fontSize: '15px' }}>₹{drawerPayment.outstanding.toLocaleString()}</strong>
                  </div>
                </div>
              </div>

              {/* Payment History */}
              <div>
                <h3 style={{ margin: '0 0 12px 0', fontSize: '13px', fontWeight: 800, color: '#0d5c46', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Payment Installment History</h3>
                {drawerPayment.history.length > 0 ? (
                  <div className="sa-table-responsive" style={{ border: '1px solid #cbd5e1', borderRadius: '8px' }}>
                    <table className="bf-table" style={{ width: '100%', fontSize: '12px' }}>
                      <thead>
                        <tr style={{ background: '#f1f5f9' }}>
                          <th style={{ padding: '8px' }}>DATE</th>
                          <th style={{ padding: '8px' }}>AMOUNT</th>
                          <th style={{ padding: '8px' }}>MODE</th>
                          <th style={{ padding: '8px' }}>STATUS</th>
                        </tr>
                      </thead>
                      <tbody>
                        {drawerPayment.history.map((h, i) => (
                          <tr key={i}>
                            <td style={{ padding: '8px', fontWeight: 600 }}>{h.date}</td>
                            <td style={{ padding: '8px', fontWeight: 700, color: '#16a34a' }}>₹{h.amount.toLocaleString()}</td>
                            <td style={{ padding: '8px' }}>{h.mode}</td>
                            <td style={{ padding: '8px' }}>
                              <span style={{ background: '#ecfdf5', color: '#10b981', padding: '2px 6px', borderRadius: '4px', fontWeight: 800, fontSize: '9px' }}>{h.status}</span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div style={{ textAlign: 'center', padding: '20px', color: '#64748b', fontSize: '12px', background: '#f8fafc', borderRadius: '8px', border: '1px dashed #cbd5e1' }}>
                    No payment transaction history logged yet.
                  </div>
                )}
              </div>

            </div>

            {/* Drawer Footer */}
            <div style={{ padding: '16px 24px', borderTop: '1px solid #e2e8f0', display: 'flex', gap: '12px', background: '#f8fafc' }}>
              <button 
                onClick={() => setShowDrawer(false)}
                style={{
                  background: '#ffffff', border: '1px solid #cbd5e1', borderRadius: '8px', padding: '10px 20px',
                  fontSize: '13px', fontWeight: 600, color: '#475569', cursor: 'pointer', flex: 1, textAlign: 'center'
                }}
              >
                Close Drawer
              </button>
            </div>
          </div>
        </div>
      )}

    </IonPage>
  );
};

export default FinancePage;