import React, { useMemo } from 'react';
import FlexBox from '../layout/FlexBox';
import Message from '../I18N/Message';
import { FormControl, Glyphicon } from 'react-bootstrap';
import tooltip from '../misc/enhancers/tooltip';
import { isString } from 'lodash';

const GlyphiconWithTooltip = tooltip(Glyphicon);

export const formatCRSItem = function(item) {
    const { id, label } = item;
    const key = id.toLowerCase().replace(':', '');
    const finalLabel = label && isString(label) && label.trim() ? label : id;
    const finalValue = id.toUpperCase();
    return { key, value: finalValue, label: finalLabel };
};

export const ProjectionList = ({
    filteredProjections,
    projectionList,
    selectedProjection,
    setConfig,
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

export const ProjectionListRemote = ({
    searchResults,
    projectionList,
    onLoadProjectionDef,
    setConfig
}) => {
    const projectionListValues = useMemo(() => projectionList.map(p => p.value), [projectionList]);
    return (
        <div>
            <FlexBox centerChildrenVertically gap="sm" className="ms-crs-projections-header">
                <div className="ms-selected-projection">
                    <GlyphiconWithTooltip
                        glyph="info-sign"
                        tooltip={<Message msgId="crsSelector.help" />}
                        tooltipPosition="top"
                    />
                </div>
                {/* TODO enable when label enabled in backend <div><Message msgId="crsSelector.label" /></div> */}
                <div><Message msgId="crsSelector.authorityId" /></div>
                <div className="ms-selected-projection" />
            </FlexBox>
            <div className="ms-crs-projections-results">
                { Array.isArray(searchResults) && searchResults.map((crsItem) => {
                    // TODO ask to backend to return also label in list endpoint
                    const { key, value, label } = formatCRSItem(crsItem);
                    const isSelected = projectionListValues.includes(value);
                    return (
                        <FlexBox
                            key={key}
                            centerChildrenVertically
                            gap="sm"
                            classNames="ms-crs-projection-item"
                        >
                            <div className="ms-selected-projection">
                                <FormControl
                                    type="checkbox"
                                    checked={isSelected}
                                    value={value}
                                    onClick={(event) => event.stopPropagation()}
                                    onChange={({target}) => {
                                        const targetValue = target.value.toUpperCase();
                                        if (target.checked) {
                                            onLoadProjectionDef(targetValue); // load definition wkt from geoserver rest
                                        }
                                        setConfig({
                                            projectionList: target.checked
                                                ? [...projectionList, { value: targetValue, label: targetValue }]
                                                : projectionList.filter(c => c.value !== targetValue)
                                        });
                                    }}
                                />
                            </div>
                            <div>{label}</div>
                            {/* TODO enable when label enabled in backend <div>{value}</div> */}
                        </FlexBox>
                    );
                })}
            </div>
        </div>
    );
};
