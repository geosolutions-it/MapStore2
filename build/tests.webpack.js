var context = require.context('../web', true, /(ArcGISLegend-test\.jsx?)|(-test-chrome\.jsx?)$/);
context.keys().forEach(context);
module.exports = context;
