/*
 * Copyright 2019, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import expect from 'expect';
import React from 'react';
import ReactDOM from 'react-dom';
import ReactTestUtils from 'react-dom/test-utils';
import {createSink} from  'recompose';

import Toolbar from '../../../../misc/toolbar/Toolbar';
import withMapEnhancer, { withLocalMapState, withMapEditingAndLocalMapState, withToolbar, handleMapUpdate } from '../map';
import { Provider } from 'react-redux';
import { APPLY_TO_MAPS } from '../../../../../actions/geostory';
import {SectionTypes} from '../../../../../utils/GeoStoryUtils';

describe("geostory media map component enhancers", () => {
    beforeEach((done) => {
        document.body.innerHTML = '<div id="container"></div>';
        setTimeout(done);
    });
    afterEach((done) => {
        ReactDOM.unmountComponentAtNode(document.getElementById("container"));
        document.body.innerHTML = '';
        setTimeout(done);
    });
    it('withMapEnhancer generate correct props', (done) => {
        const resources = [{id: "1", type: "map", data: {id: "2", layers: [], context: "1"}}];
        const store = {
            subscribe: () => {}, getState: () => ({geostory: {currentStory: {resources}}})
        };
        const resourceId = "1";
        const Sink = withMapEnhancer(createSink( props => {
            expect(props).toBeTruthy();
            expect(props.map).toBeTruthy();
            expect(props.map).toEqual({id: "2", layers: [], groups: []});
            done();
        }));
        ReactDOM.render(<Provider store={store}><Sink resourceId={resourceId} map={{}}/></Provider>, document.getElementById("container"));
    });
    it('withMapEnhancer generate correct props for legacy geostory', (done) => {
        const resources = [{id: "1", type: "map", data: {id: "2", layers: [ {
            "visibility": true
        }, null], groups: [null, null, {
            "expanded": false
        }], context: "1"}}];
        const store = {
            subscribe: () => {}, getState: () => ({geostory: {currentStory: {resources}}})
        };
        const resourceId = "1";
        const Sink = withMapEnhancer(createSink( props => {
            expect(props).toBeTruthy();
            expect(props.map).toBeTruthy();
            expect(props.map).toEqual({id: "2", layers: [ {
                "visibility": true
            }, undefined], groups: [undefined, undefined, {
                "expanded": false
            }]});
            done();
        }));
        ReactDOM.render(<Provider store={store}><Sink resourceId={resourceId} map={{}}/></Provider>, document.getElementById("container"));
    });
    it('withLocalMapState generate correct props', (done) => {
        const Sink = withLocalMapState(createSink( props => {
            expect(props).toExist();
            expect(props.onMapViewLocalChanges).toExist();
            expect(props.map).toExist();
            expect(props.onMapViewLocalChanges).toBeA('function');
            expect(props.map).toEqual({});
            done();
        }));
        ReactDOM.render(<Sink map={{}}/>, document.getElementById("container"));

    });
    it('withMapEditingAndLocalMapState it correctly switch between geostory update and local map state', (done) => {
        const map = {center: {x: 0, y: 0}, zoom: 1};
        const actions = {
            update: () => {},
            onMapViewLocalChanges: () => {}
        };
        const spyUpdate = expect.spyOn(actions, 'update');
        const spyMapViewLocalChanges = expect.spyOn(actions, 'onMapViewLocalChanges');

        let SinkUpdate = withMapEditingAndLocalMapState(createSink(props => {
            expect(props).toExist();
            expect(props.onMapViewLocalChanges).toExist();
            expect(props.update).toExist();
            expect(props.onMapViewChanges).toExist();
            props.onMapViewChanges({center: {x: 1, y: 1}});
            expect(spyUpdate).toHaveBeenCalled();
            expect(spyMapViewLocalChanges).toNotHaveBeenCalled();
        }));

        ReactDOM.render(<SinkUpdate map={map} editMap update={actions.update} onMapViewLocalChanges={actions.onMapViewLocalChanges}/>, document.getElementById("container"));
        spyUpdate.reset();
        spyMapViewLocalChanges.reset();
        let SinkLocalChanges = withMapEditingAndLocalMapState(createSink(props => {
            expect(props).toExist();
            expect(props.onMapViewLocalChanges).toExist();
            expect(props.update).toExist();
            expect(props.onMapViewChanges).toExist();
            props.onMapViewChanges({center: {x: 1, y: 1}});
            expect(spyUpdate).toNotHaveBeenCalled();
            expect(spyMapViewLocalChanges).toHaveBeenCalled();
            done();
        }));

        ReactDOM.unmountComponentAtNode(document.getElementById("container"));
        ReactDOM.render(<SinkLocalChanges map={map} update={actions.update} onMapViewLocalChanges={actions.onMapViewLocalChanges}/>, document.getElementById("container"));
        spyUpdate.reset();
        spyMapViewLocalChanges.reset();

        SinkUpdate = withMapEditingAndLocalMapState(createSink(props => {
            expect(props).toExist();
            expect(props.onMapViewLocalChanges).toExist();
            expect(props.update).toExist();
            expect(props.onMapViewChanges).toExist();
            props.onMapViewChanges({center: {x: 2, y: 2}});
            expect(spyUpdate).toHaveBeenCalled();
            expect(spyMapViewLocalChanges).toNotHaveBeenCalled();
            done();
        }));
        ReactDOM.unmountComponentAtNode(document.getElementById("container"));
        ReactDOM.render(<SinkUpdate map={{...map, resetPanAndZoom: true}} editMap={false} update={actions.update} onMapViewLocalChanges={actions.onMapViewLocalChanges}/>, document.getElementById("container"));

    });

    it('withToolbar it correctly sets buttons', (done) => {

        const actions = {
            onReset: () => {},
            toggleAdvancedEditing: () => {}
        };

        const SpyOnReset = expect.spyOn(actions, 'onReset');
        const SpyToggleAdvancedEditing = expect.spyOn(actions, 'toggleAdvancedEditing');

        const Component = withToolbar(Toolbar);

        ReactDOM.render(<Component buttonItems={[{
            name: 'MapEditor',
            target: 'mapEditorToolbar',
            Component: () => <button onClick={actions.toggleAdvancedEditing} />
        }]} pendingChanges disableReset={false} {...actions}/>, document.getElementById("container"));

        const buttons = document.querySelectorAll("button");
        expect(buttons).toExist();
        expect(buttons.length).toBe(2);
        for (let btn of buttons) {
            ReactTestUtils.Simulate.click(btn);
        }
        const dialog = document.querySelector('[role="dialog"]');
        expect(dialog).toExist();

        const dialogButtons = dialog.querySelectorAll('.btn');
        expect(dialogButtons.length).toBe(2); // New dialog has 2 buttons

        ReactTestUtils.Simulate.click(dialogButtons[1]);
        expect(SpyOnReset).toHaveBeenCalled();
        expect(SpyToggleAdvancedEditing).toHaveBeenCalled();
        done();
    });

    it('handleMapUpdate provides onChangeMap, onApplyToMaps, and isCarouselSection props', (done) => {
        const focusedContentPath = 'sections[{"id":"s1"}].contents[{"id":"c1"}].background';
        const store = {
            subscribe: () => {},
            dispatch: () => {},
            getState: () => ({
                geostory: {
                    focusedContent: {
                        path: focusedContentPath
                    },
                    currentStory: {
                        sections: [
                            { id: 's1', type: SectionTypes.TITLE, contents: [] }
                        ]
                    }
                }
            })
        };

        const Sink = handleMapUpdate(createSink(props => {
            expect(props.onChangeMap).toBeA('function');
            expect(props.onApplyToMaps).toBeA('function');
            expect(props.isCarouselSection).toBe(false);
            done();
        }));

        ReactDOM.render(
            <Provider store={store}>
                <Sink
                    update={() => {}}
                    focusedContent={{ path: focusedContentPath }}
                />
            </Provider>,
            document.getElementById("container")
        );
    });

    it('handleMapUpdate sets isCarouselSection true for carousel sections', (done) => {
        const focusedContentPath = 'sections[{"id":"carousel1"}].contents[{"id":"c1"}].background';
        const store = {
            subscribe: () => {},
            dispatch: () => {},
            getState: () => ({
                geostory: {
                    focusedContent: {
                        path: focusedContentPath
                    },
                    currentStory: {
                        sections: [
                            { id: 'carousel1', type: SectionTypes.CAROUSEL, contents: [] }
                        ]
                    }
                }
            })
        };

        const Sink = handleMapUpdate(createSink(props => {
            expect(props.isCarouselSection).toBe(true);
            done();
        }));

        ReactDOM.render(
            <Provider store={store}>
                <Sink
                    update={() => {}}
                    focusedContent={{ path: focusedContentPath }}
                />
            </Provider>,
            document.getElementById("container")
        );
    });

    it('handleMapUpdate onApplyToMaps dispatches APPLY_TO_MAPS action', (done) => {
        const focusedContentPath = 'sections[{"id":"s1"}].contents[{"id":"c1"}].background';
        const store = {
            subscribe: () => {},
            dispatch: (action) => {
                if (action.type === APPLY_TO_MAPS) {
                    expect(action.property).toBe('center');
                    expect(action.value).toEqual({x: 1, y: 2});
                    expect(action.currentContentPath).toBe(focusedContentPath);
                    done();
                }
            },
            getState: () => ({
                geostory: {
                    focusedContent: {
                        path: focusedContentPath
                    },
                    currentStory: {
                        sections: [
                            { id: 's1', type: SectionTypes.TITLE, contents: [] }
                        ]
                    }
                }
            })
        };

        const Sink = handleMapUpdate(createSink(props => {
            props.onApplyToMaps('center', {x: 1, y: 2});
        }));

        ReactDOM.render(
            <Provider store={store}>
                <Sink
                    update={() => {}}
                    focusedContent={{ path: focusedContentPath }}
                />
            </Provider>,
            document.getElementById("container")
        );
    });

});


