package it.geosolutions.geostore.services.rest.security;

import org.springframework.ldap.core.DirContextOperations;

import java.util.Hashtable;
import java.util.SortedSet;

import javax.naming.*;
import javax.naming.directory.*;

public class MockDirContextOperations implements DirContextOperations {

    @Override
    public void bind(Name name, Object obj, Attributes attrs) throws NamingException {
        // TODO Auto-generated method stub

    }

    @Override
    public void bind(String name, Object obj, Attributes attrs) throws NamingException {
        // TODO Auto-generated method stub

    }

    @Override
    public DirContext createSubcontext(Name name, Attributes attrs) throws NamingException {
        // TODO Auto-generated method stub
        return null;
    }

    @Override
    public DirContext createSubcontext(String name, Attributes attrs) throws NamingException {
        // TODO Auto-generated method stub
        return null;
    }

    @Override
    public Attributes getAttributes(Name name) throws NamingException {
        // TODO Auto-generated method stub
        return null;
    }

    @Override
    public Attributes getAttributes(String name) throws NamingException {
        // TODO Auto-generated method stub
        return null;
    }

    @Override
    public Attributes getAttributes(Name name, String[] attrIds) throws NamingException {
        // TODO Auto-generated method stub
        return null;
    }

    @Override
    public Attributes getAttributes(String name, String[] attrIds) throws NamingException {
        // TODO Auto-generated method stub
        return null;
    }

    @Override
    public DirContext getSchema(Name name) throws NamingException {
        // TODO Auto-generated method stub
        return null;
    }

    @Override
    public DirContext getSchema(String name) throws NamingException {
        // TODO Auto-generated method stub
        return null;
    }

    @Override
    public DirContext getSchemaClassDefinition(Name name) throws NamingException {
        // TODO Auto-generated method stub
        return null;
    }

    @Override
    public DirContext getSchemaClassDefinition(String name) throws NamingException {
        // TODO Auto-generated method stub
        return null;
    }

    @Override
    public void modifyAttributes(Name name, ModificationItem[] mods) throws NamingException {
        // TODO Auto-generated method stub

    }

    @Override
    public void modifyAttributes(String name, ModificationItem[] mods) throws NamingException {
        // TODO Auto-generated method stub

    }

    @Override
    public void modifyAttributes(Name name, int mod_op, Attributes attrs) throws NamingException {
        // TODO Auto-generated method stub

    }

    @Override
    public void modifyAttributes(String name, int mod_op, Attributes attrs) throws NamingException {
        // TODO Auto-generated method stub

    }

    @Override
    public void rebind(Name name, Object obj, Attributes attrs) throws NamingException {
        // TODO Auto-generated method stub

    }

    @Override
    public void rebind(String name, Object obj, Attributes attrs) throws NamingException {
        // TODO Auto-generated method stub

    }

    @Override
    public NamingEnumeration<SearchResult> search(Name name, Attributes matchingAttributes)
            throws NamingException {
        // TODO Auto-generated method stub
        return null;
    }

    @Override
    public NamingEnumeration<SearchResult> search(String name, Attributes matchingAttributes)
            throws NamingException {
        // TODO Auto-generated method stub
        return null;
    }

    @Override
    public NamingEnumeration<SearchResult> search(
            Name name, Attributes matchingAttributes, String[] attributesToReturn)
            throws NamingException {
        // TODO Auto-generated method stub
        return null;
    }

    @Override
    public NamingEnumeration<SearchResult> search(
            String name, Attributes matchingAttributes, String[] attributesToReturn)
            throws NamingException {
        // TODO Auto-generated method stub
        return null;
    }

    @Override
    public NamingEnumeration<SearchResult> search(Name name, String filter, SearchControls cons)
            throws NamingException {
        // TODO Auto-generated method stub
        return null;
    }

    @Override
    public NamingEnumeration<SearchResult> search(String name, String filter, SearchControls cons)
            throws NamingException {
        // TODO Auto-generated method stub
        return null;
    }

    @Override
    public NamingEnumeration<SearchResult> search(
            Name name, String filterExpr, Object[] filterArgs, SearchControls cons)
            throws NamingException {
        // TODO Auto-generated method stub
        return null;
    }

    @Override
    public NamingEnumeration<SearchResult> search(
            String name, String filterExpr, Object[] filterArgs, SearchControls cons)
            throws NamingException {
        // TODO Auto-generated method stub
        return null;
    }

    @Override
    public Object addToEnvironment(String propName, Object propVal) throws NamingException {
        // TODO Auto-generated method stub
        return null;
    }

    @Override
    public void bind(Name name, Object obj) throws NamingException {
        // TODO Auto-generated method stub

    }

    @Override
    public void bind(String name, Object obj) throws NamingException {
        // TODO Auto-generated method stub

    }

    @Override
    public void close() throws NamingException {
        // TODO Auto-generated method stub

    }

    @Override
    public Name composeName(Name name, Name prefix) throws NamingException {
        // TODO Auto-generated method stub
        return null;
    }

    @Override
    public String composeName(String name, String prefix) throws NamingException {
        // TODO Auto-generated method stub
        return null;
    }

    @Override
    public Context createSubcontext(Name name) throws NamingException {
        // TODO Auto-generated method stub
        return null;
    }

