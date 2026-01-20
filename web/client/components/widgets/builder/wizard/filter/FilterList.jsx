/*
 * Copyright 2025, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
import React from 'react';
import PropTypes from 'prop-types';
import FilterView from '../../../../../plugins/widgetbuilder/FilterView';

const FilterList = ({
    filters = [],
    componentMap = {},
    selections = {},
    getSelectionHandler = () => () => {},
    selectedFilterId
}) => {
    if (filters.length === 0) {
        return (
            <div className="ms-filter-list-empty">
                No saved filters. Create a new filter to get started.
            </div>
        );
    }

    // Check if required parameters are missing
    const checkMissingParameters = (filter) => {
        const filterData = filter?.data || {};
        const dataSource = filterData.dataSource;
        const hasLayer = !!filterData.layer;

        // For features source, we need both layer and valueAttribute
        if (dataSource === 'features') {
            const hasValueAttribute = !!filterData.valueAttribute;
            return !hasLayer || !hasValueAttribute;
        }

        // For userDefined source, we only need layer
        if (dataSource === 'userDefined') {
            return !hasLayer;
        }

        // If no dataSource is selected yet, consider it as missing parameters
        return !dataSource || !hasLayer;
    };

    return (
        <div className="ms-filter-list">
            <div className="ms-filter-list-items">
                {/* For now selected filter is displayed in the list */}
                {filters.filter(filter => filter.id === selectedFilterId).map((filter) => {
                    const missingParameters = checkMissingParameters(filter);
                    return (
                        <div
                            key={filter.id}
                            className="ms-filter-list-item"
                        >

                            <FilterView
                                filterData={filter}
                                componentMap={componentMap}
                                selections={selections[filter.id] || []}
                                onSelectionChange={getSelectionHandler(filter.id)}
                                missingParameters={missingParameters}
                            />
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

FilterList.propTypes = {
    filters: PropTypes.arrayOf(PropTypes.shape({
        id: PropTypes.string,
        name: PropTypes.string,
        data: PropTypes.object
    })),
    componentMap: PropTypes.object,
    selections: PropTypes.object,
    getSelectionHandler: PropTypes.func
};

export default FilterList;
