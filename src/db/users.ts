import {User} from "../models/types/user";
import {DB} from "./mysql";

export async function queryUser(address: string): Promise<User> {
  return new Promise((resolve, reject) => {
    DB.query("SELECT * FROM users WHERE address = '" + address +"';", (err, res) => {
      if (err) reject(err);
      if (res[0]) resolve(res[0] as User);
      reject(new Error('No user found with this address'));
    });
  });
}
