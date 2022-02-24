CREATE DATABASE dropps;

USE dropps;

CREATE TABLE `users` (
  `address` varchar(42) NOT NULL,
  `selectedProfile` varchar(42) DEFAULT NULL,
  PRIMARY KEY (`address`),
  UNIQUE KEY `address_UNIQUE` (`address`)
);

CREATE TABLE `universal_profiles` (
  `address` VARCHAR(42) NOT NULL,
  `userAddress` VARCHAR(42) NULL,
  `position` INT NULL,
  PRIMARY KEY (`address`),
  UNIQUE INDEX `address_UNIQUE` (`address` ASC) VISIBLE);

ALTER TABLE `users`
ADD FOREIGN KEY (selectedProfile) REFERENCES `universal_profiles`(address);

ALTER TABLE `universal_profiles`
ADD FOREIGN KEY (userAddress) REFERENCES `users`(address);
