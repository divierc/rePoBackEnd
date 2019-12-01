import keys from './keys';

//create mysql connection pool
const mysql_pool = require('mysql2');
const pool = mysql_pool.createPool(keys.database);
// For pool initialization, see above
pool.getConnection((err: any, conn: any)=> {
    // Do something with the connection  `Select 'DB is connected' as message`
    pool.execute(`SELECT schema_name as 'DB connected is' FROM information_schema.schemata  WHERE schema_name = '${keys.database.database}';` 
    , function(error: any, rows: any) {
        // Connection is automatically released when query resolves
        if (error) 
            console.log({
                error: true,
                message: `Ocurrió un error al conectar con '${keys.database.database}'`
            });
        else 
            console.log(rows);
    });    
    // Don't forget to release the connection when finished!
    pool.releaseConnection(conn);
    //console.log(pool.config);
})

 // export default db;
 // now get a Promise wrapped instance of that pool
const promisePool = pool.promise();

export default  promisePool;