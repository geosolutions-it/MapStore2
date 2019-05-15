const PropTypes = require('prop-types');
/**
 * Copyright 2019, GeoSolutions Sas.
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

class UserCard extends React.Component {
    static propTypes = {
        // props
        style: PropTypes.object,
        user: PropTypes.object,
        innerItemStyle: PropTypes.object,
        avatarStyle: PropTypes.object,
        nameStyle: PropTypes.object,
        infoContainerStyle: PropTypes.object,
        actions: PropTypes.array
    };

    static defaultProps = {
        style: {
            position: "relative",
            backgroundSize: "cover",
            backgroundPosition: "center",
            backgroundRepeat: "repeat-x"
        },
        innerItemStyle: {"float": "left",
            position: "relative",
            margin: "10px",
            maxHeight: "85px"
        },
        avatarStyle: {"float": "left",
            position: "relative",
            margin: "10px"
        },
        nameStyle: {"float": "bottom",
            position: "relative",
            left: "10px",
            top: "5px",
            borderBottom: "1px solid grey",
            width: "90%"
        },
        infoContainerStyle: {
            width: "100%"
        }
    };

    renderStatus = () => {
        return (<div key="status" className="user-status" style={{position: "absolute", bottom: 0, left: "10px", margin: "10px 10px 0 10px"}}>
           <div><strong><Message msgId="users.statusTitle"/></strong></div>
           {this.props.user.enabled ?
               <Glyphicon glyph="ok-sign"/> :
               <Glyphicon glyph="minus-sign"/>}
       </div>);
    };

    renderGroups = () => {
        return (<div key="groups" className="groups-container" style={this.props.innerItemStyle}><div><strong><Message msgId="users.groupTitle"/></strong></div>
            <div className="groups-list">
                {this.props.user && this.props.user.groups ? this.props.user.groups
                .filter(({ groupName } = {}) => groupName)
                .map(({ id, groupName } = {}) => (<div className="group-item" key={"group-" + id}>{groupName}</div>)) : null}
            </div>
     </div>);
    };

    renderRole = () => {
        return (<div key="role" className="role-containter" style={this.props.innerItemStyle}><div><strong><Message msgId="users.roleTitle"/></strong></div>
            {this.props.user.role}
        </div>);
    };

    renderAvatar = () => {
        return (<div key="avatar" className="avatar-containter" style={this.props.avatarStyle} ><Button bsStyle="primary" type="button" className="square-button">
            <Glyphicon glyph="user" />
            </Button></div>);
    };

    renderName = () => {
        return (<div key="name" style={this.props.nameStyle}><strong><font size="4">{this.props.user.name}</font></strong>
            </div>);
    };

    render() {
        return (
           <GridCard className="user-thumb" style={this.props.style} header={this.props.user.name}
                actions={this.props.actions}
               >
            <div className="user-data-container">
                {this.renderAvatar()}
                <div style={this.props.infoContainerStyle}>
                    {this.renderName()}
                    {this.renderRole()}
                    {this.renderGroups()}
                </div>
                {this.renderStatus()}
            </div>
           </GridCard>
        );
    }
}
// Without div with style=infoContainerStyle Name, Role and Groups are displayed inline
module.exports = UserCard;
