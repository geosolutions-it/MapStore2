package it.geosolutions.httpproxy;

import java.io.ByteArrayOutputStream;
import java.io.IOException;

import jakarta.servlet.ServletOutputStream;
import jakarta.servlet.WriteListener;

public class StubServletOutputStream extends ServletOutputStream {
 public ByteArrayOutputStream baos = new ByteArrayOutputStream();
   public void write(int i) throws IOException {
    baos.write(i);
 }
   public boolean isReady() {
    return true;
 }
   public void setWriteListener(WriteListener writeListener) {
 }
}