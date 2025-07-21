const createRectShape = (axisId, axisType, startTime, endTime, fill = {}) => {
    const isX = axisType === 'x';
    return {
        type: 'rect',
        xref: isX ? axisId : 'paper',
        yref: isX ? 'paper' : axisId,
        x0: isX ? startTime : 0,
        x1: isX ? endTime : 1,
        y0: isX ? 0 : startTime,
        y1: isX ? 1 : endTime,
        fillcolor: 'rgba(200, 200, 200, 0.4)',
        line: { width: 0 },
        ...fill
    };
};

const createLineShape = (axisId, axisType, time, line = {}) => {
    const isX = axisType === 'x';
    return {
        type: 'line',
        xref: isX ? axisId : 'paper',
        yref: isX ? 'paper' : axisId,
        x0: isX ? time : 0,
        x1: isX ? time : 1,
        y0: isX ? 0 : time,
        y1: isX ? 1 : time,
        line: {
            color: 'rgb(55, 128, 191)',
            width: 3,
            ...line
        }
    };
};

const addAxisShapes = (axisOpts, axisType, times) => {
    const shapes = [];
    const { startTime, endTime, hasBothDates } = times;

    axisOpts.forEach((axis, index) => {
        if (axis.type === 'date' && axis.showCurrentTime === true) {
            const axisId = index === 0 ? axisType : `${axisType}${index + 1}`;
            if (hasBothDates) {
                shapes.push(createRectShape(axisId, axisType, startTime, endTime, {
                    fillcolor: 'rgba(187, 196, 198, 0.4)'
                }));
            } else {
                // Single dashed line
                shapes.push(createLineShape(axisId, axisType, startTime, {
                    color: '#3aba6f',
                    dash: 'dash'
                }));
            }
        }
    });

    return shapes;
};

export const addCurrentTimeShapes = (data, timeRange) => {
    if (!timeRange.start && !timeRange.end) return [];
    // Get the selected chart from the data structure
    const selectedChart = (data?.charts || []).find((chart) => chart.chartId === data.selectedChartId);
    if (!selectedChart) {
        return [];
    }

    const xAxisOpts = selectedChart.xAxisOpts || [];
    const yAxisOpts = selectedChart.yAxisOpts || [];

    // Split the time range
    const startTime = timeRange.start;
    const endTime = timeRange.end;
    const hasBothDates = startTime && endTime;

    const times = { startTime, endTime, hasBothDates };

    // Create shapes for both x and y axes
    const xAxisShapes = addAxisShapes(xAxisOpts, 'x', times);
    const yAxisShapes = addAxisShapes(yAxisOpts, 'y', times);

    return [...xAxisShapes, ...yAxisShapes];
};
