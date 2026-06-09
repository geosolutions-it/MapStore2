/*
 * Copyright 2025, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
import expect from 'expect';

import { validateIPAddress } from '../IPValidationUtils';

describe('IPValidationUtils test', () => {
    describe('validateIPAddress - Valid CIDR notation', () => {
        it('should accept valid CIDR formats', () => {
            const validCIDRs = [
                '192.168.1.1/32',
                '192.168.1.0/24',
                '192.168.0.0/16',
                '0.0.0.0/0',
                '  192.168.1.0/24  ',
                '192.168.1.0 / 24'
            ];

            validCIDRs.forEach(cidr => {
                const result = validateIPAddress(cidr);
                expect(result.isValid).toBe(true);
                expect(result.error).toBe(null);
            });
        });
    });

    describe('validateIPAddress - Invalid: Missing CIDR notation', () => {
        it('should reject missing or invalid CIDR notation', () => {
            const testCases = [
                { input: '192.168.1.1', expectedError: 'ipManager.validation.cidrRequired' },
                { input: '', expectedError: 'ipManager.validation.ipRequired' },
                { input: null, expectedError: 'ipManager.validation.ipRequired' },
                { input: undefined, expectedError: 'ipManager.validation.ipRequired' }
            ];

            testCases.forEach(({ input, expectedError }) => {
                const result = validateIPAddress(input);
                expect(result.isValid).toBe(false);
                expect(result.error).toBe(expectedError);
            });
        });
    });

    describe('validateIPAddress - Invalid: Bad IP octets', () => {
        it('should reject invalid IP octets', () => {
            const testCases = [
                { input: '192.168.1.256/32', expectedError: 'ipManager.validation.invalidOctet' },
                { input: '192.168.-1.1/32', expectedError: 'ipManager.validation.invalidOctet' },
                { input: '192.168.1.1.1/32', expectedError: 'ipManager.validation.invalidFormat' },
                { input: '192.168.1/24', expectedError: 'ipManager.validation.invalidFormat' },
                { input: 'abc.def.ghi.jkl/32', expectedError: 'ipManager.validation.invalidOctet' },
                { input: '192..1.1/32', expectedError: 'ipManager.validation.invalidOctet' }
            ];

            testCases.forEach(({ input, expectedError }) => {
                const result = validateIPAddress(input);
                expect(result.isValid).toBe(false);
                expect(result.error).toBe(expectedError);
            });
        });
    });

    describe('validateIPAddress - Invalid: Bad subnet masks', () => {
        it('should reject invalid subnet masks', () => {
            const invalidMasks = [
                '192.168.1.0/33',
                '192.168.1.0/-1',
                '192.168.1.0/',
                '192.168.1.0/abc'
            ];

            invalidMasks.forEach(input => {
                const result = validateIPAddress(input);
                expect(result.isValid).toBe(false);
                expect(result.error).toBe('ipManager.validation.invalidMask');
            });
        });
    });

    describe('validateIPAddress - Invalid: Malformed CIDR', () => {
        it('should reject malformed CIDR notation', () => {
            const testCases = [
                { input: '192.168.1.0/24/16', expectedError: 'ipManager.validation.cidrRequired' },
                { input: '192.168.1.0/', expectedError: 'ipManager.validation.invalidMask' }
            ];

            testCases.forEach(({ input, expectedError }) => {
                const result = validateIPAddress(input);
                expect(result.isValid).toBe(false);
                expect(result.error).toBe(expectedError);
            });
        });
    });
});

