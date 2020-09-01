/*
 * Copyright 2019, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import {capitalize, find, get} from "lodash";
import React from 'react';
import {Glyphicon} from 'react-bootstrap';
import { connect } from "react-redux";
import {compose, withProps} from 'recompose';
import { createSelector } from 'reselect';
import uuid from "uuid";

import { resourcesSelector } from '../../../selectors/geostory';
import SideCard from '../../misc/cardgrids/SideCard';
import SideGrid from '../../misc/cardgrids/SideGrid';
import draggableComponent from '../../misc/enhancers/draggableComponent';
import draggableContainer from '../../misc/enhancers/draggableContainer';
import Toolbar from '../../misc/toolbar/Toolbar';
import TitleEditable from './TitleEditable';

const DraggableSideGrid = draggableContainer(SideGrid);
const DraggableSideCard = draggableComponent((props) => <SideCard {...props} dragSymbol={<Glyphicon glyph="menu-hamburger"/>} />);

/**
 * avoid triggering other events like card selection
 * @param {string} id id of the element to scroll to
 * @param {function} scrollTo function used to scroll to the element
 */
const scrollToHandler = (id, scrollTo) => (evt) => {
    evt.stopPropagation();
    scrollTo(id);
};

/**
 * Renders icon for the Section or content provided
 * @prop {object} props passed to this icon
 * @prop {string} props.type type of the icon to render
 * @prop {string} props.src src of the image
 * @prop {string} props.thumbnail url for the thumbnail of the map
 */
const Icon = ({ type, src, thumbnail } = {}) => {
    const glyphs = {
        text: 'sheet',
        image: 'picture',
        title: 'story-title-section',
        banner: 'story-banner-section',
        paragraph: 'story-paragraph-section',
        immersive: 'story-immersive-section',
        media: 'story-media-section',
        map: '1-map',
        columnleft: 'align-left',
        columnright: 'align-right',
        columncenter: 'align-center',
        webPage: 'story-webpage-section',
        video: 'play'
    };
    const imgSrc = thumbnail || type === 'image' && src;
    return imgSrc ? <img src={imgSrc}/> : <Glyphicon glyph={glyphs[type] || 'picture'} />;
};
const ConnectedIcon = compose(
    connect(createSelector(resourcesSelector, (resources) => ({resources}))),
    withProps(
        ({ resources, resourceId: id }) => {
            const resource = find(resources, { id }) || {};
            return resource.data;
        }
    )
)(Icon);

