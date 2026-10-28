package it.geosolutions.geostore.core.security;

import static org.junit.Assert.assertEquals;

import org.junit.Before;
import org.junit.Test;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;

import java.util.ArrayList;
import java.util.Collection;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

public class SimpleGrantedAuthoritiesMapperTest {

    SimpleGrantedAuthoritiesMapper mapper;
    private Map<String, String> roleMappings;
    List<GrantedAuthority> authorities;

    @Before
    public void setUp() {
        roleMappings = new HashMap<String, String>();
        mapper = new SimpleGrantedAuthoritiesMapper(roleMappings);
        authorities = new ArrayList<GrantedAuthority>();
    }

    @Test
    public void testMapping() {
        roleMappings.put("A", "B");
        authorities.add(new SimpleGrantedAuthority("A"));
        Collection<? extends GrantedAuthority> mapped = mapper.mapAuthorities(authorities);
        assertEquals(1, mapped.size());
        assertEquals("B", mapped.iterator().next().getAuthority());
    }

    @Test
    public void testDropUnmappedAuthiorities() {
        mapper.setDropUnmapped(true);
        roleMappings.put("A", "B");
        authorities.add(new SimpleGrantedAuthority("A"));
        authorities.add(new SimpleGrantedAuthority("C"));
        Collection<? extends GrantedAuthority> mapped = mapper.mapAuthorities(authorities);
        assertEquals(1, mapped.size());
        assertEquals("B", mapped.iterator().next().getAuthority());
    }
}
