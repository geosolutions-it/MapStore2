/*
 * Copyright 2023, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import React, { useState } from 'react';
import { Nav, NavItem, FormGroup, InputGroup } from "react-bootstrap";
import Popover from './Popover';
import SVGPreview from './SVGPreview';
import tooltip from '../misc/enhancers/tooltip';
import ButtonRB from '../misc/Button';
import MarkerUtils from '../../utils/MarkerUtils';
import Message from '../I18N/Message';
import DebouncedFormControl from '../misc/DebouncedFormControl';

const markers = MarkerUtils.markers.extra.getGrid().reduce((acc, row) =>
    [
        ...acc,
        ...row.markers.map((marker) => ({
            ...marker,
            url: MarkerUtils.markers.extra.markerToDataUrl({
                iconColor: marker.style.color,
                iconShape: marker.style.shape
            }),
            label: `${marker.style.color} ${marker.style.shape}`
        }))
    ]
, []);

const glyphs = Object.keys(MarkerUtils.getGlyphs('fontawesome'));

const Button = tooltip(ButtonRB);

/**
 * Component select the image property with `msMarkerIcon` function for an icon symbolizer
 * @memberof components.styleeditor
 * @name MarkerIconSelector
 * @prop {string} value image property
 * @prop {function} onChange returns the updated value
 */
function MarkerIconSelector({
    value,
    onChange = () => {}
}) {
    const [tab, setTab] = useState('marker');
    const [filter, setFilter] = useState('');
    const { args } = value || {};
    const { color, shape, glyph } = (args || [])[0] || {};
    const selectedMarker = markers.find(marker => marker.style.color === color && marker.style.shape === shape);
    const filteredMarkers = markers.filter(marker =>
        marker.style.color.includes(filter || '')
        || marker.style.shape.includes(filter || '')
        || marker.label.includes(filter || '')
    );
    const filteredGlyphs = glyphs.filter(glyphName => glyphName.includes(filter || ''));

    function handleOnChange(newValue) {
        return onChange({
            name: 'msMarkerIcon',
            args: [newValue]
        });
    }

    return (
        <Popover
            content={
                <div className="ms-mark-list" style={{ height: 256 }}>
                    <div
                        style={{
                            position: 'sticky',
                            top: 0,
                            zIndex: 10,
                            background: 'var(--ms-main-bg, #ffffff)'
                        }}
                    >
                        <Nav bsStyle="tabs" activeKey={tab}>
                            <NavItem
                                key="marker"
                                eventKey="marker"
                                onClick={() => setTab('marker')}>
                                {selectedMarker && <div style={{
                                    width: '1em',
                                    height: '1em',
                                    position: 'relative',
                                    display: 'inline-block'
                                }}>
                                    <SVGPreview
                                        type="polygon"
                                        patterns={[{
                                            id: `${color}-${shape}`,
                                            image: {
                                                href: selectedMarker.url,
                                                width: '160',
                                                height: '160'
                                            }
                                        }]}
                                        paths={[{
                                            fill: `url(#${color}-${shape})`
                                        }]}
                                    />
                                </div>} <Message msgId="styleeditor.marker"/>
                            </NavItem>
                            <NavItem
                                key="glyph"
                                eventKey="glyph"
                                onClick={() => setTab('glyph')}>
                                {glyph && <i className={`fa fa-${glyph}`}/>} <Message msgId="styleeditor.glyph"/>
                            </NavItem>
                        </Nav>
                        <FormGroup style={{ margin: '0.5em 0' }}>
                            <InputGroup style={{ width: '100%', padding: '0 0.5em' }}>
                                <DebouncedFormControl
                                    type={'text'}
                                    value={filter}
                                    placeholder="styleeditor.filterByName"
                                    style={{ zIndex: 0 }}
                                    onChange={eventValue => setFilter(eventValue)}/>
                            </InputGroup>
                        </FormGroup>
                    </div>
                    <ul>
                        {tab === 'marker' && filteredMarkers.map((marker) => {
                            const previewId = `${marker.style.color}-${marker.style.shape}`;
                            return (
                                <li
                                    key={previewId}>
                                    <Button
                                        tooltip={marker.label}
                                        className="ms-mark-preview"
                                        active={color === marker.style.color && shape === marker.style.shape}
                                        onClick={() => handleOnChange({
                                            color: marker.style.color,
                                            shape: marker.style.shape,
                                            glyph
                                        })}
                                    >
                                        <SVGPreview
                                            type="polygon"
                                            patterns={[{
                                                id: previewId,
                                                image: {
                                                    href: marker.url,
                                                    width: '160',
                                                    height: '160'
                                                }
                                            }]}
                                            paths={[{
                                                fill: `url(#${previewId})`
                                            }]}
                                        />
                                    </Button>
                                </li>
                            );
                        })}
                        {tab === 'glyph' && filteredGlyphs.map((glyphName) => {
                            return (
                                <li
                                    key={glyphName}>
                                    <Button
                                        tooltip={glyphName}
                                        className="ms-mark-preview"
                                        active={glyphName === glyph}
                                        onClick={() => handleOnChange({
                                            glyph: glyphName,
                                            color,
                                            shape
                                        })}
                                    >
                                        <i className={`fa fa-${glyphName}`}/>
                                    </Button>
                                </li>
                            );
                        })}
                    </ul>
                </div>
            }>
            <Button className="ms-mark-preview">
                {(color && shape && glyph) && <SVGPreview
                    type="polygon"
                    patterns={[{
                        id: `${color}-${shape}-${glyph}`,
                        image: {
                            href: MarkerUtils.markers.extra.markerToDataUrl({
                                iconColor: color,
                                iconShape: shape,
                                iconGlyph: glyph
                            }),
                            width: '160',
                            height: '160'
                        }
                    }]}
                    paths={[{
                        fill: `url(#${color}-${shape}-${glyph})`
                    }]}
                />}
            </Button>
        </Popover>
    );
}

export default MarkerIconSelector;
