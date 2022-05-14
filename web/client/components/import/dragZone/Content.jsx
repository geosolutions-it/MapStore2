/*
 * Copyright 2018, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
import { compose, branch, renderComponent } from 'recompose';

import LoadingContent from './LoadingContent';
import ErrorContent from './ErrorContent';
import NormalContent from './NormalContent';

export default compose(
    branch(
        ({loading}) => loading,
        renderComponent(LoadingContent)
    ),
    branch(
        ({error}) => error,
        renderComponent(ErrorContent)
    )
)(NormalContent);
