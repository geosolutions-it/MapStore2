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

// Apply Empty Icon for empty state - TODO: improve look and feel
const ContainerDimensions = emptyState(
    ({ sections = [] }) => sections.length === 0,
    () => ({
        style: { height: "100%" },
        mainViewStyle: {
            position: "absolute",
            top: "50%",
            width: "100%",
            transform: "translateY(-50%)"
        },
        // TODO: localize
        title: "NO CONTENT"
    })
)(ContainerDimensionsBase);
import BorderLayout from '../../layout/BorderLayout';
import Section from './sections/Section';

import {Modes} from '../../../utils/GeoStoryUtils';

const Cascade = ({
    mode = Modes.VIEW,
    sections = [],
    add = () => {},
    onVisibilityChange = () => {},
    editMedia = () => {},
    update = () => {},
    remove = () => {}
}) => (<BorderLayout className="ms-cascade-story">
    <ContainerDimensions sections={sections}>
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
