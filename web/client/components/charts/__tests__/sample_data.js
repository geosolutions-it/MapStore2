
export const DATASET_1 = {
    data: [
        { name: 'Page A', value: 0 },
        { name: 'Page B', value: 1 },
        { name: 'Page C', value: 2 },
        { name: 'Page D', value: 3 }
    ],
    xAxis: { dataKey: "name" },
    series: [{ dataKey: "value" }]
};


export const DATASET_MULTI_SERIES_1 = {
    data: [
        { name: 'Page A', uv: 0, pv: 0, amt: 0 },
        { name: 'Page B', uv: 1, pv: 1, amt: 1 },
        { name: 'Page C', uv: 2, pv: 2, amt: 2 },
        { name: 'Page D', uv: 3, pv: 3, amt: 3 },
        { name: 'Page E', uv: 4, pv: 4, amt: 4 },
        { name: 'Page F', uv: 5, pv: 5, amt: 5 },
        { name: 'Page G', uv: 6, pv: 6, amt: 6 }
    ],
    xAxis: { dataKey: "name" },
    series: [{ dataKey: "pv" }, { dataKey: "uv" }]
};

