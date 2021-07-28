/*
 * Copyright 2021, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
import React, { useRef, useState } from "react";
import { compose } from "recompose";
import SectionContents from '../../contents/SectionContents';
import {
    backgroundVisibilityStream,
    updateBackgroundSectionEnhancer,
    backgroundSectionProp
} from "./enhancers/immersiveBackgroundManager";
import Background from './Background';
import AddBar from '../../common/AddBar';
import {
    SectionTypes,
    ContentTypes,
    MediaTypes,
    Modes,
    SectionTemplates,
    getVectorLayerFromContents,
    getDefaultSectionTemplate
} from '../../../../utils/GeoStoryUtils';
import pattern from './patterns/world.svg';
import get from 'lodash/get';
import find from 'lodash/find';
import Carousel from "../../contents/carousel/Carousel";
import InfoCarousel from "../../contents/carousel/InfoCarousel";
import LocalDrawSupport from '../../common/map/LocalDrawSupport';
import FitBounds from '../../common/map/FitBounds';

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
    onEnableDraw = () => {},
    isDrawEnabled,
    defaultMarkerStyle = {
        iconColor: 'cyan',
        iconShape: 'circle'
    }
}) => {

    const innerBackgroundNode = useRef();
    const sectionContentsNode = useRef();
    const carouselNode = useRef();

    function verifyMapVisibility(padding, width) {
        const minWidthVisibility = 128;
        if (width - (padding.left + padding.right) < minWidthVisibility) {
            return { top: 0, left: 0, bottom: 0, right: 0 };
        }
        return padding;
    }

    function computeCarouselMapPadding() {
        let padding = { top: 0, left: 0, bottom: 0, right: 0 };

        const mediaMapNode = innerBackgroundNode.current && innerBackgroundNode.current.querySelector('.ms-media-map');
        const contentNode = sectionContentsNode.current && sectionContentsNode.current.querySelector(`[id='${contentId}']`);
        if (mediaMapNode && contentNode) {
            const backgroundRect = innerBackgroundNode.current.getBoundingClientRect() || {};
            const mediaMapRect = mediaMapNode.getBoundingClientRect() || {};
            const contentRect = contentNode.getBoundingClientRect() || {};

            if (carouselNode.current) {
                const carouselRect = carouselNode.current.getBoundingClientRect() || {};
                padding.bottom = backgroundRect.height - (carouselRect.top - backgroundRect.top);
            }

            const mediaMapMinX = mediaMapRect.left - backgroundRect.left;
            const mediaMapMaxX = mediaMapMinX + mediaMapRect.width;
            const contentMinX = contentRect.left - backgroundRect.left;
            const contentMaxX = contentMinX + contentRect.width;
            const isContentOverMap = contentMinX >= mediaMapMinX && contentMaxX <= mediaMapMaxX;
            if (isContentOverMap) {
                const leftVisibility = contentMinX - mediaMapMinX;
                const rightVisibility = mediaMapMaxX - contentMaxX;
                if (rightVisibility >= leftVisibility) {
                    padding.left = leftVisibility + contentRect.width;
                } else {
                    padding.right = rightVisibility + contentRect.width;
                }
                return verifyMapVisibility(padding, mediaMapRect.width);
            }
            const isContentMaxXOverMap = contentMaxX >= mediaMapMinX && contentMaxX <= mediaMapMaxX;
            if (isContentMaxXOverMap) {
                padding.left = contentMaxX - mediaMapMinX;
                return verifyMapVisibility(padding, mediaMapRect.width);
            }
            const isContentMinXOverMap = contentMinX >= mediaMapMinX && contentMinX <= mediaMapMaxX;
            if (isContentMinXOverMap) {
                padding.right = mediaMapMaxX - contentMinX;
                return verifyMapVisibility(padding, mediaMapRect.width);
            }

        }
        return padding;
    }

    const hideContent = focusedContent && focusedContent.hideContent && (get(focusedContent, "target.id") === id);
    const visibility = hideContent ? 'hidden' : 'visible';
    const expandableBackgroundClassName = expandableMedia && background && background.type === 'map' ? ' ms-expandable-background' : '';
    const overlayStoryTheme = {...storyTheme?.overlay, ...(mode === Modes.VIEW && {maxHeight: viewHeight - 350, overflowY: 'auto'})} || {};
    const generalStoryTheme = storyTheme?.general || {};
    const minHeight = (viewHeight - (mode === Modes.EDIT ? 220 : 200 ));

    // On add column (new section content)
    const addContentColumn = () => {
        const newContent = { ...getDefaultSectionTemplate(ContentTypes.COLUMN), title: 'Item ' + (contents.length + 1), background: {} };
        add(`sections[{"id": "${id}"}].contents`, undefined, newContent, "geostory.builder.defaults.titleGeocarouselContent");
        update(`sections[{"id":"${id}"}].contents[{"id":"${contentId}"}].hideContent`, true);
    };

    // Hide 'remove' button when only one inner content present for a Carousel section
    const computeButton = (value = []) =>{
        const {contents: _contents = []} = find(contents, {id: contentId}) || {};
        return value.filter(v=> SectionTypes.CAROUSEL === sectionType && _contents.length === 1 ? v !== 'remove' : v);
    };
    const isMapBackground = background?.type === MediaTypes.MAP;

    const { features = [] } = contents.find(content => content.id === contentId) || {};

    const contentsLayer = getVectorLayerFromContents({
        id,
        contents,
        featureStyle: ({ content, feature }, idx) => ({
            ...defaultMarkerStyle,
            iconText: `${idx + 1}`,
            ...feature.style,
            highlight: contentId === content.id
        })
    });

    return (<section
        className={`ms-section ms-section-carousel${expandableBackgroundClassName}`}
        id={id}
        ref={inViewRef}
    >
        <Background
            { ...background }
            mode={mode}
            innerRef={innerBackgroundNode}
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
            inView={inView}
            layers={[ contentsLayer ]}
            isDrawEnabled={isDrawEnabled}
            onEnableDraw={onEnableDraw}
            contentToolbarChildren={!isMapBackground && mode === Modes.EDIT && <InfoCarousel type={'addMap'}/>}
        >
            <LocalDrawSupport
                active={isDrawEnabled}
                features={features}
                method="Point"
                onChange={(mapId, newFeatures) => {
                    update(`sections[{"id":"${id}"}].contents[{"id":"${contentId}"}].features`, newFeatures);
                }}
            />
            <FitBounds
                active={!isDrawEnabled && !background?.editMap}
                geometry={features?.[0]?.geometry?.coordinates}
                padding={computeCarouselMapPadding()}
                fixedZoom
                duration={300}
            />
        </Background>
        <SectionContents
            innerRef={sectionContentsNode}
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
            innerRef={carouselNode}
            style={storyTheme?.overlay ? {
                ...storyTheme.overlay
            } : {}}
            controlStyle={generalStoryTheme ? {
                ...generalStoryTheme
            } : {}}
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
            isEditMap={background?.editMap}
            containerWidth={viewWidth}
            isDrawEnabled={isDrawEnabled}
            onEnableDraw={(content) => {
                update(`sections[{"id":"${id}"}].background.editMap`, true, 'replace');
                onEnableDraw({ contentId: content.id, sectionId: id });
            }}
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
                glyph: 'story-carousel-section',
                tooltipId: 'geostory.addGeocarouselSection',
                onClick: () => {
                    add(`sections`, id, SectionTypes.CAROUSEL);
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
    backgroundVisibilityStream,
    backgroundSectionProp,
    updateBackgroundSectionEnhancer,
    (Component) => (props) => {
        const [textEditorActiveClass, setTextEditorActiveClass] = useState('');
        return (
            <Component
                {...props}
                textEditorActiveClass={textEditorActiveClass}
                bubblingTextEditing={(editing) => setTextEditorActiveClass(editing ? ' ms-text-editor-active' : '')}
            />
        );
    }
)(GeoCarousel);
