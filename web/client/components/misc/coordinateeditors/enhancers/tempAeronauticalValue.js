const {compose, withHandlers, withState, withProps} = require('recompose');
// const {isNil} = require('lodash');

module.exports = compose(
    withProps(({ value }) => ({
        isValid: value !== ""
    })),

    withState('initial', 'setInitial', {}),
    withProps(({isValid, initial}) => {
        return isValid ? {} : initial;
    }),
    withHandlers( {
        onChange: (props) => ({degrees, minutes, seconds, direction}) => {
            if (isNaN(degrees) || isNaN(minutes) || isNaN(seconds)) {
                props.setInitial({degrees, minutes, seconds, direction});
                // props.onChange(undefined);
                props.onChange({degrees, minutes, seconds, direction});
            } else {
                props.onChange({degrees, minutes, seconds, direction});
            }
        }
    })

);
