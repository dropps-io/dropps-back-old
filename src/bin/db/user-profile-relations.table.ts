import {DB} from './mysql';
import {UserProfileRelation} from "../../lib/models/types/user-profile-relation";
import {USER_PROFILE_RELATION_NOT_FOUND} from "../utils/error-messages";

export async function queryUserProfileRelation(profileAddress: string, userAddress: string): Promise<UserProfileRelation> {
  return new Promise((resolve, reject) => {

    DB.query('SELECT * FROM user_profile_relations WHERE userAddress = \'' + userAddress +'\' && profileAddress = \'' + profileAddress + '\';', (err, res) => {
      if (err) reject(err);
      if (res[0]) resolve(res[0]);
      else reject(USER_PROFILE_RELATION_NOT_FOUND);
    });

  });
}

export async function queryProfilesOfUser(userAddress: string): Promise<string[]> {
  return new Promise((resolve, reject) => {

    DB.query('SELECT * FROM user_profile_relations WHERE userAddress = \'' + userAddress +'\';', (err, res) => {
      if (err) reject(err);
      const profiles: string[] = [];
      res.forEach((r: UserProfileRelation) => {
        profiles.push(r.profileAddress);
      });
      resolve(profiles);
    });

  });
}

export async function queryUsersOfProfile(profileAddress: string): Promise<string[]> {
  return new Promise((resolve, reject) => {

    DB.query('SELECT * FROM user_profile_relations WHERE profileAddress = \'' + profileAddress +'\';', (err, res) => {
      if (err) reject(err);
      const users: string[] = [];
      res.forEach((r: UserProfileRelation) => {
        users.push(r.userAddress);
      });
      resolve(users);
    });

  });
}

export async function insertUserProfileRelation(profileAddress: string, userAddress: string): Promise<UserProfileRelation> {
  return new Promise((resolve, reject) => {

    DB.query('INSERT INTO user_profile_relations VALUES (\'' + profileAddress +'\', \'' + userAddress + '\');', (err, res) => {
      if (err) reject(err);
      else resolve(res[0] as UserProfileRelation);
    });

  });
}

export async function deleteUserProfileRelation(profileAddress: string, userAddress: string): Promise<void> {
  return new Promise((resolve, reject) => {

    DB.query('DELETE FROM user_profile_relations WHERE userAddress = \'' + userAddress + '\' && profileAddress = \'' + profileAddress + '\';'
      , (err, res) => {
        if (err) reject(err);
        console.log(res);
        if (res.affectedRows === 0) reject(USER_PROFILE_RELATION_NOT_FOUND);
        else resolve();
      });

  });
}
