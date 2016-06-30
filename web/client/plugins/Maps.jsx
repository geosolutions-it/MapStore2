/**
 * Copyright 2016, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

const React = require('react');
const {connect} = require('react-redux');
const MapsGrid = connect((state) => {
    return {
        maps: state.maps && state.maps.results ? state.maps.results : [],
        mapType: state.home.mapType
    };
}, {
})(require('../components/maps/MapGrid'));

const Maps = React.createClass({
    propTypes: {
        mapType: React.PropTypes.string,
        onGoToMap: React.PropTypes.func,
        maps: React.PropTypes.object,
        colProps: React.PropTypes.object
    },
    contextTypes: {
        router: React.PropTypes.object
    },
    getDefaultProps() {
        return {
            mapType: "leaflet",
            onGoToMap: () => {},
            fluid: false,
            colProps: {
                xs: 12,
                sm: 6,
                lg: 3,
                md: 4,
                style: {
                    "marginBottom": "20px"
                }
            },
            maps: {
                results: []
            }
        };
    },
    render() {
        return (<MapsGrid colProps={this.props.colProps} viewerUrl={(map) => {this.context.router.push("/viewer/" + this.props.mapType + "/" + map.id); }} />);
    }
});

module.exports = {
    MapsPlugin: Maps
};
