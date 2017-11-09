/*
 * Copyright 2017, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */


const React = require('react');
const SideGrid = require('../../../../misc/cardgrids/SideGrid');
const Message = require('../../../../I18N/Message');
const sampleData = require('../../../enhancers/sampleChartData');
const SimpleChart = sampleData(require('../../../../charts/SimpleChart'));
const {Row} = require('react-bootstrap');
const sampleProps = {
    legend: false,
    tooltip: false,
    cartesian: false,
    width: 100,
    height: 100,
    popup: false
};
const StepHeader = require('../../../../misc/wizard/StepHeader');

const ITEMS = [{
    title: 'Bar chart',
    icon: 'icon',
    desc: 'desc',
    caption: 'caption',
    type: "bar"
}, {
    title: 'Pie chart',
    icon: 'icon',
    desc: 'desc',
    caption: 'caption',
    type: "pie"
}, {
    title: 'Line chart',
    icon: 'icon',
    desc: 'desc',
    caption: 'caption',
    type: "line"
}, {
    title: 'Gauge',
    icon: 'icon',
    desc: 'desc',
    caption: 'caption',
    type: "gauge"
}


];
module.exports = ({onSelect = () => {}, onNextPage = () => {}, types = [], type} = {}) => (<Row>
    <StepHeader key="title" title={<Message msgId="widgets.selectChartType.title" />} />
    <SideGrid
        key="content"
        onItemClick={item => {onSelect(item.type); onNextPage(); }}
        items={types &&
            ITEMS.map( item =>
                ({
                    ...item,
                    selected: item.type === type,
                    preview: (<SimpleChart
                        {...sampleProps}
                        type={item.type}
                        autoColorOptions={item.type === type ? {
                            base: 0,
                            s: 0,
                            v: 0
                        } : undefined}
                     />)
            }))} />
</Row>
    );
