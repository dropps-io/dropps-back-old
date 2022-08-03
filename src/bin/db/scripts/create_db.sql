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
                                          supply integer NOT NULL
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
-- Name: decoded_parameter; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.decoded_parameter (
                                          "eventId" integer NOT NULL,
                                          value character varying NOT NULL,
                                          name character varying NOT NULL,
                                          type character varying NOT NULL
);


ALTER TABLE public.decoded_parameter OWNER TO postgres;

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
-- TOC entry 3437 (class 0 OID 0)
-- Dependencies: 214
-- Name: decoded_parameter_eventId_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public."decoded_parameter_eventId_seq" OWNED BY public.decoded_parameter."eventId";


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
-- TOC entry 3438 (class 0 OID 0)
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
                              type character varying NOT NULL
);


ALTER TABLE public.image OWNER TO postgres;

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
                                         indexed boolean NOT NULL
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
                                    "to" character(42) NOT NULL,
                                    value character varying NOT NULL,
                                    input character varying NOT NULL,
                                    "blockNumber" integer NOT NULL
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
-- TOC entry 3237 (class 2604 OID 18412)
-- Name: event id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.event ALTER COLUMN id SET DEFAULT nextval('public.event_id_seq'::regclass);


--
-- TOC entry 3242 (class 2606 OID 18414)
-- Name: contract_interface contract-interface_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.contract_interface
    ADD CONSTRAINT "contract-interface_pkey" PRIMARY KEY (code);


--
-- TOC entry 3244 (class 2606 OID 18416)
-- Name: contract_metadata contract_metadata_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.contract_metadata
    ADD CONSTRAINT contract_metadata_pkey PRIMARY KEY (address);


--
-- TOC entry 3240 (class 2606 OID 18418)
-- Name: contract contract_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.contract
    ADD CONSTRAINT contract_pkey PRIMARY KEY (address);


--
-- TOC entry 3246 (class 2606 OID 18344)
-- Name: decoded_parameter decoded_parameter_eventId_name_type_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.decoded_parameter
    ADD CONSTRAINT "decoded_parameter_eventId_name_type_key" UNIQUE ("eventId", name, type);


--
-- TOC entry 3248 (class 2606 OID 18420)
-- Name: event event_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.event
    ADD CONSTRAINT event_pkey PRIMARY KEY (id);


--
-- TOC entry 3250 (class 2606 OID 18352)
-- Name: event event_transactionHash_logId_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.event
    ADD CONSTRAINT "event_transactionHash_logId_key" UNIQUE ("transactionHash", "logId");


--
-- TOC entry 3252 (class 2606 OID 18358)
-- Name: follow follow_follower_following_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.follow
    ADD CONSTRAINT follow_follower_following_key UNIQUE (follower, following);


--
-- TOC entry 3254 (class 2606 OID 18365)
-- Name: image image_address_url_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.image
    ADD CONSTRAINT image_address_url_key UNIQUE (address, url);


--
-- TOC entry 3256 (class 2606 OID 18370)
-- Name: like like_sender_postHash_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."like"
    ADD CONSTRAINT "like_sender_postHash_key" UNIQUE (sender, "postHash");


--
-- TOC entry 3258 (class 2606 OID 18377)
-- Name: link link_address_url_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.link
    ADD CONSTRAINT link_address_url_key UNIQUE (address, url);


--
-- TOC entry 3260 (class 2606 OID 18422)
-- Name: method_interface method_interface_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.method_interface
    ADD CONSTRAINT method_interface_pkey PRIMARY KEY (id);


--
-- TOC entry 3262 (class 2606 OID 18389)
-- Name: method_parameter method_parameter_methodId_name_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.method_parameter
    ADD CONSTRAINT "method_parameter_methodId_name_key" UNIQUE ("methodId", name);


--
-- TOC entry 3264 (class 2606 OID 18424)
-- Name: nonces nonces_userAddress_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.nonces
    ADD CONSTRAINT "nonces_userAddress_key" UNIQUE ("userAddress");


--
-- TOC entry 3266 (class 2606 OID 18426)
-- Name: post post_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.post
    ADD CONSTRAINT post_pkey PRIMARY KEY (hash);


--
-- TOC entry 3268 (class 2606 OID 18404)
-- Name: tag tag_address_title_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.tag
    ADD CONSTRAINT tag_address_title_key UNIQUE (address, title);


--
-- TOC entry 3272 (class 2606 OID 18598)
-- Name: transaction transaction_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.transaction
    ADD CONSTRAINT transaction_pkey PRIMARY KEY (hash);


--
-- TOC entry 3270 (class 2606 OID 18428)
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (address);


--
-- TOC entry 3273 (class 2606 OID 18429)
-- Name: chain_sync chain_sync_address_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.chain_sync
    ADD CONSTRAINT chain_sync_address_fkey FOREIGN KEY (address) REFERENCES public.contract(address);


