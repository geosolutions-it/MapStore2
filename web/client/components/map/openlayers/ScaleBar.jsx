/**
 * Copyright 2015, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

const PropTypes = require('prop-types');
const React = require('react');
const ol = require('openlayers');

const assign = require('object-assign');

class ScaleBar extends React.Component {
    static propTypes = {
        map: PropTypes.object,
        className: PropTypes.string,
        minWidth: PropTypes.number,
        units: PropTypes.oneOf(['degrees', 'imperial', 'nautical', 'metric', 'us']),
        container: PropTypes.string
    };

    static defaultProps = {
        map: null,
        className: 'ol-scale-line',
        minWidth: 64,
        units: 'metric'
    };

    componentDidMount() {
        this.scalebar = new ol.control.ScaleLine(assign({}, this.props, this.props.container ? {
            target: document.querySelector(this.props.container)
        } : {}));
        if (this.props.map) {
            this.props.map.addControl(this.scalebar);
        }
    }

    componentWillUnmount() {
        if (this.props.container && document.querySelector('.ol-scale-line')) {
            document.querySelector(this.props.container).removeChild(document.querySelector('.ol-scale-line'));
        }
    }

    render() {
        return null;
    }
}

module.exports = ScaleBar;
