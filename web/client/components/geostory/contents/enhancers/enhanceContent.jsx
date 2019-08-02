/*
 * Copyright 2019, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { compose, nest } from "recompose";
import visibilityHandler from './enhancers/visibilityHandler';
import ContentWrapper from './ContentWrapper';

// wrap enhancer
const wrap = (...outerComponents) => wrappedComponent => nest(...outerComponents, wrappedComponent);

/**
 * Add basic enhancers valid for all the contents:
 * @param options
 */
export default ({visibilityEnhancerOptions}) => compose(
    visibilityHandler(visibilityEnhancerOptions),
    wrap(ContentWrapper)
);
