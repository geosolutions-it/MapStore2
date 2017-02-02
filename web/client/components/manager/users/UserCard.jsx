/**
 * Copyright 2016, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

const React = require('react');
// const Message = require('../I18N/Message');
const GridCard = require('../../misc/GridCard');
const {Button, Glyphicon} = require('react-bootstrap');
const Message = require('../../../components/I18N/Message');


// const ConfirmModal = require('./modals/ConfirmModal');

require('./style/usercard.css');

const UserCard = React.createClass({
    propTypes: {
        // props
        style: React.PropTypes.object,
        user: React.PropTypes.object,
        innerItemStyle: React.PropTypes.object,
        actions: React.PropTypes.array
    },
    getDefaultProps() {
        return {
            style: {
                background: "#F7F4ED",
                position: "relative",
                backgroundSize: "cover",
                backgroundPosition: "center",
                backgroundRepeat: "repeat-x"
            },
            innerItemStyle: {"float": "left", margin: "10px"}
        };
    },
    renderStatus() {
        return (<div key="status" className="user-status" style={{position: "absolute", bottom: 0, left: "10px", margin: "10px 10px 0 10px"}}>
           <div><strong><Message msgId="users.statusTitle"/></strong></div>
           {this.props.user.enabled ?
               <Glyphicon glyph="ok-sign" style={{fontSize: "32px", color: "#4E8C75"}} /> :
               <Glyphicon glyph="minus-sign" style={{fontSize: "32px", color: "#A23F37"}} />}
       </div>);
    },
    renderGroups() {
        return (<div key="groups" style={this.props.innerItemStyle}><div><strong><Message msgId="users.groupTitle"/></strong></div>
    {this.props.user && this.props.user.groups ? this.props.user.groups.map((group)=> (<div key={"group-" + group.id}>{group.groupName}</div>)) : null}
     </div>);
    },
    renderRole() {
        return (<div key="role" style={this.props.innerItemStyle}><div><strong><Message msgId="users.roleTitle"/></strong></div>
            {this.props.user.role}
        </div>);
    },
    renderAvatar() {
        return (<div key="avatar" style={this.props.innerItemStyle} ><Button bsStyle="primary" type="button" className="square-button">
            <Glyphicon glyph="user" />
            </Button></div>);
    },
    render() {
        return (
           <GridCard className="user-thumb" style={this.props.style} header={this.props.user.name}
                actions={this.props.actions}
               >
            {this.renderAvatar()}
            {this.renderRole()}
             {this.renderGroups()}
             {this.renderStatus()}
           </GridCard>
        );
    }
});

module.exports = UserCard;
