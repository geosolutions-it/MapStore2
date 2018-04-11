
const {compose} = require('recompose');
const { withSearchTextState, withEmptyMapVirtualScroll, searchOnTextChange} = require('./enhancers');
module.exports = compose(
    withSearchTextState,
    withEmptyMapVirtualScroll,
    searchOnTextChange
);
