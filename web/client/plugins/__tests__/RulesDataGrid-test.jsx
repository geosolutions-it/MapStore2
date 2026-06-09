/*
 * Copyright 2025, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
import React from 'react';
import ReactDOM from 'react-dom';
import expect from 'expect';
import { act } from 'react-dom/test-utils';

import { getPluginForTest } from './pluginsTestUtils';
import RulesDataGrid from '../RulesDataGrid';

import ConfigUtils from '../../utils/ConfigUtils';

describe('RulesDataGridPlugin', () => {

    beforeEach(() => {
        document.body.innerHTML = '<div id="container"></div>';
    });

    afterEach(() => {
        ReactDOM.unmountComponentAtNode(document.getElementById('container'));
        document.body.innerHTML = '';
        ConfigUtils.removeConfigProp('geoFenceServiceType');

    });

    it('renders RulesDataGridPlugin with (non-standalone) geofence', () => {
        ConfigUtils.setConfigProp('geoFenceServiceType', "geoserver");

        const { Plugin } = getPluginForTest(RulesDataGrid, {
            rulesmanager: {
                activeGrid: 'rules'
            }
        });
        act(() => {
            ReactDOM.render(<Plugin />, document.getElementById('container'));
        });

        // In non-standalone mode, only RulesGrid is shown
        const container = document.querySelector('.rules-data-gird');
        expect(container).toExist();

        // Should not render tabs when geofence is not standalone
        const tabs = document.getElementById('rules-manager-tabs');
        expect(tabs).toNotExist();
    });

    it('renders with standalone GeoFence and shows Tabs', async() => {
        ConfigUtils.setConfigProp('geoFenceServiceType', "geofence");

        const { Plugin } = getPluginForTest(RulesDataGrid, {
            rulesmanager: {
                activeGrid: 'rules'
            }
        });
        const comp = ReactDOM.render(<Plugin />, document.getElementById('container'));
        await act(async() => comp);
        // Tabs should exist now
        const tabs = document.getElementById('rules-manager-tabs');
        expect(tabs).toExist();

        // The div container should exist
        const container = document.querySelector('.rules-data-gird');
        expect(container).toExist();
        // the columns names
        const columnsElems = container.querySelectorAll('.react-grid-HeaderRow .react-grid-HeaderCell .widget-HeaderCell__value span');
        expect(columnsElems.length).toBe(10);
        expect(columnsElems[0].innerHTML).toEqual('rulesmanager.gsInstance');
    });
    it('renders with standalone GeoFence and existing ipRange filter', async() => {
        ConfigUtils.setConfigProp('geoFenceServiceType', "geofence");
        const { Plugin } = getPluginForTest(RulesDataGrid, {
            rulesmanager: {
                activeGrid: 'rules'
            }
        });
        const comp = ReactDOM.render(<Plugin />, document.getElementById('container'));
        await act(async() => comp);

        // The div container should exist
        const container = document.querySelector('.rules-data-gird');
        expect(container).toExist();
        // the columns names
        const ipFilterElem = container.querySelectorAll('.react-grid-HeaderCell .autocompleteField .input-clearable input')[0];
        expect(ipFilterElem).toBeTruthy();
        expect(ipFilterElem.placeholder).toEqual('rulesmanager.placeholders.ipRange');
    });
});
