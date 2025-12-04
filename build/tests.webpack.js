var context = require.context('../web', true, /(DynamicLegend.*-test\.jsx?)$/);
context.keys().forEach(context);
module.exports = context;
