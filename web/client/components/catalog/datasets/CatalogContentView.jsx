/*
 * Copyright 2026, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
import React from 'react';
import FlexBox, { FlexFill } from '../../layout/FlexBox';
import CatalogToolbar from './CatalogToolbar';
import CatalogList from './CatalogList';
import Spinner from '../../layout/Spinner';
import Text from '../../layout/Text';

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
    onTagClick,
    layers,
    currentLocale,
    enableOrderBy,
    filters,
    children,
    includeAddToMap,
    multiSelect,
    getRecordStatus,
    messages
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
                loadingLayers={loadingLayers}
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
                        onTagClick={onTagClick}
                        layers={layers}
                        currentLocale={currentLocale}
                        filters={filters}
                        includeAddToMap={includeAddToMap}
                        multiSelect={multiSelect}
                        getRecordStatus={getRecordStatus}
                        messages={messages}
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
            {children ? (
                <div className="ms-catalog-content-view-footer">
                    {children}
                </div>
            ) : null}
        </FlexFill>
    );
};

export default CatalogContentView;
