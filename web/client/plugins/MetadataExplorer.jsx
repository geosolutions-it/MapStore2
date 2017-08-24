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
const Sidebar = require('react-sidebar').default;
const assign = require('object-assign');
const {createSelector} = require("reselect");
const {Glyphicon, Panel} = require('react-bootstrap');

const {addService, textSearch, changeCatalogFormat, changeCatalogMode,
    changeNewUrl, changeNewTitle, changeNewType, changeSelectedService,
    addLayer, addLayerError, resetCatalog, focusServicesList} = require("../actions/catalog");
const {zoomToExtent} = require("../actions/map");
const {newCatalogServiceAdded} = require("../epics/catalog");
const {toggleControl} = require("../actions/controls");
const {resultSelector, serviceListOpenSelector, newServiceSelector, newServiceTypeSelector, selectedServiceTypeSelector, searchOptionsSelector} = require("../selectors/catalog");
const Message = require("../components/I18N/Message");
require('./metadataexplorer/css/style.css');

const CatalogUtils = require('../utils/CatalogUtils');

const catalogSelector = createSelector([
    (state) => resultSelector(state),
    (state) => serviceListOpenSelector(state),
    (state) => newServiceSelector(state),
    (state) => newServiceTypeSelector(state),
    (state) => selectedServiceTypeSelector(state),
    (state) => searchOptionsSelector(state)
], (result, openCatalogServiceList, newService, newformat, selectedFormat, options) =>({
    openCatalogServiceList,
    format: newformat,
    newService,
    records: CatalogUtils.getCatalogRecords(selectedFormat, result, options)
}));

const catalogClose = () => {
    return (dispatch) => {
        dispatch(toggleControl('metadataexplorer'));
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
        zoomToLayer: PropTypes.bool,

        // side panel properties
        width: PropTypes.number
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
        width: "500px"
    };

    render() {
        const panel = (<div role="body" className="modal_window">
                <Catalog zoomToLayer={this.props.zoomToLayer} searchOnStartup={this.props.searchOnStartup} active={this.props.active} {...this.props}/>
            </div>);
        const panelHeader = (<span><Glyphicon glyph="folder-open"/> <span className="metadataexplorer-panel-title"><Message msgId="catalog.title"/></span><span className="shapefile-panel-close panel-close" onClick={ toggleControl.bind(null, 'styler', null)}></span><button onClick={this.props.toggleControl} className="catalog-close close no-border btn-default">{this.props.closeGlyph ? <Glyphicon glyph={this.props.closeGlyph} /> : <span>×</span>}</button></span>);

        return (<Sidebar
                pullRight
                open={this.props.active}
                docked
                styles={{
                    sidebar: {
                        zIndex: 1022,
                        position: this.props.active ? "fixed" : "absolute",
                        width: this.props.width
                    },
                    overlay: {
                        zIndex: 1021
                    },
                    root: {
                        right: this.props.active ? 0 : 'auto',
                        overflow: 'visible',
                        width: 0
                    },
                    content: {
                        overflowY: 'auto'
                    }
            }}
            sidebarClassName="catalog-sidebar nav-menu"
            rootClassName="catalog-root"
            sidebar={<Panel id={this.props.id} header={panelHeader}
                style={this.props.panelStyle} className={this.props.panelClassName}>
                    {panel}
                </Panel>}>
                <div style={{display: "none"}} />
            </Sidebar>);
    }
}

const MetadataExplorerPlugin = connect((state) => ({
    searchOptions: state.catalog && state.catalog.searchOptions,
    formats: state.catalog && state.catalog.supportedFormats || [{name: 'csw', label: 'CSW'}, {name: 'wms', label: 'WMS'}, {name: "wmts", label: "WMTS"}],
    result: state.catalog && state.catalog.result,
    loadingError: state.catalog && state.catalog.loadingError,
    selectedService: state.catalog && state.catalog.selectedService,
    mode: state.catalog && state.catalog.mode,
    services: state.catalog && state.catalog.services,
    layerError: state.catalog && state.catalog.layerError,
    active: state.controls && state.controls.toolbar && state.controls.toolbar.active === "metadataexplorer" || state.controls && state.controls.metadataexplorer && state.controls.metadataexplorer.enabled
}), {
    onSearch: textSearch,
    onLayerAdd: addLayer,
    toggleControl: catalogClose,
    onChangeFormat: changeCatalogFormat,
    onChangeNewUrl: changeNewUrl,
    onChangeNewType: changeNewType,
    onChangeNewTitle: changeNewTitle,
    onChangeSelectedService: changeSelectedService,
    onChangeCatalogMode: changeCatalogMode,
    onAddService: addService,
    onError: addLayerError
})(MetadataExplorerComponent);

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
            help: <Message msgId="helptexts.metadataExplorer"/>,
            icon: <Glyphicon glyph="folder-open" />,
            priority: 1
        },
        BurgerMenu: {
            name: 'metadataexplorer',
            position: 5,
            text: <Message msgId="catalog.title"/>,
            icon: <Glyphicon glyph="folder-open"/>,
            action: toggleControl.bind(null, 'metadataexplorer', null),
            priority: 2,
            doNotHide: true
        }
    }),
    reducers: {catalog: require('../reducers/catalog')},
    epics: {newCatalogServiceAdded}
};
