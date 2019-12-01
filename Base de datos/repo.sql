/* CREACION DE LA BASE DE DATOS */
/* drop database repo; */

CREATE SCHEMA IF NOT EXISTS `repo` DEFAULT COLLATE utf8_general_mysql500_ci; 
USE `repo`;

/*Código que deben correr en workbeanch 8*/
/*
ALTER USER 'root'@'localhost' IDENTIFIED WITH mysql_native_password BY '12345';
*/
DROP TABLE IF EXISTS equipo;
DROP TABLE IF EXISTS hora;
DROP TABLE IF EXISTS fecha;
DROP TABLE IF EXISTS datos_equipo;
DROP TABLE IF EXISTS datos_basicos;
DROP TABLE IF EXISTS programa;


  CREATE TABLE  programa (
  `id` INT NOT NULL AUTO_INCREMENT,
  `programa` VARCHAR(45) DEFAULT 'Desarrollo de Apps',
  `sede` VARCHAR(45) DEFAULT 'Sede Colombia',
  PRIMARY KEY (`id`),
  UNIQUE INDEX `id_UNIQUE` (`id` ASC) );
  
  
  CREATE TABLE `datos_basicos` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `documento` INT NOT NULL,
  `nombre` VARCHAR(45) NOT NULL,
  `apellido` VARCHAR(45) NOT NULL,
  `id_programa` INT NOT NULL,
  `foto` VARCHAR(256) NOT NULL DEFAULT 'assets/fotoblanco.jpg',
  PRIMARY KEY (`id`),
  UNIQUE INDEX `iddatos_basicos_UNIQUE` (`id` ASC) ,
  INDEX `id_idx` (`id_programa` ASC) ,
  CONSTRAINT `id_programa_datos_basicos`
    FOREIGN KEY (`id_programa`)
    REFERENCES `programa` (`id`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION);

CREATE TABLE `fecha` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `id_datos_basicos` INT NOT NULL,
  `ingreso` VARCHAR(45) NULL DEFAULT 'CURRENT_TIMESTAMP()',
  `salida` VARCHAR(45) NULL DEFAULT 'null',
  PRIMARY KEY (`id`),
  UNIQUE INDEX `id_UNIQUE` (`id` ASC) ,
  CONSTRAINT `id_datos_basicos_fecha`
    FOREIGN KEY (`id_datos_basicos`)
    REFERENCES `datos_basicos` (`id`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION);
    
    
        
   CREATE TABLE `hora` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `id_fecha` INT NOT NULL,
  `ingreso` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP(),
  `salida` DATETIME NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE INDEX `id_UNIQUE` (`id` ASC) ,
  INDEX `id_fecha_idx` (`id_fecha` ASC) ,
  CONSTRAINT `id_fecha`
    FOREIGN KEY (`id_fecha`)
    REFERENCES `fecha` (`id`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION);
    
    CREATE TABLE `datos_equipo` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `id_datos_basicos` INT NOT NULL,
  `modelo` VARCHAR(45) NOT NULL,
  `color` VARCHAR(45) NOT NULL,
  `serie` VARCHAR(45) NOT NULL,
  `activo` BOOL NOT NULL DEFAULT TRUE, 
  PRIMARY KEY (`id`),
  UNIQUE INDEX `id_UNIQUE` (`id` ASC) ,
  CONSTRAINT `id_datos_basicos_datos_equipo`
    FOREIGN KEY (`id_datos_basicos`)
    REFERENCES `datos_basicos` (`id`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION);



