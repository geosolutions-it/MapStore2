/* ====================================================================
 *
 * Copyright (C) 2007 - 2015 GeoSolutions S.A.S.
 * http://www.geo-solutions.it
 *
 * GPLv3 + Classpath exception
 *
 * This program is free software; you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation; either version 2 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program.
 *
 * ====================================================================
 *
 * This software consists of voluntary contributions made by developers
 * of GeoSolutions.  For more information on GeoSolutions, please see
 * <http://www.geo-solutions.it/>.
 *
 */
package it.geosolutions.geostore.services.rest.auditing;

import org.apache.logging.log4j.Logger;

final class LogUtils {

    private LogUtils() {}

    static void info(Logger logger, String formattedMessage, Object... messageArguments) {
        if (logger.isInfoEnabled()) {
            logger.info(String.format(formattedMessage, messageArguments));
        }
    }

    static void debug(Logger logger, String formattedMessage, Object... messageArguments) {
        if (logger.isDebugEnabled()) {
            logger.debug(String.format(formattedMessage, messageArguments));
        }
    }

    static void error(
            Logger logger,
            Throwable exception,
            String formattedMessage,
            Object... messageArguments) {
        logger.error(String.format(formattedMessage, messageArguments), exception);
    }

    static String arrayToString(String[] stringArray) {
        if (stringArray == null) {
            return "NULL";
        }
        if (stringArray.length == 0) {
            return "[]";
        }
        StringBuilder stringBuilder = new StringBuilder();
        stringBuilder.append('[');
        for (String string : stringArray) {
            stringBuilder.append(string).append(", ");
        }
        stringBuilder.delete(stringBuilder.length() - 2, stringBuilder.length() - 1);
        stringBuilder.append(']');
        return stringBuilder.toString();
    }
}
