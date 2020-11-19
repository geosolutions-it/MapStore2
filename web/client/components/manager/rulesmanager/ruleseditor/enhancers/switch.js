/**
* Copyright 2018, GeoSolutions Sas.
* All rights reserved.
*
* This source code is licensed under the BSD-style license found in the
* LICENSE file in the root directory of this source tree.
*/

import {compose, withStateHandlers} from "recompose";

export default compose(
    withStateHandlers(({initExpanded}) => {
        return {
            expanded: !!initExpanded
        };
    },
    {
        onSwitch: (state, {reset}) => (expanded) => {
            if (!expanded) {
                reset();
            }
            return {
                expanded
            };
        }
    })
);
