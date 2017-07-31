const {changePage} = require('../../actions/featuregrid');

module.exports = {
    onPageChange: (page, size) => changePage(page, size)
};
