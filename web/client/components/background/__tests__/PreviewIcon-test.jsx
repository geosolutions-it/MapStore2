const expect = require('expect');

const React = require('react');
const ReactDOM = require('react-dom');
const PreviewIcon = require('../PreviewIcon');
const ReactTestUtils = require('react-addons-test-utils');

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
            onToggle: () => {},
            onClose: () => {},
            setLayer: () => {}
        };

        const layer = {
            visibility: true,
            id: 'layer'
        };

        const spyToggle = expect.spyOn(actions, 'onToggle');
        const spyClose = expect.spyOn(actions, 'onClose');
        const spyLayer = expect.spyOn(actions, 'setLayer');

        const previewIcon = ReactDOM.render(<PreviewIcon onToggle={actions.onToggle} onClose={actions.onClose} setLayer={actions.setLayer} vertical={true} layer={layer}/>, document.getElementById("container"));
        expect(previewIcon).toExist();
        const node = ReactDOM.findDOMNode(previewIcon);
        expect(node).toExist();
        const image = node.querySelector('.background-preview-icon-frame').children[0];
        ReactTestUtils.Simulate.mouseOver(image);
        expect(spyLayer).toHaveBeenCalled();
        ReactTestUtils.Simulate.click(image);
        expect(spyToggle).toHaveBeenCalled();
        expect(spyClose).toHaveBeenCalled();
        expect(spyToggle).toHaveBeenCalledWith("layer", {visibility: true});

    });

    it('test PreviewIcon is invalid', () => {
        const actions = {
            onToggle: () => {},
            onClose: () => {},
            setLayer: () => {}
        };

        const layer = {
            id: 'layer',
            invalid: true
        };

        const spyToggle = expect.spyOn(actions, 'onToggle');
        const spyClose = expect.spyOn(actions, 'onClose');
        const spyLayer = expect.spyOn(actions, 'setLayer');

        const previewIcon = ReactDOM.render(<PreviewIcon onToggle={actions.onToggle} onClose={actions.onClose} setLayer={actions.setLayer} layer={layer}/>, document.getElementById("container"));
        expect(previewIcon).toExist();
        const node = ReactDOM.findDOMNode(previewIcon);
        expect(node).toExist();
        const image = node.querySelector('.background-preview-icon-frame').children[0];
        ReactTestUtils.Simulate.mouseOver(image);
        expect(spyLayer).toHaveBeenCalled();
        ReactTestUtils.Simulate.click(image);
        expect(spyToggle).toNotHaveBeenCalled();
        expect(spyClose).toNotHaveBeenCalled();
    });
});
