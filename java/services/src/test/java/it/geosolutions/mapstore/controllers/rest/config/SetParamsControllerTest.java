/*
 * Copyright 2022, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
package it.geosolutions.mapstore.controllers.rest.config;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.apache.commons.text.StringEscapeUtils;
import org.junit.Test;
import org.springframework.http.MediaType;
import org.springframework.mock.web.MockHttpServletRequest;
import org.springframework.mock.web.MockHttpServletResponse;

import java.io.IOException;
import java.util.UUID;

import static org.junit.Assert.assertTrue;

public class SetParamsControllerTest {


    @Test
    public void setParamsEndpointTest() throws IOException {
        MockHttpServletResponse response=new MockHttpServletResponse();
        String payload="{\"page\":\"../../..\",\"queryParam\":{\"param1\":\"l'object value1\",\"param2\":\"value\"}}";
        MockHttpServletRequest request=new MockHttpServletRequest();
        request.setContent(payload.getBytes());
        SetParamsController paramsController=new SetParamsController();
        String uuid= UUID.randomUUID().toString();
        FixedUUIGenerationStrategy strategy= new FixedUUIGenerationStrategy(uuid);
        paramsController.setUuidStrategy(strategy);

        paramsController.setParams(request,response,"application/json");

        String resp=response.getContentAsString();
        response.getContentType().equals("text/html");
        assertTrue(resp.contains("sessionStorage.setItem(\"queryParams-"+ uuid+"\",params"));
        assertTrue(resp.contains("l\\\'object"));
        assertTrue(resp.contains("location.href=\"../../..?queryParamsID="+uuid+"\";"));
    }

    @Test
    public void setParamsEndpointTestFormURLEncoded() throws IOException {
        String payload="map={\"name\":\"value\",\"name2\":\"value2\"}&" +
            "bbox=[0,1,2,3]&" +
            "page=#/viewer/openlayers/config";
        MockHttpServletRequest request=new MockHttpServletRequest();
        request.setContent(payload.getBytes());
        MockHttpServletResponse response=new MockHttpServletResponse();
        SetParamsController paramsController=new SetParamsController();

        // set the uuid.
        String uuid= UUID.randomUUID().toString();
        FixedUUIGenerationStrategy strategy= new FixedUUIGenerationStrategy(uuid);
        paramsController.setUuidStrategy(strategy);

        paramsController.setParams(request,response, MediaType.APPLICATION_FORM_URLENCODED_VALUE);
        String result=response.getContentAsString();
        response.getContentType().equals("text/html");
        assertTrue(result.contains("sessionStorage.setItem(\"queryParams-"+ uuid+"\",params"));
        assertTrue(result.contains("location.href=\"#/viewer/openlayers/config?queryParamsID="+uuid+"\";"));
        // extract the JSON
        String json=result.substring(result.indexOf("'")+1,result.lastIndexOf("}")+1);;
        //check it is valid
        ObjectMapper mapper=new ObjectMapper();
        assertTrue(mapper.readTree(StringEscapeUtils.unescapeEcmaScript(json)).isObject());
    }

    /**
     * Returns the uuid passed in constructor. For tests purpose.
     */
    private static class FixedUUIGenerationStrategy implements SetParamsUUIDStrategy{

        private final String fixedUUID;

        private FixedUUIGenerationStrategy(String uuid){
            this.fixedUUID=uuid;
        }
        @Override
        public String generateUUID() {
            return fixedUUID;
        }
    }
}
