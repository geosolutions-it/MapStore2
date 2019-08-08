/*
 * Copyright 2019, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { compose, nest, withHandlers } from "recompose";
import visibilityHandler from './visibilityHandler';
import ContentWrapper from '../ContentWrapper';

// wrap enhancer
const wrap = (...outerComponents) => wrappedComponent => nest(...outerComponents, wrappedComponent);

/**
 * Add basic enhancers valid for all the contents of sections.
 * Adds visibilityHandler, wrapper and maps edit methods (add, update...) to local scope.
 * @param options visibilityEnhancerOptions: sets up visibility enhancer options for the content.
 */
export default ({visibilityEnhancerOptions}) => compose(
    // make maths for contents relative to their scope for edit methods
    // so inside the content you can simply call update('html', value) or add update('contents[{id: "some-sub-content-id"}])
    withHandlers({
        add: ({ add = () => { }, sectionId, id }) => (path, ...args) => add(`sections[{"id": "${sectionId}"}].contents[{"id": "${id}"}].` + path, ...args),
        update: ({ update = () => { }, sectionId, id }) => (path, ...args) => update(`sections[{"id": "${sectionId}"}].contents[{"id": "${id}"}].` + path, ...args)
    }),
    visibilityHandler(visibilityEnhancerOptions),
    wrap(ContentWrapper)
);
