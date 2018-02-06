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

/**
 * Scroll spy options are (wrapped in an object):
 * @param  {String}  [dataProp="items"]      the property for data to check
 * @param  {String}  querySelector           selector to get the element from the current component DOM element
 * @param  {Boolean} [closest=false]         if true, the querySelector will be used to search 1st parent. see [closest](https://developer.mozilla.org/en-US/docs/Web/API/Element/closest)
 * @param  {String}  [loadingProp="loading"] property to check for loading status. If props[loadingProp] is true, the scroll events will be stopped
 * @param  {Number}  [pageSize=10]           page size. It is used to count items and guess the next page number.
 * @param  {Number}  [offsetSize=200]        offset, in pixels, before the end of page to call the scroll spy. If the user scrolls the `onLoadMore` handler will be colled when he reaches the end_of_the_page - offsetSize pixels.
 * @return {HOC}                             An Higher Order Component that will call `onLoadMore` when you should load more elements in the context, for example, of an infinite scroll.
 */
module.exports = ({
    dataProp = "items",
    querySelector,
    closest = false,
    loadingProp = "loading",
    pageSize = 10,
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
            setTimeout( () => this.onScroll(), 300);
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
            this.props.onLoadMore(Math.ceil(this.props[dataProp].length / pageSize));
        }
    }

    render() {
        return <Component {...this.props} />;
    }
};
