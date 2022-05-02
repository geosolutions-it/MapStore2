/**
 * Copyright 2016, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import React from 'react';
import Button from '../misc/Button';
import PropTypes from 'prop-types';
import { Glyphicon, Tooltip } from 'react-bootstrap';
import OverlayTrigger from '../misc/OverlayTrigger';
import Message from '../../components/I18N/Message';
import ConfirmModal from '../../components/misc/ResizableModal';
import { get, pick } from "lodash";
import ConfigUtils from "../../utils/ConfigUtils";
export const getPath = () => {
    const miscSettings = ConfigUtils.getConfigProp('miscSettings');
    return get(miscSettings, ['homePath'], '/');
};
class Home extends React.Component {
    static propTypes = {
        icon: PropTypes.node,
        onCheckMapChanges: PropTypes.func,
        onCloseUnsavedDialog: PropTypes.func,
        displayUnsavedDialog: PropTypes.bool,
        renderUnsavedMapChangesDialog: PropTypes.bool,
        tooltipPosition: PropTypes.string,
        bsStyle: PropTypes.string,
        hidden: PropTypes.bool
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
        tooltipPosition: 'left',
        bsStyle: 'primary',
        hidden: false
    };

    render() {
        const { tooltipPosition, hidden, ...restProps} = this.props;
        let tooltip = <Tooltip id="toolbar-home-button">{<Message msgId="gohome"/>}</Tooltip>;
        return hidden ? false : (
            <React.Fragment>
                <OverlayTrigger overlay={tooltip} placement={tooltipPosition}>
                    <Button
                        id="home-button"
                        className="square-button"
                        bsStyle={this.props.bsStyle}
                        onClick={this.checkUnsavedChanges}
                        tooltip={tooltip}
                        {...pick(restProps, ['disabled', 'active', 'block', 'componentClass', 'href', 'children', 'icon', 'bsStyle', 'className'])}
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
        this.context.router.history.push(getPath());
    };
}

export default Home;
