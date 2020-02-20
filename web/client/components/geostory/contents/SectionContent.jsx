/*
 * Copyright 2019, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { compose, nest, setDisplayName, branch, renderComponent} from "recompose";
import visibilityHandler from './enhancers/visibilityHandler';
import ContentWrapper from './ContentWrapper';
import Content from './Content';
import Column from './Column';
import { ContentTypes, SectionTypes} from '../../../utils/GeoStoryUtils';

// wrap enhancer, TODO externalize
const wrap = (...outerComponents) => wrappedComponent => nest(...outerComponents, wrappedComponent);

// We have to try to reduce the number of times that an interceptor observer call the onVisibility change
// Less items better performance worst precision
const DEFAULT_THRESHOLD = [0, 0.25, 0.5, 0.75];

/**
 * Add basic enhancers valid for Section's Contents.
 * Adds visibilityHandler, wrapper and maps edit methods (add, update...) to local scope.
 */
export default compose(
    // make maths for contents relative to their scope for edit methods
    // so inside the content you can simply call update('html', value) or add update('contents[{id: "some-sub-content-id"}])
    // Add the intersection-observer only to immersive section columns
    branch(
        ({type, sectionType}) => sectionType === SectionTypes.IMMERSIVE && type === ContentTypes.COLUMN,
        visibilityHandler({ threshold: DEFAULT_THRESHOLD})
    ),
    wrap(ContentWrapper),
    setDisplayName("SectionContent"),
    branch(
        ({type}) => type === ContentTypes.COLUMN,
        renderComponent(Column)
    )
)(Content);
