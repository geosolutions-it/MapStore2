/*
 * Copyright 2018, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

const expect = require('expect');

const { getConnectionList, getWidgetsGroups } = require('../WidgetsUtils');

const {widgets} = require('json-loader!../../test-resources/widgets/widgets1.json');
const { widgets: complexGraphWidgets } = require('json-loader!../../test-resources/widgets/complex_graph.json');
describe('Test WidgetsUtils', () => {
    it('test getConnectionList', () => {
        const pairs = getConnectionList(widgets);
        expect(pairs).toExist();
        expect(pairs.length).toBe(2);
        pairs.map(p => {
            expect(p.length).toBe(2);
            if (p[0] === "ec974c50-37ef-11e8-a12b-f182297314df" ) {
                expect(p[1]).toBe("e448d550-37ef-11e8-a12b-f182297314df");
            }
            if (p[0] === "1ac5f5e0-37f0-11e8-a12b-f182297314df") {
                expect(p[1]).toBe("132746e0-37f0-11e8-a12b-f182297314df");
            }
        });
        const complexGraphPairs = getConnectionList(complexGraphWidgets);
        // verify that connections without mapSync=true are not taken into account
        expect(complexGraphPairs.length).toBe(4);
    });
    it('test getWidgetsGroups', () => {
        const groups = getWidgetsGroups(widgets);
        expect(groups[0].widgets[0]).toBe("ec974c50-37ef-11e8-a12b-f182297314df");
        expect(groups[0].widgets[1]).toBe("e448d550-37ef-11e8-a12b-f182297314df");
        expect(groups[0].color !== groups[1].color).toBe(true);
        expect(groups[1].widgets[0]).toBe("1ac5f5e0-37f0-11e8-a12b-f182297314df");
        expect(groups[1].widgets[1]).toBe("132746e0-37f0-11e8-a12b-f182297314df");
        expect(groups.length).toBe(2);
        expect(groups[0].color !== groups[1].color).toBe(true);
        groups.map(g => expect(g.widgets.length).toBe(2));
        const complexChartGroups = getWidgetsGroups(complexGraphWidgets);
        // verify that connections without mapSync=true are not taken into account
        expect(complexChartGroups.length).toBe(2);
        expect(complexChartGroups[0].widgets.length).toBe(3);
        expect(complexChartGroups[1].widgets.length).toBe(2);
    });
});
