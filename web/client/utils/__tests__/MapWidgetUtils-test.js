/*
 * Copyright 2026, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
*/
import expect from 'expect';
import {
    isElementVisible,
    elementsOverlap,
    getVisibleOverlappingWidgetElements,
    getWidgetPadding,
    resolveZoomToExtentPadding,
    WIDGET_CARD_SELECTOR
} from '../MapWidgetUtils';

describe('MapWidgetUtils', () => {
    describe('isElementVisible', () => {
        it('returns false for null element', () => {
            expect(isElementVisible(null)).toBe(false);
        });

        it('returns false for element without getBoundingClientRect', () => {
            expect(isElementVisible({})).toBe(false);
        });

        it('returns false when width or height is 0', () => {
            expect(isElementVisible({
                getBoundingClientRect: () => ({ width: 0, height: 100 })
            })).toBe(false);
            expect(isElementVisible({
                getBoundingClientRect: () => ({ width: 100, height: 0 })
            })).toBe(false);
        });

        it('returns true when visible and dimensions are > 0', () => {
            const el = document.createElement('div');
            el.style.display = 'block';
            el.style.visibility = 'visible';
            el.style.opacity = '1';
            document.body.appendChild(el);

            // Mock getBoundingClientRect
            el.getBoundingClientRect = () => ({ width: 100, height: 100 });
            expect(isElementVisible(el)).toBe(true);
            document.body.removeChild(el);
        });
    });

    describe('elementsOverlap', () => {
        it('returns true when elements overlap', () => {
            const a = { left: 0, right: 100, top: 0, bottom: 100 };
            const b = { left: 50, right: 150, top: 50, bottom: 150 };
            expect(elementsOverlap(a, b)).toBe(true);
        });

        it('returns false when elements do not overlap', () => {
            const a = { left: 0, right: 100, top: 0, bottom: 100 };
            const b = { left: 100, right: 200, top: 100, bottom: 200 };
            expect(elementsOverlap(a, b)).toBe(false);
        });
    });

    describe('getVisibleOverlappingWidgetElements', () => {
        it('returns empty array when mapContainer is null', () => {
            expect(getVisibleOverlappingWidgetElements(null)).toEqual([]);
        });

        it('returns overlapping widget elements', () => {
            const mapContainer = {
                getBoundingClientRect: () => ({ left: 0, right: 1000, top: 0, bottom: 1000, width: 1000, height: 1000 })
            };
            const widget1 = document.createElement('div');
            widget1.setAttribute('data-widget-card', 'true');
            widget1.style.display = 'block';
            widget1.style.visibility = 'visible';
            widget1.style.opacity = '1';
            widget1.getBoundingClientRect = () => ({ left: 500, right: 800, top: 500, bottom: 800, width: 300, height: 300 });
            widget1.contains = () => false;

            const doc = {
                querySelectorAll: (selector) => {
                    if (selector === WIDGET_CARD_SELECTOR) return [widget1];
                    return [];
                }
            };

            window.getComputedStyle = () => ({ display: 'block', visibility: 'visible', opacity: '1' });

            const widgets = getVisibleOverlappingWidgetElements(mapContainer, doc);
            expect(widgets.length).toBe(1);
            expect(widgets[0]).toBe(widget1);
        });
    });

    describe('getWidgetPadding', () => {
        it('returns [0, 0, 0, 0] when no widgets overlap', () => {
            const mapContainer = {
                getBoundingClientRect: () => ({ left: 0, right: 1000, top: 0, bottom: 1000, width: 1000, height: 1000 })
            };
            const doc = {
                querySelectorAll: () => []
            };
            expect(getWidgetPadding(mapContainer, doc)).toEqual({ top: 0, right: 0, bottom: 0, left: 0 });
        });

        it('calculates padding for a widget on the left', () => {
            const mapContainer = {
                getBoundingClientRect: () => ({ left: 0, right: 1000, top: 0, bottom: 1000, width: 1000, height: 1000 })
            };
            const widget1 = {
                getBoundingClientRect: () => ({ left: 0, right: 300, top: 0, bottom: 1000, width: 300, height: 1000 }),
                contains: () => false
            };
            const doc = {
                querySelectorAll: () => [widget1]
            };

            window.getComputedStyle = () => ({ display: 'block', visibility: 'visible', opacity: '1' });

            const padding = getWidgetPadding(mapContainer, doc);
            expect(padding).toEqual({ top: 0, right: 0, bottom: 0, left: 300 });
        });

        it('calculates padding for a widget on the right', () => {
            const mapContainer = {
                getBoundingClientRect: () => ({ left: 0, right: 1000, top: 0, bottom: 1000, width: 1000, height: 1000 })
            };
            const widget1 = {
                getBoundingClientRect: () => ({ left: 700, right: 1000, top: 0, bottom: 1000, width: 300, height: 1000 }),
                contains: () => false
            };
            const doc = {
                querySelectorAll: () => [widget1]
            };

            window.getComputedStyle = () => ({ display: 'block', visibility: 'visible', opacity: '1' });

            const padding = getWidgetPadding(mapContainer, doc);
            expect(padding).toEqual({ top: 0, right: 300, bottom: 0, left: 0 });
        });

        it('returns [0, 0, 0, 0] when map is completely covered', () => {
            const mapContainer = {
                getBoundingClientRect: () => ({ left: 0, right: 1000, top: 0, bottom: 1000, width: 1000, height: 1000 })
            };
            const widget1 = {
                getBoundingClientRect: () => ({ left: -10, right: 1010, top: -10, bottom: 1010, width: 1020, height: 1020 }),
                contains: () => false
            };
            const doc = {
                querySelectorAll: () => [widget1]
            };

            window.getComputedStyle = () => ({ display: 'block', visibility: 'visible', opacity: '1' });

            const padding = getWidgetPadding(mapContainer, doc);
            expect(padding).toEqual({ top: 0, right: 0, bottom: 0, left: 0 });
        });
    });

    describe('resolveZoomToExtentPadding', () => {
        it('merges layoutPadding and widgetPadding taking the max of each', () => {
            const mapContainer = {
                getBoundingClientRect: () => ({ left: 0, right: 1000, top: 0, bottom: 1000, width: 1000, height: 1000 })
            };
            const widget1 = {
                getBoundingClientRect: () => ({ left: 700, right: 1000, top: 0, bottom: 1000, width: 300, height: 1000 }),
                contains: () => false
            };
            const doc = {
                querySelectorAll: () => [widget1]
            };

            window.getComputedStyle = () => ({ display: 'block', visibility: 'visible', opacity: '1' });

            const layoutPadding = { top: 50, right: 10, bottom: 20, left: 100 };

            const padding = resolveZoomToExtentPadding(mapContainer, layoutPadding, doc);
            // widget padding is { top: 0, right: 300, bottom: 0, left: 0 }
            // layout padding is { top: 50, right: 10, bottom: 20, left: 100 }
            // Expected max: { top: 50, right: 300, bottom: 20, left: 100 }
            expect(padding).toEqual({ top: 50, right: 300, bottom: 20, left: 100 });
        });
    });
});
