package it.geosolutions.servicebox;

import static org.junit.Assert.assertEquals;
import static org.junit.Assert.assertTrue;
import it.geosolutions.servicebox.mocks.DelegatingServletInputStream;
import it.geosolutions.servicebox.mocks.StubServletOutputStream;

import java.io.ByteArrayInputStream;
import java.io.PrintWriter;
import java.io.StringWriter;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.junit.Test;
import org.mockito.Mockito;

public class TestUploadCanvas extends Mockito {
	/**
	 * Sample base64 encoded image
	 */
	private static final String TEST_STRING = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAABmJLR0QA/wD/AP+gvaeTAAAACXBIWXMAAAsTAAALEwEAmpwYAAAAB3RJTUUH3woCDCsUqrUEAAAAAQxJREFUOMvN0iFLw1EUBfCf02Q0LGhQQVZekiU/gTAYImpasMi6VVBhwSCsi0kQbIJFsBoMBjHdpKDJMjBaxM3yhCn7z4HF29695xzuue/wxxofNkwp1crl8kKn03kswowVEEvYx25utdCKiO6vAimlKZxh+cfoCo2IeC0USClVcY7Zgo2fsR4Rd1+NUh95CzdDyDCHm4z9LoAueiMcvpexAy0sZgvzBeQnrEXE/SALM3hHFZcDyJd59pFSmh5koY1b1FDHXl61m7+zjpWMaX+RJvoEGjjAKZawncFwjSM0cYidYTlYxQkCGzmt56hgMyIuRkliJZPKWeAlH+9hpChnkUkc52czIt78y/oEtThIARE8NNwAAAAASUVORK5CYII=";
	/**
	 * tests the post of the image
	 * @throws Exception
	 */
    @Test
    public void testImage() throws Exception {
    	      
        
        // mock the request body
    	HttpServletRequest postRequest = mock(HttpServletRequest.class); 
        when(postRequest.getInputStream()).thenReturn(new DelegatingServletInputStream(new ByteArrayInputStream(TEST_STRING.getBytes())));
        
        // mock response 
        HttpServletResponse postResponse = mock(HttpServletResponse.class);
        StringWriter writer = new StringWriter();
        when(postResponse.getWriter()).thenReturn(new PrintWriter(writer));
        
        // do Post
        UploadCanvas servlet = new UploadCanvas();
        servlet.doPost(postRequest, postResponse);
        
        // check a valid response
        String imageId = writer.toString();
        assertTrue(imageId.length() > 1);
        
        // create the request to get the image back
        HttpServletRequest getRequest = mock(HttpServletRequest.class); 
        when(getRequest.getParameter("ID")).thenReturn(imageId);
        
        // create the get response  
        HttpServletResponse getResponse = mock(HttpServletResponse.class);
        StringWriter getWriter = new StringWriter();
        when(getResponse.getWriter()).thenReturn(new PrintWriter(writer));
        StubServletOutputStream getOut = new StubServletOutputStream();
        when(getResponse.getOutputStream()).thenReturn( getOut );
        
        // do Get
        servlet.doGet(getRequest, getResponse);
        
        // test response 
        assertEquals(getOut.baos.toByteArray().length, 383); // locally it is converted to 383
        
        
        
        
    }
}
