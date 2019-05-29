/*
* Copyright 2018, GeoSolutions Sas.
* All rights reserved.
*
* This source code is licensed under the BSD-style license found in the
* LICENSE file in the root directory of this source tree.
*/

const React = require('react');
const PropTypes = require('prop-types');
const assign = require('object-assign');
const {defaultProps, compose, mapPropsStream} = require('recompose');
const {createSelector} = require('reselect');
const {connect} = require('react-redux');
const {isEqual} = require('lodash');
const { setFeaturedMapsEnabled} = require('../actions/maps');

const Message = require("../components/I18N/Message");
const maptypeEpics = require('../epics/maptype');
const mapsEpics = require('../epics/maps');
const {userRoleSelector} = require('../selectors/security');
const {mapTypeSelector} = require('../selectors/maptype');
const {resourceSelector, searchTextSelector} = require('../selectors/featuredmaps');
const {loadPage, updateItemsLifecycle} = require('../components/maps/enhancers/featuredMaps');
const gridPagination = require('../components/misc/enhancers/gridPagination');

const MapsGrid = require('./maps/MapsGrid');
const MetadataModal = require('./maps/MetadataModal');

const PAGE_SIZE = 4;

class FeaturedMaps extends React.Component {

    static propTypes = {
        mapType: PropTypes.string,
        items: PropTypes.array,
        colProps: PropTypes.object,
        fluid: PropTypes.bool,
        bottom: PropTypes.node,
        className: PropTypes.string,
        previousItems: PropTypes.array,
        onStart: PropTypes.func
    };

    static contextTypes = {
        router: PropTypes.object
    };

    componentWillMount() {
        this.props.onStart();
    }

    render() {
        const items = this.props.items.length > 0 && this.props.items || this.props.previousItems || [];
        return (
            <MapsGrid
                id="ms-featured-maps"
                fluid={this.props.fluid}
                className={this.props.className}
                title={<h3><Message msgId="manager.featuredMaps" /></h3>}
                maps={items}
                colProps={this.props.colProps}
                viewerUrl={(map) =>
                    map.category && map.category.name === "DASHBOARD"
                        ? this.context.router.history.push(`/dashboard/${map.id}`)
                        : this.context.router.history.push("/viewer/" + this.props.mapType + "/" + map.id)
                }
                metadataModal={MetadataModal}
                bottom={this.props.bottom}
                style={items.length === 0 ? {display: 'none'} : {}}/>
        );
    }
}

const featuredMapsPluginSelector = createSelector([
    mapTypeSelector,
    userRoleSelector,
    state => state.browser && state.browser.mobile,
    searchTextSelector,
    resourceSelector
], (mapType, role, isMobile, searchText, resource) => ({
    mapType,
    permission: role === 'ADMIN',
    pagination: isMobile ? 'virtual-scroll-horizontal' : 'show-more',
    searchText,
    resource
}));

const updateFeaturedMapsStream = mapPropsStream(props$ =>
    props$.merge(props$.take(1).switchMap(({searchText = '', permission, viewSize, pageSize, loadFirst = () => {} }) => {
        return props$
            .debounceTime(500)
            .startWith({searchText, permission, viewSize, pageSize, loading: true})
            .distinctUntilChanged((previous, next) =>
                isEqual(previous.resource, next.resource)
                && previous.searchText === next.searchText
                && previous.permission === next.permission
            )
            .do(({permission: newPermission, viewSize: newViewSize, searchText: newSearchText, pageSize: newPageSize} = {}) =>
                loadFirst({permission: newPermission, viewSize: newViewSize, searchText: newSearchText, pageSize: newPageSize})
            )
            .ignoreElements();
    })));

/**
 * FeaturedMaps plugin. Shows featured maps in a grid.
 * @prop {string} cfg.pageSize change the page size (only desktop)
 * @memberof plugins
 * @class
 */

const FeaturedMapsPlugin = compose(
    connect(featuredMapsPluginSelector, {
        onStart: () => setFeaturedMapsEnabled( true )
    }),
    defaultProps({
        mapType: 'leaflet',
        onGoToMap: () => {},
        fluid: false,
        mapsOptions: {start: 0, limit: 12},
        colProps: {
            xs: 12,
            sm: 6,
            lg: 3,
            md: 4,
            className: 'ms-map-card-col'
        },
        items: [],
        pageSize: PAGE_SIZE,
        skip: 0,
        total: 0,
        viewSize: PAGE_SIZE,
        onChangeSize: () => {},
        onLoadMore: () => {},
        loading: false,
        className: '',
        previousItems: [],
        searchText: ''
    }),
    gridPagination({loadPage, pageSize: PAGE_SIZE}),
    updateItemsLifecycle,
    updateFeaturedMapsStream
)((FeaturedMaps));

module.exports = {
    FeaturedMapsPlugin: assign(FeaturedMapsPlugin, {
        NavMenu: {
            position: 1,
            label: <Message msgId="manager.featuredMaps" />,
            linkId: '#ms-featured-maps',
            glyph: 'star'
        }
    }),
    epics: {
        ...maptypeEpics,
        ...mapsEpics
    },
    reducers: {
        featuredmaps: require('../reducers/featuredmaps'),
        maptype: require('../reducers/maptype'),
        currentMap: require('../reducers/currentMap')
    }
};
