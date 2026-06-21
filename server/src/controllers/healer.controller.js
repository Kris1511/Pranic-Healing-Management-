// const healerService = require('../services/healer.service');
// const { sendResponse } = require('../helpers/response.helper');

// class HealerController {
//   register = async (req, res) => {
//     const healer = await healerService.registerHealer(req.body);
//     return sendResponse(res, 201, 'Healer registered successfully', healer);
//   };

//   getAll = async (req, res) => {
//     const healers = await healerService.getAllHealers(req.query);
//     return sendResponse(res, 200, 'Healers retrieved successfully', healers);
//   };

//   getById = async (req, res) => {
//     const healer = await healerService.getHealerById(req.params.id);
//     return sendResponse(res, 200, 'Healer retrieved successfully', healer);
//   };

//   update = async (req, res) => {
//     const healer = await healerService.updateHealer(req.params.id, req.body);
//     return sendResponse(res, 200, 'Healer updated successfully', healer);
//   };

//   delete = async (req, res) => {
//     await healerService.deleteHealer(req.params.id);
//     return sendResponse(res, 200, 'Healer deleted successfully');
//   };
// }

// module.exports = new HealerController();


const healerService = require('../services/healer.service');
const { sendResponse } = require('../helpers/response.helper');

class HealerController {
  register = async (req, res) => {
    if (req.branchId) req.body.branchId = req.branchId;

    if (req.files) {
      if (req.files.profilePhoto && req.files.profilePhoto[0]) {
        req.body.profilePhoto = `storage/temp/${req.files.profilePhoto[0].filename}`;
      }
      if (req.files.idProof && req.files.idProof[0]) {
        req.body.idProof = `storage/temp/${req.files.idProof[0].filename}`;
      }
      if (req.files.certification && req.files.certification[0]) {
        req.body.certification = `storage/temp/${req.files.certification[0].filename}`;
      }
    }

    const healer = await healerService.registerHealer(req.body);

    return sendResponse(
      res,
      201,
      'Healer registered successfully',
      healer
    );
  };

  getAll = async (req, res) => {
    const filter = { ...req.query };
    if (req.branchId) filter.branchId = req.branchId;

    if (filter.specialty) {
      if (filter.specialty === 'All Specialties' || filter.specialty === '') {
        delete filter.specialty;
      } else {
        filter.specialization = filter.specialty;
        delete filter.specialty;
      }
    }

    if (filter.branchId) {
      if (filter.branchId === 'All Branches' || filter.branchId === '') {
        delete filter.branchId;
      }
    }

    if (filter.status) {
      if (filter.status === 'All Status' || filter.status === '') {
        delete filter.status;
      }
    }

    const healers = await healerService.getAllHealers(filter);

    return sendResponse(
      res,
      200,
      'Healers retrieved successfully',
      healers
    );
  };

  getById = async (req, res) => {
    const healer = await healerService.getHealerById(req.params.id, req.branchId);

    return sendResponse(
      res,
      200,
      'Healer retrieved successfully',
      healer
    );
  };

  update = async (req, res) => {
    if (req.files) {
      if (req.files.profilePhoto && req.files.profilePhoto[0]) {
        req.body.profilePhoto = `storage/temp/${req.files.profilePhoto[0].filename}`;
      }
      if (req.files.idProof && req.files.idProof[0]) {
        req.body.idProof = `storage/temp/${req.files.idProof[0].filename}`;
      }
      if (req.files.certification && req.files.certification[0]) {
        req.body.certification = `storage/temp/${req.files.certification[0].filename}`;
      }
    }

    const healer = await healerService.updateHealer(
      req.params.id,
      req.body,
      req.branchId
    );

    return sendResponse(
      res,
      200,
      'Healer updated successfully',
      healer
    );
  };

  delete = async (req, res) => {
    await healerService.deleteHealer(req.params.id, req.branchId);

    return sendResponse(
      res,
      200,
      'Healer deleted successfully'
    );
  };
}

module.exports = new HealerController();