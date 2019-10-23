const expect = require('expect');

const React = require('react');
const ReactDOM = require('react-dom');
const PreviewIcon = require('../PreviewIcon');
const ReactTestUtils = require('react-dom/test-utils');

describe("test the PreviewIcon", () => {
    beforeEach((done) => {
        document.body.innerHTML = '<div id="container"></div>';
        setTimeout(done);
    });

    afterEach((done) => {
        ReactDOM.unmountComponentAtNode(document.getElementById("container"));
        document.body.innerHTML = '';
        setTimeout(done);
    });

    it('test PreviewIcon default props', () => {
        const previewIcon = ReactDOM.render(<PreviewIcon/>, document.getElementById("container"));
        expect(previewIcon).toExist();
        const node = ReactDOM.findDOMNode(previewIcon);
        expect(node).toExist();
        const image = node.querySelector('.background-preview-icon-frame').children[0];
        ReactTestUtils.Simulate.click(image);
        ReactTestUtils.Simulate.mouseOver(image);
        ReactTestUtils.Simulate.mouseOut(image);
    });

    it('test PreviewIcon actions', () => {
        const actions = {
            onPropertiesChange: () => {},
            onToggle: () => {},
            onLayerChange: () => {},
            setCurrentBackgroundLayer: () => {}
        };

        const layer = {
            type: "empty",
            visibility: true,
            id: 'layer'
        };

        const spyPropertiesChange = expect.spyOn(actions, 'onPropertiesChange');
        const spyToggle = expect.spyOn(actions, 'onToggle');
        const spyLayerChange = expect.spyOn(actions, 'onLayerChange');
        const spySetCurrentBackgroundLayer = expect.spyOn(actions, 'setCurrentBackgroundLayer');

        const previewIcon = ReactDOM.render(<PreviewIcon onPropertiesChange={actions.onPropertiesChange} onToggle={actions.onToggle} onLayerChange={actions.onLayerChange} setCurrentBackgroundLayer={actions.setCurrentBackgroundLayer} vertical layer={layer}/>, document.getElementById("container"));
        expect(previewIcon).toExist();
        const node = ReactDOM.findDOMNode(previewIcon);
        expect(node).toExist();
        const image = node.querySelector('.background-preview-icon-frame').children[0];
        ReactTestUtils.Simulate.mouseOver(image);
        expect(spyLayerChange).toHaveBeenCalled();
        ReactTestUtils.Simulate.click(image);
        expect(spyPropertiesChange).toHaveBeenCalled();
        expect(spyToggle).toHaveBeenCalled();
        expect(spyPropertiesChange).toHaveBeenCalledWith("layer", {visibility: true});
        expect(spySetCurrentBackgroundLayer).toHaveBeenCalledWith("layer");

    });

    it('test PreviewIcon is invalid', () => {
        const actions = {
            onPropertiesChange: () => {},
            onToggle: () => {},
            onLayerChange: () => {}
        };

        const layer = {
            id: 'layer',
            invalid: true
        };

        const spyPropertiesChange = expect.spyOn(actions, 'onPropertiesChange');
        const spyToggle = expect.spyOn(actions, 'onToggle');
        const spyLayerChange = expect.spyOn(actions, 'onLayerChange');

        const previewIcon = ReactDOM.render(<PreviewIcon onPropertiesChange={actions.onPropertiesChange} onToggle={actions.onToggle} onLayerChange={actions.onLayerChange} layer={layer}/>, document.getElementById("container"));
        expect(previewIcon).toExist();
        const node = ReactDOM.findDOMNode(previewIcon);
        expect(node).toExist();
        const image = node.querySelector('.background-preview-icon-frame').children[0];
        ReactTestUtils.Simulate.mouseOver(image);
        expect(spyLayerChange).toHaveBeenCalled();
        ReactTestUtils.Simulate.click(image);
        expect(spyPropertiesChange).toNotHaveBeenCalled();
        expect(spyToggle).toNotHaveBeenCalled();
    });
});
