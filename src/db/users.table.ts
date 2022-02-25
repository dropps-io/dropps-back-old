import {User} from "../models/types/user";
import {DB} from "./mysql";
import {USER_NOT_FOUND} from "../services/utils/error-messages";

export async function queryUser(address: string): Promise<User> {
  return new Promise((resolve, reject) => {

    DB.query("SELECT * FROM users WHERE address = '" + address +"';", (err, res) => {
      if (err) reject(err);
      resolve(res[0] as User);
    });

  });
}

export async function insertUser(address: string, selectedProfile: string): Promise<User> {
  return new Promise((resolve, reject) => {

    DB.query("INSERT INTO users VALUES ('" + address +"', '" + selectedProfile + "');", (err, res) => {
      if (err) reject(err);
      else resolve(res[0] as User);
    });

  });
}

export async function updateUser(address: string, newSelectedProfile: string): Promise<void> {
  return new Promise((resolve, reject) => {

    DB.query("UPDATE users SET selectedProfile = '" + newSelectedProfile + "' WHERE address = '" + address + "';"
      , (err, res) => {
        if (err) reject(err);
        if (res.changedRows === 0) reject(USER_NOT_FOUND);
        else resolve();
    });

  });
}
