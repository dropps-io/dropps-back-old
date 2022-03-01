export const DB_HOST: string = getOrThrow('DB_HOST');
export const DB_NAME: string = getOrThrow('DB_NAME');
export const DB_USER: string = getOrThrow('DB_USER');
export const DB_PASSWORD: string = getOrThrow('DB_PASSWORD');
export const HOST: string = getOrThrow('HOST');

function getOrThrow(name: string) {
	const val = process.env[name];
	if (typeof val === 'undefined') throw new Error(`Missing mandatory environment variable ${name}`);
	return val;
}
