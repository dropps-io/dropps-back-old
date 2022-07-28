-- PostgreSQL script to create the database

CREATE DATABASE dropps;

USE dropps;

CREATE TABLE users (
  "address" char(42) NOT NULL,
  "selectedProfile" char(42) NOT NULL,
  PRIMARY KEY ("address"),
  UNIQUE ("address")
);

CREATE TABLE user_profile_relations (
  "profileAddress" char(42) NOT NULL,
  "userAddress" char(42) NOT NULL,
  "archived" boolean DEFAULT false,
  FOREIGN KEY ("userAddress") REFERENCES users ("address")
);

CREATE TABLE nonces (
  "userAddress" char(42) NOT NULL,
  "nonce" CHAR(6) NOT NULL,
  UNIQUE ("userAddress"));
