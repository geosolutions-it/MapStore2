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

const size = (pullRight) => ({
    id: 'size',
    filterOptions: ({ value }) => value !== 'full',
    pullRight
});

export default ({
    viewWidth,
    viewHeight,
    contents = [],
    mode,
    add = () => {},
    editMedia = () => {},
    editWebPage = () => {},
    update = () => {},
    remove = () => {},
    bubblingTextEditing = () => {},
    expandable,
    mediaViewer
}) => (
    <Contents
        className="ms-column-contents"
        ContentComponent={ColumnContent}
        contents={contents}
        mode={mode}
        add={add}
        editMedia={editMedia}
        editWebPage={editWebPage}
        update={update}
        remove={remove}
        viewWidth={viewWidth}
        viewHeight={viewHeight}
        bubblingTextEditing={bubblingTextEditing}
        contentProps={{
            expandable,
            mediaViewer
        }}
        tools={{
            [ContentTypes.TEXT]: ['remove'],
            [MediaTypes.IMAGE]: ['editMedia', size(), 'align', 'remove'],
            [MediaTypes.MAP]: ['editMedia', 'editMap', size(true), 'remove'],
            [MediaTypes.VIDEO]: ['editMedia', 'remove'], // TODO change this list for video
            [ContentTypes.WEBPAGE]: ['editURL', size(true), 'remove'],
            [MediaTypes.VIDEO]: ['editMedia', 'remove']
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
        }, {
            glyph: 'webpage',
            tooltipId: 'geostory.addWebPageContent',
            template: ContentTypes.WEBPAGE
        }]}
    />
);
