/*
 * Copyright 2017, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
*/
const React = require('react');
const PropTypes = require('prop-types');
const AttributeEditor = require('./AttributeEditor');
const {AutocompleteCombobox} = require('../../../misc/AutocompleteCombobox');
const {getParsedUrl} = require('../../../../utils/ConfigUtils');
const {createPagedUniqueAutompleteStream} = require('../../../../observables/autocomplete');

/**
 * Editor for FeatureGrid, used for strings with auto-complete
 *
 * @name AutocompleteEditor
 * @memberof components.data.featuregrid.editors
 * @type {Object}
 */
class AutocompleteEditor extends AttributeEditor {
    static propTypes = {
        column: PropTypes.object,
        dataType: PropTypes.string,
        inputProps: PropTypes.object,
        isValid: PropTypes.func,
        onBlur: PropTypes.func,
        autocompleteStreamFactory: PropTypes.func,
        url: PropTypes.string,
        typeName: PropTypes.string,
        value: PropTypes.string
    };
    static defaultProps = {
        isValid: () => true,
        dataType: "string"
    };
    constructor(props) {
        super(props);
        this.validate = (value) => {
            try {
                return this.props.isValid(value[this.props.column && this.props.column.key]);
            } catch (e) {
                return false;
            }
        };
        this.getValue = () => {
            const updated = super.getValue();
            return updated;
        };
    }
    render() {
        return <AutocompleteCombobox {...this.props} url={getParsedUrl(this.props.url, {"outputFormat": "json"})} filter="contains" autocompleteStreamFactory={createPagedUniqueAutompleteStream}/>;
    }
}

module.exports = AutocompleteEditor;
