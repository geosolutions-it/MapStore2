/**
 * Copyright 2016, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
const React = require('react');
const {Input} = require('react-bootstrap');


const {Message} = require('../../../I18N/I18N');

const GdalTranslateTransform = React.createClass({
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

    },
    render() {
        return (<div>
            <Message msgId="importer.transform.options" /><Input type="text" value={this.props.transform.options} />
        </div>);
    }
});
module.exports = GdalTranslateTransform;
