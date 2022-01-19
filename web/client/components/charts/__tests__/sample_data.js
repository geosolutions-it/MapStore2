
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

export const DATASET_2 = {
    data: [
        { name: 'Page A', value: 0, classValue: 'class1'},
        { name: 'Page B', value: 1, classValue: 'class2'},
        { name: 'Page C', value: 2, classValue: 'class2'},
        { name: 'Page D', value: 3, classValue: 'class1'}
    ],
    xAxis: { dataKey: "name" },
    series: [{ dataKey: "value" }]
};

export const SPLIT_DATASET_2 = {
    data: [
        [
            { name: 'Page A', value: 0, classValue: 'class1'},
            { name: 'Page D', value: 3, classValue: 'class1'}
        ],
        [
            { name: 'Page B', value: 1, classValue: 'class2'},
            { name: 'Page C', value: 2, classValue: 'class2'}
        ]
    ],
    xAxis: { dataKey: "name" },
    series: [{ dataKey: "value" }]
};

export const DATASET_3 = {
    data: [
        ...DATASET_2.data,
        { name: 'Page E', value: 4, classValue: 'class3'},
        { name: 'Page F', value: 5, classValue: 'class3'}
    ],
    xAxis: { dataKey: "name" },
    series: [{ dataKey: "value" }]
};

export const SPLIT_DATASET_3 = {
    data: [
        ...SPLIT_DATASET_2.data,
        [
            { name: 'Page E', value: 4, classValue: 'class3'},
            { name: 'Page F', value: 5, classValue: 'class3'}
        ]
    ],
    xAxis: { dataKey: "name" },
    series: [{ dataKey: "value" }]
};


export const CLASSIFICATIONS = {
    dataKey: 'classValue'
};

export const LABELLED_CLASSIFICATION = [
    {
        title: 'Class 1',
        color: '#ff0000',
        value: 'class1',
        unique: 'class1'
    },
    {
        title: 'Class 2',
        color: '#0000ff',
        value: 'class2',
        unique: 'class2'
    }
];

export const TEMPLATE_LABELS_CLASSIFICATION = [
    {
        title: '${legendValue} - Class 1',
        color: '#ff0000',
        value: 'class1',
        unique: 'class1'
    },
    {
        title: '${legendValue} - Class 2',
        color: '#0000ff',
        value: 'class2',
        unique: 'class2'
    }
];

export const PIE_CHART_TEMPLATE_LABELS_CLASSIFICATION = [
    {
        title: '${groupByValue} - Class 1',
        color: '#ff0000',
        value: 'class1',
        unique: 'class1'
    },
    {
        title: '${groupByValue} - Class 2',
        color: '#0000ff',
        value: 'class2',
        unique: 'class2'
    }
];

export const UNLABELLED_CLASSIFICATION = [
    {
        color: '#ff0000',
        value: 'class1',
        unique: 'class1'
    },
    {
        color: '#0000ff',
        value: 'class2',
        unique: 'class2'
    }
];

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
