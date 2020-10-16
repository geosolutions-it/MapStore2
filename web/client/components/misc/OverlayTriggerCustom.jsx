/**
 * Copyright 2020, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root dir
 ectory of this source tree.
 */

import React from 'react';
import ReactDOM from 'react-dom';
import PropTypes from 'prop-types';
import { Overlay } from 'react-bootstrap';

import withContainer from './WithContainer';

/**
 * OverlayTrigger custom implementation to work around a tooltip not being triggered
 * on mouse hover if the button being overlayed is disabled in Chrome. The workaround is to wrap
 * the child component with a span. Potentially can be expanded to support the features of OverlayTrigger
 * and replace it completely.
 */
class OverlayTriggerCustom extends React.Component {
    static propTypes = {
        overlay: PropTypes.element,
        placement: PropTypes.string,
        container: PropTypes.element
    };

    static defaultProps = {
        placement: 'right'
    };

    constructor(props) {
        super(props);
        this.state = {
            show: false
        };
        this.target = React.createRef();
    }

    render() {
        return (
            <>
                <span ref={this.target} onMouseOver={() => this.setState({show: true})} onMouseOut={() => this.setState({show: false})}>
                    {React.Children.only(this.props.children)}
                </span>
                <Overlay
                    show={this.state.show}
                    onHide={() => this.setState({ show: false })}
                    placement={this.props.placement}
                    container={this.props.container}
                    target={() => this.target && this.target.current && ReactDOM.findDOMNode(this.target.current)}
                >
                    {this.props.overlay}
                </Overlay>
            </>
        );
    }
}

export default withContainer(OverlayTriggerCustom);
