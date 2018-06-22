/*
 * Copyright 2018, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

const React = require('react');
const PropTypes = require('prop-types');
const Slider = require('../../misc/Slider');
const {isNil, isArray} = require('lodash');

class OpacitySlider extends React.Component {
    static propTypes = {
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

        return (
            <div
                className={`mapstore-slider ${this.props.hideTooltip ? '' : 'with-tooltip'}`}
                onClick={(e) => { e.stopPropagation(); }}>
                {this.props.hideTooltip &&
                <Slider
                    disabled={this.props.disabled}
                    start={[isNil(this.props.opacity) ? 100 : Math.round(this.props.opacity * 100)]}
                    range={{min: 0, max: 100}}
                    onChange={(opacity) => {
                        if (isArray(opacity) && opacity[0]) {
                            this.props.onChange(parseFloat(opacity[0].replace(' %', '') / 100));
                        }
                    }}/>
                ||
                <Slider
                    disabled={this.props.disabled}
                    start={[isNil(this.props.opacity) ? 100 : Math.round(this.props.opacity * 100)]}
                    tooltips={[true]}
                    format={{
                        from: value => Math.round(value),
                        to: value => Math.round(value) + ' %'
                    }}
                    range={{min: 0, max: 100}}
                    onChange={(opacity) => this.props.onChange(parseFloat(opacity[0].replace(' %', '')) / 100)}/>}
            </div>
        );
    }

}

module.exports = OpacitySlider;
