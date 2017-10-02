/*
 * Copyright 2017, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
*/
const ReactDOM = require('react-dom');
const expect = require('expect');
const assign = require('object-assign');
const {
    setEditor,
    cleanEditors,
    getDefaultEditors,
    getEditors,
    getCustomEditor,
    removeEditor
} = require('../EditorUtils');
const attribute = "STATE_NAME";
const url = "https://demo.geo-solutions.it/geoserver/wfs";
const typeName = "topp:states";
const rules = [{
    "regex": {
        "attribute": "STATE_NAME"
    },
    "editor": "My_Custom_Editor_1",
    "editorProps": {
        "values": ["Opt1", "Opt2"],
        "forceSelection": true
    }
}];
describe('FeatureGridUtils tests ', () => {
    beforeEach(() => {
        document.body.innerHTML = '<div id="container"></div>';
        cleanEditors();
    });
    afterEach(() => {
        ReactDOM.unmountComponentAtNode(document.getElementById("container"));
        document.body.innerHTML = '';
    });
    it('cleanEditors', () => {
        cleanEditors();
        let Editors = getEditors();
        expect(Object.keys(Editors).length).toBe(0);
    });
    it('setEditor using defaults', () => {
        const name = "custom_name_editor";
        setEditor({name});
        expect(Object.keys(getEditors()[name]({})).length).toBe(4);
    });
    it('getDefaultEditors', () => {
        let defEditors = getDefaultEditors();
        expect(Object.keys(defEditors).length).toBe(4);
    });
    it('getEditors', () => {
        let Editors = getEditors();
        expect(Object.keys(Editors).length).toBe(0);
    });
    it('setEditor using custom editors', () => {
        const name = "custom_name_editor2";
        const customEditors = assign({}, {...getDefaultEditors()});
        delete customEditors.string;
        setEditor({name, editors: ({}) => customEditors});
        expect(Object.keys(getEditors()).length).toBe(1);
        expect(getEditors()[name]({})).toBe(customEditors);
        expect(Object.keys(getEditors()[name]({})).length).toBe(3);
    });
    it('removeEditor with name NOT PRESENT in the list', () => {
        const name = "non present editor";
        const result = removeEditor(name);
        expect(result).toBe(false);
    });
    it('removeEditor with name PRESENT in the list', () => {
        const name = "custom_name_editor2";
        const customEditors = assign({}, {...getDefaultEditors()});
        setEditor({name, editors: ({}) => customEditors});

        const result = removeEditor(name);
        expect(result).toBe(true);
    });
    it('getCustomEditor with positive match', () => {
        const name = "My_Custom_Editor_1";
        const customEditors = assign({}, {...getDefaultEditors()});
        setEditor({name, editors: ({}) => customEditors});
        const editor = getCustomEditor({attribute, url, typeName}, rules);
        expect(Object.keys(editor).length).toBe(4);
    });
    it('getCustomEditor with negative match', () => {
        const attr = "STAsTE_NAME";
        const name = "My_Custom_Editor_1";
        const customEditors = assign({}, {...getDefaultEditors()});
        setEditor({name, editors: ({}) => customEditors});
        const editor = getCustomEditor({attribute: attr, url, typeName}, rules);
        expect(editor).toBe(null);
    });
    it('getCustomEditor with no rules', () => {
        const name = "My_Custom_Editor_1";
        const customEditors = assign({}, {...getDefaultEditors()});
        setEditor({name, editors: ({}) => customEditors});

        const rulesempty = [{}];
        const editor = getCustomEditor({attribute, url, typeName}, rulesempty);
        expect(editor).toBe(null);
    });

    it('testing fetch of custom editors', () => {
        const name = "My_Custom_Editor_1";
        const customEditors = assign({}, {...getDefaultEditors()});
        setEditor({name, editors: ({}) => customEditors});
        const editor = getCustomEditor({attribute, url, typeName}, rules);
        expect(Object.keys(editor).length).toBe(4);
        // fetch custom string editor
        expect(typeof editor.string({})).toBe("object");
        const AutocompleteEditor = editor.string({autocompleteEnabled: true});
        expect(AutocompleteEditor).toExist();
        // TODO FINALIZE TEST
        const Editor = editor.string({});
        expect(Editor).toExist();
        // TODO FINALIZE TEST
        const IntEditor = editor.int({});
        expect(IntEditor).toExist();
        // TODO FINALIZE TEST
        const NumberEditor = editor.number({});
        expect(NumberEditor).toExist();
        // TODO FINALIZE TEST


    });

});
