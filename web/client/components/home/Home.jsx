/**
 * Copyright 2016, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
const React = require('react');
const PropTypes = require('prop-types');
const {Glyphicon, Tooltip, Button} = require('react-bootstrap');
const OverlayTrigger = require('../misc/OverlayTrigger');
const Message = require('../../components/I18N/Message');
const ConfirmModal = require('../../components/misc/ResizableModal');

class Home extends React.Component {
    static propTypes = {
        icon: PropTypes.node,
        onCheckMapChanges: PropTypes.func,
        onCloseUnsavedDialog: PropTypes.func,
        displayUnsavedDialog: PropTypes.bool,
        renderUnsavedMapChangesDialog: PropTypes.bool,
        tooltipPosition: PropTypes.string
    };

    static contextTypes = {
        router: PropTypes.object,
        messages: PropTypes.object
    };

    static defaultProps = {
        icon: <Glyphicon glyph="home"/>,
        onCheckMapChanges: () => {},
        onCloseUnsavedDialog: () => {},
        renderUnsavedMapChangesDialog: true,
        tooltipPosition: 'left'
    };

    render() {
        const { tooltipPosition, ...restProps} = this.props;
        let tooltip = <Tooltip id="toolbar-home-button">{<Message msgId="gohome"/>}</Tooltip>;
        return (
            <React.Fragment>
                <OverlayTrigger overlay={tooltip} placement={tooltipPosition}>
                    <Button
                        id="home-button"
                        className="square-button"
                        bsStyle="primary"
                        onClick={this.checkUnsavedChanges}
                        tooltip={tooltip}
                        {...restProps}
                    >{this.props.icon}</Button>
                </OverlayTrigger>
                <ConfirmModal
                    ref="unsavedMapModal"
                    show={this.props.displayUnsavedDialog || false}
                    onClose={this.props.onCloseUnsavedDialog}
                    title={<Message msgId="resources.maps.unsavedMapConfirmTitle" />}
                    buttons={[{
                        bsStyle: "primary",
                        text: <Message msgId="resources.maps.unsavedMapConfirmButtonText" />,
                        onClick: this.goHome
                    }, {
                        text: <Message msgId="resources.maps.unsavedMapCancelButtonText" />,
                        onClick: this.props.onCloseUnsavedDialog
                    }]}
                    fitContent
                >
                    <div className="ms-detail-body">
                        <Message msgId="resources.maps.unsavedMapConfirmMessage" />
                    </div>
                </ConfirmModal>
            </React.Fragment>
        );
    }

    checkUnsavedChanges = () => {
        if (this.props.renderUnsavedMapChangesDialog) {
            this.props.onCheckMapChanges(this.goHome);
        } else {
            this.props.onCloseUnsavedDialog();
            this.goHome();
        }
    }

    goHome = () => {
        this.context.router.history.push("/");
    };
}

module.exports = Home;
