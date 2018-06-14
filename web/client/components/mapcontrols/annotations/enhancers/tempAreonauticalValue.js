const {withStateHandlers} = require('recompose');

module.exports = withStateHandlers( ({directions = ["N", "S"]}) => ({
    degrees: 0,
    minutes: 0,
    seconds: 0,
    direction: directions[0]
}), {
    onChange: () => (old) => (newP) => ({
        ...old,
        ...newP
    })
});
