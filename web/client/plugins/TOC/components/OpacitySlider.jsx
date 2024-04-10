/*
 * Copyright 2018, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import React from 'react';

import PropTypes from 'prop-types';
import Slider from '../../../components/misc/Slider';
import { isNil, isArray } from 'lodash';

/**
 * Opacity slider for node component
 * @prop {boolean} hide hide the component
 * @prop {number} opacity opacity value
 * @prop {boolean} disabled disable the slider
 * @prop {boolean} hideTooltip hide the slider tooltip
 * @prop {function} onChange return the changed opacity
 */
class OpacitySlider extends React.Component {
    static propTypes = {
        hide: PropTypes.bool,
        opacity: PropTypes.number,
        disabled: PropTypes.bool,
        hideTooltip: PropTypes.bool,
        onChange: PropTypes.func
    };

    static defaultProps= {
        opacity: 1,
        onChange: () => {},
        visibility: true
    };

    render() {

        return this.props.hide ? null : (
            <div
                className={`mapstore-slider ${this.props.hideTooltip ? '' : 'with-tooltip'}`}
                onClick={(e) => { e.stopPropagation(); }}>
                {this.props.hideTooltip
                    ? <Slider
                        key="no-tooltip"
                        disabled={this.props.disabled}
                        start={[isNil(this.props.opacity) ? 100 : Math.round(this.props.opacity * 100)]}
                        range={{min: 0, max: 100}}
                        onChange={(opacity) => {
                            if (isArray(opacity) && opacity[0]) {
                                this.props.onChange(parseFloat(opacity[0].replace(' %', '') / 100));
                            }
                        }}/>
                    : <Slider
                        key="tooltip"
                        disabled={this.props.disabled}
                        start={[isNil(this.props.opacity) ? 100 : Math.round(this.props.opacity * 100)]}
                        tooltips={[true]}
                        format={{
                            from: value => Math.round(value),
                            to: value => Math.round(value) + ' %'
                        }}
                        range={{min: 0, max: 100}}
                        onChange={(opacity) => this.props.onChange(parseFloat(opacity[0].replace(' %', '')) / 100)}/>
                }
            </div>
        );
    }

}

export default OpacitySlider;
