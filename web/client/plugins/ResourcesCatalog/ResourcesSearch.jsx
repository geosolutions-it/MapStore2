/*
 * Copyright 2025, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import React from 'react';
import { connect } from "react-redux";
import PropTypes from 'prop-types';
import url from 'url';
import isEmpty from 'lodash/isEmpty';
import { Glyphicon } from 'react-bootstrap';
import { createStructuredSelector } from 'reselect';

import { createPlugin } from "../../utils/PluginsUtils";
import FlexBox from '../../components/layout/FlexBox';
import InputControl from './components/InputControl';
import usePluginItems from '../../hooks/usePluginItems';
import { getRouterLocation } from './selectors/resources';
import { searchResources } from './actions/resources';
import tooltip from '../../components/misc/enhancers/tooltip';
import Button from '../../components/layout/Button';
import resourcesReducer from './reducers/resources';

const ButtonWithTooltip = tooltip(Button);

function ResourcesSearchTool({
    glyph,
    className,
    onClick,
    tooltipId,
    labelId,
    variant
}) {
    return (
        <ButtonWithTooltip
            square
            variant={variant}
            borderTransparent
            className={className}
            onClick={onClick}
            tooltipId={labelId || tooltipId}
        >
            <Glyphicon glyph={glyph} />
        </ButtonWithTooltip>
    );
}

/**
 * This plugin shows the search bar for resources grid
 * @memberof plugins
 * @class
 * @name ResourcesSearch
 * @prop {object[]} items this property contains the items injected from the other plugins,
 * using the `containers` option in the plugin that want to inject new menu items.
 * ```javascript
 * const MyToolComponent = connect(selector, { onActivateTool })(({
 *  itemComponent, // default component that provides a consistent UI (see ResourcesSearchTool in ResourcesSearch plugin for props)
 *  query, // current search query
 *  onActivateTool, // example of a custom connected action
 * }) => {
 *  const ItemComponent = itemComponent;
 *  return (
 *      <ItemComponent
 *          glyph="heart"
 *          className="my-class-name"
 *          tooltipId="myTooltipMessageId"
 *          onClick={() => onActivateTool()}
 *      />
 *  );
 * });
 * createPlugin(
 *  'MyPlugin',
 *  {
 *      containers: {
 *          ResourcesSearch: {
 *              target: 'toolbar',
 *              Component: MyToolComponent
 *          },
 * // ...
 * ```
 */
function ResourcesSearch({
    items,
    location,
    onSearch,
    debounceTime
}, context) {
    const { loadedPlugins } = context;
    const configuredItems = usePluginItems({ items, loadedPlugins }, []);
    const toolbarItems = configuredItems.filter(({ target }) => target === 'toolbar');

    const { query = {} } = location?.search ? url.parse(location.search, true) : {};

    return (
        <div className="ms-resources-search">
            <FlexBox className="ms-resources-search-field" gap="xs" centerChildrenVertically>
                <Glyphicon glyph="search" />
                <InputControl
                    value={query?.q || ''}
                    onChange={(q) => onSearch({ params: { q } })}
                    debounceTime={debounceTime}
                    placeholder="maps.search"
                />
                {!isEmpty(query) ? <ResourcesSearchTool
                    glyph={'1-close'}
                    onClick={() => onSearch({ clear: true })}
                /> : null}
                {toolbarItems.map(({ name, Component }) => {
                    return (<Component key={name} query={query} itemComponent={ResourcesSearchTool}/>);
                })}
            </FlexBox>
        </div>
    );
}

ResourcesSearch.propTypes = {
    onSearch: PropTypes.func,
    location: PropTypes.object,
    items: PropTypes.array,
    debounceTime: PropTypes.number
};

ResourcesSearch.defaultProps = {
    items: [],
    debounceTime: 300
};

ResourcesSearch.contextTypes = {
    loadedPlugins: PropTypes.object
};

const ConnectedResourcesSearch = connect(
    createStructuredSelector({
        location: getRouterLocation
    }),
    {
        onSearch: searchResources
    }
)(ResourcesSearch);

export default createPlugin('ResourcesSearch', {
    component: ConnectedResourcesSearch,
    reducers: {
        resources: resourcesReducer
    }
});
