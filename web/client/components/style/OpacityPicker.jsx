import PropTypes from 'prop-types';

/**
 * Copyright 2016, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import React from 'react';

import Slider from 'react-nouislider';
import 'react-nouislider/example/nouislider.css';
import './opacitypicker.css';

class OpacityPicker extends React.Component {
    static propTypes = {
        opacity: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
        onChange: PropTypes.func,
        disabled: PropTypes.bool
    };

    static defaultProps = {
        opacity: "1",
        onChange: () => {},
        disabled: false
    };

    render() {
        return (
            <div className="opacity-picker">
                <Slider
                    disabled={this.props.disabled}
                    start={[this.props.opacity * 100 ]}
                    range={{min: 0, max: 100}}
                    onChange={(v) => this.props.onChange("opacity", (v / 100).toFixed(2))}
                    connect="lower"
                    tooltips={[ {
                        to: function( value ) {
                            return Math.round(value) + '%';
                        }
                    }
                    ]}
                />
            </div>);
    }
}

export default OpacityPicker;
