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
    confirmYes = <Message msgId="yes" />,
    confirmNo = <Message msgId="no"/>,
    confirmTitle = <Message msgId="confirm"/>,
    confirmContent,
    show = false,
    modal = true,
    draggable = false,
    onClose = () => { },
    onConfirm = () => { }
} = {}) => (<Portal>
    <Confirm
        draggable={draggable}
        show={show}
        modal={modal}
        onClose={onClose}
        onConfirm={onConfirm}
        title={confirmTitle}
        confirmButtonContent={confirmYes}
        closeText={confirmNo}
        confirmButtonBSStyle="default"
        closeGlyph="1-close">
        {confirmContent}
    </Confirm>
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
                    // prevent click event bubbling to the button, that is the container of this modal
                    if (event && event.stopPropagation) {
                        event.stopPropagation();
                    }
                    setConfirming(false);
                }
            }),
            withProps(({confirming}) => ({
                show: !!confirming
            })),

        )(ConfirmModal),
    )
)(Component);
