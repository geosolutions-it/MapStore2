var PropTypes = require('prop-types');
/**
 * Copyright 2015, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

var React = require('react');
var Legend = require('./legend/Legend');

class WMSLegend extends React.Component {
    static propTypes = {
        node: PropTypes.object,
        showOnlyIfVisible: PropTypes.bool,
        currentZoomLvl: PropTypes.number,
        scales: PropTypes.array
    };

    static defaultProps = {
        showOnlyIfVisible: false
    };

    render() {
        let node = this.props.node || {};
        if (this.canShow(node) && node.type === "wms" && node.group !== "background") {
            return <div style={{marginLeft: "15px"}}><Legend layer={node} currentZoomLvl={this.props.currentZoomLvl} scales={this.props.scales}/></div>;
        }
        return null;
    }

    canShow = (node) => {
        return node.visibility || !this.props.showOnlyIfVisible;
    };
}

module.exports = WMSLegend;
