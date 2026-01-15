import React, { useMemo } from 'react';
import FlexBox from '../layout/FlexBox';
import Message from '../I18N/Message';
import { FormControl, Glyphicon } from 'react-bootstrap';
import tooltip from '../misc/enhancers/tooltip';

const GlyphiconWithTooltip = tooltip(Glyphicon);

const ProjectionList = ({ filteredProjections, projectionList, selectedProjection, setConfig, setHoveredCrs }) => {
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
            </FlexBox>
            {filteredProjections.map(({ label, value }) => {
                const isSelected = projectionListValues.includes(value);
                const isCurrentProjection = selectedProjection === value;
                return (
                    <FlexBox
                        key={value}
                        centerChildrenVertically
                        gap="sm"
                        classNames={[isSelected ? 'active' : '', 'ms-crs-projection-item']}
                        onMouseEnter={() => setHoveredCrs(value)}
                        onMouseLeave={() => setHoveredCrs(null)}
                        onClick={() => {
                            setConfig({
                                defaultCrs: value,
                                projectionList: projectionListValues.includes(value)
                                    ? projectionList
                                    : [...projectionList, { value, label }]
                            });
                        }}
                    >
                        <div className="ms-selected-projection">
                            <FormControl
                                type="checkbox"
                                checked={isSelected}
                                onClick={(event) => event.stopPropagation()}
                                onChange={(event) => {
                                    setConfig({
                                        projectionList: event.target.checked
                                            ? [...projectionList, { value, label }]
                                            : projectionList.filter(c => c.value !== value)
                                    });
                                }}
                            />
                        </div>
                        <div>{label}</div>
                        <div>{value}</div>
                        <div className="ms-selected-projection">
                            {isCurrentProjection && (
                                <GlyphiconWithTooltip
                                    glyph="star"
                                    tooltip={<Message msgId="crsSelector.selectedProjection" />}
                                    tooltipPosition="top"
                                />
                            )}
                            {isSelected && !isCurrentProjection && (
                                <GlyphiconWithTooltip
                                    glyph="list"
                                    tooltip={<Message msgId="crsSelector.quickSwitch" />}
                                    tooltipPosition="top"
                                />
                            )}
                        </div>
                    </FlexBox>
                );
            })}
        </>
    );
};

export default ProjectionList;
