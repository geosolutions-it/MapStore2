/*
 * Copyright 2026, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
export const WIDGET_CARD_SELECTOR = '[data-widget-card]';

/**
 * Returns true when the element is rendered and visible in the DOM.
 * @param {HTMLElement} element
 * @returns {boolean}
 */
export const isElementVisible = (element) => {
    if (!element || typeof element.getBoundingClientRect !== 'function') {
        return false;
    }
    const rect = element.getBoundingClientRect();
    if (rect.width <= 0 || rect.height <= 0) {
        return false;
    }
    const style = window.getComputedStyle(element);
    if (style.display === 'none' || style.visibility === 'hidden' || parseFloat(style.opacity) === 0) {
        return false;
    }
    return true;
};

/**
 * Returns true when two bounding rectangles overlap.
 * @param {DOMRect} a
 * @param {DOMRect} b
 * @returns {boolean}
 */
export const elementsOverlap = (a, b) =>
    a.left < b.right && a.right > b.left && a.top < b.bottom && a.bottom > b.top;

/**
 * Collect visible widget cards overlapping the map container, excluding the
 * widget card that contains the map itself.
 * @param {HTMLElement} mapContainer
 * @param {Document} doc
 * @returns {HTMLElement[]}
 */
export const getVisibleOverlappingWidgetElements = (mapContainer, doc = document) => {
    if (!mapContainer || typeof mapContainer.getBoundingClientRect !== 'function') {
        return [];
    }
    return Array.from(doc.querySelectorAll(WIDGET_CARD_SELECTOR))
        .filter((element) => !element.contains(mapContainer))
        .filter(isElementVisible);
};

/**
 * Compute dynamic padding from visible widgets obstructing the map.
 * Returns the best {top, right, bottom, left} padding by finding the largest
 * rectangle free of widget cards.
 * @param {HTMLElement} mapContainer
 * @param {Document} doc
 * @returns {{top: number, right: number, bottom: number, left: number}}
 */
export const getWidgetPadding = (mapContainer, doc = document) => {
    const widgets = getVisibleOverlappingWidgetElements(mapContainer, doc);
    if (!widgets.length) {
        return { top: 0, right: 0, bottom: 0, left: 0 };
    }
    const mapRect = mapContainer.getBoundingClientRect();

    let regions = [{
        left: mapRect.left,
        right: mapRect.right,
        top: mapRect.top,
        bottom: mapRect.bottom,
        width: mapRect.width,
        height: mapRect.height
    }];

    widgets.forEach(widget => {
        const widgetRect = widget.getBoundingClientRect();
        const nextRegions = [];

        regions.forEach(region => {
            if (elementsOverlap(region, widgetRect)) {
                if (widgetRect.left > region.left) {
                    nextRegions.push({ ...region, right: widgetRect.left, width: widgetRect.left - region.left });
                }
                if (widgetRect.right < region.right) {
                    nextRegions.push({ ...region, left: widgetRect.right, width: region.right - widgetRect.right });
                }
                if (widgetRect.top > region.top) {
                    nextRegions.push({ ...region, bottom: widgetRect.top, height: widgetRect.top - region.top });
                }
                if (widgetRect.bottom < region.bottom) {
                    nextRegions.push({ ...region, top: widgetRect.bottom, height: region.bottom - widgetRect.bottom });
                }
            } else {
                nextRegions.push(region);
            }
        });

        const filteredRegions = [];
        nextRegions.forEach((nextRegion, i) => {
            let isCovered = false;
            for (let j = 0; j < nextRegions.length; j++) {
                if (i !== j) {
                    const otherRegion = nextRegions[j];
                    if (
                        nextRegion.left >= otherRegion.left
                        && nextRegion.right <= otherRegion.right
                        && nextRegion.top >= otherRegion.top
                        && nextRegion.bottom <= otherRegion.bottom
                    ) {
                        isCovered = true;
                        break;
                    }
                }
            }
            if (!isCovered) {
                filteredRegions.push(nextRegion);
            }
        });
        regions = filteredRegions;
    });

    let largestRegion = null;
    let maxArea = -1;

    regions.forEach(region => {
        const area = region.width * region.height;
        if (area > maxArea) {
            maxArea = area;
            largestRegion = region;
        }
    });

    if (!largestRegion || maxArea <= 0) {
        return { top: 0, right: 0, bottom: 0, left: 0 };
    }

    return {
        top: Math.max(0, Math.round(largestRegion.top - mapRect.top)),
        right: Math.max(0, Math.round(mapRect.right - largestRegion.right)),
        bottom: Math.max(0, Math.round(mapRect.bottom - largestRegion.bottom)),
        left: Math.max(0, Math.round(largestRegion.left - mapRect.left))
    };
};

/**
 * Resolve padding for map fit/zoom operations.
 * Applies layout and widget padding to determine best zoom bounds.
 * @param {HTMLElement} mapContainer
 * @param {object} layoutPadding padding from map layout selectors (top/bottom)
 * @param {Document} doc
 * @returns {{top: number, right: number, bottom: number, left: number}}
 */
export const resolveZoomToExtentPadding = (mapContainer, layoutPadding, doc = document) => {
    const widgetPadding = getWidgetPadding(mapContainer, doc);
    return {
        top: Math.max(layoutPadding?.top || 0, widgetPadding.top),
        bottom: Math.max(layoutPadding?.bottom || 0, widgetPadding.bottom),
        left: Math.max(layoutPadding?.left || 0, widgetPadding.left),
        right: Math.max(layoutPadding?.right || 0, widgetPadding.right)
    };
};
