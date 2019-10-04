/*
 * Copyright 2019, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
import {
    compose,
    withState
} from 'recompose';
/**
 * holds the state of the text filter in the media editor
 */
const withFilter = compose(
    withState('filterText', "onFilter", null)
);

export default withFilter;
