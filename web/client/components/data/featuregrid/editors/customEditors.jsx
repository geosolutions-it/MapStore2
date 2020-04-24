const React = require('react');
const DropDownEditor = require('./DropDownEditor');
const NumberEditor = require('./NumberEditor').default;
const FormatEditor = require('./FormatEditor').default;

const Editors = {
    "DropDownEditor": {
        "string": (props) => <DropDownEditor dataType="string" {...props}/>
    },
    "NumberEditor": {
        "int": (props) => <NumberEditor dataType="int" {...props}/>,
        "number": (props) => <NumberEditor dataType="number" {...props}/>
    },
    "FormatEditor": {
        "string": (props) => <FormatEditor dataType="string" {...props}/>
    }
};


module.exports = Editors;
