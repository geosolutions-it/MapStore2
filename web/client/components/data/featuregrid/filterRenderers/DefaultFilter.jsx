const AttributeFilter = require('./AttributeFilter');
const {compose, withHandlers} = require('recompose');

module.exports = compose(
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
