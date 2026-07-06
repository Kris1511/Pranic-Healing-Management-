import React, { useState, useEffect, useCallback } from 'react';
import {
  IonPage,
  IonContent,
  IonHeader,
  IonToolbar,
  IonButtons,
  IonMenuButton,
  IonIcon,
  IonTitle,
  IonButton,
  useIonViewWillEnter,
} from '@ionic/react';
import {
  searchOutline,
  eyeOutline,
  pencilOutline,
  notificationsOutline,
  settingsOutline,
  downloadOutline,
  filterOutline,
  addOutline,
  trendingUpOutline,
  alertCircleOutline,
  starOutline,
  star,
  checkmarkCircleOutline,
  leafOutline,
  flashOutline,
  heartOutline,
  schoolOutline,
  calendarOutline,
  peopleOutline,
  medkitOutline,
  closeOutline,
  keyOutline,
  banOutline,
  personOutline,
  documentTextOutline,
  refreshOutline,
  trashOutline,
  timeOutline,
  checkboxOutline,
} from 'ionicons/icons';
import { useHistory } from 'react-router-dom';
import { useAuthStore } from '../../store/auth.store';
import { getHealers, deleteHealer } from '../../api/healer.api';
import { getTreatmentTypes } from '../../api/treatmentType.api';
import './branch-admin.css';
import '../super-admin/super-admin.css';
import ProfileDropdown from '../../components/common/ProfileDropdown';


// ─── Interfaces & Structures ───────────────────────────────────────────────

export interface Healer {
  id: string;
  name: string;
  gender: 'Male' | 'Female' | 'Other';
  dob: string;
  email: string;
  phone: string;
  address: string;
  certificationLevel: string;
  specialization: string[];
  experience: number;
  profilePhoto?: string;
  idProof?: string;
  status: 'ACTIVE' | 'INACTIVE';
  branch: string;
  createdAt: string;
  cumulativeHealingCount: number;
  completedSessions: number;
  pendingNotes: number;
  urgentFollowUps: number;
  avatarBg: string;
  initials: string;
  bio?: string;
  patientsCount: number;
}

export interface Patient {
  id: string;
  name: string;
  caseType: string;
  sessionCount: number;
  status: 'Active' | 'Completed' | 'Suspended';
  lastSessionDate: string;
  assignedHealerId: string;
}

export interface ReassignmentLog {
  id: string;
  patientId: string;
  patientName: string;
  prevHealer: string;
  newHealer: string;
  changedBy: string;
  timestamp: string;
  reason: string;
}

export interface AuditLog {
  id: string;
  action: string;
  details: string;
  changedBy: string;
  timestamp: string;
}

export interface Notification {
  id: string;
  type: 'SMS' | 'Email' | 'In-App' | 'Dashboard Alert';
  recipient: string;
  message: string;
  timestamp: string;
}

// ─── Default Mock Data ───────────────────────────────────────────────────────

const INITIAL_HEALERS: Healer[] = [];

const INITIAL_PATIENTS: Patient[] = [];

const INITIAL_SESSION_HISTORY = [
  { sessionNumber: 'SES-912', patientName: 'Sarah Mitchell', treatmentType: 'Aura Cleansing', date: '2026-05-20', notesStatus: 'Completed', healerId: 'H-2091' },
  { sessionNumber: 'SES-913', patientName: 'Michael Chen', treatmentType: 'Stress Relief Protocol', date: '2026-05-26', notesStatus: 'Pending Notes', healerId: 'H-2091' },
  { sessionNumber: 'SES-914', patientName: 'John Walker', treatmentType: 'Chakra Energizer', date: '2026-05-22', notesStatus: 'Completed', healerId: 'H-2104' },
  { sessionNumber: 'SES-915', patientName: 'Elena Rostova', treatmentType: 'Psychotherapy Sweep', date: '2026-05-25', notesStatus: 'Completed', healerId: 'H-1822' },
  { sessionNumber: 'SES-916', patientName: 'Rohan Mehta', treatmentType: 'Pranic Purifying', date: '2026-05-18', notesStatus: 'Completed', healerId: 'H-1822' }
];

const INITIAL_AUDITS: AuditLog[] = [
  { id: 'A-901', action: 'SYSTEM_BOOT', details: 'Healer Management module loaded.', changedBy: 'System Engine', timestamp: '2026-05-27 10:00:00' }
];

const CERTIFICATIONS = [
  'Master Healer (M1)',
  'Energy Cleansing Specialist',
  'Trauma Relief Certified',
  'Associate Healer'
];

const SPECIALIZATIONS = [
  'Stress Healing',
  'Energy Cleansing',
  'Aura Cleansing',
  'Chakra Balancing',
  'Grief Therapy',
  'PTSD Care'
];

// ─── Main Component ──────────────────────────────────────────────────────────

