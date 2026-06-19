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
    id: patient.id,
    name: patient.name,
    patientId: patient.patientId,
    age: patient.age,
    gender: patient.gender,
    phone: patient.phone,
    address: patient.address,
    status: patient.status,
    branchId: patient.branchId,
    healerId: patient.healerId,
    email: patient.email,
    medicalReport: patient.medicalReport,
    labReport: patient.labReport,
    prescription: patient.prescription,
    idProof: patient.idProof,
    lastVisit,
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
    if (req.branchId) req.body.branchId = req.branchId;
    const patient = await patientService.registerPatient(req.body);
    return sendResponse(res, 201, 'Patient registered successfully', patient);
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
    const patient = await patientService.updatePatient(req.params.id, req.body, req.branchId);
    return sendResponse(res, 200, 'Patient updated successfully', patient);
  };

  delete = async (req, res) => {
    await patientService.deletePatient(req.params.id, req.branchId);
    return sendResponse(res, 200, 'Patient deleted successfully');
  };
}

module.exports = new PatientController();
