
const {compose, withHandlers, withProps} = require('recompose');

const convertDDToDMS = (D, lng) => {
    let d = parseInt(D, 10);
    let minFloat = Math.abs((D - d) * 60);
    let m = Math.floor(minFloat);
    let secFloat = (minFloat - m) * 60;
    let s = Math.round(secFloat);
    d = Math.abs(d);

    if (s === 60) {
        m++;
        s = 0;
    }
    if (m === 60) {
        d++;
        m = 0;
    }

    return {
        degrees: d,
        direction: D < 0 ? lng ? 'W' : 'S' : lng ? 'E' : 'N',
        minutes: m,
        seconds: s
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

            props.onChange(dd.toPrecision(12));
        }
    })
);
