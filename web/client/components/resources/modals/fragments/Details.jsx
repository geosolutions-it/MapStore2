/*
 * Copyright 2020, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import React from 'react';
import { isNil } from 'lodash';

import DetailsRowBase from './DetailsRow';
import DetailsSheet from './DetailsSheet';
import Editors from './editors';

import handleDetailsRow from '../enhancers/handleDetailsRow';

const DetailsRow = handleDetailsRow(DetailsRowBase);

export default ({
    loading,
    resource = {},
    editor = 'DraftJSEditor',
    editorProps = {},
    editorState,
    savedDetailsText,
    detailsBackup,
    showDetailsSheet,
    setEditorState = () => {},
    setDetailsBackup = () => {},
    onUpdateResource = () => {},
    onUpdateLinkedResource = () => {},
    onShowDetailsSheet = () => {},
    onHideDetailsSheet = () => {}
}) => {
    const {component: Editor, editorStateToDetailsText, detailsTextToEditorState, containerBodyClass} = Editors[editor];

    return (
        <>
            <DetailsRow
                loading={loading || resource.saving}
                detailsText={savedDetailsText}
                detailsBackup={detailsBackup}
                editDetailsDisabled={!isNil(resource.canEdit) && !resource.canEdit}
                settings={resource.attributes?.detailsSettings}
                canUndo={!!detailsBackup}
                onUndo={() => {
                    onUpdateLinkedResource('details', detailsBackup, 'DETAILS');
                    setDetailsBackup();
                }}
                onUpdate={detailsText => setEditorState(detailsTextToEditorState(detailsText))}
                onUpdateResource={onUpdateResource}
                onShowDetailsSheet={onShowDetailsSheet}
                onDelete={() => {
                    setDetailsBackup(savedDetailsText);
                    onUpdateLinkedResource('details', 'NODATA', 'DETAILS');
                }}/>
            <DetailsSheet
                loading={loading}
                show={showDetailsSheet}
                title={resource.metadata?.name}
                detailsText={editorState}
                bodyClassName={containerBodyClass}
                onClose={() => {
                    onHideDetailsSheet();
                }}
                onSave={editorText => {
                    let newDetailsText = editorStateToDetailsText(editorText);

                    onHideDetailsSheet();
                    setDetailsBackup();

                    if (!newDetailsText || newDetailsText === '<p><br></p>') {
                        newDetailsText = savedDetailsText;
                    }

                    onUpdateLinkedResource('details', newDetailsText || 'NODATA', 'DETAILS');
                }}>
                <Editor {...editorProps} editorState={editorState} onUpdateEditorState={setEditorState}/>
            </DetailsSheet>
        </>
    );
};
