const PropTypes = require('prop-types');
const React = require('react');
const {connect} = require('react-redux');
const {isObject, isEqual, head} = require('lodash');
const Dock = require('react-dock').default;

const {Button, Glyphicon} = require('react-bootstrap');
const Modal = require('../../../components/misc/Modal');

const FilterUtils = require('../../../utils/FilterUtils');

const FeatureGrid = connect((state) => {
    return {
        select: state.featuregrid && state.featuregrid.select || [],
        selectAllActive: state.featuregrid && state.featuregrid.selectAll
    };
}, {})(require('./FeatureGrid'));

const I18N = require('../../../components/I18N/I18N');
const Spinner = require('react-spinkit');
const assign = require('object-assign');

require("./featuregrid.css");

class DockedFeatureGrid extends React.Component {
    static propTypes = {
        isNew: PropTypes.bool,
        open: PropTypes.bool,
        features: PropTypes.oneOfType([ PropTypes.array, PropTypes.object]),
        columnsDef: PropTypes.array,
        map: PropTypes.object,
        loadingGrid: PropTypes.bool,
        loadingGridError: PropTypes.oneOfType([
            PropTypes.string,
            PropTypes.object
        ]),
        initWidth: PropTypes.oneOfType([ PropTypes.number, PropTypes.string ]),
        params: PropTypes.object,
        profile: PropTypes.string,
        changeMapView: PropTypes.func,
        onExpandFilterPanel: PropTypes.func,
        selectFeatures: PropTypes.func,
        totalFeatures: PropTypes.number,
        pagination: PropTypes.bool,
        featureTypeName: PropTypes.string,
        onQuery: PropTypes.func,
        searchUrl: PropTypes.string,
        filterObj: PropTypes.object,
        dataSourceOptions: PropTypes.object,
        withMap: PropTypes.bool.isRequired,
        cleanError: PropTypes.func,
        selectAllToggle: PropTypes.func,
        zoomToFeatureAction: PropTypes.func,
        onBackToSearch: PropTypes.func,
        dockSize: PropTypes.number,
        minDockSize: PropTypes.number,
        maxDockSize: PropTypes.number,
        setDockSize: PropTypes.func,
        exportAction: PropTypes.func,
        exportEnabled: PropTypes.bool
    };

    static contextTypes = {
        messages: PropTypes.object
    };

    static defaultProps = {
        open: false,
        loadingGrid: false,
        loadingGridError: null,
        profile: null,
        features: [],
        featureTypeName: null,
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
        onBackToSearch: () => {},
        changeMapView: () => {},
        // loadFeatureGridConfig: () => {},
        onExpandFilterPanel: () => {},
        selectFeatures: () => {},
        onQuery: () => {},
        cleanError: () => {},
        selectAllToggle: () => {},
        dockSize: 0.35,
        minDockSize: 0.1,
        maxDockSize: 1.0,
        setDockSize: () => {}
    };

    state = {searchN: 0};

    shouldComponentUpdate(nextProps) {
        // this is mandatory to avoid infinite looping. TODO externalize pagination
        return Object.keys(this.props).reduce((prev, prop) => {
            if ( !prev && prop !== 'map' && prop !== 'columnsDef' && this.props[prop] !== nextProps[prop]) {
                return true;
            }
            return prev;
        }, false);
    }

    componentWillUpdate(nextProps) {
        if (!nextProps.loadingGrid && !this.props.isNew && nextProps.isNew) {
            this.setState({searchN: this.state.searchN + 1});
        }
        if (!nextProps.loadingGrid && nextProps.pagination && nextProps.dataSourceOptions !== this.props.dataSourceOptions) {
            this.dataSource = this.getDataSource(nextProps.dataSourceOptions);
        }
        if (!nextProps.loadingGrid && (this.featureLoaded && nextProps.features !== this.props.features)) {
            let rowsThisPage = nextProps.features || [];
            if (rowsThisPage) {
                this.featureLoaded.successCallback(rowsThisPage, nextProps.totalFeatures);
            }
        }
        if (this.props.open && !nextProps.open || this.props.columnsDef && !nextProps.columnsDef || this.props.filterObj && !nextProps.filterObj) {
            this.props.selectFeatures([]);
            this.props.selectAllToggle();
        }
    }

