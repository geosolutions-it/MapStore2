/*
 * Copyright 2020, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import React from 'react';
import ResizableModal from '../misc/ResizableModal';
import Message from '../I18N/Message';

export default ({
    show,
    loading = false,
    editing,
    title = <Message msgId="details.title"/>,
    children,
    header,
    onClose = () => {}
}) => <ResizableModal
    loading={loading}
    clickOutEnabled={false}
    hideFooterIfEmpty
    show={show}
    title={title}
    bodyClassName={editing === 'content' ? 'ms-details-dialog-editor-container' : 'ms-details-dialog-body'}
    onClose={onClose}>
    <div className="ms-details-dialog-contents">
        <div className="ms-details-dialog-header">
            {header}
        </div>
        <div className="ms-details-dialog-contents-body">
            {children}
        </div>
    </div>
</ResizableModal>;
