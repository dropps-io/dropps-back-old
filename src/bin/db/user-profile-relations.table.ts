import {executeQuery} from './database';
import {UserProfileRelation} from '../../lib/models/types/user-profile-relation';
import {ERROR_USER_PROFILE_RELATION_NOT_FOUND} from '../utils/error-messages';
import {UserProfile} from '../../lib/models/types/user-profile';

export async function queryUserProfileRelation(profileAddress: string, userAddress: string): Promise<UserProfileRelation> {
	const res = await executeQuery('SELECT * FROM "user_profile_relations" WHERE "userAddress" = $1 AND "profileAddress" = $1', [userAddress, profileAddress]);
	if (res.rows[0]) return res.rows[0] as UserProfileRelation;
	else throw ERROR_USER_PROFILE_RELATION_NOT_FOUND;
}

export async function queryProfilesOfUser(userAddress: string): Promise<UserProfile[]> {
	const res = await executeQuery('SELECT * FROM "user_profile_relations" WHERE "userAddress" = $1', [userAddress]);
	const profiles: UserProfile[] = [];
	res.rows.forEach((r: UserProfileRelation) => {
		profiles.push({profileAddress: r.profileAddress, archived: r.archived});
	});
	return profiles;
}

export async function queryUsersOfProfile(profileAddress: string): Promise<string[]> {
	const res = await executeQuery('SELECT * FROM "user_profile_relations" WHERE "profileAddress" = $1', [profileAddress]);
	const users: string[] = [];
	res.rows.forEach((r: UserProfileRelation) => {
		users.push(r.userAddress);
	});
	return users;
}

export async function insertUserProfileRelation(profileAddress: string, userAddress: string, archived: boolean): Promise<UserProfileRelation> {
	const res = await executeQuery('INSERT INTO "user_profile_relations" VALUES ($1, $2, $3)',[profileAddress, userAddress, archived]);
	return res[0] as UserProfileRelation;
}

export async function updateUserProfileRelation(profileAddress: string, userAddress: string, archived: boolean): Promise<void> {
	const res = await executeQuery('UPDATE "user_profile_relations" SET "archived" = $1 WHERE "userAddress" = $2 AND "profileAddress" = $3', [archived, userAddress, profileAddress]);
	if (res.rowCount === 0) throw ERROR_USER_PROFILE_RELATION_NOT_FOUND;
}

export async function deleteUserProfileRelation(profileAddress: string, userAddress: string): Promise<void> {
	const res = await executeQuery('DELETE FROM "user_profile_relations" WHERE "userAddress" = $1 AND "profileAddress" = $2', [userAddress, profileAddress]);
	if (res.rowCount === 0) throw ERROR_USER_PROFILE_RELATION_NOT_FOUND;
}
