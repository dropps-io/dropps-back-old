CREATE TABLE public.asset (
    address character(42) NOT NULL,
    url character varying NOT NULL,
    "fileType" character varying(10) NOT NULL,
    hash character(66) NOT NULL
);

ALTER TABLE public.asset OWNER TO postgres;

CREATE TABLE public.chain_sync (
    address character(42) NOT NULL,
    "likeChanges" smallint NOT NULL,
    "followChanges" smallint NOT NULL
);

ALTER TABLE public.chain_sync OWNER TO postgres;

CREATE TABLE public.config (
    key character varying NOT NULL,
    value character varying
);

ALTER TABLE public.config OWNER TO postgres;

CREATE TABLE public.contract (
    address character(42) NOT NULL,
    "interfaceCode" character varying
);

ALTER TABLE public.contract OWNER TO postgres;

CREATE TABLE public.contract_interface (
    code character varying NOT NULL,
    id character(10) NOT NULL,
    name character varying NOT NULL
);

ALTER TABLE public.contract_interface OWNER TO postgres;

CREATE TABLE public.contract_metadata (
    address character(42) NOT NULL,
    name character varying NOT NULL,
    symbol character varying NOT NULL,
    description character varying NOT NULL,
    "isNFT" boolean NOT NULL,
    supply character varying NOT NULL
);

ALTER TABLE public.contract_metadata OWNER TO postgres;

CREATE TABLE public.data_changed (
    address character(42) NOT NULL,
    key character(66) NOT NULL,
    value character varying NOT NULL,
    "blockNumber" integer NOT NULL
);

ALTER TABLE public.data_changed OWNER TO postgres;

CREATE TABLE public.decoded_event_parameter (
    "eventId" integer NOT NULL,
    value character varying NOT NULL,
    name character varying NOT NULL,
    type character varying NOT NULL,
    "displayType" character varying
);

ALTER TABLE public.decoded_event_parameter OWNER TO postgres;

CREATE TABLE public.decoded_function_parameter (
    "transactionHash" character(66) NOT NULL,
    value character varying,
    name character varying,
    type character varying,
    "displayType" character varying
);

ALTER TABLE public.decoded_function_parameter OWNER TO postgres;

CREATE SEQUENCE public."decoded_parameter_eventId_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public."decoded_parameter_eventId_seq" OWNER TO postgres;

ALTER SEQUENCE public."decoded_parameter_eventId_seq" OWNED BY public.decoded_event_parameter."eventId";

CREATE TABLE public.erc725y_schema (
    key character(66) NOT NULL,
    name character varying NOT NULL,
    "keyType" character varying NOT NULL,
    "valueType" character varying NOT NULL,
    "valueContent" character varying NOT NULL,
    "valueDisplay" character varying
);

ALTER TABLE public.erc725y_schema OWNER TO postgres;

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

CREATE SEQUENCE public.event_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;

ALTER TABLE public.event_id_seq OWNER TO postgres;

ALTER SEQUENCE public.event_id_seq OWNED BY public.event.id;

CREATE TABLE public.follow (
    follower character(42) NOT NULL,
    following character(42) NOT NULL
);

ALTER TABLE public.follow OWNER TO postgres;

CREATE TABLE public.image (
    address character(42) NOT NULL,
    url character varying NOT NULL,
    width smallint NOT NULL,
    height smallint NOT NULL,
    type character varying NOT NULL,
    hash character(66) NOT NULL
);

ALTER TABLE public.image OWNER TO postgres;

CREATE TABLE public.key_display (
    key character(66) NOT NULL,
    display character varying NOT NULL,
    "displayWithoutValue" character varying NOT NULL
);

ALTER TABLE public.key_display OWNER TO postgres;

CREATE TABLE public."like" (
    sender character(42) NOT NULL,
    "postHash" character(66) NOT NULL
);

ALTER TABLE public."like" OWNER TO postgres;

CREATE TABLE public.link (
    address character(42) NOT NULL,
    title character varying NOT NULL,
    url character varying NOT NULL
);

ALTER TABLE public.link OWNER TO postgres;

CREATE TABLE public.method_display (
    "methodId" character(10) NOT NULL,
    text character varying NOT NULL,
    "imageFrom" character varying,
    "copiesFrom" character varying,
    "standardFrom" character varying
);

ALTER TABLE public.method_display OWNER TO postgres;

CREATE TABLE public.method_interface (
    id character(10) NOT NULL,
    hash character(66) NOT NULL,
    name character varying NOT NULL,
    type character varying NOT NULL
);

ALTER TABLE public.method_interface OWNER TO postgres;

