package com.solveria.market.domain.valueobject;

public record Location(
        String address,
        String city,
        double latitude,
        double longitude) {

    public Location {
        if (address == null || address.isBlank()) {
            throw new IllegalArgumentException("address must not be blank");
        }
        if (city == null || city.isBlank()) {
            throw new IllegalArgumentException("city must not be blank");
        }
        if (latitude < -90 || latitude > 90) {
            throw new IllegalArgumentException("latitude out of range");
        }
        if (longitude < -180 || longitude > 180) {
            throw new IllegalArgumentException("longitude out of range");
        }
    }
}
