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

import jakarta.servlet.ServletContext;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.io.FileInputStream;
import java.io.FileNotFoundException;
import java.io.IOException;
import java.io.InputStream;
import java.util.HashSet;
import java.util.Properties;
import java.util.Set;

/**
 * ProxyConfig class to define the proxy configuration.
 *
 * @author Tobia Di Pisa at tobia.dipisa@geo-solutions.it
 */
final class ProxyConfig {

    private static final Logger LOGGER = LoggerFactory.getLogger(ProxyConfig.class);

    /**
     * A list of regular expressions describing hostnames the proxy is permitted to forward to
     */
    private Set<String> hostnameWhitelist = new HashSet<>();

    /**
     * A list of regular expressions describing MIMETypes the proxy is permitted to forward
     */
    private Set<String> mimetypeWhitelist = new HashSet<>();

    /**
     * A list of regular expressions describing Request Types the proxy is permitted to forward
     */
    private Set<String> reqtypeWhitelist = new HashSet<>();

    /**
     * A list of regular expressions describing request METHODS the proxy is permitted to forward
     */
    private Set<String> methodsWhitelist = new HashSet<>();

    /**
     * A list of regular expressions describing request HOSTS the proxy is permitted to forward
     */
    private Set<String> hostsWhitelist = new HashSet<>();

    /**
     * A list of request header names (case-insensitive) that the proxy is permitted to forward.
     * If non-empty, only headers in this set will be forwarded.
     */
    private Set<String> requestHeaderWhitelist = new HashSet<>();

    /**
     * A list of request header names (case-insensitive) that the proxy must NOT forward.
     * Headers in this set will always be removed, even if they appear in the whitelist.
     */
    private Set<String> requestHeaderBlacklist = Utils.toLowerCaseSet(Utils.parseWhiteList(DEFAULT_REQUEST_HEADER_BLACKLIST));

    /**
     * The servlet context
     */
    private ServletContext context;

    /**
     * The path of the properties file
     */
    private String propertiesFilePath;

    /**
     * The request timeout
     */
    private int soTimeout = 30000;

    /**
     * The connection timeout
     */
    private int connectionTimeout = 30000;

    /**
     * The maximum total connections available
     */
    private int maxTotalConnections = 60;

    /**
     * The maximum connections available per host
     */
    private int defaultMaxConnectionsPerHost = 6;

    private int defaultStreamByteSize = 1024;

    /**
     * @param context
     * @param propertiesFilePath
     */
    public ProxyConfig(ServletContext context, String propertiesFilePath) {
        this.context = context;
        this.propertiesFilePath = propertiesFilePath;

        configProxy();
    }

