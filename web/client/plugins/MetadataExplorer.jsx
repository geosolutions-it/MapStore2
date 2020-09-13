/*
 * Copyright 2017, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
*/

const React = require('react');
const PropTypes = require('prop-types');
const {connect} = require('react-redux');

const assign = require('object-assign');
const {createStructuredSelector} = require("reselect");
const { compose, branch, renderComponent, withProps, defaultProps } = require("recompose");
const CatalogServiceEditor = require('../components/catalog/CatalogServiceEditor').default;

const {Glyphicon, Panel} = require('react-bootstrap');
const ContainerDimensions = require('react-container-dimensions').default;
const {changeLayerProperties} = require('../actions/layers');
const {addService, deleteService, textSearch, changeCatalogFormat, changeCatalogMode,
    changeUrl, changeTitle, changeServiceProperty, changeType, changeServiceFormat, changeSelectedService,
    addLayer, addLayerError, focusServicesList, changeText,
    changeMetadataTemplate, toggleAdvancedSettings, toggleThumbnail, toggleTemplate, catalogClose} = require("../actions/catalog");
const {addBackgroundProperties, clearModalParameters, backgroundAdded} = require('../actions/backgroundselector');
const {currentLocaleSelector, currentMessagesSelector} = require("../selectors/locale");
const {layersSelector} = require('../selectors/layers');
const {setControlProperty, toggleControl} = require("../actions/controls");
const {resultSelector, serviceListOpenSelector, newServiceSelector,
    newServiceTypeSelector, selectedServiceTypeSelector, searchOptionsSelector, servicesSelector,
    servicesSelectorWithBackgrounds, loadingErrorSelector, selectedServiceSelector,
    modeSelector, layerErrorSelector, activeSelector, savingSelector, authkeyParamNameSelector,
    searchTextSelector, groupSelector, pageSizeSelector, loadingSelector, selectedServiceLayerOptionsSelector,
    tileSizeOptionsSelector } = require("../selectors/catalog");
const {projectionSelector} = require('../selectors/map');
const {isLocalizedLayerStylesEnabledSelector} = require('../selectors/localizedLayerStyles');

const {mapLayoutValuesSelector} = require('../selectors/maplayout');
const {metadataSourceSelector, modalParamsSelector} = require('../selectors/backgroundselector');
const Message = require("../components/I18N/Message");
const DockPanel = require("../components/misc/panels/DockPanel");
require('./metadataexplorer/css/style.css');
const CatalogUtils = require('../utils/CatalogUtils');
const DEFAULT_ALLOWED_PROVIDERS = ["OpenStreetMap", "OpenSeaMap", "Stamen"];

const metadataExplorerSelector = createStructuredSelector({
    searchOptions: searchOptionsSelector,
    result: resultSelector,
    loadingError: loadingErrorSelector,
    selectedService: selectedServiceSelector,
    mode: modeSelector,
    services: servicesSelector,
    servicesWithBackgrounds: servicesSelectorWithBackgrounds,
    layerError: layerErrorSelector,
    active: activeSelector,
    dockStyle: state => mapLayoutValuesSelector(state, { height: true }),
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
    isLocalizedLayerStylesEnabled: isLocalizedLayerStylesEnabledSelector
});


const Catalog = compose(
    withProps(({ result, selectedFormat, options, layerOptions, services, selectedService, locales}) => ({
        records: result && CatalogUtils.getCatalogRecords(selectedFormat, result, { ...options, layerOptions, service: services[selectedService] }, locales) || []
    })),
    defaultProps({
        buttonStyle: {
            marginBottom: "10px",
            marginRight: "5px"
        },
        formatOptions: [{
            label: 'image/png',
            value: 'image/png'
        }, {
            label: 'image/png8',
            value: 'image/png8'
        }, {
            label: 'image/jpeg',
            value: 'image/jpeg'
        }, {
            label: 'image/vnd.jpeg-png',
            value: 'image/vnd.jpeg-png'
        }, {
            label: 'image/gif',
            value: 'image/gif'
        }]
    }),
    branch(
        ({mode}) => mode === "edit",
        renderComponent(CatalogServiceEditor)
    )
)(require('../components/catalog/Catalog'));


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
        servicesWithBackgrounds: PropTypes.object,
        selectedService: PropTypes.string,
        style: PropTypes.object,
        dockProps: PropTypes.object,
        zoomToLayer: PropTypes.bool,
        isLocalizedLayerStylesEnabled: PropTypes.bool,

        // side panel properties
        width: PropTypes.number,
        dockStyle: PropTypes.object,
        group: PropTypes.string
    };

    static defaultProps = {
        id: "mapstore-metadata-explorer",
        serviceTypes: [{ name: "csw", label: "CSW" }, { name: "wms", label: "WMS" }, { name: "wmts", label: "WMTS" }, { name: "tms", label: "TMS", allowedProviders: DEFAULT_ALLOWED_PROVIDERS }, {name: "wfs", label: "WFS"}],
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
        closeGlyph: "1-close",
        zoomToLayer: true,

        // side panel properties
        width: 660,
        dockProps: {
            dimMode: "none",
            fluid: false,
            position: "right",
            zIndex: 1030
        },
        dockStyle: {},
        group: null,
        services: {},
        servicesWithBackgrounds: {}
    };

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
            <div id="catalog-root" className={this.props.active ? 'catalog-active' : ''} style={{width: '100%', height: '100%', pointerEvents: 'none'}}>
                <ContainerDimensions>
                    {({ width }) => (<DockPanel
                        open={this.props.active}
                        size={this.props.width / width > 1 ? width : this.props.width}
                        position="right"
                        bsStyle="primary"
                        title={<Message msgId="catalog.title"/>}
                        onClose={() => this.props.closeCatalog()}
                        glyph="folder-open"
                        zIndex={1031}
                        style={this.props.dockStyle}>
                        <Panel id={this.props.id} style={this.props.panelStyle} className={this.props.panelClassName}>
                            {panel}
                        </Panel>
                    </DockPanel>)}
                </ContainerDimensions>
            </div>
        );
    }
}

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
    onToggle: toggleControl.bind(null, 'backgroundSelector', null),
    onLayerChange: setControlProperty.bind(null, 'backgroundSelector'),
    onStartChange: setControlProperty.bind(null, 'backgroundSelector', 'start')
})(MetadataExplorerComponent);
const API = require('../api/catalog').default;

/**
 * MetadataExplorer (Catalog) plugin. Shows the catalogs results (CSW, WMS, WMTS, TMS and WFS).
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
 * @prop {number} [delayAutoSearch] time in ms passed after a search is triggered by filter changes, default 1000
 */
module.exports = {
    MetadataExplorerPlugin: assign(MetadataExplorerPlugin, {
        BurgerMenu: {
            name: 'metadataexplorer',
            position: 5,
            text: <Message msgId="catalog.title"/>,
            icon: <Glyphicon glyph="folder-open"/>,
            action: setControlProperty.bind(null, "metadataexplorer", "enabled", true, true),
            doNotHide: true
        },
        BackgroundSelector: {
            name: 'MetadataExplorer',
            doNotHide: true
        },
        TOC: {
            name: 'MetadataExplorer',
            doNotHide: true
        }
    }),
    reducers: {catalog: require('../reducers/catalog')},
    epics: require("../epics/catalog").default(API)
};
