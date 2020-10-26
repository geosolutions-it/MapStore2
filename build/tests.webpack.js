var context = require.context('../web/client/api/media', true, /(-test\.jsx?)|(-test-chrome\.jsx?)$/);
context.keys().forEach(context);
module.exports = context;
