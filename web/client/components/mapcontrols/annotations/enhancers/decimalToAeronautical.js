
const {compose, withHandlers, withProps} = require('recompose');
const {round} = require('lodash');

const convertDDToDMS = (D, lng, {seconds} = {seconds: {decimals: 4}}) => {
    let d = parseInt(D, 10);
    let minFloat = Math.abs((D - d) * 60);
    let m = Math.floor(minFloat);
    let secFloat = (minFloat - m) * 60;
    let s = round(secFloat, seconds.decimals);
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
        coordinate,
        aeronauticalOptions
    }) => {
        return {
            ...convertDDToDMS(value, coordinate === "lon", aeronauticalOptions)
        };
    }),
    withHandlers({
        onChange: props => ({degrees, minutes, seconds, direction} = {}) => {
            let deg = 0;
            let min = 0;
            let sec = 0;
            if (degrees === undefined && minutes === undefined && seconds === undefined) {
                props.onChange(undefined);
            }
            if (!isNaN(degrees)) {
                deg = degrees;
            }
            if (!isNaN(minutes)) {
                min = minutes;
            }
            if (!isNaN(seconds)) {
                sec = seconds;
            }

            // conversion dmsToDD
            let dd = deg + min / 60 + sec / (60 * 60);

            // this change is needed you have 0 as degrees and a negative minutes or seconds i.e direction swapping side is caused by minutes or seconds being negative
            if (dd > 0 && (direction === 'S' || direction === 'W') || dd < 0 && (direction === 'N' || direction === 'E')) {
                dd = dd * -1;
            } // Don't do anything for N or E

            props.onChange(dd.toPrecision(12));
        }
    })
);
