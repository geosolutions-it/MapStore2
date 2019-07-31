var context = require.context('../web/client/components/misc/enhancers', true, /(withIntersectionObserver-test\.jsx?)|(-test-chrome\.jsx?)$/);
context.keys().forEach(context);
module.exports = context;
