const AttributeFilter = require('./AttributeFilter');
const {compose, withHandlers, defaultProps} = require('recompose');

module.exports = compose(
    withHandlers({
        onChange: props => ({value, attribute} = {}) => {
            props.onValueChange(value);
            props.onChange({
                value,
                operator: "ilike",
                type: 'string',
                attribute
            });
        }
    }),
    defaultProps({
        placeholderMsgId: "featuregrid.filter.placeholders.string"
    })
)(AttributeFilter);
