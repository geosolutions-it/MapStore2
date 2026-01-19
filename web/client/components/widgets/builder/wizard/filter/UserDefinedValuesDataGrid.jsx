/*
 * Copyright 2025, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
import React, { useMemo, useCallback, useRef, useEffect } from 'react';
import PropTypes from 'prop-types';
import uuidv1 from 'uuid/v1';
import { Button as ButtonRB, Glyphicon } from 'react-bootstrap';
import { editors } from 'react-data-grid';
import tooltip from '../../../../misc/enhancers/tooltip';
import DataGrid from '../../../../data/grid/DataGrid';
import { isFilterValid } from '../../../../../utils/FilterUtils';
import './UserDefinedValuesDataGrid.less';

const { SimpleTextEditor } = editors;

const Button = tooltip(ButtonRB);

const createFilterId = () => uuidv1();

const UserDefinedValuesDataGrid = ({
    items = [],
    onChange = () => {},
    onEditFilter = () => {}
}) => {
    // Use ref to always have access to the latest items value
    const itemsRef = useRef(items);

    // Update ref whenever items changes
    useEffect(() => {
        itemsRef.current = items;
    }, [items]);

    const handleAdd = useCallback(() => {
        // Find the next filter number
        const currentItems = itemsRef.current;
        const nextNumber = currentItems.length + 1;
        const newItem = {
            id: createFilterId(),
            label: `Defined filter${nextNumber}`,
            value: '',
            filter: null
        };
        const updatedItems = [...currentItems, newItem];
        onChange(updatedItems);
    }, [onChange]);

    const handleRemove = useCallback((itemId) => {
        if (!itemId) {
            return;
        }
        const currentItems = itemsRef.current;
        const updatedItems = currentItems.filter(item => item?.id !== itemId);
        onChange(updatedItems);
    }, [onChange]);

    const handleGridRowsUpdated = useCallback(({ fromRow, toRow, updated }) => {
        const currentItems = itemsRef.current;
        const updatedItems = currentItems.map((item, idx) => {
            if (idx >= fromRow && idx <= toRow) {
                return { ...item, ...updated };
            }
            return item;
        });
        onChange(updatedItems);
    }, [onChange]);

    // Prepare rows data for the grid
    const rows = useMemo(() => {
        return items.map((item) => ({
            id: item?.id,
            label: item?.label || '',
            value: item?.value || '',
            filter: item?.filter || null
        }));
    }, [items]);

    // Define columns
    const columns = useMemo(() => {
        return [
            {
                key: 'label',
                name: 'Label',
                resizable: true,
                sortable: false,
                editable: true,
                editor: SimpleTextEditor
            },
            {
                key: 'filter',
                name: 'Filter',
                resizable: false,
                sortable: false,
                width: 100,
                formatter: ({ row }) => {
                    // Use existing utility to check if filter exists
                    const hasFilter = row.filter && typeof row.filter === 'object'
                        ? isFilterValid(row.filter)
                        : !!row.filter; // Handle string case
                    const bsStyle = hasFilter ? 'success' : 'primary';

                    return (
                        <div className="ms-filter-datagrid-filter-cell">
                            <Button
                                bsStyle={bsStyle}
                                bsSize="small"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    onEditFilter(row.id);
                                }}
                                title="Edit filter"
                                className="ms-filter-datagrid-filter-btn"
                            >
                                <Glyphicon glyph="filter" />
                            </Button>
                        </div>
                    );
                }
            },
            {
                key: 'actions',
                name: 'Actions',
                resizable: false,
                sortable: false,
                width: 100,
                formatter: ({ row }) => {
                    const rowId = row.id;

                    return (
                        <div className="ms-filter-datagrid-actions-cell">
                            <Button
                                bsStyle="link"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    handleRemove(rowId);
                                }}
                                title="Delete"
                                className="ms-filter-datagrid-action-btn"
                            >
                                <Glyphicon glyph="trash" />
                            </Button>
                        </div>
                    );
                }
            }
        ];
    }, [handleRemove, onEditFilter]);

    // Row getter function
    const rowGetter = (rowIdx) => {
        return rows[rowIdx] || {};
    };

    return (
        <>
            <div className="ms-filter-datagrid-header">
                <span className="ms-filter-datagrid-title">Filters</span>
                <Button
                    bsStyle="primary"
                    bsSize="small"
                    onClick={handleAdd}
                    className="ms-filter-datagrid-add-btn"
                    tooltip="Add filter"
                    tooltipPosition="top"
                >
                    <Glyphicon glyph="plus" />
                </Button>
            </div>

            {/* DataGrid */}
            <div className="ms-filter-user-defined-datagrid">
                <DataGrid
                    columns={columns}
                    rowGetter={rowGetter}
                    rowsCount={rows.length}
                    minHeight={200}
                    enableCellSelect
                    onGridRowsUpdated={handleGridRowsUpdated}
                    minWidth={430}
                />
            </div>
        </>
    );
};

UserDefinedValuesDataGrid.propTypes = {
    items: PropTypes.array,
    onChange: PropTypes.func,
    onEditFilter: PropTypes.func
};

export default UserDefinedValuesDataGrid;

