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
import { SectionTypes, ContentTypes, MediaTypes, Modes, SectionTemplates } from '../../../../utils/GeoStoryUtils';
import pattern from './patterns/world.svg';

/**
 * Immersive Section Type
 */
const Immersive = ({
    add = () => {},
    editMedia = () => {},
    onVisibilityChange = () => { },
    update = () => {},
    updateBackground = () => {},
    remove = () => {},
    id,
    background = {},
    path,
    contents = [],
    mode,
    sectionType,
    inViewRef,
    viewWidth,
    viewHeight
}) => (
    <section
        className="ms-section ms-section-immersive"
        id={id}
        ref={inViewRef}
    >
        <Background
            { ...background }
            mode={mode}
            disableToolbarPortal
            tools={{
                [MediaTypes.IMAGE]: ['editMedia', 'fit', 'size', 'align', 'theme'],
                [MediaTypes.MAP]: ['editMedia', 'fit', 'size', 'align', 'theme']
            }}
            // selector used by sticky polyfill to detect scroll events
            scrollContainerSelector="#ms-sections-container"
            add={add}
            editMedia={editMedia}
            path={path}
            update={updateBackground}
            remove={remove}
            sectionType={sectionType}
            sectionId={id}
            backgroundId={background.id}
            key={background.id}
            width={viewWidth}
            height={viewHeight}
            backgroundPlaceholder={{
                background: `url(${pattern})`,
                backgroundSize: '600px auto'
            }}/>
        <SectionContents
            tools={{
                [ContentTypes.COLUMN]: ['size', 'align', 'theme']
            }}
            className="ms-section-contents"
            contents={contents}
            mode={mode}
            add={add}
            editMedia={editMedia}
            update={update}
            remove={remove}
            sectionId={id}
            viewWidth={viewWidth}
            viewHeight={viewHeight}
            contentProps={{
                onVisibilityChange,
                contentWrapperStyle: { minHeight: viewHeight }
            }}
        />
        {mode === Modes.EDIT && <AddBar
            containerWidth={viewWidth}
            containerHeight={viewHeight}
            buttons={[{
                glyph: 'story-title-section',
                tooltipId: 'geostory.addTitleSection',
                onClick: () => {
                    add('sections', id, SectionTypes.TITLE);
                }
            },
            {
                glyph: 'story-paragraph-section',
                tooltipId: 'geostory.addParagraphSection',
                onClick: () => {
                    add('sections', id, SectionTypes.PARAGRAPH);
                }
            },
            {
                glyph: 'story-immersive-content',
                tooltipId: 'geostory.addImmersiveContent',
                onClick: () => {
                    add(`sections[{"id": "${id}"}].contents`, undefined, ContentTypes.COLUMN); // position undefined means append
                }
            },
            {
                glyph: 'story-media-section',
                tooltipId: 'geostory.addMediaSection',
                onClick: () => {
                    add(`sections`, id, SectionTemplates.MEDIA);
                }
            }]}/>}
    </section>
);

export default immersiveBackgroundManager(Immersive);
