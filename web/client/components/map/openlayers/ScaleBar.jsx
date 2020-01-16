/**
 * Copyright 2015, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import PropTypes from 'prop-types';
import React from 'react';
import assign from 'object-assign';
import ScaleLine from 'ol/control/ScaleLine';

export default class ScaleBar extends React.Component {
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
        this.scalebar = new ScaleLine(assign({}, this.props, this.props.container ? {
            target: document.querySelector(this.props.container)
        } : {}));
        if (this.props.map) {
            this.props.map.addControl(this.scalebar);
        }
    }

    componentWillUnmount() {
        if (this.props.container && document.querySelector('.ol-scale-line')) {
            try {
                document.querySelector(this.props.container).removeChild(document.querySelector('.ol-scale-line'));
            } catch (e) {
                // do nothing... probably an old configuration
            }

        }
    }

    render() {
        return null;
    }
}

