/*
 * Copyright 2019, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
import React from "react";
import {compose, withStateHandlers} from 'recompose';
import Background from './Background';
import {backgroundPropWithHandler} from './enhancers/immersiveBackgroundManager';
import ContainerDimensions from 'react-container-dimensions';
import AddBar from '../../common/AddBar';
import { SectionTypes, Modes, MediaTypes, SectionTemplates } from '../../../../utils/GeoStoryUtils';
import titlePattern from './patterns/dots.png';
import coverPattern from './patterns/grid.svg';
import {get} from 'lodash';
/**
 * Paragraph Section Type.
 * Paragraph is a page block that expands for all it's height
 */
export const DEFAULT_BANNER_HEIGHT = 300;

export default compose(
    backgroundPropWithHandler,
    withStateHandlers({textEditorActive: false}))(({
    id,
    background = {},
    mode,
    contentId,
    path,
    sectionType = SectionTypes.BANNER,
    cover,
    viewWidth,
    viewHeight,
    inViewRef,
    add = () => {},
    updateSection = () => {},
    remove = () => {},
    updateBackground = () => {},
    editMedia = () => {},
    focusedContent,
    expandableMedia = false,
    storyTheme,
    mediaViewer,
    contentToolbar,
    inView
}) => {
    const hideContent = get(focusedContent, "target.id") === contentId;
    const expandableBackgroundClassName = expandableMedia && background && background.type === 'map' ? ' ms-expandable-background' : '';
    const deletePath = path.replace('.background', '');

    return (
        <section
            ref={inViewRef}
            className={`ms-section ms-section-banner${expandableBackgroundClassName}`}
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
                        expandable={expandableMedia}
                        updateSection={updateSection}
                        cover={cover}
                        remove={() => remove(deletePath)}
                        width={viewWidth}
                        sectionType={sectionType}
                        backgroundPlaceholder={{
                            background: `url(${cover ? coverPattern : titlePattern })`,
                            backgroundSize: `${cover ? 64 : 600 }px auto`
                        }}
                        tools={{
                            [MediaTypes.IMAGE]: ['editMedia', 'cover', 'fit', 'size', 'align', 'theme', 'remove'],
                            [MediaTypes.MAP]: ['editMedia', 'cover', 'editMap', 'size', 'align', 'theme', 'remove'],
                            [MediaTypes.VIDEO]: ['editMedia', 'cover', 'fit', 'size', 'align', 'theme', 'muted', 'autoplay', 'loop', 'remove']
                        }}
                        height={height >= viewHeight
                            ? viewHeight
                            : height}
                        storyTheme={storyTheme}
                        mediaViewer={mediaViewer}
                        contentToolbar={contentToolbar}
                        inView={inView}
                    />}
            </ContainerDimensions>
            <div
                style={{
                    minHeight: cover ? viewHeight : DEFAULT_BANNER_HEIGHT,
                    pointerEvents: 'none'
                }}>
            </div>
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
                    glyph: 'story-banner-section',
                    tooltipId: 'geostory.addBannerSection',
                    onClick: () => {
                        add('sections', id, SectionTypes.BANNER);
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
