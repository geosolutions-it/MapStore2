/*
 * Copyright 2022, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
package it.geosolutions.mapstore.controllers.rest.config;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.JsonNodeFactory;
import com.fasterxml.jackson.databind.node.NullNode;
import com.fasterxml.jackson.databind.node.ObjectNode;
import com.fasterxml.jackson.databind.node.TextNode;
import com.fasterxml.jackson.databind.node.ValueNode;
import it.geosolutions.mapstore.controllers.BaseConfigController;
import org.apache.commons.io.IOUtils;
import org.apache.commons.lang3.StringUtils;
import org.apache.commons.text.StringEscapeUtils;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpInputMessage;
import org.springframework.http.MediaType;
import org.springframework.http.converter.FormHttpMessageConverter;
import org.springframework.stereotype.Controller;
import org.springframework.util.MultiValueMap;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;


import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.io.InputStream;
import java.net.URI;
import java.net.URISyntaxException;
import java.util.Collections;
import java.util.Enumeration;
import java.util.Map;
import java.util.UUID;

/**
 * This controller exposes a service to read a JSON body holding parameters and a redirect page,
 * making it available in an HTML page for javascript manipulation.
 */
@Controller
public class SetParamsController extends BaseConfigController {


    private static final String PAGE_PARAM="page";
    private static final String QUERY_PARAMS="queryParams";
    private static final String DEF_PAGE="../../#viewer/openlayers/config";

    private SetParamsUUIDStrategy uuidStrategy;

    public SetParamsController() {
        this.uuidStrategy=new DefUUIDGenerationStrategy();
    }

    /**
     * Write an HTML output with a script to redirect to the page url
     * and set request payload in the sessionStorage as a JSON.
     * @param request the HttpServletRequest.
     * @param response the HttpServletResponse.
     * @throws IOException
     */
    @RequestMapping(value="/setParams", method = RequestMethod.POST, consumes = {MediaType.APPLICATION_JSON_VALUE,MediaType.APPLICATION_FORM_URLENCODED_VALUE})
    public void setParams(HttpServletRequest request, HttpServletResponse response, @RequestHeader("Content-Type") String contentType) throws IOException {
        JsonNode node;
        if (contentType.equals(MediaType.APPLICATION_FORM_URLENCODED_VALUE))
            node=formEncodedToJSON(new HttpServletRequestInput(request));
        else node=toJSON(request);
        String jsString= StringEscapeUtils.escapeEcmaScript(node.toString());
        response.setContentType("text/html");
        String uuid= getUUID();
        String itemName=QUERY_PARAMS.concat("-").concat(uuid);
        java.io.PrintWriter out = response.getWriter();
        out.write("<html><head>");
        out.write("<meta charset=\"UTF-8\">");
        out.write("<script>");
        out.write("let params=".concat("'").concat(jsString).concat("'; "));
        out.write("sessionStorage.setItem(\"".concat(itemName).concat("\",params); "));
        String location=buildRedirectUrl(node, uuid);
        out.write("location.href=\"".concat(location).concat("\"; "));
        out.write("</script></head><body></body></html>");
    }


    private String buildRedirectUrl(JsonNode node, String uuid){
        String page=getPage(node);
        StringBuilder location=new StringBuilder(page);
        if (!containsQueryString(page))
            location.append("?");
        else
            location.append("&");
        location.append("queryParamsID=").append(uuid);
        return location.toString();
    }

    private boolean containsQueryString(String page){
        try {
            URI url = new URI(page);
            String queryString = url.getQuery();
            if (StringUtils.isBlank(queryString))
                return false;
            else return true;
        } catch (URISyntaxException e){
            // we try to be lenient and simply log the exception returning false.
            return false;
        }
    }

    private String getPage(JsonNode node){
        String pageStr=null;
        if (node.has(PAGE_PARAM)){
            JsonNode pageNode=node.get(PAGE_PARAM);
            if (pageNode!=null && !(pageNode instanceof NullNode) && !(pageNode instanceof ValueNode)){
                String error="The page JSON attribute should be a string value.";
                throw new UnsupportedOperationException(error);
            }

            if (pageNode instanceof TextNode){
                pageStr=pageNode.asText();
            }
        }
        if (pageStr==null) pageStr=DEF_PAGE;
        return pageStr;
    }

    private JsonNode formEncodedToJSON(HttpInputMessage message) throws IOException {
        FormHttpMessageConverter converter=new FormHttpMessageConverter();
        MultiValueMap<String,String> result=converter.read(null,message);
        Map<String,String> map=result.toSingleValueMap();
        return mapToJSONObject(map);
    }

    private ObjectNode mapToJSONObject(Map<String,String> map){
        ObjectMapper mapper=new ObjectMapper();
        JsonNodeFactory factory=new JsonNodeFactory(false);
        ObjectNode resultJSON=factory.objectNode();
        for (String k:map.keySet()){
            if (k.equals(PAGE_PARAM)) {
                resultJSON.set(k, factory.textNode(map.get(k)));
            } else {
                String val=map.get(k);
                try {
                    JsonNode node=mapper.readTree(val);
                    resultJSON.set(k,node);
                }catch (JsonProcessingException e){
                    resultJSON.set(k,factory.textNode(val));
                }
            }
        }
        return resultJSON;
    }

    private JsonNode toJSON(HttpServletRequest request) throws IOException {
       String jsonStr=IOUtils.toString(request.getInputStream(),"UTF-8");
        ObjectMapper mapper=new ObjectMapper();
        return mapper.readTree(jsonStr);
    }

    // a simple HttpInputMessage wrapping an HttpServletRequest
    private class HttpServletRequestInput implements HttpInputMessage{

        private HttpServletRequest request;

        HttpServletRequestInput(HttpServletRequest request){
            this.request=request;
        }

        @Override
        public InputStream getBody() throws IOException {
            return request.getInputStream();
        }

        @Override
        public HttpHeaders getHeaders() {
            HttpHeaders headers=new HttpHeaders();
            Enumeration<String> names= request.getHeaderNames();
            while(names.hasMoreElements()){
                String name=names.nextElement();
                headers.put(name, Collections.list(request.getHeaders(name)));
            }
            return headers;
        }
    }


    private String getUUID(){
        return uuidStrategy.generateUUID();
    }

    // test purpose.
    void setUuidStrategy(SetParamsUUIDStrategy uuidStrategy) {
        this.uuidStrategy = uuidStrategy;
    }

    /**
     * Class for Def UUID generation strategy. Generates a random UUID.
     */
    private class DefUUIDGenerationStrategy implements SetParamsUUIDStrategy{

        @Override
        public String generateUUID() {
            return UUID.randomUUID().toString();
        }
    }



}
