const sessionService = require('../services/session.service');
const { sendResponse } = require('../helpers/response.helper');

const mapSessionToResponse = (session) => {
  if (!session) return null;
  
  let paymentStatus = session.paymentStatus;
  if (paymentStatus) {
    if (paymentStatus.toLowerCase() === 'paid') paymentStatus = 'Paid';
    else if (paymentStatus.toLowerCase() === 'pending') paymentStatus = 'Pending';
  }
  
  let paymentMethod = session.paymentMethod;
  if (paymentMethod) {
    if (paymentMethod.toUpperCase() === 'UPI') paymentMethod = 'UPI';
    else if (paymentMethod.toLowerCase() === 'cash') paymentMethod = 'Cash';
  }

  let priority = 'None';
  if (session.followupPriority) {
    const p = session.followupPriority.toUpperCase();
    if (p === 'PENDING') priority = 'Pending';
    else if (p === 'URGENT') priority = 'Urgent';
  }

  return {
    id: session.id,
    patient_id: session.patientId,
    healer_id: session.healerId,
    treatment_type: session.treatmentType,
    branch_id: session.branchId,
    session_date: session.sessionDate,
    sessionDate: session.sessionDate, // camelCase compatibility
    start_time: session.startTime,
    end_time: session.endTime,
    notes: session.notes,
    status: session.status,
    total_amount: session.totalAmount,
    session_fee: session.sessionFee,
    created_at: session.createdAt,
    updated_at: session.updatedAt,
    payment_status: paymentStatus,
    payment_method: paymentMethod,
    followup_required: session.followupRequired,
    followup_priority: priority,
    followup_date: session.followupDate,
    patient_name: session.patient_name || (session.patient ? session.patient.name : 'Unknown'),
    healer_name: session.healer_name || (session.healer ? session.healer.name : 'Unknown'),
    branch_name: session.branch_name || (session.branch ? session.branch.name : 'Unknown'),
    patient: session.patient ? {
      id: session.patient.id,
      name: session.patient.name,
      patientId: session.patient.patientId || 'N/A',
      email: session.patient.email,
      phone: session.patient.phone
    } : null,
    healer: session.healer ? {
      id: session.healer.id,
      name: session.healer.name,
      healerId: session.healer.healerId,
      email: session.healer.email
    } : null,
    branch: session.branch ? {
      id: session.branch.id,
      name: session.branch.name
    } : null,
    treatments: session.treatments ? session.treatments.map(t => ({
      id: t.id,
      treatmentName: t.treatmentName,
      cost: t.cost,
      notes: t.notes
    })) : []
  };
};

const mapRequestToSession = (data) => {
  const mapped = {};
  if (data.patient_id !== undefined) mapped.patientId = data.patient_id;
  if (data.healer_id !== undefined) mapped.healerId = data.healer_id;
  if (data.treatment_type !== undefined) mapped.treatmentType = data.treatment_type;
  if (data.branch_id !== undefined) mapped.branchId = data.branch_id;
  if (data.session_date !== undefined) mapped.sessionDate = data.session_date;
  if (data.start_time !== undefined) mapped.startTime = data.start_time;
  if (data.end_time !== undefined) mapped.endTime = data.end_time;
  if (data.notes !== undefined) mapped.notes = data.notes;
  if (data.status !== undefined) mapped.status = data.status;
  if (data.total_amount !== undefined) mapped.totalAmount = data.total_amount;
  if (data.session_fee !== undefined) mapped.sessionFee = data.session_fee;
  
  if (data.payment_status !== undefined) {
    mapped.paymentStatus = data.payment_status ? data.payment_status.toLowerCase() : 'pending';
  }
  if (data.payment_method !== undefined) {
    mapped.paymentMethod = data.payment_method;
  }
  if (data.followup_required !== undefined) mapped.followupRequired = data.followup_required;
  if (data.followup_priority !== undefined) {
    const p = String(data.followup_priority).toUpperCase();
    if (p === 'PENDING') mapped.followupPriority = 'PENDING';
    else if (p === 'URGENT') mapped.followupPriority = 'URGENT';
    else mapped.followupPriority = 'NONE';
  }
  if (data.followup_date !== undefined) mapped.followupDate = data.followup_date || null;
  return mapped;
};

class SessionController {
  create = async (req, res) => {
    const mappedBody = mapRequestToSession(req.body);
    if (req.branchId) mappedBody.branchId = req.branchId;

    // Automatically set healerId if logged-in user is a healer
    if (req.user && String(req.user.role).toUpperCase() === 'HEALER') {
      const { Healer, sequelize } = require('../models');
      const healer = await Healer.findOne({
        where: sequelize.where(
          sequelize.fn('LOWER', sequelize.col('email')),
          req.user.email.toLowerCase()
        )
      });
      if (healer) {
        mappedBody.healerId = healer.id;
      }
    }

    const session = await sessionService.createSession(mappedBody);
    const fullSession = await sessionService.getSessionById(session.id, req.branchId);
    return sendResponse(res, 201, 'Session created successfully', mapSessionToResponse(fullSession));
  };

  getAll = async (req, res) => {
    const filter = {};
    if (req.query.patient_id) filter.patientId = req.query.patient_id;
    if (req.query.healer_id) filter.healerId = req.query.healer_id;
    if (req.branchId) filter.branchId = req.branchId;

    // Restrict sessions to only those assigned to the logged-in healer
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
        return sendResponse(res, 200, 'Sessions retrieved successfully', []);
      }
    }

    // Restrict sessions to only those belonging to the logged-in patient
    if (req.user && String(req.user.role).toUpperCase() === 'PATIENT') {
      const { Patient, sequelize } = require('../models');
      const patient = await Patient.findOne({
        where: sequelize.where(
          sequelize.fn('LOWER', sequelize.col('email')),
          req.user.email.toLowerCase()
        )
      });
      if (patient) {
        filter.patientId = patient.id;
      } else {
        return sendResponse(res, 200, 'Sessions retrieved successfully', []);
      }
    }

    const sessions = await sessionService.getAllSessions(filter);
    const mappedSessions = sessions.map(mapSessionToResponse);
    return sendResponse(res, 200, 'Sessions retrieved successfully', mappedSessions);
  };

  getById = async (req, res) => {
    const session = await sessionService.getSessionById(req.params.id, req.branchId);
    return sendResponse(res, 200, 'Session retrieved successfully', mapSessionToResponse(session));
  };

  update = async (req, res) => {
    const mappedBody = mapRequestToSession(req.body);
    await sessionService.updateSession(req.params.id, mappedBody, req.branchId);
    const fullSession = await sessionService.getSessionById(req.params.id, req.branchId);
    return sendResponse(res, 200, 'Session updated successfully', mapSessionToResponse(fullSession));
  };

  delete = async (req, res) => {
    await sessionService.deleteSession(req.params.id, req.branchId);
    return sendResponse(res, 200, 'Session deleted successfully');
  };
}

module.exports = new SessionController();
