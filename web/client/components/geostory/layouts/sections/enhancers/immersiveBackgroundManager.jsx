/*
 * Copyright 2019, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
import { compose, withState, withProps, withHandlers } from 'recompose';
import { findIndex, get } from "lodash";

const getContentIndex = (contents, id) => contents[findIndex(contents, { id }) || 0];


/**
 * Holds the current background as background property
 * by intercepting onVisibilityChange from components.
 */
export default compose(
    withState('backgroundId', "setBackgroundId", undefined),
    withHandlers({
        onVisibilityChange: ({ setBackgroundId = () => { } }) => ({ visible, id }) => visible && setBackgroundId(id)
    }),
    withProps(({ backgroundId, contents = [] }) => ({
        background: get(getContentIndex(contents, backgroundId) || 0, 'background') || {
            type: 'none'
        }
    }))
);
