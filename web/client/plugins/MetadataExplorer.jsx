/*
 * Copyright 2017, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
*/

import './metadataexplorer/css/style.css';

import PropTypes from 'prop-types';
import React from 'react';
import { Glyphicon, Panel } from 'react-bootstrap';
import { connect } from 'react-redux';
import { branch, compose, defaultProps, renderComponent, withProps } from 'recompose';
import { createStructuredSelector } from 'reselect';

import { addBackground, addBackgroundProperties, backgroundAdded, clearModalParameters } from '../actions/backgroundselector';
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
} from '../actions/catalog';
import { setControlProperty, toggleControl, setControlProperties } from '../actions/controls';
import { changeLayerProperties } from '../actions/layers';
import API from '../api/catalog';
import CatalogComp from '../components/catalog/Catalog';
import CatalogServiceEditor from '../components/catalog/CatalogServiceEditor';
import Message from '../components/I18N/Message';
import { metadataSourceSelector, modalParamsSelector } from '../selectors/backgroundselector';
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
} from '../selectors/catalog';
import { layersSelector } from '../selectors/layers';
import { currentLocaleSelector, currentMessagesSelector } from '../selectors/locale';
import {burgerMenuSelector} from "../selectors/controls";
import { isLocalizedLayerStylesEnabledSelector } from '../selectors/localizedLayerStyles';
import { projectionSelector } from '../selectors/map';
import { mapLayoutValuesSelector } from '../selectors/maplayout';
import ResponsivePanel from "../components/misc/panels/ResponsivePanel";
import { DEFAULT_PANEL_WIDTH } from '../utils/LayoutUtils';
import usePluginItems from '../hooks/usePluginItems';
import { setProtectedServices, setShowModalStatus } from '../actions/security';

export const DEFAULT_ALLOWED_PROVIDERS = ["OpenStreetMap", "OpenSeaMap", "Stamen"];

