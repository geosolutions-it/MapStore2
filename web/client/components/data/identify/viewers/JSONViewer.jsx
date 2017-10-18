const PropTypes = require('prop-types');
/**
 * Copyright 2015, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

var React = require('react');
var PropertiesViewer = require('./row/PropertiesViewer');

class JSONViewer extends React.Component {
    static propTypes = {
        response: PropTypes.object,
        layer: PropTypes.object,
        rowViewer: PropTypes.object
    };

    shouldComponentUpdate(nextProps) {
        return nextProps.response !== this.props.response;
    }

    render() {
        const RowViewer = (this.props.layer && this.props.layer.rowViewer) || this.props.rowViewer || PropertiesViewer;
        return (<div className="mapstore-json-viewer">
                {(this.props.response.features || []).map((feature, i) => {
                    return <RowViewer key={i} feature={feature} title={feature.id} exclude={["bbox"]} {...feature.properties}/>;
                })}
            </div>)
        ;
    }
}

module.exports = JSONViewer;
