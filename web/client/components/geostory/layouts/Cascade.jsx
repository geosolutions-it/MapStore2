/*
 * Copyright 2019, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
import React from 'react';
import ContainerDimensionsBase from 'react-container-dimensions';
import {compose} from 'recompose';
import { throttlePageUpdateEnhancer } from './sections/enhancers/updateCurrentPageEnhancer';

import emptyState from '../../misc/enhancers/emptyState';
import currentPageSectionManager from './sections/enhancers/currentPageSectionManager';
import BorderLayout from '../../layout/BorderLayout';
import Section from './sections/Section';
import AddBar from '../common/AddBar';
import Message from '../../I18N/Message';
import {Modes, SectionTypes, SectionTemplates} from '../../../utils/GeoStoryUtils';

import withFocusMask from './sections/enhancers/withFocusMask';

const ContainerDimensions = emptyState(
    ({ sections = [] }) => sections.length === 0,
    ({add = () => {}}) => ({
        iconFit: false,
        style: {
            position: "relative",
            width: "50%",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)"
        },
        glyph: 'geostory',
        title: <Message msgId="geostory.emptyTitle"/>,
        description: <Message msgId="geostory.emptyDescription"/>,
        content: <AddBar
            addButtonClassName="square-button-md"
            containerWidth={"100%"}
            containerHeight={"100%"}
            buttons={[{
                glyph: 'story-title-section',
                tooltipId: 'geostory.addTitleSection',
                onClick: () => {
                    add('sections', 0, SectionTypes.TITLE);
                }
            },
            {
                glyph: 'story-paragraph-section',
                tooltipId: 'geostory.addParagraphSection',
                onClick: () => {
                    add('sections', 0, SectionTypes.PARAGRAPH);
                }
            },
            {
                glyph: 'story-immersive-section',
                tooltipId: 'geostory.addImmersiveContent',
                onClick: () => {
                    add(`sections`, 0, SectionTypes.IMMERSIVE);
                }
            },
            {
                glyph: 'story-media-section',
                tooltipId: 'geostory.addMediaSection',
                onClick: () => {
                    add(`sections`, 0, SectionTemplates.MEDIA);
                }
            },
            {
                glyph: 'code', // TODO: change when new icon will be prepared
                tooltipId: 'geostory.addWebPageSection',
                onClick: () => {
                    add(`sections`, 0, SectionTemplates.WEBPAGE);
                }
            }
            ]}/>
    }
    )
)(ContainerDimensionsBase);

const Cascade = ({
    mode = Modes.VIEW,
    sections = [],
    add = () => {},
    onVisibilityChange = () => {},
    updateCurrentPage = () => {},
    editMedia = () => {},
    editWebPage = () => {},
    update = () => {},
    remove = () => {},
    focusedContent,
    isContentFocused = false
}) => (<BorderLayout  className={`ms-cascade-story ms-${mode}`} bodyClassName={`ms2-border-layout-body ${isContentFocused ? 'no-overflow' : ''}`}>
    <ContainerDimensions
        sections={sections}
        add={add}>
        {({ width, height }) =>
            <div
                id="ms-sections-container"
                className="ms-sections-container">
                {
                    sections.map(({ contents = [], id: sectionId, type: sectionType, cover }) => {
                        return (
                            <Section
                                focusedContent={focusedContent}
                                onVisibilityChange={onVisibilityChange}
                                add={add}
                                editMedia={editMedia}
                                editWebPage={editWebPage}
                                updateCurrentPage={updateCurrentPage}
                                update={update}
                                remove={remove}
                                key={sectionId}
                                id={sectionId}
                                viewHeight={height}
                                viewWidth={width}
                                type={sectionType}
                                mode={mode}
                                contents={contents}
                                cover={cover}
                            />
                        );
                    })
                }
            </div>}
    </ContainerDimensions>
</BorderLayout>);

export default compose(
    throttlePageUpdateEnhancer,
    currentPageSectionManager,
    withFocusMask({ showFocusMask: ({focusedContent: {target = {}} = {}}) => target.id })
)(Cascade);
