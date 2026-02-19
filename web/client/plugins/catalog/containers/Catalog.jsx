/*
 * Copyright 2025, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
import React, { useState, useEffect, useMemo } from 'react';
import { connect } from 'react-redux';
import { createStructuredSelector } from 'reselect';
import PropTypes from 'prop-types';
import usePluginItems from '../../../hooks/usePluginItems';
import { addBackgroundProperties, backgroundAdded, clearModalParameters } from '../../../actions/backgroundselector';
import { projectionSelector } from '../../../selectors/map';
import { mapLayoutValuesSelector } from '../../../selectors/maplayout';
import { setProtectedServices, setShowModalStatus } from '../../../actions/security';
import { changeLayerProperties } from '../../../actions/layers';
import { layersSelector } from '../../../selectors/layers';
import { metadataSourceSelector, modalParamsSelector } from '../../../selectors/backgroundselector';
import { setControlProperty, toggleControl } from '../../../actions/controls';
import { currentLocaleSelector, currentMessagesSelector } from '../../../selectors/locale';
import { isLocalizedLayerStylesEnabledSelector } from '../../../selectors/localizedLayerStyles';
import { DEFAULT_PANEL_WIDTH } from '../../../utils/LayoutUtils';
import {
    addLayer,
    addLayerError,
    addService,
    catalogClose,
    changeCatalogFormat,
    changeCatalogMode,
    changeMetadataTemplate,
    changeSelectedService,
    changeServiceFormat,
    changeServiceProperty,
    changeText,
    changeTitle,
    changeType,
    changeUrl,
    deleteService,
    focusServicesList,
    formatOptionsFetch,
    textSearch,
    toggleAdvancedSettings,
    toggleTemplate,
    toggleThumbnail,
    setNewServiceStatus,
    initPlugin
} from '../../../actions/catalog';
import {
    isActiveSelector,
    authkeyParamNameSelector,
    groupSelector,
    layerErrorSelector,
    loadingErrorSelector,
    loadingSelector,
    modeSelector,
    newServiceSelector,
    newServiceTypeSelector,
    pageSizeSelector,
    resultSelector,
    savingSelector,
    searchOptionsSelector,
    searchTextSelector,
    selectedServiceLayerOptionsSelector,
    selectedServiceSelector,
    selectedServiceTypeSelector,
    serviceListOpenSelector,
    servicesSelector,
    servicesSelectorWithBackgrounds,
    tileSizeOptionsSelector,
    formatsLoadingSelector,
    getSupportedFormatsSelector,
    getSupportedGFIFormatsSelector,
    getNewServiceStatusSelector,
    showFormatErrorSelector,
    canEditServiceSelector
} from '../../../selectors/catalog';
import { buildServiceUrl } from '../../../utils/CatalogUtils';
import API from '../../../api/catalog';
import { Alert } from 'react-bootstrap';
import Message from '../../../components/I18N/Message';

import CatalogWrapper from '../components/CatalogWrapper';
import CatalogHeader from '../components/CatalogHeader';
import CatalogHeaderControls from '../components/CatalogHeaderControls';
import CatalogServiceBar from '../components/CatalogServiceBar';
import CatalogContentView from '../components/CatalogContentView';
import CatalogServiceSelect from '../components/CatalogServiceSelect';
import CatalogSearchInput from '../components/CatalogSearchInput';
import CatalogLayerCard from '../components/CatalogLayerCard';
import PaginationCustom from '../../ResourcesCatalog/components/PaginationCustom';
import CatalogServiceEditor from '../../../components/catalog/CatalogServiceEditor';

import { useCatalogSelection } from '../hooks/useCatalogSelection';
import { addLayerToMap } from '../../../utils/GeonodeUtils';


export const DEFAULT_ALLOWED_PROVIDERS = ["OpenStreetMap", "OpenSeaMap", "Stamen"];

const Catalog = ({
    items = [],
    editingAllowedRoles = ["ALL"],
    editingAllowedGroups = undefined,
    onInitPlugin = () => { },
    closeCatalog = () => { },
    group = null,
    source,
    services: servicesProp = {},
    servicesWithBackgrounds = {},
    active = false,
    width = DEFAULT_PANEL_WIDTH,
    dockStyle = {},
    panelStyle = {
        zIndex: 100,
        overflow: "hidden",
        height: "100%"
    },
    panelClassName = "catalog-panel",
    id = "mapstore-metadata-explorer",
    serviceTypes = [{ name: "csw", label: "CSW" }, { name: "cog", label: "COG" }, { name: "wms", label: "WMS" }, { name: "wmts", label: "WMTS" }, { name: "tms", label: "TMS", allowedProviders: DEFAULT_ALLOWED_PROVIDERS }, { name: "wfs", label: "WFS" }, { name: "3dtiles", label: "3D Tiles" }, { name: "model", label: "IFC Model" }, { name: "arcgis", label: "ArcGIS" }, {
        name: "geonode",
        label: "GeoNode",
    }],
    wrap = false,
    modal = true,
    wrapWithPanel = false,
    closeGlyph = "1-close",
    zoomToLayer = true,
    dockProps = {
        dimMode: "none",
        fluid: false,
        position: "right",
        zIndex: 1030
    },
    result,
    selectedFormat,
    options,
    layerOptions,
    locales,
    buttonStyle = {
        marginBottom: "10px",
        marginRight: "5px"
    },
    formatOptions = [],
    advancedRasterStyles = {
        display: 'flex',
        alignItems: 'center',
        paddingTop: 15,
        borderTop: '1px solid #ddd'
    },
    mode = "view",
    searchOnStartup,
    buttonClassName = "search-button",
    currentLocale = "en-US",
    format = "csw",
    includeSearchButton = true,
    includeResetButton = false,
    onChangeCatalogMode = () => { },
    onChangeFormat = () => { },
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
    onPropertiesChange = () => { },
    onError = () => { },
    onLayerAdd = () => { },
    onReset = () => { },
    onSearch = () => { },
    changeLayerProperties = () => { },
    setNewServiceStatus = () => { },
    onShowSecurityModal = () => { },
    onSetProtectedServices = () => { },
    pageSize = 12,
    loading = false,
    wrapOptions = false,
    crs = "EPSG:3857",
    searchText = "",
    addAuthentication = false,
    gridOptions,
    loadingError,
    layerError,
    saving,
    showFormatError,
    onAddBackground,
    authkeyParamNames,
    recordItem,
    searchOptions,
    selectedService,
    showGetCapLinks,
    hideThumbnail,
    hideIdentifier,
    hideExpand,
    onAddBackgroundProperties,
    modalParams,
    layers,
    clearModal,
    service,
    isNewServiceAdded,
    canEdit,
    urlTooltip,
    isLocalizedLayerStylesEnabled,
    tileSizeOptions,
    formatsLoading,
    infoFormatOptions
}, context) => {
    const { messages, loadedPlugins } = context;
    const [panel, setPanel] = useState(true);
    const [addingLayers, setAddingLayers] = useState(false);
    const [showFilters, setShowFilters] = useState(false);
    const [filters, setFilters] = useState({});
    const [sort, setSort] = useState('-date');

    const addonsItems = usePluginItems({ items: items, loadedPlugins }).filter(({ target }) => target === 'url-addon');
    const layerBaseConfig = {
        group: group || undefined
    };
    const services = source === 'backgroundSelector' ? servicesWithBackgrounds : servicesProp;

    const records = useMemo(() => {
        return result && selectedFormat && API[selectedFormat]?.getCatalogRecords
            ? API[selectedFormat].getCatalogRecords(result, { ...options, layerOptions, service: services[selectedService] }, locales).map(record => {
                const updatedRecord = { ...record };

                if (services[selectedService]?.showTemplate && services[selectedService]?.metadataTemplate) {
                    updatedRecord.showTemplate = true;
                    updatedRecord.metadataTemplate = services[selectedService]?.metadataTemplate;
                }

                if (services[selectedService]?.hideThumbnail !== undefined) {
                    updatedRecord.hideThumbnail = services[selectedService]?.hideThumbnail;
                }

                return updatedRecord;
            })
            : [];
    }, [result, selectedFormat, options, layerOptions, services, selectedService, locales]);

    const shouldAutoload = (service, services) => {
        return service &&
            services[service] &&
            services[service].autoload;
    };

    const search = ({
        start = 1,
        searchText,
        filters,
        sort
    }) => {
        const url = buildServiceUrl(services[selectedService]);
        const type = services[selectedService].type;
        isNewServiceAdded && setNewServiceStatus(false);
        onSearch({
            format: type,
            url,
            startPosition: start,
            maxRecords: pageSize,
            text: searchText,
            options: {
                filters,
                sort,
                service: services[selectedService]
            }
        });
    }

    useEffect(() => {
        onInitPlugin({
            editingAllowedRoles,
            editingAllowedGroups,
        });
        return () => {
            closeCatalog();
        };
    }, []);

    useEffect(() => {
        if (shouldAutoload(selectedService, services)) {
            search({ searchText });
        }
    }, [services, selectedService, mode]);

    const wrapCards = !panel || wrapWithPanel;


    const handleBackClick = () => {
        if (mode === 'edit') {
            onChangeCatalogMode('view', false);
        }
    };

    const renderCard = ({ record, isChecked, onToggle, isPanel }) => {
        return (
            <CatalogLayerCard
                key={record.identifier}
                crs={crs}
                clearModal={clearModal}
                layers={layers}
                modalParams={modalParams}
                onAddBackgroundProperties={onAddBackgroundProperties}
                onAddBackground={onAddBackground}
                source={source}
                onLayerAdd={onLayerAdd}
                onPropertiesChange={onPropertiesChange}
                zoomToLayer={zoomToLayer}
                hideThumbnail={record.hideThumbnail}
                hideIdentifier={record.hideIdentifier}
                hideExpand={hideExpand}
                onError={onError}
                catalogURL={services[selectedService]?.url}
                catalogType={services[selectedService]?.type}
                service={services[selectedService]}
                selectedService={selectedService}
                showTemplate={record.showTemplate}
                metadataTemplate={record.metadataTemplate}
                record={record}
                authkeyParamNames={authkeyParamNames}
                showGetCapLinks={showGetCapLinks}
                addAuthentication={addAuthentication}
                currentLocale={currentLocale}
                defaultFormat={services[selectedService]?.format}
                layerBaseConfig={layerBaseConfig}
                messages={messages}
                isChecked={isChecked}
                onToggle={onToggle}
                isPanel={isPanel}
                readOnly={source === 'backgroundSelector'}
            />
        );
    };

    const renderErrorAndNoRecords = () => {
        if (loadingError) {
            return (
                <Alert bsStyle="danger">
                    <Message msgId={loadingError || "catalog.error"} />
                </Alert>
            );
        }
        if (result) {
            if (result.numberOfRecordsMatched === 0) {
                return (
                    <div>
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

    const handleAddSelectedLayers = () => {
        setAddingLayers(true);
        const addPromises = selectedLayers.map(record =>
            addLayerToMap({
                record,
                service: services[selectedService],
                defaultFormat: selectedFormat,
                layerBaseConfig,
                authkeyParamNames,
                catalogType: selectedFormat,
                crs,
                selectedService,
                onError,
                onLayerAdd,
                source,
                onAddBackground,
                onAddBackgroundProperties,
                zoomToLayer
            }).catch(error => {
                console.error('Error adding layer:', error);
                onError('catalog.addLayerError');
            })
        );

        Promise.all(addPromises)
            .then(() => {
                clearSelection();
            })
            .finally(() => {
                setAddingLayers(false);
            });
    };

    const onFilterChange = (newFilters, clear = false) => {
        const updatedFilters = clear ? {} : { ...filters, ...newFilters };
        setFilters(updatedFilters);
        search({ searchText: searchOptions?.searchText, filters: updatedFilters, sort });
    };

    const onSortChange = (newSort) => {
        setSort(newSort);
        search({ searchText: searchOptions?.searchText, filters, sort: newSort, start: searchOptions?.startPosition });
    };

    return (
        <CatalogWrapper isPanel={panel} active={active} dockStyle={dockStyle}>
            {/* Header Section */}
            <CatalogHeader
                mode={mode}
                isPanel={panel}
                onBackClick={handleBackClick}
                onClose={() => {
                    closeCatalog();
                    if (!panel) setPanel(true);
                }}
                showClose={false}
            >
                {/* Additional header content for dialog mode */}
                {!panel && mode !== 'edit' && (
                    <>
                        <CatalogSearchInput
                            searchText={searchText}
                            messages={messages}
                            onChangeText={onChangeText}
                            isCentered
                        />
                        <CatalogServiceSelect
                            selectedService={selectedService}
                            onChangeSelectedService={onChangeSelectedService}
                            services={services}
                            canEdit={canEdit}
                            onConfigureClick={onChangeCatalogMode}
                            messages={messages}
                            onDeleteService={onDeleteService}
                        />
                    </>
                )}
                <CatalogHeaderControls
                    isPanel={panel}
                    onToggleMode={() => setPanel(!panel)}
                    onClose={() => {
                        closeCatalog();
                        if (!panel) setPanel(true);
                    }}
                />
            </CatalogHeader>

            {panel && mode !== 'edit' && (
                <CatalogServiceBar
                    isPanel={panel}
                    ServiceSelectComponent={CatalogServiceSelect}
                    SearchInputComponent={CatalogSearchInput}
                    serviceSelectProps={{
                        selectedService,
                        onChangeSelectedService,
                        services,
                        canEdit,
                        onConfigureClick: onChangeCatalogMode,
                        messages,
                        onDeleteService
                    }}
                    searchInputProps={{
                        searchText,
                        onChangeText,
                        messages,
                        isCentered: false
                    }}
                />
            )}

            {/* Main Content or Editor */}
            {mode !== 'edit' ? (
                <>
                    {renderErrorAndNoRecords()}
                    {!loadingError && result?.numberOfRecordsMatched !== 0 && (
                        <CatalogContentView
                            sort={sort}
                            onSortChange={onSortChange}
                            showFilters={showFilters}
                            onToggleFilters={() => setShowFilters(!showFilters)}
                            filters={filters}
                            onFilterChange={onFilterChange}
                            selectedFormat={selectedFormat}
                            currentservice={services[selectedService]}
                            isPanel={panel}
                            wrapCards={wrapCards}
                            loading={loading}
                            records={records}
                            total={result?.numberOfRecordsMatched || 0}
                            selectedLayers={selectedLayers}
                            isAllSelected={isAllSelected}
                            isIndeterminate={isIndeterminate}
                            onSelectAll={handleSelectAll}
                            onAddSelected={handleAddSelectedLayers}
                            onToggleLayer={handleToggleLayer}
                            renderCard={renderCard}
                            paginationProps={
                                {
                                    currentPage: Math.ceil((searchOptions?.startPosition || 1) / pageSize),
                                    totalPages: Math.ceil((result?.numberOfRecordsMatched || 0) / pageSize),
                                    onPageChange: (page) => {
                                        search({ start: (page - 1) * pageSize + 1, searchText, filters, sort });
                                    },
                                    PaginationComponent: result && !isNewServiceAdded ? PaginationCustom : () => <></>
                                }
                            }

                            addingLayers={addingLayers}
                        />
                    )}
                </>
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
        </CatalogWrapper>
    );
}

