/*
 * Copyright 2019, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import React, { Component } from "react";
import PropTypes from 'prop-types';
import stickybits from 'stickybits';

export default WrappedComponent =>

    class StickySupport extends Component {
        static propTypes = {
            scrollContainerSelector: PropTypes.string,
            height: PropTypes.number,
            width: PropTypes.number
        };

        static defaultProps = {
            scrollContainerSelector: '.ms-sections-container',
            height: 0,
            width: 0
        };

        state = {
            style: {}
        };

        componentDidMount() {
            this._stickybits = this._node && stickybits(this._node, {
                scrollEl: this.props.scrollContainerSelector,
                noStyles: true,
                useGetBoundingClientRect: true
            });
            this.update(this.props.scrollContainerSelector);
        }

        componentWillReceiveProps(newProps) {
            if (this._stickybits
            && (newProps.viewWidth !== this.props.viewWidth
            || newProps.viewHeight !== this.props.viewHeight)) {
                this.update(newProps.scrollContainerSelector);
            }
        }

        componentWillUnmount() {
            if (this._stickybits) this._stickybits.cleanup();
        }

        render() {
            return (
                <WrappedComponent
                    ref={cmp => {
                        if (cmp && cmp.refs && cmp.refs.div) {
                            this._node = cmp.refs.div;
                        }
                    }}
                    style={{ ...this.state.style }}
                    {...this.props}>
                    {this.props.children}
                </WrappedComponent>
            );
        }

        update = (scrollContainerSelector) => {
            if (!this._stickybits) return;
            const scrollContainer = document.querySelector(scrollContainerSelector);
            const position = this._stickybits.definePosition();
            const isStickySupported = position.indexOf('sticky') !== -1;
            if (!isStickySupported && scrollContainer) {
                this._stickybits.update();
                setTimeout(() => {
                    const { top, left } = scrollContainer.getBoundingClientRect();
                    this.setState({
                        style: {
                            top,
                            left,
                            width: scrollContainer.scrollWidth - 2
                        }
                    });
                });
            }
            return;
        }
    };
