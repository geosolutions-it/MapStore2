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
            }
        });
        expect(resize).toExist();
        expect(resize.boxes).toNotExist();
        resize.onCreate();
        expect(resize.boxes).toExist();
        resize.onDestroy();
    });

});
