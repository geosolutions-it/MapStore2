/*
 * Copyright 2021, GeoSolutions Sas.
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
import {
    SectionTypes,
    ContentTypes,
    MediaTypes,
    Modes,
    SectionTemplates
} from '../../../../utils/GeoStoryUtils';
import pattern from './patterns/world.svg';
import get from 'lodash/get';
import find from 'lodash/find';
import Carousel from "../../contents/carousel/Carousel";
import InfoCarousel from "../../contents/carousel/InfoCarousel";

/**
 * GeoCarousel Section Type
 */
const GeoCarousel = ({
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
    storyFonts,
    onSort = () => {},
    isDrawEnabled
}) => {
    const hideContent = focusedContent && focusedContent.hideContent && (get(focusedContent, "target.id") === contentId);
    const visibility = hideContent ? 'hidden' : 'visible';
    const expandableBackgroundClassName = expandableMedia && background && background.type === 'map' ? ' ms-expandable-background' : '';
    const overlayStoryTheme = {...storyTheme?.overlay, ...(mode === Modes.VIEW && {maxHeight: viewHeight - 350, overflowY: 'auto'})} || {};
    const generalStoryTheme = storyTheme?.general || {};
    const minHeight = (viewHeight - (mode === Modes.EDIT ? 200 : 180 ));

    // On add column (new section content)
    const addContentColumn = () => {
        add(`sections[{"id": "${id}"}].contents`, undefined, ContentTypes.COLUMN, "geostory.builder.defaults.titleGeocarouselContent");
        update(`sections[{"id":"${id}"}].contents[{"id":"${contentId}"}].hideContent`, true);
    };

    // Hide 'remove' button when only one inner content present for a Carousel section
    const computeButton = (value = []) =>{
        const {contents: _contents = []} = find(contents, {id: contentId}) || {};
        return value.filter(v=> SectionTypes.CAROUSEL === sectionType && _contents.length === 1 ? v !== 'remove' : v);
    };
    const isMapBackground = background?.type === MediaTypes.MAP;

    return (<section
        className={`ms-section ms-section-carousel${expandableBackgroundClassName}`}
        id={id}
        ref={inViewRef}
    >
        <Background
            { ...background }
            mode={mode}
            disableToolbarPortal
            tools={{
                [MediaTypes.IMAGE]: ['editMedia', 'fit', 'size', 'align', 'theme'],
                [MediaTypes.MAP]: ['editMedia', 'editMap', 'size', 'align', 'theme' ].concat(isDrawEnabled ? 'closeDraw' : []),
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
        {!isMapBackground && mode === Modes.EDIT && <InfoCarousel type={'addMap'}/>}
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
                contentWrapperStyle: { minHeight, visibility },
                expandable: expandableMedia,
                mediaViewer,
                contentToolbar,
                overrideTools: (tools) => Object.fromEntries(
                    Object.entries(tools).map(([key, value])=> [key, computeButton(value)])
                )
            }}
            focusedContent={focusedContent}
            bubblingTextEditing={bubblingTextEditing}
            sectionType={sectionType}
            storyTheme={overlayStoryTheme}
            sections={sections}
            storyFonts={storyFonts}
        />
        <Carousel
            sectionId={id}
            contentId={contentId}
            contents={contents}
            update={update}
            remove={remove}
            expandable={expandableMedia}
            add={()=>addContentColumn()}
            contentToolbar={contentToolbar}
            mode={mode}
            onSort={onSort}
            isMapBackground={isMapBackground}
            containerWidth={viewWidth}
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
                glyph: 'story-immersive-section',
                tooltipId: 'geostory.addImmersiveSection',
                onClick: () =>  add(`sections`, id, SectionTypes.IMMERSIVE)
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
    }))(GeoCarousel);
