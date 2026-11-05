/*
 * Copyright 2026, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
import React from 'react';
import ReactDOM from 'react-dom';
import expect from 'expect';

import layerVersionToWidget from '../layerVersionToWidget';

describe('layerVersionToWidget enhancer', () => {
    beforeEach((done) => {
        document.body.innerHTML = '<div id="container"></div>';
        setTimeout(done);
    });
    afterEach((done) => {
        ReactDOM.unmountComponentAtNode(document.getElementById("container"));
        document.body.innerHTML = '';
        setTimeout(done);
    });
    const render = (props) => {
        let received;
        const Sink = layerVersionToWidget((p) => {
            received = p;
            return null;
        });
        ReactDOM.render(<Sink {...props} />, document.getElementById("container"));
        return () => received;
    };
    it('adds the live _v_ to layer', () => {
        const get = render({ layer: { id: 'l1', name: 'a' }, autoRefreshLayers: [{ id: 'l1', _v_: 5 }] });
        expect(get().layer._v_).toBe(5);
        expect(get().layer.name).toBe('a');
    });
    it('adds the live _v_ to the layer of each trace', () => {
        const get = render({
            traces: [{ id: 't1', layer: { id: 'l1' } }, { id: 't2', layer: { id: 'l2', _v_: 1 } }],
            autoRefreshLayers: [{ id: 'l1', _v_: 5 }, { id: 'l2', _v_: 7 }]
        });
        expect(get().traces[0].layer._v_).toBe(5);
        expect(get().traces[1].layer._v_).toBe(7);
        expect(get().traces[1].id).toBe('t2');
    });
    it('keeps references when nothing changes', () => {
        const layer = { id: 'l1', _v_: 5 };
        const get = render({ layer, autoRefreshLayers: [{ id: 'l1', _v_: 5 }] });
        expect(get().layer).toBe(layer);
    });
    it('does not add layer or traces when missing and tolerates missing autoRefreshLayers', () => {
        const get = render({ other: 1 });
        expect('layer' in get()).toBe(false);
        expect('traces' in get()).toBe(false);
        expect(get().other).toBe(1);
    });
    it('updates when autoRefreshLayers change', () => {
        const layer = { id: 'l1' };
        let received;
        const Sink = layerVersionToWidget((p) => {
            received = p;
            return null;
        });
        const container = document.getElementById("container");
        ReactDOM.render(<Sink layer={layer} autoRefreshLayers={[{ id: 'l1', _v_: 1 }]} />, container);
        expect(received.layer._v_).toBe(1);
        ReactDOM.render(<Sink layer={layer} autoRefreshLayers={[{ id: 'l1', _v_: 2 }]} />, container);
        expect(received.layer._v_).toBe(2);
    });
});
