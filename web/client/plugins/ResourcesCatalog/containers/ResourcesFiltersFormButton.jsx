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
import Button from '../../../components/layout/Button';
import { connect } from 'react-redux';
import { createSelector } from 'reselect';
import { getShowFiltersForm } from '../selectors/resources';
import { setShowFiltersForm  } from '../actions/resources';

const ButtonWithTooltip = tooltip(Button);
const DefaultButton = ({ labelId, glyph, ...props }) => <ButtonWithTooltip {...props}><Message msgId={labelId}/></ButtonWithTooltip>;

const getQueryFilters = (query) => {
    const queryFilters = Object.keys(query).reduce((acc, key) => ['sort', 'page', 'd'].includes(key)
        ? acc
        : [...acc, ...castArray(query[key]).map((value) => ({ key, value }))], []);
    return queryFilters;
};

function ResourcesFiltersFormButton({
    show,
    resourcesGridId,
    query,
    onClick,
    itemComponent
}) {
    const queryFilters = getQueryFilters(query);
    const totalFilters = queryFilters.length;
    const className = !show && totalFilters > 0 ? 'ms-notification-circle success' : undefined;
    const ItemComponent = itemComponent || DefaultButton;
    return (
        <ItemComponent
            variant={show ? "success" : !itemComponent ? 'primary' : undefined}
            size="sm"
            onClick={() => onClick(!show, resourcesGridId)}
            className={className}
            glyph="filter"
            labelId={"resourcesCatalog.filter"}
            tooltipId={totalFilters > 0
                ? "resourcesCatalog.filterApplied"
                : undefined}
        />
    );
}

const ConnectedResourcesFiltersFormButton = connect(
    createSelector([
        getShowFiltersForm
    ], (show) => ({
        show
    })),
    {
        onClick: setShowFiltersForm
    }
)(ResourcesFiltersFormButton);

export default ConnectedResourcesFiltersFormButton;
