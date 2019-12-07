"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const database_1 = __importDefault(require("../routes/database"));
class RepoController {
    // root API
    getBienvenida(req, res) {
        res.send('<p>Bienvenidos a la API <strong>RePo</strong>.</p>');
    }
    /////////////////
    // Datos Basicos
    getDatosBasicos(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const documento = req.params.documento;
            console.log(`listing Datos Basicos: ${documento}`);
            const sql = `CALL proc_select_datos_basicos(${documento});`;
            console.log(sql);
            yield database_1.default.query(sql, (error, rows) => {
                if (error) {
                    res.json({
                        error: true,
                        message: "Ocurrió un error al consultar datos basicos."
                    });
                }
                else {
                    console.log(rows);
                    return res.json(rows[0][0]);
                }
            });
        });
    }
    saveDatosBasicos(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            console.log(req.body);
            const dato = {
                documento: req.body.documento,
                nombre: req.body.nombre,
                apellido: req.body.apellido,
                idPrograma: 1,
                foto: req.body.foto
            };
            const sql = `INSERT INTO datos_basicos (documento,nombre,apellido,id_programa,foto) VALUES
    (${dato.documento},'${dato.nombre}','${dato.apellido}',${dato.idPrograma},'${dato.foto}');`;
            console.log(sql);
            yield database_1.default.query(sql, (error, rows) => {
                if (error) {
                    res.json({
                        error: true,
                        message: "Ocurrió un error al insertar dato basico."
                    });
                }
                else {
                    console.log(rows);
                    return res.json(rows);
                }
            });
        });
    }
    /////////////////
    // Datos Equipo 
    getDatosEquipo(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const idDatosBasicos = req.params.idDatosBasicos;
            const activo = req.params.activo;
            console.log(`listing Datos Equipo: ${idDatosBasicos}, ${activo}`);
            const sql = `CALL proc_select_datos_equipo(${idDatosBasicos}, ${activo});`;
            console.log(sql);
            yield database_1.default.query(sql, (error, rows) => {
                if (error) {
                    res.json({
                        error: true,
                        message: "Ocurrió un error al consultar datos equipo."
                    });
                }
                else {
                    console.log(rows);
                    return res.json(rows[0]);
                }
            });
        });
    }
    getDatosEquipo_Equipo(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const idDatosBasicos = req.params.idDatosBasicos;
            const idFecha = req.params.idFecha;
            console.log(`listing Datos Equipo: ${idDatosBasicos}, ${idFecha}`);
            const sql = `SELECT datos_equipo.id, datos_equipo.modelo, datos_equipo.color, datos_equipo.serie,
      datos_equipo.id_datos_basicos as idDatosBasicos, datos_equipo.activo 
      FROM datos_equipo 
      INNER JOIN equipo 
      ON equipo.id_datos_equipo = datos_equipo.id
      WHERE  datos_equipo.id_datos_basicos = ${idDatosBasicos} AND equipo.id_fecha = ${idFecha}
      AND  equipo.id_hora_salida is null ORDER BY datos_equipo.id DESC ;`;
            console.log(sql);
            yield database_1.default.query(sql, (error, rows) => {
                if (error) {
                    res.json({
                        error: true,
                        message: "Ocurrió un error al consultar datosequipo-equipo."
                    });
                }
                else {
                    console.log(rows);
                    return res.json(rows);
                }
            });
        });
    }
    saveDatosEquipo(req, res) {
        console.log(req.body);
        const data = req.body;
        let sql;
        let errors = 0;
        for (let dato of data) {
            console.log('dato:');
            console.log(dato);
            if (dato.id === null) {
                sql = `INSERT INTO datos_equipo(id_datos_basicos,modelo,color,serie,activo) VALUES (${dato.idDatosBasicos},'${dato.modelo}','${dato.color}','${dato.serie}',${dato.activo});`;
                console.log(sql);
                database_1.default.query(sql, (error, rows) => {
                    if (error) {
                        errors++;
                        console.log(error);
                    }
                });
            }
            else {
                sql = `UPDATE datos_equipo SET modelo = '${dato.modelo}',color = '${dato.color}',serie = '${dato.serie}' ,activo = ${dato.activo} WHERE id = ${dato.id};`;
                console.log(sql);
                database_1.default.query(sql, (error, rows) => {
                    if (error) {
                        errors++;
                        console.log(error);
                    }
                });
            }
        }
        res.json({ text: `Datos Equipo Grabado.` });
    }
    ////////////////
    // Fecha
    getFecha(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const idDatosBasicos = req.params.idDatosBasicos;
            let fechas = [];
            let horas = [];
            console.log(`listing Fecha: ${idDatosBasicos}`);
            const sqlf = `SELECT fecha.id,fecha.id_datos_basicos, DATE_FORMAT(fecha.ingreso, "%Y-%m-%d") ingreso, DATE_FORMAT(fecha.salida, "%Y-%m-%d") salida FROM fecha WHERE fecha.id_datos_basicos= ${idDatosBasicos}  ORDER BY fecha.id;`;
            const sqlh = 'SELECT `hora`.`id`,`hora`.`id_fecha`, time(`hora`.`ingreso`) ingreso, time(`hora`.`salida`) salida, eI.id_hora_ingreso equipoI,  eS.id_hora_salida equipoS  FROM `hora` LEFT JOIN `equipo` eI ON  eI.`id_hora_ingreso` = `hora`.`id` LEFT JOIN `equipo` eS ON  eS.`id_hora_salida` = `hora`.`id`;';
            console.log(sqlf);
            console.log(sqlh);
            yield database_1.default.query(sqlf, (error, rows) => {
                if (error) {
                    res.json({
                        error: true,
                        message: "Ocurrió un error al consultar fechas    ."
                    });
                }
                else {
                    console.log(rows);
                    fechas = rows;
                    database_1.default.query(sqlh, (error, rows) => {
                        if (error) {
                            res.json({
                                error: true,
                                message: "Ocurrió un error al consultar horas."
                            });
                        }
                        else {
                            console.log(rows);
                            horas = rows;
                            if (fechas) {
                                fechas.map(f => {
                                    f.horas = horas.filter(h => f.id === h.id_fecha);
                                });
                                console.log(fechas);
                                return res.json(fechas);
                            }
                            else {
                                res.json({
                                    error: true,
                                    message: "Ocurrió un error al consultar fechas y horas"
                                });
                            }
                        }
                    });
                }
            });
        });
    }
    saveFecha(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            console.log(req.body);
            const dato = {
                idDatosBasicos: req.body.id,
                ingreso: req.body.ingreso
            };
            const sql = `CALL proc_save_fecha(${dato.idDatosBasicos},${dato.ingreso});`;
            console.log(sql);
            yield database_1.default.query(sql, (error, rows) => {
                if (error) {
                    res.json({
                        error: true,
                        message: "Ocurrió un error al consultar fecha."
                    });
                }
                else {
                    console.log(rows);
                    return res.json(rows[0]);
                }
            });
        });
    }
    /////////////////
    // equipo
    getEquipo(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const idFecha = req.params.idFecha;
            const todos = req.params.todos;
            let sql;
            console.log(`listing Datos Equipo: ${idFecha}, ${todos}`);
            sql = `SELECT id, id_fecha, id_datos_equipo,id_hora_ingreso,id_hora_salida FROM equipo WHERE id_fecha = ${idFecha}`;
            if (!todos) {
                sql += ` AND id_hora_salida is null`;
            }
            sql += ';';
            console.log(sql);
            yield database_1.default.query(sql, (error, rows) => {
                if (error) {
                    res.json({
                        error: true,
                        message: "Ocurrió un error al consultar equipo."
                    });
                }
                else {
                    console.log(rows);
                    return res.json(rows);
                }
            });
        });
    }
    saveEquipo(req, res) {
        console.log(req.body);
        const data = req.body;
        let errors = 0;
        for (let dato of data) {
            let idHora;
            console.log('dato:');
            console.log(dato);
            if (dato.idHoraIngreso != 0) {
                idHora = dato.idHoraIngreso;
            }
            else {
                idHora = dato.idHoraSalida;
            }
            const sql = `CALL proc_save_equipo(${dato.idFecha},${dato.idDatosEquipo},${idHora});`;
            console.log(sql);
            database_1.default.query(sql, (error, rows) => {
                if (error) {
                    errors++;
                    console.log(error);
                }
            });
        }
        res.json({ text: `Equipo Grabado ` });
    }
}
const repoController = new RepoController();
exports.default = repoController;
