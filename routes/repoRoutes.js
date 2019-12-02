"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const repoControlller_1 = __importDefault(require("../controllers/repoControlller"));
class RepoRoutes {
    constructor() {
        this.router = express_1.Router();
        this.config();
    }
    config() {
        // Bienvenido
        this.router.get('', repoControlller_1.default.getBienvenida);
        /////////////////
        // Datos Basicos
        this.router.get('/datos-basicos/:documento', repoControlller_1.default.getDatosBasicos);
        this.router.post('/datos-basicos', repoControlller_1.default.saveDatosBasicos);
        ////////////////
        // Datos Equipo
        this.router.get('/datos-equipo/:idDatosBasicos/:activo', repoControlller_1.default.getDatosEquipo);
        this.router.get('/datos-equipo-equipo/:idDatosBasicos/:idFecha', repoControlller_1.default.getDatosEquipo_Equipo);
        this.router.post('/datos-equipo', repoControlller_1.default.saveDatosEquipo);
        ////////////////
        // Fecha y Hora
        this.router.get('/fecha/:idDatosBasicos', repoControlller_1.default.getFecha);
        this.router.post('/fecha', repoControlller_1.default.saveFecha);
        /////////////////
        // equipo
        this.router.get('/equipo/:idFecha/:todos', repoControlller_1.default.getEquipo);
        this.router.post('/equipo', repoControlller_1.default.saveEquipo);
    }
}
const repoRoutes = new RepoRoutes();
exports.default = repoRoutes.router;
