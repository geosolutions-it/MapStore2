/*
 * Copyright 2019, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { compose, nest, setDisplayName, branch, renderComponent, withStateHandlers } from "recompose";
import visibilityHandler from './enhancers/visibilityHandler';
import ContentWrapper from './ContentWrapper';
import Content from './Content';
import Column from './Column';
import { ContentTypes } from '../../../utils/GeoStoryUtils';

// wrap enhancer, TODO externalize
const wrap = (...outerComponents) => wrappedComponent => nest(...outerComponents, wrappedComponent);

const DEFAULT_THRESHOLD = Array.from(Array(11).keys()).map(v => v / 10); // [0, 0.1, 0.2 ... 0.9, 1]

/**
 * Add basic enhancers valid for Section's Contents.
 * Adds visibilityHandler, wrapper and maps edit methods (add, update...) to local scope.
 */
export default compose(
    // make maths for contents relative to their scope for edit methods
    // so inside the content you can simply call update('html', value) or add update('contents[{id: "some-sub-content-id"}])
    visibilityHandler({ threshold: DEFAULT_THRESHOLD}),
    withStateHandlers({textEditorActive: false}, {
        bubblingTextEditing: () => (editing) => {
            return  {textEditorActiveClass: editing ? 'ms-text-editor-active' : ''};
        }
    }),
    wrap(ContentWrapper),
    setDisplayName("SectionContent"),
    branch(
        ({type}) => type === ContentTypes.COLUMN,
        renderComponent(Column)
    )
)(Content);
