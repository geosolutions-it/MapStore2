const { compose, withHandlers } = require('recompose');

module.exports = compose(
    withHandlers({
        onMapViewChanges: ({ onChange = () => { } }) => map => {
            onChange('map', map);
            onChange('mapStateSource', map.mapStateSource);
        }
    })
);
