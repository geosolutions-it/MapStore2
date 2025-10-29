/*
 * Copyright 2025, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

/**
 * Validates an IP address in CIDR notation (required format)
 * @param {string} ipAddress - The IP address in CIDR notation (e.g., "192.168.1.1/32" or "192.168.1.0/24")
 * @returns {object} - Returns { isValid: boolean, error: string|null } where error is a translation key
 */
export function validateIPAddress(ipAddress) {
    if (!ipAddress || typeof ipAddress !== 'string') {
        return { isValid: false, error: 'ipManager.validation.ipRequired' };
    }

    // Trim whitespace
    const trimmedIP = ipAddress.trim();

    if (!trimmedIP) {
        return { isValid: false, error: 'ipManager.validation.ipRequired' };
    }

    // CIDR notation is required (IP/mask)
    const parts = trimmedIP.split('/');

    // Must have exactly 2 parts: IP and mask
    if (parts.length !== 2) {
        return { isValid: false, error: 'ipManager.validation.cidrRequired' };
    }

    // Validate CIDR notation: IP/mask
    const ip = parts[0].trim();
    const maskStr = parts[1].trim();
    const mask = parseInt(maskStr, 10);

    // Validate mask
    if (maskStr === '' || isNaN(mask) || mask < 0 || mask > 32) {
        return { isValid: false, error: 'ipManager.validation.invalidMask' };
    }

    // Validate IP address format
    const ipParts = ip.split('.');
    if (ipParts.length !== 4) {
        return { isValid: false, error: 'ipManager.validation.invalidFormat' };
    }

    for (let i = 0; i < 4; i++) {
        const octetStr = ipParts[i].trim();
        const octet = parseInt(octetStr, 10);
        if (octetStr === '' || isNaN(octet) || octet < 0 || octet > 255) {
            return { isValid: false, error: 'ipManager.validation.invalidOctet' };
        }
    }

    return { isValid: true, error: null };
}

