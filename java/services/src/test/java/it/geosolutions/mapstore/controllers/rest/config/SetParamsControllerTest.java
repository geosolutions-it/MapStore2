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
        assertTrue(resp.contains("location.href=\"..\\/..\\/..?queryParamsID="+uuid+"\";"));
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
        assertTrue(result.contains("location.href=\"#\\/viewer\\/openlayers\\/config?queryParamsID="+uuid+"\";"));
        // extract the JSON
        String json=result.substring(result.indexOf("'")+1,result.lastIndexOf("}")+1);;
        //check it is valid
        ObjectMapper mapper=new ObjectMapper();
        assertTrue(mapper.readTree(StringEscapeUtils.unescapeEcmaScript(json)).isObject());
    }

    @Test
    public void setParamsEndpointTestJavascriptSchemeRejected() throws IOException {
        String payload="{\"page\":\"javascript:alert(1)//\"}";
        MockHttpServletRequest request=new MockHttpServletRequest();
        request.setContent(payload.getBytes());
        MockHttpServletResponse response=new MockHttpServletResponse();
        SetParamsController paramsController=new SetParamsController();
        String uuid= UUID.randomUUID().toString();
        FixedUUIGenerationStrategy strategy= new FixedUUIGenerationStrategy(uuid);
        paramsController.setUuidStrategy(strategy);

        paramsController.setParams(request,response,"application/json");

        String resp=response.getContentAsString();
        String locationStatement=resp.substring(resp.indexOf("location.href="));
        assertTrue(!locationStatement.contains("javascript:"));
        assertTrue(resp.contains("location.href=\"..\\/..\\/#viewer\\/openlayers\\/config?queryParamsID="+uuid+"\";"));
    }

    @Test
    public void setParamsEndpointTestHttpsSchemeAllowed() throws IOException {
        String payload="{\"page\":\"https://example.com/viewer\"}";
        MockHttpServletRequest request=new MockHttpServletRequest();
        request.setContent(payload.getBytes());
        MockHttpServletResponse response=new MockHttpServletResponse();
        SetParamsController paramsController=new SetParamsController();
        String uuid= UUID.randomUUID().toString();
        FixedUUIGenerationStrategy strategy= new FixedUUIGenerationStrategy(uuid);
        paramsController.setUuidStrategy(strategy);

        paramsController.setParams(request,response,"application/json");

        String resp=response.getContentAsString();
        assertTrue(resp.contains("location.href=\"https:\\/\\/example.com\\/viewer?queryParamsID="+uuid+"\";"));
    }

    @Test
    public void setParamsEndpointTestJavascriptSchemeWithWhitespaceRejected() throws IOException {
        String payload="{\"page\":\"java\\tscript:alert(1)//\"}";
        MockHttpServletRequest request=new MockHttpServletRequest();
        request.setContent(payload.getBytes());
        MockHttpServletResponse response=new MockHttpServletResponse();
        SetParamsController paramsController=new SetParamsController();
        String uuid= UUID.randomUUID().toString();
        FixedUUIGenerationStrategy strategy= new FixedUUIGenerationStrategy(uuid);
        paramsController.setUuidStrategy(strategy);

        paramsController.setParams(request,response,"application/json");

        String resp=response.getContentAsString();
        String locationStatement=resp.substring(resp.indexOf("location.href="));
        assertTrue(!locationStatement.contains("script:"));
        assertTrue(resp.contains("location.href=\"..\\/..\\/#viewer\\/openlayers\\/config?queryParamsID="+uuid+"\";"));
    }

    @Test
    public void setParamsEndpointTestQuoteBreakoutEscaped() throws IOException {
        String payload="{\"page\":\"\\\";alert(document.domain);//\"}";
        MockHttpServletRequest request=new MockHttpServletRequest();
        request.setContent(payload.getBytes());
        MockHttpServletResponse response=new MockHttpServletResponse();
        SetParamsController paramsController=new SetParamsController();
        String uuid= UUID.randomUUID().toString();
        FixedUUIGenerationStrategy strategy= new FixedUUIGenerationStrategy(uuid);
        paramsController.setUuidStrategy(strategy);

        paramsController.setParams(request,response,"application/json");

        String resp=response.getContentAsString();
        assertTrue(!resp.contains("href=\"\";alert(document.domain)"));
        assertTrue(resp.contains("location.href=\"\\\";alert(document.domain);\\/\\/?queryParamsID="+uuid+"\";"));
    }

    @Test
    public void setParamsEndpointTestControlCharObfuscatedSchemeRejected() throws IOException {
        String[] prefixes={"\\u0000","\\u0001","\\u000E","\\u001F","\\u007F"};
        for (String prefix : prefixes) {
            String uuid=UUID.randomUUID().toString();
            String resp=redirectResponseFor("{\"page\":\""+prefix+"javascript:alert(1)//\"}",uuid);
            String locationStatement=resp.substring(resp.indexOf("location.href="));
            assertTrue("scheme not filtered for prefix "+prefix,!locationStatement.contains("javascript:"));
            assertTrue(resp.contains("location.href=\"..\\/..\\/#viewer\\/openlayers\\/config?queryParamsID="+uuid+"\";"));
        }
    }

    @Test
    public void setParamsEndpointTestProtocolRelativePageRejected() throws IOException {
        String[] pages={"//external.example.com/x","\\\\\\\\external.example.com/x","/\\\\external.example.com/x"};
        for (String page : pages) {
            String uuid=UUID.randomUUID().toString();
            String resp=redirectResponseFor("{\"page\":\""+page+"\"}",uuid);
            assertTrue("protocol relative page not filtered: "+page,
                    resp.contains("location.href=\"..\\/..\\/#viewer\\/openlayers\\/config?queryParamsID="+uuid+"\";"));
        }
    }

    @Test
    public void setParamsEndpointTestRelativePageAllowed() throws IOException {
        String uuid=UUID.randomUUID().toString();
        String resp=redirectResponseFor("{\"page\":\"#viewer/openlayers/config\"}",uuid);
        assertTrue(resp.contains("location.href=\"#viewer\\/openlayers\\/config?queryParamsID="+uuid+"\";"));
    }

    @Test
    public void setParamsEndpointTestUppercaseSchemeAllowed() throws IOException {
        String uuid=UUID.randomUUID().toString();
        String resp=redirectResponseFor("{\"page\":\"HTTPS://example.com/viewer\"}",uuid);
        assertTrue(resp.contains("location.href=\"HTTPS:\\/\\/example.com\\/viewer?queryParamsID="+uuid+"\";"));
    }

    private String redirectResponseFor(String payload, String uuid) throws IOException {
        MockHttpServletRequest request=new MockHttpServletRequest();
        request.setContent(payload.getBytes());
        MockHttpServletResponse response=new MockHttpServletResponse();
        SetParamsController paramsController=new SetParamsController();
        paramsController.setUuidStrategy(new FixedUUIGenerationStrategy(uuid));

        paramsController.setParams(request,response,"application/json");

        return response.getContentAsString();
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
