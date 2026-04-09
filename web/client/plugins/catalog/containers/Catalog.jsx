/*
 * Copyright 2025, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
import React, { useEffect, useState, useMemo } from 'react';
import { connect } from 'react-redux';
import { createStructuredSelector } from 'reselect';
import PropTypes from 'prop-types';
import usePluginItems from '../../../hooks/usePluginItems';
import { addBackgroundProperties, backgroundAdded, clearModalParameters } from '../../../actions/backgroundselector';
import { projectionSelector, mapEnableImageryOverlaySelector } from '../../../selectors/map';
import { mapLayoutValuesSelector } from '../../../selectors/maplayout';
import { setProtectedServices, setShowModalStatus } from '../../../actions/security';
import { changeLayerProperties } from '../../../actions/layers';
import { layersSelector } from '../../../selectors/layers';
import { metadataSourceSelector, modalParamsSelector } from '../../../selectors/backgroundselector';
import { setControlProperty, toggleControl } from '../../../actions/controls';
import { currentLocaleSelector, currentMessagesSelector } from '../../../selectors/locale';
import { isLocalizedLayerStylesEnabledSelector } from '../../../selectors/localizedLayerStyles';
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

import CatalogComponent from '../../../components/catalog/datasets/Catalog';
import CatalogWrapper from '../../../components/catalog/datasets/CatalogWrapper';
import Button from '../../../components/layout/Button';
import { ButtonGroup, Glyphicon } from 'react-bootstrap';
import { DEFAULT_PANEL_WIDTH } from '../../../utils/LayoutUtils';
import API from '../../../api/catalog';
import { isAllowedSRS, isSRSAllowed } from '../../../utils/CoordinatesUtils';
import { getResolutions } from '../../../utils/MapUtils';
import { buildSRSMap } from '../../../utils/CatalogUtils';
import { useCatalogSelection } from '../../../components/catalog/hooks/useCatalogSelection';
import tooltip from '../../../components/misc/enhancers/tooltip';
import Message from '../../../components/I18N/Message';

const ButtonWithTooltip = tooltip(Button);


const Catalog = ({
    items = [],
    width = DEFAULT_PANEL_WIDTH,
    panelStyle = {
        zIndex: 150
    },
    active,
    dockStyle = {},
    closeCatalog,
    onInitPlugin,
    onSetCatalogPanel,
    editingAllowedRoles = ["ALL"],
    editingAllowedGroups = undefined,
    source,
    servicesWithBackgrounds,
    services: servicesProp,
    onLayerAdd,
    onAddBackgroundProperties,
    onAddBackground,
    zoomToLayer = true,
    onError,
    group,
    authkeyParamNames,
    crs,
    enableImageryOverlay,
    selectedService,
    locales,
    selectedFormat,
    result,
    searchOptions,
    layerOptions,
    ...props
}, context) => {
    const { loadedPlugins } = context;
    const addonsItems = usePluginItems({ items: items, loadedPlugins }).filter(({ target }) => target === 'url-addon');
    const [panel, setPanel] = useState(true);
    const [loadingLayers, setLoadingLayers] = useState([]);

    useEffect(() => {
        onInitPlugin({
            editingAllowedRoles,
            editingAllowedGroups
        });
        return () => {
            closeCatalog();
        };
    }, []);

    const services = source === 'backgroundSelector' ? servicesWithBackgrounds : servicesProp;

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

    const layerBaseConfig = {
        group: group || undefined
    };

    const isSRSNotAllowed = (record) => {
        if (record.serviceType !== 'cog') {
            const ogcReferences = record.ogcReferences || { SRS: [] };
            const allowedSRS = ogcReferences?.SRS?.length > 0 && buildSRSMap(ogcReferences.SRS);
            return allowedSRS && !isAllowedSRS(crs, allowedSRS);
        }
        const recordCrs = record?.sourceMetadata?.crs;
        return recordCrs && !isSRSAllowed(recordCrs);
    };


    const {
        selected,
        isAllSelected,
        isIndeterminate,
        onRecordSelected,
        handleSelectAll,
        clearSelection
    } = useCatalogSelection(records, selectedService);

    const createLayer = (record, serviceType = record.serviceType) => {
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
            catalogURL: selectedServiceOptions?.type === "csw" && selectedServiceOptions?.url
                ? selectedServiceOptions.url +
                "?request=GetRecordById&service=CSW&version=2.0.2&elementSetName=full&id=" +
                record.identifier
                : null,
            map: {
                projection: crs,
                resolutions: getResolutions()
            },
            enableImageryOverlay
        }, true).then((layer) => {
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
                return { record, layer: layerOpts };
            }
            return null;
        });
    };

    const addCatalogLayer = ({ record, layer } = {}) => {
        if (!layer) {
            return;
        }
        if (source === 'backgroundSelector') {
            if (record?.background) {
                onLayerAdd({ ...layer, group: 'background' }, { source });
                onAddBackground(layer.id);
                return;
            }
            onAddBackgroundProperties({
                editing: false,
                layer
            }, true);
            return;
        }
        onLayerAdd(layer, { zoomToLayer });
    };


    function handleAddLayers(newRecords = [], { clearSelected = false } = {}) {
        const recordsToAdd = newRecords.filter(Boolean);
        if (!recordsToAdd.length) {
            return Promise.resolve([]);
        }
        setLoadingLayers(recordsToAdd.map(record => record.identifier));
        return Promise.all(
            recordsToAdd.map(record => createLayer(record, record?.serviceType))
        )
            .then((createdLayers) => {
                createdLayers.filter(Boolean).forEach(addCatalogLayer);
                if (clearSelected) {
                    clearSelection();
                }
                return createdLayers;
            })
            .catch(() => {
                onError('catalog.addLayerError');
                return [];
            })
            .finally(() => {
                // delay the loading finalization
                // to visualize spinner in UI
                setTimeout(() => {
                    setLoadingLayers([]);
                }, 300);
            });
    }

    const allowMultiSelect = source !== 'backgroundSelector';


    return (
        <CatalogWrapper
            isPanel={panel}
            active={active}
            dockStyle={dockStyle}
            panelStyle={panelStyle}
            width={width}
        >
            <CatalogComponent
                {...props}
                searchOptions={searchOptions}
                selectedFormat={selectedFormat}
                result={result}
                records={records}
                selected={selected}
                loadingLayers={loadingLayers}
                isAllSelected={isAllSelected}
                isIndeterminate={isIndeterminate}
                handleSelectAll={handleSelectAll}
                selectedService={selectedService}
                services={services}
                addonsItems={addonsItems}
                layout={panel ? 'list' : 'grid'}
                readOnly={source === 'backgroundSelector'}
                multiSelect={allowMultiSelect}
                createLayer={createLayer}
                onAddSelected={(selectedRecords) => handleAddLayers(selectedRecords, { clearSelected: true })}
                onAddLayer={(record) => handleAddLayers([record])}
                onSelect={allowMultiSelect ? onRecordSelected : (record) => {
                    handleAddLayers([record]);
                }}
                headerTools={
                    <ButtonGroup>
                        <ButtonWithTooltip
                            tooltipId={panel ? <Message msgId="catalog.gridView" /> : <Message msgId="catalog.listView" />}
                            onClick={() => {
                                const newPanel = !panel;
                                setPanel(newPanel);
                                onSetCatalogPanel?.(newPanel);
                            }}
                            square
                        >
                            <Glyphicon glyph={panel ? "1-full-screen" : "minus"} />
                        </ButtonWithTooltip>
                        <ButtonWithTooltip
                            tooltipId={<Message msgId="catalog.close" />}
                            onClick={() => {
                                closeCatalog();
                                if (!panel) {
                                    setPanel(true);
                                }
                            }}
                            square
                        >
                            <Glyphicon glyph="1-close" />
                        </ButtonWithTooltip>
                    </ButtonGroup>
                }
            />
        </CatalogWrapper>
    );
};

Catalog.contextTypes = {
    loadedPlugins: PropTypes.object
};

const layerCatalogSelector = createStructuredSelector({
    // Catalog
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
    canEditService: canEditServiceSelector,
    // localconfig
    isLocalizedLayerStylesEnabled: isLocalizedLayerStylesEnabledSelector,
    // map
    crs: projectionSelector,
    enableImageryOverlay: mapEnableImageryOverlaySelector,
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
    modalParams: modalParamsSelector
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
    onSetCatalogPanel: setControlProperty.bind(null, 'metadataexplorer', 'panel'),
    // security
    onShowSecurityModal: setShowModalStatus,
    onSetProtectedServices: setProtectedServices
})(Catalog);

export default ConnectedCatalog;
