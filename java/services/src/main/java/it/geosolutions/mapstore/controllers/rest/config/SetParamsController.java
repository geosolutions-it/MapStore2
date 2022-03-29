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
import com.fasterxml.jackson.databind.node.ObjectNode;
import com.fasterxml.jackson.databind.node.ValueNode;
import com.google.common.base.Charsets;
import it.geosolutions.mapstore.controllers.BaseConfigController;
import org.apache.commons.io.IOUtils;
import org.apache.commons.lang.StringEscapeUtils;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;


import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.io.IOException;

/**
 * This controller exposes a service to read a JSON body holding parameters and a redirect page,
 * making it available in an HTML page for javascript manipulation.
 */
@Controller
public class SetParamsController extends BaseConfigController {


    private static final String PAGE_PARAM="page";
    private static final String QUERY_PARAMS="queryParams";



    /**
     * Write an HTML output with a script to redirect to the page url
     * and set the JSON request payload in the sessionStorage.
     * @param request the HttpServletRequest.
     * @param response the HttpServletResponse.
     * @throws IOException
     */
    @RequestMapping(value="/setParams", method = RequestMethod.POST, consumes = {MediaType.APPLICATION_JSON_VALUE})
    public void setParams(HttpServletRequest request, HttpServletResponse response) throws IOException {
        String strJSON=IOUtils.toString(request.getInputStream(), Charsets.UTF_8.name());
        ObjectMapper mapper=new ObjectMapper();
        JsonNode node;
        try {
            node = mapper.readTree(strJSON);
        } catch (JsonProcessingException e){
            String message="Error while parsing the JSON request payload.";
            response.sendError(HttpServletResponse.SC_BAD_REQUEST,message);
            throw new IOException(message,e);
        }
        if (!(node instanceof ObjectNode)){
            throw new UnsupportedOperationException("The request payload is not a JSON Object.");
        }
        if (!node.has(PAGE_PARAM)){
            String message="No attribute "+PAGE_PARAM+" holding the redirect value was found";
            response.sendError(HttpServletResponse.SC_BAD_REQUEST,message);
        }
        JsonNode pageNode=node.get(PAGE_PARAM);
        if (!(pageNode instanceof ValueNode)){
            String message="The page JSON attribute should be a string value.";
            response.sendError(HttpServletResponse.SC_BAD_REQUEST,message);
        }
        String jsString= StringEscapeUtils.escapeJavaScript(node.toString());
        response.setContentType("text/html");
        java.io.PrintWriter out = response.getWriter();
        out.write("<html><head><script>");
        out.write("let params=".concat("'").concat(jsString).concat("'; "));
        out.write("sessionStorage.setItem(\"".concat(QUERY_PARAMS).concat("\",params); "));
        out.write("location.href=\"".concat(pageNode.asText()).concat("\"; "));
        out.write("</script></head><body></body></html>");
    }



}
