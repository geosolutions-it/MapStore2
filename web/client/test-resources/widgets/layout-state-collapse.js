/*
 * Copyright 2018, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

/**
 * Test data to try collapse/expand functionalities of the widgets.
 */


/**
 * This initial state contains 3 widgets, the 3rd is locked
 */
const initialState = {
    containers: {
        floating: {
            widgets: [
                {
                    id: 'a7122cc0-f7a9-11e8-8602-03b7e0c9537b',
                    widgetType: 'text',
                    title: 'Test 1',
                    dataGrid: {
                        y: 0,
                        x: 0,
                        w: 1,
                        h: 1
                    }
                },
                {
                    id: 'ac435e30-f7a9-11e8-8602-03b7e0c9537b',
                    widgetType: 'text',
                    title: 'test 2',
                    dataGrid: {
                        y: 0,
                        x: 0,
                        w: 1,
                        h: 1
                    }
                },
                {
                    id: 'b1786030-f7a9-11e8-8602-03b7e0c9537b',
                    widgetType: 'text',
                    title: 'locked',
                    dataGrid: {
                        y: 0,
                        x: 0,
                        w: 1,
                        h: 1,
                        'static': true
                    }
                }
            ],
            layouts: {
                md: [
                    {
                        w: 1,
                        h: 1,
                        x: 4,
                        y: 2,
                        i: 'a7122cc0-f7a9-11e8-8602-03b7e0c9537b',
                        moved: false,
                        'static': false
                    },
                    {
                        w: 1,
                        h: 1,
                        x: 5,
                        y: 2,
                        i: 'ac435e30-f7a9-11e8-8602-03b7e0c9537b',
                        moved: false,
                        'static': false
                    },
                    {
                        w: 1,
                        h: 1,
                        x: 5,
                        y: 3,
                        i: 'b1786030-f7a9-11e8-8602-03b7e0c9537b',
                        moved: false,
                        'static': true
                    }
                ]
            },
            layout: [
                {
                    w: 1,
                    h: 1,
                    x: 4,
                    y: 2,
                    i: 'a7122cc0-f7a9-11e8-8602-03b7e0c9537b',
                    moved: false,
                    'static': false
                },
                {
                    w: 1,
                    h: 1,
                    x: 5,
                    y: 2,
                    i: 'ac435e30-f7a9-11e8-8602-03b7e0c9537b',
                    moved: false,
                    'static': false
                },
                {
                    w: 1,
                    h: 1,
                    x: 5,
                    y: 3,
                    i: 'b1786030-f7a9-11e8-8602-03b7e0c9537b',
                    moved: false,
                    'static': true
                }
            ]
        }
    }
};
const changeLayoutAction = {
    type: 'WIDGETS:CHANGE_LAYOUT',
    allLayouts: {
        md: [
            {
                w: 1,
                h: 1,
                x: 5,
                y: 2,
                i: 'ac435e30-f7a9-11e8-8602-03b7e0c9537b',
                moved: false,
                'static': false
            },
            {
                w: 1,
                h: 1,
                x: 5,
                y: 3,
                i: 'b1786030-f7a9-11e8-8602-03b7e0c9537b',
                moved: false,
                'static': true
            }
        ]
    },
    layout: [
        {
            w: 1,
            h: 1,
            x: 5,
            y: 2,
            i: 'ac435e30-f7a9-11e8-8602-03b7e0c9537b',
            moved: false,
            'static': false
        },
        {
            w: 1,
            h: 1,
            x: 5,
            y: 3,
            i: 'b1786030-f7a9-11e8-8602-03b7e0c9537b',
            moved: false,
            'static': true
        }
    ],
    target: 'floating'
};

const initialStateWithLayers = {
    containers: {
        floating: {
            widgets: [
                {
                    id: 'a7122cc0-f7a9-11e8-8602-03b7e0c9537b',
                    widgetType: 'text',
                    title: 'Test 1',
                    map: {
                        layers: [{
                            id: "layer1",
                            params: {CQL_FILTER: "some cql"}
                        }],
                        zoom: 2
                    },
                    dataGrid: {
                        y: 0,
                        x: 0,
                        w: 1,
                        h: 1
                    }
                }]
        }
    }
};
module.exports = {
    initialState,
    initialStateWithLayers,
    changeLayoutAction
};
