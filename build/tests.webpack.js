var context = require.context('../web/client/components/widgets/enhancers/', true, /(-test\.jsx?)|(-test-chrome\.jsx?)$/);
context.keys().forEach(context);
module.exports = context;
