/*
 * Copyright 2024, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import React from 'react';
import { push } from 'connected-react-router';
import isArray from 'lodash/isArray';
import url from 'url';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { createStructuredSelector } from 'reselect';
import { withResizeDetector } from 'react-resize-detector';
import { Glyphicon } from 'react-bootstrap';

import { userSelector } from '../../../selectors/security';
import {
    getMonitoredStateSelector,
    getRouterLocation
} from '../selectors/resources';
import useQueryResourcesByLocation from '../hooks/useQueryResourcesByLocation';
import useParsePluginConfigExpressions from '../hooks/useParsePluginConfigExpressions';
import useCardLayoutStyle from '../hooks/useCardLayoutStyle';
import useLocalStorage from '../hooks/useLocalStorage';
import ResourcesContainer from '../components/ResourcesContainer';
import Button from '../../../components/layout/Button';
import TargetSelectorPortal from '../components/TargetSelectorPortal';
import PaginationCustom from '../components/PaginationCustom';
import ResourcesMenu from '../components/ResourcesMenu';
import useResourcePanelWrapper from '../hooks/useResourcePanelWrapper';
import FlexBox from '../../../components/layout/FlexBox';
import { isMenuItemSupportedSupported } from '../../../utils/ResourcesUtils';

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
    formatHref,
    storedParams,
    hideThumbnail,
    openInNewTab,
    resourcesFoundMsgId,
    availableResourceTypes
}, context) {

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
        monitoredState,
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


    const defaultTarget = openInNewTab ? '_blank' : undefined;
    const parsedConfig =  useParsePluginConfigExpressions(monitoredState, {
        menuItems,
        order,
        metadata: metadataProp
    }, context?.plugins?.requires,
    {
        filterFunc: item => isMenuItemSupportedSupported(item, availableResourceTypes, user)
    });

    const isValidItem = (target) => (item) => item.target === target && (!item?.cfg?.resourcesGridId || item?.cfg?.resourcesGridId === id);
    const cardOptions = configuredItems.filter(isValidItem('card-options')).sort((a, b) => a.position - b.position);
    const cardButtons = configuredItems.filter(isValidItem('card-buttons')).sort((a, b) => a.position - b.position);
    const menuItemsLeft = configuredItems.filter(isValidItem('left-menu')).sort((a, b) => a.position - b.position);
    const menuItemsRight = configuredItems.filter(isValidItem('right-menu')).sort((a, b) => a.position - b.position);
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
                    target={defaultTarget}
                    header={
                        <ResourcesMenu
                            key={columnsId}
                            theme={theme}
                            titleId={titleId}
                            resourcesGridId={id}
                            menuItemsLeft={menuItemsLeft}
                            menuItems={[
                                ...parsedConfig.menuItems,
                                ...menuItemsRight
                            ]}
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
                            formatHref={formatHref}
                            target={defaultTarget}
                            resourcesFoundMsgId={resourcesFoundMsgId}
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
                                ? <Button variant="primary" href="#/"><Glyphicon glyph="refresh" /></Button>
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
                    isCardActive={res => res?.id === selectedResource?.id}
                    getMainMessageId={getMainMessageId}
                    formatHref={formatHref}
                    hideThumbnail={hideThumbnail}
                />
            </div>
        </TargetSelectorPortal>
    );
}

ResourcesGrid.contextTypes = {
    plugins: PropTypes.object
};

const ConnectedResourcesGrid = connect(
    createStructuredSelector({
        user: userSelector,
        location: getRouterLocation,
        monitoredState: getMonitoredStateSelector
    }),
    {
        onPush: push
    }
)(withResizeDetector(ResourcesGrid));

export default ConnectedResourcesGrid;
