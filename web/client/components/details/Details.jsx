/*
 * Copyright 2020, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import React from 'react';
import { isEqual } from 'lodash';

import Message from '../I18N/Message';
import { withConfirmOverride } from '../misc/withConfirm';

import DetailsDialog from './DetailsDialog';
import DetailsPanel from './DetailsPanel';
import DetailsSettings from './DetailsSettings';

import DefaultViewer from './viewers/DefaultViewer';
import QuillEditor from './editors/QuillEditor';

const Details = ({
    content,
    editedContent,
    editorProps = {},
    settings = {},
    editedSettings,
    onSettingsChange,
    ...props
}) => {
    const {editing} = props;
    const detailsText = editing === 'content' ? editedContent : content;

    const detailsViewer = (<DefaultViewer
        detailsText={detailsText}/>);
    const detailsEditor = (<QuillEditor
        detailsText={detailsText}
        {...editorProps}/>);
    const detailsSettings = (<DetailsSettings
        settings={editing === 'settings' ? editedSettings : settings}
        onChange={onSettingsChange}/>);
    const Container = settings.showAsModal ? DetailsDialog : DetailsPanel;

    return (
        <Container detailsText={detailsText} {...props}>
            {editing === 'content' ? detailsEditor : null}
            {editing === 'settings' ? detailsSettings : null}
            {!editing ? detailsViewer : null}
        </Container>
    );
};
const DetailsWithConfirm = withConfirmOverride('onClose', 'onCancelEdit')(Details);

export default props => <DetailsWithConfirm
    confirmPredicate={props.editing === 'content' && props.contentChanged ||
        props.editing === 'settings' && !isEqual(props.settings, props.editedSettings)}
    confirmContent={<Message msgId="details.confirmClose"/>}
    {...props}/>;
