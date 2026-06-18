/**
 * @desc    Standardized SMS templates
 */
const SMSTemplates = {
  CREDENTIALS: (name, email, password) => 
    `Hello ${name}, welcome to PHMS! Your login is ${email} and temp password is ${password}. Please change it after first login.`,
  
  SESSION_REMINDER: (name, date, branch) => 
    `Reminder: ${name}, you have a session on ${date} at PHMS ${branch}. Please arrive on time.`,
  
  VISITOR_CHECKIN: (name) => 
    `Welcome to PHMS, ${name}. You have successfully checked in.`,
};

module.exports = SMSTemplates;
