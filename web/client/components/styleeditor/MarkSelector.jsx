/*
 * Copyright 2020, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import React, { useEffect, useState } from 'react';
import Popover from './Popover';
import SVGPreview from './SVGPreview';
import wellKnownName from './config/wellKnownName';
import tooltip from '../misc/enhancers/tooltip';
import axios from '../../libs/ajax';
import ButtonRB from '../misc/Button';
const Button = tooltip(ButtonRB);

let cacheOptions = {};

const getSVGOption = (value, previewId, label) => {
    return {
        label,
        value: value,
        preview: {
            type: 'point',
            patterns: [{
                id: previewId,
                image: {
                    href: value,
                    width: '120',
                    height: '120'
                }
            }],
            paths: [{
                d: 'M40 40 L160 40 L160 160 L40 160Z',
                stroke: '#000000',
                fill: `url(#${previewId})`,
                strokeWidth: 0
            }]
        }
    };
};

function MarkSelector({
    value,
    config = {},
    onChange = () => {},
    svgSymbolsPath
}) {
    const {
        options = wellKnownName
    } = config;
    const [svgOptions, setSvgOptions] = useState([]);
    const [loading, setLoading] = useState(false);
    const selected = svgOptions.length === 0 && (value || '').includes('.svg')
        ? getSVGOption(value, value)
        : [ ...options, ...svgOptions ].find(option => option.value === value);

    useEffect(() => {
        if (svgSymbolsPath && !loading) {
            setLoading(true);
            if (cacheOptions[svgSymbolsPath]) {
                setSvgOptions(cacheOptions[svgSymbolsPath]);
            } else {
                axios.get(svgSymbolsPath)
                    .then(({ data }) => {
                        const newOptions = data.map(({ name, label }) => {
                            const svgValue = `${svgSymbolsPath.replace('symbols.json', '')}${name}.svg`;
                            const previewId = `${name}-svg`;
                            return getSVGOption(svgValue, previewId, label);
                        });
                        cacheOptions[svgSymbolsPath] = newOptions;
                        setSvgOptions(newOptions);
                    })
                    .finally(() => { setLoading(false); });
            }
        }
    }, [svgSymbolsPath]);

    return (
        <Popover
            content={
                <div className="ms-mark-list">
                    <ul>
                        {[...options, ...svgOptions].map((option) => {
                            return (
                                <li
                                    key={option.value}>
                                    <Button
                                        tooltip={option.label || option.value}
                                        className="ms-mark-preview"
                                        active={option.value === value}
                                        onClick={() => onChange(option.value)}
                                    >
                                        <SVGPreview {...option.preview}/>
                                    </Button>
                                </li>
                            );
                        })}
                    </ul>
                </div>
            }>
            <Button className="ms-mark-preview">
                {selected && <SVGPreview {...selected.preview}/>}
            </Button>
        </Popover>
    );
}

export default MarkSelector;
