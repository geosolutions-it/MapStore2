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
const {createSelector} = require('reselect');
const assign = require('object-assign');
const {Glyphicon} = require('react-bootstrap');
const Message = require('../components/I18N/Message');
const {toggleControl} = require('../actions/controls');
const {loadMapInfo} = require('../actions/config');
const {updateMap} = require('../actions/maps');
const ConfirmModal = require('../components/maps/modals/ConfirmModal');
const ConfigUtils = require('../utils/ConfigUtils');

const {mapSelector} = require('../selectors/map');
const {layersSelector, groupsSelector} = require('../selectors/layers');
const stateSelector = state => state;
const {servicesSelector, selectedServiceSelector} = require('../selectors/catalog');

const MapUtils = require('../utils/MapUtils');

const selector = createSelector(mapSelector, stateSelector, layersSelector, groupsSelector, (map, state, layers, groups) => ({
    currentZoomLvl: map && map.zoom,
    show: state.controls && state.controls.save && state.controls.save.enabled,
    map,
    catalogServices: servicesSelector(state),
    selectedService: selectedServiceSelector(state),
    mapId: map && map.mapId,
    layers,
    textSearchConfig: state.searchconfig && state.searchconfig.textSearchConfig,
    groups
}));

class Save extends React.Component {
    static propTypes = {
        catalogServices: PropTypes.object,
        selectedService: PropTypes.string,
        show: PropTypes.bool,
        mapId: PropTypes.string,
        onClose: PropTypes.func,
        onMapSave: PropTypes.func,
        loadMapInfo: PropTypes.func,
        map: PropTypes.object,
        layers: PropTypes.array,
        groups: PropTypes.array,
        params: PropTypes.object,
        textSearchConfig: PropTypes.object
    };

    static defaultProps = {
        onMapSave: () => {},
        loadMapInfo: () => {},
        show: false
    };

    componentWillMount() {
        this.onMissingInfo(this.props);
    }

    componentWillReceiveProps(nextProps) {
        this.onMissingInfo(nextProps);
    }

    onMissingInfo = (props) => {
        let map = props.map;
        if (map && props.mapId && !map.info) {
            this.props.loadMapInfo(ConfigUtils.getConfigProp("geoStoreUrl") + "extjs/resource/" + props.mapId, props.mapId);
        }
    };

    render() {
        return (<ConfirmModal
            confirmText={<Message msgId="save" />}
            cancelText={<Message msgId="cancel" />}
            titleText={<Message msgId="map.saveTitle" />}
            body={<Message msgId="map.saveText" />}
            show={this.props.show}
            onClose={this.props.onClose}
            onConfirm={this.goForTheUpdate}
            />);
    }

    goForTheUpdate = () => {
        if (this.props.mapId) {
            if (this.props.map && this.props.layers) {
                const catalogServices = {
                    services: this.props.catalogServices,
                    selectedService: this.props.selectedService
                };
                const resultingmap = MapUtils.saveMapConfiguration(this.props.map, this.props.layers, this.props.groups, this.props.textSearchConfig, catalogServices);
                this.props.onMapSave(this.props.mapId, JSON.stringify(resultingmap));
                this.props.onClose();
            }
        }
    };
}

module.exports = {
    SavePlugin: connect(selector,
        {
            onClose: toggleControl.bind(null, 'save', false),
            onMapSave: updateMap,
            loadMapInfo
        })(assign(Save, {
            BurgerMenu: {
                name: 'save',
                position: 900,
                text: <Message msgId="save"/>,
                icon: <Glyphicon glyph="floppy-open"/>,
                action: toggleControl.bind(null, 'save', null),
                // display the BurgerMenu button only if the map can be edited
                selector: (state) => {
                    let map = state.map && state.map.present || state.map || state.config && state.config.map || null;
                    if (map && map.mapId && state && state.security && state.security.user) {
                        if (state.maps && state.maps.results) {
                            let mapId = map.mapId;
                            let currentMap = state.maps.results.filter(item=> item && '' + item.id === mapId);
                            if (currentMap && currentMap.length > 0 && currentMap[0].canEdit) {
                                return { };
                            }
                        }
                        if (map.info && map.info.canEdit) {
                            return { };
                        }
                    }
                    return { style: {display: "none"} };
                }
            }
        }))
};
