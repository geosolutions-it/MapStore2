const {compose, withHandlers} = require('recompose');

/**
 * This workaround issues with annotations at 90 degrees lat.
 * This avoid wrong input from user breaks the draw support
 * // TODO: remove this in favor of some more general enhancer or some check inside draw support
 */
module.exports = compose(
    withHandlers({
        onChange: ({ onChange = () => { }, maxLatitude = 89.9997222222, coordinate}) => v =>
            onChange(
                Math.abs(parseFloat(v)) > maxLatitude && coordinate === "lat"
                    ? Math.sign(v) * maxLatitude
                    : v
            )
    })
);
