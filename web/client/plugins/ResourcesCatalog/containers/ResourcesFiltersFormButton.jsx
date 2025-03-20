/*
 * Copyright 2024, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import React from 'react';
import castArray from 'lodash/castArray';
import Message from '../../../components/I18N/Message';
import tooltip from '../../../components/misc/enhancers/tooltip';
import Icon from '../components/Icon';
import Button from '../../../components/layout/Button';
import { connect } from 'react-redux';
import { createSelector } from 'reselect';
import { getShowFiltersForm } from '../selectors/resources';
import { setShowFiltersForm  } from '../actions/resources';

const ButtonWithTooltip = tooltip(Button);

const getQueryFilters = (query) => {
    const queryFilters = Object.keys(query).reduce((acc, key) => ['sort', 'page', 'd'].includes(key)
        ? acc
        : [...acc, ...castArray(query[key]).map((value) => ({ key, value }))], []);
    return queryFilters;
};

function ResourcesFiltersFormButton({
    resourcesGridId,
    query,
    compact,
    onClick
}) {
    const queryFilters = getQueryFilters(query);
    const totalFilters = queryFilters.length;
    return (
        <>
            {totalFilters > 0 ? <ButtonWithTooltip
                variant="primary"
                size="sm"
                onClick={() => onClick(resourcesGridId)}
                className="ms-notification-circle success"
                tooltip={<Message msgId="resourcesCatalog.filterApplied" msgParams={{ count: totalFilters }}/>}
            >
                {compact ? <Icon glyph="filter" /> : <Message msgId="resourcesCatalog.filter"/>}
            </ButtonWithTooltip> : <Button
                variant="primary"
                size="sm"
                onClick={() => onClick(resourcesGridId)}
            >
                {compact ? <Icon glyph="filter" /> : <Message msgId="resourcesCatalog.filter"/>}
            </Button>}
            {' '}
        </>
    );
}

const ConnectedResourcesFiltersFormButton = connect(
    createSelector([
        getShowFiltersForm
    ], (show) => ({
        show
    })),
    {
        onClick: setShowFiltersForm.bind(null, true)
    }
)(ResourcesFiltersFormButton);

export default ConnectedResourcesFiltersFormButton;
