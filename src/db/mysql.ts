import * as mysql from 'mysql';
import {DB_HOST, DB_NAME, DB_PASSWORD, DB_USERNAME} from "../environment/endpoints";
import {User} from "../models/types/user";

let con = mysql.createConnection({
  host: DB_HOST,
  user: DB_USERNAME,
  password: DB_PASSWORD,
  database: DB_NAME
});

con.connect(function(err) {
  if (err) throw err;
  console.log("Connected!");
});

export async function queryUser(address: string): Promise<User> {
  return new Promise((resolve, reject) => {
    console.log(address);
    con.query("SELECT * FROM users WHERE address = '" + address +"';", (err, res) => {
      if (err) reject(err);
      resolve(res[0] as User);
    });
  });
}
