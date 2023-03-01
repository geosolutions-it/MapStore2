import { connect } from 'react-redux';
import { createSelector } from 'reselect';
import { mapTypeSelector } from '../../../selectors/maptype';
import { getMapLibraryFromVisualizationMode } from '../../../utils/MapTypeUtils';
export default connect(
    createSelector(
        (state, props) => {
            // maps inside dashboards and geostories have visualizationMode included in the map config
            if (props?.map?.visualizationMode) {
                return getMapLibraryFromVisualizationMode(props.map.visualizationMode);
            }
            return mapTypeSelector(state);
        },
        (mapType) => ({ mapType })
    )
);
