const React = require('react');
const Editor = require('./AttributeEditor');
const NumberEditor = require('./NumberEditor');
const AutocompleteEditor = require('./AutocompleteEditor');
const assign = require('object-assign');

const editors = {
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
module.exports = editors;
