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
const {createSelector} = require("reselect");
const {Glyphicon, Panel} = require('react-bootstrap');
const ContainerDimensions = require('react-container-dimensions').default;

const {addService, deleteService, textSearch, changeCatalogFormat, changeCatalogMode,
    changeUrl, changeTitle, changeAutoload, changeType, changeSelectedService,
    addLayer, addLayerError, resetCatalog, focusServicesList, changeText,
    changeMetadataTemplate, toggleAdvancedSettings, toggleThumbnail, toggleTemplate} = require("../actions/catalog");
const {zoomToExtent} = require("../actions/map");
const {currentLocaleSelector, currentMessagesSelector} = require("../selectors/locale");
const {setControlProperty, setControlProperties} = require("../actions/controls");
const {resultSelector, serviceListOpenSelector, newServiceSelector,
    newServiceTypeSelector, selectedServiceTypeSelector, searchOptionsSelector,
    servicesSelector, formatsSelector, loadingErrorSelector, selectedServiceSelector,
    modeSelector, layerErrorSelector, activeSelector, savingSelector, authkeyParamNameSelector,
    searchTextSelector, groupSelector, pageSizeSelector, loadingSelector
} = require("../selectors/catalog");

const {mapLayoutValuesSelector} = require('../selectors/maplayout');
const Message = require("../components/I18N/Message");
const DockPanel = require("../components/misc/panels/DockPanel");
require('./metadataexplorer/css/style.css');
const CatalogUtils = require('../utils/CatalogUtils');

const catalogSelector = createSelector([
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
    (state) => loadingSelector(state)
], (authkeyParamNames, result, saving, openCatalogServiceList, newService, newformat, selectedFormat, options, currentLocale, locales, pageSize, loading) =>({
    authkeyParamNames,
    saving,
    openCatalogServiceList,
    format: newformat,
    newService,
    currentLocale,
    pageSize,
    loading,
    records: result && CatalogUtils.getCatalogRecords(selectedFormat, result, options, locales) || []
}));

const catalogClose = () => {
    return (dispatch) => {
        dispatch(setControlProperties('metadataexplorer', "enabled", false, "group", null));
        dispatch(changeCatalogMode("view"));
        dispatch(resetCatalog());
    };
};


const Catalog = connect(catalogSelector, {
    // add layer action to pass to the layers
    onZoomToExtent: zoomToExtent,
    onFocusServicesList: focusServicesList
})(require('../components/catalog/Catalog'));

// const Dialog = require('../components/misc/Dialog');

class MetadataExplorerComponent extends React.Component {
    static propTypes = {
        id: PropTypes.string,
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
        group: null
    };

    render() {
        const layerBaseConfig = {
            group: this.props.group || undefined
        };
        const panel = <Catalog layerBaseConfig={layerBaseConfig} zoomToLayer={this.props.zoomToLayer} searchOnStartup={this.props.searchOnStartup} active={this.props.active} {...this.props}/>;
        return (
            <div id="catalog-root" style={{width: '100%', height: '100%', pointerEvents: 'none'}}>
                <ContainerDimensions>
                    {({ width }) => (<DockPanel
                        open={this.props.active}
                        size={this.props.width / width > 1 ? width : this.props.width}
                        position="right"
                        bsStyle="primary"
                        title={<Message msgId="catalog.title"/>}
                        onClose={() => this.props.toggleControl()}
                        glyph="folder-open"
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

const metadataExplorerSelector = createSelector([
    searchOptionsSelector,
    formatsSelector,
    resultSelector,
    loadingErrorSelector,
    selectedServiceSelector,
    modeSelector,
    servicesSelector,
    layerErrorSelector,
    activeSelector,
    state => mapLayoutValuesSelector(state, {height: true}),
    searchTextSelector,
    groupSelector
], (searchOptions, formats, result, loadingError, selectedService, mode, services, layerError, active, dockStyle, searchText, group) => ({
    searchOptions,
    formats,
    result,
    loadingError,
    selectedService,
    mode, services,
    layerError,
    active,
    dockStyle,
    searchText,
    group
}));

const MetadataExplorerPlugin = connect(metadataExplorerSelector, {
    onSearch: textSearch,
    onLayerAdd: addLayer,
    toggleControl: catalogClose,
    onChangeFormat: changeCatalogFormat,
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
    wmts: require('../api/WMTS')
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
        Toolbar: {
            name: 'metadataexplorer',
            position: 10,
            exclusive: true,
            panel: true,
            tooltip: "catalog.tooltip",
            wrap: true,
            title: 'catalog.title',
            help: <Message msgId="helptexts.metadataexplorer"/>,
            icon: <Glyphicon glyph="folder-open" />,
            priority: 1
        },
        BurgerMenu: {
            name: 'metadataexplorer',
            position: 5,
            text: <Message msgId="catalog.title"/>,
            icon: <Glyphicon glyph="folder-open"/>,
            action: setControlProperty.bind(null, "metadataexplorer", "enabled", true, true),
            priority: 2,
            doNotHide: true
        }
    }),
    reducers: {catalog: require('../reducers/catalog')},
    epics: require("../epics/catalog")(API)
};
