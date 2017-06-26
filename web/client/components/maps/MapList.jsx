const PropTypes = require('prop-types');
/**
 * Copyright 2015, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

var React = require('react');
var {ListGroup, Panel} = require('react-bootstrap');
var MapItem = require('./MapItem');

class MapList extends React.Component {
    static propTypes = {
        panelProps: PropTypes.object,
        maps: PropTypes.array,
        viewerUrl: PropTypes.oneOfType([PropTypes.string, PropTypes.func]),
        mapType: PropTypes.string
    };

    static defaultProps = {
        onChangeMapType: function() {},
        mapType: 'leaflet',
        maps: []
    };

    renderMaps = (maps, mapType) => {
        const viewerUrl = this.props.viewerUrl;
        return maps.map((map) => {
            let children = React.Children.count(this.props.children);
            return children === 1 ?
                React.cloneElement(React.Children.only(this.props.children), {viewerUrl, key: map.id, mapType, map}) :
                <MapItem viewerUrl={viewerUrl} key={map.id} mapType={mapType} map={map} />;
        });
    };

    render() {
        return (
            <Panel {...this.props.panelProps}>
                <ListGroup>
                    {this.renderMaps(this.props.maps, this.props.mapType)}
                </ListGroup>
            </Panel>
        );
    }
}

module.exports = MapList;
