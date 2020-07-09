/*
 * Copyright 2020, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import React from 'react';
import GroupField from '../data/query/GroupField';
import Popover from './Popover';
import { Glyphicon, Button as ButtonRB } from 'react-bootstrap';
import tooltip from '../misc/enhancers/tooltip';

const Button = tooltip(ButtonRB);

const updateFilterField = (field = {}, action = {}) => {
    const newField = {
        ...field,
        [action.fieldName]: action.fieldValue,
        type: action.fieldType,
        fieldOptions: {
            ...field.fieldOptions,
            currentPage: action.fieldOptions.currentPage === undefined ? 1 : action.fieldOptions.currentPage
        }
    };
    if (action.fieldName === 'attribute') {
        return {
            ...newField,
            value: action.fieldType === 'string' ? '' : null,
            operator: ''
        };
    }
    if (action.fieldName === 'operator') {
        return {
            ...newField,
            value: null
        };
    }
    return newField;
};

const FilterBuilder = ({
    filterObj = {
        groupFields: [{ id: 1, logic: 'OR', index: 0 }]
    },
    attributes = [],
    groupLevels = 0,
    onChange = () => {}
}) => {
    const { groupFields, filterFields } = filterObj;
    return (
        <div className="ms-style-rule-filter">
            <GroupField
                attributes={attributes}
                filterFields={filterFields}
                groupFields={groupFields}
                autocompleteEnabled={false}
                groupLevels={groupLevels}
                withContainer={false}
                listOperators={['=']}
                stringOperators={['=', '<>', 'like', 'isNull']}
                booleanOperators={['=']}
                defaultOperators={['=', '>', '<', '>=', '<=', '<>']}
                logicComboOptions={[
                    {logic: 'OR', name: 'queryform.attributefilter.groupField.any'},
                    {logic: 'AND', name: 'queryform.attributefilter.groupField.all'}
                ]}
                actions={{
                    onAddGroupField: (groupId, index) => {
                        const newGroupField = {
                            id: new Date().getTime(),
                            logic: 'OR',
                            groupId: groupId,
                            index: index + 1
                        };
                        onChange({
                            filterFields,
                            groupFields: groupFields
                                ? [...groupFields, newGroupField]
                                : [newGroupField]
                        });
                    },
                    onAddFilterField: (groupId) => {
                        const newFilterField = {
                            rowId: new Date().getTime(),
                            groupId: groupId,
                            attribute: null,
                            operator: "",
                            value: null,
                            type: null,
                            fieldOptions: {
                                valuesCount: 0,
                                currentPage: 1
                            },
                            exception: null
                        };
                        onChange({
                            filterFields: filterFields
                                ? [...filterFields, newFilterField]
                                : [newFilterField],
                            groupFields
                        });
                    },
                    onRemoveFilterField: (rowId) => {
                        onChange({
                            filterFields: filterFields.filter((field) => field.rowId !== rowId),
                            groupFields
                        });
                    },
                    onUpdateFilterField: (rowId, fieldName, fieldValue, fieldType, fieldOptions = {}) => {
                        onChange({
                            filterFields: filterFields.map((field) => {
                                if (field.rowId === rowId) {
                                    return updateFilterField(field, {rowId, fieldName, fieldValue, fieldType, fieldOptions});
                                }
                                return field;
                            }),
                            groupFields
                        });
                    },
                    onUpdateExceptionField: (rowId, exceptionMessage) => {
                        onChange({
                            filterFields: filterFields.map((field) => {
                                if (field.rowId === rowId) {
                                    return { ...field, exception: exceptionMessage };
                                }
                                return field;
                            }),
                            groupFields
                        });
                    },
                    onUpdateLogicCombo: (groupId, logic) => {
                        onChange({
                            filterFields,
                            groupFields: groupFields.map((field) => {
                                if (field.id === groupId) {
                                    return { ...field, logic };
                                }
                                return field;
                            })
                        });
                    },
                    onRemoveGroupField: (groupId) => {
                        onChange({
                            filterFields: filterFields.filter((field) => field.groupId !== groupId),
                            groupFields: groupFields.filter((group) => group.id !== groupId)
                        });
                    },
                    onChangeCascadingValue: () => {}
                }}/>
        </div>
    );
};

export function FilterBuilderPopover({
    value,
    hide,
    attributes,
    onChange,
    placement = 'right'
}) {
    if (hide || !attributes || attributes.length === 0) {
        return null;
    }
    return (
        <Popover
            placement={placement}
            content={
                <FilterBuilder
                    filterObj={value}
                    attributes={attributes}
                    onChange={(filter) => onChange({ filter })}
                />
            }>
            <Button
                className="square-button-md no-border"
                active={!!value}
                tooltipId="styleeditor.openFilterBuilder">
                <Glyphicon
                    glyph="filter"
                />
            </Button>
        </Popover>
    );
}

export default FilterBuilder;
