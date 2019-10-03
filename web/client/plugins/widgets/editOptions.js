/*
 * Copyright 2018, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
const {compose} = require('recompose');
const { connect } = require('react-redux');
const {createSelector} = require('reselect');
const { mapInfoSelector, mapIdSelector } = require('../../selectors/map');
const { userSelector } = require('../../selectors/security');


const accessRuleParser = require('../../components/misc/enhancers/security/accessRuleParser');

/*
 * Transforms the rules into the real flags.
 * handle tools options and editing options
 */
module.exports = (...args) => compose(
    connect(
        createSelector(
            mapIdSelector,
            mapInfoSelector,
            userSelector,
            (mapId, mapInfo, user) => ({
                accessInfo: { mapId, mapInfo, user}
            })
        )
    ),
    accessRuleParser(...args)
);
