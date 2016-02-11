package it.geosolutions.servicebox.mocks;

import java.io.ByteArrayOutputStream;
import java.io.IOException;

import javax.servlet.ServletOutputStream;
/**
 * Mock class for <ServletOutputStream>
 * @author Lorenzo Natali, GeoSolutions
 *
 */
public class StubServletOutputStream extends ServletOutputStream {
 public ByteArrayOutputStream baos = new ByteArrayOutputStream();
   public void write(int i) throws IOException {
	   baos.write(i);
   }
}