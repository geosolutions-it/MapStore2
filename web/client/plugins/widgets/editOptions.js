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
const { mapInfoSelector } = require('../../selectors/map');
const { userSelector } = require('../../selectors/security');


const accessRuleParser = require('../../components/misc/enhancers/security/accessRuleParser');

// handle tools options and editing options
module.exports = (...args) => compose(
        connect(
            createSelector(
                mapInfoSelector,
                userSelector,
                (mapInfo, user) => ({
                    accessInfo: { mapInfo, user}
                })
            )
        ),
        accessRuleParser(...args)
    );
