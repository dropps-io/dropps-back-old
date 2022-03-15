import {executeQuery} from './mysql';
import {UserProfileRelation} from '../../lib/models/types/user-profile-relation';
import {ERROR_USER_PROFILE_RELATION_NOT_FOUND} from '../utils/error-messages';
import {UserProfile} from '../../lib/models/types/user-profile';
import {tinyIntToBoolean} from '../utils/tinyint-to-boolean';

export async function queryUserProfileRelation(profileAddress: string, userAddress: string): Promise<UserProfileRelation> {
	const res = await executeQuery('SELECT * FROM user_profile_relations WHERE userAddress = ? && profileAddress = ?;', [userAddress, profileAddress]);
	if (res[0]) return res[0] as UserProfileRelation;
	else throw ERROR_USER_PROFILE_RELATION_NOT_FOUND;
}

export async function queryProfilesOfUser(userAddress: string): Promise<UserProfile[]> {
	const res = await executeQuery('SELECT * FROM user_profile_relations WHERE userAddress = ?;', [userAddress]);
	const profiles: UserProfile[] = [];
	res.forEach((r: UserProfileRelation) => {
		profiles.push({profileAddress: r.profileAddress, archived: tinyIntToBoolean(r.archived)});
	});
	return profiles;
}

export async function queryUsersOfProfile(profileAddress: string): Promise<string[]> {
	const res = await executeQuery('SELECT * FROM user_profile_relations WHERE profileAddress = ?;', [profileAddress]);
	const users: string[] = [];
	res.forEach((r: UserProfileRelation) => {
		users.push(r.userAddress);
	});
	return users;
}

export async function insertUserProfileRelation(profileAddress: string, userAddress: string, archived: boolean): Promise<UserProfileRelation> {
	const res = await executeQuery('INSERT INTO user_profile_relations VALUES (?, ?, ?);',[profileAddress, userAddress, archived]);
	return res[0] as UserProfileRelation;
}

export async function updateUserProfileRelation(profileAddress: string, userAddress: string, archived: boolean): Promise<void> {
	const res = await executeQuery('UPDATE user_profile_relations SET archived = ? WHERE userAddress = ? && profileAddress = ?;', [archived, userAddress, profileAddress])
	if (res.affectedRows === 0) throw ERROR_USER_PROFILE_RELATION_NOT_FOUND;
}

export async function deleteUserProfileRelation(profileAddress: string, userAddress: string): Promise<void> {
	const res = await executeQuery('DELETE FROM user_profile_relations WHERE userAddress = ? && profileAddress = ?;', [userAddress, profileAddress]);
	if (res.affectedRows === 0) throw ERROR_USER_PROFILE_RELATION_NOT_FOUND;
}
