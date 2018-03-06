/*
 * Copyright 2018, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

const React = require('react');
const {Panel, Accordion} = require('react-bootstrap');
const SideCard = require('../cardgrids/SideCard');

/**
 * Component for rendering an Accordion with Side Card as header.
 * @memberof components.misc.panels
 * @name Accordion
 * @class
 * @prop {string} activePanel current open panel, should match the panel id
 * @prop {bool} fillContainer fill the height of container without scroolbar
 * @prop {string} className additional calss name
 * @prop {function} onSelect return the panel id when the header has been selected
 * @prop {array} panels array of objects head contains data of sidecard and body is an High-Order Component, e.g. {id: 'panel:000', head: { }, body: () => null }
 */

module.exports = ({
    activePanel,
    fillContainer,
    className,
    onSelect,
    panels = []
}) => {
    const fillContainerClassName = fillContainer ? 'ms-fill-container ' : '';
    return (
        <Accordion
            activeKey={activePanel}
            className={'ms-accordion ' + fillContainerClassName + className}>
            {panels.map((panel, i) =>
                (<Panel
                    key={i}
                    eventKey={panel.id}
                    className={activePanel === panel.id ? 'ms-selected' : ''}
                    header={panel.head && <a role="tab">
                        <SideCard
                            {...panel.head}
                            selected={activePanel === panel.id}
                            onClick={() => {
                                onSelect(panel.id);
                            }}/></a> || null}
                    collapsible>
                    {panel.body}
                </Panel>))
            }
        </Accordion>
    );
};
