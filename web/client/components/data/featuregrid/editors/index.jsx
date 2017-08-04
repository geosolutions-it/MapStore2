const React = require('react');
const Editor = require('./AttributeEditor');
const NumberEditor = require('./NumberEditor');

const types = {
    "defaultEditor": (props) => <Editor {...props}/>,
    "int": (props) => <NumberEditor dataType="int" inputProps={{step: 1, type: "number"}} {...props}/>,
    "number": (props) => <NumberEditor dataType="number" inputProps={{step: 1, type: "number"}} {...props}/>
 };
module.exports = (type, props) => types[type] ? types[type](props) : types.defaultEditor(props);
