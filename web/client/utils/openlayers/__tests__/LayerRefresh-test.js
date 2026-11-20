/*
 * Copyright 2026, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import expect from 'expect';
import VectorSource from 'ol/source/Vector';
import VectorLayer from 'ol/layer/Vector';
import Feature from 'ol/Feature';
import { get as getProjection } from 'ol/proj';
import { refreshVectorLayer, cancelVectorLayerRefresh, bindVectorSourceEvents } from '../LayerRefresh';

const map = { getSize: () => [100, 100], getView: () => ({
    calculateExtent: () => [0, 0, 100, 100], getResolution: () => 1, getProjection: () => getProjection('EPSG:3857')
}) };
const makeLayer = () => new VectorLayer({ source: new VectorSource({ features: [new Feature({ name: 'old' })] }) });
const replacement = () => {
    let finish;
    let fail;
    const source = new VectorSource({ loader: (extent, resolution, projection, success, failure) => {
        finish = () => { const features = [new Feature({ name: 'new' })]; source.addFeatures(features); success(features); };
        fail = failure;
    } });
    return { layer: new VectorLayer({ source }), source, finish: () => finish(), fail: () => fail() };
};

describe('OpenLayers vector refresh', () => {
    it('keeps displayed features until replacement data is ready', done => {
        const layer = makeLayer();
        const old = layer.getSource();
        const next = replacement();
        expect(refreshVectorLayer(layer, () => next.layer, map)).toBe(true);
        expect(layer.getSource()).toBe(old);
        expect(old.getFeatures()[0].get('name')).toBe('old');
        next.finish();
        Promise.resolve().then(() => {
            expect(layer.getSource()).toBe(next.source);
            expect(layer.getSource().getFeatures()[0].get('name')).toBe('new');
        }).then(() => done(), done);
    });
    it('retains displayed data on a failed refresh', done => {
        const layer = makeLayer();
        const old = layer.getSource();
        const next = replacement();
        refreshVectorLayer(layer, () => next.layer, map);
        next.fail();
        Promise.resolve().then(() => expect(layer.getSource()).toBe(old)).then(() => done(), done);
    });
    it('ignores stale responses and cancelled refreshes', done => {
        const layer = makeLayer();
        const old = layer.getSource();
        const first = replacement();
        const second = replacement();
        refreshVectorLayer(layer, () => first.layer, map);
        first.finish();
        refreshVectorLayer(layer, () => second.layer, map);
        cancelVectorLayerRefresh(layer);
        second.finish();
        Promise.resolve().then(() => expect(layer.getSource()).toBe(old)).then(() => done(), done);
    });
    it('keeps loading/error indicators connected when sources are replaced', () => {
        const layer = makeLayer();
        const old = layer.getSource();
        const onLoading = expect.createSpy();
        const onLoad = expect.createSpy();
        const cleanup = bindVectorSourceEvents(layer, { onLoading, onLoad });
        old.dispatchEvent('featuresloadstart');
        expect(onLoading.calls.length).toBe(1);
        const next = new VectorSource();
        layer.setSource(next);
        expect(onLoad).toHaveBeenCalledWith(false);
        next.dispatchEvent('featuresloadstart');
        next.dispatchEvent('featuresloaderror');
        expect(onLoading.calls.length).toBe(2);
        expect(onLoad).toHaveBeenCalledWith(true);
        const calls = onLoad.calls.length;
        old.dispatchEvent('featuresloadend');
        expect(onLoad.calls.length).toBe(calls);
        cleanup();
        next.dispatchEvent('featuresloadstart');
        expect(onLoading.calls.length).toBe(2);
    });

});
