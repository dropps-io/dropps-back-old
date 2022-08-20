--
-- PostgreSQL database dump
--

-- Dumped from database version 14.4
-- Dumped by pg_dump version 14.4

-- Started on 2022-08-20 14:59:36

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- TOC entry 230 (class 1259 OID 33237)
-- Name: asset; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.asset (
    address character(42) NOT NULL,
    url character varying NOT NULL,
    "fileType" character varying(10) NOT NULL,
    hash character(66) NOT NULL
);


ALTER TABLE public.asset OWNER TO postgres;

--
-- TOC entry 209 (class 1259 OID 18320)
-- Name: chain_sync; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.chain_sync (
    address character(42) NOT NULL,
    "likeChanges" smallint NOT NULL,
    "followChanges" smallint NOT NULL
);


ALTER TABLE public.chain_sync OWNER TO postgres;

--
-- TOC entry 210 (class 1259 OID 18323)
-- Name: contract; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.contract (
    address character(42) NOT NULL,
    "interfaceCode" character varying
);


ALTER TABLE public.contract OWNER TO postgres;

--
-- TOC entry 211 (class 1259 OID 18328)
-- Name: contract_interface; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.contract_interface (
    code character varying NOT NULL,
    id character(10) NOT NULL,
    name character varying NOT NULL
);


ALTER TABLE public.contract_interface OWNER TO postgres;

--
-- TOC entry 212 (class 1259 OID 18333)
-- Name: contract_metadata; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.contract_metadata (
    address character(42) NOT NULL,
    name character varying NOT NULL,
    symbol character varying NOT NULL,
    description character varying NOT NULL,
    "isNFT" boolean NOT NULL,
    supply character varying NOT NULL
);


ALTER TABLE public.contract_metadata OWNER TO postgres;

--
-- TOC entry 229 (class 1259 OID 18600)
-- Name: data_changed; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.data_changed (
    address character(42) NOT NULL,
    key character(66) NOT NULL,
    value character varying NOT NULL,
    "blockNumber" integer NOT NULL
);


ALTER TABLE public.data_changed OWNER TO postgres;

--
-- TOC entry 213 (class 1259 OID 18338)
-- Name: decoded_event_parameter; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.decoded_event_parameter (
    "eventId" integer NOT NULL,
    value character varying NOT NULL,
    name character varying NOT NULL,
    type character varying NOT NULL,
    "displayType" character varying
);


ALTER TABLE public.decoded_event_parameter OWNER TO postgres;

--
-- TOC entry 232 (class 1259 OID 108673)
-- Name: decoded_function_parameter; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.decoded_function_parameter (
    "transactionHash" character(66) NOT NULL,
    value character varying,
    name character varying,
    type character varying,
    "displayType" character varying
);


ALTER TABLE public.decoded_function_parameter OWNER TO postgres;

--
-- TOC entry 214 (class 1259 OID 18345)
-- Name: decoded_parameter_eventId_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public."decoded_parameter_eventId_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public."decoded_parameter_eventId_seq" OWNER TO postgres;

--
-- TOC entry 3474 (class 0 OID 0)
-- Dependencies: 214
-- Name: decoded_parameter_eventId_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public."decoded_parameter_eventId_seq" OWNED BY public.decoded_event_parameter."eventId";


--
-- TOC entry 235 (class 1259 OID 144640)
-- Name: erc725y_schema; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.erc725y_schema (
    key character(66) NOT NULL,
    name character varying NOT NULL,
    "keyType" character varying NOT NULL,
    "valueType" character varying NOT NULL,
    "valueContent" character varying NOT NULL,
    "displayValueType" character varying
);


ALTER TABLE public.erc725y_schema OWNER TO postgres;

--
-- TOC entry 215 (class 1259 OID 18346)
-- Name: event; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.event (
    id integer NOT NULL,
    address character(42) NOT NULL,
    "transactionHash" character(66) NOT NULL,
    "logId" character(8) NOT NULL,
    "blockNumber" integer NOT NULL,
    topic character(66) NOT NULL,
    type character varying NOT NULL
);


