CREATE DATABASE dropps;

USE dropps;

CREATE TABLE `users` (
  `address` varchar(42) NOT NULL,
  `selectedProfile` varchar(42) NOT NULL,
  PRIMARY KEY (`address`),
  UNIQUE KEY `address_UNIQUE` (`address`)
);

CREATE TABLE `user_profile_relations` (
  `profileAddress` varchar(42) NOT NULL,
  `userAddress` varchar(42) NOT NULL,
  `archived` tinyint NOT NULL DEFAULT 0,
  CONSTRAINT FOREIGN KEY (`userAddress`) REFERENCES `users` (`address`)
);

CREATE TABLE `nonces` (
  `address` INT NOT NULL,
  `nonce` VARCHAR(6) NULL,
  PRIMARY KEY (`address`));
