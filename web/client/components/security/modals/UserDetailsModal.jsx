/*
 * Copyright 2016, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import React from 'react';

import PropTypes from 'prop-types';
import { Grid, Row, Col, Alert, Glyphicon } from 'react-bootstrap';
import ResizableModal from '../../../components/misc/ResizableModal';
import Portal from '../../../components/misc/Portal';
import { getUserAttributes } from '../../../utils/SecurityUtils';
import Message from '../../../components/I18N/Message';
import { isArray, isObject, isString } from 'lodash';

/**
 * A Modal window to show password reset form
  * @prop {bool} hideGroupUserInfo It is a flag from Login plugin (cfg.toolsCfg[0].hideGroupUserInfo): to show/hide user group in user details info, by default `false`
 */
class UserDetails extends React.Component {
    static propTypes = {
        // props
        user: PropTypes.object,
        show: PropTypes.bool,
        options: PropTypes.object,
        onClose: PropTypes.func,
        includeCloseButton: PropTypes.bool,
        hideGroupUserInfo: PropTypes.bool
    };

    static defaultProps = {
        user: {
            name: "Guest"
        },
        onClose: () => {},
        options: {},
        includeCloseButton: true,
        hideGroupUserInfo: false
    };

    getUserInfo = () => {
        let mainUserInfo = {
            name: v => <strong>{v}</strong>,
            role: v => <strong>{this.capitalCase(v)}</strong>,
            email: v => <strong>{v}</strong>,
            company: v => <strong>{v}</strong>,
            notes: v => <strong>{v}</strong>
        };

        if (!this.props.hideGroupUserInfo) {
            mainUserInfo.groups = groups => {
                const gr = isArray(groups) && [...groups] || groups.group && isArray(groups.group) && [...groups.group] || groups.group && isObject(groups.group) && [{...groups.group}];
                return gr && gr.map(group => {
                    return group.groupName && <div className="user-group-info" key={group.groupName}><strong>{group.groupName}</strong></div> || null;
                }).filter(v => v) || null;
            };
        }
        return mainUserInfo;
    }

    renderAttributes = () => {
        if (this.props.user) {
            const userAttributes = getUserAttributes(this.props.user);
            const userInfo = this.getUserInfo();
            if (userInfo) {
                const attributesObj = userAttributes.reduce((a, b) => b.nam !== 'UUID' ? {...a, [b.name]: b.value } : {...a}, {});
                const params = {...this.props.user, ...attributesObj};
                const generalAttributes = Object.keys(userInfo)
                    .map(key => {
                        const info = params[key] && userInfo[key](params[key]);
                        return info && <Row key={key}><Col sm={6} xs={12}>{<Message msgId={'user.details' + this.capitalCase(key)}/>}:</Col><Col sm={6} xs={12}>{info}</Col></Row>;
                    }
                    ).filter(value => value);
                if (generalAttributes && generalAttributes.length > 0) {
                    return <div className="ms-user-details-table"><Grid fluid>{generalAttributes}</Grid></div>;
                }
            }
        }
        return <Alert type="info"><Message msgId="user.noAttributesMessage" /></Alert>;
    };

    render() {
        return (
            <Portal>
                <ResizableModal
                    title={<span><Glyphicon glyph="user"/>&nbsp;<Message msgId="user.details" /></span>}
                    clickOutEnabled={false}
                    size="sm"
                    {...this.props.options}
                    show={this.props.show}
                    onClose={this.props.onClose}
                    buttons={this.props.includeCloseButton ? [{
                        text: <Message msgId="close"/>,
                        onClick: this.props.onClose,
                        bsStyle: 'primary'
                    }] : [] }>
                    {this.renderAttributes()}
                </ResizableModal>
            </Portal>
        );
    }

    capitalCase = str => {
        if (isString(str)) {
            const lowerCase = str.toLowerCase();
            return lowerCase.charAt(0).toUpperCase() + lowerCase.slice(1);
        }
        return '';
    }
}

export default UserDetails;