ALTER TABLE public.event OWNER TO postgres;

--
-- TOC entry 216 (class 1259 OID 18353)
-- Name: event_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.event_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.event_id_seq OWNER TO postgres;

--
-- TOC entry 3475 (class 0 OID 0)
-- Dependencies: 216
-- Name: event_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.event_id_seq OWNED BY public.event.id;


--
-- TOC entry 217 (class 1259 OID 18354)
-- Name: follow; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.follow (
    follower character(42) NOT NULL,
    following character(42) NOT NULL
);


ALTER TABLE public.follow OWNER TO postgres;

--
-- TOC entry 218 (class 1259 OID 18359)
-- Name: image; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.image (
    address character(42) NOT NULL,
    url character varying NOT NULL,
    width smallint NOT NULL,
    height smallint NOT NULL,
    type character varying NOT NULL,
    hash character(66) NOT NULL
);


ALTER TABLE public.image OWNER TO postgres;

--
-- TOC entry 233 (class 1259 OID 144317)
-- Name: key_display; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.key_display (
    key character(66) NOT NULL,
    display character varying NOT NULL,
    "displayWithoutValue" character varying NOT NULL
);


ALTER TABLE public.key_display OWNER TO postgres;

--
-- TOC entry 219 (class 1259 OID 18366)
-- Name: like; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."like" (
    sender character(42) NOT NULL,
    "postHash" character(66) NOT NULL
);


ALTER TABLE public."like" OWNER TO postgres;

--
-- TOC entry 220 (class 1259 OID 18371)
-- Name: link; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.link (
    address character(42) NOT NULL,
    title character varying NOT NULL,
    url character varying NOT NULL
);


ALTER TABLE public.link OWNER TO postgres;

--
-- TOC entry 231 (class 1259 OID 108663)
-- Name: method_display; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.method_display (
    "methodId" character(10) NOT NULL,
    text character varying NOT NULL,
    "imageFrom" character varying,
    "copiesFrom" character varying,
    "standardFrom" character varying
);


ALTER TABLE public.method_display OWNER TO postgres;

--
-- TOC entry 221 (class 1259 OID 18378)
-- Name: method_interface; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.method_interface (
    id character(10) NOT NULL,
    hash character(66) NOT NULL,
    name character varying NOT NULL,
    type character varying NOT NULL
);


ALTER TABLE public.method_interface OWNER TO postgres;

--
-- TOC entry 222 (class 1259 OID 18383)
-- Name: method_parameter; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.method_parameter (
    "methodId" character(10) NOT NULL,
    name character varying NOT NULL,
    type character varying NOT NULL,
    indexed boolean NOT NULL,
    "displayType" character varying
);


ALTER TABLE public.method_parameter OWNER TO postgres;

--
-- TOC entry 223 (class 1259 OID 18390)
-- Name: nonces; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.nonces (
    "userAddress" character(42) NOT NULL,
    nonce character(6) NOT NULL
);


ALTER TABLE public.nonces OWNER TO postgres;

--
-- TOC entry 234 (class 1259 OID 144322)
-- Name: notification; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.notification (
    address character(42) NOT NULL,
    date date NOT NULL,
    sender character(42) NOT NULL,
    "postHash" character(66)
);


ALTER TABLE public.notification OWNER TO postgres;

--
-- TOC entry 224 (class 1259 OID 18393)
-- Name: post; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.post (
    hash character(66) NOT NULL,
    author character(42) NOT NULL,
    date timestamp with time zone NOT NULL,
    text character varying NOT NULL,
    "mediaUrl" character varying NOT NULL,
    "parentHash" character(66),
    "childHash" character(66),
    "eventId" integer
);


ALTER TABLE public.post OWNER TO postgres;

--
-- TOC entry 225 (class 1259 OID 18398)
-- Name: tag; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.tag (
    address character(42) NOT NULL,
    title character varying NOT NULL
);


ALTER TABLE public.tag OWNER TO postgres;

