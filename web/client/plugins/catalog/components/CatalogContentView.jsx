/*
 * Copyright 2025, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
import React from 'react';
import FlexBox, { FlexFill } from '../../../components/layout/FlexBox';
import CatalogToolbar from './CatalogToolbar';
import CatalogList from './CatalogList';
import Spinner from '../../../components/layout/Spinner';
import Text from '../../../components/layout/Text';

const CatalogContentView = ({
    wrapCards,
    loading,
    records,
    total,
    selectedLayers,
    isAllSelected,
    isIndeterminate,
    onSelectAll,
    onAddSelected,
    onToggleLayer,
    loadingLayers,
    selectedFormat,
    sort,
    onSortChange,
    onAddLayer,
    layers,
    currentLocale,
    enableOrderBy,
    children,
    includeAddToMap,
    multiSelect,
    getRecordStatus
}) => {
    return (
        <FlexFill flexBox column className="ms-catalog-content-view _relative">
            <CatalogToolbar
                total={total }
                isAllSelected={isAllSelected}
                isIndeterminate={isIndeterminate}
                selectedCount={selectedLayers?.length || 0}
                onSelectAll={onSelectAll}
                onAddSelected={onAddSelected}
                enableOrderBy={enableOrderBy}
                selectedFormat={selectedFormat}
                onSortChange={onSortChange}
                sort={sort}
                loading={loading}
                includeAddToMap={includeAddToMap}
                multiSelect={multiSelect}
            />
            <FlexFill flexBox className="_relative ms-catalog-content-view-body" >
                <div className="_absolute _fill _overflow-auto">
                    <CatalogList
                        loading={loading}
                        records={records}
                        wrapCards={wrapCards}
                        loadingLayers={loadingLayers}
                        selectedLayers={selectedLayers}
                        onToggleLayer={onToggleLayer}
                        onAddLayer={onAddLayer}
                        layers={layers}
                        currentLocale={currentLocale}
                        includeAddToMap={includeAddToMap}
                        multiSelect={multiSelect}
                        getRecordStatus={getRecordStatus}
                    />
                </div>
                {loading ? (
                    <FlexBox centerChildren className="ms-catalog-content-view-loader" classNames={['_overlay', '_absolute', '_fill', '_corner-tl']}>
                        <Text fontSize="xxl">
                            <Spinner />
                        </Text>
                    </FlexBox>
                ) : null}
            </FlexFill>
            {children}
        </FlexFill>
    );
};

export default CatalogContentView;
