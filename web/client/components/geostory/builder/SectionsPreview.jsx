/*
 * Copyright 2019, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
import React from 'react';
import { capitalize } from "lodash";
import ContainerDimensions from 'react-container-dimensions';
import { Glyphicon } from 'react-bootstrap';
import Toolbar from '../../misc/toolbar/Toolbar';

import SideGrid from '../../misc/cardgrids/SideGrid';
import SideCard from '../../misc/cardgrids/SideCard';

/**
 * Renders icon for the Section or content provided
 * @param {object} content content or section of the type of the icon you want to render
 */
const Icon = ({ type } = {}) => {
    const glyphs = {
        text: 'sheet'
    };
    return <Glyphicon glyph={glyphs[type] || 'question-sign'} />;
};

/**
 * Preview view for a geostory-content
 * @param {object} [content={}] content that have to render preview
 */
const Preview = ({ width } = {}) => {
    const res = 1080 / 1920;
    const height = width * res;
    return (
        <div className="ms-section-preview" style={{ position: 'relative', width, height }}>
            <div className="ms-section-preview-icon">
                <Glyphicon glyph="1-map" style={{ fontSize: height / 2, margin: 'auto' }} />
            </div>
        </div>
    );
};

/**
 * Transforms a geostory section into a SideGrid item.
 * @param {object} section the section to transform
 */
const sectionToItem = ({
    contents,
    type,
    title,
    id
}) => {
    return {
        id: id,
        preview: <Icon type={type} />,
        tools: <Toolbar
            btnDefaultProps={{
                className: 'square-button-md no-border'
            }}
            buttons={[
                {
                    glyph: 'zoom-to',
                    visible: contents.length === 1,
                    tooltip: 'Zoom to content'
                }
            ]} />,
        title: title,
        description: `type: ${type}`,

        body: contents
            ? <div style={{ position: 'relative' }}>
                <SideGrid
                    containerId={id}
                    isDraggable
                    cardComponent={SideCard}
                    items={contents.map((content) => {
                        const foreground = content && content.foreground || {};
                        return {
                            id: content.id,
                            preview: <Icon type={content.type + (foreground.textContainerPosition || '')} />,
                            tools: <Toolbar
                                btnDefaultProps={{
                                    className: 'square-button-md no-border'
                                }}
                                buttons={[
                                    {
                                        glyph: 'zoom-to'
                                    }
                                ]} />,
                            title: capitalize(content.type),
                            description: `type: ${content.type}`,
                            body: (
                                <ContainerDimensions>
                                    <Preview content={content} />
                                </ContainerDimensions>
                            )
                        };
                    })} />
            </div>
            : <ContainerDimensions>
                <Preview content={contents[0]} />
            </ContainerDimensions>
    };

};

/**
 * Shows a preview list of the slides/sections of a story
 * @SectionsPreview
 * @param {object[]} [sections=[]] Array of sections to display
 */
export default ({ sections = [] }) => (<SideGrid
    containerId="ms-story-builder"
    cardComponent={SideCard}
    size="sm"
    items={
        sections.map(sectionToItem)
} />);
