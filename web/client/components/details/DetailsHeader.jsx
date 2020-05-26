/*
 * Copyright 2020, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import React from 'react';

import Toolbar from '../misc/toolbar/Toolbar';

export default ({
    style,
    editing,
    canEdit = false,
    settings = {},
    contentChanged,
    loadFlags = {},
    onEdit = () => {},
    onCancelEdit = () => {},
    onSave = () => {},
    onSettingsChange = () => {}
}) => {
    return (canEdit ?
        <div style={style || {display: 'flex', justifyContent: 'center', padding: '8px 0 8px 0'}}>
            <Toolbar
                btnDefaultProps={{
                    className: 'square-button-md',
                    bsStyle: 'primary'
                }}
                buttons={[...(editing ? [{
                    disabled: loadFlags.detailsSaving,
                    glyph: 'arrow-left',
                    tooltipId: 'details.cancel',
                    onClick: () => onCancelEdit()
                }, {
                    disabled: !contentChanged || loadFlags.detailsSaving,
                    glyph: 'floppy-disk',
                    tooltipId: 'details.save',
                    onClick: () => onSave()
                }] : [{
                    glyph: 'pencil',
                    tooltipId: 'details.edit',
                    onClick: () => onEdit()
                }, {
                    glyph: 'new-window',
                    bsStyle: settings.showAsModal ? 'success' : 'primary',
                    tooltipId: 'details.showAsModal',
                    onClick: () => onSettingsChange('showAsModal', !settings.showAsModal)
                }, {
                    glyph: 'pushpin',
                    bsStyle: settings.showAtStartup ? 'success' : 'primary',
                    tooltipId: 'details.showAtStartup',
                    onClick: () => onSettingsChange('showAtStartup', !settings.showAtStartup)
                }])]}/>
        </div> : null
    );
};
