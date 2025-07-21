/*
 * Copyright 2025, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
import React from 'react';
import ReactDOM from 'react-dom';
import * as TestUtils from 'react-dom/test-utils';
import expect from 'expect';
import TerrainEditor from '../TerrainEditor';

describe('test TerrainEditor', () => {
    beforeEach((done) => {
        document.body.innerHTML = '<div id="container"></div>';
        setTimeout(done);
    });

    afterEach((done) => {
        ReactDOM.unmountComponentAtNode(document.getElementById("container"));
        document.body.innerHTML = '';
        setTimeout(done);
    });

    it('test render TerrainEditor', () => {
        const actions = {
            onUpdate: () => {},
            onHide: () => {}
        };
        const onHideSpy = expect.spyOn(actions, 'onHide');
        ReactDOM.render(
            <TerrainEditor
                terrain
                onUpdate={actions.onUpdate}
                onHide={actions.onHide}
            />,
            document.getElementById("container")
        );
        const el = document.querySelector('div ._padding-lr-lg');
        expect(el).toExist();

        const modal = document.querySelector('.modal-dialog');
        expect(modal).toExist();

        const providerSelect = document.querySelector('.Select-control');
        expect(providerSelect).toExist();
        // default provider is 'cesium'
        const providerVal = document.querySelector('.Select-value-label');
        expect(providerVal.innerHTML).toBe('backgroundSelector.terrain.cesiumProvider.label');

        const titleInput = document.querySelector('input[name="title"]');
        expect(titleInput).toExist();

        const urlInput = document.querySelector('input[name="url"]');
        expect(urlInput).toExist();

        // Test close button click
        const closeButton = document.querySelector('.glyphicon-1-close').parentNode;
        TestUtils.Simulate.click(closeButton);
        expect(onHideSpy).toHaveBeenCalled();

        onHideSpy.restore();
    });

    it('test provider change to cesium-ion', () => {
        ReactDOM.render(
            <TerrainEditor
                terrain
                onUpdate={() => {}}
                onHide={() => {}}
            />,
            document.getElementById("container")
        );
        const el = document.querySelector('div ._padding-lr-lg');
        expect(el).toExist();

        const providerSelect = document.querySelector('.Select-control');
        expect(providerSelect).toExist();
        TestUtils.act(() => {
            TestUtils.Simulate.keyDown(providerSelect, { keyCode: 40 });
        });
        // Simulate changing provider to 'cesium-ion'
        const cesiumIonOption = document.querySelectorAll('.Select-option')[1]; // cesium-ion is the second option in list
        TestUtils.Simulate.mouseDown(cesiumIonOption);

        const assetIdInput = document.querySelector('input[name="options.assetId"]');
        expect(assetIdInput).toExist();

        const accessTokenInput = document.querySelector('input[name="options.accessToken"]');
        expect(accessTokenInput).toExist();

        const serverInput = document.querySelector('input[name="options.server"]');
        expect(serverInput).toExist();
    });

    it('test provider change to wms', () => {
        ReactDOM.render(
            <TerrainEditor
                terrain
                onUpdate={() => {}}
                onHide={() => {}}
            />,
            document.getElementById("container")
        );
        const el = document.querySelector('div ._padding-lr-lg');
        expect(el).toExist();

        const providerSelect = document.querySelector('.Select-control');
        expect(providerSelect).toExist();
        // Simulate changing provider to 'wms'
        TestUtils.act(() => {
            TestUtils.Simulate.keyDown(providerSelect, { keyCode: 40 });
        });
        const wmsOption = document.querySelectorAll('.Select-option')[2]; // wms is the 3rd option in list
        TestUtils.Simulate.mouseDown(wmsOption);

        const urlInput = document.querySelector('input[name="url"]');
        expect(urlInput).toExist();

        const nameInput = document.querySelector('input[name="name"]');
        expect(nameInput).toExist();

        const crsSelect = document.querySelectorAll('.Select-control')[1];
        expect(crsSelect).toExist();

        const versionSelect = document.querySelectorAll('.Select-control')[2];
        expect(versionSelect).toExist();
    });

    it('test form validation and submission', () => {
        const actions = {
            onUpdate: () => {},
            onHide: () => {}
        };

        const onUpdate = expect.spyOn(actions, 'onUpdate');
        const onHideSpy = expect.spyOn(actions, 'onHide');

        ReactDOM.render(
            <TerrainEditor
                terrain
                onUpdate={actions.onUpdate}
                onHide={actions.onHide}
            />,
            document.getElementById("container")
        );
        const el = document.querySelector('div ._padding-lr-lg');
        expect(el).toExist();

        const providerSelect = document.querySelector('.Select-control');
        expect(providerSelect).toExist();

        const titleInput = document.querySelector('input[name="title"]');
        expect(titleInput).toExist();

        // for the default provider 'cesium'
        const urlInput = document.querySelector('input[name="url"]');
        expect(urlInput).toExist();

        const addButton = document.querySelector('button.btn.btn-success');
        expect(addButton).toExist();
        expect(addButton.disabled).toBe(true);

        TestUtils.Simulate.change(titleInput, { target: { name: 'title', value: 'Test Terrain' } });
        TestUtils.Simulate.change(urlInput, { target: { name: 'url', value: 'https://example.com/terrain' } });

        expect(addButton.disabled).toBe(false);

        TestUtils.Simulate.click(addButton);

        expect(onUpdate).toHaveBeenCalled();
        expect(onHideSpy).toHaveBeenCalled();

        const layerArg = onUpdate.calls[0].arguments[0];
        expect(layerArg.title).toBe('Test Terrain');
        expect(layerArg.url).toBe('https://example.com/terrain');
        expect(layerArg.provider).toBe('cesium');
        expect(layerArg.type).toBe('terrain');
        expect(layerArg.group).toBe('background');
        expect(layerArg.id).toExist();
    });

    it('test edit mode', () => {
        const actions = {
            onUpdate: () => {},
            onHide: () => {}
        };

        const onUpdateSpy = expect.spyOn(actions, 'onUpdate');
        const onHideSpy = expect.spyOn(actions, 'onHide');

        const existingLayer = {
            id: 'terrain-123',
            title: 'Existing Terrain',
            url: 'https://example.com/existing-terrain',
            provider: 'cesium',
            options: {title: 'Existing Terrain', provider: 'cesium', url: 'https://example.com/existing-terrain'},
            type: 'terrain'
        };

        ReactDOM.render(
            <TerrainEditor
                terrain
                onUpdate={actions.onUpdate}
                onHide={actions.onHide}
                layer={existingLayer}
                isEditing
            />,
            document.getElementById("container")
        );

        const el = document.querySelector('div ._padding-lr-lg');
        expect(el).toExist();

        const providerSelect = document.querySelector('.Select-control');
        expect(providerSelect).toExist();

        const titleInput = document.querySelector('input[name="title"]');
        expect(titleInput.value).toBe('Existing Terrain');

        const urlInput = document.querySelector('input[name="url"]');
        expect(urlInput.value).toBe('https://example.com/existing-terrain');

        const addButton = document.querySelector('button.btn.btn-success');
        expect(addButton.disabled).toBe(false);

        TestUtils.Simulate.click(addButton);

        expect(onUpdateSpy).toHaveBeenCalled();
        expect(onHideSpy).toHaveBeenCalled();

        const layerArg = onUpdateSpy.calls[0].arguments[0];
        expect(layerArg.id).toBe('terrain-123');
    });

    it('test URL validation', () => {
        ReactDOM.render(
            <TerrainEditor
                terrain
                onUpdate={() => {}}
                onHide={() => {}}
            />,
            document.getElementById("container")
        );

        const el = document.querySelector('div ._padding-lr-lg');
        expect(el).toExist();

        const titleInput = document.querySelector('input[name="title"]');
        const urlInput = document.querySelector('input[name="url"]');

        TestUtils.Simulate.change(titleInput, { target: { name: 'title', value: 'Test Terrain' } });

        TestUtils.Simulate.change(urlInput, { target: { name: 'url', value: 'invalid-url' } });

        const errorMessage = document.querySelector('.text-danger');
        expect(errorMessage).toExist();

        const addButton = document.querySelector('button.btn.btn-success');
        expect(addButton.disabled).toBe(true);

        TestUtils.Simulate.change(urlInput, { target: { name: 'url', value: 'https://example.com/terrain' } });

        // error message will hide
        const errorMessageAfter = document.querySelector('.text-danger');
        expect(errorMessageAfter).toNotExist();

        expect(addButton.disabled).toBe(false);
    });
});
