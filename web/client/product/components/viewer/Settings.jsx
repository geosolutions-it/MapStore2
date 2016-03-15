/**
 * Copyright 2015, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
var React = require('react');

var {Glyphicon} = require('react-bootstrap');

/**
 * This panel is a sample container for tools that don't
 * are stricly needed direcly on the Map.
 */
let Settings = React.createClass({
    propTypes: {
        isPanel: React.PropTypes.bool,
        buttonTooltip: React.PropTypes.oneOfType([React.PropTypes.string, React.PropTypes.element])
    },
    getDefaultProps() {
        return {
            isPanel: true,
            icon: <Glyphicon glyph="cog"/>
        };
    },
    render() {
        return (<div>
            {this.props.children}
        </div>);

    }
});
module.exports = Settings;
