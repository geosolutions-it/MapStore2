/*
 * Copyright 2019, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import React from 'react';
import Confirm from '../layout/ConfirmDialog';
import Portal from './Portal';
import { compose, withHandlers, withState, withProps} from 'recompose';

const ConfirmModal = compose(
    withProps(({setConfirming}) => ({
        onClose: (event) => {
            // avoid propagation of events
            if (event?.stopPropagation) {
                event.stopPropagation();
            }
            setConfirming(false);
        }
    })))(({
    confirmYes = "yes",
    confirmNo = "no",
    confirmTitle = "confirm",
    confirmContent,
    confirmButtonBSStyle = "danger",
    show = false,
    onClose = () => { },
    onConfirm = () => { }
} = {}) => {
    return show ? (<Portal>
        <div className="with-confirm-modal">
            <Confirm
                show={show}
                onCancel={onClose}
                onConfirm={onConfirm}
                titleId={confirmTitle}
                descriptionId={confirmContent}
                confirmId={confirmYes}
                cancelId={confirmNo}
                variant={confirmButtonBSStyle}>
            </Confirm>
        </div>
    </Portal>) : null;
});

/**
 * Adds confirm modal to a generic component that has an onClick handler
 */
export const addConfirmModal = (A) => ({ confirming, confirmYes, confirmNo, confirmTitle, confirmContent,
    confirmModal, draggable, onConfirm, setConfirming, ...props}) => {

    return (
        <React.Fragment>
            <ConfirmModal show={confirming} setConfirming={setConfirming}  confirmYes={confirmYes} confirmNo={confirmNo}
                confirmTitle={confirmTitle} confirmContent={confirmContent}
                confirmModal={confirmModal} draggable={draggable} onConfirm={onConfirm}/>
            <A {...props}/>
        </React.Fragment>);
};
/**
 * Given a component with an onClick handler in props, It adds a confirmation modal on onClick event.
 * ConfirmPredicate prop, default to true,  enable or disable the confirmation request
 */
export default (Component) => compose(
    withState('confirming', 'setConfirming', false),
    withHandlers({
        onClick: ({ setConfirming = () => { }, onClick = () => {}, confirmPredicate = true}) => (...args) => {
            const [event] = args || [];
            // avoid propagation of events
            if (event?.stopPropagation) {
                event.stopPropagation();
            }
            if (confirmPredicate) {
                setConfirming(true);
            } else {
                onClick(...args);
            }
        },
        onConfirm: ({ onClick = () => {}, setConfirming = () => {} }) => (...args) => {
            setConfirming(false);
            onClick(...args);
        }
    }),
    addConfirmModal
)(Component);
