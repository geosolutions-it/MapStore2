export const CLASSIFICATION = [
    {
        title: 'Class 1',
        color: '#FF0000',
        value: 'class1',
        unique: 'class1'
    },
    {
        title: 'Class 2',
        color: '#417505',
        value: 'class2',
        unique: 'class2'
    }
];

export const EMPTY_VALUE_CLASSIFICATION = [
    {
        title: '',
        color: '#00FF00',
        value: '',
        unique: ''
    }
];

export const UNCLASSIFIED_VALUE_CLASSIFICATION = [
    ...CLASSIFICATION,
    ...EMPTY_VALUE_CLASSIFICATION
];

export const TEST_LAYER = 'test_workspace:test_layer';
export const CLASSIFICATION_ATTRIBUTE = 'classValue';

export const DATASET_1 = {
    data: [
        { name: 'Page A', value: 0, classValue: 'class1'},
        { name: 'Page B', value: 1, classValue: 'class2'},
        { name: 'Page C', value: 2, classValue: 'class2'},
        { name: 'Page D', value: 3, classValue: 'class1'}
    ],
    xAxis: { dataKey: "name" },
    series: [{ dataKey: "value" }]
};

export const DEFAULT_CUSTOM_COLOR = ['#0888A1', '#4A4A4A'];

export const DEFAULT_CUSTOM_LABEL = ['Default', 'Others', ''];

export const OPTIONS = [
    { label: 'classValue', value: 'classValue' },
    { label: 'classValue1', value: 'classValue1' },
    { label: 'classValue2', value: 'classValue2' }
];
