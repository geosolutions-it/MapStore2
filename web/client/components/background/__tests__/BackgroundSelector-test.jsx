/*
 * Copyright 2025, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
import expect from 'expect';
import React from 'react';
import ReactDOM from 'react-dom';
import BackgroundSelector from '../BackgroundSelector';
import { Simulate } from 'react-dom/test-utils';

describe("test the BackgroundSelector", () => {
    beforeEach((done) => {
        document.body.innerHTML = '<div id="container"></div>';
        setTimeout(done);
    });

    afterEach((done) => {
        ReactDOM.unmountComponentAtNode(document.getElementById("container"));
        document.body.innerHTML = '';
        setTimeout(done);
    });

    it('test BackgroundSelector default props', () => {
        ReactDOM.render(<BackgroundSelector backgrounds={[{}]}/>, document.getElementById("container"));
        const container = document.getElementById('container');
        const el = container.querySelector('.ms-background-selector');
        expect(el).toExist();
    });

    it('test BackgroundSelector tool buttons', () => {
        const layers = [
            {
                id: 'layer_0',
                title: 'title_0',
                visibility: true,
                group: 'background'
            },
            {
                id: 'layer_1',
                title: 'title_1',
                group: 'background',
                visibility: true,
                type: 'wms'
            },
            {
                id: 'layer_2',
                title: 'title_2',
                type: 'wms',
                visibility: true,
                group: 'background'
            }
        ];

        ReactDOM.render(<BackgroundSelector alwaysVisible enabled backgrounds={layers} canEdit/>, document.getElementById("container"));
        const container = document.getElementById('container');
        const el = container.querySelector('.ms-background-selector');
        expect(el).toExist();

        const editButtons = container.getElementsByClassName('glyphicon-wrench');
        const deleteButtons = container.getElementsByClassName('glyphicon-trash');
        expect(editButtons.length).toBe(2);
        expect(deleteButtons.length).toBe(3);
    });
    it('confirmDeleteBackgroundModal shows dialog', () => {
        const layers = [
            {
                id: 'layer_0',
                title: 'title_0',
                visibility: true,
                group: 'background'
            },
            {
                id: 'layer_1',
                title: 'title_1',
                group: 'background'
            },
            {
                id: 'layer_2',
                title: 'title_2',
                type: 'wms',
                group: 'background'
            }
        ];

        ReactDOM.render(<BackgroundSelector alwaysVisible backgrounds={layers} canEdit confirmDeleteBackgroundModal={{
            show: true,
            layerId: 'layer_0',
            layerTitle: 'title_0'
        }} />, document.getElementById("container"));
        // check confirm dialog
        const dialog = document.querySelector('[role=dialog]');
        expect(dialog).toExist();
        // check content
        const dialogContent = document.querySelector('.modal-content');
        expect(dialogContent).toExist();
        // verify buttons
        const buttons = document.querySelectorAll('.modal-content .btn');
        expect(buttons.length).toBe(2);
    });

    it('confirmDeleteBackgroundModal handles cancel action', (done) => {
        const onRemoveBackground = (show) => {
            expect(show).toBe(false);
            done();
        };

        ReactDOM.render(
            <BackgroundSelector
                alwaysVisible
                enabled
                backgrounds={[{ id: 'layer_0', title: 'title_0' }]}
                confirmDeleteBackgroundModal={{
                    show: true,
                    layerId: 'layer_0',
                    layerTitle: 'title_0'
                }}
                onRemoveBackground={onRemoveBackground}
            />,
            document.getElementById("container")
        );

        const buttons = document.querySelectorAll('.modal-content .btn');
        const cancelButton = buttons[0];
        Simulate.click(cancelButton);
    });

    it('confirmDeleteBackgroundModal handles confirm action', (done) => {
        const removeBackground = (layerId) => {
            expect(layerId).toBe('layer_0');
            done();
        };

        ReactDOM.render(
            <BackgroundSelector
                alwaysVisible
                enabled
                backgrounds={[{ id: 'layer_0', title: 'title_0' }]}
                confirmDeleteBackgroundModal={{
                    show: true,
                    layerId: 'layer_0',
                    layerTitle: 'title_0'
                }}
                removeBackground={removeBackground}
            />,
            document.getElementById("container")
        );

        const buttons = document.querySelectorAll('.modal-content .btn');
        const confirmButton = buttons[1];
        Simulate.click(confirmButton);
    });

    it('test BackgroundSelector tool buttons when canEdit is false', () => {
        const layers = [
            {
                id: 'layer_0',
                title: 'title_0',
                visibility: true,
                group: 'background'
            },
            {
                id: 'layer_1',
                title: 'title_1',
                group: 'background'
            },
            {
                id: 'layer_2',
                title: 'title_2',
                type: 'wms',
                group: 'background'
            }
        ];

        ReactDOM.render(<BackgroundSelector alwaysVisible enabled backgrounds={layers} canEdit={false}/>, document.getElementById("container"));
        const container = document.getElementById('container');
        const el = container.querySelector('.ms-background-selector');
        expect(el).toExist();

        const editButtons = container.getElementsByClassName('glyphicon-wrench');
        const deleteButtons = container.getElementsByClassName('glyphicon-trash');
        expect(editButtons.length).toBe(0);
        expect(deleteButtons.length).toBe(0);
    });

    it('test BackgroundSelector tool buttons when on mobile', () => {
        const layers = [
            {
                id: 'layer_0',
                title: 'title_0',
                visibility: true,
                group: 'background'
            },
            {
                id: 'layer_1',
                title: 'title_1',
                group: 'background'
            },
            {
                id: 'layer_2',
                title: 'title_2',
                type: 'wms',
                group: 'background'
            }
        ];

        ReactDOM.render(<BackgroundSelector mode="mobile" alwaysVisible enabled backgrounds={layers} canEdit={false}/>, document.getElementById("container"));
        const container = document.getElementById('container');
        const el = container.querySelector('.ms-background-selector');
        expect(el).toExist();
        const editButtons = container.getElementsByClassName('glyphicon-wrench');
        const deleteButtons = container.getElementsByClassName('glyphicon-trash');
        expect(editButtons.length).toBe(0);
        expect(deleteButtons.length).toBe(0);
    });
});
