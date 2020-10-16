/*
 * Copyright 2019, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
import React from "react";
import {compose, withStateHandlers} from "recompose";

import SectionContents from '../../contents/SectionContents';
import immersiveBackgroundManager from "./enhancers/immersiveBackgroundManager";
import Background from './Background';
import AddBar from '../../common/AddBar';
import { SectionTypes, ContentTypes, MediaTypes, Modes, SectionTemplates } from '../../../../utils/GeoStoryUtils';
import pattern from './patterns/world.svg';
import {get} from 'lodash';

/**
 * Immersive Section Type
 */
const Immersive = ({
    add = () => {},
    editMedia = () => {},
    editWebPage = () => {},
    onVisibilityChange = () => { },
    update = () => {},
    updateBackground = () => {},
    updateCurrentPage = () => {},
    remove = () => {},
    id,
    background = {},
    path,
    contents = [],
    mode,
    sectionType,
    inViewRef,
    viewWidth,
    viewHeight,
    focusedContent,
    contentId,
    bubblingTextEditing = () => {},
    textEditorActiveClass = "",
    expandableMedia = false,
    storyTheme,
    mediaViewer,
    contentToolbar,
    inView,
    sections = [],
    storyFonts
}) => {
    const hideContent = focusedContent && focusedContent.hideContent && (get(focusedContent, "target.id") === contentId);
    const visibility = hideContent ? 'hidden' : 'visible';
    const expandableBackgroundClassName = expandableMedia && background && background.type === 'map' ? ' ms-expandable-background' : '';
    const overlayStoryTheme = storyTheme?.overlay || {};
    const generalStoryTheme = storyTheme?.general || {};

    return (<section
        className={`ms-section ms-section-immersive${expandableBackgroundClassName}`}
        id={id}
        ref={inViewRef}
    >
        <Background
            { ...background }
            mode={mode}
            disableToolbarPortal
            tools={{
                [MediaTypes.IMAGE]: ['editMedia', 'fit', 'size', 'align', 'theme'],
                [MediaTypes.MAP]: ['editMedia', 'editMap', 'size', 'align', 'theme'],
                [MediaTypes.VIDEO]: ['editMedia', 'fit', 'size', 'align', 'theme', 'muted', 'autoplay', 'loop']
            }}
            // selector used by sticky polyfill to detect scroll events
            scrollContainerSelector="#ms-sections-container"
            add={add}
            editMedia={editMedia}
            expandable={expandableMedia}
            path={path}
            update={updateBackground}
            updateCurrentPage={updateCurrentPage}
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
            }}
            storyTheme={generalStoryTheme}
            mediaViewer={mediaViewer}
            contentToolbar={contentToolbar}
            inView={inView}/>
        <SectionContents
            tools={{
                [ContentTypes.COLUMN]: ['size', 'align', 'theme']
            }}
            className={`ms-section-contents${textEditorActiveClass}`}
            contents={contents}
            mode={mode}
            add={add}
            updateCurrentPage={updateCurrentPage}
            editMedia={editMedia}
            editWebPage={editWebPage}
            update={update}
            remove={remove}
            sectionId={id}
            viewWidth={viewWidth}
            viewHeight={viewHeight}
            contentProps={{
                onVisibilityChange,
                contentWrapperStyle: { minHeight: viewHeight, visibility },
                expandable: expandableMedia,
                mediaViewer,
                contentToolbar
            }}
            focusedContent={focusedContent}
            bubblingTextEditing={bubblingTextEditing}
            sectionType={sectionType}
            storyTheme={overlayStoryTheme}
            sections={sections}
            storyFonts={storyFonts}
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
            },
            {
                glyph: 'story-webpage-section',
                tooltipId: 'geostory.addWebPageSection',
                onClick: () => {
                    add(`sections`, id, SectionTemplates.WEBPAGE);
                }
            }]}/>}
    </section>);
};

export default compose(
    immersiveBackgroundManager,
    withStateHandlers({textEditorActive: false}, {
        bubblingTextEditing: () => (editing) => {
            return  {textEditorActiveClass: editing ? ' ms-text-editor-active' : ''};
        }
    }))(Immersive);
