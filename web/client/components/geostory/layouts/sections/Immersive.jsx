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
import { SectionTypes, ContentTypes } from '../../../../utils/GeoStoryUtils';
/**
 * Paragraph Section Type.
 * Paragraph is a page block that expands for all it's height
 */
const Immersive = ({ id, contents = [], mode, background = {}, onVisibilityChange = () => { }, updateBackground = () => {}, viewWidth, viewHeight, add = () => {}, update = () => {} }) => (
    <section
        className="ms-section ms-section-immersive">
        <Background
            { ...background }
            // selector used by sticky polyfill to detect scroll events
            scrollContainerSelector="#ms-sections-container"
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
                contentWrapperStyle: { minHeight: viewHeight }
            }}
        />
        <AddBar
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
                tooltip: 'geostory.addImmersiveContent',
                onClick: () => {
                    add(`sections[{"id": "${id}"}].contents`, undefined, ContentTypes.COLUMN); // position undefined means append
                }
            }]}/>
    </section>
);

export default immersiveBackgroundManager(Immersive);
