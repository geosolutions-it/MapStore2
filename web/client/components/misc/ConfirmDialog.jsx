/*
* Copyright 2016, GeoSolutions Sas.
* All rights reserved.
*
* This source code is licensed under the BSD-style license found in the
* LICENSE file in the root directory of this source tree.
*/

import assign from 'object-assign';
import PropTypes from 'prop-types';
import React from 'react';
import ReactDOM from 'react-dom';
import { ButtonGroup, Glyphicon } from 'react-bootstrap';

import Button from '../misc/Button';
import Message from '../I18N/Message';
import Dialog from './Dialog';

/**
 * A Modal window to show password reset form
 */
class ConfirmDialog extends React.Component {
    static propTypes = {
        // props
        show: PropTypes.bool,
        draggable: PropTypes.bool,
        onClose: PropTypes.func,
        onConfirm: PropTypes.func,
        onSave: PropTypes.func,
        modal: PropTypes.bool,
        closeGlyph: PropTypes.string,
        style: PropTypes.object,
        buttonSize: PropTypes.string,
        inputStyle: PropTypes.object,
        title: PropTypes.node,
        confirmButtonContent: PropTypes.node,
        confirmButtonDisabled: PropTypes.bool,
        closeText: PropTypes.node,
        confirmButtonBSStyle: PropTypes.string,
        focusConfirm: PropTypes.bool
    };

    static defaultProps = {
        onClose: () => { },
        onChange: () => { },
        modal: true,
        title: <Message msgId="confirmTitle" />,
        closeGlyph: "",
        confirmButtonBSStyle: "danger",
        confirmButtonDisabled: false,
        confirmButtonContent: <Message msgId="confirm" /> || "Confirm",
        closeText: <Message msgId="close" />,
        includeCloseButton: true,
        focusConfirm: false
    };

    componentDidMount() {
        this.props.focusConfirm && ReactDOM.findDOMNode(this.confirm).focus();
    }

    render() {
        return (<Dialog draggable={this.props.draggable} onClickOut={this.props.onClose} id="confirm-dialog" modal={this.props.modal} style={assign({}, this.props.style, { display: this.props.show ? "block" : "none" })}>
            <span role="header">
                <span className="user-panel-title">{this.props.title}</span>
                <button onClick={this.props.onClose} className="login-panel-close close">
                    {this.props.closeGlyph ? <Glyphicon glyph={this.props.closeGlyph} /> : <span>×</span>}
                </button>
            </span>
            <div role="body">
                {this.props.children}
            </div>
            <div role="footer">
                <ButtonGroup>
                    <Button ref={this.setConfirmRef} onClick={this.props.onConfirm} disabled={this.props.confirmButtonDisabled} bsStyle={this.props.confirmButtonBSStyle}>{this.props.confirmButtonContent}
                    </Button>
                    <Button onClick={this.props.onClose}>{this.props.closeText}</Button>
                </ButtonGroup>
            </div>
        </Dialog>);
    }

    setConfirmRef = (c) => { this.confirm = c; return this.confirm; };
}

export default ConfirmDialog;
