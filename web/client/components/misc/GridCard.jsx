/**
 * Copyright 2016, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

const React = require('react');
const {Glyphicon, Button, Tooltip, OverlayTrigger} = require('react-bootstrap');

require('./style/gridcard.css');

const GridCard = React.createClass({
    propTypes: {
        style: React.PropTypes.object,
        className: React.PropTypes.string,
        header: React.PropTypes.node,
        actions: React.PropTypes.array
    },
    getDefaultProps() {
        return {
            actions: [],
            header: ""
        };
    },
    renderActions() {
        return (<div className="gridcard-tools">
            {this.props.actions.map((action, index) => {
                let tooltip = <Tooltip id="tooltip">{action.tooltip}</Tooltip>;
                return (<OverlayTrigger key={"gridcard-tool" + index} placement="bottom" overlay={tooltip}>
                    <Button key={"gridcard-tool" + index} onClick={action.onClick} className="gridcard-button" bsStyle="primary">
                        <Glyphicon glyph={action.glyph} />
                    </Button>
                    </OverlayTrigger>);
            })}
        </div>);
    },
    render: function() {
        return (<div
               style={this.props.style}
               className={"gridcard" + (this.props.className ? " " + this.props.className : "")}>
               <div className="gridcard-title bg-primary">{this.props.header}</div>
               {this.props.children}
               {this.renderActions()}
           </div>
        );
    }
});

module.exports = GridCard;
