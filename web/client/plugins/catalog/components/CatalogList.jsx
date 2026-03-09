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
    selectedLayers = [],
    onToggleLayer,
    onAddLayer,
    layers,
    currentLocale,
    readOnly,
    loadingLayers = []
}) => {
    return (
        <FlexFill component="ul" flexBox className="ms-catalog-list _relative">
            {records?.map((entry, idx) => {
                const record = entry?.record || entry;
                const isChecked = selectedLayers.some(
                    layer => layer.identifier === record.identifier
                );
                const background = record?.background;
                const disabled = !!(background && (layers || [])
                    .find(layer => layer.id === background.name ||
                        layer.type === background.type && layer.source === background.source && layer.name === background.name));
                const loading = loadingLayers.includes(record.identifier);
                // const { checked, disabled, loading } = getRecordStatus(record);
                return (
                    <CatalogCard
                        key={`${idx}:${record.identifier}`}
                        loading={loading}
                        disabled={disabled}
                        readOnly={readOnly}
                        // hideThumbnail={record.hideThumbnail}
                        // hideIdentifier={record.hideIdentifier}
                        // hideExpand={hideExpand}
                        showTemplate={record.showTemplate}
                        metadataTemplate={record.metadataTemplate}
                        record={record}
                        // showGetCapLinks={showGetCapLinks}
                        // addAuthentication={addAuthentication}
                        currentLocale={currentLocale}
                        isChecked={isChecked}
                        onToggle={onToggleLayer}
                        onAdd={onAddLayer}
                    />
                );
            })}
        </FlexFill>
    );
};

export default CatalogList;