--
-- TOC entry 228 (class 1259 OID 18592)
-- Name: transaction; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.transaction (
    hash character(66) NOT NULL,
    "from" character(42) NOT NULL,
    "to" character(42),
    value character varying NOT NULL,
    input character varying NOT NULL,
    "blockNumber" integer NOT NULL,
    "methodId" character(10) NOT NULL
);


ALTER TABLE public.transaction OWNER TO postgres;

--
-- TOC entry 226 (class 1259 OID 18405)
-- Name: user_profile_relations; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.user_profile_relations (
    "profileAddress" character(42) NOT NULL,
    "userAddress" character(42) NOT NULL,
    archived boolean DEFAULT false
);


ALTER TABLE public.user_profile_relations OWNER TO postgres;

--
-- TOC entry 227 (class 1259 OID 18409)
-- Name: users; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.users (
    address character(42) NOT NULL,
    "selectedProfile" character(42) NOT NULL
);


ALTER TABLE public.users OWNER TO postgres;

--
-- TOC entry 3261 (class 2604 OID 18412)
-- Name: event id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.event ALTER COLUMN id SET DEFAULT nextval('public.event_id_seq'::regclass);


--
-- TOC entry 3266 (class 2606 OID 18414)
-- Name: contract_interface contract-interface_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.contract_interface
    ADD CONSTRAINT "contract-interface_pkey" PRIMARY KEY (code);


--
-- TOC entry 3268 (class 2606 OID 18416)
-- Name: contract_metadata contract_metadata_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.contract_metadata
    ADD CONSTRAINT contract_metadata_pkey PRIMARY KEY (address);


--
-- TOC entry 3264 (class 2606 OID 18418)
-- Name: contract contract_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.contract
    ADD CONSTRAINT contract_pkey PRIMARY KEY (address);


--
-- TOC entry 3298 (class 2606 OID 19780)
-- Name: data_changed data_changed_address_key_value_blockNumber_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.data_changed
    ADD CONSTRAINT "data_changed_address_key_value_blockNumber_key" UNIQUE (address, key, value, "blockNumber");


--
-- TOC entry 3270 (class 2606 OID 18344)
-- Name: decoded_event_parameter decoded_parameter_eventId_name_type_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.decoded_event_parameter
    ADD CONSTRAINT "decoded_parameter_eventId_name_type_key" UNIQUE ("eventId", name, type);


--
-- TOC entry 3302 (class 2606 OID 144651)
-- Name: erc725y_schema erc725y_schema_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.erc725y_schema
    ADD CONSTRAINT erc725y_schema_pkey PRIMARY KEY (key);


--
-- TOC entry 3272 (class 2606 OID 18420)
-- Name: event event_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.event
    ADD CONSTRAINT event_pkey PRIMARY KEY (id);


--
-- TOC entry 3274 (class 2606 OID 18352)
-- Name: event event_transactionHash_logId_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.event
    ADD CONSTRAINT "event_transactionHash_logId_key" UNIQUE ("transactionHash", "logId");


--
-- TOC entry 3276 (class 2606 OID 18358)
-- Name: follow follow_follower_following_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.follow
    ADD CONSTRAINT follow_follower_following_key UNIQUE (follower, following);


--
-- TOC entry 3278 (class 2606 OID 18365)
-- Name: image image_address_url_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.image
    ADD CONSTRAINT image_address_url_key UNIQUE (address, url);


--
-- TOC entry 3300 (class 2606 OID 144654)
-- Name: key_display key_display_key_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.key_display
    ADD CONSTRAINT key_display_key_key UNIQUE (key);


--
-- TOC entry 3280 (class 2606 OID 18370)
-- Name: like like_sender_postHash_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."like"
    ADD CONSTRAINT "like_sender_postHash_key" UNIQUE (sender, "postHash");


--
-- TOC entry 3282 (class 2606 OID 18377)
-- Name: link link_address_url_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.link
    ADD CONSTRAINT link_address_url_key UNIQUE (address, url);


