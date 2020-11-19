import { compose, withHandlers } from 'recompose';

export default compose(
    withHandlers({
        onMapViewChanges: ({ onChange = () => { } }) => map => {
            onChange('map', map);
            onChange('mapStateSource', map.mapStateSource);
        }
    })
);
