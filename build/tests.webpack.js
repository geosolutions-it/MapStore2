var context = require.context('../web/client/utils/ogc/Filter/CQL', true, /(-test\.jsx?)|(-test-chrome\.jsx?)$/);
context.keys().forEach(context);
module.exports = context;
