/*
 * Copyright 2019, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
import React from "react";
import AddBar from '../../common/AddBar';
import { SectionTypes, ContentTypes, Modes, SectionTemplates} from '../../../../utils/GeoStoryUtils';

import SectionContents from "../../contents/SectionContents";

const size = (pullRight) => ({
    id: 'size',
    filterOptions: ({ value }) => value !== 'full',
    pullRight
});


/**
 * Paragraph Section Type.
 * Paragraph is a page block that expands for all it's height
 */
export default ({
    id,
    contents,
    mode,
    add = () => {},
    update = () => {},
    editMedia = () => {},
    editWebPage = () => {},
    remove = () => {},
    inViewRef,
    viewWidth,
    viewHeight,
    expandableMedia,
    mediaViewer,
    contentToolbar,
    sections = [],
    sectionType,
    storyFonts
}) => (
    <section
        className="ms-section ms-section-paragraph"
        id={id}
        ref={inViewRef}
    >
        <SectionContents
            className="ms-section-contents"
            contents={contents}
            mode={mode}
            add={add}
            editMedia={editMedia}
            editWebPage={editWebPage}
            update={update}
            remove={remove}
            sectionId={id}
            viewWidth={viewWidth}
            viewHeight={viewHeight}
            sectionType={sectionType}
            contentProps={{
                expandable: expandableMedia,
                mediaViewer,
                contentToolbar,
                overrideTools: {
                    [ContentTypes.TEXT]: [size(true), 'remove']
                }
            }}
            sections={sections}
            storyFonts={storyFonts}
        />
        {mode === Modes.EDIT && <AddBar
            containerWidth={viewWidth}
            containerHeight={viewHeight}
            buttons={[{
                glyph: 'story-title-section',
                tooltipId: 'geostory.addTitleSection',
                onClick: () => {
                    add(`sections`, id, SectionTypes.TITLE);
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
                    add(`sections`, id, SectionTypes.PARAGRAPH);
                }
            },
            {
                glyph: 'story-immersive-section',
                tooltipId: 'geostory.addImmersiveSection',
                onClick: () => {
                    add(`sections`, id, SectionTypes.IMMERSIVE);
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
            }
            ]}
        />}
    </section>
);
