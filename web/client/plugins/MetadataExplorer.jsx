/**
 * Copyright 2016, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

const React = require('react');
const {connect} = require('react-redux');
const assign = require('object-assign');
const {createSelector} = require("reselect");
const {Glyphicon, Panel} = require('react-bootstrap');
const {textSearch, changeCatalogFormat} = require("../actions/catalog");
const {addLayer} = require("../actions/layers");
const {zoomToExtent} = require("../actions/map");
const {toggleControl} = require("../actions/controls");
const Message = require("../components/I18N/Message");
require('./metadataexplorer/css/style.css');

const CatalogUtils = require('../utils/CatalogUtils');

const catalogSelector = createSelector([
    (state) => state && state.catalog && state.catalog.result,
    (state) => state && state.catalog && state.catalog.format || 'csw',
    (state) => state && state.catalog && state.catalog.searchOptions
], (result, format, options) =>({
    format,
    records: CatalogUtils.getCatalogRecords(format, result, options)
}));

const Catalog = connect(catalogSelector, {
    // add layer action to pass to the layers
    onZoomToExtent: zoomToExtent
})(require('../components/catalog/Catalog'));

const Dialog = require('../components/misc/Dialog');

const MetadataExplorerComponent = React.createClass({
    propTypes: {
        id: React.PropTypes.string,
        active: React.PropTypes.bool,
        formats: React.PropTypes.array,
        wrap: React.PropTypes.bool,
        wrapWithPanel: React.PropTypes.bool,
        panelStyle: React.PropTypes.object,
        panelClassName: React.PropTypes.string,
        toggleControl: React.PropTypes.func,
        closeGlyph: React.PropTypes.string,
        buttonStyle: React.PropTypes.string,
        style: React.PropTypes.object
    },
    getDefaultProps() {
        return {
            id: "mapstore-metadata-explorer",
            active: false,
            wrap: false,
            wrapWithPanel: true,
            panelStyle: {
                minWidth: "300px",
                zIndex: 100,
                position: "absolute",
                overflow: "auto",
                top: "100px",
                right: "100px"
            },
            panelClassName: "toolbar-panel",
            toggleControl: () => {},
            closeGlyph: "",
            buttonStyle: "default"
        };
    },
    render() {
        const panel = <div role="body"><Catalog {...this.props}/></div>;
        if (this.props.wrap) {
            if (this.props.active) {
                if (this.props.wrapWithPanel) {
                    return (<Panel id={this.props.id} header={<span><span className="metadataexplorer-panel-title"><Message msgId="catalog.title"/></span><span className="shapefile-panel-close panel-close" onClick={ toggleControl.bind(null, 'styler', null)}></span></span>} style={this.props.panelStyle} className={this.props.panelClassName}>
                        {panel}
                    </Panel>);
                }
                return (<Dialog id="mapstore-catalog-panel" style={this.props.style}>
                    <span role="header"><span className="metadataexplorer-panel-title"><Message msgId="catalog.title"/></span><button onClick={this.props.toggleControl} className="print-panel-close close">{this.props.closeGlyph ? <Glyphicon glyph={this.props.closeGlyph}/> : <span>×</span>}</button></span>
                    {panel}
                </Dialog>);
            }
            return null;
        }
        return panel;
    }
});
const MetadataExplorerPlugin = connect((state) => ({
    searchOptions: state.catalog && state.catalog.searchOptions,
    formats: state.catalog && state.catalog.supportedFormats || [{name: 'csw', label: 'CSW'}, {name: 'wms', label: 'WMS'}],
    result: state.catalog && state.catalog.result,
    loadingError: state.catalog && state.catalog.loadingError,
    active: state.controls && state.controls.toolbar && state.controls.toolbar.active === "metadataexplorer" || state.controls && state.controls.metadataexplorer && state.controls.metadataexplorer.enabled
}), {
    onSearch: textSearch,
    onLayerAdd: addLayer,
    toggleControl: toggleControl.bind(null, 'metadataexplorer', null),
    onChangeFormat: changeCatalogFormat
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
    reducers: {catalog: require('../reducers/catalog')}
};
