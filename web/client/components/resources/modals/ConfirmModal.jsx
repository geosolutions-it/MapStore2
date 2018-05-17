/*
 * Copyright 2018, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
const React = require('react');
const Portal = require('../../misc/Portal');
const ResizableModal = require('../../misc/ResizableModal');
const Message = require('../../I18N/Message');

module.exports = ({
    title = <Message msgId="warning" />,
    cancelText = <Message msgId="no" />,
    confirmText = <Message msgId="yes" />,
    onClose = () => {},
    onConfirm = () => {},
    show,
    children

}) => {
    return (<Portal>
        <ResizableModal
            size="xs"
            clickOutEnabled={false}
            showClose={false}
            title={title}
            bodyClassName="modal-details-sheet-confirm"
            show={show}
            buttons={[{
                text: cancelText,
                onClick: () => onClose()
            }, {
                text: confirmText,
                onClick: () => {
                    onConfirm();
                }
            }]}>
            <div className="ms-alert">
                <span className="ms-alert-center">
                    {children}
                </span>
            </div>
        </ResizableModal>
    </Portal>);
};
