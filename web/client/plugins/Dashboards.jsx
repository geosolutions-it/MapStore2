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
const Message = require("../components/I18N/Message");
const emptyState = require('../components/misc/enhancers/emptyState');

const { setDashboardsAvailable } = require('../actions/dashboards');
const {mapTypeSelector} = require('../selectors/maptype');
const { userRoleSelector } = require('../selectors/security');
const { isFeaturedMapsEnabled } = require('../selectors/featuredmaps');
const { totalCountSelector } = require('../selectors/dashboards');
const {createSelector} = require('reselect');
const { compose } = require('recompose');

const DashboardGrid = require('./dashboard/DashboardsGrid');
const PaginationToolbar = require('./dashboard/PaginationToolbar');
const EmptyDashboardsView = require('./dashboard/EmptyDashboardsView');

const dashboardsCountSelector = createSelector(
    totalCountSelector,
    count => ({ count })
);

/**
 * Plugin for Dashboards resources
 * @name Dashboards
 * @memberof plugins
 * @prop {boolean} cfg.showCreateButton default true, use to render create a new one button
 */
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
        title: <h3><Message msgId="resources.dashboards.titleNoCount" /></h3>,
        mapsOptions: {start: 0, limit: 12},
        colProps: {
            xs: 12,
            sm: 6,
            lg: 3,
            md: 2,
            className: 'ms-map-card-col'
        },
        maps: []
    };

    componentDidMount() {
        this.props.onMount();
    }

    render() {
        return (<DashboardGrid
            resources={this.props.resources}
            fluid={this.props.fluid}
            title={this.props.title}
            colProps={this.props.colProps}
            viewerUrl={(dashboard) => {this.context.router.history.push(`dashboard/${dashboard.id}`); }}
            getShareUrl={dashboard => `dashboard/${dashboard.id}`}
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
    resources: resources.map(res => ({...res, featuredEnabled: featuredEnabled && role === 'ADMIN'})) // TODO: remove false to enable featuredEnabled
}));

const DashboardsPlugin = compose(
    connect(dashboardsPluginSelector, {
        onMount: () => setDashboardsAvailable(true)
    }),
    emptyState(
        ({resources = [], loading}) => !loading && resources.length === 0,
        ({showCreateButton = true}) => ({
            glyph: "dashboard",
            title: <Message msgId="resources.dashboards.noDashboardAvailable" />,
            description: <EmptyDashboardsView showCreateButton={showCreateButton}/>
        })

    )
)(Dashboards);

module.exports = {
    DashboardsPlugin: assign(DashboardsPlugin, {
        NavMenu: {
            position: 2,
            label: <Message msgId="resources.dashboards.menuText" />,
            linkId: '#mapstore-maps-grid',
            glyph: 'dashboard'
        },
        ContentTabs: {
            name: 'dashboards',
            key: 'dashboards',
            TitleComponent:
                connect(dashboardsCountSelector)(({ count = ""}) => <Message msgId="resources.dashboards.title" msgParams={{ count: count + "" }} />),
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
