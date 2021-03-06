package com.benchmark.mongoDb.domain;

import org.bson.codecs.pojo.annotations.BsonId;
import org.bson.types.ObjectId;
import org.springframework.data.mongodb.core.geo.GeoJsonMultiPoint;
import org.springframework.data.mongodb.core.mapping.Document;

@Document(collection = "spatial_shape")
public class MongoSpatialShape {
    @BsonId
    private ObjectId id;

    private String name;

    private GeoJsonMultiPoint multiPoint;

    public MongoSpatialShape(String name, GeoJsonMultiPoint multiPoint) {
        this.name = name;
        this.multiPoint = multiPoint;
    }

    public MongoSpatialShape() {
    }

    public ObjectId getId() {
        return id;
    }

    public void setId(ObjectId id) {
        this.id = id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public GeoJsonMultiPoint getMultiPoint() {
        return multiPoint;
    }

    public void setMultiPoint(GeoJsonMultiPoint multiPoint) {
        this.multiPoint = multiPoint;
    }
}
