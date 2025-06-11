/*
 * Copyright 2025, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
*/

import PropTypes from 'prop-types';
import React from 'react';

import { createCustomPagedUniqueAutompleteStream } from '../../../../observables/autocomplete';
import ConfigUtils from '../../../../utils/ConfigUtils';
import { AutocompleteCombobox } from '../../../misc/AutocompleteCombobox';
import AttributeEditor from './AttributeEditor';

/**
 * Editor for FeatureGrid, used for strings with auto-complete
 *
 * @name CustomAutocompleteEditor
 * @memberof components.data.featuregrid.editors
 * @prop {object} column - The column object representing the attribute being edited.
 * @prop {string} dataType - The data type of the attribute.
 * @prop {object} inputProps - Additional input properties passed to AutocompleteCombobox.
 * @prop {function} isValid - A function to validate the input value.
 * @prop {function} onBlur - Callback triggered when the input loses focus.
 * @prop {string} url - The base URL for the WPS service.
 * @prop {string} typeName - The typename of the layer currently being edited.
 * @prop {string} value - The current value of the attribute being edited.
 * @prop {string} isValidRegex - An optional regex string for validation.
 * @prop {object} filterProps - Configuration for filtering and fetching unique values.
 * @prop {string[]} filterProps.blacklist - An array of values to exclude from the fetched results.
 * @prop {number} filterProps.maxFeatures - The maximum number of unique features to fetch per page.
 * @prop {string[]} filterProps.queriableAttributes - An array of attribute names from the `typeName` layer.
 * @prop {string} filterProps.predicate - The comparison operator for filtering (e.g., "ILIKE", "EQUAL_TO").
 * @prop {string} filterProps.srsName - The SRS name to use in WFS queries.
 * @prop {string} filterProps.typeName - The typename of the **source layer** from which to fetch unique values.
 * @prop {boolean} filterProps.performFetch - If `false`, fetching will be disabled.
 * @type {Object}
 */
class CustomAutocompleteEditor extends AttributeEditor {
    static propTypes = {
        column: PropTypes.object,
        dataType: PropTypes.string,
        inputProps: PropTypes.object,
        isValid: PropTypes.func,
        onBlur: PropTypes.func,
        url: PropTypes.string,
        typeName: PropTypes.string,
        value: PropTypes.string,
        isValidRegex: PropTypes.string,
        filterProps: PropTypes.shape({
            blacklist: PropTypes.arrayOf(PropTypes.string),
            maxFeatures: PropTypes.number,
            queriableAttributes: PropTypes.arrayOf(PropTypes.string),
            predicate: PropTypes.string,
            srsName: PropTypes.string,
            typeName: PropTypes.string,
            performFetch: PropTypes.bool
        })
    };
    static defaultProps = {
        isValid: () => true,
        dataType: "string",
        filter: "contains",
        filterProps: {
            maxFeatures: 5,
            predicate: "ILIKE",
            srsName: "EPSG:4326",
            queriableAttributes: [],
            performFetch: true
        }
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
        return (
            <AutocompleteCombobox
                {...this.props}
                url={ConfigUtils.getParsedUrl(this.props.url, {"outputFormat": "json"})}
                filter="contains"
                autocompleteStreamFactory={createCustomPagedUniqueAutompleteStream}
            />
        );
    }
}

export default CustomAutocompleteEditor;