    componentDidUpdate(prevProps) {
        if (!this.props.loadingGrid && !this.featureLoaded && !this.props.pagination && this.props.searchUrl) {
            if (this.props.filterObj && !isEqual(prevProps.filterObj, this.props.filterObj)) {
                this.getFeatures();
            }
        }
    }

    onGridClose = (filter) => {
        this.props.selectFeatures([]);
        this.props.selectAllToggle();
        if (filter) {
            this.props.onExpandFilterPanel(true);
        }
    };

    getSortAttribute = (colId) => {
        let col = head(this.props.columnsDef.filter((c) => colId === `properties.${c.field}`));
        return col && col.sortAttribute ? col.sortAttribute : col && col.field || '';
    };

    getSortOptions = (params) => {
        return params.sortModel.reduce((o, m) => ({sortBy: this.getSortAttribute(m.colId), sortOrder: m.sort.toUpperCase()}), {});
    };

    getFeatures = (params) => {
        if (!this.props.loadingGrid && this.props.searchUrl) {
            let pagination = this.props.pagination ? {startIndex: params.startRow, maxFeatures: params.endRow - params.startRow} : null;
            let filterObj = {
                ...this.props.filterObj,
                sortOptions: params && params.sortModel && this.getSortOptions(params) || null,
                pagination
            };
            this.featureLoaded = params;
            this.sortModel = params && params.sortModel;
            this.props.onQuery(this.props.searchUrl, filterObj);

        }
    };

    getDataSource = (dataSourceOptions) => {
        return {
            rowCount: dataSourceOptions.rowCount,
            getRows: this.getFeatures,
            pageSize: this.props.pagination ? dataSourceOptions.pageSize : 10000000,
            overflowSize: 20
        };
    };

    renderLoadingException = (loadingError, msg) => {
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
                <Modal.Footer />
            </Modal>
        );
    };

    render() {
        let loadingError = this.props.loadingGridError;
        if (loadingError) {
            return (
                this.renderLoadingException(loadingError, "queryform.query_request_exception")
            );
        }

        let cols = this.props.columnsDef && this.props.columnsDef.map((column) => {
            if (!column.profiles || column.profiles && column.profiles.indexOf(this.props.profile) !== -1) {
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

        if (this.props.open && this.props.filterObj && cols) {
            return (
                <Dock
                    zIndex={1030 /* below dialogs, above left menu*/}
                    position={"bottom" /* 'left', 'top', 'right', 'bottom' */}
                    size={this.props.dockSize}
                    dimMode={"none" /* 'transparent', 'none', 'opaque'*/}
                    isVisible
                    onVisibleChange={this.handleVisibleChange}
                    onSizeChange={(this.limitDockHeight)}
                    fluid
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
                                <Spinner style={{width: "60px"}} spinnerName="three-bounce" noFadeIn overrideSpinnerClassName="spinner"/>
                            </div>
                        </div> :
                        <div style={{
                            height: "100%"
                        }}>
                            <FeatureGrid
                                useIcons
                                exportEnabled={this.actions.exportEnabled}
                                exportAction={this.props.exportEnabled && this.props.exportAction}
                                tools={[<Button onClick={this.props.onBackToSearch} ><Glyphicon glyph="arrow-left" /><I18N.Message msgId="featuregrid.backtosearch"/></Button>]}
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
                                    exporter: this.props.exportEnabled,
                                    toolPanel: true,
                                    selectAll: false
                                }}
                                {...gridConf}
                                />
                        </div>}
                </Dock>
            );
        }

        return null;
    }

    selectAll = (select) => {
        if (select) {
            let filterObj = {
                ...this.props.filterObj
            };
            let SLD_BODY = FilterUtils.getSLD(this.props.featureTypeName, filterObj, '1.0');
            this.props.selectAllToggle(this.props.featureTypeName, SLD_BODY);
        } else {
            this.props.selectAllToggle();
        }
    };

    selectFeatures = (features, proj) => {
        this.props.selectAllToggle();
        this.props.selectFeatures(features, proj);
    };

    limitDockHeight = (size) => {
        if (size >= this.props.maxDockSize) {
            this.props.setDockSize(this.props.maxDockSize);
        } else if (size <= this.props.minDockSize) {
            this.props.setDockSize(this.props.minDockSize);
        } else {
            this.props.setDockSize(size);
        }
    };
}

module.exports = DockedFeatureGrid;
