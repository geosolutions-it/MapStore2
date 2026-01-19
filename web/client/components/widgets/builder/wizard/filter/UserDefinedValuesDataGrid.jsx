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
import { Glyphicon } from 'react-bootstrap';
import { editors } from 'react-data-grid';
import tooltip from '../../../../misc/enhancers/tooltip';
import Button from '../../../../layout/Button';
import DataGrid from '../../../../data/grid/DataGrid';
import Message from '../../../../I18N/Message';
import { isFilterValid } from '../../../../../utils/FilterUtils';
import './UserDefinedValuesDataGrid.less';

const { SimpleTextEditor } = editors;

const TButton = tooltip(Button);

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
                name: <Message msgId="widgets.filterWidget.label" />,
                resizable: true,
                sortable: false,
                editable: true,
                editor: SimpleTextEditor
            },
            {
                key: 'filter',
                name: <Message msgId="widgets.filterWidget.filter" />,
                resizable: false,
                sortable: false,
                width: 100,
                formatter: ({ row }) => {
                    // Use existing utility to check if filter exists
                    const hasFilter = row.filter && typeof row.filter === 'object'
                        ? isFilterValid(row.filter)
                        : !!row.filter; // Handle string case
                    const variant = hasFilter ? 'success' : 'primary';

                    return (
                        <div className="ms-filter-datagrid-filter-cell">
                            <TButton
                                variant={variant}
                                size="small"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    onEditFilter(row.id);
                                }}
                                tooltip={<Message msgId="widgets.filterWidget.addUserDefinedFilterValueTooltip" />}
                                className="ms-filter-datagrid-filter-btn"
                            >
                                <Glyphicon glyph="filter" />
                            </TButton>
                        </div>
                    );
                }
            },
            {
                key: 'actions',
                name: <Message msgId="widgets.filterWidget.actions" />,
                resizable: false,
                sortable: false,
                width: 100,
                formatter: ({ row }) => {
                    const rowId = row.id;

                    return (
                        <div className="ms-filter-datagrid-actions-cell">
                            <TButton
                                variant="link"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    handleRemove(rowId);
                                }}
                                tooltip={<Message msgId="widgets.filterWidget.delete" />}
                                className="ms-filter-datagrid-action-btn"
                            >
                                <Glyphicon glyph="trash" />
                            </TButton>
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
                <span className="ms-filter-datagrid-title">{<Message msgId="widgets.filterWidget.filters" />}</span>
                <TButton
                    variant="primary"
                    size="small"
                    onClick={handleAdd}
                    className="ms-filter-datagrid-add-btn"
                    tooltip={<Message msgId="widgets.filterWidget.addUserDefinedFilterTooltip" />}
                    tooltipPosition="top"
                >
                    <Glyphicon glyph="plus" />
                </TButton>
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

