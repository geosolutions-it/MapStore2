/*
 * Copyright 2019, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
import React from 'react';
import ContainerDimensionsBase from 'react-container-dimensions';

import emptyState from '../../misc/enhancers/emptyState';
import currentPageSectionManager from './sections/enhancers/currentPageSectionManager';
import BorderLayout from '../../layout/BorderLayout';
import Section from './sections/Section';
import AddBar from '../common/AddBar';
import Message from '../../I18N/Message';
import {Modes, SectionTypes, SectionTemplates} from '../../../utils/GeoStoryUtils';

const ContainerDimensions = emptyState(
    ({ sections = [] }) => sections.length === 0,
    ({add = () => {}}) => ({
        iconFit: false,
        style: {
            position: "absolute",
            width: "50%",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)"
        },
        // TODO: localize
        title: <Message msgId="geostory.emptyTitle"/>,
        description: <Message msgId="geostory.emptyDescription"/>,
        content: <AddBar
            containerWidth={"100%"}
            containerHeight={"100%"}
            buttons={[{
                glyph: 'font',
                tooltipId: 'geostory.addTitleSection',
                onClick: () => {
                    add('sections', 0, SectionTypes.TITLE);
                }
            },
            {
                glyph: 'sheet',
                tooltipId: 'geostory.addParagraphSection',
                onClick: () => {
                    add('sections', 0, SectionTypes.PARAGRAPH);
                }
            },
            {
                glyph: 'book',
                tooltipId: 'geostory.addImmersiveContent',
                onClick: () => {
                    add(`sections`, 0, SectionTypes.IMMERSIVE);
                }
            },
            {
                glyph: 'picture',
                tooltipId: 'geostory.addMediaSection',
                onClick: () => {
                    add(`sections`, 0, SectionTemplates.MEDIA);
                }
            }]}/>
        }
    )
)(ContainerDimensionsBase);

const Cascade = ({
    mode = Modes.VIEW,
    sections = [],
    add = () => {},
    onVisibilityChange = () => {},
    editMedia = () => {},
    update = () => {},
    remove = () => {}
}) => (<BorderLayout className="ms-cascade-story">
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
                                    onVisibilityChange={onVisibilityChange}
                                    add={add}
                                    editMedia={editMedia}
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

export default currentPageSectionManager(Cascade);