CREATE TABLE public.method_parameter (
    "methodId" character(10) NOT NULL,
    name character varying NOT NULL,
    type character varying NOT NULL,
    indexed boolean NOT NULL,
    "displayType" character varying,
    "position" integer NOT NULL
);

ALTER TABLE public.method_parameter OWNER TO postgres;

CREATE TABLE public.nonces (
    "userAddress" character(42) NOT NULL,
    nonce character(8) NOT NULL
);

ALTER TABLE public.nonces OWNER TO postgres;

CREATE TABLE public.notification (
    address character(42) NOT NULL,
    sender character(42) NOT NULL,
    date timestamp with time zone NOT NULL,
    viewed boolean NOT NULL,
    type character varying NOT NULL,
    "postHash" character(66)
);

ALTER TABLE public.notification OWNER TO postgres;

CREATE TABLE public.post (
    hash character(66) NOT NULL,
    author character(42) NOT NULL,
    date timestamp with time zone NOT NULL,
    text character varying NOT NULL,
    "mediaUrl" character varying NOT NULL,
    "parentHash" character(66),
    "childHash" character(66),
    "eventId" integer,
    "inRegistry" boolean,
    "transactionHash" character(66),
    trusted boolean
);

ALTER TABLE public.post OWNER TO postgres;

CREATE TABLE public.registry_change (
    address character(42) NOT NULL,
    type character varying NOT NULL,
    action character varying NOT NULL,
    value character varying NOT NULL,
    date timestamp with time zone NOT NULL
);

ALTER TABLE public.registry_change OWNER TO postgres;

CREATE TABLE public.tag (
    address character(42) NOT NULL,
    title character varying NOT NULL
);

ALTER TABLE public.tag OWNER TO postgres;

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

ALTER TABLE ONLY public.event ALTER COLUMN id SET DEFAULT nextval('public.event_id_seq'::regclass);

ALTER TABLE ONLY public.config
    ADD CONSTRAINT config_pkey PRIMARY KEY (key);

ALTER TABLE ONLY public.contract_interface
    ADD CONSTRAINT contract_interface_pkey PRIMARY KEY (id);

ALTER TABLE ONLY public.contract_metadata
    ADD CONSTRAINT contract_metadata_pkey PRIMARY KEY (address);

ALTER TABLE ONLY public.contract
    ADD CONSTRAINT contract_pkey PRIMARY KEY (address);

ALTER TABLE ONLY public.data_changed
    ADD CONSTRAINT "data_changed_address_key_value_blockNumber_key" UNIQUE (address, key, value, "blockNumber");

ALTER TABLE ONLY public.decoded_event_parameter
    ADD CONSTRAINT "decoded_parameter_eventId_name_type_key" UNIQUE ("eventId", name, type);

ALTER TABLE ONLY public.erc725y_schema
    ADD CONSTRAINT erc725y_schema_pkey PRIMARY KEY (key);

ALTER TABLE ONLY public.event
    ADD CONSTRAINT event_pkey PRIMARY KEY (id);

ALTER TABLE ONLY public.event
    ADD CONSTRAINT "event_transactionHash_logId_key" UNIQUE ("transactionHash", "logId");

ALTER TABLE ONLY public.follow
    ADD CONSTRAINT follow_follower_following_key UNIQUE (follower, following);

ALTER TABLE ONLY public.image
    ADD CONSTRAINT image_address_url_type_key UNIQUE (address, url, type);

ALTER TABLE ONLY public.key_display
    ADD CONSTRAINT key_display_key_key UNIQUE (key);

ALTER TABLE ONLY public."like"
    ADD CONSTRAINT "like_sender_postHash_key" UNIQUE (sender, "postHash");

ALTER TABLE ONLY public.link
    ADD CONSTRAINT link_address_url_key UNIQUE (address, url);

ALTER TABLE ONLY public.method_interface
    ADD CONSTRAINT method_interface_pkey PRIMARY KEY (id);

ALTER TABLE ONLY public.method_parameter
    ADD CONSTRAINT "method_parameter_position_methodId_key" UNIQUE ("position", "methodId");

ALTER TABLE ONLY public.nonces
    ADD CONSTRAINT "nonces_userAddress_key" UNIQUE ("userAddress");

ALTER TABLE ONLY public.post
    ADD CONSTRAINT post_pkey PRIMARY KEY (hash);

ALTER TABLE ONLY public.tag
    ADD CONSTRAINT tag_address_title_key UNIQUE (address, title);

ALTER TABLE ONLY public.transaction
    ADD CONSTRAINT transaction_pkey PRIMARY KEY (hash);

CREATE UNIQUE INDEX idx_contract_mt_adr ON public.contract_metadata USING btree (address);

