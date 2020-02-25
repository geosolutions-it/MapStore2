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
const { isNil } = require('lodash');

const assign = require('object-assign');
const {createSelector} = require("reselect");
const { compose, branch, withProps, renderComponent, defaultProps } = require("recompose");
const CatalogServiceEditor = require('../components/catalog/CatalogServiceEditor').default;

const {Glyphicon, Panel} = require('react-bootstrap');
const ContainerDimensions = require('react-container-dimensions').default;
const {changeLayerProperties} = require('../actions/layers');
const {addService, deleteService, textSearch, changeCatalogFormat, changeCatalogMode,
    changeUrl, changeTitle, changeAutoload, changeType, changeServiceFormat, changeSelectedService,
    addLayer, addLayerError, focusServicesList, changeText,
    changeMetadataTemplate, toggleAdvancedSettings, toggleThumbnail, toggleTemplate, catalogClose} = require("../actions/catalog");
const {zoomToExtent} = require("../actions/map");
const {addBackgroundProperties, updateThumbnail, removeThumbnail, clearModalParameters, backgroundAdded} = require('../actions/backgroundselector');
const {currentLocaleSelector, currentMessagesSelector} = require("../selectors/locale");
const {layersSelector} = require('../selectors/layers');
const {setControlProperty, toggleControl} = require("../actions/controls");
const {resultSelector, serviceListOpenSelector, newServiceSelector,
    newServiceTypeSelector, selectedServiceTypeSelector, searchOptionsSelector, servicesSelector,
    servicesSelectorWithBackgrounds, formatsSelector, loadingErrorSelector, selectedServiceSelector,
    modeSelector, layerErrorSelector, activeSelector, savingSelector, authkeyParamNameSelector,
    searchTextSelector, groupSelector, pageSizeSelector, loadingSelector
} = require("../selectors/catalog");
const {projectionSelector} = require('../selectors/map');

const {mapLayoutValuesSelector} = require('../selectors/maplayout');
const {metadataSourceSelector, modalParamsSelector} = require('../selectors/backgroundselector');
const Message = require("../components/I18N/Message");
const DockPanel = require("../components/misc/panels/DockPanel");
require('./metadataexplorer/css/style.css');
const CatalogUtils = require('../utils/CatalogUtils');

const catalogSelector = createSelector([
    (state) => layersSelector(state),
    (state) => modalParamsSelector(state),
    (state) => authkeyParamNameSelector(state),
    (state) => resultSelector(state),
    (state) => savingSelector(state),
    (state) => serviceListOpenSelector(state),
    (state) => newServiceSelector(state),
    (state) => newServiceTypeSelector(state),
    (state) => selectedServiceTypeSelector(state),
    (state) => searchOptionsSelector(state),
    (state) => currentLocaleSelector(state),
    (state) => currentMessagesSelector(state),
    (state) => pageSizeSelector(state),
    (state) => loadingSelector(state),
    (state) => projectionSelector(state)
], (layers, modalParams, authkeyParamNames, result, saving, openCatalogServiceList, newService, newformat, selectedFormat, options, currentLocale, locales, pageSize, loading, crs) => ({
    layers,
    modalParams,
    authkeyParamNames,
    saving,
    openCatalogServiceList,
    format: newformat,
    newService,
    currentLocale,
    pageSize,
    loading,
    crs,
    records: result && CatalogUtils.getCatalogRecords(selectedFormat, result, options, locales) || []
}));

const Catalog = compose(
    connect(catalogSelector, {
        // add layer action to pass to the layers
        onUpdateThumbnail: updateThumbnail,
        onAddBackgroundProperties: addBackgroundProperties,
        onZoomToExtent: zoomToExtent,
        onFocusServicesList: focusServicesList,
        onPropertiesChange: changeLayerProperties,
        onAddBackground: backgroundAdded,
        removeThumbnail,
        onToggle: toggleControl.bind(null, 'backgroundSelector', null),
        onLayerChange: setControlProperty.bind(null, 'backgroundSelector'),
        onStartChange: setControlProperty.bind(null, 'backgroundSelector', 'start')
    }),
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
        compose(
            withProps(({ newService = {} }) => ({
                showTemplate: !isNil(newService.showTemplate) ? newService.showTemplate : false
            })),
            renderComponent(CatalogServiceEditor)
        )

    )
)(require('../components/catalog/Catalog'));


