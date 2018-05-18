
const {compose} = require('recompose');
const { withSearchTextState, withVirtualScroll, searchOnTextChange} = require('./enhancers');
module.exports = compose(
    withSearchTextState,
    withVirtualScroll,
    searchOnTextChange
);
