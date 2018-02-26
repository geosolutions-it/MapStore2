var context = require.context('./web/client/components/misc/quillmodules', true, /(-test\.jsx?)|(-test-chrome\.jsx?)$/);
context.keys().forEach(context);
module.exports = context;
