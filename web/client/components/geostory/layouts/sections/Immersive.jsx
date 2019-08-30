/*
 * Copyright 2019, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
import React from "react";
import SectionContents from '../../contents/SectionContents';
import immersiveBackgroundManager from "./enhancers/immersiveBackgroundManager";
import Background from './Background';

import AddBar from '../../common/AddBar';
import { SectionTypes, ContentTypes, Modes, MediaTypes } from '../../../../utils/GeoStoryUtils';
/**
 * Paragraph Section Type.
 * Paragraph is a page block that expands for all it's height
 */
const Immersive = ({
    add = () => {},
    editMedia = () => {},
    onVisibilityChange = () => { },
    update = () => {},
    updateBackground = () => {},
    id,
    background = {},
    path,
    contents = [],
    mode,
    viewWidth,
    viewHeight
}) => (
    <section
        className="ms-section ms-section-immersive">
        <Background
            { ...background }
            mode={mode}

            tools={{
                [MediaTypes.IMAGE]: ['editMedia', 'fit', 'size', 'align']
            }}
            // selector used by sticky polyfill to detect scroll events
            scrollContainerSelector="#ms-sections-container"
            add={add}
            editMedia={editMedia}
            path={path}
            update={updateBackground}
            sectionId={id}
            backgroundId={background.id}
            key={background.id}
            width={viewWidth}
            height={viewHeight}/>
         <SectionContents
            className="ms-section-contents"
            contents={contents}
            mode={mode}
            add={add}
            update={update}
            sectionId={id}
            contentProps={{
                onVisibilityChange,
                contentWrapperStyle: { minHeight: viewHeight }
            }}
        />
        {mode === Modes.EDIT && <AddBar
            containerWidth={viewWidth}
            containerHeight={viewHeight}
            buttons={[{
                glyph: 'font',
                tooltipId: 'geostory.addTitleSection',
                onClick: () => {
                    add('sections', id, SectionTypes.TITLE);
                }
            },
            {
                glyph: 'sheet',
                tooltipId: 'geostory.addParagraphSection',
                onClick: () => {
                    add('sections', id, SectionTypes.PARAGRAPH);
                }
            },
            {
                glyph: 'book',
                tooltipId: 'geostory.addImmersiveContent',
                onClick: () => {
                    add(`sections[{"id": "${id}"}].contents`, undefined, ContentTypes.COLUMN); // position undefined means append
                }
            }]}/>}
    </section>
);

export default immersiveBackgroundManager(Immersive);