Catalog.contextTypes = {
    messages: PropTypes.object,
    loadedPlugins: PropTypes.object
};

const layerCatalogSelector = createStructuredSelector({
    //Catalog
    searchOptions: searchOptionsSelector,
    showFormatError: showFormatErrorSelector,
    result: resultSelector,
    loadingError: loadingErrorSelector,
    selectedService: selectedServiceSelector,
    mode: modeSelector,
    services: servicesSelector,
    servicesWithBackgrounds: servicesSelectorWithBackgrounds,
    layerError: layerErrorSelector,
    active: isActiveSelector,
    searchText: searchTextSelector,
    authkeyParamNames: authkeyParamNameSelector,
    saving: savingSelector,
    openCatalogServiceList: serviceListOpenSelector,
    service: newServiceSelector,
    format: newServiceTypeSelector,
    selectedFormat: selectedServiceTypeSelector,
    layerOptions: selectedServiceLayerOptionsSelector,
    tileSizeOptions: tileSizeOptionsSelector,
    pageSize: pageSizeSelector,
    loading: loadingSelector,
    formatsLoading: formatsLoadingSelector,
    formatOptions: getSupportedFormatsSelector,
    infoFormatOptions: getSupportedGFIFormatsSelector,
    isNewServiceAdded: getNewServiceStatusSelector,
    canEdit: canEditServiceSelector,
    // localconfig 
    isLocalizedLayerStylesEnabled: isLocalizedLayerStylesEnabledSelector,
    // map 
    crs: projectionSelector,
    // locale 
    currentLocale: currentLocaleSelector,
    locales: currentMessagesSelector,
    // layers 
    layers: layersSelector,
    // layout 
    dockStyle: state => mapLayoutValuesSelector(state, { height: true, right: true }, true),
    // controls 
    group: groupSelector,
    // backgorund 
    source: metadataSourceSelector,
    modalParams: modalParamsSelector,
});

