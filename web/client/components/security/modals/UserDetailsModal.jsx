/*
 * Copyright 2016, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

const React = require('react');
const PropTypes = require('prop-types');
const {Grid, Row, Col, Alert, Glyphicon} = require('react-bootstrap');
const ResizableModal = require('../../../components/misc/ResizableModal');
const Portal = require('../../../components/misc/Portal');
const SecurityUtils = require('../../../utils/SecurityUtils');
const Message = require('../../../components/I18N/Message');
const {isArray, isObject, isString} = require('lodash');

/**
 * A Modal window to show password reset form
 */
class UserDetails extends React.Component {
    static propTypes = {
        // props
        user: PropTypes.object,
        show: PropTypes.bool,
        options: PropTypes.object,
        onClose: PropTypes.func,
        includeCloseButton: PropTypes.bool
    };

    static defaultProps = {
        user: {
            name: "Guest"
        },
        onClose: () => {},
        options: {},
        includeCloseButton: true
    };

    getUserInfo = () => {
        return {
            name: v => <strong>{v}</strong>,
            role: v => <strong>{this.capitalCase(v)}</strong>,
            email: v => <strong>{v}</strong>,
            company: v => <strong>{v}</strong>,
            notes: v => <strong>{v}</strong>,
            groups: groups => {
                const gr = isArray(groups) && [...groups] || groups.group && isArray(groups.group) && [...groups.group] || groups.group && isObject(groups.group) && [{...groups.group}];
                return gr && gr.map(group => {
                    return group.groupName && <div key={group.groupName}><strong>{group.groupName}</strong></div> || null;
                }).filter(v => v) || null;
            }
        };
    }

    renderAttributes = () => {
        if (this.props.user && this.props.user.attribute) {
            const userAttributes = SecurityUtils.getUserAttributes(this.props.user);
            if (userAttributes && userAttributes.length > 0) {
                const userInfo = this.getUserInfo();
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

module.exports = UserDetails;
