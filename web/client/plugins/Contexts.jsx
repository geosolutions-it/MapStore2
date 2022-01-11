/*
* Copyright 2022, GeoSolutions Sas.
* All rights reserved.
*
* This source code is licensed under the BSD-style license found in the
* LICENSE file in the root directory of this source tree.
*/

import React from 'react';
import PropTypes from 'prop-types';
import {connect} from 'react-redux';
import { compose } from 'recompose';
import {createSelector} from 'reselect';

import Message from "../components/I18N/Message";

import {createPlugin} from '../utils/PluginsUtils';
import { userRoleSelector } from '../selectors/security';
import { versionSelector } from '../selectors/version';
import { totalCountSelector, searchTextSelector, searchOptionsSelector, resultsSelector, isLoadingSelector } from '../selectors/contextmanager';
import { searchContexts, searchTextChanged, editContext, searchReset } from '../actions/contextmanager';
import PaginationToolbar from '../plugins/contextmanager/PaginationToolbar';
import ContextGrid from './contexts/ContextsGrid';

import { mapTypeSelector } from '../selectors/maptype';
import { isFeaturedMapsEnabled } from '../selectors/featuredmaps';
import emptyState from '../components/misc/enhancers/emptyState';

import EmptyMaps from '../plugins/maps/EmptyMaps';

import { loadMaps } from '../actions/maps';

import * as contextManagerEpics from '../epics/contextmanager';
import * as contextsEpics from '../epics/contexts';
import contextmanager from '../reducers/contextmanager';


const contextsCountSelector = createSelector(
    totalCountSelector,
    count => ({ count })
);

class Contexts extends React.Component {
    static propTypes = {
        className: PropTypes.string,
        splitTools: PropTypes.bool,
        showOptions: PropTypes.bool,
        searchOptions: PropTypes.object,
        isSearchClickable: PropTypes.bool,
        hideOnBlur: PropTypes.bool,
        placeholderMsgId: PropTypes.string,
        typeAhead: PropTypes.bool,
        searchText: PropTypes.string,
        onSearch: PropTypes.func,
        onSearchReset: PropTypes.func,
        onSearchTextChange: PropTypes.func,
        onEditData: PropTypes.func,
        resources: PropTypes.array,
        colProps: PropTypes.object,
        fluid: PropTypes.bool,
        title: PropTypes.string,
        editDataEnabled: PropTypes.bool
    };

    static contextTypes = {
        router: PropTypes.object
    };

    static defaultProps = {
        className: "user-search",
        hideOnBlur: false,
        isSearchClickable: true,
        showOptions: false,
        splitTools: false,
        placeholderMsgId: "contextManager.searchPlaceholder",
        typeAhead: false,
        searchText: "",
        searchOptions: {
            params: {
                start: 0,
                limit: 12
            }
        },
        resources: [],
        colProps: {
            xs: 12,
            sm: 6,
            lg: 3,
            md: 4,
            className: 'ms-map-card-col'
        },
        fluid: true,
        editDataEnabled: true,
        onSearch: () => {},
        onSearchReset: () => {},
        onSearchTextChange: () => {},
        onEditData: () => {}
    };

    render() {
        return (<ContextGrid
            resources={this.props.resources}
            fluid={this.props.fluid}
            title={this.props.title}
            colProps={this.props.colProps}
            viewerUrl={(context) => this.context.router.history.push(`/context/${context.name}`)}
            getShareUrl={(context) => `context/${context.name}`}
            editDataEnabled={this.props.editDataEnabled}
            onEditData={this.props.onEditData}
            nameFieldFilter={name => name.replace(/[^a-zA-Z0-9\-_]/, '')}
            cardTooltips={{
                deleteResource: "resources.resource.deleteResource",
                editResource: "resources.resource.editResource",
                editResourceData: "contextManager.editContextTooltip",
                shareResource: "share.title",
                addToFeatured: "resources.resource.addToFeatured",
                showDetails: "resources.resource.showDetails",
                removeFromFeatured: "resources.resource.removeFromFeatured"
            }}
            bottom={<PaginationToolbar/>} />
        );
    }
}

const contextsPluginSelector = createSelector([
    mapTypeSelector,
    searchTextSelector,
    searchOptionsSelector,
    resultsSelector,
    isLoadingSelector,
    isFeaturedMapsEnabled,
    userRoleSelector,
    versionSelector
], (mapType, searchText, searchOptions, resources = [], loading, featuredEnabled, role, version) => ({
    mapType,
    searchText,
    version,
    resources: resources.map(resource => ({...resource, featuredEnabled: featuredEnabled && role === 'ADMIN'})),
    loading
}));

const ContextsPlugin = compose(
    connect(contextsPluginSelector, {
        loadMaps
    }),
    emptyState(
        ({resources = [], loading}) => !loading && resources.length === 0,
        ({showCreateButton = false}) => ({
            glyph: "wrench",
            title: <Message msgId="resources.contexts.noContextAvailable" />,
            content: <EmptyMaps showCreateButton={showCreateButton} />
        })
    )
)(Contexts);

/**
 * Plugin for context resources browsing.
 * Can be rendered inside {@link #plugins.ContentTabs|ContentTabs} plugin
 * @name Maps
 * @memberof plugins
 * @class
 * @prop {boolean} cfg.showCreateButton default true. Flag to show/hide the button "create a new one" when there is no dashboard yet.
 */

export default createPlugin('Contexts', {
    component: connect(contextsPluginSelector, {
        onSearch: searchContexts,
        onSearchReset: searchReset,
        onSearchTextChange: searchTextChanged,
        onEditData: editContext
    })(ContextsPlugin),
    containers: {
        ContentTabs: {
            name: 'contexts',
            key: 'contexts',
            TitleComponent:
                connect(contextsCountSelector)(({ count = "" }) => <Message msgId="resources.contexts.title" msgParams={{ count: count + "" }} />),
            position: 4,
            tool: true,
            priority: 1
        }
    },
    reducers: {
        contextmanager
    },
    epics: {
        ...contextManagerEpics,
        ...contextsEpics
    }
});