    @Override
    public Context createSubcontext(String name) throws NamingException {
        // TODO Auto-generated method stub
        return null;
    }

    @Override
    public void destroySubcontext(Name name) throws NamingException {
        // TODO Auto-generated method stub

    }

    @Override
    public void destroySubcontext(String name) throws NamingException {
        // TODO Auto-generated method stub

    }

    @Override
    public Hashtable<?, ?> getEnvironment() throws NamingException {
        // TODO Auto-generated method stub
        return null;
    }

    @Override
    public NameParser getNameParser(Name name) throws NamingException {
        // TODO Auto-generated method stub
        return null;
    }

    @Override
    public NameParser getNameParser(String name) throws NamingException {
        // TODO Auto-generated method stub
        return null;
    }

    @Override
    public NamingEnumeration<NameClassPair> list(Name name) throws NamingException {
        // TODO Auto-generated method stub
        return null;
    }

    @Override
    public NamingEnumeration<NameClassPair> list(String name) throws NamingException {
        // TODO Auto-generated method stub
        return null;
    }

    @Override
    public NamingEnumeration<Binding> listBindings(Name name) throws NamingException {
        // TODO Auto-generated method stub
        return null;
    }

    @Override
    public NamingEnumeration<Binding> listBindings(String name) throws NamingException {
        // TODO Auto-generated method stub
        return null;
    }

    @Override
    public Object lookup(Name name) throws NamingException {
        // TODO Auto-generated method stub
        return null;
    }

    @Override
    public Object lookup(String name) throws NamingException {
        // TODO Auto-generated method stub
        return null;
    }

    @Override
    public Object lookupLink(Name name) throws NamingException {
        // TODO Auto-generated method stub
        return null;
    }

    @Override
    public Object lookupLink(String name) throws NamingException {
        // TODO Auto-generated method stub
        return null;
    }

    @Override
    public void rebind(Name name, Object obj) throws NamingException {
        // TODO Auto-generated method stub

    }

    @Override
    public void rebind(String name, Object obj) throws NamingException {
        // TODO Auto-generated method stub

    }

    @Override
    public Object removeFromEnvironment(String propName) throws NamingException {
        // TODO Auto-generated method stub
        return null;
    }

    @Override
    public void rename(Name oldName, Name newName) throws NamingException {
        // TODO Auto-generated method stub

    }

    @Override
    public void rename(String oldName, String newName) throws NamingException {
        // TODO Auto-generated method stub

    }

    @Override
    public void unbind(Name name) throws NamingException {
        // TODO Auto-generated method stub

    }

    @Override
    public void unbind(String name) throws NamingException {
        // TODO Auto-generated method stub

    }

    @Override
    public ModificationItem[] getModificationItems() {
        // TODO Auto-generated method stub
        return null;
    }

    @Override
    public void addAttributeValue(String arg0, Object arg1) {
        // TODO Auto-generated method stub

    }

    @Override
    public void addAttributeValue(String arg0, Object arg1, boolean arg2) {
        // TODO Auto-generated method stub

    }

    @Override
    public SortedSet getAttributeSortedStringSet(String arg0) {
        // TODO Auto-generated method stub
        return null;
    }

    @Override
    public Attributes getAttributes() {
        // TODO Auto-generated method stub
        return null;
    }

    @Override
    public Name getDn() {
        // TODO Auto-generated method stub
        return null;
    }

    @Override
    public void setDn(Name arg0) {
        // TODO Auto-generated method stub

    }

    @Override
    public String getNameInNamespace() {
        // TODO Auto-generated method stub
        return null;
    }

    @Override
    public String[] getNamesOfModifiedAttributes() {
        // TODO Auto-generated method stub
        return null;
    }

    @Override
    public Object getObjectAttribute(String arg0) {
        // TODO Auto-generated method stub
        return null;
    }

    @Override
    public Object[] getObjectAttributes(String arg0) {
        // TODO Auto-generated method stub
        return null;
    }

    @Override
    public String getReferralUrl() {
        // TODO Auto-generated method stub
        return null;
    }

    @Override
    public String getStringAttribute(String arg0) {
        // TODO Auto-generated method stub
        return null;
    }

    @Override
    public String[] getStringAttributes(String arg0) {
        // TODO Auto-generated method stub
        return null;
    }

    @Override
    public boolean isReferral() {
        // TODO Auto-generated method stub
        return false;
    }

    @Override
    public boolean isUpdateMode() {
        // TODO Auto-generated method stub
        return false;
    }

    @Override
    public void removeAttributeValue(String arg0, Object arg1) {
        // TODO Auto-generated method stub

    }

    @Override
    public void setAttributeValue(String arg0, Object arg1) {
        // TODO Auto-generated method stub

    }

    @Override
    public void setAttributeValues(String arg0, Object[] arg1) {
        // TODO Auto-generated method stub

    }

    @Override
    public void setAttributeValues(String arg0, Object[] arg1, boolean arg2) {
        // TODO Auto-generated method stub

    }

    @Override
    public void update() {
        // TODO Auto-generated method stub

    }

    @Override
    public boolean attributeExists(String arg0) {
        // TODO Auto-generated method stub
        return false;
    }
}
