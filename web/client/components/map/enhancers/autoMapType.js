import { connect } from 'react-redux';
import { createSelector } from 'reselect';
import { getMapLibraryFromVisualizationMode, VisualizationModes } from '../../../utils/MapTypeUtils';
export default connect(
    createSelector(
        (state, props) => props?.map?.visualizationMode,
        (visualizationMode) => ({
            mapType: getMapLibraryFromVisualizationMode(visualizationMode || VisualizationModes._2D)
        })
    )
);