const HealersPage: React.FC = () => {
  const { user } = useAuthStore();
  const history = useHistory();
  const [specializations, setSpecializations] = useState<string[]>(SPECIALIZATIONS);

  useEffect(() => {
    const fetchSpecialties = async () => {
      try {
        const response = await getTreatmentTypes({ status: 'Active' });
        if (response.success && Array.isArray(response.data)) {
          const names = response.data.map((t: any) => t.name);
          if (names.length > 0) {
            setSpecializations(names);
          }
        }
      } catch (err) {
        console.error('Error fetching specialties:', err);
      }
    };
    fetchSpecialties();
  }, []);

  // ── Access Control Layer ──────────────────────────────────────────────────
  const isSuperAdmin = user?.role === 'SUPER_ADMIN';
  const isBranchAdmin = user?.role === 'BRANCH_ADMIN';
  const isParaHealer = user?.role === 'HEALER';
  const isAuthenticated = !!user;

  const userInitials = user?.name
    ? user.name.split(' ').map((w: string) => w[0]).join('').substring(0, 2).toUpperCase()
    : (user?.email ? user.email.substring(0, 2).toUpperCase() : 'BA');

  // Resolve current branch
  const assignedBranch = typeof user?.branch === 'object' && user?.branch !== null
    ? (user.branch as any).name
    : (user?.branch || 'Mumbai');

  // ── Local Storage State Hook Up ───────────────────────────────────────────
  const [healers, setHealers] = useState<Healer[]>([]);

  const fetchHealers = useCallback(async () => {
    try {
      const response = await getHealers();
      // Depending on response wrapper, adjust to response.data or response directly
      const apiHealers = Array.isArray(response) ? response : (response.data || response);
      if (Array.isArray(apiHealers)) {
        const formattedHealers = apiHealers.map((h: any) => ({
          id: h.healerId || h.id,
          name: h.name,
          gender: h.gender || 'Other',
          dob: h.dob || '1990-01-01',
          email: h.email || '',
          phone: h.mobile || h.phone || '',
          address: h.address || '',
          certificationLevel: h.certLevel || h.certificationLevel || 'Associate Healer',
          specialization: typeof h.specialization === 'string' ? h.specialization.split(',') : (h.specialization || []),
          experience: h.experience || 0,
          status: h.status?.toUpperCase() || 'ACTIVE',
          branch: h.branch?.name || assignedBranch,
          createdAt: h.createdAt || new Date().toISOString(),
          cumulativeHealingCount: h.cumulativeHealingCount || 0,
          completedSessions: h.completedSessions || 0,
          pendingNotes: h.pendingNotes || 0,
          urgentFollowUps: h.urgentFollowUps || 0,
          avatarBg: ['#0f5b4b', '#1e40af', '#7c3aed', '#db2777', '#b45309'][Math.floor(Math.random() * 5)],
          initials: h.name ? h.name.split(' ').map((w: string) => w[0]).join('').substring(0, 2).toUpperCase() : 'HE',
          bio: h.bio || `Certified healer specializing in ${h.specialization || 'general healing'}.`,
          patientsCount: h.patientsCount || 0,
        }));
        setHealers(formattedHealers);
      } else {
        throw new Error("Invalid API response");
      }
    } catch (error) {
      console.error('Error fetching healers:', error);
      setHealers([]);
    }
  }, [assignedBranch]);

  useEffect(() => {
    fetchHealers();
  }, [fetchHealers]);

  useIonViewWillEnter(() => {
    fetchHealers();
  });

  const [patients, setPatients] = useState<Patient[]>([]);

  const [reassignmentLogs, setReassignmentLogs] = useState<ReassignmentLog[]>(() => {
    const saved = localStorage.getItem('phms_reassignment_logs');
    return saved ? JSON.parse(saved) : [];
  });

  const [audits, setAudits] = useState<AuditLog[]>(() => {
    const saved = localStorage.getItem('phms_audits');
    return saved ? JSON.parse(saved) : INITIAL_AUDITS;
  });

  const [notifications, setNotifications] = useState<Notification[]>(() => {
    const saved = localStorage.getItem('phms_notifications');
    return saved ? JSON.parse(saved) : [];
  });

  // Save to local storage on changes
  useEffect(() => {
    localStorage.setItem('phms_healers', JSON.stringify(healers));
  }, [healers]);

  useEffect(() => {
    localStorage.setItem('phms_patients', JSON.stringify(patients));
  }, [patients]);

  useEffect(() => {
    localStorage.setItem('phms_reassignment_logs', JSON.stringify(reassignmentLogs));
  }, [reassignmentLogs]);

  useEffect(() => {
    localStorage.setItem('phms_audits', JSON.stringify(audits));
  }, [audits]);

  useEffect(() => {
    localStorage.setItem('phms_notifications', JSON.stringify(notifications));
  }, [notifications]);

  // ── Basic UI States ───────────────────────────────────────────────────────
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [certFilter, setCertFilter] = useState('All');
  const [specFilter, setSpecFilter] = useState('All');
  const [patientCountFilter, setPatientCountFilter] = useState('All');

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, statusFilter, certFilter, specFilter, patientCountFilter]);

  // Selected healer details and modal flags
  const [selectedHealer, setSelectedHealer] = useState<Healer | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [showReassignModal, setShowReassignModal] = useState(false);
  const [showDeactivateModal, setShowDeactivateModal] = useState(false);
  const [showResetPasswordModal, setShowResetPasswordModal] = useState(false);

  // Form states
  const [addForm, setAddForm] = useState({
    name: '',
    gender: 'Female' as 'Male' | 'Female' | 'Other',
    dob: '',
    email: '',
    phone: '',
    address: '',
    certificationLevel: CERTIFICATIONS[0],
    specialization: [] as string[],
    experience: 0,
    status: true, // Toggle active by default
    bio: '',
  });

  const [editForm, setEditForm] = useState<Healer | null>(null);

  // Patient assignments working variables
  const [selectedPatientToReassign, setSelectedPatientToReassign] = useState<Patient | null>(null);
  const [reassignNewHealerId, setReassignNewHealerId] = useState('');
  const [reassignReason, setReassignReason] = useState('');

  // Toast message
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // ── Delete Confirmation Modal State ───────────────────────────────────────
  const [healerToDelete, setHealerToDelete] = useState<Healer | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleConfirmDelete = async () => {
    if (!healerToDelete) return;
    setIsDeleting(true);
    try {
      await deleteHealer(healerToDelete.id);
      setHealers(prev => prev.filter(h => h.id !== healerToDelete.id));
      logAudit('HEALER_DELETION', `Deleted healer ${healerToDelete.name} (ID: ${healerToDelete.id}).`);
      triggerToast(`Healer "${healerToDelete.name}" has been permanently removed.`);
    } catch (err: any) {
      console.error('Error deleting healer:', err);
      triggerError(err?.response?.data?.message || 'Failed to delete healer. Please try again.');
    } finally {
      setIsDeleting(false);
      setHealerToDelete(null);
    }
  };

  // Trigger brief visual toasts
  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  const triggerError = (msg: string) => {
    setErrorMessage(msg);
    setTimeout(() => setErrorMessage(null), 5000);
  };

  // Helper function to log Audits
  const logAudit = (action: string, details: string) => {
    const newAudit: AuditLog = {
      id: `A-${Math.floor(1000 + Math.random() * 9000)}`,
      action,
      details,
      changedBy: user?.name || user?.email || 'Aria Seraphina',
      timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19),
    };
    setAudits(prev => [newAudit, ...prev]);
  };

  // Helper function to send mock notifications
  const sendNotification = (type: 'SMS' | 'Email' | 'In-App' | 'Dashboard Alert', recipient: string, message: string) => {
    const newNotif: Notification = {
      id: `N-${Math.floor(1000 + Math.random() * 9000)}`,
      type,
      recipient,
      message,
      timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19),
    };
    setNotifications(prev => [newNotif, ...prev]);
  };

  // ── Security Access Check Redirections ────────────────────────────────────
  if (!isAuthenticated) {
    return (
      <IonPage className="sa-page">
        <IonContent className="sa-page__content" fullscreen>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', padding: '24px' }}>
            <div style={{ background: '#fff', padding: '40px', borderRadius: '16px', border: '1px solid #fee2e2', maxWidth: '500px', textAlign: 'center', boxShadow: '0 10px 30px rgba(0,0,0,0.05)' }}>
              <div style={{ fontSize: '60px', color: '#ef4444', marginBottom: '16px' }}><IonIcon icon={banOutline} /></div>
              <h2 style={{ fontSize: '20px', fontWeight: 800, color: '#1e293b', marginBottom: '8px' }}>Not Authenticated</h2>
              <p style={{ color: '#64748b', fontSize: '14px', lineHeight: 1.6 }}>Please log in to access the Healer Management module.</p>
            </div>
          </div>
        </IonContent>
      </IonPage>
    );
  }

  if (user?.role === 'PATIENT') {
    return (
      <IonPage className="sa-page">
        <IonContent className="sa-page__content" fullscreen>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', padding: '24px' }}>
            <div style={{ background: '#fff', padding: '40px', borderRadius: '16px', border: '1px solid #fee2e2', maxWidth: '500px', textAlign: 'center', boxShadow: '0 10px 30px rgba(0,0,0,0.05)' }}>
              <div style={{ fontSize: '60px', color: '#ef4444', marginBottom: '16px' }}><IonIcon icon={banOutline} /></div>
              <h2 style={{ fontSize: '20px', fontWeight: 800, color: '#1e293b', marginBottom: '8px' }}>Unauthorized Node Access</h2>
              <p style={{ color: '#64748b', fontSize: '14px', lineHeight: 1.6 }}>Access Denied. The Healer Management workspace is restricted. Patients do not possess the required credentials to access this branch data.</p>
            </div>
          </div>
        </IonContent>
      </IonPage>
    );
  }

  // ── Filter & Branch Limit Logic ──────────────────────────────────────────
  const filterHealersByAccess = () => {
    if (isParaHealer) {
      return healers.filter(h => h.email.toLowerCase() === user.email.toLowerCase());
    }
    if (isBranchAdmin) {
      return healers.filter(h => h.branch.toLowerCase() === assignedBranch.toLowerCase());
    }
    return healers;
  };

  const healersListByRole = filterHealersByAccess();

  const filteredHealers = healersListByRole.filter(h => {
    const matchesSearch =
      h.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      h.phone.includes(searchQuery) ||
      h.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      h.specialization.some(s => s.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesStatus = statusFilter === 'All' || h.status === statusFilter;
    const matchesCert = certFilter === 'All' || h.certificationLevel === certFilter;
    const matchesSpec = specFilter === 'All' || h.specialization.includes(specFilter);

    let matchesPatientCount = true;
    const activePatientCount = h.patientsCount || 0;
    if (patientCountFilter === 'None') {
      matchesPatientCount = activePatientCount === 0;
    } else if (patientCountFilter === '1-3') {
      matchesPatientCount = activePatientCount >= 1 && activePatientCount <= 3;
    } else if (patientCountFilter === '4+') {
      matchesPatientCount = activePatientCount >= 4;
    }

    return matchesSearch && matchesStatus && matchesCert && matchesSpec && matchesPatientCount;
  });

  const itemsPerPage = 5;
  const totalPages = Math.ceil(filteredHealers.length / itemsPerPage) || 1;
  const paginatedHealers = filteredHealers.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const totalHealers = healersListByRole.length;
  const activeHealers = healersListByRole.filter(h => h.status === 'ACTIVE').length;
  const inactiveHealers = healersListByRole.filter(h => h.status === 'INACTIVE').length;

  const totalHealingSessions = healersListByRole.reduce((sum, h) => sum + h.cumulativeHealingCount, 0);
  const totalAssignedPatients = patients.filter(p => 
    p.status === 'Active' && 
    healersListByRole.some(h => h.id === p.assignedHealerId)
  ).length;

  const totalUrgentCases = healersListByRole.reduce((sum, h) => sum + h.urgentFollowUps, 0);

  // ── Operations Flows ──────────────────────────────────────────────────────

  const handleAddHealerSubmit = (e: React.FormEvent, andAddAnother = false) => {
    e.preventDefault();

    if (!addForm.name || !addForm.dob || !addForm.email || !addForm.phone || !addForm.address || addForm.specialization.length === 0) {
      triggerError('Please fill all mandatory fields.');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(addForm.email)) {
      triggerError('Enter valid email address.');
      return;
    }

    if (addForm.experience < 0) {
      triggerError('Experience cannot be negative.');
      return;
    }

    const emailExists = healers.some(h => h.email.toLowerCase() === addForm.email.toLowerCase());
    if (emailExists) {
      triggerError('Email already exists.');
      return;
    }

    const phoneExists = healers.some(h => h.phone.replace(/[\s+-]/g, '') === addForm.phone.replace(/[\s+-]/g, ''));
    if (phoneExists) {
      triggerError('Phone number already exists.');
      return;
    }

    const genPassword = `PHMS-${Math.random().toString(36).substring(2, 7).toUpperCase()}#${Math.floor(10 + Math.random() * 90)}`;

    const healerId = `H-${Math.floor(1000 + Math.random() * 9000)}`;

    const newHealer: Healer = {
      id: healerId,
      name: addForm.name,
      gender: addForm.gender,
      dob: addForm.dob,
      email: addForm.email,
      phone: addForm.phone,
      address: addForm.address,
      certificationLevel: addForm.certificationLevel,
      specialization: addForm.specialization,
      experience: Number(addForm.experience),
      status: addForm.status ? 'ACTIVE' : 'INACTIVE',
      branch: assignedBranch,
      createdAt: new Date().toISOString().split('T')[0],
      cumulativeHealingCount: 0,
      completedSessions: 0,
      pendingNotes: 0,
      urgentFollowUps: 0,
      avatarBg: ['#0f5b4b', '#1e40af', '#7c3aed', '#db2777', '#b45309'][Math.floor(Math.random() * 5)],
      initials: addForm.name.split(' ').map(w => w[0]).join('').substring(0, 2).toUpperCase(),
      bio: addForm.bio || `Certified healer specializing in ${addForm.specialization.join(', ')}.`,
    };

    setHealers(prev => [...prev, newHealer]);

    sendNotification('SMS', addForm.phone, `Welcome Dr. ${addForm.name}. Your account created. Login Email: ${addForm.email}, Temp Pass: ${genPassword}`);
    sendNotification('Email', addForm.email, `Dear Dr. ${addForm.name}, Welcome to PHMS. Your healer credentials: Login Email: ${addForm.email}, Password: ${genPassword}`);
    logAudit('HEALER_CREATION', `Created healer ${addForm.name} (ID: ${healerId}) assigned to branch ${assignedBranch}. Auto-credentials dispatched.`);

    triggerToast('Healer account created successfully.');

    if (andAddAnother) {
      setAddForm({
        name: '',
        gender: 'Female',
        dob: '',
        email: '',
        phone: '',
        address: '',
        certificationLevel: CERTIFICATIONS[0],
        specialization: [],
        experience: 0,
        status: true,
        bio: '',
      });
    } else {
      setShowAddModal(false);
      setAddForm({
        name: '',
        gender: 'Female',
        dob: '',
        email: '',
        phone: '',
        address: '',
        certificationLevel: CERTIFICATIONS[0],
        specialization: [],
        experience: 0,
        status: true,
        bio: '',
      });
    }
  };

  const handleEditHealerSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editForm) return;

    if (!editForm.email || !editForm.phone || !editForm.address) {
      triggerError('Please fill all mandatory fields.');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(editForm.email)) {
      triggerError('Enter valid email address.');
      return;
    }

    if (editForm.experience < 0) {
      triggerError('Experience cannot be negative.');
      return;
    }

    const emailExists = healers.some(h => h.id !== editForm.id && h.email.toLowerCase() === editForm.email.toLowerCase());
    if (emailExists) {
      triggerError('Email already exists.');
      return;
    }

    const phoneExists = healers.some(h => h.id !== editForm.id && h.phone.replace(/[\s+-]/g, '') === editForm.phone.replace(/[\s+-]/g, ''));
    if (phoneExists) {
      triggerError('Phone number already exists.');
      return;
    }

    const oldHealerObj = healers.find(h => h.id === editForm.id);
    if (oldHealerObj && oldHealerObj.status === 'ACTIVE' && editForm.status === 'INACTIVE') {
      if (oldHealerObj.urgentFollowUps > 0) {
        triggerError('Cannot deactivate healer with active urgent follow-up cases.');
        return;
      }
      const activePats = patients.filter(p => p.assignedHealerId === editForm.id && p.status === 'Active');
      if (activePats.length > 0) {
        triggerError(`Reassignment required before deactivation. Healer has ${activePats.length} active patients.`);
        return;
      }
    }

    setHealers(prev => prev.map(h => h.id === editForm.id ? editForm : h));
    logAudit('HEALER_UPDATE', `Updated profile of healer ${editForm.name} (ID: ${editForm.id}).`);
    triggerToast('Healer profile updated successfully.');
    setShowEditModal(false);

    if (selectedHealer && selectedHealer.id === editForm.id) {
      setSelectedHealer(editForm);
    }
  };

  const handleAssignPatient = (patientId: string, healerId: string) => {
    const pat = patients.find(p => p.id === patientId);
    const healer = healers.find(h => h.id === healerId);
    if (!pat || !healer) return;

    if (pat.assignedHealerId === healerId) {
      triggerError('Patient is already assigned to this healer.');
      return;
    }

    const oldHealerId = pat.assignedHealerId;
    const oldHealerName = healers.find(h => h.id === oldHealerId)?.name || 'None';

    setPatients(prev => prev.map(p => p.id === patientId ? { ...p, assignedHealerId: healerId } : p));
    
    const timestampString = new Date().toISOString().replace('T', ' ').substring(0, 19);
    const newLog: ReassignmentLog = {
      id: `R-${Math.floor(1000 + Math.random() * 9000)}`,
      patientId,
      patientName: pat.name,
      prevHealer: oldHealerName,
      newHealer: healer.name,
      changedBy: user?.name || user?.email || 'Aria Seraphina',
      timestamp: timestampString,
      reason: 'Manual reassignment by Admin',
    };
    setReassignmentLogs(prev => [newLog, ...prev]);

    sendNotification('In-App', healer.name, `New Patient Assigned: ${pat.name} linked to your workload.`);
    logAudit('PATIENT_ASSIGNMENT', `Assigned Patient ${pat.name} (ID: ${patientId}) to Healer ${healer.name} (ID: ${healerId}).`);
    triggerToast(`Patient ${pat.name} successfully assigned.`);
    setShowAssignModal(false);
  };

  const handlePatientReassignSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPatientToReassign || !reassignNewHealerId) {
      triggerError('Please select a new healer.');
      return;
    }

    const patientId = selectedPatientToReassign.id;
    const healerId = reassignNewHealerId;
    const pat = patients.find(p => p.id === patientId);
    const healer = healers.find(h => h.id === healerId);
    if (!pat || !healer) return;

    const oldHealerId = pat.assignedHealerId;
    const oldHealerName = healers.find(h => h.id === oldHealerId)?.name || 'None';

    setPatients(prev => prev.map(p => p.id === patientId ? { ...p, assignedHealerId: healerId } : p));

    const timestampString = new Date().toISOString().replace('T', ' ').substring(0, 19);
    const newLog: ReassignmentLog = {
      id: `R-${Math.floor(1000 + Math.random() * 9000)}`,
      patientId,
      patientName: pat.name,
      prevHealer: oldHealerName,
      newHealer: healer.name,
      changedBy: user?.name || user?.email || 'Aria Seraphina',
      timestamp: timestampString,
      reason: reassignReason || 'Reassigned during workload balancing',
    };
    setReassignmentLogs(prev => [newLog, ...prev]);

    sendNotification('In-App', healer.name, `New Patient Reassigned: ${pat.name} linked to your workload. Reason: ${reassignReason}`);
    logAudit('PATIENT_REASSIGNMENT', `Reassigned Patient ${pat.name} from Healer ${oldHealerName} to ${healer.name}. Reason: ${reassignReason}`);
    triggerToast(`Patient ${pat.name} reassigned to ${healer.name}.`);

    setShowReassignModal(false);
    setSelectedPatientToReassign(null);
    setReassignNewHealerId('');
    setReassignReason('');
  };

  const handleRemovePatientAssignment = (patientId: string) => {
    const pat = patients.find(p => p.id === patientId);
    if (!pat) return;

    const oldHealerId = pat.assignedHealerId;
    const oldHealerName = healers.find(h => h.id === oldHealerId)?.name || 'None';

    setPatients(prev => prev.map(p => p.id === patientId ? { ...p, assignedHealerId: '' } : p));

    const timestampString = new Date().toISOString().replace('T', ' ').substring(0, 19);
    const newLog: ReassignmentLog = {
      id: `R-${Math.floor(1000 + Math.random() * 9000)}`,
      patientId,
      patientName: pat.name,
      prevHealer: oldHealerName,
      newHealer: 'Unassigned',
      changedBy: user?.name || user?.email || 'Aria Seraphina',
      timestamp: timestampString,
      reason: 'Removed from healer caseload',
    };
    setReassignmentLogs(prev => [newLog, ...prev]);

    logAudit('PATIENT_DEASSIGNMENT', `Unassigned Patient ${pat.name} from Healer ${oldHealerName}.`);
    triggerToast(`Patient ${pat.name} removed from caseload.`);
  };

  const handleDeactivateHealer = (healerId: string) => {
    const healer = healers.find(h => h.id === healerId);
    if (!healer) return;

    if (healer.urgentFollowUps > 0) {
      triggerError('Cannot deactivate healer with active urgent follow-up cases.');
      setShowDeactivateModal(false);
      return;
    }

    const activePats = patients.filter(p => p.assignedHealerId === healerId && p.status === 'Active');
    if (activePats.length > 0) {
      triggerError(`Reassignment required before deactivation. Healer has ${activePats.length} active patients.`);
      setShowDeactivateModal(false);
      return;
    }

    setHealers(prev => prev.map(h => h.id === healerId ? { ...h, status: 'INACTIVE' } : h));
    logAudit('HEALER_DEACTIVATION', `Deactivated healer account ${healer.name} (ID: ${healerId}). Login disabled.`);
    sendNotification('Email', healer.email, `Your healer portal login has been temporarily disabled.`);
    triggerToast(`Healer ${healer.name} deactivated.`);
    
    if (selectedHealer && selectedHealer.id === healerId) {
      setSelectedHealer({ ...selectedHealer, status: 'INACTIVE' });
    }
    setShowDeactivateModal(false);
  };

  const handleResetPassword = (healerId: string) => {
    const healer = healers.find(h => h.id === healerId);
    if (!healer) return;

    const newPass = `PHMS-${Math.random().toString(36).substring(2, 7).toUpperCase()}#${Math.floor(10 + Math.random() * 90)}`;
    
    sendNotification('SMS', healer.phone, `Your healer password has been reset by Branch Admin. New Pass: ${newPass}`);
    sendNotification('Email', healer.email, `Dear Dr. ${healer.name}, Your credentials have been reset. Password: ${newPass}`);
    logAudit('PASSWORD_RESET', `Reset login credentials for Healer ${healer.name} (ID: ${healerId}). Credentials dispatched.`);
    
    triggerToast('Password reset successfully. Credentials sent via SMS + Email.');
    setShowResetPasswordModal(false);
  };

  const handleExport = (reportType: string, format: 'PDF' | 'Excel') => {
    logAudit('REPORT_EXPORT', `Exported ${reportType} as ${format} format.`);
    triggerToast(`Successfully downloaded "${reportType}" report as ${format}.`);
  };

  return (
    <IonPage className="sa-page">
      {/* ── HEADER ─────────────────────────────────────────────────── */}
      <IonHeader className="ion-no-border">
        <IonToolbar className="sa-page__toolbar">
          <IonButtons slot="start">
            <IonMenuButton />
          </IonButtons>
          <IonTitle className="sa-page__toolbar-title">Healer Management</IonTitle>
          <IonButtons slot="end">
            <div className="sa-page__toolbar-actions">
              <IonButton fill="clear">
                <IonIcon icon={notificationsOutline} />
              </IonButton>
              <ProfileDropdown />
            </div>
          </IonButtons>
        </IonToolbar>
      </IonHeader>

      <IonContent className="sa-page__content" fullscreen>
        <div className="sa-page__body">

          {/* ── TOAST NOTIFICATIONS ────────────────────────────────────────── */}
          {toastMessage && (
            <div style={{ position: 'fixed', bottom: '24px', right: '24px', background: '#0f5b4b', color: '#fff', padding: '12px 24px', borderRadius: '8px', zIndex: 100000, boxShadow: '0 10px 25px rgba(0,0,0,0.15)', display: 'flex', alignItems: 'center', gap: '10px', animation: 'slideIn 0.3s ease' }}>
              <IonIcon icon={checkmarkCircleOutline} style={{ fontSize: '20px' }} />
              <span style={{ fontSize: '13px', fontWeight: 700 }}>{toastMessage}</span>
            </div>
          )}

          {errorMessage && (
            <div style={{ position: 'fixed', bottom: '24px', right: '24px', background: '#ef4444', color: '#fff', padding: '12px 24px', borderRadius: '8px', zIndex: 100000, boxShadow: '0 10px 25px rgba(0,0,0,0.15)', display: 'flex', alignItems: 'center', gap: '10px', animation: 'slideIn 0.3s ease' }}>
              <IonIcon icon={alertCircleOutline} style={{ fontSize: '20px' }} />
              <span style={{ fontSize: '13px', fontWeight: 700 }}>{errorMessage}</span>
            </div>
          )}

          {/* ── PARA HEALER VIEW ONLY REDIRECTION ───────────────────────────── */}
          {isParaHealer ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div style={{ background: '#fff', borderRadius: '16px', border: '1px solid #e2e8f0', padding: '24px' }}>
                <h2 style={{ fontSize: '18px', fontWeight: 800, color: '#1e293b', marginBottom: '4px' }}>Para Healer Access Panel</h2>
                <p style={{ color: '#64748b', fontSize: '13px' }}>Under strict clinical guidelines, Para Healers are authorized to view their own profile and caseloads only.</p>
              </div>

              {healersListByRole.map(healer => (
                <div key={healer.id} style={{ background: '#fff', borderRadius: '16px', border: '1px solid #e2e8f0', padding: '32px' }}>
                  {/* Basic Profile Details */}
                  <div style={{ display: 'flex', gap: '24px', alignItems: 'center', borderBottom: '1px solid #f1f5f9', paddingBottom: '24px', marginBottom: '24px' }}>
                    <div style={{ width: '80px', height: '80px', borderRadius: '50%', background: healer.avatarBg, color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '26px', fontWeight: 800 }}>
                      {healer.initials}
                    </div>
                    <div>
                      <h1 style={{ fontSize: '24px', fontWeight: 800, color: '#1e293b', margin: 0 }}>Dr. {healer.name}</h1>
                      <div style={{ fontSize: '13px', color: '#64748b', marginTop: '4px' }}>ID: {healer.id} • Branch: {healer.branch} • Joined: {healer.createdAt}</div>
                      <div style={{ display: 'flex', gap: '8px', marginTop: '8px' }}>
                        {healer.specialization.map((spec, i) => (
                          <span key={i} style={{ padding: '3px 10px', background: '#d1fae5', color: '#065f46', borderRadius: '20px', fontSize: '11px', fontWeight: 700 }}>{spec}</span>
                        ))}
                        <span className={`sa-badge sa-badge--active`}>{healer.status}</span>
                      </div>
                    </div>
                  </div>

                  {/* Clinical Bio */}
                  <div style={{ background: '#f8fafc', padding: '16px', borderRadius: '12px', marginBottom: '24px', borderLeft: '4px solid var(--ba-color-primary)' }}>
                    <h3 style={{ margin: '0 0 6px 0', fontSize: '12px', fontWeight: 800, textTransform: 'uppercase', color: '#475569' }}>Professional Bio</h3>
                    <p style={{ margin: 0, fontSize: '13px', color: '#475569', lineHeight: 1.6 }}>{healer.bio}</p>
                  </div>

                  {/* Caseload stats */}
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: '16px', marginBottom: '32px' }}>
                    <div style={{ border: '1px solid #e2e8f0', borderRadius: '12px', padding: '16px', textAlign: 'center' }}>
                      <div style={{ fontSize: '24px', fontWeight: 800, color: 'var(--ba-color-primary)' }}>{healer.experience} yrs</div>
                      <div style={{ fontSize: '11px', color: '#64748b', fontWeight: 700, textTransform: 'uppercase', marginTop: '4px' }}>Experience</div>
                    </div>
                    <div style={{ border: '1px solid #e2e8f0', borderRadius: '12px', padding: '16px', textAlign: 'center' }}>
                      <div style={{ fontSize: '24px', fontWeight: 800, color: 'var(--ba-color-primary)' }}>{patients.filter(p => p.assignedHealerId === healer.id && p.status === 'Active').length}</div>
                      <div style={{ fontSize: '11px', color: '#64748b', fontWeight: 700, textTransform: 'uppercase', marginTop: '4px' }}>Active Patients</div>
                    </div>
                    <div style={{ border: '1px solid #e2e8f0', borderRadius: '12px', padding: '16px', textAlign: 'center' }}>
                      <div style={{ fontSize: '24px', fontWeight: 800, color: 'var(--ba-color-primary)' }}>{healer.cumulativeHealingCount}</div>
                      <div style={{ fontSize: '11px', color: '#64748b', fontWeight: 700, textTransform: 'uppercase', marginTop: '4px' }}>Cumulative Sessions</div>
                    </div>
                    <div style={{ border: '1px solid #e2e8f0', borderRadius: '12px', padding: '16px', textAlign: 'center' }}>
                      <div style={{ fontSize: '24px', fontWeight: 800, color: '#ef4444' }}>{healer.urgentFollowUps}</div>
                      <div style={{ fontSize: '11px', color: '#64748b', fontWeight: 700, textTransform: 'uppercase', marginTop: '4px' }}>Urgent Follow-ups</div>
                    </div>
                  </div>

                  {/* Personal Assigned Caseload List */}
                  <h3 style={{ fontSize: '16px', fontWeight: 800, color: '#1e293b', marginBottom: '12px' }}>Your Assigned Active Patients</h3>
                  <div className="sa-table-container">
                    <table className="sa-table" style={{ width: '100%' }}>
                      <thead>
                        <tr>
                          <th>Patient ID</th>
                          <th>Name</th>
                          <th>Condition Case</th>
                          <th>Sessions</th>
                          <th>Last Treatment</th>
                          <th>Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {patients.filter(p => p.assignedHealerId === healer.id).map(p => (
                          <tr key={p.id}>
                            <td style={{ fontWeight: 700 }}>{p.id}</td>
                            <td style={{ fontWeight: 700, color: 'var(--ba-color-primary)' }}>{p.name}</td>
                            <td>{p.caseType}</td>
                            <td>{p.sessionCount} Sessions</td>
                            <td>{p.lastSessionDate}</td>
                            <td>
                              <span className="sa-badge sa-badge--active">{p.status}</span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>

              {/* Subtitle + Add Healer Button (top right) */}
              <div className="ba-healers-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <p className="sa-page__subtitle" style={{ margin: 0 }}>
                  Healer Registry, Certifications, Caseload and Reassignments
                </p>
                <button
                  onClick={() => history.push('/branch-admin/healers/create')}
                  className="sa-btn sa-btn--primary"
                  style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 16px', fontSize: '13px' }}
                >
                  <IonIcon icon={addOutline} /> Add New Healer
                </button>
              </div>

              {/* Dynamic Dashboard Widgets */}
              <div className="ba-dashboard-widgets" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
                <div className="ba-widget-card" style={{ background: '#ffffff', borderRadius: '12px', padding: '16px', boxShadow: '0 1px 3px rgba(0,0,0,0.02)', borderLeft: '4px solid var(--ba-color-primary)', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <span className="ba-widget-title" style={{ fontSize: '11px', color: '#64748b', fontWeight: 700, textTransform: 'uppercase' }}>Total Healers</span>
                  <span className="ba-widget-count" style={{ fontSize: '24px', fontWeight: 800, color: '#0f172a' }}>{totalHealers}</span>
                  <span className="ba-widget-subtitle" style={{ fontSize: '11px', color: '#94a3b8' }}>All registered staff</span>
                </div>

                <div className="ba-widget-card" style={{ background: '#ffffff', borderRadius: '12px', padding: '16px', boxShadow: '0 1px 3px rgba(0,0,0,0.02)', borderLeft: '4px solid #10b981', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <span className="ba-widget-title" style={{ fontSize: '11px', color: '#64748b', fontWeight: 700, textTransform: 'uppercase' }}>Active Healers</span>
                  <span className="ba-widget-count" style={{ fontSize: '24px', fontWeight: 800, color: '#10b981' }}>{activeHealers}</span>
                  <span className="ba-widget-subtitle" style={{ fontSize: '11px', color: '#94a3b8' }}>Online & Available</span>
                </div>

                <div className="ba-widget-card" style={{ background: '#ffffff', borderRadius: '12px', padding: '16px', boxShadow: '0 1px 3px rgba(0,0,0,0.02)', borderLeft: '4px solid #64748b', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <span className="ba-widget-title" style={{ fontSize: '11px', color: '#64748b', fontWeight: 700, textTransform: 'uppercase' }}>Inactive Healers</span>
                  <span className="ba-widget-count" style={{ fontSize: '24px', fontWeight: 800, color: '#64748b' }}>{inactiveHealers}</span>
                  <span className="ba-widget-subtitle" style={{ fontSize: '11px', color: '#94a3b8' }}>On leave/deactivated</span>
                </div>

                {/* <div style={{ background: '#ffffff', borderRadius: '12px', padding: '16px', boxShadow: '0 1px 3px rgba(0,0,0,0.02)', borderLeft: '4px solid #f59e0b', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <span style={{ fontSize: '11px', color: '#64748b', fontWeight: 700, textTransform: 'uppercase' }}>Total Healing Count</span>
                  <span style={{ fontSize: '24px', fontWeight: 800, color: '#d97706' }}>{totalHealingSessions}</span>
                  <span style={{ fontSize: '11px', color: '#94a3b8' }}>Cumulative sessions</span>
                </div>

                <div style={{ background: '#ffffff', borderRadius: '12px', padding: '16px', boxShadow: '0 1px 3px rgba(0,0,0,0.02)', borderLeft: '4px solid #3b82f6', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <span style={{ fontSize: '11px', color: '#64748b', fontWeight: 700, textTransform: 'uppercase' }}>Total Assigned Patients</span>
                  <span style={{ fontSize: '24px', fontWeight: 800, color: '#2563eb' }}>{totalAssignedPatients}</span>
                  <span style={{ fontSize: '11px', color: '#94a3b8' }}>Active workload link</span>
                </div>

                <div style={{ background: '#ffffff', borderRadius: '12px', padding: '16px', boxShadow: '0 1px 3px rgba(0,0,0,0.02)', borderLeft: '4px solid #ef4444', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <span style={{ fontSize: '11px', color: '#64748b', fontWeight: 700, textTransform: 'uppercase' }}>Urgent Cases</span>
                  <span style={{ fontSize: '24px', fontWeight: 800, color: '#ef4444' }}>{totalUrgentCases}</span>
                  <span style={{ fontSize: '11px', color: '#b91c1c', display: 'flex', alignItems: 'center', gap: '3px' }}>
                    <IonIcon icon={alertCircleOutline} /> Follow-ups flagged
                  </span>
                </div> */}
              </div>

              {/* Search & Filters */}
              <div className="ba-healers-filters" style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flex: 1, minWidth: '300px' }}>
                  <div className="sa-search" style={{ margin: 0, width: '100%', maxWidth: '350px' }}>
                    <IonIcon icon={searchOutline} />
                    <input
                      type="text"
                      placeholder="Search Name, Phone, Email, Specialization..."
                      value={searchQuery}
                      onChange={e => setSearchQuery(e.target.value)}
                    />
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
                  {/* <div style={{ display: 'flex', alignItems: 'center', gap: '6px', background: '#f1f5f9', padding: '0 12px', borderRadius: '8px', fontSize: '12px', fontWeight: 700, color: '#334155', height: '36px', boxSizing: 'border-box' }}>
                    <IonIcon icon={filterOutline} />
                    <span>FILTERS</span>
                  </div> */}

                  <select
                    value={statusFilter}
                    onChange={e => setStatusFilter(e.target.value)}
                    style={{ height: '36px', padding: '0 12px', borderRadius: '8px', border: '1px solid #cbd5e1', background: '#ffffff', fontSize: '12px', color: '#475569', outline: 'none', fontWeight: 600, boxSizing: 'border-box' }}
                  >
                    <option value="All">All Statuses</option>
                    <option value="ACTIVE">ACTIVE</option>
                    <option value="INACTIVE">INACTIVE</option>
                  </select>

                  {/* <select
                    value={certFilter}
                    onChange={e => setCertFilter(e.target.value)}
                    style={{ height: '36px', padding: '0 12px', borderRadius: '8px', border: '1px solid #cbd5e1', background: '#ffffff', fontSize: '12px', color: '#475569', outline: 'none', fontWeight: 600, boxSizing: 'border-box' }}
                  >
                    <option value="All">All Certifications</option>
                    {CERTIFICATIONS.map(c => <option key={c} value={c}>{c}</option>)}
                  </select> */}

                  <select
                    value={specFilter}
                    onChange={e => setSpecFilter(e.target.value)}
                    style={{ height: '36px', padding: '0 12px', borderRadius: '8px', border: '1px solid #cbd5e1', background: '#ffffff', fontSize: '12px', color: '#475569', outline: 'none', fontWeight: 600, boxSizing: 'border-box' }}
                  >
                     <option value="All">All Specializations</option>
                    {specializations.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
              </div>

              {/* Actions Header Bar */}
              {/* <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ fontSize: '13px', fontWeight: 700, color: '#475569' }}>
                  Showing <strong style={{ color: 'var(--ba-color-primary)' }}>{filteredHealers.length}</strong> Healers in {assignedBranch} Branch
                </div>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button
                    onClick={() => handleExport('Healer Performance Report', 'PDF')}
                    className="sa-btn sa-btn--outline"
                    style={{ padding: '6px 12px', fontSize: '12px', display: 'flex', alignItems: 'center', gap: '6px' }}
                  >
                    <IonIcon icon={downloadOutline} /> PDF Report
                  </button>
                  <button
                    onClick={() => handleExport('Healer Performance Report', 'Excel')}
                    className="sa-btn sa-btn--outline"
                    style={{ padding: '6px 12px', fontSize: '12px', display: 'flex', alignItems: 'center', gap: '6px' }}
                  >
                    <IonIcon icon={downloadOutline} /> Excel Report
                  </button>
                </div>
              </div> */}

              {/* Healers Table */}
              <div style={{ background: '#ffffff', borderRadius: '16px', padding: '20px', border: '1px solid #e2e8f0' }}>
                <div className="sa-table-container">
                  <table className="sa-table">
                    <thead>
                      <tr>
                        <th>HEALER</th>
                        <th>SPECIALTY</th>
                        <th>BRANCH</th>
                        <th>EXP. (YRS)</th>
                        <th>CURRENT PATIENT</th>
                        <th>STATUS</th>
                        <th style={{ textAlign: 'center' }}>ACTIONS</th>
                      </tr>
                    </thead>
                    <tbody>
                      {paginatedHealers.length > 0 ? (
                        paginatedHealers.map(healer => {
                          return (
                            <tr
                              key={healer.id}
                              className="sa-table-row"
                              style={{ cursor: 'pointer' }}
                              onClick={() => setSelectedHealer(healer)}
                            >
                              <td>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                  <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: healer.avatarBg, color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: '12px', flexShrink: 0 }}>
                                    {healer.initials}
                                  </div>
                                  <div>
                                    <div style={{ fontWeight: 700, color: '#0f172a', fontSize: '13px' }}>{healer.name}</div>
                                    <div style={{ fontSize: '11px', color: '#94a3b8' }}>{healer.certificationLevel}</div>
                                  </div>
                                </div>
                              </td>
                              <td>
                                <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
                                  {healer.specialization.slice(0, 2).map((s, i) => (
                                    <span key={i} style={{ padding: '2px 8px', background: '#d1fae5', color: '#065f46', borderRadius: '20px', fontSize: '10px', fontWeight: 700 }}>{s}</span>
                                  ))}
                                  {healer.specialization.length > 2 && (
                                    <span style={{ padding: '2px 8px', background: '#e2e8f0', color: '#475569', borderRadius: '20px', fontSize: '10px', fontWeight: 700 }}>+{healer.specialization.length - 2}</span>
                                  )}
                                </div>
                              </td>
                              <td style={{ fontSize: '12px', fontWeight: 600, color: '#475569' }}>{healer.branch}</td>
                              <td style={{ fontSize: '13px', fontWeight: 700 }}>{healer.experience}</td>
                              <td>
                                <span style={{ fontWeight: 700, color: healer.patientsCount > 0 ? 'var(--ba-color-primary)' : '#94a3b8', fontSize: '13px' }}>
                                  {healer.patientsCount} Patient{healer.patientsCount !== 1 ? 's' : ''}
                                </span>
                              </td>
                              <td>
                                <span className={`sa-badge ${healer.status === 'ACTIVE' ? 'sa-badge--active' : 'sa-badge--inactive'}`}>
                                  {healer.status}
                                </span>
                              </td>
                              <td style={{ textAlign: 'center' }} onClick={e => e.stopPropagation()}>
                                <div style={{ display: 'flex', gap: '16px', justifyContent: 'center' }}>
                                  <button title="View Profile" onClick={() => history.push(`/branch-admin/healers/details/${healer.id}`)} style={{ background: 'transparent', border: 'none', cursor: 'pointer', fontSize: '18px', color: '#64748b', padding: 0 }}>
                                    <IonIcon icon={eyeOutline} />
                                  </button>
                                  <button title="Edit Profile" onClick={() => history.push(`/branch-admin/healers/edit/${healer.id}`)} style={{ background: 'transparent', border: 'none', cursor: 'pointer', fontSize: '18px', color: '#64748b', padding: 0 }}>
                                    <IonIcon icon={pencilOutline} />
                                  </button>
                                  <button title="Delete Healer" onClick={() => setHealerToDelete(healer)} style={{ background: 'transparent', border: 'none', cursor: 'pointer', fontSize: '18px', color: '#ef4444', padding: 0 }}>
                                    <IonIcon icon={trashOutline} />
                                  </button>
                                </div>
                              </td>
                            </tr>
                          );
                        })
                      ) : (
                        <tr>
                          <td colSpan={7} className="sa-table-empty">
                            No healers match your current filters.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>

                {/* Pagination Controls - Centered */}
                <div className="sa-pagination">
                  <span className="sa-pagination__info">
                    Showing {paginatedHealers.length} of {filteredHealers.length} healers
                  </span>
                  <div className="sa-pagination__controls">
                    <button
                      className="sa-pagination__btn"
                      disabled={currentPage <= 1}
                      onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                    >
                      «
                    </button>
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                      <button
                        key={page}
                        className={`sa-pagination__btn ${currentPage === page ? 'sa-pagination__btn--active' : ''}`}
                        onClick={() => setCurrentPage(page)}
                      >
                        {page}
                      </button>
                    ))}
                    <button
                      className="sa-pagination__btn"
                      disabled={currentPage >= totalPages}
                      onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                    >
                      »
                    </button>
                  </div>
                </div>
              </div>

              {/* Selected Healer Detail Panel */}
              {selectedHealer && (
                <div style={{ background: '#fff', borderRadius: '16px', border: '1px solid #e2e8f0', padding: '32px' }}>
                  {/* Header with close */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px' }}>
                    <div style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
                      <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: selectedHealer.avatarBg, color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '22px', fontWeight: 800 }}>
                        {selectedHealer.initials}
                      </div>
                      <div>
                        <h2 style={{ fontSize: '20px', fontWeight: 800, color: '#0f172a', margin: 0 }}>{selectedHealer.name}</h2>
                        <div style={{ fontSize: '12px', color: '#64748b', marginTop: '2px' }}>
                          ID: {selectedHealer.id} • {selectedHealer.certificationLevel} • {selectedHealer.branch}
                        </div>
                        <div style={{ display: 'flex', gap: '6px', marginTop: '8px', flexWrap: 'wrap' }}>
                          {selectedHealer.specialization.map((spec, i) => (
                            <span key={i} style={{ padding: '2px 10px', background: '#d1fae5', color: '#065f46', borderRadius: '20px', fontSize: '10px', fontWeight: 700 }}>{spec}</span>
                          ))}
                          <span className={`sa-badge ${selectedHealer.status === 'ACTIVE' ? 'sa-badge--active' : 'sa-badge--inactive'}`}>{selectedHealer.status}</span>
                        </div>
                      </div>
                    </div>
                    <button onClick={() => setSelectedHealer(null)} style={{ background: 'transparent', border: 'none', cursor: 'pointer', fontSize: '20px', color: '#94a3b8', padding: 0 }}>
                      <IonIcon icon={closeOutline} />
                    </button>
                  </div>

                  {/* Bio */}
                  {selectedHealer.bio && (
                    <div style={{ background: '#f8fafc', padding: '16px', borderRadius: '12px', marginBottom: '24px', borderLeft: '4px solid var(--ba-color-primary)' }}>
                      <p style={{ margin: 0, fontSize: '13px', color: '#475569', lineHeight: 1.6 }}>{selectedHealer.bio}</p>
                    </div>
                  )}

                  {/* Quick Stats */}
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px', marginBottom: '24px' }}>
                    <div style={{ border: '1px solid #e2e8f0', borderRadius: '10px', padding: '14px', textAlign: 'center' }}>
                      <div style={{ fontSize: '20px', fontWeight: 800, color: 'var(--ba-color-primary)' }}>{selectedHealer.experience} yrs</div>
                      <div style={{ fontSize: '10px', color: '#64748b', fontWeight: 700, textTransform: 'uppercase', marginTop: '4px' }}>Experience</div>
                    </div>
                    <div style={{ border: '1px solid #e2e8f0', borderRadius: '10px', padding: '14px', textAlign: 'center' }}>
                      <div style={{ fontSize: '20px', fontWeight: 800, color: 'var(--ba-color-primary)' }}>{patients.filter(p => p.assignedHealerId === selectedHealer.id && p.status === 'Active').length}</div>
                      <div style={{ fontSize: '10px', color: '#64748b', fontWeight: 700, textTransform: 'uppercase', marginTop: '4px' }}>Active Patients</div>
                    </div>
                    <div style={{ border: '1px solid #e2e8f0', borderRadius: '10px', padding: '14px', textAlign: 'center' }}>
                      <div style={{ fontSize: '20px', fontWeight: 800, color: 'var(--ba-color-primary)' }}>{selectedHealer.completedSessions}</div>
                      <div style={{ fontSize: '10px', color: '#64748b', fontWeight: 700, textTransform: 'uppercase', marginTop: '4px' }}>Completed Sessions</div>
                    </div>
                    <div style={{ border: '1px solid #e2e8f0', borderRadius: '10px', padding: '14px', textAlign: 'center' }}>
                      <div style={{ fontSize: '20px', fontWeight: 800, color: '#ef4444' }}>{selectedHealer.urgentFollowUps}</div>
                      <div style={{ fontSize: '10px', color: '#64748b', fontWeight: 700, textTransform: 'uppercase', marginTop: '4px' }}>Urgent Follow-ups</div>
                    </div>
                  </div>

                  {/* Contact Details */}
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '24px' }}>
                    <div style={{ padding: '12px 16px', background: '#f8fafc', borderRadius: '8px' }}>
                      <span style={{ fontSize: '10px', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase' }}>Email</span>
                      <div style={{ fontSize: '13px', fontWeight: 600, color: '#1e293b', marginTop: '2px' }}>{selectedHealer.email}</div>
                    </div>
                    <div style={{ padding: '12px 16px', background: '#f8fafc', borderRadius: '8px' }}>
                      <span style={{ fontSize: '10px', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase' }}>Phone</span>
                      <div style={{ fontSize: '13px', fontWeight: 600, color: '#1e293b', marginTop: '2px' }}>{selectedHealer.phone}</div>
                    </div>
                    <div style={{ padding: '12px 16px', background: '#f8fafc', borderRadius: '8px' }}>
                      <span style={{ fontSize: '10px', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase' }}>Address</span>
                      <div style={{ fontSize: '13px', fontWeight: 600, color: '#1e293b', marginTop: '2px' }}>{selectedHealer.address}</div>
                    </div>
                    <div style={{ padding: '12px 16px', background: '#f8fafc', borderRadius: '8px' }}>
                      <span style={{ fontSize: '10px', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase' }}>Date of Birth</span>
                      <div style={{ fontSize: '13px', fontWeight: 600, color: '#1e293b', marginTop: '2px' }}>{selectedHealer.dob}</div>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                    <button className="sa-btn sa-btn--outline" onClick={() => history.push(`/branch-admin/healers/edit/${selectedHealer.id}`)} style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px' }}>
                      <IonIcon icon={pencilOutline} /> Edit Profile
                    </button>
                    <button className="sa-btn sa-btn--outline" onClick={() => setShowAssignModal(true)} style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px' }}>
                      <IonIcon icon={peopleOutline} /> Assign Patient
                    </button>
                    {selectedHealer.status === 'ACTIVE' && (
                      <button className="sa-btn sa-btn--outline" onClick={() => setShowDeactivateModal(true)} style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: '#ef4444', borderColor: '#fecaca' }}>
                        <IonIcon icon={banOutline} /> Deactivate
                      </button>
                    )}
                    <button className="sa-btn sa-btn--outline" onClick={() => setShowResetPasswordModal(true)} style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px' }}>
                      <IonIcon icon={keyOutline} /> Reset Password
                    </button>
                  </div>

                  {/* Patient Caseload for Selected Healer */}
                  <div style={{ marginTop: '24px' }}>
                    <h3 style={{ fontSize: '14px', fontWeight: 800, color: '#1e293b', marginBottom: '12px' }}>Assigned Patient Caseload</h3>
                    <div className="sa-table-container">
                      <table className="sa-table">
                        <thead>
                          <tr>
                            <th>Patient ID</th>
                            <th>Name</th>
                            <th>Condition</th>
                            <th>Sessions</th>
                            <th>Last Visit</th>
                            <th>Status</th>
                            <th style={{ textAlign: 'center' }}>Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {patients.filter(p => p.assignedHealerId === selectedHealer.id).length > 0 ? (
                            patients.filter(p => p.assignedHealerId === selectedHealer.id).map(p => (
                              <tr key={p.id}>
                                <td style={{ fontWeight: 700, color: 'var(--ba-color-primary)' }}>{p.id}</td>
                                <td style={{ fontWeight: 700 }}>{p.name}</td>
                                <td>{p.caseType}</td>
                                <td>{p.sessionCount}</td>
                                <td>{p.lastSessionDate}</td>
                                <td><span className="sa-badge sa-badge--active">{p.status}</span></td>
                                <td style={{ textAlign: 'center' }}>
                                  <div style={{ display: 'flex', gap: '16px', justifyContent: 'center' }}>
                                    <button title="Reassign" onClick={() => { setSelectedPatientToReassign(p); setShowReassignModal(true); }} style={{ background: 'transparent', border: 'none', cursor: 'pointer', fontSize: '18px', color: '#64748b', padding: 0 }}>
                                      <IonIcon icon={refreshOutline} />
                                    </button>
                                    <button title="Remove" onClick={() => handleRemovePatientAssignment(p.id)} style={{ background: 'transparent', border: 'none', cursor: 'pointer', fontSize: '18px', color: '#ef4444', padding: 0 }}>
                                      <IonIcon icon={trashOutline} />
                                    </button>
                                  </div>
                                </td>
                              </tr>
                            ))
                          ) : (
                            <tr>
                              <td colSpan={7} className="sa-table-empty">No patients assigned to this healer.</td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* ── MODALS ────────────────────────────────────────────────────────── */}

        {/* Assign Patient Modal */}
        {showAssignModal && selectedHealer && (
          <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 99999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px' }}>
            <div style={{ background: '#fff', borderRadius: '16px', padding: '32px', maxWidth: '500px', width: '100%', maxHeight: '80vh', overflowY: 'auto' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <h2 style={{ fontSize: '18px', fontWeight: 800, color: '#1e293b', margin: 0 }}>Assign Patient to {selectedHealer.name}</h2>
                <button onClick={() => setShowAssignModal(false)} style={{ background: 'transparent', border: 'none', cursor: 'pointer', fontSize: '20px', color: '#94a3b8', padding: 0 }}>
                  <IonIcon icon={closeOutline} />
                </button>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {patients.filter(p => p.assignedHealerId !== selectedHealer.id && p.status === 'Active').map(p => (
                  <div key={p.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px', border: '1px solid #e2e8f0', borderRadius: '8px' }}>
                    <div>
                      <div style={{ fontWeight: 700, fontSize: '13px', color: '#1e293b' }}>{p.name}</div>
                      <div style={{ fontSize: '11px', color: '#64748b' }}>{p.caseType} • {p.id}</div>
                    </div>
                    <button className="sa-btn sa-btn--primary" onClick={() => handleAssignPatient(p.id, selectedHealer.id)} style={{ padding: '4px 12px', fontSize: '11px' }}>
                      Assign
                    </button>
                  </div>
                ))}
                {patients.filter(p => p.assignedHealerId !== selectedHealer.id && p.status === 'Active').length === 0 && (
                  <p style={{ color: '#94a3b8', fontSize: '13px', textAlign: 'center', padding: '20px' }}>No unassigned active patients available.</p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Reassign Patient Modal */}
        {showReassignModal && selectedPatientToReassign && (
          <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 99999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px' }}>
            <div style={{ background: '#fff', borderRadius: '16px', padding: '32px', maxWidth: '500px', width: '100%' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <h2 style={{ fontSize: '18px', fontWeight: 800, color: '#1e293b', margin: 0 }}>Reassign: {selectedPatientToReassign.name}</h2>
                <button onClick={() => { setShowReassignModal(false); setSelectedPatientToReassign(null); }} style={{ background: 'transparent', border: 'none', cursor: 'pointer', fontSize: '20px', color: '#94a3b8', padding: 0 }}>
                  <IonIcon icon={closeOutline} />
                </button>
              </div>
              <form onSubmit={handlePatientReassignSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div>
                  <label style={{ fontSize: '12px', fontWeight: 700, color: '#475569', display: 'block', marginBottom: '6px' }}>New Healer</label>
                  <select
                    value={reassignNewHealerId}
                    onChange={e => setReassignNewHealerId(e.target.value)}
                    style={{ width: '100%', padding: '8px 12px', border: '1px solid #cbd5e1', borderRadius: '8px', fontSize: '13px' }}
                  >
                    <option value="">Select a Healer</option>
                    {healers.filter(h => h.status === 'ACTIVE' && h.id !== selectedPatientToReassign.assignedHealerId).map(h => (
                      <option key={h.id} value={h.id}>{h.name} - {h.certificationLevel}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label style={{ fontSize: '12px', fontWeight: 700, color: '#475569', display: 'block', marginBottom: '6px' }}>Reason</label>
                  <textarea
                    value={reassignReason}
                    onChange={e => setReassignReason(e.target.value)}
                    placeholder="Reason for reassignment..."
                    style={{ width: '100%', padding: '8px 12px', border: '1px solid #cbd5e1', borderRadius: '8px', fontSize: '13px', minHeight: '80px', resize: 'vertical' }}
                  />
                </div>
                <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                  <button type="button" className="sa-btn sa-btn--outline" onClick={() => { setShowReassignModal(false); setSelectedPatientToReassign(null); }}>Cancel</button>
                  <button type="submit" className="sa-btn sa-btn--primary">Reassign Patient</button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Deactivate Confirmation Modal */}
        {showDeactivateModal && selectedHealer && (
          <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 99999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px' }}>
            <div style={{ background: '#fff', borderRadius: '16px', padding: '32px', maxWidth: '450px', width: '100%', textAlign: 'center' }}>
              <div style={{ fontSize: '48px', color: '#ef4444', marginBottom: '16px' }}><IonIcon icon={banOutline} /></div>
              <h2 style={{ fontSize: '18px', fontWeight: 800, color: '#1e293b', marginBottom: '8px' }}>Deactivate {selectedHealer.name}?</h2>
              <p style={{ fontSize: '13px', color: '#64748b', marginBottom: '24px', lineHeight: 1.6 }}>This will disable login access and remove the healer from the active roster. Active patient caseloads must be reassigned first.</p>
              <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
                <button className="sa-btn sa-btn--outline" onClick={() => setShowDeactivateModal(false)}>Cancel</button>
                <button className="sa-btn sa-btn--primary" onClick={() => handleDeactivateHealer(selectedHealer.id)} style={{ background: '#ef4444' }}>Confirm Deactivation</button>
              </div>
            </div>
          </div>
        )}

        {/* Reset Password Modal */}
        {showResetPasswordModal && selectedHealer && (
          <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 99999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px' }}>
            <div style={{ background: '#fff', borderRadius: '16px', padding: '32px', maxWidth: '450px', width: '100%', textAlign: 'center' }}>
              <div style={{ fontSize: '48px', color: '#f59e0b', marginBottom: '16px' }}><IonIcon icon={keyOutline} /></div>
              <h2 style={{ fontSize: '18px', fontWeight: 800, color: '#1e293b', marginBottom: '8px' }}>Reset Password for {selectedHealer.name}?</h2>
              <p style={{ fontSize: '13px', color: '#64748b', marginBottom: '24px', lineHeight: 1.6 }}>A new temporary password will be generated and dispatched via SMS and Email to the healer.</p>
              <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
                <button className="sa-btn sa-btn--outline" onClick={() => setShowResetPasswordModal(false)}>Cancel</button>
                <button className="sa-btn sa-btn--primary" onClick={() => handleResetPassword(selectedHealer.id)}>Reset & Dispatch</button>
              </div>
            </div>
          </div>
        )}

        {/* Edit Healer Modal */}
        {showEditModal && editForm && (
          <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 99999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px' }}>
            <div style={{ background: '#fff', borderRadius: '16px', padding: '32px', maxWidth: '600px', width: '100%', maxHeight: '85vh', overflowY: 'auto' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                <h2 style={{ fontSize: '18px', fontWeight: 800, color: '#1e293b', margin: 0 }}>Edit Healer: {editForm.name}</h2>
                <button onClick={() => setShowEditModal(false)} style={{ background: 'transparent', border: 'none', cursor: 'pointer', fontSize: '20px', color: '#94a3b8', padding: 0 }}>
                  <IonIcon icon={closeOutline} />
                </button>
              </div>
              <form onSubmit={handleEditHealerSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <div>
                    <label style={{ fontSize: '12px', fontWeight: 700, color: '#475569', display: 'block', marginBottom: '6px' }}>Email *</label>
                    <input type="email" value={editForm.email} onChange={e => setEditForm({ ...editForm, email: e.target.value })} style={{ width: '100%', padding: '8px 12px', border: '1px solid #cbd5e1', borderRadius: '8px', fontSize: '13px' }} />
                  </div>
                  <div>
                    <label style={{ fontSize: '12px', fontWeight: 700, color: '#475569', display: 'block', marginBottom: '6px' }}>Phone *</label>
                    <input type="text" value={editForm.phone} onChange={e => setEditForm({ ...editForm, phone: e.target.value })} style={{ width: '100%', padding: '8px 12px', border: '1px solid #cbd5e1', borderRadius: '8px', fontSize: '13px' }} />
                  </div>
                </div>
                <div>
                  <label style={{ fontSize: '12px', fontWeight: 700, color: '#475569', display: 'block', marginBottom: '6px' }}>Address *</label>
                  <input type="text" value={editForm.address} onChange={e => setEditForm({ ...editForm, address: e.target.value })} style={{ width: '100%', padding: '8px 12px', border: '1px solid #cbd5e1', borderRadius: '8px', fontSize: '13px' }} />
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <div>
                    <label style={{ fontSize: '12px', fontWeight: 700, color: '#475569', display: 'block', marginBottom: '6px' }}>Certification</label>
                    <select value={editForm.certificationLevel} onChange={e => setEditForm({ ...editForm, certificationLevel: e.target.value })} style={{ width: '100%', padding: '8px 12px', border: '1px solid #cbd5e1', borderRadius: '8px', fontSize: '13px' }}>
                      {CERTIFICATIONS.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>
                  <div>
                    <label style={{ fontSize: '12px', fontWeight: 700, color: '#475569', display: 'block', marginBottom: '6px' }}>Experience (yrs)</label>
                    <input type="number" value={editForm.experience} onChange={e => setEditForm({ ...editForm, experience: Number(e.target.value) })} style={{ width: '100%', padding: '8px 12px', border: '1px solid #cbd5e1', borderRadius: '8px', fontSize: '13px' }} />
                  </div>
                </div>
                <div>
                  <label style={{ fontSize: '12px', fontWeight: 700, color: '#475569', display: 'block', marginBottom: '6px' }}>Specializations</label>
                  <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                    {specializations.map(s => (
                      <label key={s} style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '12px', color: '#475569', cursor: 'pointer' }}>
                        <input
                          type="checkbox"
                          checked={editForm.specialization.includes(s)}
                          onChange={() => {
                            const specs = editForm.specialization.includes(s)
                              ? editForm.specialization.filter(x => x !== s)
                              : [...editForm.specialization, s];
                            setEditForm({ ...editForm, specialization: specs });
                          }}
                        />
                        {s}
                      </label>
                    ))}
                  </div>
                </div>
                <div>
                  <label style={{ fontSize: '12px', fontWeight: 700, color: '#475569', display: 'block', marginBottom: '6px' }}>Bio</label>
                  <textarea value={editForm.bio || ''} onChange={e => setEditForm({ ...editForm, bio: e.target.value })} style={{ width: '100%', padding: '8px 12px', border: '1px solid #cbd5e1', borderRadius: '8px', fontSize: '13px', minHeight: '80px', resize: 'vertical' }} />
                </div>
                <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end', marginTop: '8px' }}>
                  <button type="button" className="sa-btn sa-btn--outline" onClick={() => setShowEditModal(false)}>Cancel</button>
                  <button type="submit" className="sa-btn sa-btn--primary">Save Changes</button>
                </div>
              </form>
            </div>
          </div>
        )}

      {/* ── Themed Delete Confirmation Modal ──────────────────────────────── */}
      {healerToDelete && (
        <div style={{
          position: 'fixed', inset: 0, zIndex: 9999,
          background: 'rgba(15, 23, 42, 0.6)',
          backdropFilter: 'blur(4px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          animation: 'fadeIn 0.2s ease'
        }}>
          <div style={{
            background: 'white',
            borderRadius: '20px',
            width: '90%',
            maxWidth: '420px',
            boxShadow: '0 20px 60px rgba(0,0,0,0.25)',
            overflow: 'hidden',
            animation: 'slideUp 0.25s cubic-bezier(0.34,1.56,0.64,1)'
          }}>
            {/* Header */}
            <div style={{
              background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
              padding: '24px',
              textAlign: 'center'
            }}>
              <div style={{
                width: '60px', height: '60px',
                background: 'rgba(255,255,255,0.2)',
                borderRadius: '50%',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                margin: '0 auto 12px',
                fontSize: '28px'
              }}>
                <IonIcon icon={trashOutline} style={{ color: 'white' }} />
              </div>
              <h2 style={{ margin: 0, color: 'white', fontSize: '20px', fontWeight: 700 }}>Delete Healer</h2>
              <p style={{ margin: '6px 0 0', color: 'rgba(255,255,255,0.85)', fontSize: '13px' }}>This action cannot be undone</p>
            </div>

            {/* Body */}
            <div style={{ padding: '24px', textAlign: 'center' }}>
              <p style={{ margin: '0 0 6px', fontSize: '15px', color: '#334155', fontWeight: 600 }}>
                Are you sure you want to permanently remove
              </p>
              <p style={{ margin: '0 0 16px', fontSize: '17px', fontWeight: 800, color: '#1e293b' }}>
                "{healerToDelete.name}"?
              </p>
              <div style={{
                background: '#fef2f2',
                border: '1px solid #fecaca',
                borderRadius: '10px',
                padding: '12px 16px',
                display: 'flex',
                alignItems: 'flex-start',
                gap: '10px',
                textAlign: 'left'
              }}>
                <IonIcon icon={alertCircleOutline} style={{ color: '#ef4444', fontSize: '18px', flexShrink: 0, marginTop: '1px' }} />
                <p style={{ margin: 0, fontSize: '13px', color: '#991b1b', lineHeight: 1.5 }}>
                  This will permanently delete the healer's profile, session records, and all associated data from the system.
                </p>
              </div>
            </div>

            {/* Footer */}
            <div style={{
              padding: '16px 24px',
              borderTop: '1px solid #f1f5f9',
              display: 'flex',
              gap: '12px',
              background: '#fafbfc',
              borderRadius: '0 0 20px 20px'
            }}>
              <button
                disabled={isDeleting}
                onClick={() => setHealerToDelete(null)}
                style={{
                  flex: 1,
                  padding: '11px 0',
                  border: '1.5px solid #e2e8f0',
                  borderRadius: '10px',
                  background: 'white',
                  color: '#64748b',
                  fontSize: '14px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  transition: 'all 0.15s ease'
                }}
                onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.borderColor = '#94a3b8'; (e.currentTarget as HTMLButtonElement).style.color = '#334155'; }}
                onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.borderColor = '#e2e8f0'; (e.currentTarget as HTMLButtonElement).style.color = '#64748b'; }}
              >
                Cancel
              </button>
              <button
                disabled={isDeleting}
                onClick={handleConfirmDelete}
                style={{
                  flex: 1,
                  padding: '11px 0',
                  border: 'none',
                  borderRadius: '10px',
                  background: isDeleting
                    ? '#fca5a5'
                    : 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
                  color: 'white',
                  fontSize: '14px',
                  fontWeight: 700,
                  cursor: isDeleting ? 'not-allowed' : 'pointer',
                  boxShadow: isDeleting ? 'none' : '0 4px 12px rgba(239,68,68,0.4)',
                  transition: 'all 0.15s ease',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px'
                }}
              >
                {isDeleting ? (
                  <>
                    <span style={{ width: '14px', height: '14px', border: '2px solid rgba(255,255,255,0.4)', borderTopColor: 'white', borderRadius: '50%', display: 'inline-block', animation: 'spin 0.7s linear infinite' }} />
                    Deleting…
                  </>
                ) : (
                  <>
                    <IonIcon icon={trashOutline} />
                    Yes, Delete
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      </IonContent>
    </IonPage>
  );
};

export default HealersPage;
