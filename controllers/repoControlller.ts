import { Request, Response } from 'express';
import db from '../routes/database';




class RepoController { 
  // root API
  public getBienvenida (req: Request,res: Response) {
    res.send('<p>Bienvenidos a la API <strong>RePo</strong>.</p>')
  }
  /////////////////
  // Datos Basicos
  public async getDatosBasicos(req: Request,res: Response): Promise<any> {
    const documento = req.params.documento;
    console.log(`listing Datos Basicos: ${documento}`);
    const sql = `CALL proc_select_datos_basicos(${documento});`;
    console.log(sql);
    await db.query(sql,(error:any,rows:any) => {
      if (error) {
          res.json({
              error: true,
              message: "Ocurrió un error al consultar datos basicos."
          });
      } else {
        console.log(rows);
        return res.json(rows[0][0]);
      }
    });

  }

  public async saveDatosBasicos(req: Request, res: Response): Promise<void> {
    console.log(req.body);
    const dato = {
      documento: req.body.documento,
      nombre: req.body.nombre,
      apellido: req.body.apellido,
      idPrograma: 1,
      foto: req.body.foto
    };
    const sql = `INSERT INTO datos_basicos (documento,nombre,apellido,id_programa,foto) VALUES
    (${dato.documento},'${dato.nombre }','${dato.apellido }',${dato.idPrograma },'${dato.foto}');`;
    console.log(sql);
    await db.query(sql,(error:any,rows:any) => {
      if (error) {
          res.json({
              error: true,
              message: "Ocurrió un error al insertar dato basico."
          });
      } else {
        console.log(rows);
        return res.json(rows);
      }
    });
  }
  /////////////////
  // Datos Equipo 
  public async getDatosEquipo(req: Request,res: Response): Promise<any> {
    const idDatosBasicos = req.params.idDatosBasicos;
    const activo = req.params.activo;

    console.log(`listing Datos Equipo: ${idDatosBasicos}, ${activo}`);
    const sql = `CALL proc_select_datos_equipo(${idDatosBasicos}, ${activo});`;
    console.log(sql);
    await db.query(sql,(error:any,rows:any) => {
      if (error) {
          res.json({
              error: true,
              message: "Ocurrió un error al consultar datos equipo."
          });
      } else {
        console.log(rows);
        return res.json(rows[0]);
      }
    });
  }

  public async getDatosEquipo_Equipo(req: Request,res: Response): Promise<any> {
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
    await db.query(sql,(error:any,rows:any) => {
      if (error) {
          res.json({
              error: true,
              message: "Ocurrió un error al consultar datosequipo-equipo."
          });
      } else {
        console.log(rows);
        return res.json(rows);
      }
    });
  }

public saveDatosEquipo(req: Request, res: Response): void {
    console.log(req.body);
    const data = req.body;
    let sql;
    let errors = 0;
    
    for (let dato of data)
    {
      console.log('dato:');
      console.log(dato);

      if( dato.id === null) {
        
        sql = `INSERT INTO datos_equipo(id_datos_basicos,modelo,color,serie,activo) VALUES (${dato.idDatosBasicos},'${dato.modelo}','${dato.color}','${dato.serie}',${dato.activo});`;
        console.log(sql);
        db.query(sql,(error:any,rows:any) => {
          if (error) {
            errors++;
            console.log(error)
          } 
        });

      } else {

        sql =`UPDATE datos_equipo SET modelo = '${dato.modelo}',color = '${dato.color}',serie = '${dato.serie}' ,activo = ${dato.activo} WHERE id = ${dato.id};`;
        console.log(sql);
        db.query(sql,(error:any,rows:any) => {
          if (error) {
            errors++;
            console.log(error)
          }
        });
      }
    }
    res.json({text: `Datos Equipo Grabado.`});
  }



