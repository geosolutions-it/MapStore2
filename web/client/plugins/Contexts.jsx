/*
* Copyright 2019, GeoSolutions Sas.
* All rights reserved.
*
* This source code is licensed under the BSD-style license found in the
* LICENSE file in the root directory of this source tree.
*/
import React from 'react';
import PropTypes from 'prop-types';
import assign from 'object-assign';
import {connect} from 'react-redux';
import Message from "../components/I18N/Message";
import emptyState from '../components/misc/enhancers/emptyState';

import {setContextsAvailable} from '../actions/contexts';
import {mapTypeSelector} from '../selectors/maptype';
import {userRoleSelector} from '../selectors/security';
import {isFeaturedMapsEnabled} from '../selectors/featuredmaps';
import {totalCountSelector} from '../selectors/contexts';
import * as epics from '../epics/contexts';
import contextsReducer from '../reducers/contexts';
import {createSelector} from 'reselect';
import {compose} from 'recompose';

import ContextGrid from './contexts/ContextGrid';
import PaginationToolbar from './contexts/PaginationToolbar';
import EmptyContextsView from './contexts/EmptyContextsView';

const contextsCountSelector = createSelector(
    totalCountSelector,
    count => ({ count })
);


class Contexts extends React.Component {
    static propTypes = {
        mapType: PropTypes.string,
        title: PropTypes.any,
        onMount: PropTypes.func,
        loadContexts: PropTypes.func,
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
        loadContexts: () => {},
        fluid: false,
        title: <h3><Message msgId="resources.contexts.titleNoCount" /></h3>,
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
    }

    render() {
        return (<ContextGrid
            resources={this.props.resources}
            fluid={this.props.fluid}
            title={this.props.title}
            colProps={this.props.colProps}
            viewerUrl={(context) => {this.context.router.history.push(`context/${context.id}`);}}
            bottom={<PaginationToolbar />}
        />);
    }
}

const contextsPluginSelector = createSelector([
    mapTypeSelector,
    state => state.contexts && state.contexts.searchText,
    state => state.contexts && state.contexts.results ? state.contexts.results : [],
    isFeaturedMapsEnabled,
    userRoleSelector
], (mapType, searchText, resources, featuredEnabled, role) => ({
    mapType,
    searchText,
    resources: resources.map(res => ({...res, featuredEnabled: featuredEnabled && role === 'ADMIN'})) // TODO: remove false to enable featuredEnabled
}));

const ContextsPlugin = compose(
    connect(contextsPluginSelector, {
        onMount: () => setContextsAvailable(true)
    }),
    emptyState(
        ({resources = [], loading}) => !loading && resources.length === 0,
        () => ({
            glyph: "wrench",
            title: <Message msgId="resources.contexts.noContextAvailable" />,
            description: <EmptyContextsView />
        })

    )
)(Contexts);

export default {
    ContextsPlugin: assign(ContextsPlugin, {
        NavMenu: {
            position: 4,
            label: <Message msgId="resources.contexts.menuText" />,
            linkId: '#mapstore-contexts-grid',
            glyph: 'wrench'
        },
        ContentTabs: {
            name: 'contexts',
            key: 'contexts',
            TitleComponent:
                connect(contextsCountSelector)(({ count = ""}) => <Message msgId="resources.contexts.title" msgParams={{ count: count + "" }} />),
            position: 4,
            tool: true,
            priority: 1
        }
    }),
    epics,
    reducers: {
        contexts: contextsReducer
    }
};

