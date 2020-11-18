/**
* Copyright 2018, GeoSolutions Sas.
* All rights reserved.
*
* This source code is licensed under the BSD-style license found in the
* LICENSE file in the root directory of this source tree.
*/
import { compose, withStateHandlers, defaultProps } from 'recompose';

import withLocal from '../../../misc/enhancers/localizedProps';

export default compose(
    defaultProps({
        filterPlaceholder: "rulesmanager.placeholders.filter"
    }),
    withStateHandlers(({}
    ) => ({}),
    {
        onFilter: () => (stylesFilter) => ({
            stylesFilter
        })

    }),
    withLocal("filterPlaceholder")
);
