import {DB} from './mysql';
import {UserProfileRelation} from '../../lib/models/types/user-profile-relation';
import {USER_PROFILE_RELATION_NOT_FOUND} from '../utils/error-messages';
import {UserProfile} from '../../lib/models/types/user-profile';
import {tinyIntToBoolean} from '../utils/tinyint-to-boolean';

export async function queryUserProfileRelation(profileAddress: string, userAddress: string): Promise<UserProfileRelation> {
	return new Promise((resolve, reject) => {

		DB.query('SELECT * FROM user_profile_relations WHERE userAddress = \'' + userAddress +'\' && profileAddress = \'' + profileAddress + '\';', (err, res) => {
			if (err) reject(err);
			if (res[0]) resolve(res[0]);
			else reject(USER_PROFILE_RELATION_NOT_FOUND);
		});

	});
}

export async function queryProfilesOfUser(userAddress: string): Promise<UserProfile[]> {
	return new Promise((resolve, reject) => {

		DB.query('SELECT * FROM user_profile_relations WHERE userAddress = \'' + userAddress +'\';', (err, res) => {
			if (err) reject(err);
			const profiles: UserProfile[] = [];
			res.forEach((r: UserProfileRelation) => {
				profiles.push({profileAddress: r.profileAddress, archived: tinyIntToBoolean(r.archived)});
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

export async function insertUserProfileRelation(profileAddress: string, userAddress: string, archived: boolean): Promise<UserProfileRelation> {
	return new Promise((resolve, reject) => {

		DB.query('INSERT INTO user_profile_relations VALUES (\'' + profileAddress +'\', \'' + userAddress + '\', ' + archived + ');', (err, res) => {
			if (err) reject(err);
			else resolve(res[0] as UserProfileRelation);
		});

	});
}

export async function updateUserProfileRelation(profileAddress: string, userAddress: string, archived: boolean): Promise<void> {
	return new Promise((resolve, reject) => {

		DB.query('UPDATE user_profile_relations SET archived = ' + archived + ' WHERE userAddress = \'' + userAddress + '\' && profileAddress = \'' + profileAddress + '\';',
			(err, res) => {
				if (err) reject(err);
				if (res.affectedRows === 0) reject(USER_PROFILE_RELATION_NOT_FOUND);
				else resolve();
			});

	});
}

export async function deleteUserProfileRelation(profileAddress: string, userAddress: string): Promise<void> {
	return new Promise((resolve, reject) => {

		DB.query('DELETE FROM user_profile_relations WHERE userAddress = \'' + userAddress + '\' && profileAddress = \'' + profileAddress + '\';',
			(err, res) => {
				if (err) reject(err);
				console.log(res);
				if (res.affectedRows === 0) reject(USER_PROFILE_RELATION_NOT_FOUND);
				else resolve();
			});

	});
}
