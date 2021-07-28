/*
 * Copyright 2021, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
import React, { useState, useEffect } from 'react';
import cs from 'classnames';
import isEmpty from 'lodash/isEmpty';
import find from 'lodash/find';
import {Glyphicon} from "react-bootstrap";
import DefaultContentToolbar from '../../contents/ContentToolbar';
import { Modes } from "../../../../utils/GeoStoryUtils";
import ItemThumbnail from "./carouselItem/ItemThumbnail";
import draggableComponent from '../../../misc/enhancers/draggableComponent';
import draggableContainer from "../../../misc/enhancers/draggableContainer";
import uuid from "uuid";
import Button from '../../../misc/Button';
import defaultThumb from './img/default.jpg';
import InfoCarousel from "./InfoCarousel";
import useSwipeControls from '../../common/hooks/useSwipeControls';

const DraggableCarouselItem = draggableComponent(({
    title,
    thumbnail,
    index,
    isSelected,
    ...props
}) => {
    const cardComponent = (
        <div
            className={cs('ms-geo-carousel-item', {'ms-geo-carousel-item-selected': isSelected })}
            onClick={props.onClick}>
            <div className={'ms-geo-carousel-item-inner-wrapper'} style={{backgroundImage: `url(${thumbnail?.image || defaultThumb})`}}>
                <span className={'ms-geo-carousel-item-inner'}>{title || `Item ${index + 1}`}</span>
                <span className={'ms-geo-carousel-item-inner-index'}>{index + 1}</span>
            </div>
        </div>
    );
    return props.isDraggable && props.connectDragSource ? props.connectDragSource(cardComponent) : cardComponent;
});

const DraggableCarousel = draggableContainer(({
    mode,
    add,
    update = () => {},
    remove,
    sectionId,
    isMapBackground,
    contentId: currentContentId,
    items,
    contentToolbar: ContentToolbar = DefaultContentToolbar,
    cardComponent: Card,
    containerWidth,
    isDrawEnabled,
    onEnableDraw,
    isEditMap,
    innerRef,
    deltaSwipeSize = 200,
    transition = 300,
    style,
    controlStyle
}) => {

    const [edit, setEdit] = useState(false);
    const [contentId, setContentId] = useState(undefined);
    const [title, setTitle] = useState('');
    const [thumbnail, setThumbnail] = useState({});

    const onEdit = (item) => {
        setContentId(item?.id);
        setEdit(true);
        setThumbnail(item?.thumbnail);
        setTitle(item?.title);
    };

    const {
        isStartControlActive,
        isEndControlActive,
        containerPropsHandlers,
        contentPropsHandlers,
        itemPropsHandlers,
        moveToDeltaSize,
        moveItemInViewById
    } = useSwipeControls({
        direction: 'horizontal',
        width: containerWidth,
        deltaScroll: deltaSwipeSize,
        transition
    }, [items.length]);

    const editable = mode === Modes.EDIT;

    useEffect(() => {
        if (currentContentId) {
            moveItemInViewById(currentContentId, {
                margin: 32
            });
        }
    }, [ currentContentId ]);

    const onUpdate = (_path, value, id = contentId, _mode = 'replace') => {
        const path = !isEmpty(_path) ? `.${_path}` : '';
        update(`sections[{"id":"${sectionId}"}].contents[{"id":"${id}"}]` + path, value, _mode);
    };

    const onRemove = (id, prevId) => {
        remove(`sections[{"id":"${sectionId}"}].contents[{"id":"${id}"}]`);
        currentContentId === id && update(`sections[{"id":"${sectionId}"}].contents[{"id":"${prevId}"}].hideContent`, false);
    };

    const onRemoveAll = () => remove(`sections[{"id":"${sectionId}"}]`);

    // enable add only if the background is a map and all the contents as at least one feature
    const addDisabled = !(isMapBackground && !find(items, item => (item?.features?.length || 0) === 0));

    const displayMarkerInfo = () => isEditMap && editable && isDrawEnabled && !!find(items, item => item.id === currentContentId && (item?.features?.length || 0) === 0);

    return (
        <>
            <div
                ref={innerRef}
                style={style}
                className={'ms-geo-carousel'}>
                {editable && items.length === 1 && addDisabled && !isEditMap && <InfoCarousel type={"addInfo"}/>}
                {displayMarkerInfo() && <InfoCarousel type={"addMarker"}/>}
                {editable && <ContentToolbar addDisabled={addDisabled}
                    add={add} editMap={isEditMap} remove={onRemoveAll} tools={['add', 'remove']}/>}
                <div
                    { ...containerPropsHandlers() }
                    className="ms-horizontal-menu">
                    <div { ...contentPropsHandlers() }>
                        {
                            items.map((item, i) => {
                                const itemProps = itemPropsHandlers({
                                    id: item.id,
                                    onClick: !isEditMap
                                        ? () => {
                                            update(`sections[{"id":"${sectionId}"}].contents[{"id":"${item.id}"}].carouselToggle`, true);
                                        }
                                        : undefined
                                });
                                return (
                                    <div
                                        key={i}
                                        { ...itemProps }
                                        className="ms-geo-carousel-item-wrapper"
                                        style={isEditMap ? { pointerEvents: 'none' } : {}}
                                    >
                                        {editable && <ContentToolbar
                                            editMap={isEditMap}
                                            markerDisabled={!isMapBackground || item?.id !== currentContentId}
                                            edit={(event)=> {
                                                event.stopPropagation();
                                                onEdit(item);
                                            }}
                                            remove={() => onRemove(item?.id, i === 0 && items.length > 0
                                                ? items[i + 1]?.id : items[i - 1]?.id)
                                            }
                                            forceDelBtnDisable={item?.id === currentContentId}
                                            add={add}
                                            marker={(event)=> {
                                                event.stopPropagation();
                                                onEnableDraw(item);
                                            }}
                                            tools={['edit', 'remove', 'marker']}/>
                                        }
                                        <Card
                                            key={i}
                                            index={i}
                                            items={items}
                                            update={update}
                                            sectionId={sectionId}
                                            selectedId={currentContentId}
                                            isSelected={ item?.id === currentContentId}
                                            {...item}
                                        />
                                    </div>
                                );
                            })
                        }
                    </div>
                    {isStartControlActive && <Button
                        className="square-button-md no-border ms-geo-carousel-control"
                        style={{
                            ...controlStyle,
                            position: 'absolute'
                        }}
                        onClick={() => moveToDeltaSize(deltaSwipeSize)}>
                        <Glyphicon glyph="chevron-left"/>
                    </Button>}
                    {isEndControlActive && <Button
                        className="square-button-md no-border ms-geo-carousel-control"
                        style={{
                            ...controlStyle,
                            position: 'absolute',
                            right: 0
                        }}
                        onClick={() => moveToDeltaSize(-deltaSwipeSize)}>
                        <Glyphicon glyph="chevron-right"/>
                    </Button>}
                </div>
            </div>
            {edit && <ItemThumbnail title={title} thumbnail={thumbnail} update={onUpdate} onClose={()=>setEdit(false)}/>}
        </>
    );
});

export default ({
    onSort,
    sectionId: id,
    contents = [],
    onEnableDraw = () => {},
    isEditMap,
    isDrawEnabled,
    ...props
}) =>  (
    <DraggableCarousel
        containerId={id}
        isDraggable={props.mode === Modes.EDIT}
        onSort={(sortIdTo, sortIdFrom, itemDataTo, itemDataFrom) => {
            if (itemDataTo.containerId === itemDataFrom.containerId) {
                const source = `sections[{ "id": "${id}" }].contents[{"id":"${itemDataFrom.id}"}]`;
                const target = `sections[{ "id": "${id}" }].contents`;
                const position = sortIdTo;
                const newId = uuid();
                onSort(source, target, position, newId, `sections[{ "id": "${id}" }].contents[{"id":"${newId}"}]`);
            }
        }}
        {...{...props, sectionId: id}}
        cardComponent={DraggableCarouselItem}
        items={ contents.map(({id: contentId, thumbnail = {}, features, title }) =>({id: contentId, thumbnail, features, title }))}
        isDrawEnabled={isDrawEnabled}
        onEnableDraw={onEnableDraw}
        isEditMap={isEditMap}
    />
);
