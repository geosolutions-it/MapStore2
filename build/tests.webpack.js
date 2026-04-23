var context = require.context('../web', true, /(-test\.jsx?)|(-test-chrome\.jsx?)$/);
// var context = require.context('../web/client/utils/__tests__', false,  /(ProjectionRegistry-test\.js?)$/);
context.keys().forEach(context);
module.exports = context;
