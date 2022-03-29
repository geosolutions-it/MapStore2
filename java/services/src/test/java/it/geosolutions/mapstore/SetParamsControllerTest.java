/*
 * Copyright 2022, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
package it.geosolutions.mapstore;

import it.geosolutions.mapstore.controllers.rest.config.SetParamsController;
import org.junit.Test;
import org.springframework.mock.web.MockHttpServletRequest;
import org.springframework.mock.web.MockHttpServletResponse;


import java.io.IOException;

import static org.junit.Assert.assertTrue;

public class SetParamsControllerTest {


    @Test
    public void setParamsEndpointTest() throws IOException {
        MockHttpServletRequest request=new MockHttpServletRequest();
        request.setContent("{\"page\":\"../../../\",\"queryParam\":{\"param1\":\"l'object value1\",\"param2\":\"value\"}}".getBytes());
        MockHttpServletResponse response=new MockHttpServletResponse();
        SetParamsController paramsController=new SetParamsController();
        paramsController.setParams(request,response);
        String resp=response.getContentAsString();
        response.getContentType().equals("text/html");
        assertTrue(resp.contains("sessionStorage.setItem(\"queryParams\",params"));
        assertTrue(resp.contains("l\\\'object"));
        assertTrue(resp.contains("location.href=\"../../../\";"));
    }
}
