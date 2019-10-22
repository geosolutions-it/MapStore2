import expect from 'expect';
import React from 'react';
import ReactDOM from 'react-dom';
import {compose, shouldUpdate} from 'recompose';
import {isEqual} from 'lodash';
import dndTree from '../dndTree';

const testNodes = [{
    id: 'Default',
    name: 'Default',
    nodes: [{
        id: 'layer00',
        name: 'layer00',
        visibility: true,
        type: 'wms',
        url: 'fakeurl'
    }, {
        id: 'layer01',
        name: 'layer01',
        visibility: true,
        type: 'wms',
        url: 'fakeurl'
    }, {
        id: 'Group2',
        name: 'Group2',
        nodes: []
    }]
}, {
    id: 'Group1',
    name: 'Group1',
    nodes: [{
        id: 'Group1.Group11',
        name: 'Group11',
        nodes: [{
            id: 'layer02',
            name: 'layer02',
            visibility: true,
            type: 'wms',
            url: 'fakeurl'
        }, {
            id: 'Group1.Group11.Group111',
            name: 'Group111',
            nodes: []
        }]
    }, {
        id: 'layer03',
        name: 'layer03',
        visibility: true,
        type: 'wms',
        url: 'fakeurl'
    }, {
        id: 'layer04',
        name: 'layer04',
        visibility: true,
        type: 'wms',
        url: 'fakeurl'
    }]
}, {
    id: 'Group3',
    name: 'Group3',
    nodes: [{
        id: 'layer05',
        name: 'layer05',
        visibility: true,
        type: 'wms',
        url: 'fakeurl'
    }]
}];

const EnhancedComponent = compose(
    dndTree,
    shouldUpdate((props, nextProps) => !isEqual(props.nodes, nextProps.nodes)),
)(({nodes, setDndState, testDndState, testFunc}) => {
    if (testDndState) {
        setDndState(testDndState);
    }
    testFunc(nodes);
    return <div></div>;
});

