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
package it.geosolutions.httpproxy;

/**
 * Simple placeholder class for the proxy information.
 *
 * @author Simone Giannecchini, GeoSolutions SAS
 */
final class ProxyInfo {

    // Proxy host params
    /**
     * The host to which we are proxying requests
     */
    private String proxyHost;

    /**
     * The (optional) path on the proxy host to which we are proxying requests. Default value is "".
     */
    private String proxyPath;

    /**
     * The port on the proxy host to which we are proxying requests. Default value is 80.
     */
    private int proxyPort;

    public ProxyInfo(String proxyHost, String proxyPath, int proxyPort) {
        this.proxyHost = proxyHost;
        this.proxyPath = proxyPath;
        this.proxyPort = proxyPort;
    }

    public String getProxyHost() {
        return proxyHost;
    }

    public void setProxyHost(String proxyHost) {
        this.proxyHost = proxyHost;
    }

    public String getProxyPath() {
        return proxyPath;
    }

    public void setProxyPath(String proxyPath) {
        this.proxyPath = proxyPath;
    }

    public int getProxyPort() {
        return proxyPort;
    }

    public void setProxyPort(int proxyPort) {
        this.proxyPort = proxyPort;
    }
}
