/**
 * Copyright 2015, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
var React = require('react');

var {Panel} = require('react-bootstrap');
var BackgroundSwitcher = require('../../../components/BackgroundSwitcher/BackgroundSwitcher');
var {Glyphicon, Button, OverlayTrigger, Tooltip} = require('react-bootstrap');
var I18N = require('../../../components/I18N/I18N');
require("./backgroundTool.css");

let MyButton = React.createClass({

    propTypes: {
        layers: React.PropTypes.array,
        propertiesChangeHandler: React.PropTypes.func
    },
    render() {
        var tooltip = <Tooltip><I18N.Message msgId="backgroundSwither.tooltip" /></Tooltip>;
        var button = (<OverlayTrigger placement="right" overlay={tooltip}>
                <Button style={{width: "100%"}}><Glyphicon glyph="globe" /> </Button>
            </OverlayTrigger>);
        return (<Panel header={button} className="background-switcher-panel" collapsible={true}>
            <BackgroundSwitcher key="backgroundSwitcher" layers={this.props.layers} propertiesChangeHandler={this.props.propertiesChangeHandler}/>
        </Panel>);
    }
});
module.exports = MyButton;
