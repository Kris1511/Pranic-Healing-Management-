const sessionService = require('../services/session.service');
const { sendResponse } = require('../helpers/response.helper');

const mapSessionToResponse = (session) => {
  if (!session) return null;
  
  const fee = parseFloat(session.sessionFee !== null && session.sessionFee !== undefined ? session.sessionFee : (session.totalAmount || 0));
  const paid = session.payment ? parseFloat(session.payment.amount) || 0 : 0;
  let paymentStatus = 'Pending';
  if (session.paymentStatus) {
    paymentStatus = session.paymentStatus.charAt(0).toUpperCase() + session.paymentStatus.slice(1).toLowerCase();
  }
  if (session.payment) {
    if (paid >= fee && fee > 0) {
      paymentStatus = 'Paid';
    } else if (paid > 0 && paid < fee) {
      paymentStatus = 'Partial';
    } else if (paid === 0) {
      paymentStatus = 'Pending';
    }
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
    totalAmount: session.totalAmount, // camelCase compatibility
    session_fee: session.sessionFee,
    sessionFee: session.sessionFee, // camelCase compatibility
    created_at: session.createdAt,
    updated_at: session.updatedAt,
    payment_status: paymentStatus,
    paymentStatus: paymentStatus, // camelCase compatibility
    payment_method: paymentMethod,
    paymentMethod: paymentMethod, // camelCase compatibility
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
    })) : [],
    payment: session.payment ? {
      id: session.payment.id,
      sessionId: session.payment.sessionId,
      amount: session.payment.amount,
      paymentMethod: session.payment.paymentMethod,
      paymentDate: session.payment.paymentDate,
      status: session.payment.status,
      branchId: session.payment.branchId
    } : null
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

    let sessions = await sessionService.getAllSessions(filter);

    if (req.query.paymentStatus) {
      const target = req.query.paymentStatus.toLowerCase();
      sessions = sessions.filter(s => {
        let status = s.paymentStatus ? s.paymentStatus.toLowerCase() : 'pending';
        if (s.payment) {
          const fee = parseFloat(s.sessionFee !== null && s.sessionFee !== undefined ? s.sessionFee : (s.totalAmount || 0));
          const paid = parseFloat(s.payment.amount) || 0;
          if (paid >= fee && fee > 0) {
            status = 'paid';
          } else if (paid > 0 && paid < fee) {
            status = 'partial';
          } else if (paid === 0) {
            status = 'pending';
          }
        }
        return status === target;
      });
    }

    const mappedSessions = sessions.map(mapSessionToResponse);
    return sendResponse(res, 200, 'Sessions retrieved successfully', mappedSessions);
  };

  getDashboardSummary = async (req, res) => {
    const filter = {};
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
        return sendResponse(res, 200, 'Dashboard summary retrieved successfully', {
          totalSessions: 0,
          scheduled: 0,
          completed: 0,
          cancelled: 0
        });
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
        return sendResponse(res, 200, 'Dashboard summary retrieved successfully', {
          totalSessions: 0,
          scheduled: 0,
          completed: 0,
          cancelled: 0
        });
      }
    }

    const summary = await sessionService.getDashboardSummary(filter);
    return sendResponse(res, 200, 'Dashboard summary retrieved successfully', summary);
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
