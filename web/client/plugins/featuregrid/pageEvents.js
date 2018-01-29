const {changePage, moreFeatures} = require('../../actions/featuregrid');

module.exports = {
    onPageChange: (page, size) => changePage(page, size),
    moreFeatures
};
