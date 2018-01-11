/*
 * Copyright 2017, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
const React = require('react');
const {compose, withState, withHandlers} = require('recompose');


const BorderLayout = require('../../components/layout/BorderLayout');
const withVirtualScroll = require('../../components/misc/enhancers/withVirtualScroll');
const CatalogForm = ({setItems}) => (<button onClick={() => {
    let n = Math.floor(Math.random() * 15);
    const arr = [];
    for (let i = 0; i < n; i++) {
        arr.push({title: "Test item " + i});
    }
    setItems(arr);
}}>Change</button>);

const SideGrid = compose(
        withHandlers({
            onLoadMore: ({setItems = () => {}}) => () => setItems(items => [...items, {title: "Test item"}])
        }),
        withVirtualScroll({querySelector: ".ms2-border-layout-body", closest: true})
)((require('../../components/misc/cardgrids/SideGrid')));

module.exports = withState(
    'items', "setItems", [{title: "Test item"}]
)(({setItems, items= []}) => {
    return <BorderLayout header={<CatalogForm setItems={setItems}/>}><SideGrid items={items} hasMore={() => items.length < 15} setItems={setItems}/></BorderLayout>;
});
