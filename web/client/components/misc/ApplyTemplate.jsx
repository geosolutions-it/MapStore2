/**
 * Copyright 2015, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

const React = require('react');

var ApplyTemplate = React.createClass({
    propTypes: {
        data: React.PropTypes.object,
        template: React.PropTypes.func
    },
    getDefaultProps() {
        return {
            template(data) {
                return data;
            }
        };
    },
    getContent() {
        var childProps = this.props.template(this.props.data);
        var content = null;
        if (this.props.children) {
            content = React.cloneElement(this.props.children, childProps);
        }
        return content;
    },
    render() {
        return (<div>{this.getContent()}</div>);
    }
});

module.exports = ApplyTemplate;
