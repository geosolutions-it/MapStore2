/*
 * Copyright 2017, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
*/
const React = require('react');
const PropTypes = require('prop-types');
const {AutocompleteWFSCombobox} = require('./AutocompleteWFSCombobox');
const {createWFSFetchStream} = require('../../observables/autocomplete');

class AutocompleteWFSComboboxContainer extends React.Component {
    static propTypes = {
        autocompleteStreamFactory: PropTypes.func,
        onChangeDrawingStatus: PropTypes.func,
        url: PropTypes.string,
        filter: PropTypes.string,
        valueField: PropTypes.string,
        textField: PropTypes.string,
        value: PropTypes.string
    };
    static defaultProps = {
        filter: "contains"
    };
    render() {
        return <AutocompleteWFSCombobox {...this.props} autocompleteStreamFactory={createWFSFetchStream}/>;
    }
}

module.exports = AutocompleteWFSComboboxContainer;
