/*
 * Copyright 2020, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { compose, withState, withHandlers } from 'recompose';

export default compose(
    withState('showPreview', 'setShowPreview', false),
    withHandlers({
        onShowPreview: ({ setShowPreview = () => {} }) => () => {
            setShowPreview(true);
        },
        onHidePreview: ({ setShowPreview = () => {} }) => () => {
            setShowPreview(false);
        }
    })
);
