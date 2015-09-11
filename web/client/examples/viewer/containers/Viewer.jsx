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
var {changeMapView} = require('../../../actions/map');

var VMap = require('../components/Map');
var LangSelector = require('../../../components/LangSelector/LangSelector');
var About = require('../components/About');
var Localized = require('../../../components/I18N/Localized');

var Viewer = React.createClass({
    propTypes: {
        mapConfig: ConfigUtils.PropTypes.config,
        messages: React.PropTypes.object,
        locale: React.PropTypes.string,
        loadLocale: React.PropTypes.func,
        changeMapView: React.PropTypes.func
    },
    renderPlugins(locale) {
        return [
            <LangSelector key="langSelector" currentLocale={locale} onLanguageChange={this.props.loadLocale}/>,
            <About key="about"/>
        ];
    },
    render() {
        if (this.props.mapConfig) {
            let config = this.props.mapConfig;
            if (config.loadingError) {
                return <div className="mapstore-error">{config.loadingError}</div>;
            }

            return (
                <Localized messages={this.props.messages} locale={this.props.locale}>
                    {() =>
                        <div key="viewer" className="fill">
                            <VMap config={config} onMapViewChanges={this.props.changeMapView}/>
                            {this.renderPlugins(this.props.locale)}
                        </div>
                    }
                </Localized>
            );
        }
        return null;
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
