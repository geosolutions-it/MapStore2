const React = require('react');
const DropDownEditor = require('./DropDownEditor');
const assign = require('object-assign');

const Editors = {
    "DropDownEditor": (editorProps) => {
        return {
            "string": (props) => <DropDownEditor dataType="string" {...assign({}, props, editorProps)}/>
        };
    }
};
module.exports = Editors;
