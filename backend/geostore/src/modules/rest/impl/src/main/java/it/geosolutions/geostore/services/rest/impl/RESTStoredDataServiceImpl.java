/*
 *  Copyright (C) 2007 - 2025 GeoSolutions S.A.S.
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
package it.geosolutions.geostore.services.rest.impl;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ObjectNode;
import com.fasterxml.jackson.dataformat.xml.XmlMapper;

import it.geosolutions.geostore.core.model.Resource;
import it.geosolutions.geostore.core.model.StoredData;
import it.geosolutions.geostore.core.model.User;
import it.geosolutions.geostore.services.StoredDataService;
import it.geosolutions.geostore.services.exception.NotFoundServiceEx;
import it.geosolutions.geostore.services.rest.RESTStoredDataService;
import it.geosolutions.geostore.services.rest.exception.BadRequestWebEx;
import it.geosolutions.geostore.services.rest.exception.ForbiddenErrorWebEx;
import it.geosolutions.geostore.services.rest.exception.InternalErrorWebEx;
import it.geosolutions.geostore.services.rest.exception.NotFoundWebEx;
import it.geosolutions.geostore.services.rest.model.enums.RawFormat;
import it.geosolutions.geostore.services.rest.utils.DataURIDecoder;

import jakarta.ws.rs.core.HttpHeaders;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;
import jakarta.ws.rs.core.SecurityContext;

import org.apache.commons.codec.binary.Base64;
import org.apache.logging.log4j.LogManager;
import org.apache.logging.log4j.Logger;
import org.jdom2.Element;
import org.jdom2.input.SAXBuilder;
import org.jdom2.output.Format;
import org.jdom2.output.XMLOutputter;

import java.io.StringReader;
import java.util.Arrays;
import java.util.Collection;
import java.util.Collections;
import java.util.Set;
import java.util.stream.Collectors;

/**
 * Class RESTStoredDataServiceImpl.
 *
 * @author ETj (etj at geo-solutions.it)
 * @author Tobia di Pisa (tobia.dipisa at geo-solutions.it)
 */
public class RESTStoredDataServiceImpl extends RESTServiceImpl implements RESTStoredDataService {

    private static final Logger LOGGER = LogManager.getLogger(RESTStoredDataServiceImpl.class);

    private static final ObjectMapper JSON_MAPPER = new ObjectMapper();
    private static final XmlMapper XML_MAPPER = new XmlMapper();

    private static final Collection<MediaType> GET_XML_MEDIA_TYPES =
            Arrays.asList(MediaType.TEXT_XML_TYPE, MediaType.APPLICATION_XML_TYPE);
    private static final Collection<MediaType> GET_JSON_MEDIA_TYPES =
            Collections.singletonList(MediaType.APPLICATION_JSON_TYPE);
    private static final Collection<MediaType> GET_TEXT_MEDIA_TYPES =
            Collections.singletonList(MediaType.TEXT_PLAIN_TYPE);
    private StoredDataService storedDataService;

    private Set<String> publicRawCategories = Set.of();

    public void setStoredDataService(StoredDataService storedDataService) {
        this.storedDataService = storedDataService;
    }

    /**
     * Sets the categories whose raw data ({@code GET /data/{id}/raw}) is served without checking
     * that the caller can read the resource. GeoStore sets it from the {@code publicRawCategories}
     * key in {@code geostore.properties}, shipped as {@code THUMBNAIL} because MapStore loads
     * thumbnails in {@code <img>} tags, which send no authorization header. When it is not set, no
     * category is public.
     *
     * <p>Names are comma-separated and trimmed, and they must match the category name exactly, case
     * included. An empty value makes every category require read permission. Deployments can
     * override it in {@code geostore-ovr.properties} as {@code
     * restStoredDataService.publicRawCategories}.
     *
     * @param categories comma-separated category names, or an empty string for none
     */
    public void setPublicRawCategories(String categories) {
        this.publicRawCategories =
                categories == null
                        ? Set.of()
                        : Arrays.stream(categories.split(","))
                                .map(String::trim)
                                .filter(name -> !name.isEmpty())
                                .collect(Collectors.toUnmodifiableSet());
    }

    @Override
    public long update(SecurityContext sc, long id, String data) throws NotFoundWebEx {
        try {
            if (data == null) throw new BadRequestWebEx("Data is null");

            //
            // Authorization check.
            //
            boolean canUpdate;
            User authUser = extractAuthUser(sc);
            canUpdate = resourceAccessWrite(authUser, id); // The ID is also the resource ID

            if (canUpdate) {
                storedDataService.update(id, data);
            } else {
                throw new ForbiddenErrorWebEx("This user cannot update or create this store !");
            }

            return id;
        } catch (NotFoundServiceEx ex) {
            LOGGER.warn("Data not found ({}): {}", id, ex.getMessage(), ex);
            throw new NotFoundWebEx("Data not found");
        }
    }

