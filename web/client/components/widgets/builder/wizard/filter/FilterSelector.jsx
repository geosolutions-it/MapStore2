/*
 * Copyright 2025, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
import React, { useMemo, useState } from 'react';
import PropTypes from 'prop-types';
import { FormGroup, FormControl, InputGroup, Button, Glyphicon } from 'react-bootstrap';
import Select from 'react-select';
import FlexBox from '../../../../layout/FlexBox';
import tooltip from '../../../../misc/enhancers/tooltip';
import localizedProps from '../../../../misc/enhancers/localizedProps';
import Message from '../../../../I18N/Message';

const NEW_FILTER_ID = 'new-filter';
const TButton = tooltip(Button);
const LocalizedFormControl = localizedProps('placeholder')(FormControl);


const FilterSelector = ({
    filters = [],
    selectedFilterId,
    onSelect = () => {},
    onAdd = () => {},
    onDelete = () => {},
    onRename = () => {}
}) => {
    const [editMode, setEditMode] = useState(false);
    const [editValue, setEditValue] = useState('');

    const selectedFilter = useMemo(
        () => filters.find(filter => filter.id === selectedFilterId),
        [filters, selectedFilterId]
    );

    const options = useMemo(() => {
        return filters.map((filter) => {
            const filterLabel = filter.layout?.label || '';
            const displayLabel = filterLabel ? `[Filter] - ${filterLabel}` : `[Filter]`;
            return {
                value: filter.id,
                label: displayLabel
            };
        });
    }, [filters]);

    const handleSelect = (value) => {
        if (value === NEW_FILTER_ID) {
            onSelect(null);
            setEditMode(false);
            return;
        }
        onSelect(value);
        setEditMode(false);
    };

    const handleToggleEdit = () => {
        if (!selectedFilter) {
            return;
        }
        if (editMode) {
            onRename(selectedFilter.id, editValue);
            setEditMode(false);
            return;
        }
        setEditValue(selectedFilter.layout?.label || '');
        setEditMode(true);
    };

    const handleAdd = () => {
        setEditMode(false);
        onAdd();
    };

    const handleDelete = () => {
        setEditMode(false);
        if (selectedFilter) {
            onDelete(selectedFilter.id);
        }
    };

    const currentValue = selectedFilterId || NEW_FILTER_ID;

    return (
        <div className="ms-filter-selector">
            <FormGroup>
                <InputGroup>
                    <FlexBox>
                        <FlexBox.Fill>
                            {editMode && selectedFilter
                                ? (
                                    <LocalizedFormControl
                                        type="text"
                                        value={editValue}
                                        placeholder="widgets.filterWidget.filterTitlePlaceholder"
                                        onChange={(event) => setEditValue(event.target.value)}
                                    />
                                )
                                : (
                                    <Select
                                        clearable={false}
                                        value={currentValue}
                                        options={options}
                                        onChange={(option) => handleSelect(option?.value)}
                                    />
                                )
                            }
                        </FlexBox.Fill>
                    </FlexBox>
                    <InputGroup.Button>
                        <TButton
                            bsStyle="primary"
                            onClick={handleToggleEdit}
                            disabled={!selectedFilter}
                            tooltip={editMode ? "" : <Message msgId="widgets.filterWidget.editFilterTitleTooltip" />}
                        >
                            <Glyphicon glyph={editMode ? 'ok' : 'pencil'} />
                        </TButton>
                    </InputGroup.Button>
                    <InputGroup.Button>
                        <TButton
                            bsStyle="primary"
                            onClick={handleAdd}
                            tooltip={<Message msgId="widgets.filterWidget.addNewFilterTooltip" />}
                        >
                            <Glyphicon glyph="plus" />
                        </TButton>
                    </InputGroup.Button>
                    <InputGroup.Button>
                        <TButton
                            bsStyle="primary"
                            onClick={handleDelete}
                            disabled={!selectedFilter || filters.length <= 1}
                            tooltip={<Message msgId="widgets.filterWidget.delete" />}
                        >
                            <Glyphicon glyph="trash" />
                        </TButton>
                    </InputGroup.Button>
                </InputGroup>
            </FormGroup>
        </div>
    );
};

FilterSelector.propTypes = {
    filters: PropTypes.arrayOf(PropTypes.shape({
        id: PropTypes.string,
        name: PropTypes.string,
        data: PropTypes.object
    })),
    selectedFilterId: PropTypes.string,
    onSelect: PropTypes.func,
    onAdd: PropTypes.func,
    onDelete: PropTypes.func,
    onRename: PropTypes.func
};

export default FilterSelector;

