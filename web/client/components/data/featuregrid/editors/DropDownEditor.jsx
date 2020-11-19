/*
 * Copyright 2017, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
*/
import React from 'react';

import PropTypes from 'prop-types';
import AttributeEditor from './AttributeEditor';
import ControlledCombobox from '../../../misc/combobox/ControlledCombobox';
import { forceSelection } from '../../../../utils/FeatureGridEditorUtils';
import { head } from 'lodash';
import assign from 'object-assign';

/**
 * Editor that provides a DropDown menu of a list of elements passed.
 * @memberof components.data.featuregrid.editors
 * @class
 * @name DropDownEditor
 * @prop {string[]} editorProps.values list of valid values
 */
class DropDownEditor extends AttributeEditor {
    static propTypes = {
        column: PropTypes.object,
        dataType: PropTypes.string,
        defaultOption: PropTypes.string,
        forceSelection: PropTypes.bool,
        allowEmpty: PropTypes.bool,
        inputProps: PropTypes.object,
        isValid: PropTypes.func,
        onBlur: PropTypes.func,
        typeName: PropTypes.string,
        url: PropTypes.string,
        value: PropTypes.string,
        filter: PropTypes.string,
        values: PropTypes.array,
        labels: PropTypes.array
    };
    static defaultProps = {
        isValid: () => true,
        dataType: "string",
        filter: "contains",
        values: [],
        forceSelection: true,
        allowEmpty: true
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
        this.getValueByLabel = (label) => {
            try {
                return this.props.values[this.props.labels.indexOf(label)];
            } catch (e) {
                return label;
            }
        };
        this.getValue = () => {
            const updated = super.getValue();
            if (this.props.forceSelection) {
                return {[this.props.column.key]: forceSelection({
                    oldValue: this.props.defaultOption,
                    changedValue: this.getValueByLabel(updated[this.props.column && this.props.column.key]),
                    data: this.props.values,
                    allowEmpty: this.props.allowEmpty})};
            }
            if (this.props.allowEmpty) {
                return updated;
            }
            // this case is only when forceSelection and allowEmpty are falsy, but this is contractidtory!! so the default option is used
            return {[this.props.column.key]: forceSelection({
                oldValue: this.props.defaultOption,
                changedValue: this.getValueByLabel(updated[this.props.column && this.props.column.key]),
                data: this.props.values,
                allowEmpty: this.props.allowEmpty})};
        };
    }
    render() {
        const self = this;
        var data = [];
        if (this.props.values && this.props.labels && this.props.values.lenght === this.props.labels.lenght) {
            this.props.values.forEach(function(value, id) {
                data.push({label: self.props.labels[id], value: value});
            });
        } else {
            data = this.props.values.map(v => {return {label: v, value: v}; });
        }

        const props = assign({}, {...this.props}, {
            data,
            defaultOption: this.props.defaultOption || head(this.props.values)
        });
        return <ControlledCombobox {...props} filter={this.props.filter}/>;
    }
}

export default DropDownEditor;
