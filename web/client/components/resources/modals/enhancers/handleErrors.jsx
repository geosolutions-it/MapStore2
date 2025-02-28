/*
 * Copyright 2018, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
import {compose, withProps, withStateHandlers} from 'recompose';
/**
 * @deprecated
 */
export default compose(
    withStateHandlers(
        () => ({}),
        {
            onError: () => (formErrors) => ({ formErrors })
        }
    ),
    withProps(
        ({ errors = [], formErrors = [] }) => ({
            errors: [...errors, ...formErrors]
        })
    )
);
