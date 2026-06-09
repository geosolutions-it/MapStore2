/*
 * Copyright 2025, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import React from 'react';
import PropTypes from 'prop-types';
import { Combobox } from 'react-widgets';
import AttributeEditor from './AttributeEditor';
import { isNil } from 'lodash';

const EnumerateEditorItem = (props) => {
    const { value, label } = props.item || {};
    return value === null ? <span style={{ display: 'inline-block', height: '1em' }} /> : label;
};
/**
 * Editor of the FeatureGrid, that allows to enumerate options for current property
 * @memberof components.data.featuregrid.editors
 * @name EnumerateEditor
 * @class
 */
export default class EnumerateEditor extends AttributeEditor {
    static propTypes = {
        value: PropTypes.oneOfType([
            PropTypes.string,
            PropTypes.number,
            PropTypes.null
        ]),
        schema: PropTypes.object,
        column: PropTypes.object,
        onTemporaryChanges: PropTypes.func
    };

    static defaultProps = {
        column: {}
    };

    constructor(props) {
        super(props);
        this.state = { selected: this.getOption(props.value) };
    }

    getOption = (value) => {
        return { value, label: isNil(value) ? '' : `${value}` };
    }

    getValue = () => {
        return {
            [this.props.column.key]: this.state?.selected?.value
        };
    }

    render() {
        const options = (this.props?.schema?.enum || []);
        const isValid = options.includes(this.state?.selected?.value);
        return (
            <div className={`ms-cell-editor${isValid ? '' : ' invalid'}`}>
                <Combobox
                    value={this.state.selected}
                    data={options.map(this.getOption)}
                    valueField="value"
                    textField="label"
                    itemComponent={EnumerateEditorItem}
                    onChange={(selected) => {
                        this.setState({ selected: selected ? selected : this.getOption(null) });
                    }}
                />
            </div>
        );
    }
}
