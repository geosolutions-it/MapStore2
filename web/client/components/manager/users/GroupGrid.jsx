/**
 * Copyright 2016, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import React from 'react';

import { Grid, Row, Col } from 'react-bootstrap';
import GroupCard from './GroupCard';
import Spinner from 'react-spinkit';
import PropTypes from 'prop-types';
import Message from '../../I18N/Message';
import { getMessageById } from '../../../utils/LocaleUtils';
import SecurityUtils from '../../../utils/SecurityUtils';

class GroupsGrid extends React.Component {
    static propTypes = {
        loadGroups: PropTypes.func,
        onEdit: PropTypes.func,
        onDelete: PropTypes.func,
        myUserId: PropTypes.number,
        fluid: PropTypes.bool,
        groups: PropTypes.array,
        loading: PropTypes.bool,
        bottom: PropTypes.node,
        colProps: PropTypes.object
    };

    static contextTypes = {
        messages: PropTypes.object
    };

    static defaultProps = {
        loadGroups: () => {},
        onEdit: () => {},
        onDelete: () => {},
        fluid: true,
        colProps: {
            xs: 12,
            sm: 6,
            md: 4,
            lg: 3,
            style: {
                "marginBottom": "20px"
            }
        }
    };

    componentDidMount() {
        this.props.loadGroups();
    }

    renderLoading = () => {
        if (this.props.loading) {
            return (<div style={{
                width: "100%",
                height: "100%",
                position: "absolute",
                overflow: "visible",
                margin: "auto",
                verticalAlign: "center",
                left: "0",
                background: "rgba(255, 255, 255, 0.5)",
                zIndex: 2
            }}><div style={{
                    position: "absolute",
                    top: "50%",
                    left: "50%",
                    transform: "translate(-50%, -40%)"
                }}><Message msgId="loading" /><Spinner spinnerName="circle" noFadeIn overrideSpinnerClassName="spinner"/></div></div>);
        }
        return null;
    };

    renderGroups = (groups) => {
        return groups.map((group) => {
            let actions = [{
                onClick: () => {this.props.onEdit(group); },
                glyph: "wrench",
                tooltip: getMessageById(this.context.messages, "usergroups.editGroup")
            }, {
                onClick: () => {this.props.onDelete(group && group.id); },
                glyph: "remove-circle",
                tooltip: getMessageById(this.context.messages, "usergroups.deleteGroup")
            }];
            if ( group && group.groupName === SecurityUtils.USER_GROUP_ALL) {
                actions = [];
            }

            return <Col key={"user-" + group.id} {...this.props.colProps}><GroupCard group={group} actions={actions}/></Col>;
        });
    };

    render() {
        return (
            <Grid style={{position: "relative"}} fluid={this.props.fluid}>
                {this.renderLoading()}
                <Row key="users">
                    {this.renderGroups(this.props.groups || [])}
                </Row>
                {this.props.bottom}
            </Grid>
        );
    }
}

export default GroupsGrid;
