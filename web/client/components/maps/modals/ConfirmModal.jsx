const PropTypes = require('prop-types');
/**
 * Copyright 2016, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

const React = require('react');
const {Button} = require('react-bootstrap');
const Modal = require('../../misc/Modal');
const Spinner = require('react-spinkit');

/**
 * A Modal window to show a confirmation dialog
 */
class ConfirmModal extends React.Component {
    static propTypes = {
        // props
        className: PropTypes.string,
        show: PropTypes.bool,
        options: PropTypes.object,
        onConfirm: PropTypes.func,
        onClose: PropTypes.func,
        closeGlyph: PropTypes.string,
        style: PropTypes.object,
        buttonSize: PropTypes.string,
        includeCloseButton: PropTypes.bool,
        body: PropTypes.oneOfType([PropTypes.string, PropTypes.element]),
        titleText: PropTypes.oneOfType([PropTypes.string, PropTypes.element]),
        confirmText: PropTypes.oneOfType([PropTypes.string, PropTypes.element]),
        cancelText: PropTypes.oneOfType([PropTypes.string, PropTypes.element]),
        running: PropTypes.bool
    };

    static defaultProps = {
        onConfirm: ()=> {},
        onClose: () => {},
        options: {
            animation: false
        },
        className: "",
        closeGlyph: "",
        style: {},
        includeCloseButton: true,
        body: "",
        titleText: "Confirm Delete",
        confirmText: "Delete",
        cancelText: "Cancel"
    };

    onConfirm = () => {
        this.props.onConfirm();
    };

    render() {
        const footer = (<span role="footer"><div style={{"float": "left"}}></div>
            <Button
                ref="confirmButton"
                disabled={this.props.running}
                className={this.props.className}
                key="confirmButton"
                bsStyle="primary"
                bsSize={this.props.buttonSize}
                onClick={() => {
                    this.onConfirm();
                }}>{this.props.running ? <Spinner spinnerName="circle" overrideSpinnerClassName="spinner" noFadeIn /> : null}{this.props.confirmText}</Button>
            {this.props.includeCloseButton ? <Button
                key="cancelButton"
                ref="cancelButton"
                bsSize={this.props.buttonSize}
                onClick={this.props.onClose}>{this.props.cancelText}</Button> : <span/>}
        </span>);
        const body = this.props.body;
        return (
            <Modal {...this.props.options}
                show={this.props.show}
                onHide={this.props.onClose}>
                <Modal.Header key="dialogHeader" closeButton>
                    <Modal.Title>{this.props.titleText}</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    {body}
                </Modal.Body>
                <Modal.Footer>
                    {footer}
                </Modal.Footer>
            </Modal>);
    }
}

module.exports = ConfirmModal;
