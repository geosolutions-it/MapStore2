import "./expect.customize";
const context = require.context('../web', true, /(-test\.jsx?)|(-test-chrome\.jsx?)$/);
context.keys().forEach(context);
export default context;
