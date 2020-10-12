var context = require.context('../web', true, /(MapSearch-test\.jsx?)|(MapSearch-test-chrome\.jsx?)$/);
context.keys().forEach(context);
module.exports = context;
