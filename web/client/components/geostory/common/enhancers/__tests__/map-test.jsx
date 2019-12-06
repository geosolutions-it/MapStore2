/*
 * Copyright 2019, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
import React from 'react';
import ReactTestUtils from 'react-dom/test-utils';
import ReactDOM from 'react-dom';

import Toolbar from '../../../../misc/toolbar/Toolbar';

import expect from 'expect';
import {createSink} from  'recompose';

import {withLocalMapState, withMapEditingAndLocalMapState, withToolbar} from '../map';


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

        const SinkUpdate = withMapEditingAndLocalMapState(createSink(props => {
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
        const SinkLocalChanges = withMapEditingAndLocalMapState(createSink(props => {
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


    });

    it('withToolbar it correctly sets buttons', (done) => {

        const actions = {
            toggleEditing: () => {},
            onReset: () => {},
            toggleAdvancedEditing: () => {}
        };

        const SpyToggleEditing = expect.spyOn(actions, 'toggleEditing');
        const SpyOnReset = expect.spyOn(actions, 'onReset');
        const SpyToggleAdvancedEditing = expect.spyOn(actions, 'toggleAdvancedEditing');

        const Component = withToolbar(Toolbar);

        ReactDOM.render(<Component pendingChanges disableReset={false} {...actions}/>, document.getElementById("container"));

        const buttons = document.querySelectorAll("button");
        expect(buttons).toExist();
        expect(buttons.length).toBe(3);
        for (let btn of buttons) {
            ReactTestUtils.Simulate.click(btn);
        }
        const confirmButtons = document.querySelectorAll(".with-confirm-modal button");
        expect(confirmButtons).toExist();
        expect(confirmButtons.length).toBe(3);
        ReactTestUtils.Simulate.click(confirmButtons[1]);
        expect(SpyToggleEditing).toHaveBeenCalled();
        expect(SpyOnReset).toHaveBeenCalled();
        expect(SpyToggleAdvancedEditing).toHaveBeenCalled();
        done();
    });

});


