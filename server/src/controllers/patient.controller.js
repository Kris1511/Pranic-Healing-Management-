const patientService = require('../services/patient.service');
const { sendResponse } = require('../helpers/response.helper');

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
    if (req.user && req.user.role === 'HEALER') {
      const { Healer } = require('../models');
      const healer = await Healer.findOne({ where: { email: req.user.email } });
      if (healer) {
        filter.healerId = healer.id;
      } else {
        return sendResponse(res, 200, 'Patients retrieved successfully', []);
      }
    }

    const patients = await patientService.getAllPatients(filter);
    return sendResponse(res, 200, 'Patients retrieved successfully', patients);
  };

  getById = async (req, res) => {
    const patient = await patientService.getPatientById(req.params.id, req.branchId);
    return sendResponse(res, 200, 'Patient retrieved successfully', patient);
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
