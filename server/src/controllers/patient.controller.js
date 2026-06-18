const patientService = require('../services/patient.service');
const { sendResponse } = require('../helpers/response.helper');

const mapPatientToResponse = (patient) => {
  if (!patient) return null;
  const sessions = patient.sessions || [];
  let lastVisit = '—';
  if (sessions.length > 0) {
    const dates = sessions
      .map(s => s.sessionDate)
      .filter(Boolean);
    if (dates.length > 0) {
      dates.sort((a, b) => new Date(b) - new Date(a));
      lastVisit = dates[0];
    }
  }

  return {
    // Core identity
    id: patient.id,
    patientId: patient.patientId,
    name: patient.name,
    gender: patient.gender,
    dob: patient.dob,
    age: patient.age,
    bloodGroup: patient.bloodGroup,
    occupation: patient.occupation,

    // Contact
    phone: patient.phone,
    email: patient.email,
    emergencyContact: patient.emergencyContact,
    address: patient.address,

    // Medical
    medicalHistory: patient.medicalHistory,
    treatmentType: patient.treatmentType,

    // Assignment
    branchId: patient.branchId,
    healerId: patient.healerId,

    // Status & auth
    status: patient.status,
    password: patient.password,

    // Document paths
    medicalReport: patient.medicalReport,
    labReport: patient.labReport,
    prescription: patient.prescription,
    idProof: patient.idProof,

    // Computed
    lastVisit,

    // Associations
    branch: patient.branch ? {
      id: patient.branch.id,
      name: patient.branch.name
    } : null,
    healer: patient.healer ? {
      id: patient.healer.id,
      name: patient.healer.name
    } : null
  };
};

class PatientController {
  register = async (req, res) => {
    console.log("Registering patient. Payload received:", req.body);
    if (req.branchId) req.body.branchId = req.branchId;
    const patient = await patientService.registerPatient(req.body);
    console.log("Patient registered successfully. Emergency Contact stored:", patient.emergencyContact);
    return sendResponse(res, 201, 'Patient registered successfully', mapPatientToResponse(patient));
  };

  getAll = async (req, res) => {
    const filter = { ...req.query };
    if (req.branchId) filter.branchId = req.branchId;

    // Restrict patients to only those assigned to the logged-in healer
    if (req.user && String(req.user.role).toUpperCase() === 'HEALER') {
      const { Healer, sequelize } = require('../models');
      const healer = await Healer.findOne({
        where: sequelize.where(
          sequelize.fn('LOWER', sequelize.col('email')),
          req.user.email.toLowerCase()
        )
      });
      if (healer) {
        filter.healerId = healer.id;
      } else {
        return sendResponse(res, 200, 'Patients retrieved successfully', []);
      }
    }

    const patients = await patientService.getAllPatients(filter);
    const mappedPatients = patients.map(mapPatientToResponse);
    return sendResponse(res, 200, 'Patients retrieved successfully', mappedPatients);
  };

  getById = async (req, res) => {
    const patient = await patientService.getPatientById(req.params.id, req.branchId);
    return sendResponse(res, 200, 'Patient retrieved successfully', mapPatientToResponse(patient));
  };

  update = async (req, res) => {
    console.log("Updating patient ID:", req.params.id, "Payload received:", req.body);
    const patient = await patientService.updatePatient(req.params.id, req.body, req.branchId);
    console.log("Patient updated successfully. Emergency Contact stored:", patient.emergencyContact);
    return sendResponse(res, 200, 'Patient updated successfully', mapPatientToResponse(patient));
  };

  delete = async (req, res) => {
    await patientService.deletePatient(req.params.id, req.branchId);
    return sendResponse(res, 200, 'Patient deleted successfully');
  };

  getStats = async (req, res) => {
    const { Patient, Session } = require('../models');
    const { Op } = require('sequelize');

    const branchId = req.branchId || req.query.branchId;
    const whereClause = branchId ? { branchId } : {};

    const activeCases = await Patient.count({
      where: {
        ...whereClause,
        status: {
          [Op.in]: ['active', 'Active']
        }
      }
    });

    const totalRegistered = await Patient.count({
      where: whereClause
    });

    const sessions = await Session.findAll({
      where: whereClause,
      include: [{ association: 'payment' }]
    });

    let pendingBalance = 0;
    for (const session of sessions) {
      const sessionFee = session.sessionFee !== null && session.sessionFee !== undefined
        ? parseFloat(session.sessionFee)
        : (parseFloat(session.totalAmount) || 0);

      const rawStatus = (session.paymentStatus || 'pending').toLowerCase();
      let paidAmount = 0;
      let outstanding = 0;

      if (rawStatus === 'paid') {
        outstanding = 0;
      } else if (rawStatus === 'pending' || rawStatus === 'unpaid') {
        outstanding = sessionFee;
      } else {
        // partial or other status
        paidAmount = session.payment ? parseFloat(session.payment.amount) || 0 : 0;
        outstanding = Math.max(0, sessionFee - paidAmount);
      }
      pendingBalance += outstanding;
    }

    return sendResponse(res, 200, 'Stats retrieved successfully', {
      activeCases,
      totalRegistered,
      pendingBalance: Math.round(pendingBalance * 100) / 100
    });
  };
}

module.exports = new PatientController();
