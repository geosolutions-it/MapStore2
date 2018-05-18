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
require('rxjs');
/**
 * Enhancer that calls the prop handler `onLoadMore` when the user scrolls and reaches the end of the div.
 * The enhancer manages also some props for various optimizations:
 *  - to support pagination and loading to call scroll only when data
 * Scroll spy options are (wrapped in an object):
 * @param  {String}  [dataProp="items"]      the property for data to check. Defining the dataProp the onLoadMore will be called with the argument of the next page (current items.length / pageSize)
 * @param  {String}  querySelector           selector to get the element from the current component DOM element
 * @param  {Boolean} [closest=false]         if true, the querySelector will be used to search 1st parent. see [closest](https://developer.mozilla.org/en-US/docs/Web/API/Element/closest)
 * @param  {String}  [loadingProp="loading"] property to check for loading status. If props[loadingProp] is true, the scroll events will be stopped
 * @param  {Number}  [pageSize=10]           page size. It is used to count items and guess the next page number.
 * @param  {Number}  [offsetSize=200]        offset, in pixels, before the end of page to call the scroll spy. If the user scrolls the `onLoadMore` handler will be colled when he reaches the end_of_the_page - offsetSize pixels.
 * @param  {Number} [skip=0]                 optional number of items to skip in count
 * @return {HOC}                             An Higher Order Component that will call `onLoadMore` when you should load more elements in the context, for example, of an infinite scroll.
 * @example
 * const Cmp = withScrollSpy({items: "items", querySelector: "div"})(MyComponent);
 * //... layer in a render
 * <Cmp onLoadMore={() => console.log("NEED MORE DATA")} />;
 * // ... or with pagination
 * <Cmp onLoadMore={() => console.log("NEED MORE DATA")} items={[]}/>;
 */
module.exports = ({
    dataProp = "items",
    querySelector,
    closest = false,
    loadingProp = "loading",
    skip = 0,
    pageSize = 10,
    offsetSize = 200
} = {}) => (Component) =>
  class WithInfiniteScroll extends React.Component {

    static propTypes = {
        hasMore: PropTypes.func,
        onLoadMore: PropTypes.func,
        isScrolled: PropTypes.func
    }
    static defaultProps = {
        onLoadMore: () => {},
        hasMore: () => true,
        isScrolled: ({div, offset}) => div.scrollTop + div.clientHeight >= div.scrollHeight - offset
    }
    findScrollDomNode = () => {
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
        const div = this.findScrollDomNode();
        if (div) {
            div.addEventListener('scroll', this.onScroll, false);
            this.onScroll();
        }
    }
    componentDidUpdate(prevProps) {
        const div = this.findScrollDomNode();
        if (div
            && (dataProp && this.props[dataProp]
                ? this.props[dataProp] !== prevProps[dataProp]
                : true)) {
            setTimeout( () => this.onScroll(), 300);
        }
    }
    componentWillUnmount() {
        this.isMounded = false;
        const div = this.findScrollDomNode();
        if (div) {
            div.removeEventListener('scroll', this.onScroll, false);
        }
    }

    onScroll = () => {
        const div = this.findScrollDomNode();
        if (div
            && this.props.isScrolled({div, offset: offsetSize})
            && (dataProp // has data array (if dataprop has been defined)
                ? this.props[dataProp] && this.props[dataProp].length
                : true)
            && (loadingProp // is not loading (if loadingProp is defined)
                ? !this.props[loadingProp]
                : true)
            && this.props.hasMore(this.props)) {
            this.props.onLoadMore(dataProp
                ? Math.ceil((this.props[dataProp].length - skip) / pageSize)
                : null);
        }
    }
    render() {
        return <Component {...this.props} />;
    }
};
