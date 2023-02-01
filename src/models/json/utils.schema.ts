export const ADDRESS_SCHEMA_VALIDATION = {
	type: 'string',
	pattern: '^0x[a-fA-F0-9]{40}$',
	description: '20bytes address'
};

export const HASH_SCHEMA_VALIDATION = {
	type: 'string',
	pattern: '^0x[a-fA-F0-9]{64}$',
	description: '32bytes hash'
};

export const PAGE_SCHEMA_VALIDATION = { type: 'number', minimum: 0, description: 'Content page to reach' };

export const POST_TYPE_SCHEMA_VALIDATION = { enum: ['post', 'event'], description: 'Feed filter' };