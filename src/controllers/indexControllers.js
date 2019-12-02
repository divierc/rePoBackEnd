"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class IndexController {
    index(req, res) {
        res.send('Bienvenidos al servidor.');
    }
}
exports.indexController = new IndexController();
