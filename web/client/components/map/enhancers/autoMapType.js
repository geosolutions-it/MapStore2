const {connect} = require('react-redux');
const { createSelector } = require('reselect');
const { mapTypeSelector } = require('../../../selectors/maptype');
module.exports = connect(createSelector(mapTypeSelector, mapType => ({mapType})));
