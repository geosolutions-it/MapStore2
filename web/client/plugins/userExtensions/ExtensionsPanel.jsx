/*
 * Copyright 2019, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import React from 'react';
import { connect } from 'react-redux';
import { createSelector } from 'reselect';
import { compose, withState } from 'recompose';

import { Glyphicon } from 'react-bootstrap';

import { updateUserPlugin } from '../../actions/context';
import { userPluginsSelector } from '../../selectors/context';

import Message from '../../components/I18N/Message';
import BorderLayout from '../../components/layout/BorderLayout';
import SideGrid from '../../components/misc/cardgrids/SideGrid';
import BaseFilter from '../../components/misc/Filter';
import Toolbar from '../../components/misc/toolbar/Toolbar';
import emptyState from '../../components/misc/enhancers/emptyState';
import localizedProps from '../../components/misc/enhancers/localizedProps';
import withPluginsDefinition from './withPluginsDefinition';

const Filter = localizedProps('filterPlaceholder')(BaseFilter);

const ExtensionList = emptyState(({ filteredItems, filterText }) => filterText && filteredItems.length === 0, {
    glyph: 'filter',
    title: <Message msgId="userExtensions.emptyTitle" />,
    description: <Message msgId="userExtensions.emptyDescription" />
})(({ filteredItems, onSelect }) => {

    return (
        <SideGrid
            className="user-extensions"
            size="sm"
            items={filteredItems.map((extension) => ({
                preview: <div style={{ position: 'relative', width: '100%', height: '100%', backgroundColor: extension.active ? 'transparent' : '#ddd', display: 'flex' }}>
                    <Glyphicon glyph={extension.glyph || 'plug'} style={{ fontSize: 26, margin: 'auto', color: '#ffffff' }} />
                </div>,
                title: extension.title || extension.name,
                description: extension.description,
                selected: extension.active,
                loading: extension.loading,
                onClick: () => onSelect(extension),
                tools: (
                    <Toolbar
                        btnDefaultProps={{
                            className: 'square-button-md no-border'
                        }}
                        buttons={[
                            {
                                glyph: extension.active ? 'plug' : 'unplug',
                                bsStyle: extension.active ? 'primary' : 'default',
                                tooltipId: extension.active ? 'userExtensions.removeExtension' : 'userExtensions.addExtension',
                                onClick: (event) => {
                                    event.stopPropagation();
                                    onSelect(extension);
                                }
                            }
                        ]} />
                )
            }))} />
    );
});

const match = (filterText, extension) =>
    ['name', 'title', 'description']
        .map( k => extension[k])
        .map((string = "") => string.toLowerCase().indexOf(filterText.toLowerCase()) !== -1)
        .reduce((p, n) => p || n, false);

const ExtensionsPanel = ({
    filterText,
    onFilter,
    extensions = [],
    onSelect = () => { }
}) => {
    const filteredItems = extensions
        .filter((ext) => {
            return !filterText
                || filterText && match(filterText, ext);
        });
    return (<BorderLayout
        header={
            <div style={{ padding: '8px 15px' }}>
                <Filter
                    filterPlaceholder="userExtensions.filterPlaceholder"
                    filterText={filterText}
                    onFilter={onFilter} />
            </div>
        }>
        <ExtensionList
            filterText={filterText}
            filteredItems={filteredItems}
            onSelect={onSelect} />
    </BorderLayout>);
};


export default compose(
    connect(
        createSelector(userPluginsSelector, extensions => ({extensions})),
        {
            onSelect: (extension) => updateUserPlugin(extension.name, { active: !extension.active })
        }
    ),
    // get plugins configuration
    withPluginsDefinition(),
    // localize extensions labels
    localizedProps('extensions', 'title'),
    localizedProps('extensions', 'description'),
    // add filter state handling
    withState('filterText', 'onFilter')
)(ExtensionsPanel);
