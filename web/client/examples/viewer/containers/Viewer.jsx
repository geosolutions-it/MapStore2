/**
 * Copyright 2015, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
var React = require('react');
var connect = require('react-redux').connect;
var bindActionCreators = require('redux').bindActionCreators;
var VMap = require('../components/Map');


var LangSelector = require('../../../components/LangSelector/LangSelector');
var ScaleBox = require('../../../api/ScaleBox');
var ScaleBoxComponent = require('../../../components/ScaleBar/ScaleBox');
var About = require('../components/About');
var Localized = require('../../../components/I18N/Localized');
var loadLocale = require('../../../actions/locale').loadLocale;
var changeMapView = require('../../../actions/map').changeMapView;
var assign = require('object-assign');

var Viewer = React.createClass({
    propTypes: {
        mapConfig: React.PropTypes.object,
        messages: React.PropTypes.object,
        locale: React.PropTypes.string,
        loadLocale: React.PropTypes.func,
        changeMapView: React.PropTypes.func
    },
    getInitialState() {
        return {
            scalebox: new ScaleBox(true, true, 'm')
        }
    },
    renderPlugins(locale) {
        return [
            <LangSelector key="langSelector" currentLocale={locale} onLanguageChange={this.props.loadLocale}/>,
            <ScaleBoxComponent scalebox={this.state.scalebox}/>,
            <About key="about"/>
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
                            <VMap config={config} onMapViewChanges={this.manageNewMapView}/>
                            {this.renderPlugins(this.props.locale)}
                        </div>
                    }

                </Localized>
            );
        }
        return null;
    },
    manageNewMapView(center, zoom) {
        const normCenter = {x: center.lng, y: center.lat, crs: "EPSG:4326"};
        this.props.changeMapView(normCenter, zoom);
    }
});

module.exports = connect((state) => {
    return {
        mapConfig: state.mapConfig,
        messages: state.locale ? state.locale.messages : null,
        locale: state.locale ? state.locale.current : null
    };
}, dispatch => {
    return bindActionCreators(assign({}, {
        loadLocale: loadLocale.bind(null, '../../translations'),
        changeMapView
    }), dispatch);
})(Viewer);
