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
var {getFeatureInfo, changeMapInfoState, purgeMapInfoResults} = require('../../../actions/mapInfo');
var {activatePanel} = require('../actions/floatingPanel');

var {changeLayerProperties} = require('../../../actions/config');

var VMap = require('../components/Map');
var Localized = require('../../../components/I18N/Localized');

var Viewer = React.createClass({
    propTypes: {
        mapConfig: ConfigUtils.PropTypes.config,
        messages: React.PropTypes.object,
        locale: React.PropTypes.string,
        mapInfo: React.PropTypes.object,
        localeError: React.PropTypes.string,
        loadLocale: React.PropTypes.func,
        changeMapView: React.PropTypes.func,
        changeLayerProperties: React.PropTypes.func,
        getFeatureInfo: React.PropTypes.func,
        changeMapInfoState: React.PropTypes.func,
        purgeMapInfoResults: React.PropTypes.func,
        clickOnMap: React.PropTypes.func,
        changeMousePointer: React.PropTypes.func,
        activatePanel: React.PropTypes.func,
        floatingPanel: React.PropTypes.object,
        plugins: React.PropTypes.array
    },
    getFirstWmsVisibleLayer() {
        for (let i = 0; i < this.props.mapConfig.layers.length; i++) {
            if (this.props.mapConfig.layers[i].type === 'wms' && this.props.mapConfig.layers[i].visibility) {
                return this.props.mapConfig.layers[i];
            }
        }
        return null;
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
                                <VMap key="map" config={config} onMapViewChanges={this.manageNewMapView} onClick={this.props.clickOnMap}/>
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
    manageNewMapView(center, zoom, bbox, size) {
        this.props.changeMapView(center, zoom, bbox, size);
    }
});

module.exports = connect((state) => {
    return {
        mapConfig: state.mapConfig,
        messages: state.locale ? state.locale.messages : null,
        locale: state.locale ? state.locale.current : null,
        mapInfo: state.mapInfo ? state.mapInfo : {enabled: false, responses: [], requests: []},
        floatingPanel: state.floatingPanel ? state.floatingPanel : {activeKey: ""},
        localeError: state.locale && state.locale.loadingError ? state.locale.loadingError : undefined
    };
}, dispatch => {
    return bindActionCreators(assign({}, {
        loadLocale: loadLocale.bind(null, '../../translations'),
        changeMapView,
        getFeatureInfo,
        changeMapInfoState,
        purgeMapInfoResults,
        clickOnMap,
        activatePanel,
        changeMousePointer,
        changeLayerProperties
    }), dispatch);
})(Viewer);
