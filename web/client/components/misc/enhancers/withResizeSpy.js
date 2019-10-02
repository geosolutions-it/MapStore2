/*
 * Copyright 2017, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

const React = require('react');
const { debounce } = require('lodash');
const PropTypes = require('prop-types');
const ReactDom = require('react-dom');
const ResizeObserver = require('resize-observer-polyfill').default;

/**
 * Enhancer that calls the prop handler `onResize` when the div has been resized.
 * @param {String}  querySelector           selector to get the element from the current component DOM element
 * @param {Boolean} [closest=false]         if true, the querySelector will be used to search 1st parent. see [closest](https://developer.mozilla.org/en-US/docs/Web/API/Element/closest)
 * @param {debounceTime}
 * @return {HOC} An Higher Order Component that will call `onResize` when the item has been resized
 * @example
 * const Cmp = withResizeSpy({querySelector: "div"})(MyComponent);
 * //... layer in a render
 * <Cmp onResize={() => console.log("Resized")} />;
 *
 */
module.exports = ({
    debounceTime,
    querySelector,
    closest = false
} = {}) => (Component) =>
    class WithResizeSpy extends React.Component {
    static propTypes = {
        handleWidth: PropTypes.bool,
        handleHeight: PropTypes.bool,
        onResize: PropTypes.func
    }
    static defaultProps = {
        onResize: () => { },
        handleWidth: true,
        handleHeight: true
    }
    constructor(props) {
        super(props);
        this.width = undefined;
        this.height = undefined;
        this.skipOnMount = props.skipOnMount;
        this.onResize = debounce((...args) => this.props.onResize(...args), debounceTime !== undefined ? debounceTime : props.debounceTime || 1000);
        this.ro = new ResizeObserver((entries) => {
            entries.forEach((entry) => {
                const { width, height } = entry.contentRect;
                const notifyWidth = this.props.handleWidth && this.width !== width;
                const notifyHeight = this.props.handleHeight && this.height !== height;
                if (!this.skipOnMount && (notifyWidth || notifyHeight)) {
                    this.onResize({width, height});
                }

                this.width = width;
                this.height = height;
                this.skipOnMount = false;
            });
        });
    }
    findDomNode = () => {
        if (!this.isMounded) {
            return null;
        }
        let node = ReactDom.findDOMNode(this);
        if (node && closest && querySelector) {
            return node.closest(querySelector || "*");
        }
        return node && (querySelector ? node.querySelector(querySelector) : node);
    }
    componentDidMount() {
        this.isMounded = true;
        const div = this.findDomNode();
        if (div) {
            this.ro.observe(div);
        }
    }
    componentWillUnmount() {
        const div = this.findDomNode();
        if (div && this.ro && this.ro.unobserve) {
            this.ro.unobserve(div);
        }
    }


    render() {
        return <Component {...this.props} />;
    }
    };
