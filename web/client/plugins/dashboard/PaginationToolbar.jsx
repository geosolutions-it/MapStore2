/*
 * Copyright 2018, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */


const { connect } = require('react-redux');
const { searchDashboards } = require('../../actions/dashboards');
const { withHandlers, renameProp, compose } = require('recompose');
const { searchTextSelector, resultsSelector, searchParamsSelector, totalCountSelector, isLoadingSelector } = require('../../selectors/dashboards');
const { createSelector } = require('reselect');
const PaginationToolbar = compose(
    connect(
        createSelector(
            searchTextSelector,
            searchParamsSelector,
            resultsSelector,
            totalCountSelector,
            isLoadingSelector,
            () => false, // TODO: loading
            (searchText, { start = 0, limit = 12 } = {}, results, totalCount, loading) => {
                const total = Math.min(totalCount || 0, limit || 0);
                const page = results && total && Math.ceil(start / total) || 0;
                return {
                    page: page,
                    pageSize: limit,
                    items: results,
                    total: totalCount,
                    searchText,
                    loading
                };
            }
        ),
        {
            searchDashboards
        }
    ),
    renameProp('searchDashboards', 'loadPage'),
    withHandlers({
        onSelect: ({ loadPage = () => { }, searchText, pageSize }) => (pageNumber) => {
            let start = pageSize * pageNumber;
            let limit = pageSize;
            loadPage(searchText, { start, limit });
        }
    })
)(require('../../components/misc/PaginationToolbar'));
module.exports = PaginationToolbar;
