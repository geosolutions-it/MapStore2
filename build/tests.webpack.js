var context = require.context('../web/client/components/catalog/editor/__tests__', true, /(-test\.jsx?)|(-test-chrome\.jsx?)$/);
context.keys().forEach(context);
module.exports = context;
