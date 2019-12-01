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
    // Datos Basicos
    getDatosBasicos(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const id = req.params.id;
            console.log(`listing Datos Basicos: ${id}`);
            const sql = `CALL proc_select_datos_basicos(${id});`;
            console.log(sql);
            const [error, rows, fields] = yield database_1.default.query(sql);
            if (error) {
                res.json({
                    error: true,
                    message: "Ocurrió un error al consultar datos basicos."
                });
            }
            else {
                console.log(rows[0]);
                return res.json(rows[0]);
            }
        });
    }
    // Datos Equipo 
    getDatosEquipo(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const dato = {
                idDatosBasicos: req.body.idDatosBasicos,
                activo: req.body.activo
            };
            console.log(`listing Datos Equipo: ${dato.idDatosBasicos}, ${dato.activo}`);
            const sql = `CALL proc_select_datos_equipo(${dato.idDatosBasicos}, ${dato.activo});`;
            console.log(sql);
            const [error, rows, fields] = yield database_1.default.query(sql);
            if (error) {
                res.json({
                    error: true,
                    message: "Ocurrió un error al consultar datos equipo."
                });
            }
            else {
                console.log(rows);
                return res.json(rows);
            }
        });
    }
    // Fecha
    saveFecha(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            console.log(req.body);
            const dato = {
                idDatosBasicos: req.body.idDatosBasicos,
                ingreso: req.body.ingreso
            };
            const sql = `CALL proc_save_fecha(${dato.idDatosBasicos},${dato.ingreso});`;
            console.log(sql);
            yield database_1.default.query(sql);
        });
    }
    // equipo
    saveEquipo(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            console.log(req.body);
            const dato = {
                idFecha: req.body.idFecha,
                idDatosEquipo: req.body.idDatosEquipo,
                idHora: req.body.idHora,
            };
            const sql = `CALL proc_save_equipo(${dato.idFecha},${dato.idDatosEquipo},${dato.idHora});`;
            console.log(sql);
            yield database_1.default.query(sql);
            res.json({ text: `save Equipo` });
        });
    }
}
const repoController = new RepoController();
exports.default = repoController;
