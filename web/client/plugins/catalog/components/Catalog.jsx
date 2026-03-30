/*
 * Copyright 2025, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
import React, { useState, useEffect, useMemo } from 'react';
import PropTypes from 'prop-types';
import castArray from 'lodash/castArray';
import { buildServiceUrl } from '../../../utils/CatalogUtils';
import API from '../../../api/catalog';
import { Alert, Glyphicon } from 'react-bootstrap';
import Message from '../../../components/I18N/Message';

import CatalogContentView from '../components/CatalogContentView';
import CatalogServiceSelect from '../components/CatalogServiceSelect';
import CatalogSearchInput from '../components/CatalogSearchInput';
import PaginationCustom from '../../ResourcesCatalog/components/PaginationCustom';
import CatalogServiceEditor from '../../../components/catalog/CatalogServiceEditor';
import FlexBox, { FlexFill } from '../../../components/layout/FlexBox';
import './Catalog.css';
import Button from '../../../components/layout/Button';
import CatalogFiltersForm from './CatalogFiltersForm';
import tooltip from '../../../components/misc/enhancers/tooltip';

const ButtonWithTooltip = tooltip(Button);

export const DEFAULT_ALLOWED_PROVIDERS = ["OpenStreetMap", "OpenSeaMap", "Stamen"];
const KEYWORDS_FILTER = 'filter{keywords.slug.in}';

const shouldAutoload = (service, services) => {
    return service &&
        services[service] &&
        services[service].autoload;
};

const Catalog = ({
    serviceTypes = [
        { name: "csw", label: "CSW" },
        { name: "cog", label: "COG" },
        { name: "wms", label: "WMS" },
        { name: "wmts", label: "WMTS" },
        { name: "tms", label: "TMS", allowedProviders: DEFAULT_ALLOWED_PROVIDERS },
        { name: "wfs", label: "WFS" },
        { name: "3dtiles", label: "3D Tiles" },
        { name: "model", label: "IFC Model" },
        { name: "arcgis", label: "ArcGIS" },
        { name: "geonode", label: "GeoNode" }
    ],
    result,
    selectedFormat,
    layerOptions,
    buttonStyle = {},
    formatOptions = [],
    mode = "view",
    currentLocale = "en-US",
    onChangeCatalogMode = () => { },
    onChangeText = () => { },
    onChangeSelectedService = () => { },
    onDeleteService,
    onAddService = () => { },
    onChangeTitle = () => { },
    onChangeUrl = () => { },
    onChangeType = () => { },
    onChangeServiceFormat = () => { },
    onChangeMetadataTemplate = () => { },
    onToggleAdvancedSettings = () => { },
    onChangeServiceProperty = () => { },
    onToggleTemplate = () => { },
    onToggleThumbnail = () => { },
    onFormatOptionsFetch = () => { },
    onSearch = () => { },
    setNewServiceStatus = () => { },
    onShowSecurityModal = () => { },
    onSetProtectedServices = () => { },
    pageSize = 12,
    loading = false,
    searchText = "",
    addAuthentication = false,
    loadingError,
    layerError,
    saving,
    showFormatError,
    searchOptions,
    selectedService,
    showGetCapLinks = true,
    hideThumbnail = false,
    hideIdentifier = false,
    includeSearchButton = true,
    // hideExpand,  We may need this later
    layers,
    service,
    isNewServiceAdded,
    canEditService,
    urlTooltip,
    isLocalizedLayerStylesEnabled,
    tileSizeOptions,
    formatsLoading,
    infoFormatOptions,
    addonsItems,
    layout = 'list',
    title,
    headerTools,
    onSelect,
    services,
    readOnly,
    showCatalogSelector = true,
    multiSelect = true,
    includeAddToMap = true,
    records,
    selected,
    isAllSelected,
    isIndeterminate,
    handleSelectAll,
    loadingLayers,
    onAddSelected,
    onAddLayer
}, context) => {
    const { messages } = context;
    const [showFilters, setShowFilters] = useState(false);
    const [filters, setFilters] = useState({});
    const [sort, setSort] = useState('-date');
    const serviceCapabilities = API[selectedFormat]?.getCapabilities?.() || {
        filterSupport: false,
        orderBySupport: false
    };
    const search = (params) => {
        const url = buildServiceUrl(services[selectedService]);
        const type = services[selectedService].type;
        isNewServiceAdded && setNewServiceStatus(false);
        onSearch({
            format: type,
            url,
            startPosition: params.start ?? 1,
            maxRecords: pageSize,
            text: params.searchText,
            options: {
                filters: params.filters,
                sort: params.sort,
                service: services[selectedService]
            }
        });
    };

    useEffect(() => {
        if (shouldAutoload(selectedService, services)) {
            search({ searchText });
        }
    }, [services, selectedService, mode]);

    const handleBackClick = () => {
        if (mode === 'edit') {
            onChangeCatalogMode('view', false);
        }
    };

    const renderErrorAndNoRecords = () => {
        if (layerError) {
            return (
                <div className="_padding-sm">
                    <Alert bsStyle="danger">
                        <Message msgId={"catalog.error"} />
                    </Alert>
                </div>
            );
        }
        if (loadingError) {
            return (
                <div className="_padding-sm">
                    <Alert bsStyle="danger">
                        <Message msgId={"catalog.error"} />
                    </Alert>
                </div>
            );
        }
        if (result) {
            if (result.numberOfRecordsMatched === 0) {
                return (
                    <div className="_padding-sm">
                        <Message msgId="catalog.noRecordsMatched" />
                    </div>
                );
            }
        }
        return null;
    };

    const onFilterChange = (newFilters, clear = false) => {
        const updatedFilters = clear ? {} : { ...filters, ...newFilters };
        setFilters(updatedFilters);
        search({ searchText: searchOptions?.searchText, filters: updatedFilters, sort });
    };

    const onTagClick = (tagValue) => {
        if (!serviceCapabilities.filterSupport) {
            return;
        }
        const currentTags = castArray(filters[KEYWORDS_FILTER] || []);
        const updatedTags = currentTags.includes(tagValue)
            ? currentTags.filter((value) => value !== tagValue)
            : [...currentTags, tagValue];
        onFilterChange({
            [KEYWORDS_FILTER]: updatedTags
        });
    };

    const onSortChange = (newSort) => {
        setSort(newSort);
        search({ searchText: searchOptions?.searchText, filters, sort: newSort, start: searchOptions?.startPosition });
    };

    const hasActiveFilters = useMemo(() => serviceCapabilities.filterSupport && Object.keys(filters).length > 0, [serviceCapabilities.filterSupport, filters]);

    const searchInputNode = (
        <CatalogSearchInput
            searchText={searchText}
            onChangeText={onChangeText}
            enableFilters={serviceCapabilities.filterSupport}
            onToggleFilters={() => setShowFilters(!showFilters)}
            includeSearchButton={includeSearchButton}
            onShowSecurityModal={onShowSecurityModal}
            onSetProtectedServices={onSetProtectedServices}
            currentService={services[selectedService]}
            hasActiveFilters={hasActiveFilters}
        />
    );

    const catalogServiceSelectNode = showCatalogSelector ? (
        <CatalogServiceSelect
            setShowFilters={setShowFilters}
            selectedService={selectedService}
            onChangeSelectedService={onChangeSelectedService}
            services={services}
            canEdit={canEditService}
            onConfigureClick={onChangeCatalogMode}
            messages={messages}
            onDeleteService={onDeleteService}
        />
    ) : null;

    return (
        <FlexBox
            column
            className={`ms-catalog${layout ? ` ${layout}` : ''}`}
            classNames={["_relative", "_fill"]}
        >
            {/* Header Section */}
            <FlexBox
                gap="sm"
                centerChildrenVertically
                className="ms-catalog-header"
            >
                <FlexBox gap="sm" centerChildrenVertically className="ms-catalog-header-start">
                    {mode === 'edit' && (
                        <ButtonWithTooltip
                            onClick={handleBackClick}
                            tooltipId= "catalog.backToList"
                        >
                            <Glyphicon glyph="arrow-left" />
                        </ButtonWithTooltip>
                    )}
                    <Glyphicon glyph="folder-open" />
                    {title ? title : <Message msgId="catalog.title" />}
                </FlexBox>
                {/* Additional header content for dialog mode */}
                {layout !== 'list' && mode !== 'edit' && (
                    <>
                        {searchInputNode}
                    </>
                )}
                <FlexBox gap="sm" centerChildrenVertically className="ms-catalog-header-end">
                    {layout !== 'list' && mode !== 'edit' && (
                        <>
                            {catalogServiceSelectNode}
                        </>
                    )}
                    {headerTools}
                </FlexBox>
            </FlexBox>
            {layout === 'list' && mode !== 'edit' ?
                <FlexBox gap="sm" classNames={['_padding-sm']}  column>
                    {catalogServiceSelectNode}
                    {searchInputNode}
                </FlexBox>
                : null}
            {/* Main Content or Editor */}
            {mode !== 'edit' ? (
                <FlexFill flexBox className="ms-catalog-main-content">
                    {showFilters ? <CatalogFiltersForm
                        filters={filters}
                        currentService={services[selectedService]}
                        className="ms-catalog-filters-form"
                        id="ms-catalog-filter-form"
                        query={filters}
                        onChange={(newParams) => onFilterChange(newParams, false)}
                        onClear={() =>  onFilterChange({}, true)}
                        onClose={() => setShowFilters(!showFilters)}
                    />
                        : null}
                    <FlexFill flexBox className="_relative ms-catalog-results-panel">
                        {!loadingError && result?.numberOfRecordsMatched !== 0 && (
                            <CatalogContentView
                                hideIdentifier={hideIdentifier}
                                hideThumbnail={hideThumbnail}
                                showGetCapLinks={showGetCapLinks}
                                addAuthentication={addAuthentication}
                                sort={sort}
                                onSortChange={onSortChange}
                                showFilters={showFilters}
                                onToggleFilters={() => setShowFilters(!showFilters)}
                                filters={filters}
                                onFilterChange={onFilterChange}
                                onTagClick={onTagClick}
                                selectedFormat={selectedFormat}
                                currentService={services[selectedService]}
                                loading={loading}
                                records={records}
                                total={result?.numberOfRecordsMatched || 0}
                                selectedLayers={selected}
                                isAllSelected={isAllSelected}
                                isIndeterminate={isIndeterminate}
                                onSelectAll={handleSelectAll}
                                onAddSelected={() => onAddSelected(selected)}
                                onToggleLayer={(record, checked) => {
                                    onSelect(record, checked);
                                }}
                                loadingLayers={loadingLayers}
                                onAddLayer={record => onAddLayer(record)}
                                getRecordStatus={(record) => {
                                    const isChecked = selected.some(layer => layer?.identifier === record?.identifier);
                                    const background = record?.background;
                                    const disabled = !!(background && (layers || []).find(layer => layer.id === background.name ||
                                        layer.type === background.type && layer.source === background.source && layer.name === background.name));
                                    const loading_ = loadingLayers?.includes(record?.identifier);
                                    return { isChecked, disabled, loading: loading_ };
                                }}
                                currentLocale={currentLocale}
                                readOnly={readOnly}
                                enableOrderBy={serviceCapabilities.orderBySupport}
                                multiSelect={multiSelect}
                                includeAddToMap={includeAddToMap}
                                messages={messages}
                            >
                                {!!result ? <FlexBox
                                    style={{ zIndex: 1000 }}
                                    classNames={['ms-main-colors', '_padding-tb-sm', 'ms-main-bg']}
                                    centerChildren
                                >
                                    <PaginationCustom
                                        activePage={Math.ceil((searchOptions?.startPosition || 1) / pageSize)}
                                        items={Math.ceil((result?.numberOfRecordsMatched || 0) / pageSize)}
                                        onSelect={(page) => {
                                            search({ start: (page - 1) * pageSize + 1, searchText, filters, sort });
                                        }}
                                    />
                                </FlexBox> : null}
                            </CatalogContentView>
                        )}
                        {renderErrorAndNoRecords()}
                    </FlexFill>
                </FlexFill>
            ) : (
                <CatalogServiceEditor
                    service={service}
                    onAddService={onAddService}
                    onDeleteService={onDeleteService}
                    onChangeCatalogMode={onChangeCatalogMode}
                    isNew={service?.isNew}
                    selectedService={selectedService}
                    services={services}
                    serviceTypes={serviceTypes}
                    onChangeTitle={onChangeTitle}
                    onChangeUrl={onChangeUrl}
                    addonsItems={addonsItems}
                    onChangeType={onChangeType}
                    urlTooltip={urlTooltip}
                    formatOptions={formatOptions}
                    buttonStyle={buttonStyle}
                    saving={saving}
                    showFormatError={showFormatError}
                    onChangeServiceFormat={onChangeServiceFormat}
                    onChangeMetadataTemplate={onChangeMetadataTemplate}
                    onToggleAdvancedSettings={onToggleAdvancedSettings}
                    onChangeServiceProperty={onChangeServiceProperty}
                    onToggleTemplate={onToggleTemplate}
                    onToggleThumbnail={onToggleThumbnail}
                    onFormatOptionsFetch={onFormatOptionsFetch}
                    isLocalizedLayerStylesEnabled={isLocalizedLayerStylesEnabled}
                    tileSizeOptions={tileSizeOptions}
                    formatsLoading={formatsLoading}
                    layerOptions={layerOptions}
                    infoFormatOptions={infoFormatOptions}
                />
            )}
        </FlexBox>
    );
};

Catalog.contextTypes = {
    messages: PropTypes.object,
    loadedPlugins: PropTypes.object
};

export default Catalog;
