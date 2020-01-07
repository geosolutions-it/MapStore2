/*
 * Copyright 2020, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
import expect from 'expect';
import { cleanResource } from '../DashboardUtils';
import dashboardQuickFiltersResource from '../../test-resources/widgets/dashboard_quick_filters';

describe('DashboardUtils', () => {

    it('cleanResource', () => {
        expect(dashboardQuickFiltersResource.data.widgets[0].quickFilters).toExist();
        const resourceClean = cleanResource(dashboardQuickFiltersResource);
        expect(resourceClean.data.widgets[0].quickFilters).toNotExist();
    });
});
