/*
 * Copyright 2025, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import React from 'react';
import FlexBox from '../../components/layout/FlexBox';
import Text from '../../components/layout/Text';
import { Glyphicon } from 'react-bootstrap';
import { has, includes, indexOf } from 'lodash';

function BackgroundLayersList({
    title,
    layers = [],
    showThumbnail = true,
    tools = [],
    onEdit = () => {},
    onRemove = () => {},
    projection,
    onToggleLayer = () => {},
    mode,
    allowDeletion,
    allowEditing
}) {
    return (
        <div>
            <FlexBox classNames={['_padding-lr-sm', '_padding-tb-xs']} centerChildrenVertically>
                <FlexBox.Fill fontSize="sm" component={Text}>{title}</FlexBox.Fill>
                {tools}
            </FlexBox>
            {layers.map((background, idx) => {
                const compatibleCrs = ['EPSG:4326', 'EPSG:3857', 'EPSG:900913'];
                const validCrs = indexOf(compatibleCrs, projection) > -1;
                const compatibleWmts = background.type === "wmts" && has(background.allowedSRS, projection);
                const valid = ((validCrs || compatibleWmts || includes(["wms", "empty", "osm", "tileprovider"], background.type)) && !background.invalid );
                const click = !valid ? () => {} : () => onToggleLayer(background);
                return (
                    <FlexBox
                        component="li"
                        key={idx}
                        gap="sm"
                        classNames={['_padding-lr-sm', '_padding-tb-xs', ...(background.visibility ? ['active'] : [])]}
                        centerChildrenVertically
                        onClick={click}
                    >
                        {showThumbnail
                            ? <img src={background.thumbURL}/>
                            : (
                                <button className={"ms-visibility-check"}>
                                    <Glyphicon glyph={background.visibility ? 'radio-on' : 'radio-off'} />
                                </button>
                            )}
                        <FlexBox.Fill component={Text}>
                            {background?.title}
                        </FlexBox.Fill>
                        {mode !== 'mobile' && <FlexBox gap="sm">
                            {background?.editable && (allowEditing && ['wms', 'wmts', 'tms', 'tileprovider', 'cog', 'terrain'].includes(background.type)) ? <button onClick={(e) => {
                                e.stopPropagation(); // Stop event from bubbling up
                                onEdit(background);
                            }}>
                                <Glyphicon glyph="wrench"/>
                            </button> : null}
                            {!background.notDeletable && allowDeletion && <button onClick={(e) => {
                                e.stopPropagation(); // Stop event from bubbling up
                                onRemove(background);
                            }}>
                                <Glyphicon glyph="trash" />
                            </button>}
                        </FlexBox>}
                    </FlexBox>
                );
            })}
        </div>
    );
}

export default BackgroundLayersList;
