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
import { Glyphicon as GlyphiconRB } from 'react-bootstrap';
import withTooltip from '../misc/enhancers/tooltip';
import { isBackgroundCompatibleWithProjection } from '../../utils/LayersUtils';
const Button = withTooltip(({ children, ...props }) => <button {...props}>{children}</button>);
const Glyphicon = withTooltip(GlyphiconRB);

function BackgroundLayersList({
    title,
    layers = [],
    showThumbnail = false,
    tools = [],
    onEdit = () => {},
    onRemove = () => {},
    projection,
    onToggleLayer = () => {},
    editTooltip,
    deleteTooltip
}) {
    return (
        <div>
            <FlexBox classNames={['_padding-lr-sm', '_padding-tb-xs']} centerChildrenVertically>
                <FlexBox.Fill fontSize="sm" component={Text}>{title}</FlexBox.Fill>
                {tools}
            </FlexBox>
            {layers.map((background, idx) => {
                const valid = isBackgroundCompatibleWithProjection(background, projection);
                const click = !valid ? () => {} : () => onToggleLayer(background);
                const itemClassNames = [
                    '_padding-lr-sm',
                    '_padding-tb-xs',
                    ...(background.visibility ? ['active'] : [])
                ];
                return (
                    <FlexBox
                        component="li"
                        key={idx}
                        gap="sm"
                        classNames={itemClassNames}
                        centerChildrenVertically
                        onClick={click}
                    >
                        {showThumbnail
                            ? <img src={background.thumbURL} />
                            : (
                                <button className={"ms-visibility-check"}>
                                    <Glyphicon glyph={background.visibility ? 'radio-on' : 'radio-off'} />
                                </button>
                            )}
                        <FlexBox.Fill component={Text} style={{ opacity: valid ? 1 : 0.6 }}>
                            {background.title || background.name || background?.options?.title}
                            {!valid && <Glyphicon
                                glyph="exclamation-sign"
                                tooltipId={'backgroundSelector.backgroundIncompatibleTooltip'}
                                tooltipPosition="right"
                                style={{
                                    marginLeft: '8px'
                                }}
                            />}
                        </FlexBox.Fill>
                        <FlexBox gap="sm">
                            {background?.editable ?
                                <Button
                                    tooltipId={editTooltip}
                                    onClick={(e) => {
                                        e.stopPropagation(); // Stop event from bubbling up
                                        onEdit(background);
                                    }}>
                                    <Glyphicon glyph="wrench"/>
                                </Button> : null}
                            {background.deletable ? <Button
                                tooltipId={deleteTooltip}
                                onClick={(e) => {
                                    e.stopPropagation(); // Stop event from bubbling up
                                    onRemove(background);
                                }}>
                                <Glyphicon glyph="trash" />
                            </Button> : null}
                        </FlexBox>
                    </FlexBox>
                );
            })}
        </div>
    );
}

export default BackgroundLayersList;
