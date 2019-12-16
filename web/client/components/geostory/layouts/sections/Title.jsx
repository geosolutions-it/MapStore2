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
import titlePattern from './patterns/dots.png';
import coverPattern from './patterns/grid.svg';
import {get} from 'lodash';
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
    sectionType,
    cover,
    viewWidth,
    viewHeight,
    inViewRef,
    add = () => {},
    update = () => {},
    updateSection = () => {},
    remove = () => {},
    updateBackground = () => {},
    editMedia = () => {},
    focusedContent
}) => {

    const hideContent = get(focusedContent, "target.id") === contentId;
    const visibility = hideContent ?  'hidden' : 'visible';
    return (
        <section
            ref={inViewRef}
            className="ms-section ms-section-title"
            id={id}
        >
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
                        updateSection={updateSection}
                        cover={cover}
                        remove={remove}
                        width={viewWidth}
                        sectionType={sectionType}
                        backgroundPlaceholder={{
                            background: `url(${cover ? coverPattern : titlePattern })`,
                            backgroundSize: `${cover ? 64 : 600 }px auto`
                        }}
                        tools={{
                            [MediaTypes.IMAGE]: ['editMedia', 'cover', 'fit', 'size', 'align', 'theme'],
                            [MediaTypes.MAP]: ['editMedia', 'cover', 'editMap', 'size', 'align', 'theme']
                        }}
                        height={height >= viewHeight
                            ? viewHeight
                            : height}
                    />}
            </ContainerDimensions>
            <SectionContents
                className="ms-section-contents"
                contents={contents}
                mode={mode}
                add={add}
                sectionType={sectionType}
                update={update}
                remove={remove}
                sectionId={id}
                contentProps={{
                    contentWrapperStyle: cover ? { minHeight: viewHeight, visibility} : {visibility}
                }}
                tools={{
                    [ContentTypes.TEXT]: ['size', 'align', 'theme', 'remove']
                }}
                focusedContent={focusedContent}
            />
            {mode === Modes.EDIT && !hideContent && <AddBar
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
                    glyph: 'story-immersive-section',
                    tooltipId: 'geostory.addImmersiveSection',
                    onClick: () => {
                        add('sections', id, SectionTypes.IMMERSIVE);
                    }
                },
                {
                    glyph: 'story-media-section',
                    tooltipId: 'geostory.addMediaSection',
                    onClick: () => {
                        add(`sections`, id, SectionTemplates.MEDIA);
                    }
                },
                {
                    glyph: 'story-webpage-section',
                    tooltipId: 'geostory.addWebPageSection',
                    onClick: () => {
                        add(`sections`, id, SectionTemplates.WEBPAGE);
                    }
                }]}/>}
        </section>
    );
});
