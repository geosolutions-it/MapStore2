var context = require.context('./web/client/components/misc/', true, /(Dialog-test\.jsx?)|(-test-chrome\.jsx?)$/);
context.keys().forEach(context);
module.exports = context;
