/**
* Copyright 2018, GeoSolutions Sas.
* All rights reserved.
*
* This source code is licensed under the BSD-style license found in the
* LICENSE file in the root directory of this source tree.
*/
const React = require('react');
const Select = require('react-select').default;
const defaultOptions = [
    {value: 'NONE', label: "NONE"},
    {value: 'READONLY', label: 'READ ONLY'},
    {value: 'READWRITE', label: 'READ WRITE'}
];

module.exports = ({options = defaultOptions, attribute, value, onChange = () => {}}) => (
    <Select
        name={`sel-${attribute.name}`}
        clearable={false}
        searchable={false}
        onChange={({value: access}) => onChange({"name": attribute.name, access})}
        value={value}
        options={options}/>
);
