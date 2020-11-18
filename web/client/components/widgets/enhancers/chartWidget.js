/*
  * Copyright 2017, GeoSolutions Sas.
  * All rights reserved.
  *
  * This source code is licensed under the BSD-style license found in the
  * LICENSE file in the root directory of this source tree.
  */
import { compose, branch, withState, withProps, withHandlers } from 'recompose';

import deleteWidget from './deleteWidget';
import { editableWidget, exportableWidget, defaultIcons, withHeaderTools } from './tools';


export default compose(

    deleteWidget,
    // table / chart visualization
    compose(
        // state and toggle
        withState('showTable', 'setShowTable', false),
        withHandlers({
            toggleTableView: ({ setShowTable, showTable }) => () => setShowTable(!showTable)
        }),
        // entry in the menu
        withProps(({ widgetTools = [], toggleTableView = () => {}}) => ({
            widgetTools: [
                ...widgetTools,
                {
                    glyph: "features-grid",
                    target: "menu",
                    textId: "widgets.widget.menu.showChartData",
                    onClick: () => toggleTableView()
                }
            ]
        }))
    ),
    editableWidget(),
    exportableWidget(),
    defaultIcons(),
    branch(
        ({showTable}) => !showTable,
        withHeaderTools()
    )
);
