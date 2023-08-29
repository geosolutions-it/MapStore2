/**
 * Copyright 2023, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import expect from 'expect';
import {
    addPrintTransformer
} from '../../actions/print';

import {
    getSpecTransformerChain
} from '../../utils/PrintUtils';

import {
    addPrintTransformerEpic
} from '../print';

import { testEpic} from './epicTestUtils';


describe('Test the print epics', () => {

    it('Epics Add transformer', function(done) {
        testEpic(
            addPrintTransformerEpic,
            1,
            addPrintTransformer('transformer_mock', () => "mycustom_transformer"),
            actions => {
                try {
                    expect(actions.length).toEqual(1);
                    const chain = getSpecTransformerChain();
                    expect(chain.length).toBe(4);
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
        testEpic(
            addPrintTransformerEpic,
            1,
            addPrintTransformer('transformer_mock', () => "mycustom_transformer", 1.5),
            actions => {
                try {
                    expect(actions.length).toEqual(1);
                    const chain = getSpecTransformerChain();
                    expect(chain.length).toBe(4);
                    expect(chain[2].name).toBe("transformer_mock");
                    expect(chain[2].transformer()).toBe("mycustom_transformer");
                    done();
                } catch (e) {
                    done(e);
                }
            }, {}
        );
    });
});
