/*
 * Copyright 2025, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
import React from 'react';
import { FlexFill } from '../../../components/layout/FlexBox';
import CatalogCard from './CatalogCard';

const CatalogList = ({
    records = [],
    onToggleLayer,
    onAddLayer,
    getRecordStatus,
    currentLocale,
    loading: loadingRecords,
    hideThumbnail,
    hideIdentifier,
    showGetCapLinks,
    addAuthentication,
    multiSelect,
    readOnly,
    includeAddToMap,
    messages
    // hideExpand,
}) => {
    return (
        <FlexFill component="ul" flexBox className="ms-catalog-list _relative">
            {records?.map((entry, idx) => {
                const record = entry?.record || entry;
                const { isChecked, disabled, loading } = getRecordStatus(record);
                return (
                    <CatalogCard
                        key={`${idx}:${record.identifier}`}
                        loading={loading}
                        disabled={disabled}
                        readOnly={readOnly}
                        hideThumbnail={ hideThumbnail || record.hideThumbnail}
                        hideIdentifier={ hideIdentifier}
                        // hideExpand={hideExpand}
                        showTemplate={record.showTemplate}
                        metadataTemplate={record.metadataTemplate}
                        record={record}
                        showGetCapLinks={showGetCapLinks}
                        addAuthentication={addAuthentication}
                        currentLocale={currentLocale}
                        isChecked={isChecked}
                        multiSelect={multiSelect}
                        onToggle={onToggleLayer}
                        onAdd={onAddLayer}
                        includeAddToMap={includeAddToMap}
                        loadingRecords={loadingRecords}
                        messages={messages}
                    />
                );
            })}
        </FlexFill>
    );
};

export default CatalogList;