class MetadataExplorerComponent extends React.Component {
    static propTypes = {
        id: PropTypes.string,
        source: PropTypes.string,
        active: PropTypes.bool,
        searchOnStartup: PropTypes.bool,
        formats: PropTypes.array,
        wrap: PropTypes.bool,
        wrapWithPanel: PropTypes.bool,
        panelStyle: PropTypes.object,
        panelClassName: PropTypes.string,
        toggleControl: PropTypes.func,
        closeGlyph: PropTypes.string,
        buttonStyle: PropTypes.object,
        services: PropTypes.object,
        servicesWithBackgrounds: PropTypes.object,
        selectedService: PropTypes.string,
        style: PropTypes.object,
        dockProps: PropTypes.object,
        zoomToLayer: PropTypes.bool,

        // side panel properties
        width: PropTypes.number,
        dockStyle: PropTypes.object,
        group: PropTypes.string
    };

    static defaultProps = {
        id: "mapstore-metadata-explorer",
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
        toggleControl: () => {},
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
        const layerBaseConfig = {
            group: this.props.group || undefined
        };
        const panel = (
            <Catalog
                layerBaseConfig={layerBaseConfig}
                zoomToLayer={this.props.zoomToLayer}
                searchOnStartup={this.props.searchOnStartup}
                active={this.props.active}
                {...this.props}
                services={this.props.source === 'backgroundSelector' ? this.props.servicesWithBackgrounds : this.props.services}
                servicesWithBackgrounds={undefined}
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
                        onClose={() => this.props.toggleControl()}
                        glyph="folder-open"
                        style={this.props.dockStyle}
                        noResize>
                        <Panel id={this.props.id} style={this.props.panelStyle} className={this.props.panelClassName}>
                            {panel}
                        </Panel>
                    </DockPanel>)}
                </ContainerDimensions>
            </div>
        );
    }
}

const metadataExplorerSelector = createSelector([
    searchOptionsSelector,
    formatsSelector,
    resultSelector,
    loadingErrorSelector,
    selectedServiceSelector,
    modeSelector,
    servicesSelector,
    servicesSelectorWithBackgrounds,
    layerErrorSelector,
    activeSelector,
    state => mapLayoutValuesSelector(state, {height: true}),
    searchTextSelector,
    groupSelector,
    metadataSourceSelector
], (searchOptions, formats, result, loadingError, selectedService, mode, services, servicesWithBackgrounds, layerError, active, dockStyle, searchText, group, source) => ({
    searchOptions,
    formats,
    result,
    loadingError,
    selectedService,
    mode, services, servicesWithBackgrounds,
    layerError,
    active,
    dockStyle,
    searchText,
    group,
    source
}));

const MetadataExplorerPlugin = connect(metadataExplorerSelector, {
    clearModal: clearModalParameters,
    onSearch: textSearch,
    onLayerAdd: addLayer,
    toggleControl: catalogClose,
    onChangeFormat: changeCatalogFormat,
    onChangeServiceFormat: changeServiceFormat,
    onChangeUrl: changeUrl,
    onChangeType: changeType,
    onChangeTitle: changeTitle,
    onChangeMetadataTemplate: changeMetadataTemplate,
    onChangeText: changeText,
    onChangeAutoload: changeAutoload,
    onChangeSelectedService: changeSelectedService,
    onChangeCatalogMode: changeCatalogMode,
    onAddService: addService,
    onToggleAdvancedSettings: toggleAdvancedSettings,
    onToggleThumbnail: toggleThumbnail,
    onToggleTemplate: toggleTemplate,
    onDeleteService: deleteService,
    onError: addLayerError
})(MetadataExplorerComponent);

const API = {
    csw: require('../api/CSW'),
    wms: require('../api/WMS'),
    wmts: require('../api/WMTS'),
    backgrounds: require('../api/mapBackground')
};
/**
 * MetadataExplorer (Catalog) plugin. Shows the catalogs results (CSW, WMS and WMTS).
 * Some useful flags in `localConfig.json`:
 * - `noCreditsFromCatalog`: avoid add credits (attribution) from catalog
 *
 * @class
 * @name MetadataExplorer
 * @memberof plugins
 * @prop {string} cfg.hideThumbnail shows/hides thumbnail
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
