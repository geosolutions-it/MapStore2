/**
 * Copyright 2016, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
const React = require('react');

const Draggable = require('react-draggable');
const Print = require('../../../plugins/Print');
const Message = require('../../../components/I18N/Message');

const {Panel} = require('react-bootstrap');

const PrintPanel = React.createClass({
    propTypes: {
        open: React.PropTypes.bool,
        map: React.PropTypes.object,
        layers: React.PropTypes.array
    },
    render() {
        return this.props.open ? (
            <Draggable start={{x: 0, y: 0}} handle=".panel-heading, .panel-heading *">
                <div className="print-preview-panel">
                    <Panel header={<Message msgId="print.paneltitle"/>} style={{
                        width: "50%",
                        position: "absolute",
                        top: "50px",
                        left: "50px",
                        zIndex: 100
                    }}>
                    <Print key="printpanel"
                        open={this.props.open}
                        withContainer={false}
                        map={this.props.map}
                        layers={this.props.layers}
                        />
                </Panel>
                </div>
            </Draggable>
        ) : null;
    }
});
module.exports = PrintPanel;