const metadataExplorerSelector = createStructuredSelector({
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


const Catalog = compose(
    withProps(({ result, selectedFormat, options, layerOptions, services, selectedService, locales}) => ({
        records: result && API[selectedFormat].getCatalogRecords(result, { ...options, layerOptions, service: services[selectedService] }, locales) || []
    })),
    defaultProps({
        buttonStyle: {
            marginBottom: "10px",
            marginRight: "5px"
        },
        formatOptions: [],
        advancedRasterStyles: {
            display: 'flex',
            alignItems: 'center',
            paddingTop: 15,
            borderTop: '1px solid #ddd'
        }
    }),
    branch(
        ({mode}) => mode === "edit",
        renderComponent(CatalogServiceEditor)
    )
)(CatalogComp);


class MetadataExplorerComponent extends React.Component {
    static propTypes = {
        id: PropTypes.string,
        source: PropTypes.string,
        active: PropTypes.bool,
        searchOnStartup: PropTypes.bool,
        serviceTypes: PropTypes.array,
        wrap: PropTypes.bool,
        wrapWithPanel: PropTypes.bool,
        panelStyle: PropTypes.object,
        panelClassName: PropTypes.string,
        closeCatalog: PropTypes.func,
        closeGlyph: PropTypes.string,
        buttonStyle: PropTypes.object,
        services: PropTypes.object,
        addonsItems: PropTypes.array,
        servicesWithBackgrounds: PropTypes.object,
        selectedService: PropTypes.string,
        style: PropTypes.object,
        dockProps: PropTypes.object,
        zoomToLayer: PropTypes.bool,
        isLocalizedLayerStylesEnabled: PropTypes.bool,

        // side panel properties
        width: PropTypes.number,
        dockStyle: PropTypes.object,
        group: PropTypes.string,
        onInitPlugin: PropTypes.func,
        editingAllowedRoles: PropTypes.array,
        editingAllowedGroups: PropTypes.array
    };

    static defaultProps = {
        id: "mapstore-metadata-explorer",
        serviceTypes: [{ name: "csw", label: "CSW" }, { name: "wms", label: "WMS" }, { name: "wmts", label: "WMTS" }, { name: "tms", label: "TMS", allowedProviders: DEFAULT_ALLOWED_PROVIDERS }, { name: "wfs", label: "WFS" }, { name: "3dtiles", label: "3D Tiles" }, {name: "model", label: "IFC Model"}, { name: "arcgis", label: "ArcGIS" }],
        active: false,
        wrap: false,
        modal: true,
        wrapWithPanel: false,
        panelStyle: {
            zIndex: 100,
            overflow: "hidden",
            height: "100%"
        },
        panelClassName: "catalog-panel",
        closeCatalog: () => {},
        onInitPlugin: () => {},
        closeGlyph: "1-close",
        zoomToLayer: true,

        // side panel properties
        width: DEFAULT_PANEL_WIDTH,
        dockProps: {
            dimMode: "none",
            fluid: false,
            position: "right",
            zIndex: 1030
        },
        dockStyle: {},
        group: null,
        services: {},
        servicesWithBackgrounds: {},
        editingAllowedRoles: ["ALL"]
    };

    componentDidMount() {
        this.props.onInitPlugin({
            editingAllowedRoles: this.props.editingAllowedRoles,
            editingAllowedGroups: this.props.editingAllowedGroups
        });
    }

    componentWillUnmount() {
        this.props.closeCatalog();
    }
    render() {
        // TODO: separate catalog props from Container props (and handlers)
        const layerBaseConfig = {
            group: this.props.group || undefined
        };
        const panel = (
            <Catalog
                layerBaseConfig={layerBaseConfig}
                {...this.props}
                services={this.props.source === 'backgroundSelector' ? this.props.servicesWithBackgrounds : this.props.services}
            />
        );
        return (
            <ResponsivePanel
                containerStyle={this.props.dockStyle}
                containerId="catalog-root"
                containerClassName={this.props.active ? 'catalog-active' : ''}
                open={this.props.active}
                size={this.props.width}
                position="right"
                title={<Message msgId="catalog.title"/>}
                onClose={() => this.props.closeCatalog()}
                glyph="folder-open"
                style={this.props.dockStyle}
            >
                <Panel id={this.props.id} style={this.props.panelStyle} className={this.props.panelClassName}>
                    {panel}
                </Panel>
            </ResponsivePanel>
        );
    }
}

const MetadataExplorerComponentWrapper = (props, context) => {
    const { loadedPlugins } = context;
    const addonsItems = usePluginItems({ items: props.items, loadedPlugins }).filter(({ target }) => target === 'url-addon');
    return <MetadataExplorerComponent {...props} addonsItems={addonsItems}/>;
};


MetadataExplorerComponentWrapper.contextTypes = {
    loadedPlugins: PropTypes.object
};

const MetadataExplorerPlugin = connect(metadataExplorerSelector, {
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
})(MetadataExplorerComponentWrapper);

const AddLayerButton = connect(() => ({}), {
    onClick: setControlProperties.bind(null, 'metadataexplorer', 'enabled', true, 'group')
})(({
    onClick,
    selectedNodes,
    status,
    itemComponent,
    statusTypes,
    config,
    ...props
}) => {
    const ItemComponent = itemComponent;

    // deprecated TOC configuration
    if (config.activateAddLayerButton === false) {
        return null;
    }

    if ([statusTypes.DESELECT, statusTypes.GROUP].includes(status)) {
        const group = selectedNodes?.[0]?.id;
        return (
            <ItemComponent
                {...props}
                glyph="add-layer"
                tooltipId={status === statusTypes.GROUP ? 'toc.addLayerToGroup' : 'toc.addLayer'}
                onClick={() => onClick(group)}
            />
        );
    }
    return null;
});

export const BackgroundSelectorAdd = connect(
    createStructuredSelector({
        enabled: state => state.controls && state.controls.metadataexplorer && state.controls.metadataexplorer.enabled
    }),
    {
        onAdd: addBackground
    }
)(({ source, onAdd = () => {}, itemComponent, canEdit, enabled }) => {
    const ItemComponent = itemComponent;
    return canEdit ? (
        <ItemComponent
            disabled={!!enabled}
            onClick={() => {
                onAdd(source || 'backgroundSelector');
            }}
            tooltipId="backgroundSelector.addTooltip"
            glyph="plus"
        />
    ) : null;
});

/**
 * MetadataExplorer (Catalog) plugin. Shows the catalogs results (CSW, WMS, WMTS, TMS, WFS and COG).
 * Some useful flags in `localConfig.json`:
 * - `noCreditsFromCatalog`: avoid add credits (attribution) from catalog
 *
 * @class
 * @name MetadataExplorer
 * @memberof plugins
 * @prop {string} cfg.hideThumbnail shows/hides thumbnail
 * @prop {object[]} cfg.serviceTypes Service types available to add a new catalog. default: `[{ name: "csw", label: "CSW" }, { name: "wms", label: "WMS" }, { name: "wmts", label: "WMTS" }, { name: "tms", label: "TMS", allowedProviders },{ name: "wfs", label: "WFS" }]`.
 * `allowedProviders` is a whitelist of tileProviders from ConfigProvider.js. you can set a global variable allowedProviders in localConfig.json to set it up globally. You can configure it to "ALL" to get all the list (at your own risk, some services could change or not be available anymore)
 * @prop {object} cfg.hideIdentifier shows/hides identifier
 * @prop {boolean} cfg.hideExpand shows/hides full description button
 * @prop {number} cfg.zoomToLayer enable/disable zoom to layer when added
 * @prop {number} cfg.autoSetVisibilityLimits if true, allows fetching and setting visibility limits of the layer from capabilities on layer add (Note: The default configuration value is applied only on new catalog service (WMS/CSW))
 * @prop {number} [delayAutoSearch] time in ms passed after a search is triggered by filter changes, default 1000
 * @prop {object[]} items this property contains the items injected from the other plugins,
 * using the `url-addon` option in the plugin that want to inject the components.
 * You can select the position where to insert the components adding the `target` property.
 * The allowed targets are:
 * - `url-addon` target add an addon button in the url field of catalog form (in main viewer) in edit mode
 * ```javascript
 * const MyAddonComponent = connect(null,
 * {
 *     onSetShowModal: setShowModalStatus,
 *    }
 * )(({
 *    onSetShowModal, // opens a modal to enter credentials
 *    itemComponent // default component that provides a consistent UI (see UrlAddon in MainForm.jsx)
 *    }) => {
 *    const Component = itemComponent;
 *    return (<Component
 *        onClick={(value) => {
 *            onSetShowModal(true);
 *        }}
 *        btnClassName={condition ? "btn-success" : ""}
 *        glyph="glyph"
 *        tooltipId="path"
 *    />  );
 * });
 * createPlugin(
 *  'MyPlugin',
 *  {
 *      containers: {
 *          MetadataExplorer: {
 *              name: "TOOLNAME", // a name for the current tool.
 *              target: "url-addon", // the target where to insert the component
 *              Component: MyAddonComponent
 *          },
 * // ...
 * ```
 */
export default {
    MetadataExplorerPlugin: Object.assign(MetadataExplorerPlugin, {
        BurgerMenu: {
            name: 'metadataexplorer',
            position: 5,
            text: <Message msgId="catalog.title"/>,
            tooltip: "catalog.tooltip",
            icon: <Glyphicon glyph="folder-open"/>,
            action: setControlProperty.bind(null, "metadataexplorer", "enabled", true, true),
            doNotHide: true,
            priority: 1
        },
        BackgroundSelector: {
            name: 'MetadataExplorer',
            doNotHide: true,
            priority: 1,
            Component: BackgroundSelectorAdd,
            target: 'background-toolbar'
        },
        TOC: {
            name: 'MetadataExplorer',
            doNotHide: true,
            priority: 1,
            target: 'toolbar',
            Component: AddLayerButton,
            position: 2
        },
        SidebarMenu: {
            name: 'metadataexplorer',
            position: 5,
            text: <Message msgId="catalog.title"/>,
            tooltip: "catalog.tooltip",
            icon: <Glyphicon glyph="folder-open"/>,
            action: setControlProperty.bind(null, "metadataexplorer", "enabled", true, true),
            selector: (state) => ({
                style: { display: burgerMenuSelector(state) ? 'none' : null }
            }),
            toggle: true,
            doNotHide: true,
            priority: 1
        }
    }),
    reducers: {catalog: require('../reducers/catalog').default},
    epics: require("../epics/catalog").default(API)
};
