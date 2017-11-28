const PropTypes = require('prop-types');
/*
 * Copyright 2017, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

const React = require('react');
const {connect} = require('react-redux');
const {createSelector, createStructuredSelector} = require('reselect');
const assign = require('object-assign');
const {Glyphicon} = require('react-bootstrap');
const Message = require('../components/I18N/Message');
const {loadMapInfo} = require('../actions/config');
const MetadataModal = require('../components/maps/modals/MetadataModal');
const {createMap, createThumbnail, onDisplayMetadataEdit, metadataChanged} = require('../actions/maps');
const {editMap, updateCurrentMap, errorCurrentMap, resetCurrentMap} = require('../actions/currentMap');
const {mapSelector} = require('../selectors/map');
const {layersSelector, groupsSelector} = require('../selectors/layers');
const {mapOptionsToSaveSelector} = require('../selectors/mapsave');
const {mapTypeSelector} = require('../selectors/maptype');
const {indexOf} = require('lodash');

const MapUtils = require('../utils/MapUtils');

const saveAsStateSelector = createStructuredSelector({
    show: state => state.controls && state.controls.saveAs && state.controls.saveAs.enabled,
    mapType: state => mapTypeSelector(state),
    newMapId: state => state.currentMap && state.currentMap.newMapId,
    user: state => state.security && state.security.user,
    currentMap: state => state.currentMap,
    metadata: state => state.maps.metadata,
    textSearchConfig: state => state.searchconfig && state.searchconfig.textSearchConfig
});

const selector = createSelector(
        mapSelector,
        layersSelector,
        groupsSelector,
        mapOptionsToSaveSelector,
        saveAsStateSelector,
        (map, layers, groups, additionalOptions, saveAsState) => ({
    currentZoomLvl: map && map.zoom,
    map,
    layers,
    groups,
    additionalOptions,
    ...saveAsState
}));

class SaveAs extends React.Component {
    static propTypes = {
        additionalOptions: PropTypes.object,
        show: PropTypes.bool,
        newMapId: PropTypes.number,
        map: PropTypes.object,
        user: PropTypes.object,
        mapType: PropTypes.string,
        layers: PropTypes.array,
        groups: PropTypes.array,
        params: PropTypes.object,
        metadata: PropTypes.object,
        currentMap: PropTypes.object,
        // CALLBACKS
        onClose: PropTypes.func,
        onCreateThumbnail: PropTypes.func,
        onUpdateCurrentMap: PropTypes.func,
        onErrorCurrentMap: PropTypes.func,
        onSave: PropTypes.func,
        editMap: PropTypes.func,
        resetCurrentMap: PropTypes.func,
        metadataChanged: PropTypes.func,
        onMapSave: PropTypes.func,
        loadMapInfo: PropTypes.func,
        textSearchConfig: PropTypes.object
    };

    static contextTypes = {
        router: PropTypes.object
    };

    static defaultProps = {
        additionalOptions: {},
        onMapSave: () => {},
        loadMapInfo: () => {},
        show: false
    };

    state = {
        displayMetadataEdit: false
    };

    componentWillMount() {
        this.onMissingInfo(this.props);
    }

    componentWillReceiveProps(nextProps) {
        this.onMissingInfo(nextProps);
    }

    onMissingInfo = (props) => {
        let map = props.map;
        if (map && props.currentMap.mapId && !this.props.newMapId) {
            this.context.router.history.push("/viewer/" + props.mapType + "/" + props.currentMap.mapId);
            this.props.resetCurrentMap();
        }
    };

    render() {
        let map = this.state && this.state.loading ? assign({updating: true}, this.props.currentMap) : this.props.currentMap;
        return (
            <MetadataModal ref="metadataModal"
                metadataChanged={this.props.metadataChanged}
                metadata={this.props.metadata}
                displayPermissionEditor={false}
                show={this.props.currentMap.displayMetadataEdit}
                onEdit={this.props.editMap}
                onUpdateCurrentMap={this.props.onUpdateCurrentMap}
                onErrorCurrentMap={this.props.onErrorCurrentMap}
                onHide={this.close}
                onClose={this.close}
                map={map}
                onSave={this.saveMap}
            />
        );
    }

    close = () => {
        this.props.onUpdateCurrentMap([], this.props.map && this.props.map.thumbnail);
        this.props.onErrorCurrentMap([], this.props.map && this.props.map.id);
        this.props.onClose();
    };

    // this method creates the content for the Map Resource
    createV2Map = () => {
        return MapUtils.saveMapConfiguration(this.props.map, this.props.layers, this.props.groups, this.props.textSearchConfig, this.props.additionalOptions);
    };

    saveMap = (id, name, description) => {
        this.props.editMap(this.props.map);
        let thumbComponent = this.refs.metadataModal.refs.thumbnail;
        let attributes = {"owner": this.props.user && this.props.user.name || null};
        let metadata = {
            name,
            description,
            attributes
        };
        if (metadata.name !== "") {
            thumbComponent.getThumbnailDataUri( (data) => {
                this.props.onMapSave(metadata, JSON.stringify(this.createV2Map()), {
                    data,
                    category: "THUMBNAIL",
                    name: thumbComponent.generateUUID()
                });
            });
        }
    };
}


module.exports = {
    SaveAsPlugin: connect(selector,
        {
            onClose: () => onDisplayMetadataEdit(false),
            onUpdateCurrentMap: updateCurrentMap,
            onErrorCurrentMap: errorCurrentMap,
            onMapSave: createMap,
            loadMapInfo,
            metadataChanged,
            editMap,
            resetCurrentMap,
            onDisplayMetadataEdit,
            onCreateThumbnail: createThumbnail
        })(assign(SaveAs, {
            BurgerMenu: {
                name: 'saveAs',
                position: 900,
                text: <Message msgId="saveAs"/>,
                icon: <Glyphicon glyph="floppy-open"/>,
                action: editMap.bind(null, {}),
                selector: (state) => {
                    if (state && state.controls && state.controls.saveAs && state.controls.saveAs.allowedRoles) {
                        return indexOf(state.controls.saveAs.allowedRoles, state && state.security && state.security.user && state.security.user.role) !== -1 ? {} : { style: {display: "none"} };
                    }
                    return state && state.security && state.security.user ? {} : { style: {display: "none"} };
                }
            }
        }))
};