--
-- TOC entry 3275 (class 2606 OID 18434)
-- Name: contract_metadata contract_metadata_address_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.contract_metadata
    ADD CONSTRAINT contract_metadata_address_fkey FOREIGN KEY (address) REFERENCES public.contract(address) NOT VALID;


--
-- TOC entry 3292 (class 2606 OID 18605)
-- Name: data_changed data_changed_address_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.data_changed
    ADD CONSTRAINT data_changed_address_fkey FOREIGN KEY (address) REFERENCES public.contract(address) NOT VALID;


--
-- TOC entry 3276 (class 2606 OID 18439)
-- Name: decoded_parameter decoded_parameter_eventId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.decoded_parameter
    ADD CONSTRAINT "decoded_parameter_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES public.event(id) NOT VALID;


--
-- TOC entry 3277 (class 2606 OID 18444)
-- Name: event event_address_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.event
    ADD CONSTRAINT event_address_fkey FOREIGN KEY (address) REFERENCES public.contract(address) NOT VALID;


--
-- TOC entry 3278 (class 2606 OID 18610)
-- Name: event event_transactionHash_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.event
    ADD CONSTRAINT "event_transactionHash_fkey" FOREIGN KEY ("transactionHash") REFERENCES public.transaction(hash) NOT VALID;


--
-- TOC entry 3279 (class 2606 OID 18449)
-- Name: follow follow_follower_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.follow
    ADD CONSTRAINT follow_follower_fkey FOREIGN KEY (follower) REFERENCES public.contract(address);


--
-- TOC entry 3280 (class 2606 OID 18454)
-- Name: follow follow_following_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.follow
    ADD CONSTRAINT follow_following_fkey FOREIGN KEY (following) REFERENCES public.contract(address);


--
-- TOC entry 3281 (class 2606 OID 18459)
-- Name: image image_address_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.image
    ADD CONSTRAINT image_address_fkey FOREIGN KEY (address) REFERENCES public.contract_metadata(address) NOT VALID;


--
-- TOC entry 3274 (class 2606 OID 18464)
-- Name: contract interface; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.contract
    ADD CONSTRAINT interface FOREIGN KEY ("interfaceCode") REFERENCES public.contract_interface(code) NOT VALID;


--
-- TOC entry 3282 (class 2606 OID 18469)
-- Name: like like_postHash_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."like"
    ADD CONSTRAINT "like_postHash_fkey" FOREIGN KEY ("postHash") REFERENCES public.post(hash);


--
-- TOC entry 3283 (class 2606 OID 18474)
-- Name: like like_sender_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."like"
    ADD CONSTRAINT like_sender_fkey FOREIGN KEY (sender) REFERENCES public.contract(address);


--
-- TOC entry 3284 (class 2606 OID 18479)
-- Name: link link_address_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.link
    ADD CONSTRAINT link_address_fkey FOREIGN KEY (address) REFERENCES public.contract_metadata(address);


--
-- TOC entry 3285 (class 2606 OID 18484)
-- Name: method_parameter method_parameter_methodId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.method_parameter
    ADD CONSTRAINT "method_parameter_methodId_fkey" FOREIGN KEY ("methodId") REFERENCES public.method_interface(id) NOT VALID;


--
-- TOC entry 3286 (class 2606 OID 18489)
-- Name: post post_childHash_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.post
    ADD CONSTRAINT "post_childHash_fkey" FOREIGN KEY ("childHash") REFERENCES public.post(hash) NOT VALID;


--
-- TOC entry 3287 (class 2606 OID 18494)
-- Name: post post_eventId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.post
    ADD CONSTRAINT "post_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES public.event(id) NOT VALID;


--
-- TOC entry 3288 (class 2606 OID 18499)
-- Name: post post_parentHash_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.post
    ADD CONSTRAINT "post_parentHash_fkey" FOREIGN KEY ("parentHash") REFERENCES public.post(hash) NOT VALID;


--
-- TOC entry 3289 (class 2606 OID 18504)
-- Name: post post_sender_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.post
    ADD CONSTRAINT post_sender_fkey FOREIGN KEY (author) REFERENCES public.contract(address);


--
-- TOC entry 3290 (class 2606 OID 18509)
-- Name: tag tag_address_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.tag
    ADD CONSTRAINT tag_address_fkey FOREIGN KEY (address) REFERENCES public.contract_metadata(address) NOT VALID;


--
-- TOC entry 3291 (class 2606 OID 18514)
-- Name: user_profile_relations user_profile_relations_userAddress_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_profile_relations
    ADD CONSTRAINT "user_profile_relations_userAddress_fkey" FOREIGN KEY ("userAddress") REFERENCES public.users(address);


-- Completed on 2022-08-03 12:26:34

--
-- PostgreSQL database dump complete
--

