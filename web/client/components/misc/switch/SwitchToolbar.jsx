/*
 * Copyright 2019, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
*/

import React from 'react';
import PropTypes from 'prop-types';
import Toolbar from '../toolbar/Toolbar';
import Message from '../../I18N/Message';


/**
 * Switch button with a toolbar.
 * @param {boolean} [checked=false] the status of the button
 * @param {boolean} [disabled=false] the disabled status
 * @prop {function} onClick handler for click
 */
class SwitchToolbar extends React.Component {

    static propTypes = {
        checked: PropTypes.bool,
        disabled: PropTypes.bool,
        onClick: PropTypes.func
    };

    static defaultProps = {
        checked: false,
        disabled: false,
        onClick: () => {}
    };

    render() {
        return (<Toolbar
            btnDefaultProps={{
                className: 'square-button-md',
                bsStyle: 'primary'
            }}
            btnGroupProps={{
                style: {
                    margin: 5
                }
            }}
            buttons={[
                {
                    glyph: this.props.checked ? 'chevron-down' : 'chevron-left',
                    visible: true,
                    disabled: this.props.disabled,
                    tooltip: this.props.checked ? <Message msgId="collapse"/> : <Message msgId="expand"/>,
                    onClick: () => this.props.onClick(!this.props.checked)
                }
            ]}
        />);
    }
}

export default SwitchToolbar;
