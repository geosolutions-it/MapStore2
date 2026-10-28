package it.geosolutions.geostore.services.rest.model;

import it.geosolutions.geostore.services.dto.ShortAttribute;

import jakarta.xml.bind.annotation.XmlAccessType;
import jakarta.xml.bind.annotation.XmlAccessorType;
import jakarta.xml.bind.annotation.XmlRootElement;

/**
 * DTO for attribute object
 *
 * @author Lorenzo Natali, GeoSolutions s.a.s.
 */
@XmlRootElement
@XmlAccessorType(XmlAccessType.FIELD)
public class RESTAttribute extends ShortAttribute {

    private static final long serialVersionUID = 1L;
}
