/*
 * Copyright 2026, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
import React, { useMemo } from 'react';
import { FormControl, Glyphicon } from 'react-bootstrap';

import FlexBox from '../../../components/layout/FlexBox';
import Message from '../../../components/I18N/Message';
import tooltip from '../../../components/misc/enhancers/tooltip';

import './ProjectionList.less';

const GlyphiconWithTooltip = tooltip(Glyphicon);

export const ProjectionList = ({
    filteredProjections,
    projectionList,
    selectedProjection,
    dynamicCodes,
    onToggle,
    onUseAsMapProjection,
    onRemoveDynamic,
    setHoveredCrs
}) => {
    const projectionListValues = useMemo(() => projectionList.map(p => p.value), [projectionList]);
    return (
        <>
            <FlexBox centerChildrenVertically gap="sm" className="ms-crs-projections-header">
                <div className="ms-selected-projection">
                    <GlyphiconWithTooltip
                        glyph="info-sign"
                        tooltip={<Message msgId="crsSelector.help" />}
                        tooltipPosition="top"
                    />
                </div>
                <div><Message msgId="crsSelector.label" /></div>
                <div><Message msgId="crsSelector.authorityId" /></div>
                <div className="ms-selected-projection" />
                <div className="ms-selected-projection" />
            </FlexBox>
            {filteredProjections.length === 0 && (
                <div className="ms-crs-projections-empty">
                    <Message msgId="crsSelector.noFilteredMatch" />
                </div>
            )}
            {filteredProjections.map(({ label, value }) => {
                const isSelected = projectionListValues.includes(value);
                const isCurrentProjection = selectedProjection === value;
                const isDynamic = dynamicCodes.has(value);
                const toggleSelection = () => {
                    onToggle(isSelected
                        ? projectionList.filter(c => c.value !== value)
                        : [...projectionList, { value, label }]);
                };
                return (
                    <FlexBox
                        key={value}
                        centerChildrenVertically
                        gap="sm"
                        classNames={[isSelected ? 'active' : '', 'ms-crs-projection-item']}
                        onMouseEnter={() => setHoveredCrs(value)}
                        onMouseLeave={() => setHoveredCrs(null)}
                        onClick={toggleSelection}
                    >
                        <div className="ms-selected-projection">
                            <FormControl
                                type="checkbox"
                                checked={isSelected}
                                onClick={(event) => event.stopPropagation()}
                                onChange={toggleSelection}
                            />
                        </div>
                        <div>{label}</div>
                        <div>{value}</div>
                        <div className="ms-selected-projection">
                            <GlyphiconWithTooltip
                                glyph={isCurrentProjection ? 'star' : 'star-empty'}
                                tooltip={<Message msgId={isCurrentProjection
                                    ? 'crsSelector.selectedProjection'
                                    : 'crsSelector.useAsMapProjection'} />}
                                tooltipPosition="top"
                                onClick={(event) => {
                                    event.stopPropagation();
                                    if (!isCurrentProjection) {
                                        onUseAsMapProjection(value);
                                    }
                                }}
                                className={isCurrentProjection ? 'ms-crs-row-action is-active' : 'ms-crs-row-action'}
                            />
                        </div>
                        <div className="ms-selected-projection">
                            {isDynamic && (
                                <GlyphiconWithTooltip
                                    glyph="trash"
                                    tooltip={<Message msgId="crsSelector.removeProjection" />}
                                    tooltipPosition="top"
                                    onClick={(event) => {
                                        event.stopPropagation();
                                        onRemoveDynamic(value);
                                    }}
                                    className="ms-crs-row-action"
                                />
                            )}
                        </div>
                    </FlexBox>
                );
            })}
        </>
    );
};
