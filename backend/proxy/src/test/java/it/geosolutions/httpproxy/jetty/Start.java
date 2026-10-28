/*
 *  Copyright (C) 2007 - 2011 GeoSolutions S.A.S.
 *  http://www.geo-solutions.it
 *
 *  GPLv3 + Classpath exception
 *
 *  This program is free software: you can redistribute it and/or modify
 *  it under the terms of the GNU General Public License as published by
 *  the Free Software Foundation, either version 3 of the License, or
 *  (at your option) any later version.
 *
 *  This program is distributed in the hope that it will be useful,
 *  but WITHOUT ANY WARRANTY; without even the implied warranty of
 *  MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 *  GNU General Public License for more details.
 *
 *  You should have received a copy of the GNU General Public License
 *  along with this program.  If not, see <http://www.gnu.org/licenses/>.
 */
package it.geosolutions.httpproxy.jetty;

import org.eclipse.jetty.ee10.webapp.WebAppContext;
import org.eclipse.jetty.server.Server;
import org.eclipse.jetty.server.ServerConnector;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

/**
 * Start class for test using embedded Jetty server.
 * 
 * @author Tobia di Pisa at tobia.dipisa@geo-solutions.it
 */
public class Start {

    private static final Logger LOGGER = LoggerFactory.getLogger(Start.class);

    /**
     * @param args
     */
    public static void main(String[] args) {
        Server jettyServer = null;

        try {
            jettyServer = new Server();

            ServerConnector connector = new ServerConnector(jettyServer);
            String portVariable = System.getProperty("jetty.port");
            int port = parsePort(portVariable);

            if (port <= 0) {
                port = 8080;
            }

            connector.setPort(port);
            jettyServer.addConnector(connector);

            WebAppContext webapp = new WebAppContext();
            webapp.setContextPath("/http_proxy");
            webapp.setWar("src/main/webapp");
            webapp.setTempDirectory(new java.io.File("target/work"));
            jettyServer.setHandler(webapp);

            jettyServer.start();
            LOGGER.info("Jetty started on port {}", port);
            jettyServer.join();

        } catch (Exception e) {
            LOGGER.error("Could not start the Jetty server: {}", e.getMessage(), e);

            if (jettyServer != null) {
                try {
                    jettyServer.stop();
                } catch (Exception e1) {
                    LOGGER.error("Unable to stop the Jetty server: {}", e1.getMessage(), e1);
                }
            }
        }
    }

    /**
     * @param portVariable
     * @return int
     */
    private static int parsePort(String portVariable) {
        if (portVariable == null) {
            return -1;
        }

        try {
            return Integer.parseInt(portVariable);
        } catch (NumberFormatException e) {
            return -1;
        }
    }
}
