/**
 * Copyright 2022, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
import {connect} from "react-redux";
import {mapSelector} from "../../selectors/map";
import {bindActionCreators} from "redux";
import {
    changeDwithinValue,
    changeSpatialFilterValue,
    expandSpatialFilterPanel,
    removeSpatialSelection,
    selectSpatialMethod,
    selectSpatialOperation,
    selectViewportSpatialMethod, showSpatialSelectionDetails,
    zoneChange, zoneGetValues, zoneSearch
} from "../../actions/queryform";
import {changeDrawingStatus} from "../../actions/draw";
import SpatialFilterComponent from "../../components/data/query/SpatialFilter";

const SpatialFilter = connect((state) => {
    return {
        useMapProjection: state.queryform.useMapProjection,
        spatialField: state.queryform.spatialField,
        showDetailsPanel: state.queryform.showDetailsPanel,
        spatialPanelExpanded: state.queryform.spatialPanelExpanded,
        zoom: (mapSelector(state) || {}).zoom,
        projection: (mapSelector(state) || {}).projection
    };
}, dispatch => {
    return {
        actions: bindActionCreators({
            onChangeSpatialFilterValue: changeSpatialFilterValue,
            onExpandSpatialFilterPanel: expandSpatialFilterPanel,
            onSelectSpatialMethod: selectSpatialMethod,
            onSelectViewportSpatialMethod: selectViewportSpatialMethod,
            onSelectSpatialOperation: selectSpatialOperation,
            onChangeDrawingStatus: changeDrawingStatus,
            onRemoveSpatialSelection: removeSpatialSelection,
            onShowSpatialSelectionDetails: showSpatialSelectionDetails,
            onChangeDwithinValue: changeDwithinValue,
            zoneFilter: zoneGetValues,
            zoneSearch,
            zoneChange
        }, dispatch)
    };
})(SpatialFilterComponent);

export default SpatialFilter;
