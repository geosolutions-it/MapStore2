/*
 * Copyright 2025, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import React from 'react';
import ReactDOM from 'react-dom';
import expect from 'expect';
import { act } from 'react-dom/test-utils';
import useFeatureValidation from '../useFeatureValidation';

describe('useFeatureValidation', () => {
    let validationResults = null;

    const Component = (props) => {
        validationResults = useFeatureValidation(props);
        return <div id="validation-results">{JSON.stringify(validationResults)}</div>;
    };

    beforeEach((done) => {
        document.body.innerHTML = '<div id="container"></div>';
        validationResults = null;
        setTimeout(done);
    });

    afterEach((done) => {
        ReactDOM.unmountComponentAtNode(document.getElementById("container"));
        document.body.innerHTML = '';
        validationResults = null;
        setTimeout(done);
    });

    it('should return empty object when schema is not provided', () => {
        act(() => {
            ReactDOM.render(
                <Component
                    features={[]}
                    changes={{}}
                />,
                document.getElementById("container")
            );
        });
        expect(validationResults).toEqual({});
    });

    it('should return empty object when schema is null', () => {
        act(() => {
            ReactDOM.render(
                <Component
                    featurePropertiesJSONSchema={null}
                    features={[]}
                    changes={{}}
                />,
                document.getElementById("container")
            );
        });
        expect(validationResults).toEqual({});
    });

    it('should return empty object when all features are valid', () => {
        const schema = {
            type: 'object',
            properties: {
                name: { type: 'string' },
                age: { type: 'number' }
            }
        };
        const features = [
            { id: '1', properties: { name: 'John', age: 30 } },
            { id: '2', properties: { name: 'Jane', age: 25 } }
        ];

        act(() => {
            ReactDOM.render(
                <Component
                    featurePropertiesJSONSchema={schema}
                    features={features}
                    changes={{}}
                />,
                document.getElementById("container")
            );
        });
        expect(validationResults).toEqual({});
    });

    it('should return validation errors for invalid features', () => {
        const schema = {
            type: 'object',
            properties: {
                name: { type: 'string', minLength: 3 },
                age: { type: 'number', minimum: 0 }
            },
            required: ['name']
        };
        const features = [
            { id: '1', properties: { name: 'Jo', age: 30 } }, // name too short
            { id: '2', properties: { name: 'Jane', age: -5 } }, // age negative
            { id: '3', properties: { age: 25 } } // missing required name
        ];

        act(() => {
            ReactDOM.render(
                <Component
                    featurePropertiesJSONSchema={schema}
                    features={features}
                    changes={{}}
                />,
                document.getElementById("container")
            );
        });

        expect(Object.keys(validationResults).length).toBe(3);
        expect(validationResults['1']).toBeTruthy();
        expect(validationResults['1'].errors).toBeTruthy();
        expect(validationResults['1'].errors.length).toBeGreaterThan(0);
        expect(validationResults['1'].changed).toBeFalsy();
        expect(validationResults['2']).toBeTruthy();
        expect(validationResults['2'].errors).toBeTruthy();
        expect(validationResults['2'].errors.length).toBeGreaterThan(0);
        expect(validationResults['2'].changed).toBeFalsy();
        expect(validationResults['3']).toBeTruthy();
        expect(validationResults['3'].errors).toBeTruthy();
        expect(validationResults['3'].errors.length).toBeGreaterThan(0);
        expect(validationResults['3'].changed).toBeFalsy();
    });

    it('should filter out primary key errors', () => {
        const schema = {
            type: 'object',
            properties: {
                fid: { type: 'string' },
                name: { type: 'string', minLength: 3 }
            }
        };
        const features = [
            { id: '1', properties: { fid: 'invalid', name: 'Jo' } } // fid is primary key, name is invalid
        ];

        act(() => {
            ReactDOM.render(
                <Component
                    featurePropertiesJSONSchema={schema}
                    features={features}
                    changes={{}}
                    primaryKeyAttributes={['fid']}
                />,
                document.getElementById("container")
            );
        });

        expect(Object.keys(validationResults).length).toBe(1);
        expect(validationResults['1']).toBeTruthy();
        // Should only have errors for 'name', not 'fid'
        const errorFields = validationResults['1'].errors.map(e => {
            const path = e.instancePath || e.dataPath || '';
            return path.replace(/^[./]/, '');
        });
        expect(errorFields).toNotContain('fid');
        expect(errorFields).toContain('name');
    });

    it('should mark changed features correctly', () => {
        const schema = {
            type: 'object',
            properties: {
                name: { type: 'string', minLength: 3 }
            }
        };
        const features = [
            { id: '1', properties: { name: 'John' } } // Valid initially
        ];
        const changes = {
            '1': { name: 'Jo' } // Invalid change - name too short
        };

        act(() => {
            ReactDOM.render(
                <Component
                    featurePropertiesJSONSchema={schema}
                    features={features}
                    changes={changes}
                />,
                document.getElementById("container")
            );
        });

        expect(validationResults['1']).toBeTruthy();
        expect(validationResults['1'].errors).toBeTruthy();
        expect(validationResults['1'].errors.length).toBeGreaterThan(0);
        expect(validationResults['1'].changed).toBe(true);
    });

    it('should mark new features correctly', () => {
        const schema = {
            type: 'object',
            properties: {
                name: { type: 'string', minLength: 3 }
            }
        };
        const newFeatures = [
            { id: 'new1', properties: { name: 'Jo' }, _new: true }
        ];

        act(() => {
            ReactDOM.render(
                <Component
                    featurePropertiesJSONSchema={schema}
                    features={[]}
                    newFeatures={newFeatures}
                    changes={{}}
                />,
                document.getElementById("container")
            );
        });

        expect(validationResults.new1).toBeTruthy();
        expect(validationResults.new1.changed).toBe(true);
    });

    it('should combine newFeatures and features', () => {
        const schema = {
            type: 'object',
            properties: {
                name: { type: 'string', minLength: 3 }
            }
        };
        const features = [
            { id: '1', properties: { name: 'Jo' } }
        ];
        const newFeatures = [
            { id: 'new1', properties: { name: 'Ja' }, _new: true }
        ];

        act(() => {
            ReactDOM.render(
                <Component
                    featurePropertiesJSONSchema={schema}
                    features={features}
                    newFeatures={newFeatures}
                    changes={{}}
                />,
                document.getElementById("container")
            );
        });

        expect(Object.keys(validationResults).length).toBe(2);
        expect(validationResults['1']).toBeTruthy();
        expect(validationResults.new1).toBeTruthy();
    });

    it('should handle features without id', () => {
        const schema = {
            type: 'object',
            properties: {
                name: { type: 'string' }
            }
        };
        const features = [
            { properties: { name: 'John' } }, // no id
            { id: '1', properties: { name: 'Jane' } }
        ];

        act(() => {
            ReactDOM.render(
                <Component
                    featurePropertiesJSONSchema={schema}
                    features={features}
                    changes={{}}
                />,
                document.getElementById("container")
            );
        });

        // Should only include feature with id
        expect(Object.keys(validationResults).length).toBe(0);
    });

    it('should handle empty features array', () => {
        const schema = {
            type: 'object',
            properties: {
                name: { type: 'string' }
            }
        };

        act(() => {
            ReactDOM.render(
                <Component
                    featurePropertiesJSONSchema={schema}
                    features={[]}
                    changes={{}}
                />,
                document.getElementById("container")
            );
        });

        expect(validationResults).toEqual({});
    });

    it('should handle empty newFeatures array', () => {
        const schema = {
            type: 'object',
            properties: {
                name: { type: 'string' }
            }
        };

        act(() => {
            ReactDOM.render(
                <Component
                    featurePropertiesJSONSchema={schema}
                    features={[]}
                    newFeatures={[]}
                    changes={{}}
                />,
                document.getElementById("container")
            );
        });

        expect(validationResults).toEqual({});
    });

    it('should exclude features with only primary key errors', () => {
        const schema = {
            type: 'object',
            properties: {
                fid: { type: 'string', minLength: 5 },
                name: { type: 'string' }
            }
        };
        const features = [
            { id: '1', properties: { fid: 'ab', name: 'John' } } // only fid has error, which is primary key
        ];

        act(() => {
            ReactDOM.render(
                <Component
                    featurePropertiesJSONSchema={schema}
                    features={features}
                    changes={{}}
                    primaryKeyAttributes={['fid']}
                />,
                document.getElementById("container")
            );
        });

        // Should not include this feature since only primary key has errors
        expect(validationResults).toEqual({});
    });

    it('should handle multiple primary key attributes', () => {
        const schema = {
            type: 'object',
            properties: {
                fid: { type: 'string' },
                ogc_fid: { type: 'string' },
                name: { type: 'string', minLength: 3 }
            }
        };
        const features = [
            { id: '1', properties: { fid: 'invalid', ogc_fid: 'invalid', name: 'Jo' } }
        ];

        act(() => {
            ReactDOM.render(
                <Component
                    featurePropertiesJSONSchema={schema}
                    features={features}
                    changes={{}}
                    primaryKeyAttributes={['fid', 'ogc_fid']}
                />,
                document.getElementById("container")
            );
        });

        expect(Object.keys(validationResults).length).toBe(1);
        const errorFields = validationResults['1'].errors.map(e => {
            const path = e.instancePath || e.dataPath || '';
            return path.replace(/^[./]/, '');
        });
        expect(errorFields).toNotContain('fid');
        expect(errorFields).toNotContain('ogc_fid');
        expect(errorFields).toContain('name');
    });

    it('should handle features with null properties', () => {
        const schema = {
            type: 'object',
            properties: {
                name: { type: 'string' },
                age: { type: 'number' }
            }
        };
        const features = [
            { id: '1', properties: null }
        ];

        act(() => {
            ReactDOM.render(
                <Component
                    featurePropertiesJSONSchema={schema}
                    features={features}
                    changes={{}}
                />,
                document.getElementById("container")
            );
        });

        // Should handle gracefully, likely will have validation errors for required fields or type mismatches
        expect(validationResults).toBeTruthy();
    });

    it('should update validation when changes are applied', () => {
        const schema = {
            type: 'object',
            properties: {
                name: { type: 'string', minLength: 3 }
            }
        };
        const features = [
            { id: '1', properties: { name: 'John' } }
        ];
        let changes = {};

        const TestComponent = (props) => {
            validationResults = useFeatureValidation({
                featurePropertiesJSONSchema: schema,
                features: features,
                changes: props.changes
            });
            return <div>{JSON.stringify(validationResults)}</div>;
        };

        act(() => {
            ReactDOM.render(
                <TestComponent changes={changes} />,
                document.getElementById("container")
            );
        });

        expect(validationResults).toEqual({});

        // Apply invalid change
        changes = { '1': { name: 'Jo' } };
        act(() => {
            ReactDOM.render(
                <TestComponent changes={changes} />,
                document.getElementById("container")
            );
        });

        expect(Object.keys(validationResults).length).toBe(1);
        expect(validationResults['1']).toBeTruthy();
        expect(validationResults['1'].changed).toBe(true);
    });

    it('should handle schema with no properties', () => {
        const schema = {
            type: 'object'
        };
        const features = [
            { id: '1', properties: { name: 'John' } }
        ];

        act(() => {
            ReactDOM.render(
                <Component
                    featurePropertiesJSONSchema={schema}
                    features={features}
                    changes={{}}
                />,
                document.getElementById("container")
            );
        });

        // Should handle gracefully
        expect(validationResults).toBeTruthy();
    });
});

