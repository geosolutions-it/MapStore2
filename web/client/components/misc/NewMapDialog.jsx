/*
 * Copyright 2020, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import React from 'react';
import { Glyphicon } from 'react-bootstrap';

import ResizableModal from './ResizableModal';
import TransferColumnCardList from './transfer/TransferColumnCardList';
import Loader from './Loader';
import Message from '../I18N/Message';

const contextToItem = (onSelect, context) => ({
    title: context.name,
    description: context.description,
    preview:
        <div className="new-map-preview">
            {context.thumbnail && context.thumbnail !== 'NODATA' ?
                <img src={context.thumbnail}/> :
                <Glyphicon glyph="1-map"/>}
        </div>,
    onClick: () => onSelect(context)
});

export default ({show, loading, onClose = () => {}, onSelect = () => {}, contexts = []}) => (
    <ResizableModal
        title={<Message msgId="newMapDialog.title"/>}
        show={show}
        fade
        clickOutEnabled={false}
        buttons={[{
            text: <Message msgId="newMapDialog.skipButtonTitle"/>,
            bsStyle: 'primary',
            onClick: () => onSelect()
        }, {
            text: <Message msgId="cancel"/>,
            bsStyle: 'primary',
            onClick: () => onClose()
        }]}
        onClose={onClose}
    >
        <div className="new-map-dialog">
            {loading && <div className="new-map-loader"><Loader size={100}/></div>}
            {!loading && <TransferColumnCardList items={contexts.map(contextToItem.bind(null, onSelect))}/>}
        </div>
    </ResizableModal>
);
