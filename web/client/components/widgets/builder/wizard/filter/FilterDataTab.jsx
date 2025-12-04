/*
 * Copyright 2025, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { connect } from 'react-redux';
import { createSelector } from 'reselect';
import { FormGroup, ControlLabel, InputGroup, FormControl, Button, ButtonGroup, Glyphicon } from 'react-bootstrap';
import Select from 'react-select';
import { layersSelector } from '../../../../../selectors/layers';
import { currentLocaleSelector } from '../../../../../selectors/locale';
import { getLayerTitle } from '../../../../../utils/LayersUtils';
import InfoPopover from '../../../widget/InfoPopover';
import UserDefinedValuesDataGrid from './UserDefinedValuesDataGrid';
import { describeFeatureType } from '../../../../../observables/wfs';
import { describeFeatureTypeToAttributes } from '../../../../../utils/FeatureTypeUtils';
import sortByAttributesIcon from '../../../../../themes/default/svg/sort-by-attributes.svg';
import sortByAttributesAltIcon from '../../../../../themes/default/svg/sort-by-attributes-alt.svg';
import tooltip from '../../../../misc/enhancers/tooltip';
import ButtonWithTooltip from '../../../../misc/Button';

const TButtonWithTooltip = tooltip(({ children, active, ...props }) => (
    <ButtonWithTooltip
        {...props}
        bsStyle={active ? 'primary' : 'default'}
        className="square-button-md"
    >
        {children}
    </ButtonWithTooltip>
));

const DATA_SOURCE_OPTIONS = [
    { value: 'features', label: 'Features' },
    { value: 'userDefined', label: 'User defined' }
];

const VALUES_FROM_OPTIONS = [
    { value: 'grouped', label: 'Unique Attribute ', description: 'Invoke distinct WPS on the layer attribute.' },
    { value: 'single', label: 'Attributes', description: 'Query WFS once per attribute value.' }
];

const FILTER_COMPOSITION_OPTIONS = [
    { value: 'AND', label: 'Match all filters (AND)' },
    { value: 'OR', label: 'Match any filter (OR)' }
];

const availableLayersSelector = createSelector(
    layersSelector,
    currentLocaleSelector,
    (layers, locale) => {
        return layers
            .map(layer => ({
                value: layer.id,
                label: getLayerTitle(layer, locale) || layer.name || layer.id,
                fields: layer.fields || [],
                originalLayer: layer
            }));
    }
);

const FilterDataTab = ({
    data = {},
    onChange: onChangeProp = () => {},
    layerAttributes = {},
    layerSources = {},
    onOpenLayerSelector = () => {},
    openFilterEditor,
    onEditorChange = () => {},
    dashBoardEditing
}) => {
    const [remoteAttributes, setRemoteAttributes] = useState({ key: null, options: [] });
    const [attributesLoading, setAttributesLoading] = useState(false);
    const [attributesError, setAttributesError] = useState(null);

    // Enhanced onChange handler that auto-syncs related attributes
    const onChange = useCallback((key, value) => {
        // Call the original onChange
        onChangeProp(key, value);

        // If valueAttribute is being changed, also update labelAttribute and sortByAttribute
        // Only update if they are currently undefined
        if (key === 'data.valueAttribute' && value) {
            const filterData = data?.data || {};
            // Set labelAttribute to the same value only if it's undefined
            if (filterData.labelAttribute === undefined || filterData.labelAttribute === null) {
                onChangeProp('data.labelAttribute', value);
            }
            // Set sortByAttribute to the same value only if it's undefined
            if (filterData.sortByAttribute === undefined || filterData.sortByAttribute === null) {
                onChangeProp('data.sortByAttribute', value);
            }
        }
    }, [onChangeProp, data]);

    const filterData = data?.data || {};
    const dataSource = filterData.dataSource;
    const valuesFrom = filterData.valuesFrom;
    const isUserDefined = dataSource === 'userDefined';
    const isFeaturesSource = dataSource === 'features';
    const layerIsRequired = !!dataSource;
    const filterComposition = filterData.filterComposition;
    const valueAttribute = filterData.valueAttribute ?? null;
    const labelAttribute = filterData.labelAttribute ?? null;
    const sortByAttribute = filterData.sortByAttribute ?? null;
    const sortOrder = filterData.sortOrder;
    const maxFeaturesValue = Number.isFinite(filterData.maxFeatures) ? filterData.maxFeatures : '';
    const selectedLayerId = typeof filterData.layer === 'string'
        ? filterData.layer
        : filterData.layer?.id || filterData.layer?.name;
    const selectedLayerObject = typeof filterData.layer === 'object'
        ? filterData.layer
        : (selectedLayerId ? layerSources?.[selectedLayerId] : null);
    const staticAttributeOptions = selectedLayerId ? (layerAttributes?.[selectedLayerId] || []) : [];
    const selectedLayerKey = selectedLayerObject?.id || selectedLayerObject?.name || selectedLayerId;
    const remoteAttributeOptions = selectedLayerKey && remoteAttributes.key === selectedLayerKey
        ? remoteAttributes.options
        : [];
    const attributeOptions = useMemo(() => {
        if (staticAttributeOptions.length) {
            return staticAttributeOptions;
        }
        return remoteAttributeOptions;
    }, [staticAttributeOptions, remoteAttributeOptions]);
    const hasLayerSelection = !!selectedLayerObject;
    const userDefinedItems = useMemo(() => (
        (filterData.userDefinedItems || []).map(item => {
            const filterEntry = typeof item?.filter === 'string'
                ? { expression: item.filter }
                : (item?.filter || null);
            return {
                id: item?.id,
                label: item?.label || '',
                value: item?.value || '',
                filter: filterEntry
            };
        })
    ), [filterData.userDefinedItems]);

    const handleDataSourceChange = (option) => {
        const nextSource = option?.value || 'features';
        onChange('data.dataSource', nextSource);
        // Clear items when dataSource changes
        onChange('items', []);
    };

    const handleValuesFromChange = (option) => {
        const nextValue = option?.value || 'grouped';
        onChange('data.valuesFrom', nextValue);
        if (nextValue === 'grouped') {
            onChange('data.labelAttribute', undefined);
        }
    };

    const handleUserDefinedItemsChange = (items) => {
        onChange('data.userDefinedItems', items);
    };

    const handleEditUserDefinedItemFilter = useCallback((itemId) => {
        // Store which user-defined item is being edited - use Redux action directly!
        onEditorChange('editingUserDefinedItemId', itemId);
        // Small delay to ensure state is updated before opening filter editor
        setTimeout(() => {
            openFilterEditor();
        }, 0);
    }, [onEditorChange, openFilterEditor]);

    const handleEditLayerFilter = useCallback(() => {
        // Clear any user-defined item editing state to edit layer-level filter
        onEditorChange('editingUserDefinedItemId', null);
        // Small delay to ensure state is updated before opening filter editor
        setTimeout(() => {
            openFilterEditor();
        }, 0);
    }, [onEditorChange, openFilterEditor]);

    const handleValueAttributeChange = (option) => {
        onChange('data.valueAttribute', option?.value);
    };

    const handleLabelAttributeChange = (option) => {
        onChange('data.labelAttribute', option?.value);
    };

    const handleSortByAttributeChange = (option) => {
        onChange('data.sortByAttribute', option?.value);
    };

    const handleSortOrderChange = (order) => {
        onChange('data.sortOrder', order);
    };

    const handleMaxFeaturesChange = (event) => {
        const nextValue = parseInt(event?.target?.value, 10);
        onChange('data.maxFeatures', Number.isNaN(nextValue) ? undefined : nextValue);
    };

    const handleFilterCompositionChange = (option) => {
        onChange('data.filterComposition', option?.value || 'AND');
    };

    useEffect(() => {
        let cancelled = false;
        const hasStaticAttributes = staticAttributeOptions.length > 0;

        if (!selectedLayerKey || !hasLayerSelection) {
            setAttributesLoading(false);
            setAttributesError(null);
            setRemoteAttributes({ key: null, options: [] });
            return () => {};
        }

        if (hasStaticAttributes) {
            setAttributesLoading(false);
            setAttributesError(null);
            setRemoteAttributes({ key: null, options: [] });
            return () => {};
        }

        if (!selectedLayerObject?.name) {
            setAttributesLoading(false);
            setAttributesError('Selected layer is missing a valid name');
            setRemoteAttributes({ key: null, options: [] });
            return () => {};
        }

        setAttributesLoading(true);
        setAttributesError(null);
        setRemoteAttributes({ key: null, options: [] });

        const subscription = describeFeatureType({ layer: selectedLayerObject }).subscribe(
            (response = {}) => {
                if (cancelled) {
                    return;
                }
                const attributes = describeFeatureTypeToAttributes(response?.data, selectedLayerObject?.fields || []);
                const options = attributes.map(attribute => ({
                    value: attribute.attribute,
                    label: attribute.label
                }));
                setRemoteAttributes({
                    key: selectedLayerKey,
                    options
                });
                setAttributesLoading(false);
            },
            (error = {}) => {
                if (cancelled) {
                    return;
                }
                setRemoteAttributes({ key: null, options: [] });
                setAttributesLoading(false);
                setAttributesError(error?.message || 'Unable to load attributes');
            }
        );

        return () => {
            cancelled = true;
            if (subscription && subscription.unsubscribe) {
                subscription.unsubscribe();
            }
        };
    }, [selectedLayerKey, hasLayerSelection, staticAttributeOptions.length]);

    const attributeNoResultsText = hasLayerSelection
        ? (attributesError || 'No attributes available')
        : 'Select a layer first';

    return (
        <div className="ms-filter-wizard-data-tab">
            <FormGroup className="form-group-flex">
                <ControlLabel>Data source</ControlLabel>
                <InputGroup>
                    <Select
                        value={DATA_SOURCE_OPTIONS.find(opt => opt.value === dataSource)}
                        options={DATA_SOURCE_OPTIONS}
                        placeholder="Select data source..."
                        onChange={handleDataSourceChange}
                        clearable={false}
                    />
                </InputGroup>
            </FormGroup>
            {isUserDefined && <>
                <FormGroup className="form-group-flex">
                    <ControlLabel>Type</ControlLabel>
                    <InputGroup>
                        <FormControl
                            type="text"
                            value="Filter list"
                            readOnly
                        />
                    </InputGroup>
                </FormGroup>
            </>}

            <FormGroup
                className="form-group-flex"
                validationState={layerIsRequired && !filterData.layer ? 'error' : null}
            >
                <ControlLabel>Layer</ControlLabel>
                <InputGroup>
                    <FormControl
                        type="text"
                        value={(typeof filterData.layer === 'object' ? (filterData.layer?.title || filterData.layer?.name) : '')}
                        placeholder="Select a data source..."
                        readOnly
                        onClick={() => !(!dashBoardEditing && filterData.layer) && onOpenLayerSelector()}
                        style={{ cursor: !dashBoardEditing && filterData.layer ? 'not-allowed' : 'pointer' }}
                        disabled={!dashBoardEditing && filterData.layer}
                    />
                    <InputGroup.Button>
                        <Button
                            onClick={() => onOpenLayerSelector()}
                            disabled={!dashBoardEditing && filterData.layer}
                        >
                            <Glyphicon glyph="folder-open" />
                        </Button>
                        {isFeaturesSource && hasLayerSelection && (
                            <Button
                                onClick={handleEditLayerFilter}
                                bsStyle={(filterData.filter && (filterData.filter.filterFields?.length > 0 || filterData.filter.spatialField?.geometry || filterData.filter.crossLayerFilter)) ? 'success' : 'primary'}
                                title="Edit layer filter"
                            >
                                <Glyphicon glyph="filter" />
                            </Button>
                        )}
                    </InputGroup.Button>
                </InputGroup>
            </FormGroup>

            {isFeaturesSource && (
                <>
                    <FormGroup className="form-group-flex">
                        <ControlLabel>
                            Values from{' '}
                            <InfoPopover
                                id="ms-filter-values-from-help"
                                placement="right"
                                trigger={['hover', 'focus']}
                                text={
                                    <div className="ms-filter-type-help-popover">
                                        {VALUES_FROM_OPTIONS.map(option => (
                                            <div key={option.value} className="ms-filter-type-help-entry">
                                                <strong>{option.label}:</strong> {option.description}
                                            </div>
                                        ))}
                                    </div>
                                }
                            />
                        </ControlLabel>
                        <InputGroup>
                            <Select
                                value={VALUES_FROM_OPTIONS.find(opt => opt.value === valuesFrom)}
                                options={VALUES_FROM_OPTIONS}
                                placeholder="Select source..."
                                onChange={handleValuesFromChange}
                                clearable={false}
                            />
                        </InputGroup>
                    </FormGroup>

                    <FormGroup className="form-group-flex">
                        <ControlLabel>Value attribute</ControlLabel>
                        <InputGroup>
                            <Select
                                value={valueAttribute ? attributeOptions.find(opt => opt.value === valueAttribute) : null}
                                options={attributeOptions}
                                placeholder="Select attribute..."
                                onChange={handleValueAttributeChange}
                                disabled={!attributeOptions.length && !attributesLoading}
                                isLoading={attributesLoading && !attributeOptions.length}
                                noResultsText={attributeNoResultsText}
                                clearable={false}
                            />
                        </InputGroup>
                    </FormGroup>

                    {valuesFrom === 'single' && (
                        <FormGroup className="form-group-flex">
                            <ControlLabel>Label attribute</ControlLabel>
                            <InputGroup>
                                <Select
                                    value={labelAttribute ? attributeOptions.find(opt => opt.value === labelAttribute) : null}
                                    options={attributeOptions}
                                    placeholder="Select attribute..."
                                    onChange={handleLabelAttributeChange}
                                    disabled={!attributeOptions.length && !attributesLoading}
                                    isLoading={attributesLoading && !attributeOptions.length}
                                    noResultsText={attributeNoResultsText}
                                    clearable={false}
                                />
                            </InputGroup>
                        </FormGroup>
                    )}

                    <FormGroup className="form-group-flex">
                        <ControlLabel>Sort by attribute</ControlLabel>
                        <InputGroup>
                            <Select
                                value={sortByAttribute ? attributeOptions.find(opt => opt.value === sortByAttribute) : null}
                                options={attributeOptions}
                                placeholder="Select attribute..."
                                onChange={handleSortByAttributeChange}
                                disabled={!attributeOptions.length && !attributesLoading}
                                isLoading={attributesLoading && !attributeOptions.length}
                                noResultsText={attributeNoResultsText}
                                clearable={false}
                            />
                            <InputGroup.Button>
                                <ButtonGroup style={{ display: 'flex', flexDirection: 'row' }}>
                                    <TButtonWithTooltip
                                        id="sort-asc"
                                        active={sortOrder === 'ASC'}
                                        onClick={() => handleSortOrderChange('ASC')}
                                        tooltip="Ascending (ASC)"
                                    >
                                        <img src={sortByAttributesIcon} alt="ASC" style={{ width: '16px', height: '16px' }} />
                                    </TButtonWithTooltip>
                                    <TButtonWithTooltip
                                        id="sort-desc"
                                        active={sortOrder === 'DESC'}
                                        onClick={() => handleSortOrderChange('DESC')}
                                        tooltip="Descending (DESC)"
                                    >
                                        <img src={sortByAttributesAltIcon} alt="DESC" style={{ width: '16px', height: '16px' }} />
                                    </TButtonWithTooltip>
                                </ButtonGroup>
                            </InputGroup.Button>
                        </InputGroup>
                    </FormGroup>

                    <FormGroup className="form-group-flex">
                        <ControlLabel>Max features</ControlLabel>
                        <InputGroup>
                            <FormControl
                                type="number"
                                min={1}
                                placeholder="Enter max features..."
                                value={maxFeaturesValue === '' ? '' : `${maxFeaturesValue}`}
                                onChange={handleMaxFeaturesChange}
                            />
                        </InputGroup>
                    </FormGroup>
                </>
            )}

            {isUserDefined && (
                <>

                    <UserDefinedValuesDataGrid
                        items={userDefinedItems}
                        onChange={handleUserDefinedItemsChange}
                        onEditFilter={handleEditUserDefinedItemFilter}
                    />


                    <FormGroup className="form-group-flex">
                        <ControlLabel>Filter composition</ControlLabel>
                        <InputGroup>
                            <Select
                                value={FILTER_COMPOSITION_OPTIONS.find(opt => opt.value === filterComposition)}
                                options={FILTER_COMPOSITION_OPTIONS}
                                placeholder="Select composition..."
                                onChange={handleFilterCompositionChange}
                                clearable={false}
                            />
                        </InputGroup>
                    </FormGroup>

                </>
            )}
        </div>
    );
};

const layerOptionsAndAttributesSelector = createSelector(
    availableLayersSelector,
    (layers = []) => {
        const layerOptions = layers.map(({ value, label }) => ({ value, label }));
        const layerAttributes = layers.reduce((acc, layer) => ({
            ...acc,
            [layer.value]: (layer.fields || [])
                .filter(({ name }) => !!name)
                .map(field => ({
                    value: field.name,
                    label: field.alias || field.name
                }))
        }), {});
        const layerSources = layers.reduce((acc, layer) => ({
            ...acc,
            [layer.value]: layer.originalLayer
        }), {});
        return { layerOptions, layerAttributes, layerSources };
    }
);

export default connect(
    (state) => layerOptionsAndAttributesSelector(state)
)(FilterDataTab);
