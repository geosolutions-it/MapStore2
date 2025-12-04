var context = require.context('./js', true, /dynamiclegend-test\.jsx]?$/);
context.keys().forEach(context);
module.exports = context;
