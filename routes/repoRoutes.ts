import { Router }  from 'express';

import repoControlller from '../controllers/repoControlller';

class RepoRoutes {
  public router: Router = Router();  

  constructor() {
    this.config();
  }

  config(): void {
    // Bienvenido
    this.router.get('',repoControlller.getBienvenida);
    /////////////////
    // Datos Basicos
    this.router.get('/datos-basicos/:documento',repoControlller.getDatosBasicos);
    this.router.post('/datos-basicos',repoControlller.saveDatosBasicos);
    ////////////////
    // Datos Equipo
    this.router.get('/datos-equipo/:idDatosBasicos/:activo',repoControlller.getDatosEquipo);
    this.router.get('/datos-equipo-equipo/:idDatosBasicos/:idFecha',repoControlller.getDatosEquipo_Equipo);
    this.router.post('/datos-equipo',repoControlller.saveDatosEquipo);
    ////////////////
    // Fecha y Hora
    this.router.get('/fecha/:idDatosBasicos',repoControlller.getFecha);
    this.router.post('/fecha',repoControlller.saveFecha);
    /////////////////
    // equipo
    this.router.get('/equipo/:idFecha/:todos',repoControlller.getEquipo);
    this.router.post('/equipo',repoControlller.saveEquipo);
  }
}

const repoRoutes = new RepoRoutes();
export default repoRoutes.router;
