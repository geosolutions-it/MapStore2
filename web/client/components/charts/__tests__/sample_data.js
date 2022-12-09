
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
        { name: 'Page B', value: 1, classValue: 'class2'}
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

export const DATASET_4 = {
    data: [
        { name: 'Page A', value: 0, classValue: 'class1'},
        { name: 'Page B', value: 100, classValue: 'class2'},
        { name: 'Page C', value: 500, classValue: 'class2'},
        { name: 'Page D', value: 900, classValue: 'class1'}
    ],
    xAxis: { dataKey: "name" },
    series: [{ dataKey: "value" }]
};

export const SPLIT_DATASET_4 = {
    data: [
        [
            { name: 'Page A', value: 0, classValue: 'class1'}
        ],
        [
            { name: 'Page B', value: 100, classValue: 'class2'},
            { name: 'Page C', value: 500, classValue: 'class2'},
            { name: 'Page D', value: 900, classValue: 'class1'}
        ]
    ],
    xAxis: { dataKey: "name" },
    series: [{ dataKey: "value" }]
};

export const DATASET_5_UNORDERED = {
    data: [
        { name: 'Page A', value: 1, classValue: '2'},
        { name: 'Page A', value: 1, classValue: '3'},
        { name: 'Page A', value: 1, classValue: '1'},
        { name: 'Page B', value: 10, classValue: '2'},
        { name: 'Page B', value: 0, classValue: '1'},
        { name: 'Page B', value: 100, classValue: '3'}
    ],
    xAxis: { dataKey: "name" },
    series: [{ dataKey: "value" }]
};

export const DATASET_5_ORDERED = {
    data: [
        { name: 'Page A', value: 1, classValue: '1'},
        { name: 'Page B', value: 0, classValue: '1'},
        { name: 'Page A', value: 1, classValue: '2'},
        { name: 'Page B', value: 10, classValue: '2'},
        { name: 'Page A', value: 1, classValue: '3'},
        { name: 'Page B', value: 100, classValue: '3'}
    ],
    xAxis: { dataKey: "name" },
    series: [{ dataKey: "value" }]
};

export const SPLIT_DATASET_5_ORDERED = {
    data: [
        [
            { name: 'Page A', value: 1, classValue: '1'},
            { name: 'Page B', value: 0, classValue: '1'}
        ],
        [
            { name: 'Page A', value: 1, classValue: '2'},
            { name: 'Page B', value: 10, classValue: '2'}
        ],
        [
            { name: 'Page A', value: 1, classValue: '3'},
            { name: 'Page B', value: 100, classValue: '3'}
        ]
    ],
    xAxis: { dataKey: "name" },
    series: [{ dataKey: "value" }]
};

export const UNLABELLED_CLASSIFICATION_5_ORDERED = [
    {
        color: '#0000ff',
        value: '1',
        unique: '1'
    },
    {
        color: '#00FF00',
        value: '2',
        unique: '2'
    },
    {
        color: '#ff0000',
        value: '3',
        unique: '3'
    }
];

export const CLASSIFICATIONS = {
    dataKey: 'classValue'
};

export const RANGE_CLASSIFICATIONS = {
    dataKey: 'value'
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

export const LABELLED_RANGE_CLASSIFICATION = [
    {
        title: 'Between 0 and 100',
        color: '#ff0000',
        min: 0,
        max: 100
    },
    {
        title: 'Between 100 and 1000',
        color: '#0000ff',
        min: 100,
        max: 1000
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

export const TEMPLATE_LABELS_RANGE_CLASSIFICATION = [
    {
        title: '${legendValue} - Between ${minValue} and ${maxValue}',
        color: '#ff0000',
        min: 0,
        max: 100
    },
    {
        title: '${legendValue} - Between ${minValue} and ${maxValue}',
        color: '#00ff00',
        min: 100,
        max: 1000
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

export const PIE_CHART_TEMPLATE_LABELS_RANGE_CLASSIFICATION = [
    {
        title: '${groupByValue} - ${legendValue}: Between ${minValue} and ${maxValue}',
        color: '#ff0000',
        min: 0,
        max: 100
    },
    {
        title: '${groupByValue} - ${legendValue}: Between ${minValue} and ${maxValue}',
        color: '#00ff00',
        min: 100,
        max: 1000
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
export const UNLABELLED_CLASSIFICATION_3 = [
    ...UNLABELLED_CLASSIFICATION,
    {
        color: '#00FF00',
        value: 'class3',
        unique: 'class3'
    }
];

export const UNLABELLED_RANGE_CLASSIFICATION = [
    {
        color: '#ff0000',
        min: 0,
        max: 100
    },
    {
        color: '#0000ff',
        min: 100,
        max: 1000
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

export const DATASET_WITH_DATES = {
    data: [
        {
            "x": "1990-10-21T00:00:00.000Z",
            "y": 30
        },
        {
            "x": "1990-10-19T06:00:00.000Z",
            "y": 70
        },
        {
            "x": "1990-07-27T06:00:00.000Z",
            "y": 4
        }
    ],
    xAxis: { dataKey: "x" },
    series: [{ dataKey: "y" }],
    type: "line"
};
