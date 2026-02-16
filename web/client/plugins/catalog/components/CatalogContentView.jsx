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
import CatalogLayerList from './CatalogLayerList';
import CatalogPagination from './CatalogPagination';
import CatalogLoadingView from './CatalogLoadingView';
import CatalogFiltersFormConnected from './CatalogFiltersForm';

const CatalogContentView = ({
    isPanel,
    wrapCards,
    loading,
    records,
    total,
    selectedLayers,
    isAllSelected,
    isIndeterminate,
    onSelectAll,
    onAddSelected,
    onToggleFilters,
    onToggleLayer,
    renderCard,
    paginationProps,
    PaginationComponent,
    addingLayers,
    // filters props
    filters,
    showFilters,
    handleFiltersChange,
    setShowFilters,
    selectedFormat,
    currentservice,
}) => {
    return (
        <FlexFill flexBox column className="_relative">
            <CatalogToolbar
                isPanel={isPanel}
                total={total}
                isAllSelected={isAllSelected}
                isIndeterminate={isIndeterminate}
                selectedCount={selectedLayers.length}
                onSelectAll={onSelectAll}
                onAddSelected={onAddSelected}
                onToggleFilters={onToggleFilters}
                selectedFormat={selectedFormat}
                currentservice={currentservice}
                handleFiltersChange={handleFiltersChange}
                filters={filters}
            />

            <FlexFill flexBox className="_relative" >
                <div style={{
                    position: 'absolute',
                    width: '100%',
                    height: '100%',
                    overflow: 'auto'
                }}>
                    <FlexBox>
                        {showFilters ? <CatalogFiltersFormConnected
                            filters={filters}
                            style={{
                                minWidth: isPanel ? '100%' : 'calc(25% - 0.75rem)',
                            }}
                            currentservice={currentservice}
                            className= {
                                isPanel
                                    ? 'catalog-filters-form_panel'
                                    : 'catalog-filters-form'
                            }
                            id='catalog-filter-form'
                            query={filters}
                            onChange={(newParams) => {
                                handleFiltersChange(newParams, false);
                            }}
                            onClear={() => {
                                handleFiltersChange({}, true);
                            }}
                            onClose={() => setShowFilters(false)}
                        />
                            : null}


                        {loading ? <CatalogLoadingView /> : <CatalogLayerList
                            records={records}
                            isPanel={isPanel}
                            wrapCards={wrapCards}
                            loading={addingLayers}
                            renderCard={renderCard}
                            selectedLayers={selectedLayers}
                            onToggleLayer={onToggleLayer}
                        />}
                    </FlexBox>
                </div>

            </FlexFill>



            <CatalogPagination
                {...paginationProps}
                PaginationComponent={PaginationComponent}
            />
        </FlexFill>
    );
};

export default CatalogContentView;
