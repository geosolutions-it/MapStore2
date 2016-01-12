/**
 * Copyright 2015, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

const React = require('react');

const TEXTFeatureInfoViewer = React.createClass({
    propTypes: {
        response: React.PropTypes.string,
        layerMetadata: React.PropTypes.object
    },
    shouldComponentUpdate(nextProps) {
        return nextProps.response !== this.props.response || nextProps.layerMetadata !== this.props.layerMetadata;
    },
    render() {
        return (<pre>{this.props.response}</pre>
        );
    }
});

module.exports = TEXTFeatureInfoViewer;
