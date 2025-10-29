var context = require.context('../web/client/components/manager/ipmanager/__tests__', true, /(-test\.jsx?)|(-test-chrome\.jsx?)$/);
context.keys().forEach(context);
module.exports = context;
