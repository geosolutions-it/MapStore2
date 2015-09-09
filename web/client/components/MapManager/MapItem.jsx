/**
 * Copyright 2015, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

var React = require('react');
var BootstrapReact = require('react-bootstrap');
var ListGroupItem = BootstrapReact.ListGroupItem;
var Button = BootstrapReact.Button;
var Glyphicon = BootstrapReact.Glyphicon;
var Tooltip = BootstrapReact.Tooltip;
var OverlayTrigger = BootstrapReact.OverlayTrigger;


var MapItem = React.createClass({
    propTypes: {
        id: React.PropTypes.number,
        name: React.PropTypes.oneOfType([React.PropTypes.string, React.PropTypes.element]),
        description: React.PropTypes.oneOfType([React.PropTypes.string, React.PropTypes.element]),
        attributes: React.PropTypes.object,
        viewerUrl: React.PropTypes.string,
        mapType: React.PropTypes.string
    },
    renderButtons: function() {
        if (this.props.viewerUrl) {
            const previewURL = this.props.viewerUrl + "?type=" + this.props.mapType + "&mapId=" + this.props.id;
            const tooltip = <Tooltip>Open map in a new tab</Tooltip>;
            return (<div>
                <OverlayTrigger placement="right" overlay={tooltip}>
                    <Button bsStyle="info" target="_blank" href={previewURL}> <Glyphicon glyph={"new-window"}/>
                    </Button>
                </OverlayTrigger>
                </div>);
        }
        return "";
    },
    render: function() {
        return (
           <ListGroupItem header={this.props.name}>{this.props.description} {this.renderButtons()}</ListGroupItem>
        );
    }
});

module.exports = MapItem;
