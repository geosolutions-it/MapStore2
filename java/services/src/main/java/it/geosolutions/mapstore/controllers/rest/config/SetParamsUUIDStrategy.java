/*
 * Copyright 2022, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
package it.geosolutions.mapstore.controllers.rest.config;

/**
 * Represents and UUID generation strategy.
 */
interface SetParamsUUIDStrategy {

    /**
     * Generate a UUID.
     * @return the uuid as a String.
     */
    String generateUUID();
}
