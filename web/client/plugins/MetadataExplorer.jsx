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
const {cswToCatalogSelector} = require("../selectors/cswtocatalog");
// const {createDefaultMemorizeSelector} = require("../selectors/common");
const {createSelector} = require("reselect");
const {Glyphicon, Input, Alert, Pagination, Panel} = require('react-bootstrap');
const Spinner = require('react-spinkit');
const {textSearch} = require("../actions/catalog");
const {addLayer} = require("../actions/layers");
const {zoomToExtent} = require("../actions/map");
const {toggleControl} = require("../actions/controls");
const Message = require("../components/I18N/Message");
require('./metadataexplorer/css/style.css');
const makeCatalogSelector = () => {
    return createSelector([(state) => state.catalog], cswToCatalogSelector);
};

const makeMapStateToProps = () => {
    const getCatalogRecords = makeCatalogSelector();
    const mapStateToProps = (state, props) => {
        return {
          records: getCatalogRecords(state, props)
      };
    };
    return mapStateToProps;
};

const RecordGrid = connect(makeMapStateToProps, {
    // add layer action to pass to the layers
    onZoomToExtent: zoomToExtent
})(require("../components/catalog/RecordGrid"));

const Dialog = require('../components/misc/Dialog');

const MetadataExplorerComponent = React.createClass({
    propTypes: {
        id: React.PropTypes.string,
        onSearch: React.PropTypes.func,
        onLayerAdd: React.PropTypes.func,
        pageSize: React.PropTypes.number,
        displayURL: React.PropTypes.bool,
        active: React.PropTypes.bool,
        initialCatalogURL: React.PropTypes.string,
        result: React.PropTypes.object,
        loadingError: React.PropTypes.object,
        searchOptions: React.PropTypes.object,
        chooseCatalogUrl: React.PropTypes.bool,
        wrap: React.PropTypes.bool,
        wrapWithPanel: React.PropTypes.bool,
        panelStyle: React.PropTypes.object,
        panelClassName: React.PropTypes.string,
        toggleControl: React.PropTypes.func,
        closeGlyph: React.PropTypes.string,
        buttonStyle: React.PropTypes.string,
        style: React.PropTypes.object,
        showGetCapLinks: React.PropTypes.bool
    },
    getDefaultProps() {
        return {
            id: "mapstore-metadata-explorer",
            active: false,
            pageSize: 6,
            onSearch: () => {},
            onLayerAdd: () => {},
            chooseCatalogUrl: true,
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
    getInitialState() {
        return {
            loading: false,
            catalogURL: null
        };
    },
    componentWillReceiveProps(nextProps) {
        if (nextProps !== this.props) {
            this.setState({
                loading: false
            });
        }
    },
    onKeyDown(event) {
        if (event.keyCode === 13) {
            this.props.onSearch(this.getCatalogUrl(), 1, this.props.pageSize, this.refs.searchText.getValue());
            this.setState({
                loading: true
            });
        }
    },
    getCatalogUrl() {
        return this.state.catalogURL || (this.props.searchOptions && this.props.searchOptions.url) || this.props.initialCatalogURL;
    },
    renderResult() {
        if (this.props.result) {
            if (this.props.result.numberOfRecordsMatched === 0) {
                return (<div>
                    <Message msgId="catalog.noRecordsMatched" />
                </div>);
            }
            return this.renderRecords();
        } else if (this.props.loadingError) {
            return this.renderError();
        }
    },
    renderError() {
        return (<Alert bsStyle="danger">
            <Message msgId="catalog.error" />
          </Alert>);
    },
    renderLoading() {
        return (<Spinner spinnerName="circle" noFadeIn/>);
    },
    renderPagination() {
        let total = this.props.result.numberOfRecordsMatched;
        let returned = this.props.result.numberOfRecordsReturned;
        let start = this.props.searchOptions.startPosition;
        // let next = this.props.result.nextRecord;
        let pageSize = this.props.pageSize;
        let page = Math.floor( start / pageSize);
        let pageN = Math.ceil(total / pageSize);
        return (<div><Pagination
          prev next first last ellipsis boundaryLinks
          bsSize="small"
          items={pageN}
          maxButtons={5}
          activePage={page + 1}
          onSelect={this.handlePage} />
        <div className="push-right">
            <Message msgId="catalog.pageInfo" msgParams={{start, end: start + returned - 1, total}} />
            {this.state.loading ? this.renderLoading() : null}
        </div>
  </div>);
    },
    renderRecords() {
        return (<div>
                <RecordGrid key="records"
                    catalogURL={this.getCatalogUrl() }
                    onLayerAdd={this.props.onLayerAdd}
                    showGetCapLinks={this.props.showGetCapLinks}
                />
                {this.renderPagination()}
        </div>);
    },
    renderURLInput() {
        if (!this.getCatalogUrl() || this.props.chooseCatalogUrl) {
            return (<Input
                ref="catalogURL"
                type="text"
                placeholder={"Enter catalog URL..."}
                onChange={this.setCatalogUrl}/>);
        }
    },
    render() {
        const panel = (
             <div role="body">
                 <div>
                     {this.renderURLInput()}
                     <Input
                         ref="searchText"
                         type="text"
                         style={{
                             textOverflow: "ellipsis"
                         }}
                         placeholder={"text to search..."}
                         onKeyDown={this.onKeyDown}/>
                 </div>
                 <div>
                    {this.renderResult()}
                 </div>
             </div>
        );
        if (this.props.wrap) {
            if (this.props.active) {
                if (this.props.wrapWithPanel) {
                    return (<Panel id={this.props.id} header={<span><span className="metadataexplorer-panel-title"><Message msgId="catalog.title"/></span><span className="shapefile-panel-close panel-close" onClick={this.props.toggleControl}></span></span>} style={this.props.panelStyle} className={this.props.panelClassName}>
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
    },
    setCatalogUrl(e) {
        this.setState({catalogURL: e.target.value});
    },
    handlePage(mouseEvent, pageEvent) {
        if (pageEvent && pageEvent.eventKey !== undefined) {
            let start = ((pageEvent.eventKey - 1) * this.props.pageSize) + 1;
            this.props.onSearch(this.getCatalogUrl(), start, this.props.pageSize, this.props.searchOptions.text);
            this.setState({
                loading: true
            });
        }
    }
});
const MetadataExplorerPlugin = connect((state) => ({
    searchOptions: state.catalog && state.catalog.searchOptions,
    result: state.catalog && state.catalog.result,
    loadingError: state.catalog && state.catalog.loadingError,
    active: state.controls && state.controls.toolbar && state.controls.toolbar.active === "metadataexplorer" || state.controls && state.controls.metadataexplorer && state.controls.metadataexplorer.enabled
}), {
    onSearch: textSearch,
    onLayerAdd: addLayer,
    toggleControl: toggleControl.bind(null, 'metadataexplorer', null)
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