const previewContents = {
    title: () => null,
    paragraph: ({ id, contents, isCollapsed, scrollTo, onSort, sectionId, onUpdate }) => (
        <div style={{ position: 'relative' }}>
            <DraggableSideGrid
                containerId={id}
                isDraggable
                onSort={(sortIdTo, sortIdFrom, itemDataTo, itemDataFrom) => {
                    if (itemDataTo.containerId === itemDataFrom.containerId) {
                        const source = `sections[{ "id": "${id}" }].contents[{"id":"${contents[0].id}"}].contents[{"id":"${itemDataFrom.id}"}]`;
                        const target = `sections[{ "id": "${id}" }].contents[{"id":"${contents[0].id}"}].contents`;
                        const position = sortIdTo;
                        const newId = uuid();
                        onSort(source, target, position, newId, `sections[{ "id": "${id}" }].contents[{"id":"${contents[0].id}"}].contents[{"id":"${newId}"}]`);
                    }
                }}
                cardComponent={DraggableSideCard}
                items={contents[0].contents.map((content) => {
                    const contentType = content.type === 'column'
                        ? `${content.type}${content.align || 'center'}`
                        : content.type;
                    const PreviewContents = previewContents[content.type];
                    return {
                        id: content.id,
                        preview: <ConnectedIcon type={contentType} resourceId={content.resourceId}/>,
                        tools: <Toolbar
                            btnDefaultProps={{
                                className: 'square-button-md no-border'
                            }}
                            buttons={[
                                {
                                    glyph: 'zoom-to',
                                    tooltipId: "geostory.zoomToContent",
                                    onClick: scrollToHandler(content.id, scrollTo)
                                }
                            ]} />,
                        title: <TitleEditable
                            title={content.title || capitalize(content.type)}
                            onUpdate={(text) => onUpdate(`sections[{"id": "${sectionId}"}].contents[{"id": "${contents[0].id}"}].contents[{"id": "${content.id}"}]`, {title: text}, "merge")}/>,
                        description: `type: ${content.type}`,
                        body: PreviewContents
                            && <PreviewContents
                                id={id}
                                onSort={onSort}
                                scrollTo={scrollTo}
                                isCollapsed={isCollapsed}
                                contents={content.contents}/>
                    };
                })} />
        </div>
    ),
    column: ({ sectionId, id, contents, isCollapsed, scrollTo, onSort, onUpdate }) => (
        <div style={{ position: 'relative' }}>
            <DraggableSideGrid
                containerId={id}
                isDraggable
                onSort={(sortIdTo, sortIdFrom, itemDataTo, itemDataFrom) => {
                    if (itemDataTo.containerId === itemDataFrom.containerId) {
                        const source = `sections[{ "id": "${sectionId}" }].contents[{"id":"${id}"}].contents[{"id":"${itemDataFrom.id}"}]`;
                        const target = `sections[{ "id": "${sectionId}" }].contents[{"id":"${id}"}].contents`;
                        const position = sortIdTo;
                        const newId = uuid();
                        onSort(source, target, position, newId, `sections[{ "id": "${sectionId}" }].contents[{"id":"${id}"}].contents[{"id":"${newId}"}]`);
                    }
                }}
                cardComponent={DraggableSideCard}
                items={contents.map((content) => {
                    const contentType = content.type === 'column'
                        ? `${content.type}${content.align || 'center'}`
                        : content.type;
                    const PreviewContents = previewContents[content.type];
                    return {
                        id: content.id,
                        preview: <ConnectedIcon type={contentType} resourceId={content.resourceId}/>,
                        tools: <Toolbar
                            btnDefaultProps={{
                                className: 'square-button-md no-border'
                            }}
                            buttons={[
                                {
                                    glyph: 'zoom-to',
                                    tooltipId: "geostory.zoomToContent",
                                    onClick: scrollToHandler(content.id, scrollTo)
                                }
                            ]} />,
                        title: <TitleEditable
                            title={content.title || capitalize(content.type)}
                            onUpdate={(text) => onUpdate(`sections[{"id": "${sectionId}"}].contents[{"id": "${id}"}].contents[{"id": "${content.id}"}]`, {title: text}, "merge")}/>,
                        description: `type: ${content.type}`,
                        body: !isCollapsed && PreviewContents
                            && <PreviewContents id={id} onSort={onSort}/>
                    };
                })} />
        </div>
    ),
    immersive: ({ id, contents, isCollapsed, scrollTo, onUpdate, onSort, currentPage }) => (
        <div style={{ position: 'relative' }}>
            <DraggableSideGrid
                containerId={id}
                isDraggable
                onSort={(sortIdTo, sortIdFrom, itemDataTo, itemDataFrom) => {
                    if (itemDataTo.containerId === itemDataFrom.containerId) {
                        const source = `sections[{ "id": "${id}" }].contents[{"id":"${itemDataFrom.id}"}]`;
                        const target = `sections[{ "id": "${id}" }].contents`;
                        const position = sortIdTo;
                        const newId = uuid();
                        onSort(source, target, position, newId, `sections[{ "id": "${id}" }].contents[{"id":"${newId}"}]`);
                    }
                }}
                cardComponent={DraggableSideCard}
                items={contents.map((content) => {
                    const contentType = content.type === 'column'
                        ? `${content.type}${content.align || 'center'}`
                        : content.type;
                    const PreviewContents = previewContents[content.type];
                    return {
                        className: currentPage && currentPage.columns && currentPage.columns[id] && currentPage.columns[id] === content.id && currentPage.sectionId === id
                            ? 'ms-highlight'
                            : '',
                        id: content.id,
                        preview: <Icon type={contentType} />,
                        tools: <Toolbar
                            btnDefaultProps={{
                                className: 'square-button-md no-border'
                            }}
                            buttons={[
                                {
                                    glyph: 'zoom-to',
                                    tooltipId: "geostory.zoomToContent",
                                    onClick: scrollToHandler(content.id, scrollTo)
                                }
                            ]} />,
                        title: <TitleEditable
                            title={content.title || capitalize(content.type)}
                            onUpdate={(text) => onUpdate(`sections[{"id": "${id}"}].contents[{"id":"${content.id}"}]`, {title: text}, "merge")}/>,
                        description: `type: ${content.type}`,
                        body: PreviewContents
                            && <PreviewContents
                                id={content.id}
                                sectionId={id}
                                onSort={onSort}
                                onUpdate={onUpdate}
                                scrollTo={scrollTo}
                                isCollapsed={isCollapsed}
                                contents={content.contents}/>
                    };
                })} />
        </div>
    )
};

