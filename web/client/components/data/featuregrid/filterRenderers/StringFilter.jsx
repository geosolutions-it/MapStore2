const AttributeFilter = require('./AttributeFilter');
const {compose, withHandlers, defaultProps} = require('recompose');
const {trim} = require('lodash');
module.exports = compose(
    defaultProps({
        onValueChange: () => {},
        placeholderMsgId: "featuregrid.filter.placeholders.string"
    }),
    withHandlers({
        onChange: props => ({value, attribute} = {}) => {
            props.onValueChange(value);
            props.onChange({
                rawValue: value,
                value: trim(value) ? trim(value) : undefined,
                operator: "ilike",
                type: 'string',
                attribute
            });
        }
    })
)(AttributeFilter);
