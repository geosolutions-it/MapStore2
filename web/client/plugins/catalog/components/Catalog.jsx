/*
 * Copyright 2025, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
import React, { useState, useEffect, useMemo } from 'react';
import PropTypes from 'prop-types';
import { buildServiceUrl, buildSRSMap } from '../../../utils/CatalogUtils';
import API from '../../../api/catalog';
import { Alert, Glyphicon } from 'react-bootstrap';
import Message from '../../../components/I18N/Message';

import CatalogContentView from '../components/CatalogContentView';
import CatalogServiceSelect from '../components/CatalogServiceSelect';
import CatalogSearchInput from '../components/CatalogSearchInput';
import PaginationCustom from '../../ResourcesCatalog/components/PaginationCustom';
import CatalogServiceEditor from '../../../components/catalog/CatalogServiceEditor';

import { useCatalogSelection } from '../hooks/useCatalogSelection';
import FlexBox, { FlexFill } from '../../../components/layout/FlexBox';
import { getResolutions } from '../../../utils/MapUtils';
import { isAllowedSRS, isSRSAllowed } from '../../../utils/CoordinatesUtils';
import './Catalog.css';
import Button from '../../../components/layout/Button';
import CatalogFiltersForm from './CatalogFiltersForm';

export const DEFAULT_ALLOWED_PROVIDERS = ["OpenStreetMap", "OpenSeaMap", "Stamen"];

const shouldAutoload = (service, services) => {
    return service &&
        services[service] &&
        services[service].autoload;
};

// selected,
// onRecordSelected,
// items = [],
// total,
// catalog,
// error,
// getItems = (_items) => getCatalogItems(_items, selected),
// onItemClick = ({record} = {}) => onRecordSelected(record, catalog),

const Catalog = ({
    group = null,
    // width = DEFAULT_PANEL_WIDTH,
    // panelStyle = {
    //     zIndex: 100,
    //     overflow: "hidden",
    //     height: "100%"
    // },
    // panelClassName = "catalog-panel",
    // id = "mapstore-metadata-explorer",
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
    // wrap = false,
    // modal = true,
    // wrapWithPanel = false,
    // closeGlyph = "1-close",
    // dockProps = {
    //     dimMode: "none",
    //     fluid: false,
    //     position: "right",
    //     zIndex: 1030
    // },
    result,
    selectedFormat,
    // options,
    layerOptions,
    locales,
    buttonStyle = {},
    formatOptions = [],
    // advancedRasterStyles = {
    //     display: 'flex',
    //     alignItems: 'center',
    //     paddingTop: 15,
    //     borderTop: '1px solid #ddd'
    // },
    mode = "view",
    // searchOnStartup,
    // buttonClassName = "search-button",
    currentLocale = "en-US",
    // format = "csw",
    // includeSearchButton = true,
    // includeResetButton = false,
    onChangeCatalogMode = () => { },
    // onChangeFormat = () => { },
    onChangeText = () => { },
    onChangeSelectedService = () => { },
    onDeleteService = () => { },
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
    // onPropertiesChange = () => { },
    onError = () => { },
    // onReset = () => { },
    onSearch = () => { },
    // changeLayerProperties = () => { },
    setNewServiceStatus = () => { },
    // onShowSecurityModal = () => { },
    // onSetProtectedServices = () => { },
    pageSize = 12,
    loading = false,
    // wrapOptions = false,
    crs = "EPSG:3857",
    searchText = "",
    // addAuthentication = false,
    // gridOptions,
    loadingError,
    // layerError,
    saving,
    showFormatError,
    authkeyParamNames,
    // recordItem,
    searchOptions,
    selectedService,
    // showGetCapLinks,
    // hideThumbnail,
    // hideIdentifier,
    // hideExpand,
    // modalParams,
    layers,
    // clearModal,
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
    headerTools,
    onSelect,
    services,
    readOnly,
    showCatalogSelector = true
    // multiSelect = false
}, context) => {
    const { messages } = context;
    const [loadingLayers, setLoadingLayers] = useState([]);
    const [showFilters, setShowFilters] = useState(false);
    const [filters, setFilters] = useState({});
    const [sort, setSort] = useState('-date');
    const layerBaseConfig = {
        group: group || undefined
    };
    const serviceCapabilities = API[selectedFormat]?.getCapabilities?.() || {
        filterSupport: false,
        orderBySupport: false
    };
    const records = useMemo(() => {
        return result && selectedFormat && API[selectedFormat]?.getCatalogRecords
            ? (API[selectedFormat].getCatalogRecords(result, { ...searchOptions, layerOptions, service: services[selectedService] }, locales) || [])
                .map(record => {
                    return {
                        ...record,
                        ...(services[selectedService]?.showTemplate && services[selectedService]?.metadataTemplate && {
                            showTemplate: true,
                            metadataTemplate: services[selectedService]?.metadataTemplate
                        }),
                        ...(services[selectedService]?.hideThumbnail !== undefined && {
                            hideThumbnail: services[selectedService]?.hideThumbnail
                        })
                    };
                })
            : [];
    }, [result, selectedFormat, searchOptions, layerOptions, services, selectedService, locales]);

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
        if (loadingError) {
            return (
                <div className="_padding-sm">
                    <Alert bsStyle="danger">
                        <Message msgId={loadingError || "catalog.error"} />
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

    const {
        selectedLayers,
        isAllSelected,
        isIndeterminate,
        handleToggleLayer,
        handleSelectAll,
        clearSelection
    } = useCatalogSelection(records, selectedService);

    const isSRSNotAllowed = (record) => {
        if (record.serviceType !== 'cog') {
            const ogcReferences = record.ogcReferences || { SRS: [] };
            const allowedSRS = ogcReferences?.SRS?.length > 0 && buildSRSMap(ogcReferences.SRS);
            return allowedSRS && !isAllowedSRS(crs, allowedSRS);
        }
        const recordCrs = record?.sourceMetadata?.crs;
        return recordCrs && !isSRSAllowed(recordCrs);
    };

    const handleAddRecordToMap = (record, serviceType = record.serviceType) => {
        if (isSRSNotAllowed(record)) {
            onError('catalog.srs_not_allowed');
            return Promise.resolve();
        }
        const selectedServiceOptions = services[selectedService];
        return API[serviceType].getLayerFromRecord(record, {
            fetchCapabilities: !!record.fetchCapabilities,
            service: {
                ...selectedServiceOptions,
                format: selectedServiceOptions?.format ?? 'image/png'
            },
            layerBaseConfig,
            removeParams: authkeyParamNames,
            catalogURL: selectedService?.type === "csw" && selectedService?.url
                ? selectedService.url +
                "?request=GetRecordById&service=CSW&version=2.0.2&elementSetName=full&id=" +
                record.identifier
                : null,
            map: {
                projection: crs,
                resolutions: getResolutions()
            }// ,
            // enableImageryOverlay // TODO: see https://github.com/geosolutions-it/MapStore2/pull/12001
        }, true)
            .then((layer) => {
                if (layer) {
                    let layerOpts = layer;
                    if (selectedServiceOptions?.protectedId && selectedService) {
                        layerOpts = {
                            ...layerOpts,
                            security: {
                                type: "basic",
                                sourceId: selectedServiceOptions.protectedId
                            }
                        };
                    }
                    onSelect({ record, layer: layerOpts });
                }
            });
    };

    function handleAddLayers(newRecords) {
        setLoadingLayers(newRecords.map(record => record.identifier));
        return Promise.all(
            newRecords.map(record => handleAddRecordToMap(record))
        )
            .then(() => {
                clearSelection();
            })
            .catch((error) => {
                console.error('Error adding layer:', error);
                onError('catalog.addLayerError');
            })
            .finally(() => {
                // delay the loading finalization
                // to visualize spinner in UI
                setTimeout(() => {
                    setLoadingLayers([]);
                }, 300);
            });
    }

    const onFilterChange = (newFilters, clear = false) => {
        const updatedFilters = clear ? {} : { ...filters, ...newFilters };
        setFilters(updatedFilters);
        search({ searchText: searchOptions?.searchText, filters: updatedFilters, sort });
    };

    const onSortChange = (newSort) => {
        setSort(newSort);
        search({ searchText: searchOptions?.searchText, filters, sort: newSort, start: searchOptions?.startPosition });
    };

    const searchInputNode = (
        <CatalogSearchInput
            searchText={searchText}
            onChangeText={onChangeText}
            enableFilters={serviceCapabilities.filterSupport}
            onToggleFilters={() => setShowFilters(!showFilters)}
        />
    );

    const catalogServiceSelectNode = showCatalogSelector ? (
        <CatalogServiceSelect
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
                        <Button
                            onClick={handleBackClick}
                            title="Back to Catalog"
                        >
                            <Glyphicon glyph="arrow-left" />
                        </Button>
                    )}
                    <Glyphicon glyph="folder-open" />
                    <Message msgId="catalog.title" />
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
                <FlexFill flexBox>
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
                    <FlexFill flexBox className="_relative">
                        {!loadingError && result?.numberOfRecordsMatched !== 0 && (
                            <CatalogContentView
                                sort={sort}
                                onSortChange={onSortChange}
                                showFilters={showFilters}
                                onToggleFilters={() => setShowFilters(!showFilters)}
                                filters={filters}
                                onFilterChange={onFilterChange}
                                selectedFormat={selectedFormat}
                                currentService={services[selectedService]}
                                loading={loading}
                                records={records}
                                total={result?.numberOfRecordsMatched || 0}
                                selectedLayers={selectedLayers}
                                isAllSelected={isAllSelected}
                                isIndeterminate={isIndeterminate}
                                onSelectAll={handleSelectAll}
                                onAddSelected={() => handleAddLayers(selectedLayers)}
                                onToggleLayer={handleToggleLayer}
                                loadingLayers={loadingLayers}
                                onAddLayer={record => handleAddLayers([record])}
                                layers={layers}
                                currentLocale={currentLocale}
                                readOnly={readOnly}
                                enableOrderBy={serviceCapabilities.orderBySupport}
                            >
                                {!!(result && !isNewServiceAdded) ? <FlexBox
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
                    onAddService={onAddService}
                    onChangeCatalogMode={onChangeCatalogMode}
                    service={service}
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
                    onDeleteService={onDeleteService}
                    onFormatOptionsFetch={onFormatOptionsFetch}
                    selectedService={selectedService}
                    isLocalizedLayerStylesEnabled={isLocalizedLayerStylesEnabled}
                    tileSizeOptions={tileSizeOptions}
                    formatsLoading={formatsLoading}
                    layerOptions={layerOptions}
                    infoFormatOptions={infoFormatOptions}
                    services={services}
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
