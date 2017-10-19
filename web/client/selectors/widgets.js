const {get} = require('lodash');
const defaultTarget = "floating";
module.exports = {
    getFloatingWidgets: (state) => get(state, `widgets.containers[${defaultTarget}].widgets`)
};
