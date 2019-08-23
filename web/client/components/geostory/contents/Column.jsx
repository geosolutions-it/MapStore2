/*
 * Copyright 2019, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
import React from "react";
import ContentBase from './Content';
import Contents from './Contents';
import ContentWrapper from './ContentWrapper';
import { ContentTypes } from '../../../utils/GeoStoryUtils';

import { nest, compose, setDisplayName } from "recompose";
const wrap = (...outerComponents) => wrappedComponent => nest(...outerComponents, wrappedComponent);
const ColumnContent = compose(
    wrap(ContentWrapper),
    setDisplayName("ColumnContent")
)(ContentBase);
/**
 * Column content type.
 * Column is a like a Paragraph section, but as content.
 * has (sub) contents to render like a page.
 */
export default ({ id, contents = [], mode, add = () => {}, update= () => {} }) => (

        <Contents
            className="ms-column-contents"
        ContentComponent={ColumnContent}
            contents={contents}
            mode={mode}
            add={add}
            update={update}
            addButtons={[{
                glyph: 'sheet',
                tooltipId: 'geostory.addTextContent',
                template: ContentTypes.TEXT
            }, {
                    glyph: 'picture',
                    tooltipId: 'geostory.addTextContent',
                    template: ContentTypes.MEDIA
            }]}
            />
);
