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
        titleStyle: PropTypes.object,
        headerStyle: PropTypes.object,
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
        titleStyle: {
            display: "flex"
        },
        headerStyle: {
            flexGrow: 1,
            overflow: "hidden",
            whiteSpace: "nowrap",
            textOverflow: "ellipsis",
            width: 0
        },
        innerItemStyle: {},
        avatarStyle: {
            margin: "10px"
        },
        nameStyle: {
            borderBottom: "1px solid #ddd",
            fontSize: 18,
            fontWeight: "bold",
            overflow: "auto",
            wordWrap: "break-word",
            minHeight: "1.5em"
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
            <div className="group-thumb-description-content">{this.props.group.description ? this.props.group.description : <Message msgId="usergroups.noDescriptionAvailable" />}</div>
        </div>);
    };

    renderName = () => {
        return (<div key="name" style={this.props.nameStyle}>{this.props.group.groupName}</div>);
    };

    renderHeader = () => {
        return <div style={this.props.headerStyle}>{this.props.group.groupName}</div>;
    }

    render() {
        return (
            <GridCard className="group-thumb" style={this.props.style} titleStyle={this.props.titleStyle} header={this.renderHeader()}
                actions={this.props.actions}
            >
                <div className="user-data-container">
                    {this.renderAvatar()}
                    <div className="user-card-info-container">
                        {this.renderName()}
                        {this.renderDescription()}
                    </div>
                </div>
                {this.renderStatus()}
            </GridCard>
        );
    }
}

module.exports = GroupCard;
