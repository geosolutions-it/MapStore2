/*
 * Copyright 2025, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import React from 'react';

const MARKS_TYPES = {
    line: ({ mark }) => {
        return (
            <line
                x1={mark.x1}
                y1={mark.y1}
                x2={mark.x2}
                y2={mark.y2}
                stroke={mark.stroke}
                strokeWidth={mark["stroke-width"]}
                strokeOpacity={mark["stroke-opacity"]}
                strokeLinecap={mark["stroke-linecap"]}
                strokeLinejoin={mark["stroke-linejoin"]}
                opacity={mark.opacity}
            />
        );
    },
    polygon: ({ mark }) => {
        return (
            <polygon
                points={mark.points}
                stroke={mark.stroke}
                strokeWidth={mark["stroke-width"]}
                strokeOpacity={mark["stroke-opacity"]}
                fill={mark.fill}
                fillOpacity={mark["fill-opacity"]}
                opacity={mark.opacity}
            />
        );
    },
    circle: ({ mark }) => {
        return (
            <circle
                cx={mark.cx}
                cy={mark.cy}
                r={mark.r}
                fill={mark.fill}
                fillOpacity={mark["fill-opacity"]}
                stroke={mark.stroke}
                strokeWidth={mark["stroke-width"]}
                strokeOpacity={mark["stroke-opacity"]}
            />
        );
    },
    polyline: ({ mark }) => {
        return (
            <polyline
                points={mark.points}
                stroke={mark.stroke}
                strokeWidth={mark["stroke-width"]}
                strokeOpacity={mark["stroke-opacity"]}
                opacity={mark.opacity}
                fill={mark.fill}
                fillOpacity={mark["fill-opacity"]}
            />
        );
    }
};

const GraphicPattern = ({ id, symbolizer, type }) => {
    const graphic = type === 'line' ? symbolizer["graphic-stroke"] : symbolizer["graphic-fill"];
    const mark = graphic?.graphics?.[0];

    if (!graphic || !mark) return null;

    const size = Number(graphic.size || 10);
    const rotation = Number(graphic.rotation || 0);
    const opacity = Number(graphic.opacity ?? 1);

    const margin =
        symbolizer["vendor-options"]?.["graphic-margin"]
            ?.split(" ")
            .map(Number) || [0, 0];

    const patternWidth = size + margin[0];
    const patternHeight = size + margin[1];

    const getMarkTypes = () => {
        switch (mark.mark) {
        case "shape://horline":
            return MARKS_TYPES.line({
                mark: {
                    ...mark,
                    x1: 0,
                    y1: size / 2,
                    x2: size,
                    y2: size / 2,
                    opacity
                }
            });
        case "line":
        case "shape://vertline":
            return MARKS_TYPES.line({
                mark: {
                    ...mark,
                    x1: size / 2,
                    y1: 0,
                    x2: size / 2,
                    y2: size,
                    opacity
                }
            });
        case "shape://slash":
            return MARKS_TYPES.line({
                mark: {
                    ...mark,
                    x1: 0,
                    y1: size,
                    x2: size,
                    y2: 0,
                    opacity
                }
            });
        case "shape://backslash":
            return MARKS_TYPES.line({
                mark: {
                    ...mark,
                    x1: 0,
                    y1: 0,
                    x2: size,
                    y2: size,
                    opacity
                }
            });
        case "circle":
            return MARKS_TYPES.circle({
                mark: {
                    ...mark,
                    cx: size / 2,
                    cy: size / 2,
                    r: size / 4
                }
            });
        case "triangle":
            return MARKS_TYPES.polygon({ mark: { ...mark, points: `${size / 2},0 0,${size} ${size},${size}` } });
        case "star":
            const cx = size / 2;
            const cy = size / 2;
            const outerR = size / 2;
            const innerR = size / 2.5;

            const points = [];
            for (let i = 0; i < 10; i++) {
                const angle = (Math.PI / 5) * i - Math.PI / 2;
                const r = i % 2 === 0 ? outerR : innerR;
                points.push(
                    `${cx + r * Math.cos(angle)},${cy + r * Math.sin(angle)}`
                );
            }
            return MARKS_TYPES.polygon({ mark: { ...mark, points, fill: mark.fill ?? "#000" } });
        case "cross":
            return MARKS_TYPES.polygon({ mark: { ...mark, points: `${size / 2},0 ${size / 2},${size} ${size},${size / 2}` } });
        case "shape://dot":
            return MARKS_TYPES.circle({
                mark: {
                    ...mark,
                    cx: size / 2,
                    cy: size / 2,
                    r: size / 8,
                    opacity
                }
            });
        case "shape://plus":
            return <>
                {MARKS_TYPES.line({
                    mark: {
                        ...mark,
                        x1: 0,
                        y1: size / 2,
                        x2: size,
                        y2: size / 2,
                        opacity
                    }
                })}
                {MARKS_TYPES.line({
                    mark: {
                        ...mark,
                        x1: size / 2,
                        y1: 0,
                        x2: size / 2,
                        y2: size,
                        opacity
                    }
                })}
            </>;
        case "shape://times":
            return <>
                {MARKS_TYPES.line({
                    mark: {
                        ...mark,
                        x1: 0,
                        y1: size,
                        x2: size,
                        y2: 0,
                        opacity
                    }
                })}
                {MARKS_TYPES.line({
                    mark: {
                        ...mark,
                        x1: 0,
                        y1: size,
                        x2: size,
                        y2: 0,
                        opacity
                    }
                })}
            </>;
        case "shape://oarrow":
            return MARKS_TYPES.polyline({
                mark: {
                    ...mark,
                    points: `
                        0,0
                        ${size},${size / 2}
                        0,${size}
                    `,
                    fill: "none",
                    stroke: mark.stroke,
                    strokeWidth: mark["stroke-width"],
                    strokeOpacity: mark["stroke-opacity"],
                    opacity
                }
            });

        case "shape://carrow":
            return MARKS_TYPES.polygon({
                mark: {
                    ...mark,
                    points: `0,0 ${size},${size / 2} 0,${size}`,
                    opacity
                }
            });
        case "extshape://triangle":
            return MARKS_TYPES.polygon({ mark: { ...mark, points: `${size / 2},0 0,${size} ${size},${size}`, opacity, fill: mark.fill ?? "none" } });
        case "extshape://emicircle":
            const rx = size / 2;
            const ry = size / 4;
            return (
                <path
                    d={`M 0,${ry * 2} A ${rx} ${ry} 0 0 1 ${rx * 2},${ry * 2} L ${rx * 2},${ry * 2} Z`}
                    fill={mark.fill ?? "none"}
                    stroke={mark.stroke}
                    strokeWidth={mark["stroke-width"]}
                    opacity={mark.opacity}
                />
            );
        case "extshape://triangleemicircle": {
            const triangleHeight = size / 2;
            const semicircleRadius = size / 4;
            return (
                <>
                    {MARKS_TYPES.polygon({
                        mark: {
                            ...mark,
                            points: `
                                    ${size / 2},0
                                    0,${triangleHeight}
                                    ${size},${triangleHeight}
                                `,
                            fill: mark.fill ?? "none",
                            opacity
                        }
                    })}
                    <path
                        d={`
                                M ${size / 2 - semicircleRadius},${triangleHeight} 
                                A ${semicircleRadius} ${semicircleRadius} 0 0 0 ${size / 2 + semicircleRadius},${triangleHeight} 
                                L ${size / 2 + semicircleRadius},${triangleHeight + semicircleRadius} 
                                L ${size / 2 - semicircleRadius},${triangleHeight + semicircleRadius} 
                                Z
                            `}
                        fill={mark.fill ?? "none"}
                        stroke={mark.stroke}
                        strokeWidth={mark["stroke-width"] || 1}
                        strokeOpacity={mark["stroke-opacity"]}
                        opacity={opacity}
                    />
                </>
            );
        }
        case "extshape://narrow":
            return MARKS_TYPES.polygon({
                mark: {
                    ...mark,
                    points: `
                            ${size / 2},0
                            0,${size}
                            ${size},${size}
                        `,
                    fill: mark.fill ?? "none",
                    opacity
                }
            });
        case "extshape://sarrow":
            return MARKS_TYPES.polygon({
                mark: {
                    ...mark,
                    points: `
                                0,0
                                ${size},0
                                ${size / 2},${size}
                            `,
                    fill: mark.fill ?? "none",
                    opacity
                }
            });
        case "square":
        default:
            return MARKS_TYPES.polygon({
                mark: {
                    ...mark,
                    points: `0,0 ${size},0 ${size},${size} 0,${size}`,
                    fill: mark.fill ?? "none",
                    opacity
                }
            });
        }
    };

    return (
        <defs>
            <pattern
                id={id}
                patternUnits="userSpaceOnUse"
                width={patternWidth}
                height={patternHeight}
            >
                <g
                    transform={`
                        rotate(${rotation}
                        ${patternWidth / 2}
                        ${patternHeight / 2})
                    `}
                    opacity={opacity}
                >
                    {getMarkTypes()}
                </g>
            </pattern>
        </defs>
    );
};

export default GraphicPattern;
