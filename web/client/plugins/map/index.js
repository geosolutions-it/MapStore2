/**
* Copyright 2016, GeoSolutions Sas.
* All rights reserved.
*
* This source code is licensed under the BSD-style license found in the
* LICENSE file in the root directory of this source tree.
*/

const {changeMapView, clickOnMap} = require('../../actions/map');
const {layerLoading, layerLoad} = require('../../actions/layers');
const {changeMousePosition} = require('../../actions/mousePosition');
const {changeMeasurementState} = require('../../actions/measurement');
const {changeLocateState, onLocateError} = require('../../actions/locate');

const {connect} = require('react-redux');
const assign = require('object-assign');

module.exports = (mapType) => {
    const LMap = connect((state) => ({
        mousePosition: state.mousePosition || {enabled: false}
    }), {
        onMapViewChanges: changeMapView,
        onClick: clickOnMap,
        onMouseMove: changeMousePosition,
        onLayerLoading: layerLoading,
        onLayerLoad: layerLoad
    }, (stateProps, dispatchProps, ownProps) => {
        return assign({}, ownProps, stateProps, assign({}, dispatchProps, {
            onMouseMove: stateProps.mousePosition.enabled ? dispatchProps.onMouseMove : () => {}
        }));
    })(require('../../components/map/' + mapType + '/Map'));

    const MeasurementSupport = connect((state) => ({
        measurement: state.measurement || {}
    }), {
        changeMeasurementState
    })(require('../../components/map/' + mapType + '/MeasurementSupport'));

    const Locate = connect((state) => ({
        status: state.locate && state.locate.state
    }), {
        changeLocateState,
        onLocateError
    })(require('../../components/map/' + mapType + '/Locate'));

    require('../../components/map/' + mapType + '/plugins/index');

    return {
        Map: LMap,
        Layer: require('../../components/map/' + mapType + '/Layer'),
        Feature: require('../../components/map/' + mapType + '/Feature'),
        tools: {
            measurement: MeasurementSupport,
            locate: Locate,
            overview: require('../../components/map/' + mapType + '/Overview'),
            scalebar: require('../../components/map/' + mapType + '/ScaleBar')
        }
    };
};
