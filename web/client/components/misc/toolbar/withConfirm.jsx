/*
 * Copyright 2019, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

const React = require('react');
const Confirm = require('../ConfirmDialog');
const Portal = require('../Portal');
const Message = require('../../I18N/Message');
const ConfirmModal = ({
    confirmButtonMessageId = "confirm",
    show = false,
    modal = true,
    confirmMessageId="confirmTitle",
    confirmMessageParams,
    onClose = () => { },
    onConfirm = () => { }
} = {}) => (<Portal><Confirm
    show={show}
    modal={modal}
    onClose={onClose}
    onConfirm={onConfirm}
    confirmButtonBSStyle="default"
    closeGlyph="1-close"
    confirmButtonContent={<Message msgId={confirmButtonMessageId} />}
    >
    <Message msgId={confirmMessageId} msgParams={confirmMessageParams} />
</Confirm></Portal>);


import { compose, withHandlers, withState, withProps, nest} from 'recompose';

const withChildren = (...children) => mainComponent => nest(mainComponent, ...children);
/**
 * Adds confirm modal to toolbar button
 */
export default (Component) => compose(
    withState('confirming', 'setConfirming', false),
    withHandlers({
        onClick: ({setConfirming = () => {}}) => () => setConfirming(true),
        onConfirm: ({onClick}) => (...args) => {onClick(...args)},
        // TODO:
    }),
    withChildren(
        compose(
            withHandlers({
                onClose: ({setConfirming = () => {}}) => () => setConfirming(false)
            }),
            withProps(({confirming}) => ({
                show: !!confirming
            })),

        )(ConfirmModal),
    )
)(Component);
