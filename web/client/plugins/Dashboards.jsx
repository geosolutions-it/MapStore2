/*
* Copyright 2017, GeoSolutions Sas.
* All rights reserved.
*
* This source code is licensed under the BSD-style license found in the
* LICENSE file in the root directory of this source tree.
*/
const React = require('react');
const PropTypes = require('prop-types');
const assign = require('object-assign');
const {connect} = require('react-redux');
const ConfigUtils = require('../utils/ConfigUtils');
const Message = require("../components/I18N/Message");

const {setDashboardsAvailable } = require('../actions/dashboards');
const {mapTypeSelector} = require('../selectors/maptype');
const {userRoleSelector} = require('../selectors/security');
const { isFeaturedMapsEnabled } = require('../selectors/featuredmaps');
const {createSelector} = require('reselect');

const DashboardGrid = require('./dashboard/DashboardsGrid');

const { withHandlers, renameProp, compose} = require('recompose');
const loadDashboards = () => ({type: "LOAD_DASHBOARD_DUMMY"});
const PaginationToolbar = compose(
    connect(({dashboards = {}}) => {
        const { start, limit, results, loading, totalCount, searchText } = dashboards;
        const total = Math.min(totalCount || 0, limit || 0);
        const page = results && total && Math.ceil(start / total) || 0;
        return {
            page: page,
            pageSize: limit,
            items: results,
            total: totalCount,
            searchText,
            loading
        };
    }),
    renameProp('loadDashboards', 'loadPage'),
    withHandlers({
        onSelect: ({ loadPage = () => { }, searchText, pageSize }) => (pageNumber) => {
            let start = pageSize * pageNumber;
            let limit = pageSize;
            loadPage(ConfigUtils.getDefaults().geoStoreUrl, searchText, { start, limit });
        }
    })
)(require('../components/misc/PaginationToolbar'));

class Dashboards extends React.Component {
    static propTypes = {
        mapType: PropTypes.string,
        title: PropTypes.any,
        onMount: PropTypes.func,
        loadDashboards: PropTypes.func,
        resources: PropTypes.array,
        searchText: PropTypes.string,
        mapsOptions: PropTypes.object,
        colProps: PropTypes.object,
        fluid: PropTypes.bool
    };

    static contextTypes = {
        router: PropTypes.object
    };

    static defaultProps = {
        mapType: "leaflet",
        onMount: () => {},
        loadDashboards: () => {},
        fluid: false,
        title: <h3><Message msgId="resources.dashboards" /></h3>,
        mapsOptions: {start: 0, limit: 12},
        colProps: {
            xs: 12,
            sm: 6,
            lg: 3,
            md: 4,
            className: 'ms-map-card-col'
        },
        maps: []
    };

    componentDidMount() {
        this.props.onMount();
        this.props.loadDashboards(ConfigUtils.getDefaults().geoStoreUrl, this.props.searchText || ConfigUtils.getDefaults().initialMapFilter || "*", this.props.mapsOptions);
    }

    render() {
        return (<DashboardGrid
            resources={this.props.resources}
            fluid={this.props.fluid}
            title={this.props.title}
            colProps={this.props.colProps}
            viewerUrl={(dashboard) => {this.context.router.history.push(`dashboard/${dashboard.id}`); }}
            bottom={<PaginationToolbar />}
            />);
    }
}

const dashboardsPluginSelector = createSelector([
    mapTypeSelector,
    state => state.dashboards && state.dashboards.searchText,
    state => state.dashboards && state.dashboards.results ? state.dashboards.results : [],
    isFeaturedMapsEnabled,
    userRoleSelector
], (mapType, searchText, resources, featuredEnabled, role) => ({
    mapType,
    searchText,
    resources: resources.map(res => ({...res, featuredEnabled: false && featuredEnabled && role === 'ADMIN'})) // TODO: remove false to enable featuredEnabled
}));

const DashboardsPlugin = connect(dashboardsPluginSelector, {
    loadDashboards,
    onMount: () => setDashboardsAvailable(true)
})(Dashboards);

module.exports = {
    DashboardsPlugin: assign(DashboardsPlugin, {
        NavMenu: {
            position: 2,
            label: <Message msgId="resources.dashboards" />,
            linkId: '#mapstore-maps-grid',
            glyph: '1-map'
        },
        ContentTabs: {
            name: 'maps',
            title: <Message msgId="resources.dashboards" />,
            position: 2,
            tool: true,
            priority: 1
        }
    }),
    epics: require('../epics/dashboards'),
    reducers: {
        dashboards: require('../reducers/dashboards')
    }
};