const ConnectedCatalog = connect(layerCatalogSelector, {
    onSearch: textSearch,
    onLayerAdd: addLayer,
    closeCatalog: catalogClose,
    onChangeFormat: changeCatalogFormat,
    onChangeServiceFormat: changeServiceFormat,
    onChangeUrl: changeUrl,
    onChangeType: changeType,
    onChangeTitle: changeTitle,
    onChangeMetadataTemplate: changeMetadataTemplate,
    onChangeText: changeText,
    onChangeServiceProperty: changeServiceProperty,
    onChangeSelectedService: changeSelectedService,
    onChangeCatalogMode: changeCatalogMode,
    onAddService: addService,
    onToggleAdvancedSettings: toggleAdvancedSettings,
    onToggleThumbnail: toggleThumbnail,
    onToggleTemplate: toggleTemplate,
    onDeleteService: deleteService,
    onError: addLayerError,
    onFocusServicesList: focusServicesList,
    onAddBackground: backgroundAdded,
    onFormatOptionsFetch: formatOptionsFetch,
    setNewServiceStatus,
    onInitPlugin: initPlugin,
    // background 
    clearModal: clearModalParameters,
    // add layer action to pass to the layers
    onAddBackgroundProperties: addBackgroundProperties,
    // layers 
    onPropertiesChange: changeLayerProperties,
    // controls 
    onToggle: toggleControl.bind(null, 'backgroundSelector', null),
    onLayerChange: setControlProperty.bind(null, 'backgroundSelector'),
    onStartChange: setControlProperty.bind(null, 'backgroundSelector', 'start'),
    // security
    onShowSecurityModal: setShowModalStatus,
    onSetProtectedServices: setProtectedServices,
})(Catalog);

export default ConnectedCatalog;