/*
 * Copyright 2019, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
import React from "react";
import SectionContents from '../../contents/SectionContents';
import Background from './Background';
import {backgroundPropWithHandler} from './enhancers/immersiveBackgroundManager';
import ContainerDimensions from 'react-container-dimensions';
import AddBar from '../../common/AddBar';
import { SectionTypes, ContentTypes, Modes, MediaTypes, SectionTemplates } from '../../../../utils/GeoStoryUtils';

/**
 * Paragraph Section Type.
 * Paragraph is a page block that expands for all it's height
 */
export default backgroundPropWithHandler(({
    id,
    background = {},
    contents = [],
    mode,
    contentId,
    path,
    cover,
    viewWidth,
    viewHeight,
    add = () => {},
    update = () => {},
    updateBackground = () => {},
    editMedia = () => {}
}) => (
    <section
        className="ms-section ms-section-title">
        <ContainerDimensions>
            {({ height }) =>
            // when section height is less then the view height
            // background height need to be equal to section size
            // this is important when working with z-index of section
            // in case we increase the z-index of title the whole background is visible and overlap next section
            <Background
                { ...background }
                // selector used by sticky polyfill to detect scroll events
                scrollContainerSelector="#ms-sections-container"
                key={background.id}
                mode={mode}
                id={contentId}
                path={path}
                update={updateBackground}
                add={add}
                editMedia={editMedia}
                width={viewWidth}
                tools={{
                    [MediaTypes.IMAGE]: ['editMedia', 'fit', 'size', 'align']
                }}
                height={height >= viewHeight
                    ? viewHeight
                    : height}/>}
        </ContainerDimensions>
        <SectionContents
            className="ms-section-contents"
            contents={contents}
            mode={mode}
            add={add}
            update={update}
            sectionId={id}
            contentProps={{
                contentWrapperStyle: cover ? { minHeight: viewHeight } : {}
            }}
            tools={{
                [ContentTypes.TEXT]: ['size', 'align', 'theme'],
                [MediaTypes.IMAGE]: ['editMedia', 'size', 'align']
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
                tooltipId: 'geostory.addImmersiveSection',
                onClick: () => {
                    // TODO: add
                    add('sections', id, SectionTypes.IMMERSIVE);
                }
            },
            {
                glyph: 'picture',
                tooltipId: 'geostory.addMediaSection',
                onClick: () => {
                    add(`sections`, id, SectionTemplates.MEDIA);
                }
            }]}/>}
    </section>
));
