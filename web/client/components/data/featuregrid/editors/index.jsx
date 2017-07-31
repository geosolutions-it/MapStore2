const React = require('react');
const NumberEditor = require('./NumberEditor');
module.exports = {
    "int": <NumberEditor dataType="int" inputProps={{step: 1}}/>,
    "number": <NumberEditor dataType="number" />
};
