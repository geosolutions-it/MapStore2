const AttributeFilter = require('./AttributeFilter');
const {compose, withHandlers, defaultProps} = require('recompose');

module.exports = compose(
    withHandlers({
        onChange: props => ({value, attribute} = {}) => {
            props.onValueChange(value);
            let operator = "=";
            let newVal;
            if (value.indexOf('>') > -1) { // handle greater then
                newVal = parseInt(value.split('>')[1], 10);
                operator = ">";
            } else if (value.indexOf('<') > -1) { // handle less then
                newVal = parseInt(value.split('<')[1], 10);
                operator = "<";
            } else { // handle normal values
                newVal = parseInt(value, 10);
            }
            props.onChange({
                value: newVal,
                operator,
                type: 'number',
                attribute
            });
        }
    }),
    defaultProps({
        placeholderMsgId: "featuregrid.filter.placeholders.number",
        tooltipId: "featuregrid.filter.tooltips.number"
    })
)(AttributeFilter);
