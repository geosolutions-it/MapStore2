package it.geosolutions.geostore.services.rest.utils;

import jakarta.ws.rs.core.MultivaluedMap;

import org.apache.cxf.jaxrs.impl.MetadataMap;
import org.apache.cxf.message.Message;
import org.apache.cxf.phase.AbstractPhaseInterceptor;
import org.apache.cxf.phase.Phase;

import java.io.OutputStream;

/**
 * Attach to the response the header CacheControl
 *
 * @author Lorenzo Natali, GeoSolutions SAS
 */
@SuppressWarnings("PMD.CloseResource")
public class FixedCacheControlOutInterceptor extends AbstractPhaseInterceptor<Message> {

    public FixedCacheControlOutInterceptor() {
        super(Phase.MARSHAL);
    }

    @SuppressWarnings("unchecked")
    public final void handleMessage(Message message) {
        OutputStream os = message.getContent(OutputStream.class);
        if (os == null) {
            return;
        }
        MultivaluedMap<String, Object> headers =
                (MetadataMap<String, Object>) message.get(Message.PROTOCOL_HEADERS);
        if (headers == null) {
            headers = new MetadataMap<String, Object>();
        }
        headers.add("Cache-Control", "no-cache");
        headers.add("Expires", "-1");
        message.put(Message.PROTOCOL_HEADERS, headers);
    }
}
