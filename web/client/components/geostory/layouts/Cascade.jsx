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
const {Modes} = require('../../../utils/GeoStoryUtils');

export default ({
    mode = Modes.VIEW,
    sections = [],
    onUpdate = () => {},
    onEdit = () => {},
    onAdd = () => {}
}) => (<BorderLayout className="ms-cascade-story">
    <ContainerDimensions sections={sections}>
        {({ width, height }) =>
            <div style={{ position: 'absolute', width: '100%', height: '100%', overflowY: 'auto'}}>
                    {
                        sections.map(({ contents = [], id: sectionId, type: sectionType }) => {
                            return (
                                <Section
                                    key={sectionId}
                                    id={sectionId}
                                    viewHeight={height}
                                    viewWidth={width}
                                    type={sectionType}
                                    mode={mode}
                                    onAdd={onAdd}
                                    onEdit={onEdit}
                                    onUpdate={onUpdate}
                                    contents={contents}
                                />
                            );
                        })
                    }
            </div>}
    </ContainerDimensions>
</BorderLayout>);
