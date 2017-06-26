const PropTypes = require('prop-types');
/**
 * Copyright 2016, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
const React = require('react');

const {Button, Table, Alert} = require('react-bootstrap');
const Modal = require('../../../components/misc/Modal');
const SecurityUtils = require('../../../utils/SecurityUtils');
const Message = require('../../../components/I18N/Message');

/**
 * A Modal window to show password reset form
 */
class UserDetails extends React.Component {
    static propTypes = {
        // props
        user: PropTypes.object,
        show: PropTypes.bool,
        displayAttributes: PropTypes.func,
        options: PropTypes.object,
        onClose: PropTypes.func,
        closeGlyph: PropTypes.string,
        style: PropTypes.object,
        buttonSize: PropTypes.string,
        includeCloseButton: PropTypes.bool
    };

    static defaultProps = {
        user: {
            name: "Guest"
        },
        displayAttributes: (attr) => {
            return attr.name !== "UUID";
        },
        onClose: () => {},
        options: {},
        closeGlyph: "",
        style: {},
        buttonSize: "large",
        includeCloseButton: true
    };

    getFooter = () => {
        return this.props.includeCloseButton ? <Button bsSize={this.props.buttonSize} bsSize="small" onClick={this.props.onClose}><Message msgId="close"/></Button> : <span/>;
    };

    renderAttributes = () => {
        if (this.props.user && this.props.user.attribute) {
            let userAttributes = SecurityUtils.getUserAttributes(this.props.user);
            let attrsRendered = userAttributes.filter(this.props.displayAttributes).map((attr) => {
                return <tr key={attr.name + "-row"}><th>{attr.name}</th><td> {attr.value}</td></tr>;
            });
            if (attrsRendered && attrsRendered.length > 0) {
                return <Table role="body" responsive striped condensed hover><tbody>{attrsRendered}</tbody></Table>;
            }
        }
        return <Alert type="info"><Message msgId="user.noAttributesMessage" /></Alert>;
    };

    render() {
        return (<Modal {...this.props.options} show={this.props.show} onHide={this.props.onClose}>
                <Modal.Header key="details" closeButton>
                  <Modal.Title><Message msgId="user.details" /></Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    {this.renderAttributes()}
                </Modal.Body>
                <Modal.Footer>
                  {this.getFooter()}
                </Modal.Footer>
            </Modal>);
    }
}

module.exports = UserDetails;
