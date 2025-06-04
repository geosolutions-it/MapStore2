/*
 * Copyright 2017, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import React, {useEffect, useState} from 'react';
import { Button, Glyphicon, FormControl } from 'react-bootstrap';
import Select from 'react-select';
import { isString, head } from 'lodash';

import SwitchButton from '../../misc/switch/SwitchButton';
import Message from '../../I18N/Message';

const DownloadWPSOptions = ({
    advancedOptionsVisible = true,
    cropDataSetVisible = false,
    cropDataSetEnabled = false,
    downloadFilteredVisible = false,
    downloadFilteredEnabled = false,
    rasterOptionsVisibile = false,
    compressionOptions = ['Deflate', 'JPEG', 'PackBits', 'LZW', 'CCITT RLE', 'ZLib'],
    selectedCompression,
    tileWidth,
    tileHeight,
    quality,
    placeholders = {
        /* select placeholder attribute not taking props */
        tileWidth: '256',
        tileHeight: '256',
        quality: '0.75'
    },
    srsList,
    selectedSrs,
    onChange = () => {}
}) => {
    const [advancedOptionsOpened, openAdvancedOptions] = useState(false);

    useEffect(() => {
        onChange('compression', selectedCompression || head(compressionOptions));
    }, []);

    return (
        <>
            {advancedOptionsVisible && <div className="mapstore-downloadwpsoptions-advanced-options">
                <Button className="no-border" onClick={() => openAdvancedOptions(!advancedOptionsOpened)}>
                    <Glyphicon glyph={`chevron-${advancedOptionsOpened ? 'down' : 'right'}`}/>
                    &nbsp;&nbsp;&nbsp;
                    <Message msgId="layerdownload.advancedOptions"/>
                </Button>
            </div>}
            {advancedOptionsOpened && advancedOptionsVisible &&
            <div className="mapstore-downloadwpsoptions-advanced">

                {/* select SRS must be always visibile */}
                <div className="mapstore-downloadwpsoptions-advanced-menuitem">
                    <div className="mapstore-downloadwpsoptions-advanced-menuitem-control">
                        <label><Message msgId="layerdownload.srs" /></label>
                        <Select
                            clearable={false}
                            value={selectedSrs}
                            onChange={(sel) => onChange("selectedSrs", sel.value)}
                            options={srsList.map(f => ({value: f.name, label: f.label || f.name}))} />
                    </div>
                </div>


                {cropDataSetVisible && <>
                    <div className="mapstore-downloadwpsoptions-advanced-menuitem">
                        <div className="mapstore-downloadwpsoptions-advanced-menuitem-control">
                            <SwitchButton checked={cropDataSetEnabled} onClick={checked => onChange('cropDataSet', checked)}/>
                            <Message msgId="layerdownload.cropDataSet"/>
                        </div>
                    </div>
                </>
                }

                { // TODO instead of disabling this we might make it disabled but always visible
                    downloadFilteredVisible && <>
                        <div className="mapstore-downloadwpsoptions-advanced-menuitem">
                            <div className="mapstore-downloadwpsoptions-advanced-menuitem-control">
                                <SwitchButton checked={downloadFilteredEnabled} onClick={checked => onChange('downloadFilteredDataSet', checked)}/>
                                <Message msgId="layerdownload.downloadFilteredDataSet"/>
                            </div>
                        </div>
                    </>
                }

                {rasterOptionsVisibile && <>

                    <div className="mapstore-downloadwpsoptions-advanced-menuitem">
                        <Message msgId="layerdownload.compression"/>
                        <div className="mapstore-downloadwpsoptions-advanced-menuitem-control">
                            <Select
                                clearable={false}
                                value={selectedCompression}
                                options={compressionOptions.map(opt => isString(opt) ? {value: opt, label: opt} : opt)}
                                onChange={(e) => onChange('compression', e?.value)}/>
                        </div>
                    </div>
                    <div className="mapstore-downloadwpsoptions-advanced-menuitem">
                        <Message msgId="layerdownload.quality"/>
                        <div className="mapstore-downloadwpsoptions-advanced-menuitem-control">
                            <FormControl
                                placeholder={placeholders.quality}
                                type="number"
                                size="4"
                                min="0"
                                max="1"
                                step="0.1"
                                value={quality || ''}
                                onChange={e => onChange('quality', e.target.value)}/>
                        </div>
                    </div>
                    <div className="mapstore-downloadwpsoptions-advanced-menuitem">
                        <Message msgId="layerdownload.tileWidth"/>
                        <div className="mapstore-downloadwpsoptions-advanced-menuitem-control">
                            <FormControl
                                placeholder={placeholders.tileWidth}
                                type="number"
                                size="4"
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
                                placeholder={placeholders.tileHeight}
                                type="number"
                                size="4"
                                min="0"
                                value={tileHeight || ''}
                                onChange={e => onChange('tileHeight', e.target.value && e.target.value.length > 0 ? `${parseInt(e.target.value, 10)}` : '')}/>
                            <span>px</span>
                        </div>
                    </div>
                </>}
            </div>}
        </>
    );
};

export default DownloadWPSOptions;
