const AttributeFilter = require('./AttributeFilter');
const {compose, withState, withHandlers, defaultProps} = require('recompose');

module.exports = compose(
    withState("value", "onValueChange", d => {
        return d.value;
    }),
    withHandlers({
        onChange: props => ({value, attribute} = {}) => {
            props.onValueChange(value);
            props.onChange({
                value: value,
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
