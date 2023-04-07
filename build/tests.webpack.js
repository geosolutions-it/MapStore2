var context = require.context('../web/client/utils', true, /(FilterUtils-test\.jsx?)|(-test-chrome\.jsx?)$/);
context.keys().forEach(context);
module.exports = context;
