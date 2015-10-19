/**
 * Copyright 2015, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
var React = require('react');
var assign = require('object-assign');

var {connect} = require('react-redux');
var {bindActionCreators} = require('redux');

var ConfigUtils = require('../../../utils/ConfigUtils');

var {loadLocale} = require('../../../actions/locale');

var {changeMapView, clickOnMap, changeMousePointer} = require('../../../actions/map');

var VMap = require('../components/Map');
var Localized = require('../../../components/I18N/Localized');

var Viewer = React.createClass({
    propTypes: {
        mapConfig: ConfigUtils.PropTypes.config,
        browser: React.PropTypes.object,
        messages: React.PropTypes.object,
        locale: React.PropTypes.string,
        mapInfo: React.PropTypes.object,
        mousePosition: React.PropTypes.object,
        mousePositionEnabled: React.PropTypes.bool,
        localeError: React.PropTypes.string,
        loadLocale: React.PropTypes.func,
        changeMapView: React.PropTypes.func,
        changeLayerProperties: React.PropTypes.func,
        getFeatureInfo: React.PropTypes.func,
        changeMapInfoState: React.PropTypes.func,
        changeMousePositionState: React.PropTypes.func,
        changeMousePosition: React.PropTypes.func,
        changeMousePositionCrs: React.PropTypes.func,
        purgeMapInfoResults: React.PropTypes.func,
        clickOnMap: React.PropTypes.func,
        changeMousePointer: React.PropTypes.func,
        activatePanel: React.PropTypes.func,
        floatingPanel: React.PropTypes.object,
        plugins: React.PropTypes.func,
        layerLoading: React.PropTypes.func,
        layerLoad: React.PropTypes.func,
        showSpinner: React.PropTypes.func,
        hideSpinner: React.PropTypes.func
    },
    render() {
        if (this.props.mapConfig) {
            let config = this.props.mapConfig;
            if (config.loadingError) {
                return <div className="mapstore-error">{config.loadingError}</div>;
            }

            return (
                <Localized messages={this.props.messages} locale={this.props.locale} loadingError={this.props.localeError}>
                    {() => {
                        let plugins = this.props.plugins(this.props);
                        if (this.props.mapConfig.plugins) {
                            let mapPlugins = this.props.mapConfig.plugins.map((plugin) => {
                                let props = assign({}, plugin);
                                delete props.type;
                                for (let propName in props) {
                                    if (props.hasOwnProperty(propName)) {
                                        let value = props[propName];
                                        if (value.indexOf('${') === 0) {
                                            value = value.substring(2, value.length - 1);
                                            value = this.props[value];
                                        }
                                    }
                                }
                                return React.createElement(require('../components/' + plugin.type), props);
                            });
                            plugins = plugins.concat(mapPlugins);
                        }
                        return (
                            <div key="viewer" className="fill">
                                <VMap key="map" config={config} onMapViewChanges={this.manageNewMapView}
                                    onClick={this.props.clickOnMap} onMouseMove={this.manageMousePosition}
                                    onLayerLoading={this.props.layerLoading} onLayerLoad={this.props.layerLoad}/>
                                {plugins}
                            </div>
                        );
                    }

                    }
                </Localized>
            );
        }
        return null;
    },
    manageNewMapView(center, zoom, bbox, size, mapStateSource) {
        this.props.changeMapView(center, zoom, bbox, size, mapStateSource);
    },
    manageMousePosition(position) {
        if (this.props.mousePositionEnabled) {
            this.props.changeMousePosition(position);
        }
    }
});

let reorder = (items, order) => {
    if (order && items.length > 0) {
        return order.map((idx) => {
            return items[idx];
        });
    }
    return items;
};

var getLayersByGroup = function(layers, groupsInfo, layersInfo) {
    let i = 0;
    let rootInfo = groupsInfo.root || {};
    let mapLayers = (layers || []).map((layer) => assign({}, layer, {storeIndex: i++}));
    let grps = reorder(mapLayers.reduce((groups, layer) => {
        return groups.indexOf(layer.group) === -1 ? groups.concat([layer.group]) : groups;
    }, []).filter((group) => group !== 'background'), rootInfo.order);

    return grps.map((group) => {
        let groupName = group || 'Default';
        let groupInfo = groupsInfo[groupName] || {};
        return assign({}, {
            name: groupName,
            title: groupName,
            nodes: reorder(mapLayers.filter((layer) => layer.group === group).map((layer) => {
                return assign({}, layer, {expanded: false}, layersInfo[layer.name] || {});
            }), groupInfo.order),
            expanded: true
        }, groupInfo);
    });
};

module.exports = (actions) => {
    return connect((state) => {
        return {
            mapConfig: (state.mapConfig.present && state.mapConfig.present.layers) ? assign({}, state.mapConfig.present, {
                groups: state.layers ? getLayersByGroup(state.mapConfig.present.layers, state.layers.groups || {}, state.layers.layers || {}) : []
            }) : state.mapConfig.present,
            mapHistory: state.mapConfig,
            browser: state.browser,
            messages: state.locale ? state.locale.messages : null,
            locale: state.locale ? state.locale.current : null,
            mapInfo: state.mapInfo ? state.mapInfo : {enabled: false, responses: [], requests: {length: 0}},
            floatingPanel: state.floatingPanel ? state.floatingPanel : {activeKey: ""},
            localeError: state.locale && state.locale.loadingError ? state.locale.loadingError : undefined,
            mousePosition: state.mousePosition ? state.mousePosition.position : null,
            mousePositionCrs: state.mousePosition ? state.mousePosition.crs : null,
            mousePositionEnabled: state.mousePosition ? state.mousePosition.enabled : false
        };
    }, dispatch => {
        return bindActionCreators(assign({}, {
            loadLocale: loadLocale.bind(null, '../../translations'),
            changeMapView,
            clickOnMap,
            changeMousePointer
        }, actions), dispatch);
    })(Viewer);
};
