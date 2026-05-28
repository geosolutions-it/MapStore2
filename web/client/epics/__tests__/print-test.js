/**
 * Copyright 2023, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import expect from 'expect';
import {
    addPrintTransformer, PRINT_TRANSFORMER_ADDED, RESET_PRINT_SPEC
} from '../../actions/print';

import {
    getSpecTransformerChain
} from '../../utils/PrintUtils';

import {
    addPrintTransformerEpic,
    resetMountPrintEpic
} from '../print';

import { testEpic } from './epicTestUtils';
import { MAP_PLUGIN_LOAD } from '../../actions/map';


describe('Test the print epics', () => {

    it('Epics Add transformer', function(done) {
        const chainLengthBeforeTest = getSpecTransformerChain().length;
        testEpic(
            addPrintTransformerEpic,
            1,
            addPrintTransformer('transformer_mock', () => "mycustom_transformer"),
            actions => {
                try {
                    expect(actions.length).toEqual(1);
                    expect(actions[0].type).toEqual(PRINT_TRANSFORMER_ADDED);
                    const chain = getSpecTransformerChain();
                    expect(chain.length).toBe(chainLengthBeforeTest + 1);
                    expect(chain[3].name).toBe("transformer_mock");
                    expect(chain[3].transformer()).toBe("mycustom_transformer");
                    done();
                } catch (e) {
                    done(e);
                }
            }, {}
        );
    });

    it('Epics Add transformer with position', function(done) {
        const chainLengthBeforeTest = getSpecTransformerChain().length;
        testEpic(
            addPrintTransformerEpic,
            1,
            addPrintTransformer('transformer_mock_pos', () => "mycustom_transformer_pos", 1.5),
            actions => {
                try {
                    expect(actions.length).toEqual(1);
                    expect(actions[0].type).toEqual(PRINT_TRANSFORMER_ADDED);
                    const chain = getSpecTransformerChain();
                    expect(chain.length).toBe(chainLengthBeforeTest + 1);
                    expect(chain[2].name).toBe("transformer_mock_pos");
                    expect(chain[2].transformer()).toBe("mycustom_transformer_pos");
                    done();
                } catch (e) {
                    done(e);
                }
            }, {}
        );
    });
    it('should dispatch RESET_PRINT_SPEC if print is mounted when MAP_PLUGIN_LOAD occurs', (done) => {
        const mockState = {
            print: {
                isMounted: true,
                spec: { sheet: 'A4' }
            }
        };

        const triggerAction = {
            type: MAP_PLUGIN_LOAD
        };

        testEpic(
            resetMountPrintEpic,
            1,
            triggerAction,
            (actions) => {
                try {
                    expect(actions.length).toEqual(1);
                    expect(actions[0].type).toEqual(RESET_PRINT_SPEC);
                    done();
                } catch (e) {
                    done(e);
                }
            },
            mockState
        );
    });

    it('should NOT dispatch any action if print is NOT mounted when MAP_PLUGIN_LOAD occurs', (done) => {
        const mockState = {
            print: {
                isMounted: false
            }
        };

        const triggerAction = {
            type: MAP_PLUGIN_LOAD
        };

        testEpic(
            resetMountPrintEpic,
            0,
            triggerAction,
            (actions) => {
                try {
                    expect(actions.length).toEqual(0);
                    done();
                } catch (e) {
                    done(e);
                }
            },
            mockState
        );
    });
});
