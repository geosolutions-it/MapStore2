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

/**
 * Advanced settings form for GeoNode catalog services.
 *
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

    return (
        <CommonAdvancedSettings service={service} onChangeServiceProperty={onChangeServiceProperty} {...props}>
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
