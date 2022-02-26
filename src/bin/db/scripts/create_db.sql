CREATE DATABASE dropps;

USE dropps;

CREATE TABLE `users` (
  `address` varchar(42) NOT NULL,
  `selectedProfile` varchar(42) NOT NULL,
  PRIMARY KEY (`address`),
  UNIQUE KEY `address_UNIQUE` (`address`)
);

CREATE TABLE `user_profile_relations` (
  `profileAddress` VARCHAR(42) NOT NULL,
  `userAddress` VARCHAR(42) NOT NULL);


ALTER TABLE `user_profile_relations`
ADD FOREIGN KEY (userAddress) REFERENCES `users`(address);

