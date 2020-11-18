/**
 * Copyright 2016, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
import { connect } from 'react-redux';

import { getUserGroups } from '../../../actions/usergroups';
import PaginationToolbarComp from '../../../components/misc/PaginationToolbar';
const PaginationToolbar = connect((state) => {
    if (!state.usergroups ) {
        return {};
    }
    let {start, limit, groups, status, totalCount, searchText} = state.usergroups;
    let page = 0;
    if (groups && totalCount) { // must be !==0 and exist to do the division
        page = Math.ceil(start / limit);
    }

    return {
        page: page,
        pageSize: limit,
        items: groups,
        total: totalCount,
        searchText,
        loading: status === "loading"
    };
}, {onSelect: getUserGroups}, (stateProps, dispatchProps) => {

    return {
        ...stateProps,
        onSelect: (pageNumber) => {
            let start = stateProps.pageSize * pageNumber;
            let limit = stateProps.pageSize;
            dispatchProps.onSelect(stateProps.searchText, {params: { start, limit}});
        }
    };
})(PaginationToolbarComp);
export default PaginationToolbar;
