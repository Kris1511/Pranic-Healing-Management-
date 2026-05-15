const patientService = require('../services/patient.service');
const { sendResponse } = require('../helpers/response.helper');

class PatientController {
  register = async (req, res) => {
    const patient = await patientService.registerPatient(req.body);
    return sendResponse(res, 201, 'Patient registered successfully', patient);
  };

  getAll = async (req, res) => {
    const patients = await patientService.getAllPatients(req.query);
    return sendResponse(res, 200, 'Patients retrieved successfully', patients);
  };

  getById = async (req, res) => {
    const patient = await patientService.getPatientById(req.params.id);
    return sendResponse(res, 200, 'Patient retrieved successfully', patient);
  };

  update = async (req, res) => {
    const patient = await patientService.updatePatient(req.params.id, req.body);
    return sendResponse(res, 200, 'Patient updated successfully', patient);
  };

  delete = async (req, res) => {
    await patientService.deletePatient(req.params.id);
    return sendResponse(res, 200, 'Patient deleted successfully');
  };
}

module.exports = new PatientController();
