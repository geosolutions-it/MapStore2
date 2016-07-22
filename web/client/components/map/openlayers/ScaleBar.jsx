/**
 * Copyright 2015, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

var React = require('react');
var ol = require('openlayers');

var ScaleBar = React.createClass({
    propTypes: {
        map: React.PropTypes.object,
        className: React.PropTypes.string,
        minWidth: React.PropTypes.number,
        units: React.PropTypes.oneOf(['degrees', 'imperial', 'nautical', 'metric', 'us'])
    },
    getDefaultProps() {
        return {
            map: null,
            className: 'ol-scale-line',
            minWidth: 64,
            units: 'metric'
        };
    },
    componentDidMount() {
        this.scalebar = new ol.control.ScaleLine(this.props);
        if (this.props.map) {
            this.props.map.addControl(this.scalebar);
            let scaleDom = document.getElementsByClassName('ol-scale-line').item(0);
            if (scaleDom) {
                scaleDom.style.backgroundColor = 'rgba(7, 138, 163, 1)';
                scaleDom.style.color = 'white';
                scaleDom.style.borderColor = 'black';
            }
        }
    },
    render() {
        return null;
    }
});

module.exports = ScaleBar;
