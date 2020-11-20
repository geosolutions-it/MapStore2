/*
 * Copyright 2018, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
import { compose } from 'recompose';

import { connect } from 'react-redux';
import { createSelector } from 'reselect';
import { mapInfoSelector, mapIdSelector } from '../../selectors/map';
import { userSelector } from '../../selectors/security';
import accessRuleParser from '../../components/misc/enhancers/security/accessRuleParser';

/*
 * Transforms the rules into the real flags.
 * handle tools options and editing options
 */
export default (...args) => compose(
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
