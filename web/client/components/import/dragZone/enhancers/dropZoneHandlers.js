
const {compose, withHandlers} = require('recompose');

module.exports = compose(
    withHandlers( () => {
        let dropZone = null;
        return {
            onRef: () => (ref) => (dropZone = ref),
            openFileDialog: () => () => dropZone.open()
        };
    })
);
