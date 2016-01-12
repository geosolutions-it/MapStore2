/**
 * Copyright 2015, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

var React = require('react');


var ApplyTemplate = require('../../../../../components/misc/ApplyTemplate');
var PropertiesViewer = require('../../../../../components/misc/PropertiesViewer');

var JSONFeatureInfoViewr = React.createClass({
    propTypes: {
        response: React.PropTypes.string,
        layerMetadata: React.PropTypes.object
    },
    shouldComponentUpdate(nextProps) {
        return nextProps.response !== this.props.response || nextProps.layerMetadata !== this.props.layerMetadata;
    },
    render() {
        const getFeatureProps = feature => feature.properties;
        const getFormattedContent = (feature, i) => {
            return (
                <ApplyTemplate key={i} data={feature} template={getFeatureProps}>
                    <PropertiesViewer title={feature.id} exclude={["bbox"]}/>
                </ApplyTemplate>
            );
        };
        return (<div>
                {this.props.response.features.map(getFormattedContent)}
            </div>
        );
    }
});

module.exports = JSONFeatureInfoViewr;
