/*
 * Copyright 2018, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
import handleResourceData from './handleResourceData';
import handleDetails from './handleDetails';
import handlePermission from './handlePermission';
import handleErrors from './handleErrors';

import { compose, branch, renderNothing } from 'recompose';

export default compose(
    branch(
        ({ show, showReadOnlyDetailsSheet }) => !show && !showReadOnlyDetailsSheet,
        renderNothing
    ),
    handleResourceData,
    handleDetails,
    handlePermission(),
    handleErrors
);
