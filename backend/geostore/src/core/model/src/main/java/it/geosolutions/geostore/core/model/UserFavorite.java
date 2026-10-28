package it.geosolutions.geostore.core.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;

import org.hibernate.annotations.Check;

import java.io.Serializable;

@Entity(name = "Favorite")
@Table(
        name = "gs_user_favorites",
        uniqueConstraints = {
            @UniqueConstraint(columnNames = {"user_id", "resource_id"}),
            @UniqueConstraint(columnNames = {"username", "resource_id"})
        })
@Check(
        constraints =
                "((((user_id IS NOT NULL) AND (username IS NULL)) OR ((user_id IS NULL) AND (username IS NOT NULL))))")
public class UserFavorite implements Serializable {

    @Id @GeneratedValue private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = true)
    private User user;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "resource_id", nullable = false)
    private Resource resource;

    @Column(name = "username", nullable = true)
    private String username;

    public UserFavorite() {}

    private UserFavorite(User user, Resource resource, String username) {
        this.user = user;
        this.resource = resource;
        this.username = username;
    }

    public Long getId() {
        return id;
    }

    public User getUser() {
        return user;
    }

    public void setUser(User user) {
        this.user = user;
    }

    public Resource getResource() {
        return resource;
    }

    public void setResource(Resource resource) {
        this.resource = resource;
    }

    public String getUsername() {
        return username;
    }

    public void setUsername(String username) {
        this.username = username;
    }

    public static UserFavorite withUser(User user, Resource resource) {
        return new UserFavorite(user, resource, null);
    }

    public static UserFavorite withUsername(String username, Resource resource) {
        return new UserFavorite(null, resource, username);
    }
}
