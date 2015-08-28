/**
 * Copyright 2015, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
var React = require('react');
var connect = require('react-redux').connect;
var LMap = require('../../../components/leaflet/Map');
var LLayer = require('../../../components/leaflet/Layer');
var ConfigUtils = require('../../../utils/ConfigUtils');
var LangSelector = require('../../../components/LangSelector/LangSelector');
var InfoButton = require('../../../components/InfoButton/InfoButton');
var I18N = require('../../../components/I18N/I18N');
var Localized = require('../../../components/I18N/Localized');
var loadLocale = require('../../../actions/locale').loadLocale;

var Viewer = React.createClass({
    propTypes: {
        mapConfig: React.PropTypes.object,
        messages: React.PropTypes.object,
        locale: React.PropTypes.string,
        dispatch: React.PropTypes.func
    },
    renderLayers(layers) {
        if (layers) {
            return layers.map(function(layer) {
                return <LLayer type={layer.type} key={layer.name} options={layer} />;
            });
        }
        return null;
    },
    renderPlugins(locale) {
        return [
            <div id="langSelContainer" key="langSelContainer">
                <LangSelector currentLocale={locale} onLanguageChange={this.switchLanguage}/>
            </div>,
            <div id="aboutContainer" key="aboutContainer">
                <InfoButton
                    text={<I18N.Message msgId="aboutLbl"/>}
                    title={<I18N.Message msgId="about_title"/>}
                    glyphicon="info-sign"
                    body={
                        <div style={{
                            backgroundImage: 'url("./img/mapstore-logo-0.20.png")',
                            backgroundRepeat: 'no-repeat',
                            backgroundPosition: 'center'
                        }}>
                            <h1>MapStore 2</h1>
                            <p>
                                <I18N.Message msgId="about_p0-0"/> <a href="http://openlayers.org/">OpenLayers 3</a> <I18N.Message msgId="about_p0-1"/> <a href="http://leafletjs.com/">Leaflet</a>.
                            </p>
                            <p><I18N.Message msgId="about_p1"/></p>
                            <ul>
                                <li>
                                    <I18N.Message msgId="about_ul0_li0"/>
                                </li>
                                <li>
                                    <I18N.Message msgId="about_ul0_li1"/> <a href="https://github.com/geosolutions-it/MapStore2/wiki">MapStore wiki</a>.
                                </li>
                            </ul>
                            <h2><I18N.Message msgId="about_h20"/></h2>
                            <p>
                                <I18N.Message msgId="about_p3"/>
                            </p>
                            <p><I18N.Message msgId="about_p5-0"/> <a href="https://github.com/geosolutions-it/MapStore2/blob/master/CONTRIBUTING.md"><I18N.Message msgId="about_a0"/></a> <I18N.Message msgId="about_p5-1"/></p>
                            <h3><I18N.Message msgId="about_h21"/></h3>
                            <p><I18N.Message msgId="about_p6"/></p>
                            <a href="http://www.geo-solutions.it/"><img src="./img/geosolutions-brand.png" style={{display: "block", margin: "auto"}} alt="GeoSolutions S.A.S."></img></a>
                        </div>
                    }/>
            </div>
        ];
    },
    render() {
        if (this.props.mapConfig && this.props.messages) {
            let config = this.props.mapConfig;
            if (config.loadingError) {
                return <div className="error">{config.loadingError}</div>;
            }
            let center = ConfigUtils.getCenter(config.center, config.projection);
            return (
                <Localized messages={this.props.messages} locale={this.props.locale}>
                    {() =>
                        <div key="viewer" className="fill">
                            <LMap id="map" center={center} zoom={config.zoom}>
                                {this.renderLayers(config.layers)}
                            </LMap>
                            {this.renderPlugins(this.props.locale)}
                        </div>
                    }

                </Localized>
            );
        }
        return null;
    },
    switchLanguage(lang) {
        this.props.dispatch(loadLocale('../../translations', lang));
    }
});


require('../../../components/leaflet/plugins/OSMLayer');
require('../../../components/leaflet/plugins/WMSLayer');
require('../../../components/leaflet/plugins/GoogleLayer');
require('../../../components/leaflet/plugins/BingLayer');

module.exports = connect((state) => {
    return {
        mapConfig: state.mapConfig,
        messages: state.locale ? state.locale.messages : null,
        locale: state.locale ? state.locale.current : null
    };
})(Viewer);
