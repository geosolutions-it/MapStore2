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
        const backgroundSelector = ReactDOM.render(<BackgroundSelector/>, document.getElementById("container"));
        expect(backgroundSelector).toExist();
        const node = ReactDOM.findDOMNode(backgroundSelector);
        expect(node).toBe(null);
    });

    it('test BackgroundSelector on desktop', () => {

        const size = {width: 1000, height: 500};

        const layers = [
            {
                id: 'layer_0',
                title: 'title_0',
                visibility: true
            },
            {
                id: 'layer_1',
                title: 'title_1'
            }
        ];
        const backgroundSelector = ReactDOM.render(<BackgroundSelector size={size} layers={layers}/>, document.getElementById("container"));
        expect(backgroundSelector).toExist();
        const node = ReactDOM.findDOMNode(backgroundSelector);
        expect(node).toExist();

        const icons = backgroundSelector.getIcons(5, 5, 5, true);
        expect(icons.length).toBe(0);

        backgroundSelector.getDimensions(5, 5, 5, 5, 5, 5);
    });

    it('test BackgroundSelector on desktop enabled', () => {

        const size = {width: 1000, height: 500};

        const layers = [
            {
                id: 'layer_0',
                title: 'title_0',
                visibility: true
            },
            {
                id: 'layer_1',
                title: 'title_1'
            }
        ];

        const backgroundSelector = ReactDOM.render(<BackgroundSelector size={size} enabled layers={layers}/>, document.getElementById("container"));
        expect(backgroundSelector).toExist();
        const node = ReactDOM.findDOMNode(backgroundSelector);
        expect(node).toExist();

        const icons = backgroundSelector.getIcons(5, 5, 5, false);
        expect(icons.length).toBeGreaterThan(0);

        backgroundSelector.getThumb({source: 'osm', name: 'mapnik'});
        backgroundSelector.getThumb({source: 'test', name: 'test', thumbURL: 'test'});
        backgroundSelector.getThumb({source: 'osm', name: 'map', thumbURL: 'test'});
        backgroundSelector.getThumb({source: 'osm', name: 'map'});
        backgroundSelector.getThumb({source: 'test', name: 'test'});

        backgroundSelector.getDimensions(5, 5, 5, 5, 5, 5);
    });

    it('test BackgroundSelector on desktop enabled min width', () => {

        const size = {width: 10, height: 500};

        const layers = [
            {
                id: 'layer_0',
                title: 'title_0',
                visibility: true
            },
            {
                id: 'layer_1',
                title: 'title_1'
            }
        ];
        const backgroundSelector = ReactDOM.render(<BackgroundSelector size={size} enabled layers={layers}/>, document.getElementById("container"));
        expect(backgroundSelector).toExist();
        const node = ReactDOM.findDOMNode(backgroundSelector);
        expect(node).toNotExist();
    });

    it('test BackgroundSelector on mobile', () => {

        const size = {width: 1000, height: 500};

        const layers = [
            {
                id: 'layer_0',
                title: 'title_0',
                visibility: true
            },
            {
                id: 'layer_1',
                title: 'title_1'
            }
        ];

        const backgroundSelector = ReactDOM.render(<BackgroundSelector mode="mobile" size={size} layers={layers}/>, document.getElementById("container"));
        expect(backgroundSelector).toExist();
        const node = ReactDOM.findDOMNode(backgroundSelector);
        expect(node).toExist();
    });

    it('test BackgroundSelector on mobile enabled', () => {

        const size = {width: 1000, height: 500};

        const layers = [
            {
                id: 'layer_0',
                title: 'title_0',
                visibility: true
            },
            {
                id: 'layer_1',
                title: 'title_1'
            }
        ];

        const backgroundSelector = ReactDOM.render(<BackgroundSelector mode="mobile" size={size} enabled layers={layers}/>, document.getElementById("container"));
        expect(backgroundSelector).toExist();
        const node = ReactDOM.findDOMNode(backgroundSelector);
        expect(node).toExist();
    });

    it('test BackgroundSelector on mobile enabled min height', () => {

        const size = {width: 1000, height: 10};

        const layers = [
            {
                id: 'layer_0',
                title: 'title_0',
                visibility: true
            },
            {
                id: 'layer_1',
                title: 'title_1'
            }
        ];

        const backgroundSelector = ReactDOM.render(<BackgroundSelector mode="mobile" size={size} enabled layers={layers}/>, document.getElementById("container"));
        expect(backgroundSelector).toExist();
        const node = ReactDOM.findDOMNode(backgroundSelector);
        expect(node).toExist();
    });

    it('test BackgroundSelector tool buttons', () => {
        const size = {width: 1000, height: 500};
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

        const backgroundSelector = ReactDOM.render(<BackgroundSelector enabled size={size} layers={layers} mapIsEditable hasCatalog/>, document.getElementById("container"));
        expect(backgroundSelector).toExist();
        const node = ReactDOM.findDOMNode(backgroundSelector);
        expect(node).toExist();

        const editButtons = node.getElementsByClassName('edit-button');
        const deleteButtons = node.getElementsByClassName('delete-button');
        const addButton = node.querySelectorAll('.background-preview-button .square-button-md .glyphicon-plus');
        expect(editButtons.length).toBe(1);
        expect(deleteButtons.length).toBe(3);
        expect(addButton.length).toBe(1);
    });
    it('confirmDeleteBackgroundModal shows dialog', () => {
        const size = { width: 1000, height: 500 };
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

        ReactDOM.render(<BackgroundSelector size={size} layers={layers} mapIsEditable  confirmDeleteBackgroundModal={{
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
        const buttons = document.querySelectorAll('.btn');
        expect(buttons.length).toBe(2);
    });

    it('confirmDeleteBackgroundModal handles cancel action', (done) => {
        const onRemoveBackground = (show) => {
            expect(show).toBe(false);
            done();
        };

        ReactDOM.render(
            <BackgroundSelector
                size={{ width: 1000, height: 500 }}
                layers={[{ id: 'layer_0', title: 'title_0' }]}
                confirmDeleteBackgroundModal={{
                    show: true,
                    layerId: 'layer_0',
                    layerTitle: 'title_0'
                }}
                onRemoveBackground={onRemoveBackground}
            />,
            document.getElementById("container")
        );

        const buttons = document.querySelectorAll('.btn');
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
                size={{ width: 1000, height: 500 }}
                layers={[{ id: 'layer_0', title: 'title_0' }]}
                confirmDeleteBackgroundModal={{
                    show: true,
                    layerId: 'layer_0',
                    layerTitle: 'title_0'
                }}
                removeBackground={removeBackground}
            />,
            document.getElementById("container")
        );

        const buttons = document.querySelectorAll('.btn');
        const confirmButton = buttons[1];
        Simulate.click(confirmButton);
    });

    it('test BackgroundSelector tool buttons when mapIsEditable is false', () => {
        const size = {width: 1000, height: 500};
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

        const backgroundSelector = ReactDOM.render(<BackgroundSelector enabled size={size} layers={layers} mapIsEditable={false}/>, document.getElementById("container"));
        expect(backgroundSelector).toExist();
        const node = ReactDOM.findDOMNode(backgroundSelector);
        expect(node).toExist();
        const toolButtons = node.getElementsByClassName('background-tool-button');
        const addButton = node.querySelectorAll('.square-button-md glyphicon-plus');
        expect(toolButtons.length).toBe(0);
        expect(addButton.length).toBe(0);
    });

    it('test BackgroundSelector tool buttons when on mobile', () => {
        const size = {width: 1000, height: 500};
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

        const backgroundSelector = ReactDOM.render(<BackgroundSelector mode="mobile" enabled size={size} layers={layers} mapIsEditable={false}/>, document.getElementById("container"));
        expect(backgroundSelector).toExist();
        const node = ReactDOM.findDOMNode(backgroundSelector);
        expect(node).toExist();
        const toolButtons = node.getElementsByClassName('background-tool-button');
        const addButton = node.querySelectorAll('.square-button-md glyphicon-plus');
        expect(toolButtons.length).toBe(0);
        expect(addButton.length).toBe(0);
    });
});
