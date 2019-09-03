var context = require.context('../web/client/components/geostory/', true, /(Paragraph-test\.jsx?)|(-test-chrome\.jsx?)$/);
context.keys().forEach(context);
module.exports = context;
