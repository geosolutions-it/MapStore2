/*
 * Copyright 2026, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
*/

import expect from "expect";
import {
    APPLY_FILTER_WIDGET_INTERACTIONS,
    ZOOM_TO_FILTER_EXTENT,
    applyFilterWidgetInteractions,
    zoomToFilterExtent
} from '../interactions';

describe('interactions actions', () => {
    it('applyFilterWidgetInteractions default target', () => {
        const retval = applyFilterWidgetInteractions('myWidgetId', undefined, 'myFilterId');
        expect(retval).toExist();
        expect(retval.type).toBe(APPLY_FILTER_WIDGET_INTERACTIONS);
        expect(retval.widgetId).toBe('myWidgetId');
        expect(retval.target).toBe('floating');
        expect(retval.filterId).toBe('myFilterId');
    });

    it('applyFilterWidgetInteractions with specific target', () => {
        const retval = applyFilterWidgetInteractions('myWidgetId', 'specificTarget', 'myFilterId');
        expect(retval).toExist();
        expect(retval.type).toBe(APPLY_FILTER_WIDGET_INTERACTIONS);
        expect(retval.widgetId).toBe('myWidgetId');
        expect(retval.target).toBe('specificTarget');
        expect(retval.filterId).toBe('myFilterId');
    });

    it('zoomToFilterExtent default target', () => {
        const retval = zoomToFilterExtent('myWidgetId', undefined, 'myFilterId');
        expect(retval).toExist();
        expect(retval.type).toBe(ZOOM_TO_FILTER_EXTENT);
        expect(retval.widgetId).toBe('myWidgetId');
        expect(retval.target).toBe('floating');
        expect(retval.filterId).toBe('myFilterId');
    });

    it('zoomToFilterExtent with specific target', () => {
        const retval = zoomToFilterExtent('myWidgetId', 'specificTarget', 'myFilterId');
        expect(retval).toExist();
        expect(retval.type).toBe(ZOOM_TO_FILTER_EXTENT);
        expect(retval.widgetId).toBe('myWidgetId');
        expect(retval.target).toBe('specificTarget');
        expect(retval.filterId).toBe('myFilterId');
    });
});
