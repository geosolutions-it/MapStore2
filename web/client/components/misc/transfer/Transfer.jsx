/*
 * Copyright 2019, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
*/

import React from 'react';
import PropTypes from 'prop-types';
import {Button, ButtonGroup} from 'react-bootstrap';

import LocaleUtils from '../../../utils/LocaleUtils';
import Message from '../../I18N/Message';
import Filter from '../Filter';
import CardList from './TransferColumnCardList';

const renderTools = (messages, tools) => (
    <ButtonGroup>
        {tools.map(({id, label, onClick = () => {}, tooltipId = ''}, idx) =>
            <Button
                key={id || idx}
                bsStyle="primary"
                className="square-button-md"
                tooltip={LocaleUtils.getMessageById(messages, tooltipId)}
                onClick={onClick}>
                {label}
            </Button>
        )}
    </ButtonGroup>
);

const renderMoveButtons = (messages, moveButtons) => (
    <ButtonGroup vertical>
        {moveButtons.map(({id, label, onClick = () => {}, disabled, tooltipId = ''}, idx) =>
            <Button
                key={id || idx}
                bsStyle="primary"
                className="square-button-md"
                tooltip={LocaleUtils.getMessageById(messages, tooltipId)}
                disabled={disabled}
                onClick={onClick}>
                {label}
            </Button>
        )}
    </ButtonGroup>
);

const localizeEmptyStateProps = (messages, {title, ...props}) => ({
    ...props,
    title: title && LocaleUtils.getMessageById(messages, title)
});

const renderColumn = (
    messages,
    side,
    {
        items = [],
        title = '',
        filterText = '',
        filterPlaceholder = '',
        tools = [],
        emptyStateProps = {},
        emptyStateSearchProps = {},
        onFilter = () => {}
    },
    allowCtrlMultiSelect,
    selectedItems,
    selectedSide,
    onSelect,
    sortStrategy,
    filter
) => (
    <div className={`ms2-transfer-subpanel ms2-transfer-${side}`}>
        <div className="ms2-transfer-header">
            <div className="ms2-transfer-title-area">
                <h4>
                    <Message msgId={title}/>
                    {renderTools(messages, tools)}
                </h4>
            </div>
            <Filter
                filterText={filterText}
                filterPlaceholder={LocaleUtils.getMessageById(messages, filterPlaceholder)}
                onFilter={onFilter}/>
        </div>
        <CardList
            items={sortStrategy(filter(filterText, items))}
            emptyStateProps={localizeEmptyStateProps(messages,
                items.length > 0 && filterText.length > 0 ? emptyStateSearchProps : emptyStateProps)}
            side={side}
            selectedItems={selectedItems}
            selectedSide={selectedSide}
            allowCtrlMultiSelect={allowCtrlMultiSelect}
            onSelect={onSelect}/>
    </div>
);

/**
 * Transfer component
 * @memberof components.misc.transfer
 * @function
 * @name Transfer
 * @prop {object} leftColumn object that describes a transfer column on the left. It should have the following properties
*  - *items*: an array of items
*  - *title*: column title
*  - *filterText*: current filter text
*  - *filterPlaceholder*: placeholder text of a filter input field
*  - *tools*: array that describes buttons that are rendered in the column's header
*  - *emptyStateProps*: empty state props when filter text is not present
*  - *emptyStateSearchProps*: empty state props when filter text is present
*  - *onFilter*: callback that is called when filter text changes
 * @prop {object} rightColumn object that describes a transfer column on the right. For object props see *leftColumn*
 * @prop {boolean} [allowCtrlMultiSelect=false] when true, allows multiple items selected when ctrl key is pressed
 * @prop {array} selectedItems array of selected items
 * @prop {string} selectedSide column that is currently selected. Can be 'left' or 'right'
 * @prop {string} className className to add to the root div
 * @prop {function} filter function used to filter items, by default returns the original array of items
 * @prop {function} sortStrategy function that sorts items
 * @prop {function} onSelect callback that is called when an item is selected
 * @prop {function} onTransfer callback that is called when items are to be transferred between columns
 * @prop {array} moveButtons allows to override default implementations of move buttons
 * @returns {object} react element
 */
const Transfer = ({
    leftColumn = {},
    rightColumn = {},
    allowCtrlMultiSelect = false,
    selectedItems = [],
    selectedSide,
    className,
    filter = (_, x) => x,
    sortStrategy = x => x,
    onSelect = () => {},
    onTransfer = () => {},
    moveButtons = [{
        id: 'all-right',
        label: '>>',
        disabled: !leftColumn.items || !leftColumn.items.length,
        onClick: () => {
            onTransfer(leftColumn.items, 'right');
            onSelect([]);
        }
    }, {
        id: 'right',
        label: '>',
        disabled: selectedSide !== 'left' || !selectedItems || !selectedItems.length,
        onClick: () => {
            onTransfer(selectedItems, 'right');
            onSelect([]);
        }
    }, {
        id: 'left',
        label: '<',
        disabled: selectedSide !== 'right' || !selectedItems || !selectedItems.length,
        onClick: () => {
            onTransfer(selectedItems, 'left');
            onSelect([]);
        }
    }, {
        id: 'all-left',
        label: '<<',
        disabled: !rightColumn.items || !rightColumn.items.length,
        onClick: () => {
            onTransfer(rightColumn.items, 'left');
            onSelect([]);
        }
    }]
}, context) => (
    <div className={`ms2-transfer${className ? ' ' + className : ''}`}>
        {renderColumn(context.messages, 'left', leftColumn, allowCtrlMultiSelect, selectedItems, selectedSide, onSelect, sortStrategy, filter)}
        {renderMoveButtons(context.messages, moveButtons)}
        {renderColumn(context.messages, 'right', rightColumn, allowCtrlMultiSelect, selectedItems, selectedSide, onSelect, sortStrategy, filter)}
    </div>
);
Transfer.contextTypes = {messages: PropTypes.object};

export default Transfer;
