var context = require.context('../web/client/components/share/__tests__', true, /(-test\.jsx?)|(-test-chrome\.jsx?)$/);
context.keys().forEach(context);
module.exports = context;
