const {compose, withHandlers, defaultProps} = require('recompose');
const BaseDateTimeFilter = require('./BaseDateTimeFilter');
module.exports = compose(
    defaultProps({
        value: null
    }),
    withHandlers({
        onChange: props => ({value, attribute} = {}) => {
            props.onValueChange(value);
            props.onChange({
                value: {startDate: value},
                operator: "=",
                type: props.type,
                attribute
            });
        }
    }),
    defaultProps({
        placeholderMsgId: "featuregrid.filter.placeholders.date"
    })
)(BaseDateTimeFilter);
