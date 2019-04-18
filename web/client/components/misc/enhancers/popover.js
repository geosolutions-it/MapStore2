/*
 * Copyright 2019, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
const React = require('react');
const {branch, toClass} = require('recompose');
const PropTypes = require('prop-types');
const { omit } = require('lodash');

const {
    Popover
} = require('react-bootstrap');

const OverlayTrigger = require('../../misc/OverlayTrigger');

/**
 * Enhancer to add a popover to a component that triggers on mouse hover.
 * The new Component will look at the `popover` property (an object).
 * If present, as an object, can contain the properties to pass to th PopOver component (react-bootstrap),and the following props:
 * @prop {array[string]} popover.trigger trigger events array (see OverlayTrigger)
 * @prop {element} popover.text content of the popover
 * @type {function}
 * @name popover
 * @memberof components.misc.enhancers
 *
*/
module.exports = branch(
    ({popover}) => popover,
    (Wrapped) =>
        class InfoPopover extends React.Component {

            static propTypes = {
                popover: PropTypes.object
            };

            static defaultProps = {
                popover: {
                    trigger: true
                }
            };

            renderPopover() {
                return (
                    <Popover
                        {...omit(this.props.popover, ['trigger', 'placement', 'text'])} >
                        {this.props.popover.text}
                    </Popover>
                );
            }
            renderContent() {
                const CMP = toClass(Wrapped); // allow usage of `ref`
                return (<CMP {...(omit(this.props, ["popover"]))} />);
            }
            render() {
                const trigger = this.props.popover.trigger === true ? ['hover', 'focus'] : this.props.popover.trigger;
                return (
                    <span>
                        {(<OverlayTrigger trigger={trigger} placement={this.props.popover.placement} overlay={this.renderPopover()}>
                            {this.renderContent()}
                        </OverlayTrigger>)
                        }
                    </span>
                );
            }
        }
);
