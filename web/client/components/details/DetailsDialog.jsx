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
    loadFlags = {},
    canEdit,
    editing,
    title = <Message msgId="details.title"/>,
    children,
    onEdit = () => {},
    onEditSettings = () => {},
    onCancelEdit = () => {},
    onSave = () => {},
    onClose = () => {}
}) => <ResizableModal
    loading={loadFlags.detailsSaving}
    hideFooterIfEmpty
    clickOutEnabled={false}
    show={show}
    title={title}
    bodyClassName={editing === 'content' ? 'ms-details-dialog-editor-container' : 'ms-details-dialog-body'}
    onClose={onClose}
    buttons={canEdit ? [...(editing ? [{
        visible: !loadFlags.detailsSaving,
        text: <Message msgId="details.cancel"/>,
        bsStyle: 'primary',
        onClick: () => onCancelEdit()
    }, {
        visible: !loadFlags.detailsSaving,
        text: <Message msgId="details.save"/>,
        bsStyle: 'primary',
        onClick: () => onSave()
    }] : [{
        text: <Message msgId="details.edit"/>,
        bsStyle: 'primary',
        onClick: () => onEdit()
    }, {
        text: <Message msgId="details.settings"/>,
        bsStyle: 'primary',
        onClick: () => onEditSettings()
    }])] : []}>
    {children}
</ResizableModal>;
