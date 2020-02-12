const expect = require('expect');

const React = require('react');
const ReactDOM = require('react-dom');
const BackgroundSelector = require('../BackgroundSelector');

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
    it('confirmDeleteBackgroundModal shows dialog, not draggable', () => {
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

        ReactDOM.render(<BackgroundSelector size={size} layers={layers} mapIsEditable />, document.getElementById("container"));
        // check confirm dialog
        const dialog = document.querySelector('#confirm-dialog');
        expect(dialog).toExist();
        // check is not draggable
        expect(dialog.className.split(' ').filter( c => c === 'modal-dialog-draggable').length).toBe(0);
        expect(dialog.className.split(' ').filter(c => c === 'react-draggable').length).toBe(0);
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
