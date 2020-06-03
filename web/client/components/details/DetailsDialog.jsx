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
    title = <Message msgId="details.title"/>,
    children,
    header,
    containerClassName,
    showFullscreen,
    fullscreenType,
    buttons,
    onClose = () => {}
}) => <ResizableModal
    size="lg"
    loading={loading}
    clickOutEnabled={false}
    hideFooterIfEmpty
    containerClassName={`ms-details-dialog-modal${containerClassName ? ` ${containerClassName}` : ''}`}
    show={show}
    title={title}
    bodyClassName={'ms-details-dialog-body'}
    onClose={onClose}
    showFullscreen={showFullscreen}
    fullscreenType={fullscreenType}
    buttons={buttons}>
    <div className="ms-details-dialog-contents">
        <div className="ms-details-dialog-header">
            {header}
        </div>
        <div className="ms-details-dialog-contents-body">
            {children}
        </div>
    </div>
</ResizableModal>;
