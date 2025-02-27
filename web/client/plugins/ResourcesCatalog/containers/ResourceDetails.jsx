/*
 * Copyright 2024, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import React, { useRef } from 'react';
import { Alert } from 'react-bootstrap';
import useRequestResource from '../hooks/useRequestResource';
import DetailsInfo from '../components/DetailsInfo';
import ButtonMS from '../../../components/layout/Button';
import Icon from '../components/Icon';
import { getResourceTypesInfo, getResourceId } from '../utils/ResourcesUtils';
import DetailsHeader from '../components/DetailsHeader';
import { isEmpty, isArray, isObject, get } from 'lodash';
import useParsePluginConfigExpressions from '../hooks/useParsePluginConfigExpressions';
import { hashLocationToHref } from '../utils/ResourcesFiltersUtils';
import url from 'url';
import FlexBox from '../../../components/layout/FlexBox';
import Text from '../../../components/layout/Text';
import Spinner from '../../../components/layout/Spinner';
import Message from '../../../components/I18N/Message';
import tooltip from '../../../components/misc/enhancers/tooltip';

const Button = tooltip(ButtonMS);

const replaceResourcePaths = (value, resource, facets) => {
    if (isArray(value)) {
        return value.map(val => replaceResourcePaths(val, resource, facets));
    }
    if (isObject(value)) {
        if (value.path || value.facet) {
            const facet = facets.find(fc => fc.id === value.facet);
            return {
                ...facet,
                ...value,
                ...(value.path && { value: get(resource, value.path) })
            };
        }
        return Object.keys(value).reduce((acc, key) => ({
            ...acc,
            [key]: replaceResourcePaths(value[key], resource, facets)
        }), {});
    }
    return value;
};

function ResourceDetails({
    user,
    resourcesGridId,
    resource: resourceProp,
    onSelect,
    onChange,
    pendingChanges,
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
    enableFilters
}) {

    const parsedConfig = useParsePluginConfigExpressions(monitoredState, { tabs });

    const {
        resource,
        loading,
        updating,
        update: handleUpdateResource
    } = useRequestResource({
        resourceId: getResourceId(resourceProp),
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

    function handleOnChange(options) {
        onChange(options, resourcesGridId);
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
                        {!isSpecificResourceType && editing ? <Button
                            tooltipId="resourcesCatalog.apply"
                            className={isEmpty(pendingChanges?.changes) ? undefined : 'ms-notification-circle warning'}
                            disabled={isEmpty(pendingChanges?.changes)}
                            onClick={() => handleUpdateResource(pendingChanges.saveResource)}
                        >
                            <Icon glyph="floppy-disk" type="glyphicon" />
                        </Button> : null}
                        {canEditResource ? <Button
                            tooltipId="resourcesCatalog.editResourceProperties"
                            square
                            variant={editing ? 'success' : undefined}
                            onClick={() => onToggleEditing()}
                        >
                            <Icon glyph="edit" type="glyphicon" />
                        </Button> : null}
                    </FlexBox>
                }
                loading={loading}
                getResourceTypesInfo={getResourceTypesInfo}
                onClose={() => onClose()}
                onChangeThumbnail={(thumbnail) => handleOnChange({ attributes: { thumbnail } })}
            />
            {error ? <Alert className="_margin-md _padding-sm" bsStyle="danger">
                <Message msgId={`resourcesCatalog.resourceError.${error}`}/>
            </Alert> : null}
            {!loading ? <DetailsInfo
                className="_padding-lr-md"
                key={getResourceId(resource)}
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
            /> : null}
            {(updating || loading) ? <FlexBox centerChildren classNames={['_absolute', '_fill', '_overlay', '_corner-tl']}>
                <Text fontSize="xxl">
                    <Spinner />
                </Text>
            </FlexBox> : null}
        </div>
    );
}

export default ResourceDetails;
