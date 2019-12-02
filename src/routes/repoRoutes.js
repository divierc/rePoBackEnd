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
        // Datos Basicos
        this.router.get('/datos-basicos/:id', repoControlller_1.default.getDatosBasicos);
        // Datos Equipo
        this.router.get('/datos-equipo', repoControlller_1.default.getDatosEquipo);
        // Fecha y Hora
        this.router.post('/fecha', repoControlller_1.default.saveFecha);
        // equipo
        this.router.post('/equipo', repoControlller_1.default.saveEquipo);
    }
}
const repoRoutes = new RepoRoutes();
exports.default = repoRoutes.router;
