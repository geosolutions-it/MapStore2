/**
 * Copyright 2015, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
var L = require('leaflet');
var React = require('react');
var ScaleBox = require('../../api/ScaleBox');
var ScaleBoxComponent = require('../ScaleBar/ScaleBox');

/*new ScaleBox(null, true, true, 'm')
<ScaleBoxComponent scalebox={this.state.scalebox}/>*/

var LeafletMap = React.createClass({
    propTypes: {
        id: React.PropTypes.string,
        center: React.PropTypes.object,
        zoom: React.PropTypes.number,
        projection: React.PropTypes.string,
        onMapViewChanges: React.PropTypes.func
    },
    getDefaultProps() {
        return {
          id: 'map',
          onMapViewChanges() {}
        };
    },
    getInitialState() {
        return { };
    },
    componentDidMount() {
        var map = L.map(this.props.id).setView([this.props.center.lat, this.props.center.lng],
          this.props.zoom);
        map.on('moveend', () => {
            this.props.onMapViewChanges(map.getCenter(), map.getZoom());
        });

        this.map = map;

        // NOTE: this re-call render function after div creation to have the map initialized.
        this.forceUpdate();

        // include scalebar
        this.includeScalebar(this.map);
    },
    componentWillReceiveProps(newProps) {
        const currentCenter = this.map.getCenter();
        const centerIsUpdate = newProps.center.lat === currentCenter.lat &&
                               newProps.center.lng === currentCenter.lng;

        if (!centerIsUpdate) {
            this.map.setView(newProps.center);
        }
        if (newProps.zoom !== this.map.getZoom()) {
            this.map.setZoom(newProps.zoom);
        }
    },
    componentWillUnmount() {
        this.map.remove();
    },
    render() {
        const map = this.map;
        const children = map ? React.Children.map(this.props.children, child => {
            return child ? React.cloneElement(child, {map: map}) : null;
        }) : null;
        return (
            <div id={this.props.id}>
                {children}
                <div ref="scalebar"/>
            </div>
        );
    },
    includeScalebar(map) {
        React.render(
            <ScaleBoxComponent scalebox={new ScaleBox(map, true, true, 'm')}/>,
            this.refs.scalebar.getDOMNode()
        );
    }
});

module.exports = LeafletMap;