describe('dndTree TOC enhancer', () => {
    beforeEach((done) => {
        document.body.innerHTML = '<div id="container"></div>';
        setTimeout(done);
    });

    afterEach((done) => {
        ReactDOM.unmountComponentAtNode(document.getElementById("container"));
        document.body.innerHtml = '';
        setTimeout(done);
    });

    it('dndTree with default dnd state', () => {
        const test = {
            testFunc: () => {}
        };

        const testFuncSpy = expect.spyOn(test, 'testFunc');

        ReactDOM.render(<EnhancedComponent testFunc={test.testFunc} nodes={testNodes}/>, document.getElementById("container"));

        expect(testFuncSpy.calls.length).toBe(1);
        expect(testFuncSpy.calls[0].arguments[0]).toEqual([{
            id: 'Default',
            name: 'Default',
            nodes: [{
                id: 'layer00',
                name: 'layer00',
                visibility: true,
                type: 'wms',
                url: 'fakeurl'
            }, {
                id: 'layer01',
                name: 'layer01',
                visibility: true,
                type: 'wms',
                url: 'fakeurl'
            }, {
                id: 'Group2',
                name: 'Group2',
                nodes: []
            }, {
                id: 'Group2__dummy',
                dummy: true
            }]
        }, {
            id: 'Default__dummy',
            dummy: true
        }, {
            id: 'Group1',
            name: 'Group1',
            nodes: [{
                id: 'Group1.Group11',
                name: 'Group11',
                nodes: [{
                    id: 'layer02',
                    name: 'layer02',
                    visibility: true,
                    type: 'wms',
                    url: 'fakeurl'
                }, {
                    id: 'Group1.Group11.Group111',
                    name: 'Group111',
                    nodes: []
                }, {
                    id: 'Group1.Group11.Group111__dummy',
                    dummy: true
                }]
            }, {
                id: 'Group1.Group11__dummy',
                dummy: true
            }, {
                id: 'layer03',
                name: 'layer03',
                visibility: true,
                type: 'wms',
                url: 'fakeurl'
            }, {
                id: 'layer04',
                name: 'layer04',
                visibility: true,
                type: 'wms',
                url: 'fakeurl'
            }]
        }, {
            id: 'Group1__dummy',
            dummy: true
        }, {
            id: 'Group3',
            name: 'Group3',
            nodes: [{
                id: 'layer05',
                name: 'layer05',
                visibility: true,
                type: 'wms',
                url: 'fakeurl'
            }]
        }, {
            id: 'Group3__dummy',
            dummy: true
        }]);
    });

    it('dndTree with parentNodeId === newParentNodeId', () => {
        const test = {
            testFunc: () => {}
        };

        const testFuncSpy = expect.spyOn(test, 'testFunc');

        const dndState = {
            node: {
                id: 'layer03',
                name: 'layer03',
                visibility: true,
                type: 'wms',
                url: 'fakeurl'
            },
            parentNodeId: 'Group1',
            newParentNodeId: 'Group1',
            sortIndex: 0
        };

        ReactDOM.render(<EnhancedComponent testFunc={test.testFunc} testDndState={dndState} nodes={testNodes}/>, document.getElementById("container"));

        expect(testFuncSpy.calls.length).toBe(2);
        expect(testFuncSpy.calls[1].arguments[0]).toEqual([{
            id: 'Default',
            name: 'Default',
            nodes: [{
                id: 'layer00',
                name: 'layer00',
                visibility: true,
                type: 'wms',
                url: 'fakeurl',
                nodes: undefined
            }, {
                id: 'layer01',
                name: 'layer01',
                visibility: true,
                type: 'wms',
                url: 'fakeurl',
                nodes: undefined
            }, {
                id: 'Group2',
                name: 'Group2',
                nodes: []
            }, {
                id: 'Group2__dummy',
                dummy: true
            }]
        }, {
            id: 'Default__dummy',
            dummy: true
        }, {
            id: 'Group1',
            name: 'Group1',
            nodes: [{
                id: 'layer03',
                name: 'layer03',
                visibility: true,
                type: 'wms',
                url: 'fakeurl'
            }, {
                id: 'Group1.Group11',
                name: 'Group11',
                nodes: [{
                    id: 'layer02',
                    name: 'layer02',
                    visibility: true,
                    type: 'wms',
                    url: 'fakeurl'
                }, {
                    id: 'Group1.Group11.Group111',
                    name: 'Group111',
                    nodes: []
                }, {
                    id: 'Group1.Group11.Group111__dummy',
                    dummy: true
                }]
            }, {
                id: 'Group1.Group11__dummy',
                dummy: true
            }, {
                id: 'layer04',
                name: 'layer04',
                visibility: true,
                type: 'wms',
                url: 'fakeurl'
            }]
        }, {
            id: 'Group1__dummy',
            dummy: true
        }, {
            id: 'Group3',
            name: 'Group3',
            nodes: [{
                id: 'layer05',
                name: 'layer05',
                visibility: true,
                type: 'wms',
                url: 'fakeurl',
                nodes: undefined
            }]
        }, {
            id: 'Group3__dummy',
            dummy: true
        }]);
    });

    it('dndTree with parentNodeId !== newParentNodeId', () => {
        const test = {
            testFunc: () => {}
        };

        const testFuncSpy = expect.spyOn(test, 'testFunc');

        const dndState = {
            node: {
                id: 'layer03',
                name: 'layer03',
                visibility: true,
                type: 'wms',
                url: 'fakeurl'
            },
            parentNodeId: 'Group1',
            newParentNodeId: 'Default',
            sortIndex: 2
        };

        ReactDOM.render(<EnhancedComponent testFunc={test.testFunc} testDndState={dndState} nodes={testNodes}/>, document.getElementById("container"));

        expect(testFuncSpy.calls.length).toBe(2);
        expect(testFuncSpy.calls[1].arguments[0]).toEqual([{
            id: 'Default',
            name: 'Default',
            nodes: [{
                id: 'layer00',
                name: 'layer00',
                visibility: true,
                type: 'wms',
                url: 'fakeurl',
                nodes: undefined
            }, {
                id: 'layer01',
                name: 'layer01',
                visibility: true,
                type: 'wms',
                url: 'fakeurl',
                nodes: undefined
            }, {
                id: 'layer03__placeholder',
                name: 'layer03',
                visibility: true,
                placeholder: true,
                hide: false,
                type: 'wms',
                url: 'fakeurl',
                nodes: undefined
            }, {
                id: 'Group2',
                name: 'Group2',
                nodes: []
            }, {
                id: 'Group2__dummy',
                dummy: true
            }]
        }, {
            id: 'Default__dummy',
            dummy: true
        }, {
            id: 'Group1',
            name: 'Group1',
            nodes: [{
                id: 'Group1.Group11',
                name: 'Group11',
                nodes: [{
                    id: 'layer02',
                    name: 'layer02',
                    visibility: true,
                    type: 'wms',
                    url: 'fakeurl',
                    nodes: undefined
                }, {
                    id: 'Group1.Group11.Group111',
                    name: 'Group111',
                    nodes: []
                }, {
                    id: 'Group1.Group11.Group111__dummy',
                    dummy: true
                }]
            }, {
                id: 'Group1.Group11__dummy',
                dummy: true
            }, {
                id: 'layer03',
                name: 'layer03',
                visibility: true,
                hide: true,
                type: 'wms',
                url: 'fakeurl',
                nodes: undefined
            }, {
                id: 'layer04',
                name: 'layer04',
                visibility: true,
                type: 'wms',
                url: 'fakeurl',
                nodes: undefined
            }]
        }, {
            id: 'Group1__dummy',
            dummy: true
        }, {
            id: 'Group3',
            name: 'Group3',
            nodes: [{
                id: 'layer05',
                name: 'layer05',
                visibility: true,
                type: 'wms',
                url: 'fakeurl',
                nodes: undefined
            }]
        }, {
            id: 'Group3__dummy',
            dummy: true
        }]);
    });

    it('dndTree with moved group', () => {
        const test = {
            testFunc: () => {}
        };

        const testFuncSpy = expect.spyOn(test, 'testFunc');

        const dndState = {
            node: {
                id: 'Group2',
                name: 'Group2',
                nodes: []
            },
            parentNodeId: 'Default',
            newParentNodeId: 'root',
            sortIndex: 1
        };

        ReactDOM.render(<EnhancedComponent testFunc={test.testFunc} testDndState={dndState} nodes={testNodes}/>, document.getElementById("container"));

        expect(testFuncSpy.calls.length).toBe(2);
        expect(testFuncSpy.calls[1].arguments[0]).toEqual([{
            id: 'Default',
            name: 'Default',
            nodes: [{
                id: 'layer00',
                name: 'layer00',
                visibility: true,
                type: 'wms',
                url: 'fakeurl'
            }, {
                id: 'layer01',
                name: 'layer01',
                visibility: true,
                type: 'wms',
                url: 'fakeurl'
            }, {
                id: 'Group2',
                name: 'Group2',
                nodes: [],
                hide: true
            }]
        }, {
            id: 'Group2__placeholder',
            name: 'Group2',
            nodes: [],
            placeholder: true,
            hide: false
        }, {
            id: 'Group1',
            name: 'Group1',
            nodes: [{
                id: 'Group1.Group11',
                name: 'Group11',
                nodes: [{
                    id: 'layer02',
                    name: 'layer02',
                    visibility: true,
                    type: 'wms',
                    url: 'fakeurl',
                    nodes: undefined
                }, {
                    id: 'Group1.Group11.Group111',
                    name: 'Group111',
                    nodes: []
                }, {
                    id: 'Group1.Group11.Group111__dummy',
                    dummy: true
                }]
            }, {
                id: 'Group1.Group11__dummy',
                dummy: true
            }, {
                id: 'layer03',
                name: 'layer03',
                visibility: true,
                type: 'wms',
                url: 'fakeurl',
                nodes: undefined
            }, {
                id: 'layer04',
                name: 'layer04',
                visibility: true,
                type: 'wms',
                url: 'fakeurl',
                nodes: undefined
            }]
        }, {
            id: 'Group1__dummy',
            dummy: true
        }, {
            id: 'Group3',
            name: 'Group3',
            nodes: [{
                id: 'layer05',
                name: 'layer05',
                visibility: true,
                type: 'wms',
                url: 'fakeurl',
                nodes: undefined
            }]
        }, {
            id: 'Group3__dummy',
            dummy: true
        }]);
    });
});
