import React from 'react';
import ReactDOM from 'react-dom';
import * as TestUtils from 'react-dom/test-utils';
import expect from 'expect';
import BackgroundDialog from '../BackgroundDialog';

describe('test BackgroundDialog', () => {
    beforeEach((done) => {
        document.body.innerHTML = '<div id="container"></div>';
        setTimeout(done);
    });

    afterEach((done) => {
        ReactDOM.unmountComponentAtNode(document.getElementById("container"));
        document.body.innerHTML = '';
        setTimeout(done);
    });

    it('test render BackgroundDialog', () => {
        const actions = {
            updateThumbnail: () => {},
            onSave: () => {}
        };

        const updateThumbnailSpy = expect.spyOn(actions, 'updateThumbnail');
        const onSaveSpy = expect.spyOn(actions, 'onSave');

        const dialog = ReactDOM.render(<BackgroundDialog updateThumbnail={actions.updateThumbnail} onSave={actions.onSave}/>,
            document.getElementById("container"));
        expect(dialog).toExist();
        const node = ReactDOM.findDOMNode(dialog);
        expect(node).toExist();
        const footer = node.getElementsByClassName('modal-footer');
        expect(footer.length).toBe(1);
        const buttons = footer[0].getElementsByClassName('btn');
        expect(buttons.length).toBe(1);
        TestUtils.Simulate.click(buttons[0]);

        expect(updateThumbnailSpy).toHaveBeenCalled();
        expect(onSaveSpy).toHaveBeenCalled();
    });

    it('test render BackgroundDialog with WMTS attributions editor', () => {
        const actions = {
            updateThumbnail: () => {},
            onSave: () => {}
        };

        const updateThumbnailSpy = expect.spyOn(actions, 'updateThumbnail');
        const onSaveSpy = expect.spyOn(actions, 'onSave');

        const dialog = ReactDOM.render(<BackgroundDialog layer={{type: 'wmts'}} updateThumbnail={actions.updateThumbnail} onSave={actions.onSave} credits={{title: "<p>Some Attribution Text</p>"}}/>,
            document.getElementById("container"));
        expect(dialog).toExist();
        const node = ReactDOM.findDOMNode(dialog);
        expect(node).toExist();
        const footer = node.getElementsByClassName('modal-footer');
        expect(footer.length).toBe(1);
        const attributionEditor = node.getElementsByClassName('DraftEditor-editorContainer')[0];
        expect(attributionEditor).toExist();
        const attributionText = attributionEditor.getElementsByTagName('span')[1].innerText;
        expect(attributionText).toBe('Some Attribution Text');
        const buttons = footer[0].getElementsByClassName('btn');
        expect(buttons.length).toBe(1);
        TestUtils.Simulate.click(buttons[0]);

        expect(updateThumbnailSpy).toHaveBeenCalled();
        expect(onSaveSpy).toHaveBeenCalled();
    });
    it('should render with WMS cache options', () => {
        ReactDOM.render(<BackgroundDialog
            layer={{
                type: 'wms',
                url: '/geoserver/wms',
                name: 'workspace:name'
            }}
        />,
        document.getElementById("container"));
        const modalNode = document.querySelector('#ms-resizable-modal');
        expect(modalNode).toBeTruthy();
        const wmsCacheOptionsContent = document.querySelector('.ms-wms-cache-options-content');
        expect(wmsCacheOptionsContent).toBeTruthy();
        const wmsCacheOptionsToolbar = document.querySelector('.ms-wms-cache-options-toolbar');
        expect(wmsCacheOptionsToolbar).toBeTruthy();
    });
});
