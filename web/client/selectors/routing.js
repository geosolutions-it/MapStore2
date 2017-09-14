
const {get} = require('lodash');

module.exports = {
    pathnameSelector: (state) => get(state, "routing.location.pathname") || "/"
};
