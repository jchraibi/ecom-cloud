//File To Perform Administrative Actions On An MbaaS

module.exports = {
  forms: require('./appforms/forms.js'),
  submissions: require('./appforms/submissions.js'),
  themes: require('./appforms/themes.js'),
  formProjects: require('./appforms/projects.js'),
  apps: require('./apps/apps.js'),
  dataSources: require('./appforms/dataSources.js'),
  services: require('./services/services.js'),
  alerts: require('./alerts/alerts.js'),
  notifications: require('./alerts/notifications.js'),
  events: require('./events/events.js'),
  metrics: require('./metrics/metrics'),
  stats: require('./stats/stats.js'),
  environments:{
    "deleteEnv":require('./environment/deleteEnv.js')
  },
  appdata: {
    export: require('./appdata/export'),
    import: require('./appdata/import')
  }
};
