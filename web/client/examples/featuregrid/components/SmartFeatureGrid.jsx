/**
 * Copyright 2016, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
const React = require('react');

const {connect} = require('react-redux');
const Localized = require('../../../components/I18N/Localized');
const FeatureGrid = require('../../../components/data/featuregrid/FeatureGrid');
const {changeMapView} = require('../../../actions/map');
const {selectFeatures} = require('../../../actions/featuregrid');
const featuregrid = require('../../../reducers/featuregrid');

const {bindActionCreators} = require('redux');

const SmartFeatureGrid = connect((state) => {
    return {
        map: (state.map && state.map) || (state.config && state.config.map),
        features: state.featuregrid.jsonlayer.features || []
    };
}, dispatch => {
    return bindActionCreators({
            selectFeatures: selectFeatures,
            changeMapView: changeMapView
        }, dispatch);
})(FeatureGrid);

module.exports = connect((state) => {
    return {
        messages: state.locale ? state.locale.messages : null,
        locale: state.locale ? state.locale.current : null,
        localeError: state.locale && state.locale.loadingError ? state.locale.loadingError : undefined,
        map: (state.map && state.map) || (state.config && state.config.map),
        featuregrid
    };
})(React.createClass({
    propTypes: {
        messages: React.PropTypes.object,
        locale: React.PropTypes.string,
        localeError: React.PropTypes.string
    },
    render() {
        return (
            <Localized messages={this.props.messages} locale={this.props.locale} loadingError={this.props.localeError}>
                <div style={{
                        height: "300px",
                        width: "98%",
                        maxHeight: "750px",
                        overflowX: "hidden",
                        overflowY: "auto",
                        position: "absolute",
                        top: "calc(100% - 310px)",
                        left: "1%"}}>
                    <SmartFeatureGrid style={{height: "260px", width: "100%"}}/>
                </div>
            </Localized>
        );
    }
}));
