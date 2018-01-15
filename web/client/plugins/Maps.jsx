/*
* Copyright 2017, GeoSolutions Sas.
* All rights reserved.
*
* This source code is licensed under the BSD-style license found in the
* LICENSE file in the root directory of this source tree.
*/
const PropTypes = require('prop-types');
const React = require('react');
const {connect} = require('react-redux');
const {loadMaps, updateMapMetadata, deleteMap, createThumbnail, deleteThumbnail, saveMap, thumbnailError, saveAll, onDisplayMetadataEdit, resetUpdating, metadataChanged} = require('../actions/maps');
const {editMap, updateCurrentMap, errorCurrentMap, removeThumbnail, resetCurrentMap} = require('../actions/currentMap');
const {mapTypeSelector} = require('../selectors/maptype');
const ConfigUtils = require('../utils/ConfigUtils');

const MapsGrid = connect((state) => {
    return {
        bsSize: "small",
        maps: state.maps && state.maps.results ? state.maps.results : [],
        currentMap: state.currentMap,
        loading: state.maps && state.maps.loading,
        mapType: mapTypeSelector(state)
    };
}, {
    loadMaps,
    updateMapMetadata,
    editMap,
    saveMap,
    removeThumbnail,
    onDisplayMetadataEdit,
    resetUpdating,
    saveAll,
    updateCurrentMap,
    errorCurrentMap,
    thumbnailError,
    createThumbnail,
    deleteThumbnail,
    deleteMap,
    resetCurrentMap
})(require('../components/maps/MapGrid'));

const {loadPermissions, updatePermissions, loadAvailableGroups} = require('../actions/maps');
const {updateCurrentMapPermissions, addCurrentMapPermission} = require('../actions/currentMap');
const {setControlProperty} = require('../actions/controls');

const MetadataModal = connect(
    (state = {}) => ({
        metadata: state.maps.metadata,
        availableGroups: state.currentMap && state.currentMap.availableGroups || [ ], // TODO: add message when array is empty
        newGroup: state.controls && state.controls.permissionEditor && state.controls.permissionEditor.newGroup,
        newPermission: state.controls && state.controls.permissionEditor && state.controls.permissionEditor.newPermission || "canRead",
        user: state.security && state.security.user || {name: "Guest"}
    }),
    {
        loadPermissions, loadAvailableGroups, updatePermissions, onGroupsChange: updateCurrentMapPermissions, onAddPermission: addCurrentMapPermission, metadataChanged,
        onNewGroupChoose: setControlProperty.bind(null, 'permissionEditor', 'newGroup'),
        onNewPermissionChoose: setControlProperty.bind(null, 'permissionEditor', 'newPermission')
    }, null, {withRef: true} )(require('../components/maps/modals/MetadataModal'));

const PaginationToolbar = connect((state) => {
    if (!state.maps ) {
        return {};
    }
    let {start, limit, results, loading, totalCount, searchText} = state.maps;
    const total = Math.min(totalCount || 0, limit || 0);
    const page = results && total && Math.ceil(start / total) || 0;
    return {
        page: page,
        pageSize: limit,
        items: results,
        total: totalCount,
        searchText,
        loading
    };
}, {onSelect: loadMaps}, (stateProps, dispatchProps) => {

    return {
        ...stateProps,
        onSelect: (pageNumber) => {
            let start = stateProps.pageSize * pageNumber;
            let limit = stateProps.pageSize;
            dispatchProps.onSelect(ConfigUtils.getDefaults().geoStoreUrl, stateProps.searchText, {start, limit});
        }
    };
})(require('../components/misc/PaginationToolbar'));

class Maps extends React.Component {
    static propTypes = {
        mapType: PropTypes.string,
        onGoToMap: PropTypes.func,
        loadMaps: PropTypes.func,
        maps: PropTypes.object,
        searchText: PropTypes.string,
        mapsOptions: PropTypes.object,
        colProps: PropTypes.object
    };

    static contextTypes = {
        router: PropTypes.object
    };

    static defaultProps = {
        mapType: "leaflet",
        onGoToMap: () => {},
        loadMaps: () => {},
        fluid: false,
        mapsOptions: {start: 0, limit: 12},
        colProps: {
            xs: 12,
            sm: 6,
            lg: 3,
            md: 4,
            style: {
                "marginBottom": "20px"
            }
        },
        maps: {
            results: []
        }
    };

    componentDidMount() {
        // if there is a change in the search text it uses that before the initialMapFilter
        this.props.loadMaps(ConfigUtils.getDefaults().geoStoreUrl, this.props.searchText || ConfigUtils.getDefaults().initialMapFilter || "*", this.props.mapsOptions);
    }

    render() {
        return (<MapsGrid
            colProps={this.props.colProps}
            viewerUrl={(map) => {this.context.router.history.push("/viewer/" + this.props.mapType + "/" + map.id); }}
            bottom={<PaginationToolbar />}
            metadataModal={MetadataModal}
            />);
    }
}

module.exports = {
    MapsPlugin: connect((state) => ({
        mapType: state.maptype && state.maptype.mapType || 'leaflet',
        searchText: state.maps && state.maps.searchText
    }), {
        loadMaps
    })(Maps),
    epics: require('../epics/maptype'),
    reducers: {
        maps: require('../reducers/maps'),
        maptype: require('../reducers/maptype'),
        currentMap: require('../reducers/currentMap')
    }
};
