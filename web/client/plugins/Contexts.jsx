/*
* Copyright 2022, GeoSolutions Sas.
* All rights reserved.
*
* This source code is licensed under the BSD-style license found in the
* LICENSE file in the root directory of this source tree.
*/

import React, {useEffect} from 'react';
import PropTypes from 'prop-types';
import {connect} from 'react-redux';
import { compose } from 'recompose';
import {createSelector} from 'reselect';

import Message from "../components/I18N/Message";

import {createPlugin} from '../utils/PluginsUtils';
import { userRoleSelector } from '../selectors/security';
import { versionSelector } from '../selectors/version';
import {
    totalCountSelector,
    searchTextSelector,
    searchOptionsSelector,
    resultsSelector,
    isLoadingSelector,
    isAvailableSelector
} from '../selectors/contexts';
import PaginationToolbar from '../plugins/contexts/PaginationToolbar';
import ContextGrid from './contexts/ContextsGrid';

import { mapTypeSelector } from '../selectors/maptype';
import { isFeaturedMapsEnabled } from '../selectors/featuredmaps';
import emptyState from '../components/misc/enhancers/emptyState';
import { loadMaps } from '../actions/maps';
import { setContextsAvailable } from '../actions/contexts';

import * as contextsEpics from '../epics/contexts';
import maps from '../reducers/maps';
import contexts from '../reducers/contexts';
import {CONTEXT_DEFAULT_SHARE_OPTIONS} from "../utils/ShareUtils";


const contextsCountSelector = createSelector(
    totalCountSelector,
    isAvailableSelector,
    (count, available) => ({ count, available })
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
        onMount: PropTypes.func,
        onUnmount: PropTypes.func,
        resources: PropTypes.array,
        colProps: PropTypes.object,
        fluid: PropTypes.bool,
        title: PropTypes.string,
        shareOptions: PropTypes.object,
        shareToolEnabled: PropTypes.bool,
        editDataEnabled: PropTypes.bool,
        emptyView: PropTypes.object
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
        title: <h3><Message msgId="resources.contexts.titleNoCount" /></h3>,
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
        shareOptions: CONTEXT_DEFAULT_SHARE_OPTIONS,
        shareToolEnabled: true,
        emptyView: {},
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
            shareToolEnabled={this.props.shareToolEnabled}
            shareOptions={this.props.shareOptions}
            bottom={<PaginationToolbar/>} />
        );
    }
}

const TitleComponent = connect(contextsCountSelector, {
    setContextsAvailable
})(({
    setContextsAvailable: isMounted,
    count = "", available
}) => {
    useEffect(() => {
        !available && isMounted(true);
    }, []);
    return <Message msgId="resources.contexts.title" msgParams={{ count: count + "" }} />;
});

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
        (emptyView) => ({
            glyph: "map-context",
            title: <Message msgId="resources.contexts.noContextAvailable" />,
            iconFit: true,
            imageStyle: {
                height: emptyView?.iconHeight ?? '200px'
            }
        })
    )
)(Contexts);

/**
 * Plugin for context resources browsing.
 * Can be rendered inside {@link #plugins.ContentTabs|ContentTabs} plugin
 * @name Contexts
 * @memberof plugins
 * @class
 * @prop {object} cfg.shareOptions configuration applied to share panel
 * @prop {boolean} cfg.shareToolEnabled default true. Flag to show/hide the "share" button on the item.
 * @prop {boolean} cfg.emptyView.iconHeight default "200px". Value to override default icon maximum height.
 */

export default createPlugin('Contexts', {
    component: connect(contextsPluginSelector)(ContextsPlugin),
    containers: {
        ContentTabs: {
            name: 'contexts',
            key: 'contexts',
            TitleComponent,
            position: 4,
            tool: true,
            priority: 1
        }
    },
    reducers: {
        maps,
        contexts
    },
    epics: {
        ...contextsEpics
    }
});
