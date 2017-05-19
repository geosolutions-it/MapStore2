var PropTypes = require('prop-types');
/**
 * Copyright 2015, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

var React = require('react');
var ol = require('openlayers');

class ScaleBar extends React.Component {
    static propTypes = {
        map: PropTypes.object,
        className: PropTypes.string,
        minWidth: PropTypes.number,
        units: PropTypes.oneOf(['degrees', 'imperial', 'nautical', 'metric', 'us'])
    };

    static defaultProps = {
        map: null,
        className: 'ol-scale-line',
        minWidth: 64,
        units: 'metric'
    };

    componentDidMount() {
        this.scalebar = new ol.control.ScaleLine(this.props);
        if (this.props.map) {
            this.props.map.addControl(this.scalebar);
        }
    }

    render() {
        return null;
    }
}

module.exports = ScaleBar;
