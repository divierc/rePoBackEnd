"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const keys_1 = __importDefault(require("./keys"));
//create mysql connection pool
const mysql_pool = require('mysql2');
const pool = mysql_pool.createPool(keys_1.default.database);
// For pool initialization, see above
pool.getConnection((err, conn) => {
    // Do something with the connection  `Select 'DB is connected' as message`
    pool.execute(`SELECT schema_name as 'DB is connected' FROM information_schema.schemata  WHERE schema_name = '${keys_1.default.database.database}';`, function (error, rows) {
        // Connection is automatically released when query resolves
        if (error)
            console.log({
                error: true,
                message: `Ocurrió un error al conectar con '${keys_1.default.database.database}'`
            });
        else
            console.log(rows);
    });
    // Don't forget to release the connection when finished!
    pool.releaseConnection(conn);
    //console.log(pool.config);
});
// export default db;
// now get a Promise wrapped instance of that pool
const promisePool = pool.promise();
exports.default = promisePool;
