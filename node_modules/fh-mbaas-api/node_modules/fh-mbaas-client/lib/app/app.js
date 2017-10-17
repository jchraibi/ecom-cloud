

// Path: <<mbaas url>>/api/app/:domain/:env/:projectid/:appid/(forms/themes/config/submissions)

module.exports = {
  forms: require('./appforms/forms.js'),
  submissions: require('./appforms/submissions.js'),
  themes: require('./appforms/themes.js'),
  events: require('./events.js'),
  message: require('./message.js'),
  formsConfig: require('./appforms/config.js'),
  databaseConnectionString: require('./databaseConnectionString')
};
