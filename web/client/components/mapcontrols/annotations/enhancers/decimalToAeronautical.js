
const {compose, withHandlers, withProps} = require('recompose');

const convertDDToDMS = (D, lng) => {
    return {
        degrees: Math.abs(0 | D),
        direction: D < 0 ? lng ? 'W' : 'S' : lng ? 'E' : 'N',
        minutes: Math.abs(0 | D % 1 * 60),
        seconds: Math.abs((0 | D * 60 % 1 * 6000) / 100)
    };
};

module.exports = compose(
    withProps(({
        value,
        coordinate
    }) => {
        return {
            ...convertDDToDMS(value, coordinate === "lon")
        };
    }),
    withHandlers({
        onChange: props => ({degrees, minutes, seconds, direction} = {}) => {
            if (degrees === undefined || minutes === undefined || seconds === undefined) {
                props.onChange(undefined);
            }
            // conversion dmsToDD
            let dd = degrees + minutes / 60 + seconds / (60 * 60);
            if (direction === 'S' || direction === 'W') {
                dd = dd * -1;
            } // Don't do anything for N or E

            props.onChange(dd);
        }
    })
);
