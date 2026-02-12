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
import { addBackground, addBackgroundProperties, backgroundAdded, clearModalParameters } from '../../../actions/backgroundselector';
import { projectionSelector } from '../../../selectors/map';
import { mapLayoutValuesSelector } from '../../../selectors/maplayout';
import { setProtectedServices, setShowModalStatus } from '../../../actions/security';
import { changeLayerProperties } from '../../../actions/layers';
import { layersSelector } from '../../../selectors/layers';
import { metadataSourceSelector, modalParamsSelector } from '../../../selectors/backgroundselector';
import { setControlProperty, toggleControl, setControlProperties } from '../../../actions/controls';
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
import { buildServiceUrl, buildSRSMap, getRecordLinks } from '../../../utils/CatalogUtils';
import API from '../../../api/catalog';




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
import { useCatalogPagination } from '../hooks/useCatalogPagination';
import { addLayerToMap, resourceToLayerConfig } from '../utils/layerUtils';


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
    serviceTypes = [{ name: "csw", label: "CSW" }, { name: "cog", label: "COG" }, { name: "wms", label: "WMS" }, { name: "wmts", label: "WMTS" }, { name: "tms", label: "TMS", allowedProviders: DEFAULT_ALLOWED_PROVIDERS }, { name: "wfs", label: "WFS" }, { name: "3dtiles", label: "3D Tiles" }, { name: "model", label: "IFC Model" }, { name: "arcgis", label: "ArcGIS" },{
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

    const [catalogURL, setCatalogURL] = useState(null);
    const [panel, setPanel] = useState(true);
    const [addingLayers, setAddingLayers] = useState(false);
    const [page, setPage] = useState(1);
    const [sort] = useState(undefined);
    const [resources, setResources] = useState([]);
    const [resourcesMetadata, setResourcesMetadata] = useState({ total: 0, isNextPageAvailable: false });
    const { messages, loadedPlugins } = context;
    const addonsItems = usePluginItems({ items: items, loadedPlugins }).filter(({ target }) => target === 'url-addon');
    const layerBaseConfig = {
        group: group || undefined
    };
    const services = source === 'backgroundSelector' ? servicesWithBackgrounds : servicesProp;
    const records = useMemo(() => {
        return result && selectedFormat && API[selectedFormat]?.getCatalogRecords
            ? API[selectedFormat].getCatalogRecords(result, { ...options, layerOptions, service: services[selectedService] }, locales)
            : [];
    }, [result, selectedFormat, options, layerOptions, services, selectedService, locales, resources]);
    const isValidServiceSelected = () => {
        return services[selectedService] !== undefined;
    };

    const search = ({
        services, selectedService, start = 1, searchText = ""
    }) => {
        const url = buildServiceUrl(services[selectedService]);
        const type = services[selectedService]?.type;

        isNewServiceAdded && setNewServiceStatus(false);

        if (!isNewServiceAdded || searchText !== "") {
            onSearch({
                format: type,
                url,
                startPosition: start,
                maxRecords: pageSize,
                text: searchText || "",
                options: {
                    service: services[selectedService],
                    filters: filters
                }
            })
        }
    };

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
        if (selectedService && isValidServiceSelected()) {
            search({ services, selectedService, searchText: "" });
        }
    }, [selectedService]);

    // hooks 
    const {
        selectedLayers,
        isAllSelected,
        isIndeterminate,
        handleToggleLayer,
        handleSelectAll,
        clearSelection
    } = useCatalogSelection(records, selectedService);
    const pagination = useCatalogPagination(result, pageSize, searchOptions?.startPosition);

    const handleBackClick = () => {
        onChangeCatalogMode('view');
        if (selectedService && services[selectedService]) {
            search({
                services,
                selectedService,
                start: 1,
                searchText
            });
        }
    };

    const handleAddSelectedLayers = () => {
        setAddingLayers(true);
        const addPromises = selectedLayers.map(record => 
            selectedFormat === 'geonode' ? onLayerAdd( resourceToLayerConfig(record), {zoomToLayer}) :
            addLayerToMap({
                record,
                service: services[selectedService],
                defaultFormat: selectedFormat,
                layerBaseConfig,
                authkeyParamNames,
                catalogType: selectedFormat,
                catalogURL,
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

    const handlePageChange = (newPage) => {
        const start = (newPage - 1) * pageSize + 1;
        search({
            services,
            selectedService,
            start,
            searchText
        });
    };

    const wrapCards = !panel || wrapWithPanel;
    const hideThumbnailForCard = services?.[selectedService]?.hideThumbnail ?? hideThumbnail;

    const [filters, setFilters] = useState({});
    const [showFilters, setShowFilters] = useState(false);
    

    const handleFiltersChange = (newFilters, clear) => {
        if (clear) {
            setFilters({});
        } else {
            setFilters((prev) => ({
                ...prev,
                ...newFilters
            })
            );
        }
        handlePageChange(1);
    };

    const renderCard = ({ key, idx, record, isChecked, onToggle, isPanel }) => {
        return (
            <CatalogLayerCard
                key={key}
                idx={idx}
                record={record}
                currentLocale={currentLocale}
                onError={onError}
                service={services[selectedService]}
                defaultFormat={selectedFormat}
                layerBaseConfig={layerBaseConfig}
                authkeyParamNames={authkeyParamNames}
                catalogType={selectedFormat}
                catalogURL={catalogURL}
                crs={crs}
                selectedService={selectedService}
                source={source}
                onAddBackground={onAddBackground}
                onAddBackgroundProperties={onAddBackgroundProperties}
                onLayerAdd={onLayerAdd}
                zoomToLayer={zoomToLayer}
                messages={messages}
                hideThumbnail={hideThumbnailForCard}
                isChecked={isChecked}
                onToggle={onToggle}
                panel={isPanel}
                readOnly={source === 'backgroundSelector'}
            />
        );
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
                            onChangeText={onChangeText}
                            messages={messages}
                            services={services}
                            selectedService={selectedService}
                            onShowSecurityModal={onShowSecurityModal}
                            onSetProtectedServices={onSetProtectedServices}
                            search={search}
                            onReset={onReset}
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
                        services,
                        selectedService,
                        onShowSecurityModal,
                        onSetProtectedServices,
                        search,
                        onReset
                    }}
                />
            )}

            {/* Main Content or Editor */}
            {mode !== 'edit' ? (
                <CatalogContentView
                    // filters 
                    filters={filters}
                    showFilters={showFilters}
                    handleFiltersChange={handleFiltersChange}
                    setShowFilters={setShowFilters}
                    onToggleFilters={() => setShowFilters(!showFilters)}
                    selectedFormat={selectedFormat}
                    currentservice={services[selectedService]}
                    // props

                    isPanel={panel}
                    wrapCards={wrapCards}
                    loading={loading}
                    records={records}
                    total={pagination.total}
                    selectedLayers={selectedLayers}
                    isAllSelected={isAllSelected}
                    isIndeterminate={isIndeterminate}
                    onSelectAll={handleSelectAll}
                    onAddSelected={handleAddSelectedLayers}
                    onToggleLayer={handleToggleLayer}
                    renderCard={renderCard}
                    paginationProps={{
                        visible: ( result) && !isNewServiceAdded,
                        currentPage: pagination.currentPage,
                        totalPages:  pagination.totalPages,
                        onPageChange: handlePageChange
                    }}
                    PaginationComponent={PaginationCustom}
                    addingLayers={addingLayers}
                />
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
    dockStyle: state => mapLayoutValuesSelector(state, { height: true, right: true }, true),
    searchText: searchTextSelector,
    group: groupSelector,
    source: metadataSourceSelector,
    layers: layersSelector,
    modalParams: modalParamsSelector,
    authkeyParamNames: authkeyParamNameSelector,
    saving: savingSelector,
    openCatalogServiceList: serviceListOpenSelector,
    service: newServiceSelector,
    format: newServiceTypeSelector,
    selectedFormat: selectedServiceTypeSelector,
    options: searchOptionsSelector,
    layerOptions: selectedServiceLayerOptionsSelector,
    tileSizeOptions: tileSizeOptionsSelector,
    currentLocale: currentLocaleSelector,
    locales: currentMessagesSelector,
    pageSize: pageSizeSelector,
    loading: loadingSelector,
    crs: projectionSelector,
    isLocalizedLayerStylesEnabled: isLocalizedLayerStylesEnabledSelector,
    formatsLoading: formatsLoadingSelector,
    formatOptions: getSupportedFormatsSelector,
    infoFormatOptions: getSupportedGFIFormatsSelector,
    isNewServiceAdded: getNewServiceStatusSelector,
    canEdit: canEditServiceSelector
});

const ConnectedCatalog = connect(layerCatalogSelector, {
    clearModal: clearModalParameters,
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
    // add layer action to pass to the layers
    onAddBackgroundProperties: addBackgroundProperties,
    onFocusServicesList: focusServicesList,
    onPropertiesChange: changeLayerProperties,
    onAddBackground: backgroundAdded,
    onFormatOptionsFetch: formatOptionsFetch,
    onToggle: toggleControl.bind(null, 'backgroundSelector', null),
    onLayerChange: setControlProperty.bind(null, 'backgroundSelector'),
    onStartChange: setControlProperty.bind(null, 'backgroundSelector', 'start'),
    setNewServiceStatus,
    onShowSecurityModal: setShowModalStatus,
    onSetProtectedServices: setProtectedServices,
    onInitPlugin: initPlugin
})(Catalog);

export default ConnectedCatalog;