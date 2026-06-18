const paymentService = require('../services/payment.service');
const { sendResponse } = require('../helpers/response.helper');

/**
 * Map a session row (with optional `.payment` association) into the
 * ledger entry shape the patient portal needs.
 */
const mapSessionToLedgerEntry = (session) => {
  const payment = session.payment || null;

  const sessionFee = session.sessionFee !== null && session.sessionFee !== undefined
    ? parseFloat(session.sessionFee)
    : (parseFloat(session.totalAmount) || 0);

  const rawStatus = (session.paymentStatus || 'pending').toLowerCase();

  let paidAmount = 0;
  let outstanding = 0;
  let payStatus = 'Pending';

  if (rawStatus === 'paid') {
    payStatus = 'Paid';
    paidAmount = sessionFee;
    outstanding = 0;
  } else if (rawStatus === 'pending') {
    payStatus = 'Pending';
    paidAmount = 0;
    outstanding = sessionFee;
  } else if (rawStatus === 'partial') {
    payStatus = 'Partial';
    paidAmount = payment ? parseFloat(payment.amount) || 0 : 0;
    outstanding = Math.max(0, sessionFee - paidAmount);
  } else {
    paidAmount = payment ? parseFloat(payment.amount) || 0 : 0;
    outstanding = Math.max(0, sessionFee - paidAmount);
    payStatus = outstanding === 0 && sessionFee > 0
      ? 'Paid'
      : (paidAmount > 0 ? 'Partial' : 'Pending');
  }

  const healerName = session.healer
    ? (session.healer.name.startsWith('Dr.') ? session.healer.name : `Dr. ${session.healer.name}`)
    : 'Unknown Healer';

  const patientName = session.patient
    ? session.patient.name
    : 'Unknown Patient';

  const patientId = session.patient
    ? session.patient.id
    : session.patientId || null;

  return {
    id:             `INV-${session.id.substring(0, 8).toUpperCase()}`,
    sessionId:      session.id,
    sessionNo:      session.sessionNo || `SES-${session.id.substring(0, 6).toUpperCase()}`,
    sessionDate:    session.sessionDate,
    treatmentType:  session.treatmentType || session.type || 'Pranic Healing',
    startTime:      session.startTime || null,
    endTime:        session.endTime || null,
    healer:         healerName,
    totalBilled:    sessionFee,
    paid:           paidAmount,
    outstanding,
    paymentStatus:  payStatus,
    paymentMethod:  payment ? (payment.paymentMethod || null) : (session.paymentMethod || null),
    paymentDate:    payment ? payment.paymentDate : null,
    sessionStatus:  session.status || 'scheduled',
    patientName,
    patientId,
  };
};

class PaymentController {
  process = async (req, res) => {
    if (req.branchId) req.body.branchId = req.branchId;
    const payment = await paymentService.processPayment(req.body);
    return sendResponse(res, 201, 'Payment processed successfully', payment);
  };

  getAll = async (req, res) => {
    // ─── Patient role: return session-based ledger for the logged-in patient ───
    if (req.user && String(req.user.role).toUpperCase() === 'PATIENT') {
      const { Patient, sequelize } = require('../models');
      const patient = await Patient.findOne({
        where: sequelize.where(
          sequelize.fn('LOWER', sequelize.col('email')),
          req.user.email.toLowerCase()
        ),
      });

      if (!patient) {
        return sendResponse(res, 200, 'Payments retrieved successfully', []);
      }

      const sessions = await paymentService.getSessionsWithPaymentsByPatientId(patient.id);
      const ledger   = sessions.map(mapSessionToLedgerEntry);
      return sendResponse(res, 200, 'Payments retrieved successfully', ledger);
    }

    // ─── Admin / healer roles: return session-based ledger for all patients in the branch ───
    const filter = {};
    if (req.branchId) filter.branchId = req.branchId;
    if (req.query.branchId) filter.branchId = req.query.branchId;
    if (req.query.patientId) filter.patientId = req.query.patientId;
    if (req.query.healerId) filter.healerId = req.query.healerId;

    const sessions = await paymentService.getSessionsWithPayments(filter);
    const ledger = sessions.map(mapSessionToLedgerEntry);
    return sendResponse(res, 200, 'Payments retrieved successfully', ledger);
  };

  getById = async (req, res) => {
    const payment = await paymentService.getPaymentById(req.params.id, req.branchId);
    return sendResponse(res, 200, 'Payment retrieved successfully', payment);
  };
}

module.exports = new PaymentController();
