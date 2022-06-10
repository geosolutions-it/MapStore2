import { compose, withHandlers } from 'recompose';

export default compose(
    withHandlers({
        onMapViewChanges: ({ onChange = () => { } }) => map => {
            onChange('maps', map);
            onChange('mapStateSource', map.mapStateSource);
        }
    })
);
