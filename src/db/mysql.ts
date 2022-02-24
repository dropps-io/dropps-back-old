import * as mysql from 'mysql';
import {DB_HOST, DB_PASSWORD, DB_USERNAME} from "../environment/endpoints";

let con = mysql.createConnection({
  host: DB_HOST,
  user: DB_USERNAME,
  password: DB_PASSWORD
});

con.connect(function(err) {
  if (err) throw err;
  console.log("Connected!");
});
