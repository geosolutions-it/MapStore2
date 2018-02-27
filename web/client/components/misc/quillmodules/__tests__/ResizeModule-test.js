/*
* Copyright 2018, GeoSolutions Sas.
* All rights reserved.
*
* This source code is licensed under the BSD-style license found in the
* LICENSE file in the root directory of this source tree.
*/

const expect = require('expect');
const React = require('react');
const ReactDOM = require('react-dom');
const ReactQuill = require('react-quill');
const {Quill} = ReactQuill;
const {ResizeModule, IFrame, toolbarConfig, Toolbar, DisplaySize, Resize} = require('../../../misc/quillmodules/ResizeModule')(Quill);

Quill.register({
    'formats/video': IFrame,
    'modules/resizeModule': ResizeModule
});

describe("test quill ResizeModule", () => {
    beforeEach((done) => {
        document.body.innerHTML = '<div id="container"></div>';
        setTimeout(done);
    });

    afterEach((done) => {
        ReactDOM.unmountComponentAtNode(document.getElementById("container"));
        document.body.innerHTML = '';
        setTimeout(done);
    });

    it('test ResizeModule', () => {
        const rQuill = ReactDOM.render(
            <ReactQuill
                modules={{
                    resizeModule: {},
                    toolbar: toolbarConfig
                }}/>, document.getElementById("container"));
        expect(rQuill).toExist();
        expect(document.querySelector('.ql-editor')).toExist();
    });

    it('test Toolbar class', () => {
        const overlay = document.createElement('div');
        const domNode = document.createElement('img');
        const toolbar = new Toolbar({
            overlay,
            domNode,
            options: {
                toolbarStyles: {
                    position: 'absolute',
                    top: '-12px',
                    right: '0',
                    left: '0',
                    height: '0',
                    minWidth: '100px',
                    font: '12px/1.0 Arial, Helvetica, sans-serif',
                    textAlign: 'center',
                    color: '#333',
                    boxSizing: 'border-box',
                    cursor: 'default'
                }
            }
        });
        expect(toolbar.toolbar).toNotExist();
        toolbar.onCreate();
        expect(toolbar.toolbar).toExist();
        toolbar.onUpdate();
        toolbar.onDestroy();
    });

    it('test DisplaySize class', () => {
        const overlay = document.createElement('div');
        const domNode = document.createElement('img');
        const displaySize = new DisplaySize({
            overlay,
            domNode,
            options: {
                displayStyles: {

                }
            }
        });
        expect(displaySize).toExist();
        expect(displaySize.display).toNotExist();
        displaySize.onCreate();
        expect(displaySize.display).toExist();
        displaySize.onUpdate();
        displaySize.getCurrentSize();
        expect(displaySize.display.style.right).toBe('-4px');
        expect(displaySize.display.style.bottom).toBe('-4px');
        expect(displaySize.display.style.left).toBe('auto');
        displaySize.onDestroy();
    });

    it('test Resize class ', () => {
        const overlay = document.createElement('div');
        const domNode = document.createElement('img');
        const box = document.createElement('img');
        const resize = new Resize({
            domNode,
            overlay,
            options: {
                handleStyles: {
                    position: 'absolute',
                    height: '12px',
                    width: '12px',
                    backgroundColor: 'white',
                    border: '1px solid #777',
                    boxSizing: 'border-box',
                    opacity: '0.80'
                }
            },
            onUpdate: () => {}
        });
        expect(resize).toExist();
        expect(resize.boxes).toNotExist();
        resize.onCreate();
        expect(resize.boxes).toExist();
        resize.handleMousedown({
            clientX: 0,
            clientY: 0,
            target: box
        });
        resize.handleMousedown({
            clientX: 0,
            clientY: 0,
            target: resize.boxes[0]
        });
        resize.handleMousedown({
            clientX: 0,
            clientY: 0,
            target: resize.boxes[2]
        });
        resize.handleMouseup();
        resize.handleDrag({
            clientX: -5,
            clientY: 10,
            target: box
        });
        resize.onDestroy();
    });

    it('test IFrame class ', () => {
        const rQuill = ReactDOM.render(
            <ReactQuill
                modules={{
                    resizeModule: {},
                    toolbar: toolbarConfig
                }}/>, document.getElementById("container"));
        expect(rQuill).toExist();
        expect(document.querySelector('.ql-editor')).toExist();
        expect(document.querySelector('.ms-quill-iframe')).toNotExist();
        rQuill.getEditor().insertEmbed(0, 'video', 'http://test-url');
        expect(document.querySelector('.ms-quill-iframe')).toExist();
    });

    it('test ResizeModule class ', () => {
        const domNode = document.createElement('img');
        const rQuill = ReactDOM.render(
            <ReactQuill />, document.getElementById("container"));
        const quill = rQuill.getEditor();
        const resizeModule = new ResizeModule(quill, {});
        expect(resizeModule.overlay).toNotExist();
        resizeModule.show(domNode);
        expect(resizeModule.overlay).toExist();
        resizeModule.handleClick({});
        resizeModule.checkImage({});
        resizeModule.hide();
        expect(resizeModule.overlay).toNotExist();
    });

});
