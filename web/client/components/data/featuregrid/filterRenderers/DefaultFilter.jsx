const AttributeFilter = require('./AttributeFilter');
const {compose, withState, withHandlers} = require('recompose');

module.exports = compose(
    withState("value", "onValueChange", d => {
        return d.value;
    }),
    withHandlers({
        onChange: props => ({value, attribute} = {}) => {
            props.onValueChange(value);
            props.onChange({
                value: value,
                operator: "=",
                type: props.type,
                attribute
            });
        }
    }),
)(AttributeFilter);