    /**
     * Provide the proxy configuration
     */
    private void configProxy() {
        Properties props = propertiesLoader();

        // ////////////////////////////////////////////////////////////
        // Load proxy configuration white lists from properties file
        // ////////////////////////////////////////////////////////////

        if (props != null) {
            Set<String> p = Utils.parseWhiteList(props.getProperty("hostnameWhitelist"));
            if (p != null)
                this.setHostnameWhitelist(p);

            p = Utils.parseWhiteList(props.getProperty("mimetypeWhitelist"));
            if (p != null)
                this.setMimetypeWhitelist(p);

            p = Utils.parseWhiteList(props.getProperty("methodsWhitelist"));
            if (p != null)
                this.setMethodsWhitelist(p);

            p = Utils.parseWhiteList(props.getProperty("hostsWhitelist"));
            if (p != null)
                this.setHostsWhitelist(p);

            p = Utils.parseWhiteList(props.getProperty("requestHeaderWhitelist"));
            if (p != null)
                this.setRequestHeaderWhitelist(Utils.toLowerCaseSet(p));

            p = Utils.parseWhiteList(props.getProperty("requestHeaderBlacklist", DEFAULT_REQUEST_HEADER_BLACKLIST));
            if (p != null)
                this.setRequestHeaderBlacklist(Utils.toLowerCaseSet(p));

            // ////////////////////////////////////////
            // Read various request type properties
            // ////////////////////////////////////////

            Set<String> rt = new HashSet<>();
            String s = props.getProperty("reqtypeWhitelist.capabilities");
            if (s != null)
                rt.add(s);

            s = props.getProperty("reqtypeWhitelist.geostore");
            if (s != null)
                rt.add(s);

            s = props.getProperty("reqtypeWhitelist.csw");
            if (s != null)
                rt.add(s);

            s = props.getProperty("reqtypeWhitelist.featureinfo");
            if (s != null)
                rt.add(s);

            s = props.getProperty("reqtypeWhitelist.generic");
            if (s != null)
                rt.add(s);

            this.setReqtypeWhitelist(rt);

            try {
                // /////////////////////////////////////////////////
                // Load byte size configuration from
                // properties file.
                // /////////////////////////////////////////////////

                String bytesSize = props.getProperty("defaultStreamByteSize");
                this.setDefaultStreamByteSize(bytesSize != null ? Integer.parseInt(bytesSize) :
                        this.defaultStreamByteSize);

                // /////////////////////////////////////////////////
                // Load connection manager configuration from
                // properties file.
                // /////////////////////////////////////////////////

                String timeout = props.getProperty("timeout");
                this.setSoTimeout(timeout != null ? Integer.parseInt(timeout) : this.soTimeout);

                String conn_timeout = props.getProperty("connection_timeout");
                this.setConnectionTimeout(conn_timeout != null ? Integer.parseInt(conn_timeout)
                        : this.connectionTimeout);

                String max_conn = props.getProperty("max_total_connections");
                this.setMaxTotalConnections(max_conn != null ? Integer.parseInt(max_conn)
                        : this.maxTotalConnections);

                String def_conn_host = props.getProperty("default_max_connections_per_host");
                this.setDefaultMaxConnectionsPerHost(def_conn_host != null ? Integer.parseInt(def_conn_host)
                        : this.defaultMaxConnectionsPerHost);

            } catch (NumberFormatException e) {
                LOGGER.error("Error parsing proxy configuration: {}", e.getMessage(), e);

                this.setSoTimeout(this.soTimeout);
                this.setConnectionTimeout(this.connectionTimeout);
                this.setMaxTotalConnections(this.maxTotalConnections);
                this.setDefaultMaxConnectionsPerHost(this.defaultMaxConnectionsPerHost);
                this.setDefaultStreamByteSize(this.defaultStreamByteSize);
            }
        }
    }

    /**
     * Read the proxy properties file.
     *
     * @return Properties
     */
    public Properties propertiesLoader() {
        Properties props = new Properties();
        // can specify more paths, comma separated, all are read, if they exist
        for (String path : propertiesFilePath.split(",")) {
            mergePropertiesConfig(path, props);
        }
        return props;
    }

    private void mergePropertiesConfig(String path, Properties properties) {
        InputStream inputStream = ProxyConfig.class.getResourceAsStream(path);
        if (inputStream == null) {
            try {
                inputStream = new FileInputStream(path);
            } catch (FileNotFoundException e) {
                LOGGER.warn("The properties file {} cannot be found", path);
            }
        }
        if (inputStream != null) {
            try (InputStream is = inputStream) {
                Properties props = new Properties();
                props.load(is);
                properties.putAll(props);
            } catch (IOException e) {
                LOGGER.error("Error loading the proxy properties file from {}", path, e);
            }
        }
    }

    /**
     * @return the soTimeout
     */
    public int getSoTimeout() {
        return soTimeout;
    }

    /**
     * @param soTimeout the soTimeout to set
     */
    public void setSoTimeout(int soTimeout) {
        this.soTimeout = soTimeout;
    }

    /**
     * @return the connectionTimeout
     */
    public int getConnectionTimeout() {
        return connectionTimeout;
    }

    /**
     * @param connectionTimeout the connectionTimeout to set
     */
    public void setConnectionTimeout(int connectionTimeout) {
        this.connectionTimeout = connectionTimeout;
    }

    /**
     * @return the maxTotalConnections
     */
    public int getMaxTotalConnections() {
        return maxTotalConnections;
    }

    /**
     * @param maxTotalConnections the maxTotalConnections to set
     */
    public void setMaxTotalConnections(int maxTotalConnections) {
        this.maxTotalConnections = maxTotalConnections;
    }

    /**
     * @return the defaultMaxConnectionsPerHost
     */
    public int getDefaultMaxConnectionsPerHost() {
        return defaultMaxConnectionsPerHost;
    }

    /**
     * @param defaultMaxConnectionsPerHost the defaultMaxConnectionsPerHost to set
     */
    public void setDefaultMaxConnectionsPerHost(int defaultMaxConnectionsPerHost) {
        this.defaultMaxConnectionsPerHost = defaultMaxConnectionsPerHost;
    }

