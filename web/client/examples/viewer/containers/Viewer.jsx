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
var {changeMapView, getFeatureInfo, changeMapInfoState, purgeMapInfoResults} = require('../../../actions/map');

var VMap = require('../components/Map');
var LangSelector = require('../../../components/LangSelector/LangSelector');
var About = require('../components/About');
var GetFeatureInfo = require('../components/GetFeatureInfo');
var Localized = require('../../../components/I18N/Localized');

var Viewer = React.createClass({
    propTypes: {
        mapConfig: ConfigUtils.PropTypes.config,
        messages: React.PropTypes.object,
        locale: React.PropTypes.string,
        mapInfo: React.PropTypes.object,
        loadLocale: React.PropTypes.func,
        changeMapView: React.PropTypes.func,
        getFeatureInfo: React.PropTypes.func,
        changeMapInfoState: React.PropTypes.func,
        purgeMapInfoResults: React.PropTypes.func
    },
    getFirstWmsVisibleLayer() {
        for (let i = 0; i < this.props.mapConfig.layers.length; i++) {
            if (this.props.mapConfig.layers[i].type === 'wms' && this.props.mapConfig.layers[i].visibility) {
                return this.props.mapConfig.layers[i];
            }
        }
        return null;
    },
    renderPlugins(locale) {
        return [
            <LangSelector key="langSelector" currentLocale={locale} onLanguageChange={this.props.loadLocale}/>,
            <About key="about"/>,
            <GetFeatureInfo
                key="getFeatureInfo"
                enabled={this.props.mapInfo.enabled}
                htmlResponses={this.props.mapInfo.responses}
                btnIcon="info-sign"
                btnClick={this.manageGetFeatureInfoClick}
                onCloseResult={this.manageCloseResults}
            />
        ];
    },
    render() {
        if (this.props.mapConfig && this.props.messages) {
            let config = this.props.mapConfig;
            if (config.loadingError) {
                return <div className="mapstore-error">{config.loadingError}</div>;
            }

            return (
                <Localized messages={this.props.messages} locale={this.props.locale}>
                    {() =>
                        <div key="viewer" className="fill">
                            <VMap config={config} onMapViewChanges={this.manageNewMapView} onClick={this.manageClickOnMap}/>
                            {this.renderPlugins(this.props.locale)}
                        </div>
                    }
                </Localized>
            );
        }
        return null;
    },
    manageNewMapView(center, zoom, bbox, size) {
        this.props.changeMapView(center, zoom, bbox, size);
    },
    manageClickOnMap(clickPoint) {
        const bboxBounds = this.props.mapConfig.bbox.bounds;
        const layer = this.getFirstWmsVisibleLayer();
        if (this.props.mapInfo && this.props.mapInfo.enabled) {
            const requestConf = {
                layers: layer.name,
                query_layers: layer.name,
                x: clickPoint.x,
                y: clickPoint.y,
                height: this.props.mapConfig.size.height,
                width: this.props.mapConfig.size.width,
                crs: this.props.mapConfig.bbox.crs,
                bbox: bboxBounds.minx + "," +
                      bboxBounds.miny + "," +
                      bboxBounds.maxx + "," +
                      bboxBounds.maxy,
                info_format: "text/html"
            };
            const url = layer.url.replace(/[?].*$/g, '');
            this.props.getFeatureInfo(url, requestConf);
        }
    },
    manageGetFeatureInfoClick(btnEnabled) {
        this.props.changeMapInfoState(!btnEnabled);
    },
    manageCloseResults() {
        this.props.purgeMapInfoResults();
    }
});

module.exports = connect((state) => {
    return {
        mapConfig: state.mapConfig,
        messages: state.locale ? state.locale.messages : null,
        locale: state.locale ? state.locale.current : null,
        mapInfo: state.mapInfo ? state.mapInfo : {enabled: false, responses: [], requests: []}
    };
}, dispatch => {
    return bindActionCreators(assign({}, {
        loadLocale: loadLocale.bind(null, '../../translations'),
        changeMapView,
        getFeatureInfo,
        changeMapInfoState,
        purgeMapInfoResults
    }), dispatch);
})(Viewer);
