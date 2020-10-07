var context = require.context('../web/client/epics', true, /(swipe-test\.jsx?)|(-test-chrome\.jsx?)$/);
context.keys().forEach(context);
module.exports = context;