    @Override
    public void delete(SecurityContext sc, long id) throws NotFoundWebEx {
        //
        // Authorization check.
        //
        boolean canDelete;
        User authUser = extractAuthUser(sc);
        canDelete = resourceAccessWrite(authUser, id);

        if (canDelete) {
            boolean ret = storedDataService.delete(id);
            if (!ret) throw new NotFoundWebEx("Data not found");
        } else throw new ForbiddenErrorWebEx("This user cannot delete this store !");
    }

    @Override
    public String get(SecurityContext sc, HttpHeaders headers, long id) throws NotFoundWebEx {
        if (id == -1) return "dummy payload";

        //
        // Authorization check.
        //
        boolean canRead;
        User authUser = extractAuthUser(sc);
        canRead = resourceAccessRead(authUser, id); // The ID is also the resource ID
        if (!canRead) {
            throw new ForbiddenErrorWebEx("This user cannot read this stored data !");
        }

        StoredData storedData;
        try {
            storedData = storedDataService.get(id);
        } catch (NotFoundServiceEx e) {
            throw new NotFoundWebEx("Data not found");
        }

        String data = storedData == null ? "" : storedData.getData();

        // prefer no transformation
        if (headers.getAcceptableMediaTypes().contains(MediaType.WILDCARD_TYPE)) {
            return data;
        } else if (!Collections.disjoint(GET_TEXT_MEDIA_TYPES, headers.getAcceptableMediaTypes())) {
            return data;
        } else if (!Collections.disjoint(GET_JSON_MEDIA_TYPES, headers.getAcceptableMediaTypes())) {
            return toJSON(data);
        } else if (!Collections.disjoint(GET_XML_MEDIA_TYPES, headers.getAcceptableMediaTypes())) {
            return toXML(data);
        } else
            throw new InternalErrorWebEx(
                    "Illegal state (" + headers.getAcceptableMediaTypes() + ")");
    }

    private String toJSON(String data) {

        try {
            // ////////////////////////
            // XML to JSON
            // ////////////////////////
            JsonNode json = XML_MAPPER.readTree(data.getBytes());
            String ret = JSON_MAPPER.writeValueAsString(json);
            if (LOGGER.isDebugEnabled()) LOGGER.debug("Transformed XML -> JSON");
            return ret;
        } catch (Exception exc) {
            if (LOGGER.isDebugEnabled()) LOGGER.debug("Data is not in native XML format.");
        }

        try {
            // ///////////////////////
            // data To JSON conversion
            // ///////////////////////
            JSON_MAPPER.readTree(data);
            if (LOGGER.isDebugEnabled()) LOGGER.debug("Data is in native JSON format.");
            return data;

        } catch (Exception e) {
            if (LOGGER.isDebugEnabled()) LOGGER.debug("Data is not in native JSON format.");
        }

        ObjectNode jsonObj = JSON_MAPPER.createObjectNode();
        jsonObj.put("data", data);
        String ret = jsonObj.toString();
        if (LOGGER.isDebugEnabled()) LOGGER.debug("Transformed plaintext -> JSON");

        return ret;
    }

    private String toXML(String data) {

        // Try an XML source
        try (StringReader reader = new StringReader(data)) {
            SAXBuilder builder = new SAXBuilder();
            builder.setFeature("http://apache.org/xml/features/disallow-doctype-decl", true);
            builder.setFeature("http://xml.org/sax/features/external-general-entities", false);
            builder.setFeature("http://xml.org/sax/features/external-parameter-entities", false);
            builder.build(reader);
            // no errors: return the original data
            if (LOGGER.isDebugEnabled()) LOGGER.debug("Data is in native XML format.");
            return data;
        } catch (Exception e) {
            if (LOGGER.isDebugEnabled()) LOGGER.debug("Data is not in native XML format.", e);
        }

        // Try JSON source
        try {
            // ///////////////////////
            // JSON To XML conversion
            // ///////////////////////
            JsonNode json = JSON_MAPPER.readTree(data.getBytes());
            // Serializing a JsonNode with XmlMapper without an explicit root name emits the
            // node's class name (e.g. <ObjectNode>) as the root element; pin a stable "data"
            // root, consistent with the plaintext branch below.
            String xml = XML_MAPPER.writer().withRootName("data").writeValueAsString(json);
            if (LOGGER.isDebugEnabled()) LOGGER.debug("Transformed JSON -> XML");
            return xml;

        } catch (Exception exc) {
            if (LOGGER.isDebugEnabled()) LOGGER.debug("Data is not in native JSON format.", exc);
        }

        // Force XML format
        Element element = new Element("data");
        element.addContent(data);

        XMLOutputter outputter = new XMLOutputter(Format.getPrettyFormat());
        String ret = outputter.outputString(element);
        if (LOGGER.isDebugEnabled()) LOGGER.debug("Transformed plaintext -> XML");

        return ret;
    }

