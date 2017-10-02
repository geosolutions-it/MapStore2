/*
 * Copyright 2017, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
*/

const React = require('react');
const Editor = require('../components/data/featuregrid/editors/AttributeEditor');
const NumberEditor = require('../components/data/featuregrid/editors/NumberEditor');
const AutocompleteEditor = require('../components/data/featuregrid/editors/AutocompleteEditor');
const {find} = require('lodash');
const assign = require('object-assign');

let defaultEditors = {
    "default": (editorProps) => {
        return {
        "defaultEditor": (props) => <Editor {...assign({}, props, editorProps)}/>,
        "int": (props) => <NumberEditor dataType="int" inputProps={{step: 1, type: "number"}} {...assign({}, props, editorProps)}/>,
        "number": (props) => <NumberEditor dataType="number" inputProps={{step: 1, type: "number"}} {...assign({}, props, editorProps)}/>,
        "string": (props) => props.autocompleteEnabled ?
            <AutocompleteEditor dataType="string" {...assign({}, props, editorProps)}/> :
            <Editor dataType="string" {...assign({}, props, editorProps)}/>
        };
    }
};
let Editors = {};
const isPresent = (editorName) => {
    return Object.keys(Editors).indexOf(editorName) !== -1;
};

const testRule = (rule = {}, values = {}) => {
    if (Object.keys(rule).length > 0) {
        return Object.keys(rule).reduce( (p, c) => {
            const r = new RegExp(rule[c]);
            return p && r.test(values[c]);
        }, true);
    }
    return false;
};
module.exports = {
    getDefaultEditors: () => defaultEditors.default({}),
    getEditors: () => Editors,
    setEditor: ({name, editors = defaultEditors.default}) => {
        Editors[name] = editors;
    },
    removeEditor: (name) => {
        if (isPresent(name)) {
            try {
                delete Editors[name];
                return true;
            } catch (e) {
                return false;
            }
        }
        return false;
    },
    cleanEditors: () => {
        Editors = {};
    },
    getCustomEditor: ({attribute, url, typeName}, rules = []) => {
        const editor = find(rules, (r) => testRule(r.regex, {attribute, url, typeName }));
        if (!!editor) {
            return Editors[editor.editor](editor.editorProps);
        }
        return null;
    }
};