    /**
     * @return the hostnameWhitelist
     */
    public Set<String> getHostnameWhitelist() {
        Properties props = propertiesLoader();

        if (props != null) {
            Set<String> set = Utils.parseWhiteList(props.getProperty("hostnameWhitelist"));
            if (set != null)
                this.setHostnameWhitelist(set);
        }

        return hostnameWhitelist;
    }

    /**
     * @param hostnameWhitelist the hostnameWhitelist to set
     */
    public void setHostnameWhitelist(Set<String> hostnameWhitelist) {
        this.hostnameWhitelist = hostnameWhitelist;
    }

    /** Private destination exceptions, matched against the requested host and optional port. */
    public Set<String> getAllowedPrivateHosts() {
        Set<String> entries = Utils.parseWhiteList(
                propertiesLoader().getProperty("allowedPrivateHosts"));
        return entries != null ? entries : Set.of();
    }

    /** CIDR ranges that may be reached even when they are non-public. */
    public Set<String> getAllowedPrivateNetworks() {
        Set<String> entries = Utils.parseWhiteList(
                propertiesLoader().getProperty("allowedPrivateNetworks"));
        return entries != null ? entries : Set.of();
    }

    /**
     * Whether the destination checks are switched off, so that non-public destinations can be
     * reached as before 1.7. Defaults to false.
     */
    public boolean isAllowPrivateDestinations() {
        return Boolean.parseBoolean(
                propertiesLoader().getProperty("allowPrivateDestinations", "false").trim());
    }

    /**
     * Whether the Content-Type of remote responses is checked against {@code mimetypeWhitelist}.
     * Defaults to false: every proxied response is already served with a sandboxing
     * Content-Security-Policy and nosniff, and many deployments rely on types their list does not
     * name, because responses were not checked before.
     */
    public boolean isCheckResponseContentType() {
        return Boolean.parseBoolean(
                propertiesLoader().getProperty("checkResponseContentType", "false").trim());
    }

    /**
     * Whether requests may be sent through the JVM outbound proxy ({@code http.proxyHost} /
     * {@code https.proxyHost}) when one is configured. Defaults to true.
     */
    public boolean isAllowForwardProxy() {
        return Boolean.parseBoolean(
                propertiesLoader().getProperty("allowForwardProxy", "true").trim());
    }

    /**
     * Response headers that are not copied from the remote host by default: each of them would
     * change state the browser keeps for this application's origin.
     */
    /**
     * Request headers never forwarded to the remote host unless {@code requestHeaderBlacklist} is
     * set. The browser's cookies belong to this application, not to the hosts it proxies to.
     */
    static final String DEFAULT_REQUEST_HEADER_BLACKLIST = "Cookie";

    static final String DEFAULT_RESPONSE_HEADER_BLACKLIST =
            "Set-Cookie,Set-Cookie2,Clear-Site-Data,Strict-Transport-Security";

    /**
     * Remote response headers that are not passed back to the client, lower-cased. Defaults to
     * {@link #DEFAULT_RESPONSE_HEADER_BLACKLIST}; an empty value passes every header through.
     */
    public Set<String> getResponseHeaderBlacklist() {
        Set<String> entries = Utils.toLowerCaseSet(Utils.parseWhiteList(propertiesLoader()
                .getProperty("responseHeaderBlacklist", DEFAULT_RESPONSE_HEADER_BLACKLIST)));
        return entries != null ? entries : Set.of();
    }

    /**
     * @return the mimetypeWhitelist
     */
    public Set<String> getMimetypeWhitelist() {
        Properties props = propertiesLoader();

        if (props != null) {
            Set<String> set = Utils.parseWhiteList(props.getProperty("mimetypeWhitelist"));
            if (set != null)
                this.setMimetypeWhitelist(set);
        }

        return mimetypeWhitelist;
    }

    /**
     * @param mimetypeWhitelist the mimetypeWhitelist to set
     */
    public void setMimetypeWhitelist(Set<String> mimetypeWhitelist) {
        this.mimetypeWhitelist = mimetypeWhitelist;
    }

