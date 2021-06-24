/*
 * Copyright 2021, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
import React, {useState, useEffect, createRef, useCallback} from "react";
import findIndex from 'lodash/findIndex';
const DEFAULT_CAROUSEL_ITEMS = 8;
const DEFAULT_CAROUSEL_GUTTER = 12;

export default (Component) => (props) => {
    const [activeItemIndex, setActiveItemIndex] = useState(0);
    const noOfCarouselItem = props.expandable ? DEFAULT_CAROUSEL_ITEMS / 4
        : props.editable ? DEFAULT_CAROUSEL_ITEMS : DEFAULT_CAROUSEL_ITEMS + 4;
    const gutter = props.expandable ? DEFAULT_CAROUSEL_GUTTER * 3 : DEFAULT_CAROUSEL_GUTTER;

    const scrollNext = () => {
        const activeIndex = Math.max(
            Math.min(
                activeItemIndex + DEFAULT_CAROUSEL_ITEMS,
                Math.floor(props.items?.length - DEFAULT_CAROUSEL_ITEMS / 2)
            ),
            Math.floor(DEFAULT_CAROUSEL_ITEMS / 2) + 1
        );
        setActiveItemIndex(activeIndex);
    };
    const scrollPrev = () => {
        const activeIndex =  Math.max(
            Math.min(
                activeItemIndex - DEFAULT_CAROUSEL_ITEMS,
                Math.floor(props.items?.length - DEFAULT_CAROUSEL_ITEMS / 2) - 1
            ),
            Math.floor(DEFAULT_CAROUSEL_ITEMS / 2)
        );
        setActiveItemIndex(activeIndex);
    };

    useEffect(() => {
        if (!props.expandable) {
            const index = findIndex(props.items, {id: props.currentContentId});
            index < noOfCarouselItem ? scrollPrev() : scrollNext();
        }
    }, [props.currentContentId]);

    const sliderRef = createRef();
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
        // slidesToScroll={noOfCarouselItem}
        requestToChangeActive={setActiveItemIndex}
        activeItemIndex={activeItemIndex}
        gutter={gutter}
    />);
};
