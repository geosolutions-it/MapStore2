

import SimpleChart from './PlotlyChart';

/**
 * Base Chart object
 * cartesian: true
 * @prop {object} dataGrid {y: 0, x: 0, w: 1, h: 1}
 * @prop {boolean} legend
 * @prop {string} type type of the chart
 * @prop {yAxis} yAxis configuration for yAxis, if false, do not show.
cartesian: show the cartesian grid
type: the type of the chart (one of “bar” “line” “pie”)
 */
export default SimpleChart;
