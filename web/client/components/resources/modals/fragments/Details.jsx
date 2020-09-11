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

import handleDetailsRow from '../enhancers/handleDetailsRow';

const DetailsRow = handleDetailsRow(DetailsRowBase);

export default ({
    loading,
    resource = {},
    detailsText,
    savedDetailsText,
    detailsBackup,
    showDetailsSheet,
    setDetailsText = () => {},
    setDetailsBackup = () => {},
    onUpdateLinkedResource = () => {},
    onShowDetailsSheet = () => {},
    onHideDetailsSheet = () => {}
}) => (
    <>
        <DetailsRow
            loading={loading || resource.saving}
            detailsText={savedDetailsText}
            detailsBackup={detailsBackup}
            editDetailsDisabled={!isNil(resource.canEdit) && !resource.canEdit}
            canUndo={!!detailsBackup}
            onUndo={() => {
                onUpdateLinkedResource('details', detailsBackup, 'DETAILS');
                setDetailsBackup();
            }}
            onUpdate={setDetailsText}
            onShowDetailsSheet={onShowDetailsSheet}
            onDelete={() => {
                setDetailsBackup(savedDetailsText);
                onUpdateLinkedResource('details', 'NODATA', 'DETAILS');
            }}/>
        <DetailsSheet
            loading={loading}
            show={showDetailsSheet}
            title={resource.metadata?.name}
            detailsText={detailsText}
            onClose={() => {
                onHideDetailsSheet();
                setDetailsText(savedDetailsText);
            }}
            onSave={text => {
                onHideDetailsSheet();
                setDetailsBackup();
                onUpdateLinkedResource('details', text, 'DETAILS');
            }}
            onUpdate={setDetailsText}/>
    </>
);
