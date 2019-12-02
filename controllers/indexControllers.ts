import {Request, Response} from 'express';


class IndexController {
  public index (req: Request,res: Response) {
    res.send('Bienvenidos al servidor.')
  } 
    
}

export const indexController= new IndexController();