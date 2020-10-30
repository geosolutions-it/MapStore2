/*
 * Copyright 2020, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
*/

export const getTotalMaxResults = (services = [], maxResults = 15) => {
    return services.reduce(function(total, current) {
        return total + (current?.options?.maxFeatures || maxResults);
    }, 0) || maxResults;
};


export const defaultSearchWrapper = ({
    searchText,
    selectedItems,
    searchOptions,
    maxResults,
    onSearch = () => {},
    onSearchReset = () => {}
}) => () => {
    const text = searchText;
    const totalResults = getTotalMaxResults(searchOptions?.services, maxResults);
    if ((text === undefined || text === "") && (!selectedItems || selectedItems.length === 0)) {
        onSearchReset();
    } else if (text !== undefined && text !== "") {
        onSearch(text, searchOptions, totalResults );
    }
};
