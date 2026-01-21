package it.geosolutions.mapstore.filters;
import org.junit.Before;
import org.junit.Test;

import java.io.IOException;
import jakarta.servlet.ServletException;
import jakarta.servlet.ServletRequest;
import jakarta.servlet.ServletResponse;
import jakarta.servlet.FilterChain;
import jakarta.servlet.http.HttpServletResponse;

import static org.mockito.Mockito.*;

import static org.junit.Assert.fail;

public class NoCacheFilterTest {

    private NoCacheFilter filter;

    @Before
    public void setUp() {
        filter = new NoCacheFilter();
    }

    @Test
    public void testDoFilterSetsNoCacheHeaders() throws IOException, ServletException {
        ServletRequest request = mock(ServletRequest.class);
        HttpServletResponse response = mock(HttpServletResponse.class);
        FilterChain chain = mock(FilterChain.class);

        filter.doFilter(request, response, chain);

        verify(response).setHeader("Cache-Control", "no-cache, no-store, must-revalidate");
        verify(response).setHeader("Pragma", "no-cache");
        verify(response).setDateHeader("Expires", 0L);

        verify(chain).doFilter(request, response);
    }

    @Test
    public void testDoFilterSetsHeadersWhenChainThrowsException() throws IOException {
        ServletRequest request = mock(ServletRequest.class);
        HttpServletResponse response = mock(HttpServletResponse.class);
        FilterChain chain = mock(FilterChain.class);

        try {
            doThrow(new ServletException("chain failure")).when(chain).doFilter(any(ServletRequest.class), any(ServletResponse.class));
            filter.doFilter(request, response, chain);
            fail("Expected ServletException to be thrown");
        } catch (ServletException e) {
            // verify headers were set before the exception from the chain
            verify(response).setHeader("Cache-Control", "no-cache, no-store, must-revalidate");
            verify(response).setHeader("Pragma", "no-cache");
            verify(response).setDateHeader("Expires", 0L);

            try {
                verify(chain).doFilter(request, response);
            } catch (ServletException ignored) {
                // verification may declare ServletException; ignore since we're already handling it
            }
        }
    }
}
