package it.geosolutions.servicebox.mocks;

import java.io.IOException;
import java.io.InputStream;

import javax.servlet.ServletInputStream;

import org.junit.Assert;

/**
 * Mock for the servlet input String
 * @author Lorenzo Natali, GeoSolutions
 *
 */
public class DelegatingServletInputStream extends ServletInputStream {

    private final InputStream sourceStream;


    /**
     * Create a DelegatingServletInputStream for the given source stream.
     * @param sourceStream the source stream (never <code>null</code>)
     */
    public DelegatingServletInputStream(InputStream sourceStream) {
    	Assert.assertNotNull( "Source InputStream must not be null", sourceStream);
        this.sourceStream = sourceStream;
    }
	/**
     * Return the underlying source stream (never <code>null</code>).
     */
    public final InputStream getSourceStream() {
        return this.sourceStream;
    }


    public int read() throws IOException {
        return this.sourceStream.read();
    }

    public void close() throws IOException {
        super.close();
        this.sourceStream.close();
    }

}