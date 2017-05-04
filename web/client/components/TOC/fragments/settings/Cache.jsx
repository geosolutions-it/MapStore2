/*
 * Copyright 2017, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

const React = require('react');
const {Checkbox, Form, FormGroup} = require('react-bootstrap');
const Message = require('../../../I18N/Message');

/**
 * Cache Settings for layer
 */
const Cache = React.createClass({
    propTypes: {
        element: React.PropTypes.object,
        onChange: React.PropTypes.func
    },
    getDefaultProps() {
        return {
            element: {},
            onChange: () => {}
        };
    },
    render() {

        return (<Form ref="cache">
        <FormGroup controlId="formCache">
                <Checkbox key="cache" value="tiled"
                    onChange={(e) => this.props.onChange(e.target.checked)} checked={this.props.element && this.props.element.tiled !== undefined ? this.props.element.tiled : true} ><Message msgId="layerProperties.cached"/></Checkbox>
        </FormGroup>

        </Form>);
    }
});

module.exports = Cache;
