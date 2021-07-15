/*
 * Copyright 2021, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
import React, {useState, useEffect, createRef, useCallback} from "react";
import findIndex from 'lodash/findIndex';

/**
 * Get carousel items responsively to support both in edit and view mode
 * @param containerWidth
 * @return {number}
 */
const getItems = (containerWidth) => {
    let items;
    if (containerWidth <= 420) {
        items = 2;
    } else if (containerWidth > 420 && containerWidth <= 640) {
        items = 3;
    } else if (containerWidth > 640 && containerWidth <= 768) {
        items = 4;
    } else if (containerWidth > 768 && containerWidth <= 1200) {
        items = 6;
    } else if (containerWidth > 1200 && containerWidth <= 1400) {
        items = 8;
    } else {
        items = 10;
    }
    return items;
};
const DEFAULT_CAROUSEL_GUTTER = 12;

export default (Component) => (props) => {
    const sliderRef = createRef();
    const [activeItemIndex, setActiveItemIndex] = useState(0);
    const [noOfCarouselItem, setCarouselItem] = useState(4);
    useEffect(() => {
        if (props.expandable) {
            setCarouselItem(2);
        } else {
            // Carousel inner container will always less than container width
            // due to custom styling applied to itemsWrapper class of carousel
            // to show chevron icons (left and right)
            const items = getItems(props.containerWidth  - 80);
            setCarouselItem(items);
        }
    }, [props.containerWidth]);
    const gutter = props.expandable ? DEFAULT_CAROUSEL_GUTTER * 3 : DEFAULT_CAROUSEL_GUTTER;
    const scrollNext = () => {
        const activeIndex = Math.max(
            Math.min(
                activeItemIndex + noOfCarouselItem,
                Math.floor(props.items?.length - noOfCarouselItem / 2)
            ),
            Math.floor(noOfCarouselItem / 2) + 1
        );
        setActiveItemIndex(activeIndex);
    };
    const scrollPrev = () => {
        const activeIndex =  Math.max(
            Math.min(
                activeItemIndex - noOfCarouselItem,
                Math.floor(props.items?.length - noOfCarouselItem / 2) - 1
            ),
            Math.floor(noOfCarouselItem / 2)
        );
        setActiveItemIndex(activeIndex);
    };

    useEffect(() => {
        if (!props.expandable) {
            const index = findIndex(props.items, {id: props.currentContentId});
            setActiveItemIndex(index + 1);
        }
    }, [props.currentContentId]);

    const scroll = useCallback(
        (e) => {
            const y = e.deltaY;
            const current = sliderRef?.current;
            if (y > 0) {
                current && scrollNext();
            } else {
                current && scrollPrev();
            }
            e.preventDefault();
        },
        [sliderRef]
    );
    useEffect(() => {
        const [element] = document.getElementsByClassName('items-wrapper');
        element?.addEventListener("wheel", scroll);
        return () => {
            element?.addEventListener("wheel", scroll);
        };
    }, [scroll]);
    return (<Component
        {...props}
        ref={sliderRef}
        numberOfCards={noOfCarouselItem}
        requestToChangeActive={setActiveItemIndex}
        activeItemIndex={activeItemIndex}
        gutter={gutter}
    />);
};
