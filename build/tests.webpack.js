var context = require.context('../web/client/epics/', true, /dashboard-test.js|(-test-chrome\.jsx?)$/);
context.keys().forEach(context);
module.exports = context;
