/*
 * Copyright 2017, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

const React = require('react');
const PropTypes = require('prop-types');
const ReactDom = require('react-dom');


module.exports = ({
    dataProp = "items",
    querySelector,
    closest = false,
    loadingProp = "loading",
    offsetSize = 200
} = {}) => (Component) =>
  class WithInfiniteScroll extends React.Component {
    static propTypes = {
        hasMore: PropTypes.func,
        onLoadMore: PropTypes.func
    }
    static defaultProps = {
        onLoadMore: () => {},
        hasMore: () => true
    }
    findScrollDomNode = () => {
        let node = ReactDom.findDOMNode(this);
        if (node && closest && querySelector) {
            return node.closest(querySelector || "*");
        }
        return node && (querySelector ? node.querySelector(querySelector) : node);
    }
    componentDidMount() {
        const div = this.findScrollDomNode();
        if (div) {
            div.addEventListener('scroll', this.onScroll, false);
            this.onScroll();
        }
    }
    componentDidUpdate(prevProps) {
        const div = this.findScrollDomNode();
        if (div && this.props[dataProp] !== prevProps[dataProp]) {
            this.onScroll();
        }
    }
    componentWillUnmount() {
        const div = this.findScrollDomNode();
        if (div) {
            div.removeEventListener('scroll', this.onScroll, false);
        }
    }

    onScroll = () => {
        const div = this.findScrollDomNode();
        if ((div.scrollTop + div.clientHeight) >= (div.scrollHeight - offsetSize) && this.props[dataProp] && this.props[dataProp].length && !this.props[loadingProp] && this.props.hasMore()) {
            this.props.onLoadMore();
        }
    }

    render() {
        return <Component {...this.props} />;
    }
};
