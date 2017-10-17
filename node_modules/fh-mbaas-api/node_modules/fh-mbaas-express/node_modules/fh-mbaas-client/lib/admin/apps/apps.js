module.exports = {
  deploy: require('./deployApp.js'),
  migrateDB: require('./migrateDb.js'),
  checkMigrateDB: require('./checkMigrateDb.js'),
  completeDBMigration: require('./completeDbMigration.js'),
  remove: require('./remove.js'),
  envVars: require('./envVars.js')
};