CREATE TABLE `equipo` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `id_fecha` INT NOT NULL,
  `id_datos_equipo` INT NOT NULL,
  `id_hora_ingreso` INT NULL DEFAULT NULL,
  `id_hora_salida` INT NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE INDEX `id_UNIQUE` (`id` ASC) ,
  INDEX `id_fecha_equipo_idx` (`id_datos_equipo` ASC) ,
  INDEX `id_fecha_equipo_idx1` (`id_fecha` ASC) ,
  CONSTRAINT `id_datos_equipo_equipo`
    FOREIGN KEY (`id_datos_equipo`)
    REFERENCES `datos_equipo` (`id`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION,
  CONSTRAINT `id_fecha_equipo`
    FOREIGN KEY (`id_fecha`)
    REFERENCES `fecha` (`id`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION,
  CONSTRAINT `id_horaI_equipo`
    FOREIGN KEY (`id_hora_ingreso`)
    REFERENCES `hora` (`id`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION,
  CONSTRAINT `id_horaS_equipo`
    FOREIGN KEY (`id_hora_salida`)
    REFERENCES `hora` (`id`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION);
    

DROP procedure IF EXISTS `proc_select_datos_basicos`;

DELIMITER $$

CREATE PROCEDURE `proc_select_datos_basicos` (in documento int)
BEGIN

SELECT `datos_basicos`.`id`,
    `datos_basicos`.`documento`,
    `datos_basicos`.`nombre`,
    `datos_basicos`.`apellido`,
    `datos_basicos`.`id_programa`,
    p.programa,
    `datos_basicos`.`foto`
	FROM `datos_basicos`
    INNER JOIN programa p
    ON p.id = `datos_basicos`.id_programa
	WHERE `datos_basicos`.`documento`= documento;

END$$

DELIMITER ;



DROP procedure IF EXISTS `proc_select_fecha`;

DELIMITER $$

CREATE PROCEDURE `proc_select_fecha`(in idDatosBasicos int, in ingreso bool, out idFecha int)
BEGIN
	
	DECLARE fecha DATETIME;
    
	IF ingreso  THEN		
		SET @idFecha = ( SELECT f.id  FROM fecha f WHERE f.id_datos_basicos = idDatosBasicos  AND f.salida IS NULL AND DATE(f.ingreso) < CURDATE() ORDER BY f.id DESC LIMIT 1);
		
		IF @idFecha IS NULL THEN SET idFecha = (SELECT f.id  FROM fecha f WHERE f.id_datos_basicos = idDatosBasicos AND DATE(f.ingreso) = CURDATE() ORDER BY f.id DESC LIMIT 1);
		ELSE
			SET idFecha = 0;
		END IF;
	END IF;
    
    IF !ingreso THEN
    	SET idFecha = (SELECT id FROM fecha  WHERE id_datos_basicos = idDatosBasicos  AND salida IS NULL ORDER BY id DESC LIMIT 1);    
      IF idFecha IS NULL THEN
        SET idFecha= (SELECT id FROM fecha WHERE id_datos_basicos = idDatosBasicos ORDER BY id DESC LIMIT 1);
        SET fecha = (SELECT fecha.ingreso FROM fecha WHERE id = idFecha ORDER BY id DESC LIMIT 1);
        IF DATE(fecha) <> DATE(CURRENT_TIMESTAMP()) THEN
          SET idFecha = NULL;
        END IF;
      END IF;
    END IF;
END$$

DELIMITER ;

DROP procedure IF EXISTS `proc_update_fecha`;

DELIMITER $$
CREATE PROCEDURE `proc_update_fecha`(in idfecha int, in ingreso bool)
BEGIN
DECLARE fecha DATETIME;
    DECLARE idHora int;
    
    SET fecha = CURRENT_TIMESTAMP();
    
    SET idHora = (
			SELECT h.id FROM hora h 
			WHERE h.id_fecha = idfecha 
            AND h.salida IS NULL 
            ORDER BY h.id 
            DESC LIMIT 1
            );
	
    IF idHora > 0  THEN
		IF !ingreso THEN
			UPDATE `hora`
			SET `salida` = fecha
			WHERE `id` = idHora;
		ELSE 
			-- El usuario ya registro ingreso
			SET idHora = '-1';
        END IF;
        
	END IF;
    
	
	IF idHora IS NULL AND ingreso THEN
		INSERT INTO `hora`
		(`id_fecha`,`ingreso`,`salida`)	VALUES (idFecha,fecha,null);
        SET fecha = NULL;
        SET idHora = LAST_INSERT_ID();
    END IF;
    
	IF idHora > 0  THEN    
		UPDATE `fecha`
		SET	`salida` = fecha
		WHERE `id` = idFecha;
	ELSE 
		IF !ingreso THEN
			-- El usuario ya registro salida
			SET idHora = '-2';
		END IF;
	END IF;
	select idFecha, idHora;

END$$

DELIMITER ;


DROP procedure IF EXISTS `proc_insert_fecha`;

DELIMITER $$
CREATE PROCEDURE `proc_insert_fecha` (in idDatosBasicos int, out idFecha int)
BEGIN
	DECLARE fecha DATETIME;
    DECLARE idHora int;
    
    SET idFecha=null;
    SET idHora=null;
    SET fecha = CURRENT_TIMESTAMP();
    
	  
	INSERT INTO fecha (`id_datos_basicos`, `ingreso`, `salida`) VALUES (idDatosBasicos,fecha,null);
  SET idFecha = LAST_INSERT_ID();
    
  INSERT INTO hora 
  SET id_fecha = idFecha, 
  ingreso = fecha;
  
  SET idHora = LAST_INSERT_ID();
    
    SELECT idFecha, idHora;
END$$

DELIMITER ;

DROP procedure IF EXISTS `proc_save_fecha`;

DELIMITER $$
CREATE  PROCEDURE `proc_save_fecha`(in idDatosBasicos int, in ingreso bool)
sp:BEGIN
	call proc_select_fecha(idDatosBasicos,ingreso,@idFecha);
    
    IF @idFecha = 0 THEN
		-- 'usuario no registro la salida anterior.'
		SELECT '-2' idFecha, '0' idHora;
        LEAVE sp;
    END IF;
    
	IF @idFecha IS NULL AND !ingreso THEN
		-- 'usuario no registro ingreso.'
		SELECT  '-1' idFecha, '0' idHora;
        LEAVE sp;
    END IF;
    
    IF @idFecha IS NULL AND ingreso THEN
		CALL proc_insert_fecha(idDatosBasicos, @idFecha);
        LEAVE sp;
    END IF;
 
    IF @idFecha > 0  THEN
		CALL proc_update_fecha(@idFecha, ingreso);
    END IF;
 
END$$

DELIMITER ;


DROP procedure IF EXISTS `proc_select_datos_equipo`;

DELIMITER $$

CREATE PROCEDURE `proc_select_datos_equipo`(in idDatosBasicos int, in activos bool)
BEGIN
	SET @idDatosBasicos = idDatosBasicos;
	SET @s = 'SELECT `datos_equipo`.`id`,`datos_equipo`.`modelo`,`datos_equipo`.`color`,`datos_equipo`.`serie`,	`datos_equipo`.`id_datos_basicos`,datos_equipo.activo FROM `datos_equipo` WHERE  `datos_equipo`.`id_datos_basicos` = ?';

	IF activos IS TRUE THEN
		SET @s = CONCAT(@s,' AND  `datos_equipo`.`activo` IS TRUE');
	END IF;


	PREPARE stmt1 FROM @s;
	EXECUTE stmt1 USING @idDatosBasicos;
    DEALLOCATE PREPARE stmt1;
    
END$$

DELIMITER ;


DROP procedure IF EXISTS `proc_save_equipo`;

DELIMITER $$
USE `repo`$$
CREATE PROCEDURE `proc_save_equipo` (in idFecha int, in idDatosEquipo int, in idHora int)
BEGIN
	IF(Select count(*) from `equipo` WHERE `equipo`.`id_fecha` = idFecha and id_datos_equipo = idDatosEquipo ) = 0  THEN
		INSERT INTO `equipo`
		(`id_fecha`,`id_datos_equipo`,`id_hora_ingreso`) VALUES
		(idFecha,idDatosEquipo,idHora);	
	ELSE
		UPDATE `equipo`
		SET	`id_hora_salida` = idHora
		WHERE `id_fecha` = idFecha and id_datos_equipo = idDatosEquipo AND id_hora_salida is null;
    END IF;
END$$

DELIMITER ;

/* se cam,bia el default de la base de datos*/
/*
ALTER SCHEMA `repo`  DEFAULT COLLATE utf8_general_ci ;
*/
/* Ingreso de data de ejemplo */ 
/* ************************** */
INSERT INTO `programa` (`programa`,`sede`) VALUES ('Entrada temporal.','No asignada.');
INSERT INTO `programa` (`programa`,`sede`) VALUES ('programa2','sede2');
INSERT INTO `programa` (`programa`,`sede`) VALUES ('programa3','sede3');
INSERT INTO `programa` (`programa`,`sede`) VALUES ('programa4','sede4');
INSERT INTO `programa` (`programa`,`sede`) VALUES ('programa5','sede5');

SELECT * FROM programa;

INSERT INTO `datos_basicos` (`documento`,`nombre`,`apellido`,`id_programa`,`foto`) VALUES (11,'nom1','ape1',1,'https://image.freepik.com/foto-gratis/retrato-belleza-perfil-personajes-femenino_1301-1409.jpg');
INSERT INTO `datos_basicos` (`documento`,`nombre`,`apellido`,`id_programa`,`foto`) VALUES (22,'nom2','ape2',2,'https://st4.depositphotos.com/1016026/21228/i/1600/depositphotos_212288152-stock-photo-portrait-young-woman-sunglasses-outdoor.jpg');
INSERT INTO `datos_basicos` (`documento`,`nombre`,`apellido`,`id_programa`,`foto`) VALUES (33,'nom3','ape3',3,'https://image.freepik.com/foto-gratis/desvio-gente-mujer-personas-perfil_1301-941.jpg');
INSERT INTO `datos_basicos` (`documento`,`nombre`,`apellido`,`id_programa`,`foto`) VALUES (44,'nom4','ape4',4,'https://tht.company/wp-content/uploads/2017/06/expectativas_personas_blog_-_THT-670x402.jpg');
INSERT INTO `datos_basicos` (`documento`,`nombre`,`apellido`,`id_programa`,`foto`) VALUES (55,'nom5','ape5',5,'http://www.durangomas.mx/wp-content/uploads/2017/05/Acosador.jpg');

SELECT * FROM datos_basicos;
/*CALL proc_select_datos_basicos(1);*/

INSERT INTO `datos_equipo` (`modelo`,`color`,`serie`,`id_datos_basicos`, `activo`) VALUES ('modelo11','color1','serie11',1,false);
INSERT INTO `datos_equipo` (`modelo`,`color`,`serie`,`id_datos_basicos`, `activo`) VALUES ('modelo12','color1','serie12',1,false);
INSERT INTO `datos_equipo` (`modelo`,`color`,`serie`,`id_datos_basicos`) VALUES ('modelo13','color2','serie13',1);
INSERT INTO `datos_equipo` (`modelo`,`color`,`serie`,`id_datos_basicos`) VALUES ('modelo2','color2','serie2',2);
INSERT INTO `datos_equipo` (`modelo`,`color`,`serie`,`id_datos_basicos`) VALUES ('modelo3','color3','serie3',3);

CALL proc_insert_fecha(1, @idFecha);
CALL proc_insert_fecha(2, @idFecha);
CALL proc_insert_fecha(3, @idFecha);

CALL proc_update_fecha (1,false);
CALL proc_update_fecha (1, true);
CALL proc_update_fecha (2,false);

INSERT INTO `equipo`(`id_fecha`,`id_datos_equipo`,`id_hora_ingreso`,`id_hora_salida`)VALUES(1,3,1,1);
INSERT INTO `equipo`(`id_fecha`,`id_datos_equipo`,`id_hora_ingreso`,`id_hora_salida`)VALUES(1,3,4,null);


SELECT * FROM fecha;
SELECT * FROM hora;
SELECT * FROM datos_equipo;
SELECT * FROM equipo;

/*
 
  
    SELECT CURDATE(); 
    
    select date(CURRENT_TIMESTAMP());
    
    SELECT DATE_FORMAT(CURRENT_TIMESTAMP(), "%D"); 
    
    SELECT TIMEDIFF(ADDDATE(CURRENT_TIMESTAMP(), INTERVAL 80 MINUTE), CURRENT_TIMESTAMP()); 
    
    SELECT ADDDATE(CURRENT_TIMESTAMP(), INTERVAL 10 MINUTE);   
    SELECT DATE_FORMAT(CURDATE(), "%Y-%m-%d");
     SELECT CURRENT_TIMESTAMP(); 
     
*/