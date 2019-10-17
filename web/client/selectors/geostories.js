/*
 * Copyright 2019, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

module.exports = {
    searchTextSelector: state => state && state.geostories && state.geostories.searchText,
    searchParamsSelector: state => state && state.geostories && state.geostories.options && state.geostories.options.params,
    resultsSelector: state => state && state.geostories && state.geostories.results,
    totalCountSelector: state => state && state.geostories && state.geostories.totalCount,
    isLoadingSelector: state => state && state.geostories && state.geostories.loading,
    areGeostoriesAvailable: state => state && state.geostories && state.geostories.available,
    isEditDialogOpen: state => state && state.geostories && state.geostories.showModal && state.geostories.showModal.edit
};
