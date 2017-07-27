
const {connect} = require('react-redux');

const AttributeSelector = require('../../../components/data/featuregrid/AttributeSelector');
const {getCustomizedAttributes} = require('../../../selectors/featuregrid');
const {customizeAttribute} = require('../../../actions/featuregrid');
module.exports = connect((state) => ({
    attributes: getCustomizedAttributes(state)
}), {
    onChange: (name, value) => customizeAttribute(name, "hide", value)
}
)(AttributeSelector);
