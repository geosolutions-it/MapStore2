const {compose, withHandlers, withState, withProps} = require('recompose');

module.exports = compose(
    withProps(({ value }) => ({
        isValid: value !== ""
    })),

    withState('initial', 'setInitial', {}),
    withProps(({isValid, initial, degrees, minutes, seconds}) => {
        return isValid || ( degrees === "" && minutes === "" && seconds === "") ? {} : initial;
    }),
    withHandlers( {
        onChange: (props) => ({degrees, minutes, seconds, direction}) => {
            if (isNaN(degrees)) {
                props.setInitial({degrees: "", minutes, seconds, direction});
            } else if (isNaN(minutes)) {
                props.setInitial({degrees, minutes: "", seconds, direction});
            } else if (isNaN(seconds)) {
                props.setInitial({degrees, minutes, seconds: "", direction});
            }
            props.onChange({degrees, minutes, seconds, direction});
        }
    })

);