  ////////////////
  // Fecha
  public async getFecha(req: Request,res: Response): Promise<any> {
    const idDatosBasicos = req.params.idDatosBasicos;
    let fechas: any[] = [];
    let horas: any[] = [];
    console.log(`listing Fecha: ${idDatosBasicos}`);
    const sqlf = `SELECT fecha.id,fecha.id_datos_basicos, DATE_FORMAT(fecha.ingreso, "%Y-%m-%d") ingreso, DATE_FORMAT(fecha.salida, "%Y-%m-%d") salida FROM fecha WHERE fecha.id_datos_basicos= ${idDatosBasicos}  ORDER BY fecha.id;`;
    const sqlh = 'SELECT `hora`.`id`,`hora`.`id_fecha`, time(`hora`.`ingreso`) ingreso, time(`hora`.`salida`) salida, eI.id_hora_ingreso equipoI,  eS.id_hora_salida equipoS  FROM `hora` LEFT JOIN `equipo` eI ON  eI.`id_hora_ingreso` = `hora`.`id` LEFT JOIN `equipo` eS ON  eS.`id_hora_salida` = `hora`.`id`;';
    console.log(sqlf);
    console.log(sqlh);

    await db.query(sqlf,(error:any,rows:any) => {
      if (error) {
          res.json({
              error: true,
              message: "Ocurrió un error al consultar fechas    ."
          });
      } else {
        console.log(rows);
        fechas = rows;

        db.query(sqlh,(error:any,rows:any) => {
          if (error) {
              res.json({
                  error: true,
                  message: "Ocurrió un error al consultar horas."
              });
          } else {
            console.log(rows);
            horas = rows;

            if (fechas) {

              fechas.map(f => {
                  f.horas = horas.filter(h => f.id === h.id_fecha);
              });
              console.log(fechas);
              return res.json(fechas);
            } else {
              res.json({
                  error: true,
                  message: "Ocurrió un error al consultar fechas y horas"
              });
            }
          }
        });
      }
    });
}
  public async saveFecha(req: Request, res: Response): Promise<void> {
    console.log(req.body);
    const dato = {
      idDatosBasicos: req.body.id,
      ingreso: req.body.ingreso
    };
    const sql = `CALL proc_save_fecha(${dato.idDatosBasicos},${dato.ingreso});`
    console.log(sql);
    await db.query(sql,(error:any,rows:any) => {
      if (error) {
          res.json({
              error: true,
              message: "Ocurrió un error al consultar fecha."
          });
      } else {
        console.log(rows);
        return res.json(rows[0]);
      }
    });
  }
  /////////////////
  // equipo
  public async getEquipo(req: Request,res: Response): Promise<any> {
    const idFecha = req.params.idFecha;
    const todos =  req.params.todos;
    let sql: string;
    console.log(`listing Datos Equipo: ${idFecha}, ${todos}`);
    sql = `SELECT id, id_fecha, id_datos_equipo,id_hora_ingreso,id_hora_salida FROM equipo WHERE id_fecha = ${idFecha}`;
    if(!todos) {
      sql+= ` AND id_hora_salida is null`;
    }
    sql+= ';';
    console.log(sql);
    await db.query(sql,(error:any,rows:any) => {
      if (error) {
          res.json({
              error: true,
              message: "Ocurrió un error al consultar equipo."
          });
      } else {
        console.log(rows);
        return res.json(rows);
      }
    });
  }


  public saveEquipo(req: Request, res: Response): void {
    console.log(req.body);
    const data = req.body;
    let errors: number = 0;
    
    for (let dato of data)
    {
      let idHora: any;

      console.log('dato:');
      console.log(dato);
      
      if (dato.idHoraIngreso != 0) {
        idHora = dato.idHoraIngreso;
      } else {
        idHora = dato.idHoraSalida;
      }

      const sql = `CALL proc_save_equipo(${dato.idFecha},${dato.idDatosEquipo},${idHora});`;
      console.log(sql);
      db.query(sql,(error:any,rows:any) => {
        if (error) {
          errors++;
          console.log(error)
        } 
      });
    }
    res.json({text: `Equipo Grabado `});
  }
  // Fin RepoController
}

const repoController= new RepoController();
export default  repoController;