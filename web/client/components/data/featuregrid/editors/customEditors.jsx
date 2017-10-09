const React = require('react');
const DropDownEditor = require('./DropDownEditor');

const Editors = {
    "DropDownEditor": {
        "string": (props) => <DropDownEditor dataType="string" {...props}/>
    }
};


module.exports = Editors;