--
-- TOC entry 3284 (class 2606 OID 18422)
-- Name: method_interface method_interface_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.method_interface
    ADD CONSTRAINT method_interface_pkey PRIMARY KEY (id);


--
-- TOC entry 3286 (class 2606 OID 18389)
-- Name: method_parameter method_parameter_methodId_name_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.method_parameter
    ADD CONSTRAINT "method_parameter_methodId_name_key" UNIQUE ("methodId", name);


--
-- TOC entry 3288 (class 2606 OID 18424)
-- Name: nonces nonces_userAddress_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.nonces
    ADD CONSTRAINT "nonces_userAddress_key" UNIQUE ("userAddress");


--
-- TOC entry 3290 (class 2606 OID 18426)
-- Name: post post_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.post
    ADD CONSTRAINT post_pkey PRIMARY KEY (hash);


--
-- TOC entry 3292 (class 2606 OID 18404)
-- Name: tag tag_address_title_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.tag
    ADD CONSTRAINT tag_address_title_key UNIQUE (address, title);


--
-- TOC entry 3296 (class 2606 OID 18598)
-- Name: transaction transaction_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.transaction
    ADD CONSTRAINT transaction_pkey PRIMARY KEY (hash);


--
-- TOC entry 3294 (class 2606 OID 18428)
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (address);


--
-- TOC entry 3323 (class 2606 OID 33242)
-- Name: asset asset_address_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.asset
    ADD CONSTRAINT asset_address_fkey FOREIGN KEY (address) REFERENCES public.contract(address);


--
-- TOC entry 3303 (class 2606 OID 18429)
-- Name: chain_sync chain_sync_address_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.chain_sync
    ADD CONSTRAINT chain_sync_address_fkey FOREIGN KEY (address) REFERENCES public.contract(address);


--
-- TOC entry 3305 (class 2606 OID 18434)
-- Name: contract_metadata contract_metadata_address_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.contract_metadata
    ADD CONSTRAINT contract_metadata_address_fkey FOREIGN KEY (address) REFERENCES public.contract(address) NOT VALID;


--
-- TOC entry 3322 (class 2606 OID 18605)
-- Name: data_changed data_changed_address_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.data_changed
    ADD CONSTRAINT data_changed_address_fkey FOREIGN KEY (address) REFERENCES public.contract(address) NOT VALID;


--
-- TOC entry 3325 (class 2606 OID 108678)
-- Name: decoded_function_parameter decoded_function_parameter_transactionHash_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.decoded_function_parameter
    ADD CONSTRAINT "decoded_function_parameter_transactionHash_fkey" FOREIGN KEY ("transactionHash") REFERENCES public.transaction(hash);


--
-- TOC entry 3306 (class 2606 OID 18439)
-- Name: decoded_event_parameter decoded_parameter_eventId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.decoded_event_parameter
    ADD CONSTRAINT "decoded_parameter_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES public.event(id) NOT VALID;


--
-- TOC entry 3307 (class 2606 OID 18444)
-- Name: event event_address_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.event
    ADD CONSTRAINT event_address_fkey FOREIGN KEY (address) REFERENCES public.contract(address) NOT VALID;


--
-- TOC entry 3308 (class 2606 OID 18610)
-- Name: event event_transactionHash_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.event
    ADD CONSTRAINT "event_transactionHash_fkey" FOREIGN KEY ("transactionHash") REFERENCES public.transaction(hash) NOT VALID;


--
-- TOC entry 3309 (class 2606 OID 18449)
-- Name: follow follow_follower_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.follow
    ADD CONSTRAINT follow_follower_fkey FOREIGN KEY (follower) REFERENCES public.contract(address);


--
-- TOC entry 3310 (class 2606 OID 18454)
-- Name: follow follow_following_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.follow
    ADD CONSTRAINT follow_following_fkey FOREIGN KEY (following) REFERENCES public.contract(address);


--
-- TOC entry 3311 (class 2606 OID 18459)
-- Name: image image_address_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.image
    ADD CONSTRAINT image_address_fkey FOREIGN KEY (address) REFERENCES public.contract_metadata(address) NOT VALID;


