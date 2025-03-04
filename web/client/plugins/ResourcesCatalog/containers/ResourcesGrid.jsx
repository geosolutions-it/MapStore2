/*
 * Copyright 2024, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import React from 'react';
import { connect } from 'react-redux';
import url from 'url';
import { createStructuredSelector } from 'reselect';
import { isArray } from 'lodash';
import { withResizeDetector } from 'react-resize-detector';
import { userSelector } from '../../../selectors/security';
import {
    loadingResources,
    resetSearchResources,
    updateResources,
    updateResourcesMetadata
} from '../actions/resources';
import {
    getResourcesLoading,
    getResourcesError,
    getIsFirstRequest,
    getTotalResources,
    getMonitoredStateSelector,
    getRouterLocation,
    getCurrentPage,
    getSearch,
    getCurrentParams
} from '../selectors/resources';
import { push } from 'connected-react-router';
import useQueryResourcesByLocation from '../hooks/useQueryResourcesByLocation';
import useParsePluginConfigExpressions from '../hooks/useParsePluginConfigExpressions';
import useCardLayoutStyle from '../hooks/useCardLayoutStyle';
import useLocalStorage from '../hooks/useLocalStorage';
import ResourcesContainer from '../components/ResourcesContainer';
import Icon from '../components/Icon';
import Button from '../../../components/layout/Button';
import TargetSelectorPortal from '../components/TargetSelectorPortal';
import PaginationCustom from '../components/PaginationCustom';
import ResourcesMenu from '../components/ResourcesMenu';
import useResourcePanelWrapper from '../hooks/useResourcePanelWrapper';
import FlexBox from '../../../components/layout/FlexBox';

const defaultGetMainMessageId = ({ id, query, user, isFirstRequest, error, resources, loading }) => {
    const hasResources = resources?.length > 0;
    const hasFilter = Object.keys(query || {}).filter(key => key !== 'sort').length > 0;
    const isLoggedIn = !!user;
    const messageId = !hasResources && !isFirstRequest && !loading
        ? error && `resourcesCatalog.errorResourcePage`
            || hasFilter && `resourcesCatalog.noResultsWithFilter`
            || isLoggedIn && `resourcesCatalog.${id}Section.noContentYet`
            || `resourcesCatalog.${id}Section.noPublicContent`
        : undefined;
    return messageId;
};

function ResourcesGrid({
    id,
    location,
    user,
    totalResources,
    loading,
    defaultQuery,
    order = {},
    menuItems = [],
    pageSize = 12,
    panel,
    cardLayoutStyle: cardLayoutStyleProp = null,
    defaultCardLayoutStyle: defaultCardLayoutStyleProp = 'grid',
    selectedResource,
    configuredItems,
    targetSelector = '',
    monitoredState,
    headerNodeSelector = '#ms-brand-navbar',
    navbarNodeSelector = '',
    footerNodeSelector = '#ms-footer',
    width,
    height,
    error,
    onPush,
    setLoading,
    setResources,
    setResourcesMetadata,
    customFilters,
    resources,
    isFirstRequest,
    requestResources,
    titleId,
    queryPage,
    page: pageProp,
    theme = 'main',
    metadata: metadataProp,
    getMainMessageId = defaultGetMainMessageId,
    search,
    onResetSearch,
    hideWithNoResults,
    getResourceStatus,
    formatHref,
    getResourceTypesInfo,
    getResourceId,
    storedParams
}) {

    const { query } = url.parse(location.search, true);
    const _page = queryPage ? query.page : pageProp;

    const page = _page ? parseFloat(_page) : 1;

    const {
        search: onSearch
    } = useQueryResourcesByLocation({
        id,
        request: requestResources,
        location,
        onPush,
        setLoading,
        setResources,
        setResourcesMetadata,
        defaultQuery,
        pageSize,
        customFilters,
        user,
        queryPage,
        onReset: () => onResetSearch(id),
        search,
        storedParams
    });

    const {
        cardLayoutStyle,
        setCardLayoutStyle,
        hideCardLayoutButton
    } = useCardLayoutStyle({
        cardLayoutStyle: cardLayoutStyleProp,
        defaultCardLayoutStyle: defaultCardLayoutStyleProp
    });

    const {
        stickyTop,
        stickyBottom
    } = useResourcePanelWrapper({
        headerNodeSelector,
        navbarNodeSelector,
        footerNodeSelector,
        width,
        height,
        active: !panel
    });

    const parsedConfig =  useParsePluginConfigExpressions(monitoredState, {
        menuItems,
        order,
        metadata: metadataProp
    });

    const isValidItem = (target) => (item) => item.target === target && (!item?.cfg?.resourcesGridId || item?.cfg?.resourcesGridId === id);
    const cardOptions = configuredItems.filter(isValidItem('card-options'));
    const cardButtons = configuredItems.filter(isValidItem('card-buttons'));
    const menuItemsLeft = configuredItems.filter(isValidItem('left-menu'));
    const { Component: cardComponent } = configuredItems.find(isValidItem('card')) || {};
    function handleUpdate(newParams) {
        onSearch(newParams);
    }

    const [metadataColumns, setMetadataColumns] = useLocalStorage('metadataColumns', {});
    const columnsId = user?.name ? 'authenticated' : 'anonymous';
    const columns = metadataColumns?.[columnsId] || [];
    const metadata = isArray(parsedConfig.metadata) ? parsedConfig.metadata : parsedConfig.metadata[cardLayoutStyle];

    return (
        <TargetSelectorPortal targetSelector={targetSelector}>
            <div className={`ms-resources-grid${panel ? ' _panel' : ''}`} style={hideWithNoResults && !resources.length ? { display: 'none' } : { }}>
                <ResourcesContainer
                    id={id}
                    theme={theme}
                    resources={resources}
                    isFirstRequest={isFirstRequest}
                    loading={loading}
                    error={error}
                    cardLayoutStyle={cardLayoutStyle}
                    query={query}
                    columns={columns}
                    metadata={metadata}
                    header={
                        <ResourcesMenu
                            key={columnsId}
                            theme={theme}
                            titleId={titleId}
                            resourcesGridId={id}
                            menuItemsLeft={menuItemsLeft}
                            menuItems={parsedConfig.menuItems}
                            orderConfig={parsedConfig.order}
                            totalResources={totalResources}
                            loading={loading}
                            cardLayoutStyle={cardLayoutStyle}
                            setCardLayoutStyle={setCardLayoutStyle}
                            hideCardLayoutButton={hideCardLayoutButton}
                            style={{
                                position: 'sticky',
                                top: stickyTop
                            }}
                            query={query}
                            metadata={metadata}
                            columns={columns}
                            setColumns={(newColumns) =>
                                setMetadataColumns({
                                    ...metadataColumns,
                                    [columnsId]: newColumns
                                })
                            }
                            getResourceStatus={getResourceStatus}
                            formatHref={formatHref}
                            getResourceTypesInfo={getResourceTypesInfo}
                            getResourceId={getResourceId}
                        />
                    }
                    footer={
                        <FlexBox
                            classNames={[`ms-${theme}-colors`, '_padding-tb-sm']}
                            centerChildren
                            style={{
                                position: 'sticky',
                                bottom: stickyBottom
                            }}
                        >
                            {error
                                ? <Button variant="primary" href="#/"><Icon glyph="refresh" /></Button>
                                : (!loading || !!totalResources) && <PaginationCustom
                                    items={Math.ceil(totalResources / pageSize)}
                                    activePage={page}
                                    onSelect={(value) => {
                                        handleUpdate({
                                            page: value
                                        });
                                    }}
                                />}
                        </FlexBox>
                    }
                    user={user}
                    cardOptions={cardOptions}
                    cardButtons={cardButtons}
                    cardComponent={cardComponent}
                    isCardActive={res => getResourceId(res) === getResourceId(selectedResource)}
                    getMainMessageId={getMainMessageId}
                    getResourceStatus={getResourceStatus}
                    formatHref={formatHref}
                    getResourceTypesInfo={getResourceTypesInfo}
                    getResourceId={getResourceId}
                />
            </div>
        </TargetSelectorPortal>
    );
}

const ConnectedResourcesGrid = connect(
    createStructuredSelector({
        user: userSelector,
        totalResources: getTotalResources,
        loading: getResourcesLoading,
        location: getRouterLocation,
        monitoredState: getMonitoredStateSelector,
        error: getResourcesError,
        isFirstRequest: getIsFirstRequest,
        page: getCurrentPage,
        search: getSearch,
        storedParams: getCurrentParams
    }),
    {
        onPush: push,
        setLoading: loadingResources,
        setResources: updateResources,
        setResourcesMetadata: updateResourcesMetadata,
        onResetSearch: resetSearchResources
    }
)(withResizeDetector(ResourcesGrid));

export default ConnectedResourcesGrid;
