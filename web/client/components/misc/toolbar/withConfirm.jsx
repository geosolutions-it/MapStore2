/*
 * Copyright 2019, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import React from 'react';
import Confirm from '../ConfirmDialog';
import Portal from '../Portal';
import Message from '../../I18N/Message';
const ConfirmModal = ({
    confirmButtonMessageId = "confirm",
    show = false,
    modal = true,
    confirmMessageId = "confirmTitle",
    confirmMessageParams,
    onClose = () => { },
    onConfirm = () => { }
} = {}) => (<Portal>
    <Confirm
        show={show}
        modal={modal}
        onClose={onClose}
        onConfirm={onConfirm}
        confirmButtonBSStyle="default"
        closeGlyph="1-close"
        body={(<Message msgId={confirmMessageId} msgParams={confirmMessageParams} />)}
        confirmButtonContent={<Message msgId={confirmButtonMessageId} />}
    />
</Portal>);


import { compose, withHandlers, withState, withProps, nest} from 'recompose';

const withChildren = (...children) => mainComponent => nest(mainComponent, ...children);
/**
 * Adds confirm modal to toolbar button
 */
export default (Component) => compose(
    withState('confirming', 'setConfirming', false),
    withHandlers({
        onClick: ({ setConfirming = () => { } }) => () => setConfirming(true),
        onConfirm: ({onClick}) => (...args) => {
            onClick(...args);
        }
    }),
    withChildren(
        compose(
            withHandlers({
                onClose: ({ setConfirming = () => { } }) => (event) => {
                    setConfirming(false);
                    // prevent click event bubbling to the button, that is the container of this modal
                    if (event && event.stopPropagation) {
                        event.stopPropagation();
                    }
                }
            }),
            withProps(({confirming}) => ({
                show: !!confirming
            })),

        )(ConfirmModal),
    )
)(Component);
