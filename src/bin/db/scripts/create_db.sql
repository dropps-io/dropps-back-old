-- PostgreSQL script to create the database

CREATE DATABASE dropps;

USE dropps;

CREATE TABLE users (
  "address" char(42) NOT NULL,
  "selectedProfile" char(42) NOT NULL,
  PRIMARY KEY ("address"),
  UNIQUE ("address")
);

CREATE TABLE user_profile_relations (
  "profileAddress" char(42) NOT NULL,
  "userAddress" char(42) NOT NULL,
  "archived" boolean DEFAULT false,
  FOREIGN KEY ("userAddress") REFERENCES users ("address")
);

CREATE TABLE nonces (
  "userAddress" char(42) NOT NULL,
  "nonce" CHAR(6) NOT NULL,
  UNIQUE ("userAddress"));


CREATE TABLE chain_sync (
    "address" char(42) NOT NULL,
    "likeChanges" smallint NOT NULL,
    "followChanges" smallint NOT NULL
);

CREATE TABLE "contract" (
    "address" char(42) NOT NULL,
    "interfaceCode" varchar
);

CREATE TABLE contract_interface (
    "code" varchar NOT NULL,
    "name" varchar NOT NULL
);

CREATE TABLE contract_metadata (
    "contractAddress" char(42) NOT NULL,
    "name" varchar NOT NULL,
    "symbol" varchar NOT NULL,
    "description" varchar NOT NULL
);

CREATE TABLE decoded_parameter (
    "eventId" integer NOT NULL,
    "value" varchar NOT NULL,
    "name" varchar NOT NULL,
    "type" varchar NOT NULL
);


CREATE SEQUENCE "decoded_parameter_eventId_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE "decoded_parameter_eventId_seq" OWNED BY decoded_parameter."eventId";


CREATE TABLE "event" (
    "id" integer NOT NULL,
    "address" char(42) NOT NULL,
    "transactionHash" char(66) NOT NULL,
    "logId" char(8) NOT NULL,
    "blockNumber" integer NOT NULL,
    "type" varchar NOT NULL
);

CREATE SEQUENCE event_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;

ALTER SEQUENCE event_id_seq OWNED BY event.id;

CREATE TABLE follow (
    "follower" char(42) NOT NULL,
    "following" char(42) NOT NULL
);


CREATE TABLE image (
    "contractAddress" char(42) NOT NULL,
    "url" varchar NOT NULL,
    "width" smallint NOT NULL,
    "height" smallint NOT NULL,
    "type" varchar NOT NULL
);


CREATE TABLE "like" (
    "postHash" char(66) NOT NULL,
    "sender" char(42) NOT NULL
);


CREATE TABLE "link" (
    "contractAddress" char(42) NOT NULL,
    "title" varchar NOT NULL,
    "url" varchar NOT NULL
);

CREATE TABLE "method_interface" (
    "name" varchar NOT NULL,
    "type" varchar NOT NULL,
    "methodId" char(10) NOT NULL,
    "methodHash" char(66) NOT NULL
);


CREATE TABLE method_parameter (
    "methodId" char(10) NOT NULL,
    "name" varchar NOT NULL,
    "type" varchar NOT NULL,
    "indexed" boolean NOT NULL
);


CREATE TABLE "nonces" (
    "userAddress" char(42) NOT NULL,
    "nonce" char(6) NOT NULL
);

CREATE TABLE "post" (
    "postHash" char(66) NOT NULL,
    "sender" char(42) NOT NULL,
    "date" date NOT NULL,
    "text" varchar NOT NULL,
    "mediaUrl" varchar NOT NULL,
    "parentHash" char(66),
    "childHash" char(66),
    "eventId" integer
);


CREATE TABLE "tag" (
    "contractAddress" char(42) NOT NULL,
    "title" varchar NOT NULL
);

CREATE TABLE "user_profile_relations" (
    "profileAddress" char(42) NOT NULL,
    "userAddress" char(42) NOT NULL,
    "archived" boolean DEFAULT false
);

CREATE TABLE "users" (
    "address" char(42) NOT NULL,
    "selectedProfile" char(42) NOT NULL
);

