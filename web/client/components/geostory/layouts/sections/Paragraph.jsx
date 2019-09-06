/*
 * Copyright 2019, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
import React from "react";
import AddBar from '../../common/AddBar';
import { SectionTypes, Modes, SectionTemplates} from '../../../../utils/GeoStoryUtils';

import SectionContents from "../../contents/SectionContents";


/**
 * Paragraph Section Type.
 * Paragraph is a page block that expands for all it's height
 */
export default ({
    id,
    contents,
    mode,
    add = () => {},
    update= () => {},
    editMedia= () => {},
    remove = () => {},
    viewWidth,
    viewHeight
}) => (
    <section
        className="ms-section ms-section-paragraph"
        id={id}
    >
        <SectionContents
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
            />
        {mode === Modes.EDIT && <AddBar
            containerWidth={viewWidth}
            containerHeight={viewHeight}
            buttons={[{
                glyph: 'font',
                tooltipId: 'geostory.addTitleSection',
                onClick: () => {
                    add(`sections`, id, SectionTypes.TITLE);
                }
            },
            {
                glyph: 'sheet',
                tooltipId: 'geostory.addParagraphSection',
                onClick: () => {
                    add(`sections`, id, SectionTypes.PARAGRAPH);
                }
            },
            {
                glyph: 'book',
                tooltipId: 'geostory.addImmersiveSection',
                onClick: () => {
                    add(`sections`, id, SectionTypes.IMMERSIVE);
                }
            },
            {
                glyph: 'picture',
                tooltipId: 'geostory.addMediaSection',
                onClick: () => {
                    add(`sections`, id, SectionTemplates.MEDIA);
                }
            }]}
        />}
    </section>
);