--
-- TOC entry 3304 (class 2606 OID 18464)
-- Name: contract interface; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.contract
    ADD CONSTRAINT interface FOREIGN KEY ("interfaceCode") REFERENCES public.contract_interface(code) NOT VALID;


--
-- TOC entry 3326 (class 2606 OID 144655)
-- Name: key_display key_display_key_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.key_display
    ADD CONSTRAINT key_display_key_fkey FOREIGN KEY (key) REFERENCES public.erc725y_schema(key) NOT VALID;


--
-- TOC entry 3312 (class 2606 OID 18469)
-- Name: like like_postHash_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."like"
    ADD CONSTRAINT "like_postHash_fkey" FOREIGN KEY ("postHash") REFERENCES public.post(hash);


--
-- TOC entry 3313 (class 2606 OID 18474)
-- Name: like like_sender_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."like"
    ADD CONSTRAINT like_sender_fkey FOREIGN KEY (sender) REFERENCES public.contract(address);


--
-- TOC entry 3314 (class 2606 OID 18479)
-- Name: link link_address_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.link
    ADD CONSTRAINT link_address_fkey FOREIGN KEY (address) REFERENCES public.contract_metadata(address);


--
-- TOC entry 3324 (class 2606 OID 108668)
-- Name: method_display method_display_methodId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.method_display
    ADD CONSTRAINT "method_display_methodId_fkey" FOREIGN KEY ("methodId") REFERENCES public.method_interface(id);


--
-- TOC entry 3315 (class 2606 OID 18484)
-- Name: method_parameter method_parameter_methodId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.method_parameter
    ADD CONSTRAINT "method_parameter_methodId_fkey" FOREIGN KEY ("methodId") REFERENCES public.method_interface(id) NOT VALID;


--
-- TOC entry 3327 (class 2606 OID 144325)
-- Name: notification notification_address_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.notification
    ADD CONSTRAINT notification_address_fkey FOREIGN KEY (address) REFERENCES public.contract(address);


--
-- TOC entry 3329 (class 2606 OID 144335)
-- Name: notification notification_postHash_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.notification
    ADD CONSTRAINT "notification_postHash_fkey" FOREIGN KEY ("postHash") REFERENCES public.post(hash);


--
-- TOC entry 3328 (class 2606 OID 144330)
-- Name: notification notification_sender_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.notification
    ADD CONSTRAINT notification_sender_fkey FOREIGN KEY (sender) REFERENCES public.contract(address);


--
-- TOC entry 3316 (class 2606 OID 18489)
-- Name: post post_childHash_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.post
    ADD CONSTRAINT "post_childHash_fkey" FOREIGN KEY ("childHash") REFERENCES public.post(hash) NOT VALID;


--
-- TOC entry 3317 (class 2606 OID 18494)
-- Name: post post_eventId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.post
    ADD CONSTRAINT "post_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES public.event(id) NOT VALID;


--
-- TOC entry 3318 (class 2606 OID 18499)
-- Name: post post_parentHash_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.post
    ADD CONSTRAINT "post_parentHash_fkey" FOREIGN KEY ("parentHash") REFERENCES public.post(hash) NOT VALID;


--
-- TOC entry 3319 (class 2606 OID 18504)
-- Name: post post_sender_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.post
    ADD CONSTRAINT post_sender_fkey FOREIGN KEY (author) REFERENCES public.contract(address);


--
-- TOC entry 3320 (class 2606 OID 18509)
-- Name: tag tag_address_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.tag
    ADD CONSTRAINT tag_address_fkey FOREIGN KEY (address) REFERENCES public.contract_metadata(address) NOT VALID;


--
-- TOC entry 3321 (class 2606 OID 18514)
-- Name: user_profile_relations user_profile_relations_userAddress_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_profile_relations
    ADD CONSTRAINT "user_profile_relations_userAddress_fkey" FOREIGN KEY ("userAddress") REFERENCES public.users(address);


-- Completed on 2022-08-20 14:59:36

--
-- PostgreSQL database dump complete
--

