/*
 * Copyright 2024, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import React, { useRef } from 'react';
import url from 'url';
import PropTypes from 'prop-types';
import {isEmpty, isNull} from 'lodash';
import { Alert, Glyphicon } from 'react-bootstrap';

import useRequestResource from '../hooks/useRequestResource';
import DetailsInfo from '../components/DetailsInfo';
import ButtonMS from '../../../components/layout/Button';
import { isMenuItemSupportedSupported, replaceResourcePaths } from '../../../utils/ResourcesUtils';
import DetailsHeader from '../components/DetailsHeader';
import useParsePluginConfigExpressions from '../hooks/useParsePluginConfigExpressions';
import { hashLocationToHref } from '../../../utils/ResourcesFiltersUtils';
import FlexBox from '../../../components/layout/FlexBox';
import Text from '../../../components/layout/Text';
import Spinner from '../../../components/layout/Spinner';
import Message from '../../../components/I18N/Message';
import tooltip from '../../../components/misc/enhancers/tooltip';
import { computeSaveResource, THUMBNAIL_DATA_KEY } from '../../../utils/GeostoreUtils';

const Button = tooltip(ButtonMS);

function ResourceDetails({
    user,
    resourcesGridId,
    resource: resourceProp,
    onSelect,
    onChange,
    pendingChanges,
    resourceInfo,
    tabs = [],
    editing,
    setEditing,
    onToggleEditing,
    monitoredState,
    location,
    onSearch,
    error,
    setError,
    onClose,
    tabComponents,
    setRequest,
    updateRequest,
    facets,
    resourceType,
    enableFilters,
    onSelectTab,
    selectedTab,
    availableResourceTypes
}, context) {

    const parsedConfig = useParsePluginConfigExpressions(monitoredState, { tabs }, context?.plugins?.requires,
        {
            filterFunc: item => isMenuItemSupportedSupported(item, availableResourceTypes, user)
        });

    const {
        resource,
        loading,
        updating,
        update: handleUpdateResource
    } = useRequestResource({
        resourceId: resourceProp?.id,
        user,
        resource: resourceProp,
        setRequest,
        updateRequest,
        onSetSuccess: (data, isUpdate) => {
            onSelect(data, resourcesGridId);
            if (isUpdate) {
                onSearch({ refresh: true }, resourcesGridId);
                return;
            }
            return;
        },
        onUpdateStart: () => {
            setError(false);
        },
        onUpdateSuccess: () => {
            setEditing(false);
        },
        onUpdateError: (err) => {
            setError(`error${err.status || 'Default'}`);
        }
    });

    const { query } = url.parse(location.search, true);
    const updatedLocation = useRef();
    updatedLocation.current = location;
    function handleFormatHref(options) {
        return hashLocationToHref({
            location: updatedLocation.current,
            excludeQueryKeys: ['page'],
            ...options
        });
    }

    function handleOnChange(options, initialize) {
        onChange(options, initialize, resourcesGridId);
    }

    // resource details component can be used with the resources grid (resourceType equal to undefined)
    // or inside a specific viewer viewer
    const isSpecificResourceType = resourceType !== undefined;

    // canCopy is possible only inside a specific viewer
    const canEditResource = !!(resource?.canEdit
        || (isSpecificResourceType && resource?.canCopy));
    return (
        <div className="ms-details-panel">
            <DetailsHeader
                resource={resource || {}}
                editing={editing}
                tools={
                    <FlexBox centerChildrenVertically gap="sm">
                        {!isNull(user) && <>
                            {!isSpecificResourceType && editing ? <Button
                                tooltipId="resourcesCatalog.apply"
                                className={isEmpty(pendingChanges) ? undefined : 'ms-notification-circle warning'}
                                disabled={isEmpty(pendingChanges)}
                                onClick={() => handleUpdateResource(computeSaveResource(resourceInfo.initialResource, resourceInfo.resource, resourceInfo.data))}
                            >
                                {updating ? <Spinner /> : <Glyphicon glyph="floppy-disk" />}
                            </Button> : null}
                            {canEditResource ? <Button
                                tooltipId="resourcesCatalog.editResourceProperties"
                                square
                                variant={editing ? 'success' : undefined}
                                onClick={() => onToggleEditing()}
                            >
                                <Glyphicon glyph="edit" />
                            </Button> : null}
                        </>}
                    </FlexBox>
                }
                loading={loading}
                onClose={() => onClose()}
                onChangeThumbnail={(thumbnail) => handleOnChange({ [`attributes.${THUMBNAIL_DATA_KEY}`]: thumbnail })}
            />
            {error ? <Alert className="_margin-md _padding-sm" bsStyle="danger">
                <Message msgId={`resourcesCatalog.resourceError.${error}`}/>
            </Alert> : null}
            {!loading ? <DetailsInfo
                className="_padding-lr-md"
                key={resource?.id}
                tabs={replaceResourcePaths(parsedConfig.tabs, resource, facets)}
                editing={editing}
                tabComponents={tabComponents}
                loading={loading}
                query={query}
                formatHref={handleFormatHref}
                resourcesGridId={resourcesGridId}
                onChange={handleOnChange}
                resource={resource || {}}
                enableFilters={enableFilters}
                onSelectTab={onSelectTab}
                selectedTab={selectedTab}
            /> : null}
            {(updating || loading) ? <FlexBox centerChildren classNames={['_absolute', '_fill', '_overlay', '_corner-tl']}>
                <Text fontSize="xxl">
                    <Spinner />
                </Text>
            </FlexBox> : null}
        </div>
    );
}

ResourceDetails.contextTypes = {
    plugins: PropTypes.object
};

export default ResourceDetails;
