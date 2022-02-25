import {User} from "../models/types/user";
import {DB} from "./mysql";

export async function queryUser(address: string): Promise<User> {
  return new Promise((resolve, reject) => {
    DB.query("SELECT * FROM users WHERE address = '" + address +"';", (err, res) => {
      if (err) reject(err);
      resolve(res[0] as User);
    });
  });
}
