/*
 * Copyright 2019, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

const ON_TAB_SELECTED = 'CONTENT_TABS:ON_TAB_SELECTED';
const SET_TABS_HIDDEN = 'CONTENT_TABS:SET_TABS_HIDDEN';

/**
 * Select Tab
 * @memberof actions.contenttabs
 * @param {string} id  tab id
 *
 * @return {object} of type `ON_TAB_SELECTED` with tab id
 */

const onTabSelected = (id) => {
    return {
        type: ON_TAB_SELECTED,
        id
    };
};

const setTabsHidden = (tabs) => ({
    type: SET_TABS_HIDDEN,
    tabs
});

module.exports = {onTabSelected, ON_TAB_SELECTED, setTabsHidden, SET_TABS_HIDDEN};
