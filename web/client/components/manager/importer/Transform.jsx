/**
 * Copyright 2016, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
const React = require('react');
const {Panel} = require('react-bootstrap');

// const {DropdownList} = require('react-widgets');
const {Message} = require('../../I18N/I18N');
const transforms = require('./transforms');
const Transform = React.createClass({
    propTypes: {
        transform: React.PropTypes.object,
        updateTransform: React.PropTypes.func
    },
    getDefaultProps() {
        return {
            transform: {},
            updateTransform: () => {}
        };
    },
    renderTransformOptions() {
        if (transforms[this.props.transform.type]) {
            let TransformEl = transforms[this.props.transform.type];
            return <TransformEl transform={this.props.transform} updateTransform={this.props.updateTransform} />;
        }
        return null;
    },
    render() {
        return (
            <Panel header={<Message msgId="importer.transform.panelTitle" msgParams={{id: this.props.transform.id}} />} >
                <h2>{this.props.transform.type}</h2>
                {this.renderTransformOptions()}
            </Panel>
        );
    }
});
module.exports = Transform;
