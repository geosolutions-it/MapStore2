/*
 * Copyright 2017, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import expect from 'expect';
import React from 'react';
import ReactDOM from 'react-dom';
import {createSink} from 'recompose';
import {Provider} from 'react-redux';
import configureMockStore from 'redux-mock-store';

import tableWidget from '../tableWidget';

const mockStore = configureMockStore();

describe('widgets tableWidget enhancer', () => {
    let store;
    beforeEach((done) => {
        store = mockStore();
        document.body.innerHTML = '<div id="container"></div>';
        setTimeout(done);
    });
    afterEach((done) => {
        ReactDOM.unmountComponentAtNode(document.getElementById("container"));
        document.body.innerHTML = '';
        setTimeout(done);
    });
    it('tableWidget onAddFilter', (done) => {
        const someFilter = { attribute: "state"};
        const Sink = tableWidget(createSink( props => {
            expect(props).toExist();
            expect(props.gridEvents).toExist();
            expect(props.gridEvents.onAddFilter).toExist();
            expect(props.gridEvents.onColumnResize).toExist();

            props.gridEvents.onAddFilter(someFilter);
            done();
        }));
        ReactDOM.render( <Provider store={store}><Sink updateProperty={(path, filter) => {
            expect(path).toBe("quickFilters.state");
            expect(filter).toBe(someFilter);
        }}/></Provider>, document.getElementById("container"));
    });

    it('tableWidget with gridTools including zoom icon for dashboard viewer [enable zoom in config]', (done) => {
        const Sink = tableWidget(createSink( props => {
            expect(props).toExist();
            expect(props.gridTools.length).toEqual(1);
            props.gridTools[0].events.onClick(
                {
                    bbox: [-10, 0, 0, -10]
                }, {}, "", { crs: "", maxZoom: null }
            );
            done();
        }));
        ReactDOM.render( <Provider store={store}><Sink enableZoomInTblWidget ={"true"} id="123456" mapSync={"true"} widgetType={"table"} isDashboardWidget updateProperty={(id, path, value) => {
            expect(path).toBe("dependencies.extentObj");
            expect(id).toBe("123456");
            expect(value).toEqual({
                bbox: [-10, 0, 0, -10]
            }, { crs: "EPSG:4326", maxZoom: null });
        }}/></Provider>, document.getElementById("container"));
        const container = document.getElementById('container');
        expect(container).toExist();

    });
    it('tableWidget with gridTools including zoom icon for dashboard viewer in case of just table is added [No maps added]', (done) => {
        const Sink = tableWidget(createSink( props => {
            expect(props).toExist();
            expect(props.gridTools.length).toEqual(0);
            done();
        }));
        ReactDOM.render( <Provider store={store}><Sink enableZoomInTblWidget={"true"} id="123456" mapSync={false} widgetType={"table"} isDashboardWidget updateProperty={() => {}} /></Provider>, document.getElementById("container"));
        const container = document.getElementById('container');
        expect(container).toExist();

    });
    it('tableWidget with gridTools including zoom icon for dashboard viewer [not enable zoom in config]', (done) => {
        const Sink = tableWidget(createSink( props => {
            expect(props).toExist();
            expect(props.gridTools.length).toEqual(0);
            done();
        }));
        ReactDOM.render( <Provider store={store}><Sink enableZoomInTblWidget={false} id="123456" mapSync={"true"} widgetType={"table"} isDashboardWidget updateProperty={() => {}}/></Provider>, document.getElementById("container"));
        const container = document.getElementById('container');
        expect(container).toExist();

    });

    it('tableWidget with gridTools including zoom icon for dashboard viewer in case multiple maps connected to a parent table', (done) => {
        let widgets = [
            {
                widgetType: "table", id: "123456", mapSync: true
            }, {
                widgetType: 'map', id: "connectedMapID1", mapSync: true, dependenciesMap: {
                    mapSync: "123456"
                }
            },
            {
                widgetType: 'map', id: "connectedMapID2", mapSync: true, dependenciesMap: {
                    mapSync: "123456"
                }
            }, {
                widgetType: 'map', id: "notConnectedMapID"
            }
        ];
        const Sink = tableWidget(createSink( props => {
            expect(props).toExist();
            expect(props.gridTools.length).toEqual(1);
            props.gridTools[0].events.onClick(
                {
                    bbox: [-10, 0, 0, -10]
                }, {}, "", { crs: "", maxZoom: null }
            );
            expect(props.widgets.length).toEqual(4);
            let mapWidgetsConnectedWithTbl = props.widgets.filter(i=>i.widgetType === 'map' && i?.dependenciesMap && i?.dependenciesMap?.mapSync?.includes(props.id) && i.mapSync) || [];
            expect(mapWidgetsConnectedWithTbl.length).toEqual(2);
            done();
        }));
        ReactDOM.render( <Provider store={store}><Sink enableZoomInTblWidget={"true"} widgets={widgets} id="123456" mapSync={"true"} widgetType={"table"} isDashboardWidget updateProperty={(id, path, value) => {
            expect(path).toBe("dependencies.extentObj");
            expect(id).toBe("123456");
            expect(value).toEqual({
                bbox: [-10, 0, 0, -10]
            }, { crs: "EPSG:4326", maxZoom: null });
        }}/></Provider>, document.getElementById("container"));
        const container = document.getElementById('container');
        expect(container).toExist();

    });
    it('tableWidget with gridTools including zoom icon for dashboard viewer in case no connected map', (done) => {
        let widgets = [
            {
                widgetType: "table", id: "123456", mapSync: false
            }, {
                widgetType: 'map', id: "notConnectedMapID"
            }
        ];
        const Sink = tableWidget(createSink( props => {
            expect(props).toExist();
            expect(props.gridTools.length).toEqual(0);
            expect(props.widgets.length).toEqual(2);
            let mapWidgetsConnectedWithTbl = props.widgets.filter(i=>i.widgetType === 'map' && i?.dependenciesMap && i?.dependenciesMap?.mapSync?.includes(props.id) && i.mapSync) || [];
            expect(mapWidgetsConnectedWithTbl.length).toEqual(0);
            done();
        }));
        ReactDOM.render( <Provider store={store}><Sink enableZoomInTblWidget={"true"} widgets={widgets} id="123456" mapSync={false} widgetType={"table"} isDashboardWidget updateProperty={() => {}}/></Provider>, document.getElementById("container"));
        const container = document.getElementById('container');
        expect(container).toExist();

    });
    it('tableWidget with gridTools including zoom icon for mapViewer [enable zoom in config]', (done) => {
        const Sink = tableWidget(createSink( props => {
            expect(props).toExist();
            expect(props.gridTools.length).toEqual(1);
            props.gridTools[0].events.onClick(
                {
                    bbox: [-10, 0, 0, -10]
                }, {}, "", { crs: "", maxZoom: null }
            );
            done();
        }));
        ReactDOM.render( <Provider store={store}><Sink enableZoomInTblWidget={"true"} id="123456" widgetType={"table"} updateProperty={(id, path, value) => {
            expect(path).toBe("dependencies.extentObj");
            expect(id).toBe("123456");
            expect(value).toEqual({
                bbox: [-10, 0, 0, -10]
            }, { crs: "EPSG:4326", maxZoom: null });
        }} /></Provider>, document.getElementById("container"));
        const container = document.getElementById('container');
        expect(container).toExist();

    });
    it('tableWidget with gridTools including zoom icon for mapViewer [not enable zoom in config]', (done) => {
        const Sink = tableWidget(createSink( props => {
            expect(props).toExist();
            expect(props.gridTools.length).toEqual(0);
            done();
        }));
        ReactDOM.render( <Provider store={store}><Sink enableZoomInTblWidget={false} id="123456" widgetType={"table"} /></Provider>, document.getElementById("container"));
        const container = document.getElementById('container');
        expect(container).toExist();

    });
});
