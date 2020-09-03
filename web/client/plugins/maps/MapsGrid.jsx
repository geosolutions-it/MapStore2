/*
* Copyright 2018, GeoSolutions Sas.
* All rights reserved.
*
* This source code is licensed under the BSD-style license found in the
* LICENSE file in the root directory of this source tree.
*/

const {compose, branch, withProps} = require('recompose');
const {connect} = require('react-redux');
const {loadMaps, deleteMap, onDisplayMetadataEdit,
    updateAttribute, showDetailsSheet, hideDetailsSheet} = require('../../actions/maps');
const {mapSaved} = require('../../actions/config');
const {editMap, resetCurrentMap} = require('../../actions/currentMap');
const {mapTypeSelector} = require('../../selectors/maptype');
const {showMapDetailsSelector} = require('../../selectors/maps.js');
const {userSelector} = require('../../selectors/security');
const {basicSuccess, basicError} = require('../../utils/NotificationUtils');
const withShareTool = require('../../components/resources/enhancers/withShareTool').default;

const SaveModal = require('../../components/resources/modals/Save');
const handleSave = require('../../components/resources/modals/enhancers/handleSave').default;
const handleSaveModal = require('../../components/resources/modals/enhancers/handleSaveModal').default;
const handleResourceDownload = require('../../components/resources/modals/enhancers/handleResourceDownload');
const MetadataModal = compose(
    handleResourceDownload,
    branch(
        ({ resource }) => resource && resource.id,
        compose(
            handleSave,
            handleSaveModal
        )
    )
)(SaveModal);

const MapsGrid = connect((state) => {
    return {
        bsSize: "small",
        currentMap: state.currentMap,
        showMapDetails: showMapDetailsSelector(state),
        loading: state.maps && state.maps.loading,
        mapType: mapTypeSelector(state),
        user: userSelector(state)
    };
}, dispatch => {
    return {
        loadMaps: (...params) => dispatch(loadMaps(...params)),
        editMap: (...params) => dispatch(editMap(...params)),
        onDisplayMetadataEdit: (...params) => dispatch(onDisplayMetadataEdit(...params)),
        deleteMap: (...params) => dispatch(deleteMap(...params)),
        resetCurrentMap: (...params) => dispatch(resetCurrentMap(...params)),
        onUpdateAttribute: (...params) => dispatch(updateAttribute(...params)),
        onSaveSuccess: () => dispatch(basicSuccess({message: 'resources.successSaved'})),
        onSaveError: () => dispatch(basicError({message: 'resource.savingError'})),
        onMapSaved: (...params) => dispatch(mapSaved(...params)),
        onShowDetailsSheet: (...params) => dispatch(showDetailsSheet(...params)),
        onHideDetailsSheet: (...params) => dispatch(hideDetailsSheet(...params))
    };
})(require('../../components/maps/MapGrid'));

module.exports = compose(
    withProps({
        metadataModal: MetadataModal
    }),
    withShareTool
)(MapsGrid);
