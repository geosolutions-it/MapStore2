/*
 * Copyright 2019, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */


import PropTypes from 'prop-types';
import React from 'react';

class ObliqueLabel extends React.Component {
    static propTypes = {
        angle: PropTypes.number,
        onUpdateLabelLength: PropTypes.func,
        payload: PropTypes.object,
        x: PropTypes.number,
        y: PropTypes.number
    }

    static defaultProps = {
        angle: 0,
        payload: {}
    }

    componentDidMount() {
        if (this.label ) {
            // update margin left
            const marginLeft = Math.floor(this.label.getClientRects()[0].width * Math.cos(Math.PI / 180 * this.props.angle));

            // update margin bottom
            const marginBottom = Math.ceil(this.label.getClientRects()[0].height * Math.sin(Math.PI / 180 * this.props.angle));
            this.props.onUpdateLabelLength({marginLeft, marginBottom});
        }
    }

    render() {
        const {x, y, payload, angle } = this.props;

        /* the tranform on g tag is used to place labels on x axis, in particular:
         * - when angle is over 75° the label needs to be translated left to be
         * aligned with the tick on the x axis
         * - it is also moved down a bit to avoid to collide with the tick

         * rotate on the text is needed to create an oblique label in particular,
         * y = 0 allows all labels to be aligned on the same line
        */
        return (
            <g transform={`translate(${x - (angle >= 75 ? 10 : 0)},${y + 5})`}>
                <text
                    ref={(t) => {this.label = t; }}
                    x={0}
                    y={0}
                    dy={16}
                    textAnchor="end"
                    fill="#666"
                    transform={`rotate(-${angle})`}
                >
                    {payload.value}
                </text>
            </g>
        );
    }


}

export default ObliqueLabel;
