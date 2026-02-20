/*
 * Copyright 2025, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
import React, { useCallback } from 'react';
import PropTypes from 'prop-types';
import UserDefinedValuesDataGrid from '../UserDefinedValuesDataGrid';
import { useFilterData } from './hooks/useFilterData';
import { useLayerAttributes } from './hooks/useLayerAttributes';
import { useAttributeSync } from './hooks/useAttributeSync';
import DataSourceSelector from './components/DataSourceSelector';
import UserDefinedTypeSelector from './components/UserDefinedTypeSelector';
import LayerSelectorField from './components/LayerSelectorField';
import ValuesFromSelector from './components/ValuesFromSelector';
import FilterAttributesSection from './components/FilterAttributesSection';
import MaxFeaturesInput from './components/MaxFeaturesInput';
import FilterCompositionSelector from './components/FilterCompositionSelector';
import FilterSelectionModeSelector from './components/FilterSelectionModeSelector';
import { VALUES_FROM_TYPES, USER_DEFINED_TYPES } from './constants';
import { isFilterValid } from '../../../../../../utils/FilterUtils';

const FilterDataTab = ({
    data = {},
    onChange: onChangeProp = () => {},
    onOpenLayerSelector = () => {},
    openFilterEditor,
    onEditorChange = () => {},
    dashBoardEditing,
    selections = {}
}) => {
    // Normalize and derive filter data
    const filterDataState = useFilterData(data);

    // Fetch attributes from WFS
    const {
        attributeOptions,
        isLoading: attributesLoading,
        error: attributesError
    } = useLayerAttributes(
        filterDataState.selectedLayerObject,
        filterDataState.hasLayerSelection
    );

    // Enhanced onChange handler with auto-sync
    const onChange = useAttributeSync(data, onChangeProp, onEditorChange, selections);

    // Generic handler factory for simple onChange handlers
    const createChangeHandler = (key) => (value) => {
        onChange(key, value);
    };

    // Handlers
    const handleDataSourceChange = (nextSource) => {
        onChange('data.dataSource', nextSource);
        // Clear items when dataSource changes
        onChange('items', []);
    };

    const handleValuesFromChange = (nextValue) => {
        onChange('data.valuesFrom', nextValue);
        // Clear labelAttribute when switching to grouped mode
        if (nextValue === VALUES_FROM_TYPES.GROUPED) {
            onChange('data.labelAttribute', undefined);
        }
    };

    const handleUserDefinedItemsChange = (items) => {
        onChange('data.userDefinedItems', items);
    };

    const handleEditUserDefinedItemFilter = useCallback((itemId) => {
        onEditorChange('editingDefaultFilter', false);
        onEditorChange('editingUserDefinedItemId', itemId);
        setTimeout(() => {
            openFilterEditor();
        }, 0);
    }, [onEditorChange, openFilterEditor]);

    const handleEditUserDefinedItemStyle = useCallback((itemId) => {
        // Store which user-defined item is being edited (for any additional handling if needed)
        onEditorChange('editingUserDefinedItemId', itemId);
    }, [onEditorChange]);

    // Generic handlers using the factory function
    const handleValueAttributeChange = createChangeHandler('data.valueAttribute');
    const handleLabelAttributeChange = createChangeHandler('data.labelAttribute');
    const handleSortByAttributeChange = createChangeHandler('data.sortByAttribute');
    const handleSortOrderChange = createChangeHandler('data.sortOrder');
    const handleMaxFeaturesChange = createChangeHandler('data.maxFeatures');
    const handleFilterCompositionChange = createChangeHandler('data.filterComposition');
    const handleNoSelectionModeChange = createChangeHandler('data.noSelectionMode');
    const handleUserDefinedTypeChange = useCallback((value) => {
        onChange('data.userDefinedType', value);
        // Clear userDefinedItems when type changes
        onChange('data.userDefinedItems', []);
        // Force selectionMode to single when Style List is selected
        if (value === USER_DEFINED_TYPES.STYLE_LIST) {
            onChange('layout.selectionMode', 'single');
        }
    }, [onChange]);

    const handleEditDefaultFilter = useCallback(() => {
        onEditorChange('editingUserDefinedItemId', null);
        onEditorChange('editingDefaultFilter', true);
        setTimeout(() => {
            openFilterEditor();
        }, 0);
    }, [onEditorChange, openFilterEditor]);

    return (
        <div className="ms-filter-wizard-data-tab">
            <DataSourceSelector
                value={filterDataState.dataSource}
                onChange={handleDataSourceChange}
            />

            {filterDataState.isUserDefined && (
                <UserDefinedTypeSelector
                    value={filterDataState.userDefinedType}
                    onChange={handleUserDefinedTypeChange}
                    selectedLayer={filterDataState.selectedLayerObject}
                />
            )}

            <LayerSelectorField
                onFilterLayer={() => {
                    openFilterEditor();
                }}
                layer={filterDataState.selectedLayerObject}
                layerIsRequired={filterDataState.layerIsRequired}
                onOpenLayerSelector={onOpenLayerSelector}
                dashBoardEditing={dashBoardEditing}
                hideFilter={filterDataState.isUserDefined}
            />

            {filterDataState.isFeaturesSource && (
                <>
                    <ValuesFromSelector
                        value={filterDataState.valuesFrom}
                        onChange={handleValuesFromChange}
                    />

                    <FilterAttributesSection
                        valuesFrom={filterDataState.valuesFrom}
                        valueAttribute={filterDataState.valueAttribute}
                        labelAttribute={filterDataState.labelAttribute}
                        sortByAttribute={filterDataState.sortByAttribute}
                        sortOrder={filterDataState.sortOrder}
                        attributeOptions={attributeOptions}
                        isLoading={attributesLoading}
                        hasLayerSelection={filterDataState.hasLayerSelection}
                        error={attributesError}
                        onValueAttributeChange={handleValueAttributeChange}
                        onLabelAttributeChange={handleLabelAttributeChange}
                        onSortByAttributeChange={handleSortByAttributeChange}
                        onSortOrderChange={handleSortOrderChange}
                    />

                    <MaxFeaturesInput
                        value={filterDataState.maxFeaturesValue}
                        onChange={handleMaxFeaturesChange}
                    />
                </>
            )}

            {filterDataState.isUserDefined && (
                <UserDefinedValuesDataGrid
                    items={filterDataState.userDefinedItems}
                    onChange={handleUserDefinedItemsChange}
                    onEditFilter={handleEditUserDefinedItemFilter}
                    onEditStyle={handleEditUserDefinedItemStyle}
                    userDefinedType={filterDataState.userDefinedType}
                    layer={filterDataState.selectedLayerObject}
                />
            )}

            {filterDataState.userDefinedType !== USER_DEFINED_TYPES.STYLE_LIST && (
                <>
                    <FilterCompositionSelector
                        value={filterDataState.filterComposition}
                        onChange={handleFilterCompositionChange}
                    />

                    <FilterSelectionModeSelector
                        value={filterDataState.noSelectionMode}
                        onChange={handleNoSelectionModeChange}
                        defaultFilter={filterDataState?.defaultFilter}
                        onDefineFilter={handleEditDefaultFilter}
                        isFilterValid={isFilterValid}
                    />
                </>
            )}
        </div>
    );
};

FilterDataTab.propTypes = {
    data: PropTypes.object,
    onChange: PropTypes.func,
    onOpenLayerSelector: PropTypes.func,
    openFilterEditor: PropTypes.func,
    onEditorChange: PropTypes.func,
    dashBoardEditing: PropTypes.bool
};

export default FilterDataTab;