    @Override
    public Response getRaw(SecurityContext sc, HttpHeaders headers, long id, String decodeFormat)
            throws NotFoundWebEx {
        if (id == -1) return rawResponse(Response.ok().entity("dummy payload"));

        Resource resource = resourceService.getResource(id, false, true, false);
        if (resource == null) return rawResponse(Response.status(Response.Status.NOT_FOUND));

        if (!isPublicRawCategory(resource)
                && !resourcePermissionService.canResourceBeReadByUser(
                        resource, extractAuthUser(sc))) {
            throw new ForbiddenErrorWebEx("This user cannot read this stored data !");
        }

        StoredData storedData;
        try {
            storedData = storedDataService.get(id);
        } catch (NotFoundServiceEx e) {
            return rawResponse(Response.status(Response.Status.NOT_FOUND));
        }

        if (storedData == null) {
            return rawResponse(Response.noContent());
        }

        String data = storedData.getData();

        // prefer no transformation
        if (decodeFormat == null) {
            return rawResponse(Response.ok().entity(data));
        } else if (decodeFormat.equalsIgnoreCase(RawFormat.BASE64.name())) {
            byte[] decoded = Base64.decodeBase64(data);
            return rawResponse(Response.ok().entity(decoded));
        } else if (decodeFormat.equalsIgnoreCase(RawFormat.DATAURI.name())) {
            return decodeDataURI(data);
        } else {
            LOGGER.warn("Unknown decode format '{}'", decodeFormat);
            return rawResponse(Response.ok().entity(data));
        }
    }

    /** See {@link #setPublicRawCategories(String)}. */
    private boolean isPublicRawCategory(Resource resource) {
        return resource.getCategory() != null
                && publicRawCategories.contains(resource.getCategory().getName());
    }

    /**
     * Builds a raw response with its security headers. Raw data is user-supplied, so browsers must
     * neither run it as a page on this origin nor guess its content type: keep these headers.
     */
    private Response rawResponse(Response.ResponseBuilder builder) {
        return builder.header("Content-Security-Policy", "sandbox")
                .header("X-Content-Type-Options", "nosniff")
                .build();
    }

    private Response decodeDataURI(String data) {
        if (!data.startsWith("data:")) {
            return rawResponse(
                    Response.status(Response.Status.BAD_REQUEST).entity("Not a data URI"));
        }

        String[] split = data.split(",", 2);

        if (split.length < 2) {
            return rawResponse(
                    Response.status(Response.Status.BAD_REQUEST)
                            .entity("Bad data, comma is missing"));
        }

        DataURIDecoder dud = new DataURIDecoder(split[0]);

        if (!dud.isValid()) {
            LOGGER.warn("Could not parse data URI '{}'", split[0]);
            return rawResponse(Response.status(Response.Status.BAD_REQUEST).entity("Bad data URI"));
        }

        if (dud.getMediatype() == null
                || !dud.getMediatype().regionMatches(true, 0, "image/", 0, 6)) {
            return rawResponse(
                    Response.status(Response.Status.BAD_REQUEST).entity("Not an image data URI"));
        }

        if (dud.getCharset() != null) {
            LOGGER.warn("TODO: Charset '{}' should be handled.", dud.getCharset());
        }

        if (dud.getEncoding() != null && !dud.isBase64Encoded()) {
            LOGGER.warn("TODO: Encoding '{}' should be handled.", dud.getEncoding());
        }

        Object entity = dud.isBase64Encoded() ? Base64.decodeBase64(split[1]) : split[1];

        return rawResponse(Response.ok().type(dud.getNormalizedMediatype()).entity(entity));
    }

    @SuppressWarnings("unused")
    private long parseId(String id) throws BadRequestWebEx {
        try {
            return Long.parseLong(id);
        } catch (Exception e) {
            LOGGER.info("Bad id requested '{}'", id);
            throw new BadRequestWebEx("Bad id");
        }
    }
}
