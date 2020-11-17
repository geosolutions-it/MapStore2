/*
 * Copyright 2017, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import React from 'react';
import { Button, Glyphicon, FormControl } from 'react-bootstrap';
import Select from 'react-select';
import { isString } from 'lodash';

import SwitchButton from '../../misc/switch/SwitchButton';
import Message from '../../I18N/Message';

const DownloadWPSOptions = ({
    cropDataSetVisible = false,
    cropDataSetEnabled = false,
    donwloadFilteredVisible = false,
    downloadFilteredEnabled = false,
    advancedOptionsVisible = false,
    compressionOptions = ['CCITT RLE', 'LZW', 'JPEG', 'ZLib', 'PackBits', 'Deflate'],
    selectedCompression,
    tileWidth,
    tileHeight,
    quality,
    onChange = () => {}
}) => {
    const [advancedOptionsOpened, openAdvancedOptions] = React.useState(false);

    return (
        <>
            {cropDataSetVisible && <div className="mapstore-downloadwpsoptions-menuitem">
                <SwitchButton checked={cropDataSetEnabled} onClick={checked => onChange('cropDataSet', checked)}/>
                <Message msgId="layerdownload.cropDataSet"/>
            </div>}
            {donwloadFilteredVisible && <div className="mapstore-downloadwpsoptions-menuitem">
                <SwitchButton checked={downloadFilteredEnabled} onClick={checked => onChange('downloadFilteredDataSet', checked)}/>
                <Message msgId="layerdownload.downloadFilteredDataSet"/>
            </div>}
            {advancedOptionsVisible && <div className="mapstore-downloadwpsoptions-advanced-options">
                <Button className="no-border" onClick={() => openAdvancedOptions(!advancedOptionsOpened)}>
                    <Glyphicon glyph={`chevron-${advancedOptionsOpened ? 'down' : 'right'}`}/>
                </Button>
                <Message msgId="layerdownload.advancedOptions"/>
            </div>}
            {advancedOptionsOpened && advancedOptionsVisible && <div className="mapstore-downloadwpsoptions-advanced">
                <div className="mapstore-downloadwpsoptions-advanced-menuitem">
                    <Message msgId="layerdownload.compression"/>
                    <Select
                        clearable
                        value={selectedCompression}
                        options={compressionOptions.map(opt => isString(opt) ? {value: opt, label: opt} : opt)}
                        onChange={(e) => onChange('compression', e?.value)}/>
                </div>
                <div className="mapstore-downloadwpsoptions-advanced-menuitem">
                    <Message msgId="layerdownload.quality"/>
                    <div className="mapstore-downloadwpsoptions-advanced-menuitem-control">
                        <FormControl placeholder="0.75" type="number" min="0" max="1" value={quality || ''} onChange={e => onChange('quality', e.target.value)}/>
                    </div>
                </div>
                <div className="mapstore-downloadwpsoptions-advanced-menuitem">
                    <Message msgId="layerdownload.tileWidth"/>
                    <div className="mapstore-downloadwpsoptions-advanced-menuitem-control">
                        <FormControl
                            placeholder="256"
                            type="number"
                            min="0"
                            value={tileWidth || ''}
                            onChange={e => onChange('tileWidth', e.target.value && e.target.value.length > 0 ? `${parseInt(e.target.value, 10)}` : '')}/>
                        <span>px</span>
                    </div>
                </div>
                <div className="mapstore-downloadwpsoptions-advanced-menuitem">
                    <Message msgId="layerdownload.tileHeight"/>
                    <div className="mapstore-downloadwpsoptions-advanced-menuitem-control">
                        <FormControl
                            placeholder="256"
                            type="number"
                            min="0"
                            value={tileHeight || ''}
                            onChange={e => onChange('tileHeight', e.target.value && e.target.value.length > 0 ? `${parseInt(e.target.value, 10)}` : '')}/>
                        <span>px</span>
                    </div>
                </div>
            </div>}
        </>
    );
};

export default DownloadWPSOptions;