/**
 * Transforms a geostory section into a SideGrid item.
 * @param {object} section the section to transform
 */
const sectionToItem = ({
    scrollTo,
    isCollapsed = false,
    currentPage,
    onSort,
    onSelect,
    onUpdate,
    selected = "title_section_id1"
}) => ({
    contents,
    type,
    title,
    id
}) => {
    const PreviewContents = previewContents[type];
    return {
        id: id,
        preview: <ConnectedIcon type={type} resourceId={get(contents[0], 'background.resourceId')}/>,
        className: currentPage && currentPage.sectionId === id
            ? 'ms-highlight'
            : '',
        onClick: () => onSelect(id),
        selected: id === selected,
        tools: <Toolbar
            btnDefaultProps={{
                className: 'square-button-md no-border'
            }}
            buttons={[
                {
                    onClick: scrollToHandler(id, scrollTo),
                    glyph: 'zoom-to',
                    // visible: type !== 'immersive',
                    tooltipId: "geostory.zoomToContent"
                }
            ]} />,
        title: <TitleEditable title={title} onUpdate={(text) => onUpdate(`sections[{"id": "${id}"}]`, {title: text}, "merge")}/>,
        description: `type: ${type}`,
        body: !isCollapsed ?
            PreviewContents &&
            <PreviewContents
                id={id}
                sectionId={id}
                onSort={onSort}
                onUpdate={onUpdate}
                onSelect={onSelect}
                currentPage={currentPage}
                selected={selected}
                scrollTo={scrollTo}
                isCollapsed={isCollapsed}
                contents={contents}/>
            : null
    };

};

/**
 * Shows a preview list of the slides/sections of a story
 * @SectionsPreview
 * @param {object[]} [sections=[]] Array of sections to display
 */
export default ({ sections = [], scrollTo, onSelect = () => {}, isCollapsed, currentPage, selected, onSort, onUpdate }) => (<DraggableSideGrid
    isDraggable
    onSort={(sortIdTo, sortIdFrom, itemDataTo, itemDataFrom) => {
        if (itemDataTo.containerId === 'story-sections'
        && itemDataFrom.containerId === 'story-sections') {
            const newId = uuid();
            const source = `sections[{ "id": "${itemDataFrom.id}" }]`;
            const target = `sections`;
            const position = sortIdTo;
            onSort(source, target, position, newId, `sections[{ "id": "${newId}" }]`);
        }
    }}
    containerId="story-sections"
    cardComponent={DraggableSideCard}
    size="sm"
    items={
        sections.map(sectionToItem({ currentPage, onSelect, isCollapsed, scrollTo, selected, onUpdate, onSort }))
    } />);
