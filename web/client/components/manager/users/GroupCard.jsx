const PropTypes = require('prop-types');
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

class GroupCard extends React.Component {
    static propTypes = {
        // props
        style: PropTypes.object,
        group: PropTypes.object,
        innerItemStyle: PropTypes.object,
        avatarStyle: PropTypes.object,
        nameStyle: PropTypes.object,
        actions: PropTypes.array
    };

    static defaultProps = {
        style: {
            position: "relative",
            backgroundSize: "cover",
            backgroundPosition: "center",
            backgroundRepeat: "repeat-x"
        },
        innerItemStyle: {
            marginTop: "35px",
            marginLeft: "9px"
        },
        avatarStyle: {
            margin: "10px"
        },
        nameStyle: {
            position: "absolute",
            left: "80px",
            top: "30px",
            width: "75%",
            borderBottom: "1px solid #ddd",
            fontSize: 18,
            fontWeight: "bold"
        }
    };

    renderStatus = () => {
        return (<div key="status" className="user-status" style={{position: "absolute", bottom: 0, left: "10px", margin: "10px 10px 0 10px"}}>
            <div><strong><Message msgId="users.statusTitle"/></strong></div>
            {this.props.group.enabled ?
                <Glyphicon glyph="ok-sign"/> :
                <Glyphicon glyph="minus-sign"/>}
        </div>);
    };

    renderAvatar = () => {
        return (<div key="avatar" style={this.props.avatarStyle} ><Button bsStyle="primary" type="button" className="square-button">
            <Glyphicon glyph="1-group" />
        </Button></div>);
    };

    renderDescription = () => {
        return (<div className="group-thumb-description" style={this.props.innerItemStyle}>
            <div><strong><Message msgId="usergroups.description" /></strong></div>
            <div>{this.props.group.description ? this.props.group.description : <Message msgId="usergroups.noDescriptionAvailable" />}</div>
        </div>);
    };

    renderName = () => {
        return (<div key="name" style={this.props.nameStyle}>{this.props.group.groupName}</div>);
    };

    render() {
        return (
            <GridCard className="group-thumb" style={this.props.style} header={this.props.group.groupName}
                actions={this.props.actions}
            >
                <div className="user-data-container">
                    {this.renderAvatar()}
                    {this.renderName()}
                    {this.renderDescription()}
                </div>
                {this.renderStatus()}
            </GridCard>
        );
    }
}

module.exports = GroupCard;