CREATE INDEX idx_contract_mt_name ON public.contract_metadata USING btree (name);

ALTER TABLE ONLY public.asset
    ADD CONSTRAINT asset_address_fkey FOREIGN KEY (address) REFERENCES public.contract(address);

ALTER TABLE ONLY public.chain_sync
    ADD CONSTRAINT chain_sync_address_fkey FOREIGN KEY (address) REFERENCES public.contract(address);

ALTER TABLE ONLY public.contract_metadata
    ADD CONSTRAINT contract_metadata_address_fkey FOREIGN KEY (address) REFERENCES public.contract(address) NOT VALID;

ALTER TABLE ONLY public.data_changed
    ADD CONSTRAINT data_changed_address_fkey FOREIGN KEY (address) REFERENCES public.contract(address) NOT VALID;

ALTER TABLE ONLY public.decoded_function_parameter
    ADD CONSTRAINT "decoded_function_parameter_transactionHash_fkey" FOREIGN KEY ("transactionHash") REFERENCES public.transaction(hash);

ALTER TABLE ONLY public.decoded_event_parameter
    ADD CONSTRAINT "decoded_parameter_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES public.event(id) NOT VALID;

ALTER TABLE ONLY public.event
    ADD CONSTRAINT event_address_fkey FOREIGN KEY (address) REFERENCES public.contract(address) NOT VALID;

ALTER TABLE ONLY public.event
    ADD CONSTRAINT "event_transactionHash_fkey" FOREIGN KEY ("transactionHash") REFERENCES public.transaction(hash) NOT VALID;

ALTER TABLE ONLY public.follow
    ADD CONSTRAINT follow_follower_fkey FOREIGN KEY (follower) REFERENCES public.contract(address);

ALTER TABLE ONLY public.follow
    ADD CONSTRAINT follow_following_fkey FOREIGN KEY (following) REFERENCES public.contract(address);

ALTER TABLE ONLY public.image
    ADD CONSTRAINT image_address_fkey FOREIGN KEY (address) REFERENCES public.contract_metadata(address) NOT VALID;

ALTER TABLE ONLY public.key_display
    ADD CONSTRAINT key_display_key_fkey FOREIGN KEY (key) REFERENCES public.erc725y_schema(key) NOT VALID;

ALTER TABLE ONLY public."like"
    ADD CONSTRAINT "like_postHash_fkey" FOREIGN KEY ("postHash") REFERENCES public.post(hash);

ALTER TABLE ONLY public."like"
    ADD CONSTRAINT like_sender_fkey FOREIGN KEY (sender) REFERENCES public.contract(address);

ALTER TABLE ONLY public.link
    ADD CONSTRAINT link_address_fkey FOREIGN KEY (address) REFERENCES public.contract_metadata(address);

ALTER TABLE ONLY public.method_display
    ADD CONSTRAINT "method_display_methodId_fkey" FOREIGN KEY ("methodId") REFERENCES public.method_interface(id);

ALTER TABLE ONLY public.method_parameter
    ADD CONSTRAINT "method_parameter_methodId_fkey" FOREIGN KEY ("methodId") REFERENCES public.method_interface(id) NOT VALID;

ALTER TABLE ONLY public.notification
    ADD CONSTRAINT notification_address_fkey FOREIGN KEY (address) REFERENCES public.contract(address);

ALTER TABLE ONLY public.notification
    ADD CONSTRAINT "notification_postHash_fkey" FOREIGN KEY ("postHash") REFERENCES public.post(hash) NOT VALID;

ALTER TABLE ONLY public.notification
    ADD CONSTRAINT notification_sender_fkey FOREIGN KEY (sender) REFERENCES public.contract(address);

ALTER TABLE ONLY public.post
    ADD CONSTRAINT "post_childHash_fkey" FOREIGN KEY ("childHash") REFERENCES public.post(hash) NOT VALID;

ALTER TABLE ONLY public.post
    ADD CONSTRAINT "post_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES public.event(id) NOT VALID;

ALTER TABLE ONLY public.post
    ADD CONSTRAINT "post_parentHash_fkey" FOREIGN KEY ("parentHash") REFERENCES public.post(hash) NOT VALID;

ALTER TABLE ONLY public.post
    ADD CONSTRAINT post_sender_fkey FOREIGN KEY (author) REFERENCES public.contract(address);

ALTER TABLE ONLY public.registry_change
    ADD CONSTRAINT registry_changes_address_fkey FOREIGN KEY (address) REFERENCES public.contract(address);

ALTER TABLE ONLY public.tag
    ADD CONSTRAINT tag_address_fkey FOREIGN KEY (address) REFERENCES public.contract_metadata(address) NOT VALID;
