var context = require.context('./web', true, /(automapupdate-test\.jsx?)$/);
context.keys().forEach(context);
module.exports = context;
