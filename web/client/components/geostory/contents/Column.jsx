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
import { ContentTypes, MediaTypes } from '../../../utils/GeoStoryUtils';

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
export default ({
    viewWidth,
    viewHeight,
    contents = [],
    mode,
    add = () => {},
    editMedia = () => {},
    update = () => {},
    remove = () => {}
}) => (
    <Contents
        className="ms-column-contents"
        ContentComponent={ColumnContent}
        contents={contents}
        mode={mode}
        add={add}
        editMedia={editMedia}
        update={update}
        remove={remove}
        viewWidth={viewWidth}
        viewHeight={viewHeight}
        tools={{
            [ContentTypes.TEXT]: ['remove'],
            [MediaTypes.IMAGE]: ['editMedia', 'size', 'align', 'remove'],
            [MediaTypes.MAP]: ['editMedia', 'editMap', 'size', 'align', 'remove'],
            [MediaTypes.VIDEO]: ['editMedia', 'remove'] // TODO change this list for video
        }}
        addButtons={[{
            glyph: 'sheet',
            tooltipId: 'geostory.addTextContent',
            template: ContentTypes.TEXT
        },
        {
            glyph: 'picture',
            tooltipId: 'geostory.addMediaContent',
            template: ContentTypes.MEDIA
        }]}
    />
);
