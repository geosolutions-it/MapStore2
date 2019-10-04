/*
 * Copyright 2018, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

const React = require('react');
const ReactDOM = require('react-dom');
const Editor = require('../Editor');
const TestUtils = require('react-dom/test-utils');
const expect = require('expect');

describe('test Editor module component (Style Editor)', () => {
    beforeEach((done) => {
        document.body.innerHTML = '<div id="container"></div>';
        setTimeout(done);
    });

    afterEach((done) => {
        ReactDOM.unmountComponentAtNode(document.getElementById("container"));
        document.body.innerHTML = '';
        setTimeout(done);
    });

    it('test Editor creation', () => {
        const comp = ReactDOM.render(<Editor />, document.getElementById("container"));
        expect(comp).toExist();
        expect(comp.editor).toExist();
    });

    it('test Editor geocss mode, highlight values', () => {
        const code = "@styleTitle 'Title';\n@styleAbstract 'Abstract';\n\n* {\n\tmark: symbol(square);\n\t:mark {\n\t\tstroke: #ff33aa;\n\t\tstroke-width: 2;\n\t};\n}\n\n[NAME = 'Rome'] {\n\t:mark {\n\t\tstroke: #1741ff;\n\t};\n}";
        const comp = ReactDOM.render(<Editor
            mode="geocss"
            code={code}
            waitTime={0}
        />, document.getElementById("container"));
        expect(comp).toExist();
        expect(comp.editor).toExist();

        // mark, stroke, stroke-width
        const cmProperties = document.querySelectorAll('.cm-property');
        expect(cmProperties.length).toBe(4);

        // #ff33aa, #1741ff
        const cmAtom = document.querySelectorAll('.cm-atom');
        expect(cmAtom.length).toBe(2);

        // 2
        const cmNumber = document.querySelectorAll('.cm-number');
        expect(cmNumber.length).toBe(1);

        // @styleTitle, @styleAbstract
        const cmVariable2 = document.querySelectorAll('.cm-variable-2');
        expect(cmVariable2.length).toBe(2);

        // NAME
        const cmFilter = document.querySelectorAll('.cm-filter');
        expect(cmFilter.length).toBe(1);

        // :mark
        const cmVariable3 = document.querySelectorAll('.cm-variable-3');
        expect(cmVariable3.length).toBe(2);
    });

    it('test Editor geocss mode add inline widgets', () => {

        const ORIGINAL_VALUE = '#00ff00';
        const CHANGED_VALUE = '#ff00ff';
        const code = `@styleTitle 'Title';\n@styleAbstract 'Abstract';\n\n* {\n\tstroke: ${ORIGINAL_VALUE};\n}`;

        const comp = ReactDOM.render(<Editor
            mode="geocss"
            code={code}
            waitTime={0}
            inlineWidgets={[
                {
                    type: 'color',
                    active: token => token.type === 'atom',
                    Widget: ({token, value, onChange = () => {}}) => (
                        <div className="custom-widget-panel" onClick={() => onChange(CHANGED_VALUE)}>{value || token.string}</div>
                    )
                }
            ]}
        />, document.getElementById("container"));
        expect(comp).toExist();
        expect(comp.editor).toExist();
        let cmAtom = document.querySelectorAll('.cm-atom');
        expect(cmAtom.length).toBe(1);
        expect(cmAtom[0].innerHTML).toBe(ORIGINAL_VALUE);

        const inlineWidgetsButtons = document.querySelectorAll('.ms-style-editor-inline-widget');
        expect(inlineWidgetsButtons.length).toBe(1);

        // open widget
        inlineWidgetsButtons[0].click();

        const widgetPanel = document.querySelector('.custom-widget-panel');

        // change value
        TestUtils.Simulate.click(widgetPanel);

        // close panel and update code text
        const closeButton = document.querySelector('.close');
        TestUtils.Simulate.click(closeButton);

        cmAtom = document.querySelectorAll('.cm-atom');
        expect(cmAtom.length).toBe(1);
        expect(cmAtom[0].innerHTML).toBe(CHANGED_VALUE);
    });

    it('test Editor error', () => {

        const code = "@styleTitle 'Error';\n@styleAbstract 'Abstract';\n\n {\n\tstroke: #00ff00;\n}";

        ReactDOM.render(<Editor mode="geocss" code={code}/>, document.getElementById("container"));

        let editorError = document.querySelectorAll('.ms-style-editor-error');
        expect(editorError.length).toBe(0);
        let infoPopover = document.querySelector('.mapstore-info-popover');
        expect(infoPopover).toNotExist();

        ReactDOM.render(<Editor
            mode="geocss"
            error={{
                column: 7,
                line: 5,
                message: "Invalid style:Invalid input ' ', expected Identifier, ClassName or 'n' (line 5, column 7)",
                status: 400
            }}/>, document.getElementById("container"));

        editorError = document.querySelectorAll('.ms-style-editor-error');
        expect(editorError.length > 0).toBe(true);

        infoPopover = document.querySelector('.mapstore-info-popover');
        expect(infoPopover).toExist();

    });

    it('test Editor loading', () => {
        ReactDOM.render(<Editor
            mode="geocss"
            loading
        />, document.getElementById("container"));

        let loadingDOM = document.querySelector('.mapstore-small-size-loader');
        expect(loadingDOM).toExist();

        ReactDOM.render(<Editor
            mode="geocss"
        />, document.getElementById("container"));

        loadingDOM = document.querySelector('.mapstore-small-size-loader');
        expect(loadingDOM).toNotExist();
    });

    it('test Editor shows default validation pop up', () => {
        const code = "@styleTitle 'Error';\n@styleAbstract 'Abstract';\n\n {\n\tstroke: #00ff00;\n}";

        ReactDOM.render(<Editor mode="geocss" code={code}/>, document.getElementById("container"));

        let editorError = document.querySelectorAll('.ms-style-editor-error');
        expect(editorError.length).toBe(0);
        let infoPopover = document.querySelector('.mapstore-info-popover');
        expect(infoPopover).toNotExist();

        ReactDOM.render(<Editor
            mode="geocss"
            error={{
                status: 400
            }}/>, document.getElementById("container"));

        editorError = document.querySelectorAll('.ms-style-editor-error');
        expect(editorError.length > 0).toBe(true);

        infoPopover = document.querySelector('.mapstore-info-popover');
        expect(infoPopover).toExist();
        TestUtils.Simulate.mouseOver(infoPopover.children[0]);
        expect(document.querySelector('.popover-content > span').innerHTML).toBe('styleeditor.genericValidationError');
    });
});
