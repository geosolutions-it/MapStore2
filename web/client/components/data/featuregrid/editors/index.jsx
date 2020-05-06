const React = require('react');
const Editor = require('./AttributeEditor');
const NumberEditor = require('./NumberEditor').default;
const AutocompleteEditor = require('./AutocompleteEditor');
const DropDownEditor = require('./DropDownEditor');

const types = {
    "defaultEditor": (props) => <Editor {...props}/>,
    "int": (props) => <NumberEditor dataType="int" inputProps={{step: 1, type: "number"}} {...props}/>,
    "number": (props) => <NumberEditor dataType="number" inputProps={{step: 1, type: "number"}} {...props}/>,
    "string": (props) => props.autocompleteEnabled ?
        <AutocompleteEditor dataType="string" {...props}/> :
        <Editor dataType="string" {...props}/>,
    "boolean": (props) => <DropDownEditor dataType="string" {...props} value={props.value && props.value.toString()} filter={false} values={["true", "false"]}/>
};
module.exports = (type, props) => types[type] ? types[type](props) : types.defaultEditor(props);
