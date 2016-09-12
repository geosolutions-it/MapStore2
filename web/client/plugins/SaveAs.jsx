/**
 * Copyright 2016, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

const React = require('react');
const {connect} = require('react-redux');
const {createSelector} = require('reselect');
const assign = require('object-assign');
const {Glyphicon} = require('react-bootstrap');
const Message = require('../components/I18N/Message');
// const {toggleControl} = require('../actions/controls');
const {loadMapInfo} = require('../actions/config');
const MetadataModal = require('../components/maps/modals/MetadataModal');
const {createMap, createThumbnail, onDisplayMetadataEdit} = require('../actions/maps');
const {editMap, updateCurrentMap, errorCurrentMap} = require('../actions/currentMap');
const {mapSelector} = require('../selectors/map');
const stateSelector = state => state;
const {layersSelector} = require('../selectors/layers');


const selector = createSelector(mapSelector, stateSelector, layersSelector, (map, state, layers) => ({
    currentZoomLvl: map && map.zoom,
    show: state.controls && state.controls.saveAs && state.controls.saveAs.enabled,
    mapType: state && state.home && state.home.mapType || "leaflet",
    mapId: map && map.newMapId,
    map,
    currentMap: state.currentMap,
    layers
}));

const SaveAs = React.createClass({
    propTypes: {
        show: React.PropTypes.bool,
        mapId: React.PropTypes.number,
        map: React.PropTypes.object,
        mapType: React.PropTypes.string,
        layers: React.PropTypes.array,
        params: React.PropTypes.object,
        currentMap: React.PropTypes.object,
        // CALLBACKS
        onClose: React.PropTypes.func,
        onCreateThumbnail: React.PropTypes.func,
        onUpdateCurrentMap: React.PropTypes.func,
        onErrorCurrentMap: React.PropTypes.func,
        onSave: React.PropTypes.func,
        editMap: React.PropTypes.func,
        onMapSave: React.PropTypes.func,
        loadMapInfo: React.PropTypes.func
    },
    contextTypes: {
        router: React.PropTypes.object
    },
    getDefaultProps() {
        return {
            onMapSave: () => {},
            loadMapInfo: () => {},
            show: false
        };
    },
    componentWillMount() {
        this.onMissingInfo(this.props);
    },
    componentWillReceiveProps(nextProps) {
        this.onMissingInfo(nextProps);
    },
    onMissingInfo(props) {
        let map = props.map;
        if (map && props.mapId && !this.props.mapId) {
            this.context.router.push("/viewer/" + props.mapType + "/" + props.mapId);
        }
    },
    getInitialState() {
        return {
            displayMetadataEdit: false
        };
    },
    render() {
        let map = (this.state && this.state.loading) ? assign({updating: true}, this.props.currentMap) : this.props.currentMap;
        return (
            <MetadataModal ref="metadataModal"
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
    },
    close() {
        this.props.onUpdateCurrentMap([], this.props.map && this.props.map.thumbnail);
        this.props.onErrorCurrentMap([], this.props.map && this.props.map.id);
        this.props.onClose();
    },
    createV2Map() {
        let map =
            {
                center: this.props.map.center,
                maxExtent: this.props.map.maxExtent,
                projection: this.props.map.projection,
                units: this.props.map.units,
                zoom: this.props.map.zoom
            };
        let layers = this.props.layers.map((layer) => {
            return {
                format: layer.format,
                group: layer.group,
                source: layer.source,
                name: layer.name,
                opacity: layer.opacity,
                styles: layer.styles,
                title: layer.title,
                transparent: layer.transparent,
                type: layer.type,
                url: layer.url,
                provider: layer.provider,
                visibility: layer.visibility
            };
        });
        // Groups are ignored, as they already are defined in the layers
        let resultingmap = {
            version: 2,
            // layers are defined inside the map object
            map: assign({}, map, {layers})
        };
        return resultingmap;
    },
    saveMap(id, name, description) {
        this.props.editMap(this.props.map);
        let thumbComponent = this.refs.metadataModal.refs.thumbnail;
        let metadata = {
            name,
            description
        };
        thumbComponent.getThumbnailDataUri( (data) => {
            this.props.onMapSave(metadata, JSON.stringify(this.createV2Map()), {
                data,
                category: "THUMBNAIL",
                name: thumbComponent.generateUUID()
            });
        });
    }
});

module.exports = {
    SaveAsPlugin: connect(selector,
    {
        onClose: () => onDisplayMetadataEdit(false),
        onUpdateCurrentMap: updateCurrentMap,
        onErrorCurrentMap: errorCurrentMap,
        onMapSave: createMap,
        loadMapInfo,
        editMap,
        onDisplayMetadataEdit,
        onCreateThumbnail: createThumbnail

    })(assign(SaveAs, {
        BurgerMenu: {
            name: 'saveAs',
            position: 900,
            text: <Message msgId="saveAs"/>,
            icon: <Glyphicon glyph="floppy-open"/>,
            action: editMap.bind(null, {}),
            // display the BurgerMenu button only if the map can be edited
            selector: (state) => {
                let mapId = state.currentMap.mapId;
                if (mapId === null) {
                    return { };
                }
                return { style: {display: "none"} };
            }
        }
    }))
};
