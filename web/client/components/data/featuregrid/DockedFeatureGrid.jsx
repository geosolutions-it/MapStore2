const React = require('react');
const {connect} = require('react-redux');
const {isObject} = require('lodash');
const Dock = require('react-dock');

const {Modal} = require('react-bootstrap');

const FilterUtils = require('../../../utils/FilterUtils');

const {getWindowSize} = require('../../../utils/AgentUtils');
const FeatureGrid = connect((state) => {
    return {
        select: state.featuregrid && state.featuregrid.select || [],
        selectAllActive: state.featuregrid && state.featuregrid.selectAll
    };
}, {})(require('./FeatureGrid'));

const {head} = require('lodash');
const I18N = require('../../../components/I18N/I18N');
const Spinner = require('react-spinkit');
const assign = require('object-assign');
const {isEqual} = require('lodash');

require("./featuregrid.css");

const DockedFeatureGrid = React.createClass({
    propTypes: {
        isNew: React.PropTypes.bool,
        open: React.PropTypes.bool,
        detailOpen: React.PropTypes.bool,
        expanded: React.PropTypes.bool,
        header: React.PropTypes.string,
        features: React.PropTypes.oneOfType([ React.PropTypes.array, React.PropTypes.object]),
        columnsDef: React.PropTypes.array,
        map: React.PropTypes.object,
        loadingGrid: React.PropTypes.bool,
        loadingGridError: React.PropTypes.oneOfType([
            React.PropTypes.string,
            React.PropTypes.object
        ]),
        initWidth: React.PropTypes.oneOfType([ React.PropTypes.number, React.PropTypes.string ]),
        params: React.PropTypes.object,
        // featureGrigConfigUrl: React.PropTypes.string,
        profile: React.PropTypes.string,
        onDetail: React.PropTypes.func,
        onShowDetail: React.PropTypes.func,
        changeMapView: React.PropTypes.func,
        // loadFeatureGridConfig: React.PropTypes.func,
        onExpandFilterPanel: React.PropTypes.func,
        selectFeatures: React.PropTypes.func,
        totalFeatures: React.PropTypes.number,
        pagination: React.PropTypes.bool,
        featureTypeName: React.PropTypes.string,
        ogcVersion: React.PropTypes.string,
        onQuery: React.PropTypes.func,
        searchUrl: React.PropTypes.string,
        filterObj: React.PropTypes.object,
        dataSourceOptions: React.PropTypes.object,
        withMap: React.PropTypes.bool.isRequired,
        onConfigureQuery: React.PropTypes.func,
        attributes: React.PropTypes.array,
        cleanError: React.PropTypes.func,
        selectAllToggle: React.PropTypes.func,
        templateProfile: React.PropTypes.string,
        zoomToFeatureAction: React.PropTypes.func,
        style: React.PropTypes.object
    },
    contextTypes: {
        messages: React.PropTypes.object
    },
    getInitialState() {
        return {searchN: 0};
    },
    getDefaultProps() {
        return {
            open: true,
            detailOpen: true,
            loadingGrid: false,
            loadingGridError: null,
            attributes: [],
            profile: null,
            expanded: true,
            header: "featuregrid.header",
            features: [],
            featureTypeName: null,
            ogcVersion: "2.0",
            columnsDef: [],
            pagination: true,
            params: {},
            groupFields: [],
            filterFields: [],
            spatialField: {},
            searchUrl: null,
            dataSourceOptions: {
                rowCount: -1,
                pageSize: 20
            },
            initWidth: 600,
            withMap: true,
            templateProfile: 'default',
            onDetail: () => {},
            onShowDetail: () => {},
            changeMapView: () => {},
            // loadFeatureGridConfig: () => {},
            onExpandFilterPanel: () => {},
            selectFeatures: () => {},
            onQuery: () => {},
            onConfigureQuery: () => {},
            cleanError: () => {},
            selectAllToggle: () => {}
        };
    },
    componentWillMount() {
        let height = getWindowSize().maxHeight - 108;
        this.setState({width: `calc( ${this.props.initWidth} - 30px)`, height});
    },
    shouldComponentUpdate(nextProps) {
        return Object.keys(this.props).reduce((prev, prop) => {
            if ( !prev && prop !== 'map' && prop !== 'columnsDef' && this.props[prop] !== nextProps[prop])) {
                return true;
            }
            return prev;
        }, false);
    },
    componentWillUpdate(nextProps) {
        if (!nextProps.loadingGrid && this.props.isNew && !nextProps.isNew) {
            this.setState({searchN: this.state.searchN + 1});
        }
        if (!nextProps.loadingGrid && nextProps.pagination && (nextProps.dataSourceOptions !== this.props.dataSourceOptions)) {
            this.dataSource = this.getDataSource(nextProps.dataSourceOptions);
        }
        if (!nextProps.loadingGrid && (this.featureLoaded && nextProps.features !== this.props.features)) {
            let rowsThisPage = nextProps.features || [];
            if (rowsThisPage) {
                this.featureLoaded.successCallback(rowsThisPage, nextProps.totalFeatures);
            }
        }
        if ((this.props.columnsDef && !nextProps.columnsDef) || (this.props.filterObj && !nextProps.filterObj)) {
            this.props.selectFeatures([]);
            this.props.selectAllToggle();
        }
    },
    componentDidUpdate(prevProps) {
        if (!this.props.loadingGrid && !this.featureLoaded && !this.props.pagination && this.props.searchUrl) {
            if (this.props.filterObj && !isEqual(prevProps.filterObj, this.props.filterObj)) {
                this.getFeatures();
            }
        }
    },
    onGridClose(filter) {
        this.props.selectFeatures([]);
        this.props.selectAllToggle();
        if (filter) {
            this.props.onExpandFilterPanel(true);
        }
    },
    onResize(event, resize) {
        let size = resize.size;
        this.setState({width: size.width, height: size.height});

    },
    getRequestId(params) {
        return `${params.startRow}_${params.endRow}_${params.sortModel.map((m) => `${m.colId}_${m.sort}` ).join('_')}`;
    },
    getSortAttribute(colId) {
        let col = head(this.props.columnsDef.filter((c) => colId === `properties.${c.field}`));
        return col && col.sortAttribute ? col.sortAttribute : (col && col.field || '');
    },
    getSortOptions(params) {
        return params.sortModel.reduce((o, m) => ({sortBy: this.getSortAttribute(m.colId), sortOrder: m.sort.toUpperCase()}), {});
    },
    getFeatures(params) {
        if (!this.props.loadingGrid && this.props.searchUrl) {
            let pagination = this.props.pagination ? {startIndex: params.startRow, maxFeatures: params.endRow - params.startRow} : null;
            let filterObj = {
                ...this.props.filterObj,
                sortOptions: params && params.sortModel && this.getSortOptions(params) || null,
                pagination
            };
            this.featureLoaded = params;
            this.sortModel = params && params.sortModel;
            this.props.onQuery(this.props.searchUrl, filterObj, this.props.params);

        }
    },
    getDataSource(dataSourceOptions) {
        return {
            rowCount: dataSourceOptions.rowCount,
            getRows: this.getFeatures,
            pageSize: this.props.pagination ? dataSourceOptions.pageSize : 10000000,
            overflowSize: 20
        };
    },
    renderLoadingException(loadingError, msg) {
        let exception;
        if (isObject(loadingError)) {
            exception = loadingError.status +
                "(" + loadingError.statusText + ")" +
                ": " + loadingError.data;
        } else {
            exception = loadingError;
        }

        return (
            <Modal show={loadingError ? true : false} bsSize="small" onHide={() => {
                this.props.cleanError(false);
               // this.onGridClose(true);
            }}>
                <Modal.Header className="dialog-error-header-side" closeButton>
                    <Modal.Title><I18N.Message msgId={msg}/></Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <div className="mapstore-error">{exception}</div>
                </Modal.Body>
                <Modal.Footer>
                </Modal.Footer>
            </Modal>
        );
    },
    render() {
        let loadingError = this.props.loadingGridError;
        if (loadingError) {
            return (
                this.renderLoadingException(loadingError, "queryform.query_request_exception")
            );
        }

        let cols = this.props.columnsDef && this.props.columnsDef.map((column) => {
            if (!column.profiles || (column.profiles && column.profiles.indexOf(this.props.profile) !== -1)) {
                return assign({}, column, {field: "properties." + column.field});
            }
        }).filter((c) => c);

        if (cols && this.sortModel && this.sortModel.length > 0) {
            cols = cols.map((c) => {
                let model = head(this.sortModel.filter((m) => m.colId === c.field));
                if ( model ) {
                    c.sort = model.sort;
                }
                return c;
            });
        }

        let gridConf = this.props.pagination ? {dataSource: this.getDataSource(this.props.dataSourceOptions), features: []} : {features: this.props.features};

        if (this.props.filterObj && cols) {
            return (
                <Dock
                    position={"bottom" /* 'left', 'top', 'right', 'bottom' */}
                    size={this.state.size}
                    dimMode={"none" /*'transparent', 'none', 'opaque'*/}
                    isVisible={true}
                    onVisibleChange={this.handleVisibleChange}
                    fluid={true}
                    dimStyle={{ background: 'rgba(0, 0, 100, 0.2)' }}
                    dockStyle={null}
                    dockHiddenStyle={null} >
                    {this.props.loadingGrid ?
                        <div style={{height: "300px", width: this.state.width}}>
                            <div style={{
                                position: "relative",
                                width: "60px",
                                top: "50%",
                                left: "45%"}}>
                                <Spinner style={{width: "60px"}} spinnerName="three-bounce" noFadeIn/>
                            </div>
                        </div> :
                        <div style={{
                                height: "100%"
                                }}>
                            <FeatureGrid
                                key={"search-results-" + (this.state && this.state.searchN)}
                                className="featureGrid"
                                changeMapView={this.props.changeMapView}
                                srs="EPSG:4326"
                                map={this.props.map}
                                columnDefs={cols}
                                style={{
                                    flex: "1 0 auto",
                                    width: "100%",
                                    height: "calc(100% - 300px )"
                                }}
                                maxZoom={16}
                                selectFeatures={this.selectFeatures}
                                selectAll={this.selectAll}
                                paging={this.props.pagination}
                                enableZoomToFeature={this.props.withMap}
                                agGridOptions={{enableServerSideSorting: true, suppressMultiSort: true}}
                                zoomToFeatureAction={this.props.zoomToFeatureAction}
                                toolbar={{
                                    zoom: this.props.withMap,
                                    exporter: true,
                                    toolPanel: true,
                                    selectAll: true
                                }}
                                {...gridConf}
                                />
                        </div>}
                </Dock>
            );
        }

        return null;
    },
    selectAll(select) {
        if (select) {
            let filterObj = {
                ...this.props.filterObj
            };
            let SLD_BODY = FilterUtils.getSLD(this.props.featureTypeName, filterObj, '1.0');
            this.props.selectAllToggle(this.props.featureTypeName, SLD_BODY);
        } else {
            this.props.selectAllToggle();
        }
    },
    selectFeatures(features) {
        this.props.selectAllToggle();
        this.props.selectFeatures(features);
    }
});

module.exports = DockedFeatureGrid;