    /**
     * @return the reqtypeWhitelist
     */
    public Set<String> getReqtypeWhitelist() {
        Properties props = propertiesLoader();

        if (props != null) {
            Set<String> rt = new HashSet<>();
            String s = props.getProperty("reqtypeWhitelist.capabilities");
            if (s != null)
                rt.add(s);

            s = props.getProperty("reqtypeWhitelist.geostore");
            if (s != null)
                rt.add(s);

            s = props.getProperty("reqtypeWhitelist.csw");
            if (s != null)
                rt.add(s);

            s = props.getProperty("reqtypeWhitelist.featureinfo");
            if (s != null)
                rt.add(s);

            s = props.getProperty("reqtypeWhitelist.generic");
            if (s != null)
                rt.add(s);

            this.setReqtypeWhitelist(rt);
        }

        return reqtypeWhitelist;
    }

    /**
     * @param reqtypeWhitelist the reqtypeWhitelist to set
     */
    public void setReqtypeWhitelist(Set<String> reqtypeWhitelist) {
        this.reqtypeWhitelist = reqtypeWhitelist;
    }

    /**
     * @return the methodsWhitelist
     */
    public Set<String> getMethodsWhitelist() {
        Properties props = propertiesLoader();

        if (props != null) {
            Set<String> set = Utils.parseWhiteList(props.getProperty("methodsWhitelist"));
            if (set != null)
                this.setMethodsWhitelist(set);
        }

        return methodsWhitelist;
    }

    /**
     * @param methodsWhitelist the methodsWhitelist to set
     */
    public void setMethodsWhitelist(Set<String> methodsWhitelist) {
        this.methodsWhitelist = methodsWhitelist;
    }

    /**
     * @return the hostsWhitelist
     */
    public Set<String> getHostsWhitelist() {
        Properties props = propertiesLoader();

        if (props != null) {
            Set<String> set = Utils.parseWhiteList(props.getProperty("hostsWhitelist"));
            if (set != null)
                this.setHostsWhitelist(set);
        }

        return hostsWhitelist;
    }

    /**
     * @param hostsWhitelist the hostsWhitelist to set
     */
    public void setHostsWhitelist(Set<String> hostsWhitelist) {
        this.hostsWhitelist = hostsWhitelist;
    }

    /**
     * @return the requestHeaderWhitelist
     */
    public Set<String> getRequestHeaderWhitelist() {
        Properties props = propertiesLoader();

        if (props != null) {
            Set<String> set = Utils.parseWhiteList(props.getProperty("requestHeaderWhitelist"));
            if (set != null)
                this.setRequestHeaderWhitelist(Utils.toLowerCaseSet(set));
        }

        return requestHeaderWhitelist;
    }

    /**
     * @param requestHeaderWhitelist the requestHeaderWhitelist to set
     */
    public void setRequestHeaderWhitelist(Set<String> requestHeaderWhitelist) {
        this.requestHeaderWhitelist = requestHeaderWhitelist;
    }

    /**
     * @return the requestHeaderBlacklist
     */
    public Set<String> getRequestHeaderBlacklist() {
        Properties props = propertiesLoader();

        if (props != null) {
            Set<String> set = Utils.parseWhiteList(
                    props.getProperty("requestHeaderBlacklist", DEFAULT_REQUEST_HEADER_BLACKLIST));
            if (set != null)
                this.setRequestHeaderBlacklist(Utils.toLowerCaseSet(set));
        }

        return requestHeaderBlacklist;
    }

    /**
     * @param requestHeaderBlacklist the requestHeaderBlacklist to set
     */
    public void setRequestHeaderBlacklist(Set<String> requestHeaderBlacklist) {
        this.requestHeaderBlacklist = requestHeaderBlacklist;
    }

    /**
     * @return the context
     */
    public ServletContext getContext() {
        return context;
    }

    /**
     * @param context the context to set
     */
    public void setContext(ServletContext context) {
        this.context = context;
    }

    /**
     * @return the propertiesFilePath
     */
    public String getPropertiesFilePath() {
        return propertiesFilePath;
    }

    /**
     * @param propertiesFilePath the propertiesFilePath to set
     */
    public void setPropertiesFilePath(String propertiesFilePath) {
        this.propertiesFilePath = propertiesFilePath;
    }

    /**
     * @return the defaultStreamByteSize
     */
    public int getDefaultStreamByteSize() {
        return defaultStreamByteSize;
    }

    /**
     * @param defaultStreamByteSize the defaultStreamByteSize to set
     */
    public void setDefaultStreamByteSize(int defaultStreamByteSize) {
        this.defaultStreamByteSize = defaultStreamByteSize;
    }

}
