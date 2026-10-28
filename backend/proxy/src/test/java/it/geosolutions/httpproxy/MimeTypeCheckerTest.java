package it.geosolutions.httpproxy;

import org.apache.hc.client5.http.classic.methods.HttpGet;
import org.apache.hc.core5.http.ClassicHttpResponse;
import org.apache.hc.core5.http.message.BasicClassicHttpResponse;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.io.TempDir;

import java.nio.file.Files;
import java.nio.file.Path;

import static org.junit.jupiter.api.Assertions.assertDoesNotThrow;
import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;

/** The response content-type check is opt-in and compares media types loosely. */
class MimeTypeCheckerTest {

    @TempDir
    Path tempDir;

    private MimeTypeChecker checker(String properties) throws Exception {
        Path file = tempDir.resolve("proxy.properties");
        Files.writeString(file, "mimetypeWhitelist = image/png,text/xml,text/csv;charset=UTF-8\n" + properties);
        return new MimeTypeChecker(new ProxyConfig(null, file.toString()));
    }

    private static ClassicHttpResponse response(String contentType) {
        BasicClassicHttpResponse response = new BasicClassicHttpResponse(200);
        if (contentType != null) {
            response.setHeader("Content-Type", contentType);
        }
        return response;
    }

    private static final HttpGet REQUEST = new HttpGet("http://gs.example/geoserver/wms");

    @Test
    void offByDefault() throws Exception {
        MimeTypeChecker checker = checker("");
        assertDoesNotThrow(() -> checker.onRemoteResponse(REQUEST, response("application/x-msdownload")));
    }

    @Test
    void whenEnabledATypeOutsideTheListIsRefused() throws Exception {
        MimeTypeChecker checker = checker("checkResponseContentType = true\n");
        HttpErrorException refused = assertThrows(HttpErrorException.class,
                () -> checker.onRemoteResponse(REQUEST, response("application/x-msdownload")));
        assertEquals(403, refused.getCode());
    }

    @Test
    void whenEnabledTypesAreComparedWithoutCaseParametersOrSpaces() throws Exception {
        MimeTypeChecker checker = checker("checkResponseContentType = true\n");
        assertDoesNotThrow(() -> checker.onRemoteResponse(REQUEST, response("Image/PNG")));
        assertDoesNotThrow(() -> checker.onRemoteResponse(REQUEST, response(" text/xml ; subtype=gml/3.1.1")));
        assertDoesNotThrow(() -> checker.onRemoteResponse(REQUEST, response("text/csv")));
    }

    @Test
    void whenEnabledAResponseWithoutAContentTypeIsNotRefused() throws Exception {
        MimeTypeChecker checker = checker("checkResponseContentType = true\n");
        assertDoesNotThrow(() -> checker.onRemoteResponse(REQUEST, response(null)));
    }
}
