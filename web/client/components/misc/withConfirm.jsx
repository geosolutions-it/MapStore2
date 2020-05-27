/*
 * Copyright 2019, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import React from 'react';
import { isFunction } from 'lodash';

import Confirm from './ConfirmDialog';
import Portal from './Portal';
import Message from '../I18N/Message';
import { compose, withHandlers, withState, withProps } from 'recompose';

const ConfirmModal = compose(
    withProps(({setConfirming}) => ({onClose: () => setConfirming(false)})))(({
    confirmYes = <Message msgId="yes" />,
    confirmNo = <Message msgId="no"/>,
    confirmTitle = <Message msgId="confirm"/>,
    confirmContent,
    confirmButtonBSStyle = "primary",
    show = false,
    confirmModal = true,
    draggable = false,
    onClose = () => { },
    onConfirm = () => { }
} = {}) => {
    return show ? (<Portal>
        <div className="with-confirm-modal">
            <Confirm
                draggable={draggable}
                show={show}
                modal={confirmModal}
                onClose={onClose}
                onConfirm={onConfirm}
                title={confirmTitle}
                confirmButtonContent={confirmYes}
                closeText={confirmNo}
                confirmButtonBSStyle={confirmButtonBSStyle}
                closeGlyph="1-close">
                {confirmContent}
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

/**
 * This function returns a HOC that will override specific actions passed in props
 * to the Component, with showing a confimation modal. If user confirms,
 * the overriden action will be executed with the original arguments.
 * For example, withConfirmOverride('onClose', 'onClick') will override onClose and onClick props,
 * so that whenever they are called in the component(e.g. this.props.onClose('arg') somewhere),
 * it will trigger a confirmation modal first. If user confirms, the original onClose or onClick
 * action will be executed with arguments the overriding action was called with.
 * @param  {string[]} overrideActions actions to override
 */
export const withConfirmOverride = (...overrideActions) => (Component) => compose(
    withState('confirming', 'setConfirming', false),
    withState('originalArgs', 'setOriginalArgs', []),
    withState('actionSuccess', 'setActionSuccess'),
    withHandlers({
        ...overrideActions.reduce((result, overrideAction) => ({
            ...result,
            [overrideAction]: ({ setConfirming = () => {}, setOriginalArgs = () => {}, setActionSuccess = () => {}, [overrideAction]: overrideActionFunc = () => {}, confirmPredicate = true }) => (...args) => {
                if (confirmPredicate) {
                    setOriginalArgs(args);
                    setActionSuccess(overrideAction);
                    setConfirming(true);
                } else if (isFunction(overrideActionFunc)) {
                    overrideActionFunc(...args);
                }
            }
        }), {}),
        onConfirm: ({ setConfirming = () => {}, setOriginalArgs = () => {}, setActionSuccess = () => {}, originalArgs = [], actionSuccess, ...other }) => () => {
            const overrideActionFunc = other[actionSuccess];

            setConfirming(false);
            if (isFunction(overrideActionFunc)) {
                overrideActionFunc(...originalArgs);
            }

            setActionSuccess();
            setOriginalArgs();
        }
    }),
    addConfirmModal
)(Component);
