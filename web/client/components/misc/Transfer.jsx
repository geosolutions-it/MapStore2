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

import LocaleUtils from '../../utils/LocaleUtils';
import Message from '../I18N/Message';
import Filter from './Filter';
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
