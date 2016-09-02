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
const {toggleControl} = require('../actions/controls');
const {loadMapInfo} = require('../actions/config');
const MetadataModal = require('../components/maps/modals/MetadataModal');
const {createMap, createThumbnail} = require('../actions/maps');
const {mapSelector} = require('../selectors/map');
const {layersSelector} = require('../selectors/layers');
const stateSelector = state => state;

const selector = createSelector(mapSelector, stateSelector, layersSelector, (map, state, layers) => ({
    currentZoomLvl: map && map.zoom,
    show: state.controls && state.controls.saveAs && state.controls.saveAs.enabled,
    mapType: state && state.home && state.home.mapType || "leaflet",
    mapId: map && map.newMapId,
    map,
    layers
}));

const SaveAs = React.createClass({
    propTypes: {
        show: React.PropTypes.bool,
        mapId: React.PropTypes.string,
        onClose: React.PropTypes.func,
        onCreateThumbnail: React.PropTypes.func,
        onSave: React.PropTypes.func,
        onMapSave: React.PropTypes.func,
        loadMapInfo: React.PropTypes.func,
        map: React.PropTypes.object,
        mapType: React.PropTypes.string,
        layers: React.PropTypes.array,
        params: React.PropTypes.object
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
    onEdit: function(map) {
        this.refs.metadataModal.setMapNameValue(map.name);
        this.open();
    },
    render() {
        let map = (this.state && this.state.loading) ? assign({updating: true}, this.props.map) : this.props.map;
        return (
            <MetadataModal ref="metadataModal"
                ref="modal"
                show={this.props.show}
                onHide={this.close}
                onClose={this.close}
                map={map}
                onSave={this.saveMap}/>
            );
    },
    close() {
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
        let thumbComponent = this.refs.modal.refs.thumbnail;
        let metadata = {
            name,
            description
        };
        thumbComponent.getDataUri((data) => {
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
        onClose: toggleControl.bind(null, 'saveAs', false),
        onMapSave: createMap,
        loadMapInfo,
        onCreateThumbnail: createThumbnail
    })(assign(SaveAs, {
        BurgerMenu: {
            name: 'saveAs',
            position: 900,
            text: <Message msgId="saveAs"/>,
        icon: <Glyphicon glyph="floppy-open"/>,
        action: toggleControl.bind(null, 'saveAs', null),
            // display the BurgerMenu button only if the map can be edited
            selector: (state) => {
                let map = (state.map && state.map.present) || (state.map) || (state.config && state.config.map) || null;
                if (map && (map.mapId === null)) {
                    return { };
                }
                return { style: {display: "none"} };
            }
        }
    }))
};
