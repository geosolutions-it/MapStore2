/*
 * Copyright 2018, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
import handleResourceData from './handleResourceData';
import handlePermission from './handlePermission';
import handleErrors from './handleErrors';
import handleDetailsDownload from './handleDetailsDownload';

import { compose, branch, renderNothing } from 'recompose';

const handleModal = compose(
    handleResourceData,
    handlePermission(),
    handleErrors
);

export default compose(
    branch(
        ({ show }) => !show,
        renderNothing
    ),
    branch(
        ({ isNewResource }) => !isNewResource,
        compose(
            handleDetailsDownload,
            branch(
                ({ resource }) => resource && resource.id,
                handleModal
            )
        ),
        handleModal
    )
);
