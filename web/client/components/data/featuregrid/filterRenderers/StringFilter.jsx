const AttributeFilter = require('./AttributeFilter');
const {compose, withHandlers, defaultProps} = require('recompose');

module.exports = compose(
    defaultProps({
        onValueChange: () => {},
        placeholderMsgId: "featuregrid.filter.placeholders.string"
    }),
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
    })
)(AttributeFilter);
