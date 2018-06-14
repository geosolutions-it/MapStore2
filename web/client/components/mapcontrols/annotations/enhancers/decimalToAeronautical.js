
const {compose, withHandlers, withProps} = require('recompose');


module.exports = compose(
    withProps(({value}) => {
        return {
            degrees: value || 0,
            minutes: 0,
            seconds: 0,
            direction: "N"
        };
    }),
    withHandlers(({onChange = () => {}, degrees, minutes, seconds, direction} = {}) => {
        onChangePart: (dms) => {
            // conversion dmsToDD

            onChange(dd);
        };
    })
);
