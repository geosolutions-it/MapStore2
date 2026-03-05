/*
 * Copyright 2025, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
import React, { useEffect, useState } from 'react';
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

import CatalogComponent from '../components/Catalog';
import CatalogWrapper from '../components/CatalogWrapper';
import Button from '../../../components/layout/Button';
import { ButtonGroup, Glyphicon } from 'react-bootstrap';

const Catalog = ({
    items = [],
    active,
    dockStyle = {},
    closeCatalog,
    onInitPlugin,
    editingAllowedRoles = ["ALL"],
    editingAllowedGroups = undefined,
    source,
    servicesWithBackgrounds,
    services: servicesProp,
    onLayerAdd,
    onAddBackgroundProperties,
    onAddBackground,
    zoomToLayer = true,
    ...props
}, context) => {
    const { loadedPlugins } = context;
    const addonsItems = usePluginItems({ items: items, loadedPlugins }).filter(({ target }) => target === 'url-addon');
    const [panel, setPanel] = useState(true);
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
    return (
        <CatalogWrapper
            isPanel={panel}
            active={active}
            dockStyle={dockStyle}
        >
            <CatalogComponent
                { ...props}
                services={services}
                addonsItems={addonsItems}
                layout={panel ? 'list' : 'grid'}
                readOnly={source === 'backgroundSelector'}
                multiSelect={source !== 'backgroundSelector'}
                onSelect={({ record, layer }) => {
                    if (source === 'backgroundSelector') {
                        if (record.background) {
                            // background
                            onLayerAdd({...layer, group: 'background'}, { source });
                            onAddBackground(layer.id);
                        } else {
                            onAddBackgroundProperties({
                                editing: false,
                                layer
                            }, true);
                        }
                    } else {
                        onLayerAdd(layer, { zoomToLayer });
                    }
                }}
                headerTools={
                    <ButtonGroup>
                        <Button
                            title={panel ? "Switch to Dialog View" : "Switch to Panel View"}
                            onClick={() => setPanel(!panel)}
                            square
                        >
                            <Glyphicon glyph={panel ? "1-full-screen" : "minus"} />
                        </Button>
                        <Button
                            onClick={() => {
                                closeCatalog();
                                if (!panel) {
                                    setPanel(true);
                                }
                            }}
                            square
                        >
                            <Glyphicon glyph="1-close" />
                        </Button>
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
    // security
    onShowSecurityModal: setShowModalStatus,
    onSetProtectedServices: setProtectedServices
})(Catalog);

export default ConnectedCatalog;
