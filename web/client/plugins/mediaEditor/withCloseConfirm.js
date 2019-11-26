/*
 * Copyright 2019, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
import React from 'react';
import {withHandlers, compose, withPropsOnChange, defaultProps} from 'recompose';

import WithConfirm from '../../components/misc/withConfirm';
import Message from '../../components/I18N/Message';

export default compose(
    defaultProps({
        confirmContent: <Message msgId="mediaEditor.confirmExitContent"/>,
        confirmTitle: <Message msgId="mediaEditor.confirmExitTitle"/>
    }),
    withPropsOnChange(["adding"], ({adding}) => ({confirmPredicate: adding})),
    withHandlers({
        onClick: ({hide, owner}) => () => hide(owner)
    }),
    WithConfirm,
    withHandlers({hide: ({onClick}) => (...args) => onClick(...args) })
);
