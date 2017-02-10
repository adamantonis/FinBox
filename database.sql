/* Inspired from https://codeforgeek.com/2015/03/restful-api-node-and-express-4/ */
SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0;
SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0;
SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='TRADITIONAL,ALLOW_INVALID_DATES';

CREATE SCHEMA IF NOT EXISTS `finbox` DEFAULT CHARACTER SET latin1;
USE `finbox`;

-- -----------------------------------------------------
-- Table `finbox`.`user`
-- -----------------------------------------------------
DROP TABLE IF EXISTS `finbox`.`user`;

CREATE TABLE IF NOT EXISTS `finbox`.`user` (
  `user_id` 	   INT 		   NOT NULL AUTO_INCREMENT,
  `user_firstName` VARCHAR(64) NOT NULL,
  `user_lastName`  VARCHAR(64) NOT NULL,
  `user_email` 	   VARCHAR(64) NOT NULL,
  `user_password`  CHAR(60)    NOT NULL,
  PRIMARY KEY (`user_id`),
  UNIQUE INDEX `user_email_UNIQUE` (`user_email` ASC))
ENGINE = InnoDB;

-- -----------------------------------------------------
-- Table `finbox`.`user_file`
-- -----------------------------------------------------
DROP TABLE IF EXISTS `finbox`.`user_files`;

CREATE TABLE IF NOT EXISTS `finbox`.`user_files` (
  `file_id` 		  INT 		   NOT NULL AUTO_INCREMENT,
  `user_id_fk` 		  INT 		   NOT NULL,
  `file_name` 		  VARCHAR(64)  NOT NULL,
  `creation_date` 	  DATETIME     NOT NULL,
  `modification_date` DATETIME,
  `file` 			  MEDIUMBLOB   NOT NULL,
  `file_size` 	 	  INT 	       NOT NULL,
  `mime_type` 	 	  VARCHAR(64)  NOT NULL,
  PRIMARY KEY (`file_id`),
  FOREIGN KEY (`user_id_fk`) REFERENCES `finbox`.`user` (`user_id`))
ENGINE = InnoDB;

SET SQL_MODE=@OLD_SQL_MODE;
SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS;
SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS;