
const {get} = require('lodash');

module.exports = {
    pathnameSelector: (state) => get(state, "router.location.pathname") || "/"
};
