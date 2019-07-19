/*
 * Copyright 2019, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
import React from 'react';
import ContainerDimensions from 'react-container-dimensions';
import BorderLayout from '../../layout/BorderLayout';
import Section from './sections/Section';
const Parallax = ({children, ...props}) => <div {...props}>{children}</div>;
export default ({
    mode = 'view',
    sections = [],
    onUpdate = () => {},
    onEdit = () => {},
    onAdd = () => {}
}) => (<BorderLayout className="ms-cascade-story">
    <ContainerDimensions>
        {({ width, height }) =>
            <div style={{ position: 'absolute', width: '100%', height: '100%' }}>
                <Parallax
                    id="ms-parallax-container"
                    className="ms-parallax-container"
                    >
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
                    })}
                    </Parallax>
            </div>}
    </ContainerDimensions>
</BorderLayout>);
