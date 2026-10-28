package it.geosolutions.geostore.core.ldap;

import java.util.Iterator;

import javax.naming.NamingEnumeration;
import javax.naming.NamingException;

public class IterableNamingEnumeration<T> implements NamingEnumeration<T> {
    private final Iterator<T> iterator;

    public IterableNamingEnumeration(Iterable<T> iterable) {
        this.iterator = iterable.iterator();
    }

    @Override
    public T next() {
        return iterator.next();
    }

    @Override
    public boolean hasMore() {
        return iterator.hasNext();
    }

    @Override
    public void close() throws NamingException {}

    @Override
    public boolean hasMoreElements() {
        return hasMore();
    }

    @Override
    public T nextElement() {
        return next();
    }
}