ALTER TABLE ONLY event ALTER COLUMN id SET DEFAULT nextval('event_id_seq'::regclass);

ALTER TABLE ONLY contract_interface
    ADD CONSTRAINT "contract-interface_pkey" PRIMARY KEY (code);

ALTER TABLE ONLY contract_metadata
    ADD CONSTRAINT contract_metadata_pkey PRIMARY KEY ("contractAddress");

ALTER TABLE ONLY contract
    ADD CONSTRAINT contract_pkey PRIMARY KEY (address);

ALTER TABLE ONLY event
    ADD CONSTRAINT event_pkey PRIMARY KEY (id);

ALTER TABLE ONLY method_interface
    ADD CONSTRAINT method_interface_pkey PRIMARY KEY ("methodId");

ALTER TABLE ONLY nonces
    ADD CONSTRAINT "nonces_userAddress_key" UNIQUE ("userAddress");

ALTER TABLE ONLY post
    ADD CONSTRAINT post_pkey PRIMARY KEY ("postHash");

ALTER TABLE ONLY users
    ADD CONSTRAINT users_pkey PRIMARY KEY (address);

ALTER TABLE ONLY chain_sync
    ADD CONSTRAINT chain_sync_address_fkey FOREIGN KEY (address) REFERENCES contract(address);

ALTER TABLE ONLY contract_metadata
    ADD CONSTRAINT "contract_metadata_contractAddress_fkey" FOREIGN KEY ("contractAddress") REFERENCES contract(address) NOT VALID;

ALTER TABLE ONLY decoded_parameter
    ADD CONSTRAINT "decoded_parameter_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES event(id) NOT VALID;

ALTER TABLE ONLY event
    ADD CONSTRAINT event_address_fkey FOREIGN KEY (address) REFERENCES contract(address) NOT VALID;

ALTER TABLE ONLY follow
    ADD CONSTRAINT follow_follower_fkey FOREIGN KEY (follower) REFERENCES contract(address);

ALTER TABLE ONLY follow
    ADD CONSTRAINT follow_following_fkey FOREIGN KEY (following) REFERENCES contract(address);

ALTER TABLE ONLY image
    ADD CONSTRAINT "image_contractAddress_fkey" FOREIGN KEY ("contractAddress") REFERENCES contract_metadata("contractAddress") NOT VALID;

ALTER TABLE ONLY contract
    ADD CONSTRAINT interface FOREIGN KEY ("interfaceCode") REFERENCES contract_interface(code) NOT VALID;

ALTER TABLE ONLY "like"
    ADD CONSTRAINT "like_postHash_fkey" FOREIGN KEY ("postHash") REFERENCES post("postHash");

ALTER TABLE ONLY "like"
    ADD CONSTRAINT like_sender_fkey FOREIGN KEY (sender) REFERENCES contract(address);

ALTER TABLE ONLY link
    ADD CONSTRAINT "link_contractAddress_fkey" FOREIGN KEY ("contractAddress") REFERENCES contract_metadata("contractAddress");

ALTER TABLE ONLY method_parameter
    ADD CONSTRAINT "method_parameter_methodId_fkey" FOREIGN KEY ("methodId") REFERENCES method_interface("methodId") NOT VALID;

ALTER TABLE ONLY post
    ADD CONSTRAINT "post_childHash_fkey" FOREIGN KEY ("childHash") REFERENCES post("postHash") NOT VALID;

ALTER TABLE ONLY post
    ADD CONSTRAINT "post_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES event(id) NOT VALID;

ALTER TABLE ONLY post
    ADD CONSTRAINT "post_parentHash_fkey" FOREIGN KEY ("parentHash") REFERENCES post("postHash") NOT VALID;

ALTER TABLE ONLY post
    ADD CONSTRAINT post_sender_fkey FOREIGN KEY (sender) REFERENCES contract(address);


ALTER TABLE ONLY tag
    ADD CONSTRAINT "tag_contractAddress_fkey" FOREIGN KEY ("contractAddress") REFERENCES contract_metadata("contractAddress") NOT VALID;

ALTER TABLE ONLY user_profile_relations
    ADD CONSTRAINT "user_profile_relations_userAddress_fkey" FOREIGN KEY ("userAddress") REFERENCES users(address);


