/**
 * Copyright 2016, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

const React = require('react');
const {Grid, Row, Col} = require('react-bootstrap');
const MapCard = require('./MapCard');

var MapGrid = React.createClass({
    propTypes: {
        panelProps: React.PropTypes.object,
        maps: React.PropTypes.array,
        viewerUrl: React.PropTypes.oneOfType([React.PropTypes.string, React.PropTypes.func]),
        mapType: React.PropTypes.string,
        colProps: React.PropTypes.object
    },
    getDefaultProps() {
        return {
            onChangeMapType: function() {},
            mapType: 'leaflet',
            colProps: {
                xs: 12,
                sm: 6,
                style: {
                    "marginBottom": "20px"
                }
            },
            maps: []
        };
    },
    renderMaps: function(maps, mapType) {
        const viewerUrl = this.props.viewerUrl;
        return maps.map((map) => {
            let children = React.Children.count(this.props.children);
            return children === 1 ?
                React.cloneElement(React.Children.only(this.props.children), {viewerUrl, key: map.id, mapType, map}) :
                <Col key={map.id} {...this.props.colProps}><MapCard viewerUrl={viewerUrl} mapType={mapType} map={map} /></Col>;
        });
    },
    render: function() {
        return (
                <Grid fluid><Row>
                    {this.renderMaps(this.props.maps || [], this.props.mapType)}
                </Row></Grid>
        );
    }
});

module.exports = MapGrid;
