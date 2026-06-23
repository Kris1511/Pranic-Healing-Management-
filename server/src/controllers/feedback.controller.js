const feedbackRepository = require('../repositories/feedback.repository');

class FeedbackController {
  async createFeedback(req, res) {
    try {
      const feedback = await feedbackRepository.create(req.body);
      res.status(201).json({ success: true, data: feedback });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  async getFeedbacks(req, res) {
    try {
      const feedbacks = await feedbackRepository.findAll(req.query);
      res.status(200).json({ success: true, data: feedbacks });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  }
}

module.exports = new FeedbackController();
