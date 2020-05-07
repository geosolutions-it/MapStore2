/*
 * Copyright 2019, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import React, {useState} from 'react';
import { Glyphicon } from 'react-bootstrap';

import Message from '../I18N/Message';
import BorderLayout from '../layout/BorderLayout';
import SideGrid from '../misc/cardgrids/SideGrid';
import Toolbar from '../misc/toolbar/Toolbar';
import BaseFilter from '../misc/Filter';
import ConfirmDialog from '../misc/ConfirmDialog';
import emptyState from '../misc/enhancers/emptyState';
import localizedProps from '../misc/enhancers/localizedProps';
import FileFormatUtils from '../../utils/FileFormatUtils';

const Filter = localizedProps('filterPlaceholder')(BaseFilter);

const MapTemplatesListBase = ({
    items = [],
    favouriteItems = []
}) => {
    const favouritesElement = (
        <div className="map-templates-favourites">
            <h4><Message msgId="mapTemplates.favouritesTitle"/></h4>
            <SideGrid
                size="sm"
                items={favouriteItems}/>
            <hr/>
        </div>
    );

    return (
        <>
            {favouriteItems.length > 0 ? favouritesElement : null}
            <div className="map-templates-all">
                {favouriteItems.length > 0 ? <h4><Message msgId="mapTemplates.allTitle"/></h4> : null}
                <SideGrid
                    items={items}/>
            </div>
        </>
    );
};

const MapTemplatesList = emptyState(({items = []}) => items.length === 0, ({totalTemplateCount}) => ({
    glyph: totalTemplateCount ? 'filter' : 'ban-circle',
    title: <Message msgId={totalTemplateCount ? "mapTemplates.emptyTitle" : "mapTemplates.noTemplatesTitle"}/>,
    description: <Message msgId={totalTemplateCount ? "mapTemplates.emptyDescription" : "mapTemplates.noTemplatesDescription"}/>
}))(MapTemplatesListBase);

const match = (filterText = '', template = {}) =>
    ['name', 'description']
        .map(k => template[k])
        .map((string = '') => string.toLowerCase().indexOf(filterText.toLowerCase()) !== -1)
        .reduce((p, n) => p || n, false);

export default ({
    templates = [],
    onMergeTemplate = () => {},
    onReplaceTemplate = () => {},
    onToggleFavourite = () => {}
}) => {
    const [filterText, onFilter] = useState('');
    const [templateToReplace, setTemplateToReplace] = useState();
    const [showConfirm, onShowConfirm] = useState(false);

    const templateToItem = (template, isFavouriteList) => ({
        template,
        title: template.name,
        description: template.description,
        loading: template.loading,
        style: {pointerEvents: 'none'},
        preview:
            <div className="map-templates-preview">
                {template.thumbnail && template.thumbnail !== 'NODATA' ?
                    <img src={decodeURIComponent(template.thumbnail)}/> :
                    <Glyphicon glyph="1-map"/>}
            </div>,
        infoExtra:
            template.format && <div className={`map-templates-formaticon${isFavouriteList ? " map-templates-favourite" : ""}`}>
                <Glyphicon glyph={FileFormatUtils.formatToGlyph[template.format]}/>
                <span>{FileFormatUtils.formatToText[template.format]}</span>
            </div>,
        tools: <Toolbar
            btnDefaultProps={{
                className: 'square-button-md'
            }}
            buttons={[{
                glyph: 'transfer',
                bsStyle: 'primary',
                tooltipId: 'mapTemplates.transfer',
                onClick: (e) => {
                    e.stopPropagation();
                    setTemplateToReplace(template);
                    onShowConfirm(true);
                }
            }, {
                glyph: 'plus',
                bsStyle: 'primary',
                tooltipId: 'mapTemplates.merge',
                onClick: (e) => {
                    e.stopPropagation();
                    onMergeTemplate(template.id, template.data);
                }
            }, {
                glyph: template.favourite ? 'star' : 'star-empty',
                className: 'square-button-md no-border',
                tooltipId: template.favourite ? 'mapTemplates.favouriteRemove' : 'mapTemplates.favouriteAdd',
                onClick: (e) => {
                    e.stopPropagation();
                    onToggleFavourite(template.id);
                }
            }]}/>
    });

    const sortedTemplates = templates.slice().sort((t1, t2) => t1.name > t2.name ? 1 : t1.name === t2.name ? 0 : -1);

    const filteredTemplates = sortedTemplates.filter(match.bind(null, filterText));
    const items = filteredTemplates.map(template => templateToItem(template, false));
    const favouriteItems = filteredTemplates.filter(template => template.favourite).map(template => templateToItem(template, true));

    return (
        <>
            <BorderLayout
                className="map-templates-panel"
                header={
                    <div style={{padding: '8px 15px'}}>
                        <Filter
                            filterPlaceholder="mapTemplates.filterPlaceholder"
                            filterText={filterText}
                            onFilter={onFilter}/>
                    </div>
                }>
                <MapTemplatesList
                    totalTemplateCount={templates.length}
                    items={items}
                    favouriteItems={favouriteItems}/>
            </BorderLayout>
            <ConfirmDialog
                modal
                show={showConfirm}
                title={<Message msgId="mapTemplates.confirmReplaceTitle"/>}
                onClose={() => {
                    setTemplateToReplace();
                    onShowConfirm(false);
                }}
                onConfirm={() => {
                    onReplaceTemplate(templateToReplace.id, templateToReplace.data);
                    setTemplateToReplace();
                    onShowConfirm(false);
                }}
                confirmButtonBSStyle="default"
                confirmButtonContent={<Message msgId="mapTemplates.confirmReplaceConfirmButton"/>}
                closeText={<Message msgId="cancel"/>}
                closeGlyph="1-close">
                <Message msgId="mapTemplates.confirmReplaceMessage"/>
            </ConfirmDialog>
        </>
    );
};
