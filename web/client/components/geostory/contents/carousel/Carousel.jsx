/*
 * Copyright 2021, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
import React, {useState} from 'react';
import CarouselI from 'react-items-carousel';
import cs from 'classnames';
import isEmpty from 'lodash/isEmpty';
import find from 'lodash/find';
import get from 'lodash/get';
import {Glyphicon} from "react-bootstrap";
import DefaultContentToolbar from '../../contents/ContentToolbar';
import {GEOSTORY, Modes} from "../../../../utils/GeoStoryUtils";
import ItemThumbnail from "./carouselItem/ItemThumbnail";
import draggableComponent from '../../../misc/enhancers/draggableComponent';
import draggableContainer from "../../../misc/enhancers/draggableContainer";
import uuid from "uuid";
import defaultThumb from './img/default.jpg';
import withScrollEnhancer from './withScrollEnhancer';
import withKeyboardEnhancer from './withKeyboardEnhancer';
const Carousel = withScrollEnhancer(CarouselI);

const CarouselItem = draggableComponent(({
    thumbnail,
    index,
    isSelected,
    disableEvent,
    ...props
}) => {
    return props.isDraggable && props.connectDragSource && props.connectDragSource(
        <div tabIndex={index}
            className={cs('carousel-item', {'carousel-item-selected': isSelected, 'disable-event': disableEvent})}
            onClick={props.onClick}>
            <div className={'carousel-item-inner-wrapper'} style={{backgroundImage: `url(${thumbnail?.image || defaultThumb})`}}>
                <span className={'carousel-item-inner'}>{thumbnail?.title || `Item ${index + 1}`}</span>
                <span className={'carousel-item-inner-index'}>{index + 1}</span>
            </div>
        </div>
    );
});
const DraggableCarouselItem = withKeyboardEnhancer(CarouselItem);

const DraggableCarousel = draggableContainer(({
    mode,
    add,
    update,
    remove,
    sectionId,
    isMapBackground,
    contentId: currentContentId,
    items,
    contentToolbar: ContentToolbar = DefaultContentToolbar,
    cardComponent: Card,
    expandable,
    containerWidth
}) => {
    const [edit, setEdit] = useState(false);
    const [contentId, setContentId] = useState(undefined);
    const [thumbnail, setThumbnail] = useState({});
    const onEdit = (item) => {
        setContentId(item?.id);
        setEdit(true);
        setThumbnail(item?.thumbnail);
    };
    const editable = mode === Modes.EDIT;

    const onUpdate = (_path, value, id = contentId, _mode = 'replace') => {
        const path = !isEmpty(_path) ? `.${_path}` : '';
        update(`sections[{"id":"${sectionId}"}].contents[{"id":"${id}"}]` + path, value, _mode);
    };

    const onRemove = (id, prevId) => {
        remove(`sections[{"id":"${sectionId}"}].contents[{"id":"${id}"}]`);
        currentContentId === id && update(`sections[{"id":"${sectionId}"}].contents[{"id":"${prevId}"}].hideContent`, false);
    };

    const onMarker = (item) => {
        // Separate the call to allow side-effects
        onUpdate('background.map.mapDrawControl', true, item?.id);
        onUpdate('background.editMap', true, item?.id);

        // Disable info control when drawing
        const mapInfoPath = 'background.map.mapInfoControl';
        const isMapInfoControl = get(item, mapInfoPath);
        if (isMapInfoControl) {
            onUpdate('background.map', { mapInfoControl: false, resetMapInfo: true}, item?.id, 'merge');
        }
    };

    const onRemoveAll = () => remove(`sections[{"id":"${sectionId}"}]`);

    const isEditMap = items.some(({background: { editMap = false } = {} })=> editMap);

    const disableAddItem = () => {
        const {background: {map: { layers = []} = {}} = {}} = find(items, {id: currentContentId}) || {};
        const {features = []} = find(layers, {id: GEOSTORY}) || {};
        return !find(features, {contentRefId: currentContentId});
    };

    return (
        <>
            <div className={'ms-section-carousel'}>
                {editable && <ContentToolbar addDisabled={!isMapBackground || disableAddItem()}
                    add={add} editMap={isEditMap} remove={onRemoveAll} tools={['add', 'remove']}/>}
                <Carousel
                    expandable={expandable}
                    containerWidth={containerWidth}
                    editable={editable}
                    currentContentId={currentContentId}
                    items={items}
                    gutter={12}
                    activePosition={'center'}
                    chevronWidth={60}
                    alwaysShowChevrons
                    showSlither
                    rightChevron={<Glyphicon glyph={'chevron-right'}/>}
                    leftChevron={<Glyphicon glyph={'chevron-left'}/>}
                    classes={{
                        itemsInnerWrapper: cs('items-inner-wrapper', {'items-inner-wrapper-view': mode === Modes.VIEW}),
                        rightChevronWrapper: 'chevron-wrapper right-chevron',
                        leftChevronWrapper: 'chevron-wrapper left-chevron',
                        itemsWrapper: 'items-wrapper'
                    }}
                >
                    {
                        items.map((item, i) =>
                            <>
                                {editable && <ContentToolbar
                                    editMap={isEditMap}
                                    markerDisabled={!isMapBackground || item?.id !== currentContentId}
                                    edit={()=> onEdit(item)}
                                    remove={() => onRemove(item?.id, i === 0 && items.length > 0
                                        ? items[i + 1]?.id : items[i - 1]?.id)
                                    }
                                    forceDelBtnDisable={item?.id === currentContentId}
                                    add={add}
                                    marker={()=>onMarker(item)}
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
                                    disableEvent={isEditMap} {...item}
                                />
                            </>
                        )
                    }
                </Carousel>

            </div>
            {edit && <ItemThumbnail thumbnail={thumbnail} update={onUpdate} onClose={()=>setEdit(false)}/>}
        </>
    );
});

export default ({
    onSort,
    sectionId: id,
    contents = [],
    ...props
}) =>  (
    <DraggableCarousel
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
        {...{...props, sectionId: id}}
        cardComponent={DraggableCarouselItem}
        items={ contents.map(({id: contentId, thumbnail = {}, background}) =>({id: contentId, thumbnail, background}))}
    />
);
