/*
 * Copyright 2026, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
import React from 'react';
import { isNil } from 'lodash';
import { FormGroup, ControlLabel } from 'react-bootstrap';
import RS from 'react-select';

import localizedProps from '../../../misc/enhancers/localizedProps';
import CommonAdvancedSettings from './CommonAdvancedSettings';
import Message from '../../../I18N/Message';
import { getGeoNodeDefaultTagFilterType } from '../../../../api/catalog/GeoNode';

const Select = localizedProps('noResultsText')(RS);

const TAG_FILTER_TYPE_OPTIONS = [
    { value: 'category', label: <Message msgId="catalog.tagFilterType.category" /> },
    { value: 'keyword', label: <Message msgId="catalog.tagFilterType.keyword" /> }
];

const RESOURCE_TYPE_OPTIONS = [
    { value: 'dataset', label: <Message msgId="catalog.resourceTypes.dataset" /> },
    { value: 'document', label: <Message msgId="catalog.resourceTypes.document" /> },
    { value: 'map', label: <Message msgId="catalog.resourceTypes.map" /> }
];

/**
 * Advanced settings form for GeoNode catalog services.
 *
 * - resourceTypes: the GeoNode resource types included in the catalog search. At least one
 *   type must remain selected. Defaults to ['dataset'] when not set.
 * - tagFilterType: Selects whether the card tags (used for filtering and display) come from
 *   'category' (default) or from 'keyword'. The default can be overridden via
 *   `initialState.defaultState.catalog.default.tagFilterType` in localConfig.
 */
export default ({
    service,
    onChangeServiceProperty = () => {},
    ...props
}) => {
    const globalDefault = getGeoNodeDefaultTagFilterType();
    const currentValue = !isNil(service?.tagFilterType) ? service.tagFilterType : globalDefault;
    const selectedOption = TAG_FILTER_TYPE_OPTIONS.find(o => o.value === currentValue) || TAG_FILTER_TYPE_OPTIONS[0];

    const currentResourceTypes = service?.resourceTypes?.length ? service.resourceTypes : ['dataset'];
    const selectedResourceTypes = RESOURCE_TYPE_OPTIONS.filter(o => currentResourceTypes.includes(o.value));

    return (
        <CommonAdvancedSettings service={service} onChangeServiceProperty={onChangeServiceProperty} {...props}>
            <FormGroup controlId="geonode-resource-types">
                <ControlLabel>
                    <Message msgId="catalog.resourceTypes.label" />
                </ControlLabel>
                <Select
                    multi
                    noResultsText="catalog.noResultsText"
                    clearable={false}
                    value={selectedResourceTypes}
                    options={RESOURCE_TYPE_OPTIONS}
                    onChange={(options) => {
                        const values = (options || []).map(option => option.value);
                        // keep at least one resource type selected
                        if (values.length === 0) {
                            return;
                        }
                        onChangeServiceProperty('resourceTypes', values);
                    }}
                />
            </FormGroup>
            <FormGroup controlId="geonode-tag-filter-type">
                <ControlLabel>
                    <Message msgId="catalog.tagFilterType.label" />
                </ControlLabel>
                <Select
                    noResultsText="catalog.noResultsText"
                    clearable={false}
                    value={selectedOption}
                    options={TAG_FILTER_TYPE_OPTIONS}
                    onChange={(option) => onChangeServiceProperty('tagFilterType', option?.value ?? globalDefault)}
                />
            </FormGroup>
        </CommonAdvancedSettings>
    );
};
