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

        const backgroundSelector = ReactDOM.render(<BackgroundSelector isMobile size={size} layers={layers}/>, document.getElementById("container"));
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

        const backgroundSelector = ReactDOM.render(<BackgroundSelector isMobile size={size} enabled layers={layers}/>, document.getElementById("container"));
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

        const backgroundSelector = ReactDOM.render(<BackgroundSelector isMobile size={size} enabled layers={layers}/>, document.getElementById("container"));
        expect(backgroundSelector).toExist();
        const node = ReactDOM.findDOMNode(backgroundSelector);
        expect(node).toExist();
    });
});
