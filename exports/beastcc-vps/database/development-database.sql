--
-- PostgreSQL database dump
--

\restrict z3zpvzI93QahSkxRlxzevx9yAriqYgfYIj5sMJwlGJxuEwQgsxGhuUbZe9dtBeV

-- Dumped from database version 16.10
-- Dumped by pg_dump version 16.10

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

ALTER TABLE IF EXISTS ONLY public.verifications DROP CONSTRAINT IF EXISTS verifications_user_id_fkey;
ALTER TABLE IF EXISTS ONLY public.variants DROP CONSTRAINT IF EXISTS variants_product_id_fkey;
ALTER TABLE IF EXISTS ONLY public.users DROP CONSTRAINT IF EXISTS users_telegram_referred_by_fkey;
ALTER TABLE IF EXISTS ONLY public.user_ips DROP CONSTRAINT IF EXISTS user_ips_user_id_fkey;
ALTER TABLE IF EXISTS ONLY public.transactions DROP CONSTRAINT IF EXISTS transactions_user_id_fkey;
ALTER TABLE IF EXISTS ONLY public.telegram_link_tokens DROP CONSTRAINT IF EXISTS telegram_link_tokens_user_id_fkey;
ALTER TABLE IF EXISTS ONLY public.support_tickets DROP CONSTRAINT IF EXISTS support_tickets_user_id_fkey;
ALTER TABLE IF EXISTS ONLY public.stock_items DROP CONSTRAINT IF EXISTS stock_items_variant_id_fkey;
ALTER TABLE IF EXISTS ONLY public.stock_items DROP CONSTRAINT IF EXISTS stock_items_seller_id_fkey;
ALTER TABLE IF EXISTS ONLY public.seller_applications DROP CONSTRAINT IF EXISTS seller_applications_user_id_fkey;
ALTER TABLE IF EXISTS ONLY public.referral_usages DROP CONSTRAINT IF EXISTS referral_usages_referrer_id_fkey;
ALTER TABLE IF EXISTS ONLY public.referral_usages DROP CONSTRAINT IF EXISTS referral_usages_redeemer_id_fkey;
ALTER TABLE IF EXISTS ONLY public.redeem_codes DROP CONSTRAINT IF EXISTS redeem_codes_used_by_fkey;
ALTER TABLE IF EXISTS ONLY public.orders DROP CONSTRAINT IF EXISTS orders_user_id_fkey;
ALTER TABLE IF EXISTS ONLY public.order_items DROP CONSTRAINT IF EXISTS order_items_stock_item_id_fkey;
ALTER TABLE IF EXISTS ONLY public.order_items DROP CONSTRAINT IF EXISTS order_items_order_id_fkey;
ALTER TABLE IF EXISTS ONLY public.order_items DROP CONSTRAINT IF EXISTS order_items_card_id_fkey;
ALTER TABLE IF EXISTS ONLY public.mails DROP CONSTRAINT IF EXISTS mails_sender_id_fkey;
ALTER TABLE IF EXISTS ONLY public.mail_reads DROP CONSTRAINT IF EXISTS mail_reads_user_id_fkey;
ALTER TABLE IF EXISTS ONLY public.mail_reads DROP CONSTRAINT IF EXISTS mail_reads_mail_id_fkey;
ALTER TABLE IF EXISTS ONLY public.crypto_payments DROP CONSTRAINT IF EXISTS crypto_payments_user_id_fkey;
ALTER TABLE IF EXISTS ONLY public.crypto_payments DROP CONSTRAINT IF EXISTS crypto_payments_order_id_fkey;
ALTER TABLE IF EXISTS ONLY public.crypto_addresses DROP CONSTRAINT IF EXISTS crypto_addresses_user_id_fkey;
ALTER TABLE IF EXISTS ONLY public.cards DROP CONSTRAINT IF EXISTS cards_user_id_fkey;
ALTER TABLE IF EXISTS ONLY public.cards DROP CONSTRAINT IF EXISTS cards_base_id_fkey;
ALTER TABLE IF EXISTS ONLY public.bank_routing_items DROP CONSTRAINT IF EXISTS bank_routing_items_purchased_by_fkey;
ALTER TABLE IF EXISTS ONLY public.achs DROP CONSTRAINT IF EXISTS achs_seller_id_fkey;
DROP INDEX IF EXISTS public."IDX_session_expire";
DROP INDEX IF EXISTS public."IDX_cards_number_fingerprint";
DROP INDEX IF EXISTS public."IDX_cards_available_bin_prefix";
ALTER TABLE IF EXISTS ONLY public.verifications DROP CONSTRAINT IF EXISTS verifications_user_id_key;
ALTER TABLE IF EXISTS ONLY public.verifications DROP CONSTRAINT IF EXISTS verifications_pkey;
ALTER TABLE IF EXISTS ONLY public.variants DROP CONSTRAINT IF EXISTS variants_pkey;
ALTER TABLE IF EXISTS ONLY public.users DROP CONSTRAINT IF EXISTS users_username_key;
ALTER TABLE IF EXISTS ONLY public.users DROP CONSTRAINT IF EXISTS users_telegram_id_key;
ALTER TABLE IF EXISTS ONLY public.users DROP CONSTRAINT IF EXISTS users_referral_code_key;
ALTER TABLE IF EXISTS ONLY public.users DROP CONSTRAINT IF EXISTS users_pkey;
ALTER TABLE IF EXISTS ONLY public.users DROP CONSTRAINT IF EXISTS users_email_key;
ALTER TABLE IF EXISTS ONLY public.user_ips DROP CONSTRAINT IF EXISTS user_ips_pkey;
ALTER TABLE IF EXISTS ONLY public.uploaded_images DROP CONSTRAINT IF EXISTS uploaded_images_pkey;
ALTER TABLE IF EXISTS ONLY public.transactions DROP CONSTRAINT IF EXISTS transactions_pkey;
ALTER TABLE IF EXISTS ONLY public.telegram_referral_pending DROP CONSTRAINT IF EXISTS telegram_referral_pending_pkey;
ALTER TABLE IF EXISTS ONLY public.telegram_link_tokens DROP CONSTRAINT IF EXISTS telegram_link_tokens_token_key;
ALTER TABLE IF EXISTS ONLY public.telegram_link_tokens DROP CONSTRAINT IF EXISTS telegram_link_tokens_pkey;
ALTER TABLE IF EXISTS ONLY public.support_tickets DROP CONSTRAINT IF EXISTS support_tickets_pkey;
ALTER TABLE IF EXISTS ONLY public.stock_items DROP CONSTRAINT IF EXISTS stock_items_pkey;
ALTER TABLE IF EXISTS ONLY public.site_settings DROP CONSTRAINT IF EXISTS site_settings_pkey;
ALTER TABLE IF EXISTS ONLY public.session DROP CONSTRAINT IF EXISTS session_pkey;
ALTER TABLE IF EXISTS ONLY public.seller_applications DROP CONSTRAINT IF EXISTS seller_applications_seller_code_key;
ALTER TABLE IF EXISTS ONLY public.seller_applications DROP CONSTRAINT IF EXISTS seller_applications_pkey;
ALTER TABLE IF EXISTS ONLY public.referral_usages DROP CONSTRAINT IF EXISTS referral_usages_redeemer_code_unique;
ALTER TABLE IF EXISTS ONLY public.referral_usages DROP CONSTRAINT IF EXISTS referral_usages_pkey;
ALTER TABLE IF EXISTS ONLY public.redeem_codes DROP CONSTRAINT IF EXISTS redeem_codes_pkey;
ALTER TABLE IF EXISTS ONLY public.redeem_codes DROP CONSTRAINT IF EXISTS redeem_codes_code_key;
ALTER TABLE IF EXISTS ONLY public.products DROP CONSTRAINT IF EXISTS products_pkey;
ALTER TABLE IF EXISTS ONLY public.product_categories DROP CONSTRAINT IF EXISTS product_categories_pkey;
ALTER TABLE IF EXISTS ONLY public.product_categories DROP CONSTRAINT IF EXISTS product_categories_normalized_name_key;
ALTER TABLE IF EXISTS ONLY public.orders DROP CONSTRAINT IF EXISTS orders_pkey;
ALTER TABLE IF EXISTS ONLY public.orders DROP CONSTRAINT IF EXISTS orders_order_id_key;
ALTER TABLE IF EXISTS ONLY public.order_items DROP CONSTRAINT IF EXISTS order_items_pkey;
ALTER TABLE IF EXISTS ONLY public.mails DROP CONSTRAINT IF EXISTS mails_pkey;
ALTER TABLE IF EXISTS ONLY public.mail_reads DROP CONSTRAINT IF EXISTS mail_reads_pkey;
ALTER TABLE IF EXISTS ONLY public.discount_codes DROP CONSTRAINT IF EXISTS discount_codes_pkey;
ALTER TABLE IF EXISTS ONLY public.discount_codes DROP CONSTRAINT IF EXISTS discount_codes_code_key;
ALTER TABLE IF EXISTS ONLY public.crypto_payments DROP CONSTRAINT IF EXISTS crypto_payments_pkey;
ALTER TABLE IF EXISTS ONLY public.crypto_payments DROP CONSTRAINT IF EXISTS crypto_payments_forebit_payment_id_key;
ALTER TABLE IF EXISTS ONLY public.crypto_currencies DROP CONSTRAINT IF EXISTS crypto_currencies_pkey;
ALTER TABLE IF EXISTS ONLY public.crypto_currencies DROP CONSTRAINT IF EXISTS crypto_currencies_code_key;
ALTER TABLE IF EXISTS ONLY public.crypto_addresses DROP CONSTRAINT IF EXISTS crypto_addresses_user_id_currency_key;
ALTER TABLE IF EXISTS ONLY public.crypto_addresses DROP CONSTRAINT IF EXISTS crypto_addresses_pkey;
ALTER TABLE IF EXISTS ONLY public.cards DROP CONSTRAINT IF EXISTS cards_pkey;
ALTER TABLE IF EXISTS ONLY public.card_metadata_fixtures DROP CONSTRAINT IF EXISTS card_metadata_fixtures_pkey;
ALTER TABLE IF EXISTS ONLY public.card_bases DROP CONSTRAINT IF EXISTS card_bases_pkey;
ALTER TABLE IF EXISTS ONLY public.card_bases DROP CONSTRAINT IF EXISTS card_bases_name_key;
ALTER TABLE IF EXISTS ONLY public.bank_routing_items DROP CONSTRAINT IF EXISTS bank_routing_items_routing_number_key;
ALTER TABLE IF EXISTS ONLY public.bank_routing_items DROP CONSTRAINT IF EXISTS bank_routing_items_pkey;
ALTER TABLE IF EXISTS ONLY public.announcements DROP CONSTRAINT IF EXISTS announcements_pkey;
ALTER TABLE IF EXISTS ONLY public.achs DROP CONSTRAINT IF EXISTS achs_pkey;
ALTER TABLE IF EXISTS public.verifications ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public.variants ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public.users ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public.user_ips ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public.uploaded_images ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public.transactions ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public.telegram_link_tokens ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public.support_tickets ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public.stock_items ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public.seller_applications ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public.referral_usages ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public.redeem_codes ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public.products ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public.product_categories ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public.orders ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public.order_items ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public.mails ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public.mail_reads ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public.discount_codes ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public.crypto_payments ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public.crypto_currencies ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public.crypto_addresses ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public.cards ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public.card_metadata_fixtures ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public.card_bases ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public.bank_routing_items ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public.announcements ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public.achs ALTER COLUMN id DROP DEFAULT;
DROP SEQUENCE IF EXISTS public.verifications_id_seq;
DROP TABLE IF EXISTS public.verifications;
DROP SEQUENCE IF EXISTS public.variants_id_seq;
DROP TABLE IF EXISTS public.variants;
DROP SEQUENCE IF EXISTS public.users_id_seq;
DROP TABLE IF EXISTS public.users;
DROP SEQUENCE IF EXISTS public.user_ips_id_seq;
DROP TABLE IF EXISTS public.user_ips;
DROP SEQUENCE IF EXISTS public.uploaded_images_id_seq;
DROP TABLE IF EXISTS public.uploaded_images;
DROP SEQUENCE IF EXISTS public.transactions_id_seq;
DROP TABLE IF EXISTS public.transactions;
DROP TABLE IF EXISTS public.telegram_referral_pending;
DROP SEQUENCE IF EXISTS public.telegram_link_tokens_id_seq;
DROP TABLE IF EXISTS public.telegram_link_tokens;
DROP SEQUENCE IF EXISTS public.support_tickets_id_seq;
DROP TABLE IF EXISTS public.support_tickets;
DROP SEQUENCE IF EXISTS public.stock_items_id_seq;
DROP TABLE IF EXISTS public.stock_items;
DROP TABLE IF EXISTS public.site_settings;
DROP TABLE IF EXISTS public.session;
DROP SEQUENCE IF EXISTS public.seller_applications_id_seq;
DROP TABLE IF EXISTS public.seller_applications;
DROP SEQUENCE IF EXISTS public.referral_usages_id_seq;
DROP TABLE IF EXISTS public.referral_usages;
DROP SEQUENCE IF EXISTS public.redeem_codes_id_seq;
DROP TABLE IF EXISTS public.redeem_codes;
DROP SEQUENCE IF EXISTS public.products_id_seq;
DROP TABLE IF EXISTS public.products;
DROP SEQUENCE IF EXISTS public.product_categories_id_seq;
DROP TABLE IF EXISTS public.product_categories;
DROP SEQUENCE IF EXISTS public.orders_id_seq;
DROP TABLE IF EXISTS public.orders;
DROP SEQUENCE IF EXISTS public.order_items_id_seq;
DROP TABLE IF EXISTS public.order_items;
DROP SEQUENCE IF EXISTS public.mails_id_seq;
DROP TABLE IF EXISTS public.mails;
DROP SEQUENCE IF EXISTS public.mail_reads_id_seq;
DROP TABLE IF EXISTS public.mail_reads;
DROP SEQUENCE IF EXISTS public.discount_codes_id_seq;
DROP TABLE IF EXISTS public.discount_codes;
DROP SEQUENCE IF EXISTS public.crypto_payments_id_seq;
DROP TABLE IF EXISTS public.crypto_payments;
DROP SEQUENCE IF EXISTS public.crypto_currencies_id_seq;
DROP TABLE IF EXISTS public.crypto_currencies;
DROP SEQUENCE IF EXISTS public.crypto_addresses_id_seq;
DROP TABLE IF EXISTS public.crypto_addresses;
DROP SEQUENCE IF EXISTS public.cards_id_seq;
DROP TABLE IF EXISTS public.cards;
DROP SEQUENCE IF EXISTS public.card_metadata_fixtures_id_seq;
DROP TABLE IF EXISTS public.card_metadata_fixtures;
DROP SEQUENCE IF EXISTS public.card_bases_id_seq;
DROP TABLE IF EXISTS public.card_bases;
DROP SEQUENCE IF EXISTS public.bank_routing_items_id_seq;
DROP TABLE IF EXISTS public.bank_routing_items;
DROP SEQUENCE IF EXISTS public.announcements_id_seq;
DROP TABLE IF EXISTS public.announcements;
DROP SEQUENCE IF EXISTS public.achs_id_seq;
DROP TABLE IF EXISTS public.achs;
SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: achs; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.achs (
    id integer NOT NULL,
    bank_name text NOT NULL,
    balance text NOT NULL,
    full_item text NOT NULL,
    price integer NOT NULL,
    is_sold boolean DEFAULT false NOT NULL,
    seller_id integer,
    created_at timestamp without time zone DEFAULT now() NOT NULL
);


--
-- Name: achs_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.achs_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: achs_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.achs_id_seq OWNED BY public.achs.id;


--
-- Name: announcements; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.announcements (
    id integer NOT NULL,
    content text NOT NULL,
    link text,
    active boolean DEFAULT true NOT NULL,
    created_at timestamp without time zone DEFAULT now() NOT NULL
);


--
-- Name: announcements_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.announcements_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: announcements_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.announcements_id_seq OWNED BY public.announcements.id;


--
-- Name: bank_routing_items; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.bank_routing_items (
    id integer NOT NULL,
    bank_name text NOT NULL,
    routing_number text NOT NULL,
    state text NOT NULL,
    zip text NOT NULL,
    price integer DEFAULT 500 NOT NULL,
    is_sold boolean DEFAULT false NOT NULL,
    purchased_by integer,
    sold_at timestamp without time zone,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    bin text DEFAULT ''::text NOT NULL,
    issuer text DEFAULT ''::text NOT NULL
);


--
-- Name: bank_routing_items_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.bank_routing_items_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: bank_routing_items_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.bank_routing_items_id_seq OWNED BY public.bank_routing_items.id;


--
-- Name: card_bases; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.card_bases (
    id integer NOT NULL,
    name text NOT NULL,
    created_at timestamp without time zone DEFAULT now() NOT NULL
);


--
-- Name: card_bases_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.card_bases_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: card_bases_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.card_bases_id_seq OWNED BY public.card_bases.id;


--
-- Name: card_metadata_fixtures; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.card_metadata_fixtures (
    id integer NOT NULL,
    bin text NOT NULL,
    type text NOT NULL,
    state text NOT NULL,
    city text NOT NULL,
    zip text NOT NULL,
    created_at timestamp without time zone DEFAULT now() NOT NULL
);


--
-- Name: card_metadata_fixtures_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.card_metadata_fixtures_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: card_metadata_fixtures_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.card_metadata_fixtures_id_seq OWNED BY public.card_metadata_fixtures.id;


--
-- Name: cards; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.cards (
    id integer NOT NULL,
    card_number text NOT NULL,
    masked_card text NOT NULL,
    expiry text NOT NULL,
    cvv text NOT NULL,
    country text NOT NULL,
    extras text DEFAULT ''::text,
    price integer NOT NULL,
    is_first_hand boolean DEFAULT false NOT NULL,
    is_sold boolean DEFAULT false NOT NULL,
    user_id integer,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    hr_percent integer DEFAULT 80 NOT NULL,
    bin_data jsonb,
    base_id integer
);


--
-- Name: cards_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.cards_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: cards_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.cards_id_seq OWNED BY public.cards.id;


--
-- Name: crypto_addresses; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.crypto_addresses (
    id integer NOT NULL,
    user_id integer NOT NULL,
    currency text NOT NULL,
    address text NOT NULL,
    created_at timestamp without time zone DEFAULT now() NOT NULL
);


--
-- Name: crypto_addresses_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.crypto_addresses_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: crypto_addresses_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.crypto_addresses_id_seq OWNED BY public.crypto_addresses.id;


--
-- Name: crypto_currencies; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.crypto_currencies (
    id integer NOT NULL,
    code text NOT NULL,
    name text NOT NULL,
    ticker text NOT NULL,
    color text DEFAULT '#4f7cff'::text NOT NULL,
    enabled boolean DEFAULT true NOT NULL,
    sort_order integer DEFAULT 0 NOT NULL,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL
);


--
-- Name: crypto_currencies_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.crypto_currencies_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: crypto_currencies_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.crypto_currencies_id_seq OWNED BY public.crypto_currencies.id;


--
-- Name: crypto_payments; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.crypto_payments (
    id integer NOT NULL,
    user_id integer NOT NULL,
    forebit_payment_id text NOT NULL,
    amount integer NOT NULL,
    currency text DEFAULT 'USD'::text NOT NULL,
    status text DEFAULT 'pending'::text NOT NULL,
    purpose text DEFAULT 'deposit'::text NOT NULL,
    order_id integer,
    checkout_url text,
    metadata text,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL
);


--
-- Name: crypto_payments_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.crypto_payments_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: crypto_payments_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.crypto_payments_id_seq OWNED BY public.crypto_payments.id;


--
-- Name: discount_codes; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.discount_codes (
    id integer NOT NULL,
    code text NOT NULL,
    type text NOT NULL,
    value integer NOT NULL,
    min_order integer DEFAULT 0,
    max_uses integer,
    used_count integer DEFAULT 0 NOT NULL,
    is_active boolean DEFAULT true NOT NULL,
    expires_at timestamp without time zone,
    created_at timestamp without time zone DEFAULT now() NOT NULL
);


--
-- Name: discount_codes_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.discount_codes_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: discount_codes_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.discount_codes_id_seq OWNED BY public.discount_codes.id;


--
-- Name: mail_reads; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.mail_reads (
    id integer NOT NULL,
    mail_id integer NOT NULL,
    user_id integer NOT NULL,
    read_at timestamp without time zone DEFAULT now() NOT NULL
);


--
-- Name: mail_reads_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.mail_reads_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: mail_reads_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.mail_reads_id_seq OWNED BY public.mail_reads.id;


--
-- Name: mails; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.mails (
    id integer NOT NULL,
    title text NOT NULL,
    body text NOT NULL,
    sender_id integer NOT NULL,
    recipient_id integer,
    created_at timestamp without time zone DEFAULT now() NOT NULL
);


--
-- Name: mails_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.mails_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: mails_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.mails_id_seq OWNED BY public.mails.id;


--
-- Name: order_items; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.order_items (
    id integer NOT NULL,
    order_id integer NOT NULL,
    variant_id integer,
    stock_item_id integer,
    card_id integer,
    item_type text DEFAULT 'product'::text NOT NULL,
    price integer NOT NULL,
    quantity integer DEFAULT 1 NOT NULL
);


--
-- Name: order_items_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.order_items_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: order_items_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.order_items_id_seq OWNED BY public.order_items.id;


--
-- Name: orders; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.orders (
    id integer NOT NULL,
    order_id text NOT NULL,
    user_id integer NOT NULL,
    status text DEFAULT 'pending'::text NOT NULL,
    total integer NOT NULL,
    paid_amount integer DEFAULT 0 NOT NULL,
    delivery_content text DEFAULT ''::text NOT NULL,
    payment_method text DEFAULT ''::text NOT NULL,
    payment_note text DEFAULT ''::text NOT NULL,
    created_at timestamp without time zone DEFAULT now() NOT NULL
);


--
-- Name: orders_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.orders_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: orders_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.orders_id_seq OWNED BY public.orders.id;


--
-- Name: product_categories; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.product_categories (
    id integer NOT NULL,
    name text NOT NULL,
    normalized_name text NOT NULL,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL
);


--
-- Name: product_categories_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.product_categories_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: product_categories_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.product_categories_id_seq OWNED BY public.product_categories.id;


--
-- Name: products; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.products (
    id integer NOT NULL,
    name text NOT NULL,
    description text DEFAULT ''::text NOT NULL,
    image text DEFAULT ''::text,
    active boolean DEFAULT true NOT NULL,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    pinned boolean DEFAULT false NOT NULL,
    category text DEFAULT ''::text
);


--
-- Name: products_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.products_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: products_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.products_id_seq OWNED BY public.products.id;


--
-- Name: redeem_codes; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.redeem_codes (
    id integer NOT NULL,
    code text NOT NULL,
    amount integer NOT NULL,
    is_used boolean DEFAULT false NOT NULL,
    used_by integer,
    created_at timestamp without time zone DEFAULT now() NOT NULL
);


--
-- Name: redeem_codes_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.redeem_codes_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: redeem_codes_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.redeem_codes_id_seq OWNED BY public.redeem_codes.id;


--
-- Name: referral_usages; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.referral_usages (
    id integer NOT NULL,
    referrer_id integer NOT NULL,
    redeemer_id integer NOT NULL,
    code text NOT NULL,
    created_at timestamp without time zone DEFAULT now() NOT NULL
);


--
-- Name: referral_usages_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.referral_usages_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: referral_usages_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.referral_usages_id_seq OWNED BY public.referral_usages.id;


--
-- Name: seller_applications; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.seller_applications (
    id integer NOT NULL,
    user_id integer NOT NULL,
    status text DEFAULT 'pending'::text NOT NULL,
    seller_code text NOT NULL,
    note text DEFAULT ''::text,
    created_at timestamp without time zone DEFAULT now() NOT NULL
);


--
-- Name: seller_applications_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.seller_applications_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: seller_applications_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.seller_applications_id_seq OWNED BY public.seller_applications.id;


--
-- Name: session; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.session (
    sid character varying NOT NULL,
    sess json NOT NULL,
    expire timestamp(6) without time zone NOT NULL
);


--
-- Name: site_settings; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.site_settings (
    key text NOT NULL,
    value text NOT NULL,
    is_secret boolean DEFAULT false NOT NULL,
    enabled boolean DEFAULT true NOT NULL,
    kind text DEFAULT 'text'::text NOT NULL,
    label text,
    updated_at timestamp without time zone DEFAULT now() NOT NULL
);


--
-- Name: stock_items; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.stock_items (
    id integer NOT NULL,
    variant_id integer NOT NULL,
    content text NOT NULL,
    is_sold boolean DEFAULT false NOT NULL,
    is_reserved boolean DEFAULT false NOT NULL,
    order_id integer,
    replacement_for_id integer,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    seller_id integer
);


--
-- Name: stock_items_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.stock_items_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: stock_items_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.stock_items_id_seq OWNED BY public.stock_items.id;


--
-- Name: support_tickets; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.support_tickets (
    id integer NOT NULL,
    user_id integer NOT NULL,
    order_id text NOT NULL,
    subject text NOT NULL,
    description text NOT NULL,
    image_url text NOT NULL,
    status text DEFAULT 'open'::text NOT NULL,
    admin_message text,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    CONSTRAINT support_tickets_status_check CHECK ((status = ANY (ARRAY['open'::text, 'refunded'::text, 'replaced'::text, 'resolved'::text])))
);


--
-- Name: support_tickets_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.support_tickets_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: support_tickets_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.support_tickets_id_seq OWNED BY public.support_tickets.id;


--
-- Name: telegram_link_tokens; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.telegram_link_tokens (
    id integer NOT NULL,
    token text NOT NULL,
    user_id integer NOT NULL,
    created_at timestamp without time zone DEFAULT now() NOT NULL
);


--
-- Name: telegram_link_tokens_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.telegram_link_tokens_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: telegram_link_tokens_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.telegram_link_tokens_id_seq OWNED BY public.telegram_link_tokens.id;


--
-- Name: telegram_referral_pending; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.telegram_referral_pending (
    chat_id text NOT NULL,
    referrer_user_id integer NOT NULL,
    created_at timestamp without time zone DEFAULT now() NOT NULL
);


--
-- Name: transactions; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.transactions (
    id integer NOT NULL,
    user_id integer NOT NULL,
    amount integer NOT NULL,
    type text NOT NULL,
    description text NOT NULL,
    payment_method text,
    created_at timestamp without time zone DEFAULT now() NOT NULL
);


--
-- Name: transactions_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.transactions_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: transactions_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.transactions_id_seq OWNED BY public.transactions.id;


--
-- Name: uploaded_images; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.uploaded_images (
    id integer NOT NULL,
    filename text NOT NULL,
    mime_type text NOT NULL,
    data text NOT NULL,
    created_at timestamp without time zone DEFAULT now() NOT NULL
);


--
-- Name: uploaded_images_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.uploaded_images_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: uploaded_images_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.uploaded_images_id_seq OWNED BY public.uploaded_images.id;


--
-- Name: user_ips; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.user_ips (
    id integer NOT NULL,
    user_id integer NOT NULL,
    ip text NOT NULL,
    logged_at timestamp without time zone DEFAULT now() NOT NULL
);


--
-- Name: user_ips_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.user_ips_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: user_ips_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.user_ips_id_seq OWNED BY public.user_ips.id;


--
-- Name: users; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.users (
    id integer NOT NULL,
    username text NOT NULL,
    password text NOT NULL,
    email text NOT NULL,
    telegram_username text DEFAULT ''::text NOT NULL,
    role text DEFAULT 'user'::text NOT NULL,
    is_banned boolean DEFAULT false NOT NULL,
    balance integer DEFAULT 0 NOT NULL,
    protected_balance integer DEFAULT 0 NOT NULL,
    last_daily_spin timestamp without time zone,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    is_seller boolean DEFAULT false NOT NULL,
    seller_balance integer DEFAULT 0 NOT NULL,
    total_seller_earned integer DEFAULT 0 NOT NULL,
    login_code text DEFAULT ''::text NOT NULL,
    seller_type text DEFAULT 'bronze'::text NOT NULL,
    seller_display_name text DEFAULT ''::text NOT NULL,
    telegram_id text,
    telegram_connected boolean DEFAULT false NOT NULL,
    referral_code text,
    is_worker boolean DEFAULT false NOT NULL,
    telegram_chat_id text,
    last_telegram_name_reward timestamp without time zone,
    telegram_referred_by integer,
    telegram_referral_bonus_paid boolean DEFAULT false,
    telegram_name_active boolean DEFAULT false NOT NULL,
    telegram_name_signature text DEFAULT ''::text NOT NULL
);


--
-- Name: users_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.users_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: users_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.users_id_seq OWNED BY public.users.id;


--
-- Name: variants; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.variants (
    id integer NOT NULL,
    product_id integer NOT NULL,
    name text NOT NULL,
    price integer NOT NULL,
    min_quantity integer DEFAULT 1 NOT NULL,
    compare_price integer
);


--
-- Name: variants_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.variants_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: variants_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.variants_id_seq OWNED BY public.variants.id;


--
-- Name: verifications; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.verifications (
    id integer NOT NULL,
    user_id integer NOT NULL,
    telegram_username text NOT NULL,
    channel_link text NOT NULL,
    channel_name text NOT NULL,
    agreed_to_terms boolean DEFAULT false NOT NULL,
    status text DEFAULT 'pending'::text NOT NULL,
    admin_note text DEFAULT ''::text,
    term_message text DEFAULT ''::text,
    created_at timestamp without time zone DEFAULT now() NOT NULL
);


--
-- Name: verifications_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.verifications_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: verifications_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.verifications_id_seq OWNED BY public.verifications.id;


--
-- Name: achs id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.achs ALTER COLUMN id SET DEFAULT nextval('public.achs_id_seq'::regclass);


--
-- Name: announcements id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.announcements ALTER COLUMN id SET DEFAULT nextval('public.announcements_id_seq'::regclass);


--
-- Name: bank_routing_items id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.bank_routing_items ALTER COLUMN id SET DEFAULT nextval('public.bank_routing_items_id_seq'::regclass);


--
-- Name: card_bases id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.card_bases ALTER COLUMN id SET DEFAULT nextval('public.card_bases_id_seq'::regclass);


--
-- Name: card_metadata_fixtures id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.card_metadata_fixtures ALTER COLUMN id SET DEFAULT nextval('public.card_metadata_fixtures_id_seq'::regclass);


--
-- Name: cards id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.cards ALTER COLUMN id SET DEFAULT nextval('public.cards_id_seq'::regclass);


--
-- Name: crypto_addresses id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.crypto_addresses ALTER COLUMN id SET DEFAULT nextval('public.crypto_addresses_id_seq'::regclass);


--
-- Name: crypto_currencies id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.crypto_currencies ALTER COLUMN id SET DEFAULT nextval('public.crypto_currencies_id_seq'::regclass);


--
-- Name: crypto_payments id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.crypto_payments ALTER COLUMN id SET DEFAULT nextval('public.crypto_payments_id_seq'::regclass);


--
-- Name: discount_codes id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.discount_codes ALTER COLUMN id SET DEFAULT nextval('public.discount_codes_id_seq'::regclass);


--
-- Name: mail_reads id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.mail_reads ALTER COLUMN id SET DEFAULT nextval('public.mail_reads_id_seq'::regclass);


--
-- Name: mails id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.mails ALTER COLUMN id SET DEFAULT nextval('public.mails_id_seq'::regclass);


--
-- Name: order_items id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.order_items ALTER COLUMN id SET DEFAULT nextval('public.order_items_id_seq'::regclass);


--
-- Name: orders id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.orders ALTER COLUMN id SET DEFAULT nextval('public.orders_id_seq'::regclass);


--
-- Name: product_categories id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.product_categories ALTER COLUMN id SET DEFAULT nextval('public.product_categories_id_seq'::regclass);


--
-- Name: products id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.products ALTER COLUMN id SET DEFAULT nextval('public.products_id_seq'::regclass);


--
-- Name: redeem_codes id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.redeem_codes ALTER COLUMN id SET DEFAULT nextval('public.redeem_codes_id_seq'::regclass);


--
-- Name: referral_usages id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.referral_usages ALTER COLUMN id SET DEFAULT nextval('public.referral_usages_id_seq'::regclass);


--
-- Name: seller_applications id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.seller_applications ALTER COLUMN id SET DEFAULT nextval('public.seller_applications_id_seq'::regclass);


--
-- Name: stock_items id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.stock_items ALTER COLUMN id SET DEFAULT nextval('public.stock_items_id_seq'::regclass);


--
-- Name: support_tickets id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.support_tickets ALTER COLUMN id SET DEFAULT nextval('public.support_tickets_id_seq'::regclass);


--
-- Name: telegram_link_tokens id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.telegram_link_tokens ALTER COLUMN id SET DEFAULT nextval('public.telegram_link_tokens_id_seq'::regclass);


--
-- Name: transactions id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.transactions ALTER COLUMN id SET DEFAULT nextval('public.transactions_id_seq'::regclass);


--
-- Name: uploaded_images id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.uploaded_images ALTER COLUMN id SET DEFAULT nextval('public.uploaded_images_id_seq'::regclass);


--
-- Name: user_ips id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_ips ALTER COLUMN id SET DEFAULT nextval('public.user_ips_id_seq'::regclass);


--
-- Name: users id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users ALTER COLUMN id SET DEFAULT nextval('public.users_id_seq'::regclass);


--
-- Name: variants id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.variants ALTER COLUMN id SET DEFAULT nextval('public.variants_id_seq'::regclass);


--
-- Name: verifications id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.verifications ALTER COLUMN id SET DEFAULT nextval('public.verifications_id_seq'::regclass);


--
-- Data for Name: achs; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.achs (id, bank_name, balance, full_item, price, is_sold, seller_id, created_at) FROM stdin;
\.


--
-- Data for Name: announcements; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.announcements (id, content, link, active, created_at) FROM stdin;
\.


--
-- Data for Name: bank_routing_items; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.bank_routing_items (id, bank_name, routing_number, state, zip, price, is_sold, purchased_by, sold_at, created_at, bin, issuer) FROM stdin;
\.


--
-- Data for Name: card_bases; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.card_bases (id, name, created_at) FROM stdin;
1	Best	2026-06-24 16:51:36.104817
\.


--
-- Data for Name: card_metadata_fixtures; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.card_metadata_fixtures (id, bin, type, state, city, zip, created_at) FROM stdin;
\.


--
-- Data for Name: cards; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.cards (id, card_number, masked_card, expiry, cvv, country, extras, price, is_first_hand, is_sold, user_id, created_at, hr_percent, bin_data, base_id) FROM stdin;
11					Unknown	dese	2300	t	t	7	2026-08-22 01:39:21.757376	80	\N	1
20	4097580787788931	409758******8931			United States of America (the)	4097580787788931|04/2030|377|8082501348|ednalana.personal@yahoo.com|Edna Lana||||||||112.43.185.146||US|HI|Lahaina|P O Box 12696||96761	100	f	f	\N	2026-08-24 16:22:03.215013	80	{"bin": "409758", "bank": "Pathward, N.A.", "type": "prepaid", "brand": "Visa Classic", "scheme": "visa", "country": "United States of America (the)", "countryCode": "US"}	1
16	4142382620971005	414238******1005			United States of America (the)	4142382620971005|05/2029|302|9257069171|hiramgawthorpvkb@mail.com|Jodene Scott||||||||||US|CA|Antioch|510 G St||94509	200	t	t	7	2026-08-24 14:34:58.138555	80	{"bin": "414238", "bank": "Pathward, N.A.", "type": "prepaid", "brand": "Visa Classic", "scheme": "visa", "country": "United States of America (the)", "countryCode": "US"}	1
15	5432761126944614	543276******4614			United States of America (the)	5432761126944614|02/2027|158|7407078281|helenheskett@yahoo.com|Helen wolfe||||||||166.216.159.47||US|OH|Lancaster|729 Pennsylvania ave||43130	200	t	t	7	2026-08-24 14:34:57.214166	80	{"bin": "543276", "bank": "Pathward, National Association", "type": "prepaid", "brand": "Mastercard Prepaid Gift", "scheme": "mastercard", "country": "United States of America (the)", "countryCode": "US"}	1
14	4847187795186612	484718******6612			United States of America (the)	4847187795186612|08/2026|515|9703099515|catsaul1@icloud.com|cat saul||||||||70.89.170.176||US|CO|Aspen|33 Mining Stock Pkwy unit 201||81611\n4097580017352748|06/2029|916|4693369556|espinoza.vincent79@yahoo.com|Vincent Espinoza||||||||72.178.156.155||US|TX|Dallas|7408 Long Canyon Trl||75249\n4097580287091216|12/2030|585|8325411266|falltwilson@gmail.com|Tyrone Wilson||||||||159.92.122.250||US|TX|Houston|1506 winter bay lane||77088\n4097580787788931|04/2030|377|8082501348|ednalana.personal@yahoo.com|Edna Lana||||||||112.43.185.146||US|HI|Lahaina|P O Box 12696||96761\n4847182166024708|01/2029|158|6107455277|joanna.ferguson@gmail.com|Joanna Ferguson||||||||204.14.14.248||US|PA|Mechanicsburg|5142 Jennifer Circle||17050\n4934522027740089|10/2026|000|7165732137|jet1jello@hotmail.com|Jill Zafar||||||||47.17.158.125||US|CT|Weston|51 old Hyde rd||06883\n5314620078198764|05/2027|704|2345212367|epowelljr2@gmail.com|Edgar Powell||||||||228.117.240.124||US|OH|Canton|1638 Miami Ct N E||44714	200	t	t	7	2026-08-24 14:34:56.302137	80	{"bin": "484718", "bank": "Tbbk Card Services, Inc.", "type": "prepaid", "brand": "Visa Classic", "scheme": "visa", "country": "United States of America (the)", "countryCode": "US"}	1
17	4847187795186612	484718******6612			United States of America (the)	4847187795186612|08/2026|515|9703099515|catsaul1@icloud.com|cat saul||||||||70.89.170.176||US|CO|Aspen|33 Mining Stock Pkwy unit 201||81611	100	f	f	\N	2026-08-24 16:22:02.266773	80	{"bin": "484718", "bank": "Tbbk Card Services, Inc.", "type": "prepaid", "brand": "Visa Classic", "scheme": "visa", "country": "United States of America (the)", "countryCode": "US"}	1
12	4147202597609633	414720******9633			United States of America (the)	4147202597609633|03|28|554|Mercedes Smith|1353 Congo Drive|Poinciana|FL|34759|UNITED STATES	200	f	t	7	2026-08-22 02:32:15.688306	80	{"bin": "414720", "bank": "Jpmorgan Chase Bank N.A.", "type": "credit", "brand": "Visa Traditional", "scheme": "visa", "country": "United States of America (the)", "countryCode": "US"}	1
18	4097580017352748	409758******2748			United States of America (the)	4097580017352748|06/2029|916|4693369556|espinoza.vincent79@yahoo.com|Vincent Espinoza||||||||72.178.156.155||US|TX|Dallas|7408 Long Canyon Trl||75249	100	f	f	\N	2026-08-24 16:22:03.188464	80	{"bin": "409758", "bank": "Pathward, N.A.", "type": "prepaid", "brand": "Visa Classic", "scheme": "visa", "country": "United States of America (the)", "countryCode": "US"}	1
13	0076776093	0076776093			Unknown	26,"CardBank":"THE GOLDEN 1 CREDIT UNION","CardBrand":"0076776093","VendorName":"Sande Walker","CustomTag":"Sande Walker","Raw":"THE GOLDEN 1 CREDIT UNION | Account: 0076776093 | Routing: 321175261 | Name: Sande Walker | Address: 231 Selby Ranch Rd. #2 95864 | Extra: Sande Walker | City: Sacramento | State: CA | Balance: $997.26","VendorID":""}\nWELLS FARGO BANK | Account: 3913024463 | Routing: 053000219 | Name: Joseph Derusha | Address: 1007 Toquima Trail 28110 | Extra: JoeDerusha | City: Monroe | State: NC | Balance: $2,538.84\nWELLS FARGO BANK NA | Account: 5570119585 | Routing: 125008547 | Name: Dylan Wong | Address: 9494 Carroll Canyon Road 92126 | Extra: EVERYDAY CHECKING | City: Sunnyvale | State: CA | Balance: $458.13\nBMO HARRIS BANK N.A. | Account: 058622481 | Routing: 071025661 | Name: Theresa Fisher | Address: 390 NW Blackberry Street 50263 | Extra: Bmo | City: Waukee | State: IA | Balance: $577.51\nPLATTE VALLEY BANK | Account: 0382 | Routing: 104908134 | Name: Alex Hall | Address: 2327 S. 142nd Court 68144 | Extra: Alexander Hall | City: Omaha | State: NE | Balance: $1,143.84\nBANK OF AMERICA N.A. | Account: 385022276663 | Routing: 011900254 | Name: Tyler St Amand | Address: 2021 Lemans Blvd #6111 33607 | Extra: Tyler Checking Account | City: Tampa | State: FL | Balance: $1248.37\nFIFTH THIRD BANK | Account: 7992283429 | Routing: 042000314 | Name: Keitha Johnson | Address: Paramount Launch LLC  | Extra: F3B | City: Cincinnati | State: OH | Balance: $561.80\nCAPITAL ONE N.A. | Account: 36132660256 | Routing: 031176110 | Name: Madison Koster | Address: 19115 Sandelford Dr 77449 | Extra: Matthew Burt | City: Katy | State: TX | Balance: $350.16\nTD BANK, NA | Account: 4246880507 | Routing: 031201360 | Name: Blake Duffy | Address: 29 Matawan Rd, Apt A 08879 | Extra: Blake Duffy | City: Laurence Harbor | State: NJ | Balance: $985.12\nWELLS FARGO BANK | Account: 3453975439 | Routing: 061000227 | Name: Taylor Yarborough | Address: 400 Flat Creek Dr. 30534 | Extra: Kaila Billingsley | City: Cumming | State: GA | Balance: $360.02\nWELLS FARGO BANK NA  (MINNESOTA) | Account: 7783530400 | Routing: 091000019 | Name: William Schmakel | Address: 10155 Greenbrier Road # 103 55305 | Extra: Wellsfargo | City: Minnetonka | State: MN | Balance: $356.24\nBANK OF AMERICA, N.A. | Account: 004645577541 | Routing: 011000138 | Name: Omkar Kulkarni | Address: 21 East Street B410 02760 | Extra: BoFa | City: North Attleboro | State: MA | Balance: $516.72\nNEW YORK COMMUNITY BANK | Account: 210102927 | Routing: 226071004 | Name: Scott Dubin | Address: 156 Lake Balaton Dr 44128 | Extra: My Community Free Checking | City: Woodmere | State: OH | Balance: $467.52\nBANK OF AMERICA, N.A. | Account: 000214767992 | Routing: 121000358 | Name: Chelsea Kelley | Address: 730 Cieneguitas Road 93110 | Extra: Chelsea Kelley | City: Santa Barbara | State: CA | Balance: $493.06\nWELLS FARGO BANK | Account: 2984974861 | Routing: 021200025 | Name: Dylan McBride | Address: 163 3rd Street 07030 | Extra: Dylan McBride | City: Hoboken | State: NJ | Balance: $937.51\n{"ID":"81cdf353-f50a-e499-2f28-b3c32bde179e","Bin":"704313","City":"Newport News","State":"VA","Zip":"23606","Expire":"","Country":"US","Price":"$330.81","PriceValue":330.81,"CardBank":"NAVY FEDERAL CREDIT UNION","CardBrand":"7043138820","VendorName":"Nash R. Kleisner","CustomTag":"Nash R Kleisner","Raw":"NAVY FEDERAL CREDIT UNION | Account: 7043138820 | Routing: 256074974 | Name: Nash R. Kleisner | Address: 677 Tech Center Parkway #1207 23606 | Extra: Nash R Kleisner | City: Newport News | State: VA | Balance: $330.81","VendorID":""}\nBANK OF AMERICA N.A. | Account: 005041038007 | Routing: 101100045 | Name: Tessa Vickers | Address: 1580 Detroit St #102 80206 | Extra: Bank of America | City: Denver | State: CO | Balance: $794.02\nJPMORGAN CHASE BANK NA | Account: 00100000176260886 | Routing: 028000121 | Name: Shane Williams | Address: 441 33rd St N Apt # 0105 33713 | Extra: TOTAL CHECKING | City: St. Petersburg | State: FL | Balance: $475.63	100	f	t	7	2026-08-23 19:25:18.352518	80	{"bin": "007677"}	1
21	4847182166024708	484718******4708			United States of America (the)	4847182166024708|01/2029|158|6107455277|joanna.ferguson@gmail.com|Joanna Ferguson||||||||204.14.14.248||US|PA|Mechanicsburg|5142 Jennifer Circle||17050	100	f	f	\N	2026-08-24 16:22:03.222056	80	{"bin": "484718", "bank": "Tbbk Card Services, Inc.", "type": "prepaid", "brand": "Visa Classic", "scheme": "visa", "country": "United States of America (the)", "countryCode": "US"}	1
19	4097580287091216	409758******1216			United States of America (the)	4097580287091216|12/2030|585|8325411266|falltwilson@gmail.com|Tyrone Wilson||||||||159.92.122.250||US|TX|Houston|1506 winter bay lane||77088	100	f	f	\N	2026-08-24 16:22:03.196476	80	{"bin": "409758", "bank": "Pathward, N.A.", "type": "prepaid", "brand": "Visa Classic", "scheme": "visa", "country": "United States of America (the)", "countryCode": "US"}	1
25	4142382620971005	414238******1005			Unknown	4142382620971005|05/2029|302|9257069171|hiramgawthorpvkb@mail.com|Jodene Scott||||||||||US|CA|Antioch|510 G St||94509	100	f	f	\N	2026-08-24 16:22:06.821362	80	{"bin": "414238", "bank": "PATHWARD, N.A.", "type": "DEBIT", "brand": "PREPAID CLASSIC", "scheme": "VISA", "country": "United States", "countryCode": "US"}	1
23	5314620078198764	531462******8764			United States of America (the)	5314620078198764|05/2027|704|2345212367|epowelljr2@gmail.com|Edgar Powell||||||||228.117.240.124||US|OH|Canton|1638 Miami Ct N E||44714	100	f	t	7	2026-08-24 16:22:05.015316	80	{"bin": "531462", "bank": "Pathward, National Association", "type": "prepaid", "brand": "Mastercard Prepaid Payroll", "scheme": "mastercard", "country": "United States of America (the)", "countryCode": "US"}	1
24	5432761126944614	543276******4614			United States of America (the)	5432761126944614|02/2027|158|7407078281|helenheskett@yahoo.com|Helen wolfe||||||||166.216.159.47||US|OH|Lancaster|729 Pennsylvania ave||43130	100	f	t	7	2026-08-24 16:22:05.937708	80	{"bin": "543276", "bank": "Pathward, National Association", "type": "prepaid", "brand": "Mastercard Prepaid Gift", "scheme": "mastercard", "country": "United States of America (the)", "countryCode": "US"}	1
\.


--
-- Data for Name: crypto_addresses; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.crypto_addresses (id, user_id, currency, address, created_at) FROM stdin;
\.


--
-- Data for Name: crypto_currencies; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.crypto_currencies (id, code, name, ticker, color, enabled, sort_order, created_at, updated_at) FROM stdin;
1	BTC	Bitcoin	BTC	#F7931A	t	0	2026-08-23 22:41:40.450728	2026-08-23 22:41:40.449
2	ETH	Ethereum	ETH	#627EEA	t	1	2026-08-23 22:41:40.457744	2026-08-23 22:41:40.457
3	USDT	Tether USDT	USDT	#26A17B	t	2	2026-08-23 22:41:40.46349	2026-08-23 22:41:40.463
4	USDC	USD Coin	USDC	#2775CA	t	3	2026-08-23 22:41:40.468626	2026-08-23 22:41:40.468
5	SOL	Solana	SOL	#9945FF	t	4	2026-08-23 22:41:40.472966	2026-08-23 22:41:40.472
6	LTC	Litecoin	LTC	#BEBEBE	t	5	2026-08-23 22:41:40.477283	2026-08-23 22:41:40.476
25	TRX	TRON	TRX	#FF0013	t	6	2026-08-23 22:58:26.975614	2026-08-23 22:58:26.975
\.


--
-- Data for Name: crypto_payments; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.crypto_payments (id, user_id, forebit_payment_id, amount, currency, status, purpose, order_id, checkout_url, metadata, created_at, updated_at) FROM stdin;
1	7	6095133277	100	USD	expired	deposit	\N	https://nowpayments.io/payment/?iid=6095133277	{"nowpaymentsResponse":{"id":"6095133277","token_id":"6392173195","order_id":"deposit-7-1787358890674","order_description":"Foodplug deposit","price_amount":"1","price_currency":"USD","pay_currency":null,"ipn_callback_url":"http://073b3de8-719c-476e-8b3b-2edacc668a2c-00-1i846nleuw61l.spock.replit.dev/api/webhooks/nowpayments","invoice_url":"https://nowpayments.io/payment/?iid=6095133277","success_url":"http://073b3de8-719c-476e-8b3b-2edacc668a2c-00-1i846nleuw61l.spock.replit.dev/deposit","cancel_url":"http://073b3de8-719c-476e-8b3b-2edacc668a2c-00-1i846nleuw61l.spock.replit.dev/deposit","customer_email":null,"partially_paid_url":null,"payout_currency":null,"created_at":"2026-08-22T00:34:50.876Z","updated_at":"2026-08-22T00:34:50.876Z","is_fixed_rate":false,"is_fee_paid_by_user":false,"source":null,"collect_user_data":false,"url":"https://nowpayments.io/payment/?iid=6095133277"}}	2026-08-22 00:34:50.990572	2026-08-22 00:34:50.990572
2	7	6318168103	500	USD	expired	deposit	\N	https://nowpayments.io/payment/?iid=6318168103	{"nowpaymentsResponse":{"id":"6318168103","token_id":"6392173195","order_id":"deposit-7-1787405221892","order_description":"Foodplug deposit","price_amount":"5","price_currency":"USD","pay_currency":null,"ipn_callback_url":"http://073b3de8-719c-476e-8b3b-2edacc668a2c-00-1i846nleuw61l.spock.replit.dev/api/webhooks/nowpayments","invoice_url":"https://nowpayments.io/payment/?iid=6318168103","success_url":"http://073b3de8-719c-476e-8b3b-2edacc668a2c-00-1i846nleuw61l.spock.replit.dev/deposit","cancel_url":"http://073b3de8-719c-476e-8b3b-2edacc668a2c-00-1i846nleuw61l.spock.replit.dev/deposit","customer_email":null,"partially_paid_url":null,"payout_currency":null,"created_at":"2026-08-22T13:27:02.039Z","updated_at":"2026-08-22T13:27:02.039Z","is_fixed_rate":false,"is_fee_paid_by_user":false,"source":null,"collect_user_data":false,"url":"https://nowpayments.io/payment/?iid=6318168103"}}	2026-08-22 13:27:02.12886	2026-08-22 13:27:02.12886
3	7	5956634584	2300	USD	expired	deposit	\N	https://nowpayments.io/payment/?iid=5956634584	{"nowpaymentsResponse":{"id":"5956634584","token_id":"6392173195","order_id":"deposit-7-1787514585448","order_description":"Foodplug deposit","price_amount":"23","price_currency":"USD","pay_currency":null,"ipn_callback_url":"http://60eb9f5d-ef31-47de-92bf-a81960675cd5-00-27infsunozyud.spock.replit.dev/api/webhooks/nowpayments","invoice_url":"https://nowpayments.io/payment/?iid=5956634584","success_url":"http://60eb9f5d-ef31-47de-92bf-a81960675cd5-00-27infsunozyud.spock.replit.dev/deposit","cancel_url":"http://60eb9f5d-ef31-47de-92bf-a81960675cd5-00-27infsunozyud.spock.replit.dev/deposit","customer_email":null,"partially_paid_url":null,"payout_currency":null,"created_at":"2026-08-23T19:49:45.606Z","updated_at":"2026-08-23T19:49:45.606Z","is_fixed_rate":false,"is_fee_paid_by_user":false,"source":null,"collect_user_data":false,"url":"https://nowpayments.io/payment/?iid=5956634584"}}	2026-08-23 19:49:45.696235	2026-08-23 19:49:45.696235
4	7	5070399764	500	USD	expired	deposit	\N	https://nowpayments.io/payment/?iid=5070399764	{"nowpaymentsResponse":{"id":"5070399764","token_id":"6392173195","order_id":"deposit-7-1787514602944","order_description":"Foodplug deposit","price_amount":"5","price_currency":"USD","pay_currency":null,"ipn_callback_url":"http://60eb9f5d-ef31-47de-92bf-a81960675cd5-00-27infsunozyud.spock.replit.dev/api/webhooks/nowpayments","invoice_url":"https://nowpayments.io/payment/?iid=5070399764","success_url":"http://60eb9f5d-ef31-47de-92bf-a81960675cd5-00-27infsunozyud.spock.replit.dev/deposit","cancel_url":"http://60eb9f5d-ef31-47de-92bf-a81960675cd5-00-27infsunozyud.spock.replit.dev/deposit","customer_email":null,"partially_paid_url":null,"payout_currency":null,"created_at":"2026-08-23T19:50:03.060Z","updated_at":"2026-08-23T19:50:03.060Z","is_fixed_rate":false,"is_fee_paid_by_user":false,"source":null,"collect_user_data":false,"url":"https://nowpayments.io/payment/?iid=5070399764"}}	2026-08-23 19:50:03.147686	2026-08-23 19:50:03.147686
5	7	6a8b7493e947fc657a05b028	22300	USD	pending	deposit	\N	https://plisio.net/invoice/6a8b7493e947fc657a05b028	{"provider":"plisio","merchantOrderNumber":"deposit-7-e1aedeb8-d8ba-4cea-8519-c9f1f94bca67","currency":"BTC"}	2026-08-23 22:30:42.359411	2026-08-23 22:30:43.534
6	7	6a8bce2e56316615fd0d6fd3	1000	SOL	pending	deposit	\N	https://plisio.net/invoice/6a8bce2e56316615fd0d6fd3	{"provider":"plisio","merchantOrderNumber":"deposit-7-9999fce5-bcd8-46f9-ad75-8358bd22549d","currency":"SOL"}	2026-08-24 04:53:02.092731	2026-08-24 04:53:02.987
7	7	6a8bcfd374bb53f75e0e3ae6	21200	ETH	pending	deposit	\N	https://plisio.net/invoice/6a8bcfd374bb53f75e0e3ae6	{"provider":"plisio","merchantOrderNumber":"deposit-7-4bf04c6e-faef-41af-ba35-873b510dd9e0","currency":"ETH"}	2026-08-24 05:00:01.066022	2026-08-24 05:00:03.12
8	7	6a8bd0bf5b18de8c3e0d405a	1200	ETH	pending	deposit	\N	https://plisio.net/invoice/6a8bd0bf5b18de8c3e0d405a	{"provider":"plisio","merchantOrderNumber":"deposit-7-0dc44dd9-04a4-4200-b515-a4a8a0c074cf","currency":"ETH"}	2026-08-24 05:03:57.843025	2026-08-24 05:03:59.905
\.


--
-- Data for Name: discount_codes; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.discount_codes (id, code, type, value, min_order, max_uses, used_count, is_active, expires_at, created_at) FROM stdin;
1	12	percent	12	0	\N	1	t	\N	2026-08-24 16:01:36.656986
\.


--
-- Data for Name: mail_reads; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.mail_reads (id, mail_id, user_id, read_at) FROM stdin;
\.


--
-- Data for Name: mails; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.mails (id, title, body, sender_id, recipient_id, created_at) FROM stdin;
\.


--
-- Data for Name: order_items; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.order_items (id, order_id, variant_id, stock_item_id, card_id, item_type, price, quantity) FROM stdin;
10	24	\N	\N	11	card	2300	1
11	25	\N	\N	12	card	200	1
12	32	\N	\N	13	card	100	1
13	36	\N	\N	16	card	200	1
14	36	\N	\N	15	card	200	1
15	36	\N	\N	14	card	200	1
16	37	\N	\N	24	card	100	1
17	38	\N	\N	23	card	100	1
18	39	\N	\N	\N	card	100	1
\.


--
-- Data for Name: orders; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.orders (id, order_id, user_id, status, total, paid_amount, delivery_content, payment_method, payment_note, created_at) FROM stdin;
39	CARD-jy0je5xxd7	7	refunded	90	90	4934522027740089|United States of America (the)|4934522027740089|10/2026|000|7165732137|jet1jello@hotmail.com|47.17.158.125|US|CT|Weston|51 old Hyde rd|06883	wallet		2026-08-24 18:10:20.627285
41	4azwaclhathb21cvbnva7p	7	waiting_payment	1200	0		Venmo	Coffee - 38639	2026-08-24 19:19:46.134011
40	nbdghftxmegbeb82vekw59	7	fulfilled	500	500		CashApp	Snack - 36968	2026-08-24 19:13:39.598824
22	peoaoq2ngvqpg1s7m3z59	7	refunded	100	100		CashApp	Lunch - 3548	2026-08-21 23:00:07.914195
23	yr7z7stqske6lcaljgdou3	7	fulfilled	10000	10000		CashApp	Gas - 45931	2026-08-22 01:50:50.871171
24	CARD-21sasczlkrv	7	fulfilled	2254	2254	Unknown|dese	wallet		2026-08-22 02:31:35.3171
25	CARD-46rmn68klex	7	fulfilled	196	196	4147202597609633|United States of America (the)|4147202597609633|03|28|554|Mercedes Smith|1353 Congo Drive|Poinciana|FL|34759|UNITED STATES	wallet		2026-08-22 02:33:03.233018
26	8jleoesoq1nzoy8lwknd1	7	fulfilled	400	400		CashApp	Snack - 4626	2026-08-22 02:54:57.651685
30	82j0k3fe056ir8cc2ylxa	7	fulfilled	500	500		CashApp	Gas - 10268	2026-08-22 05:49:22.31988
29	38atvpmmwwjuhzfktli3ae	7	fulfilled	500	500		CashApp	Food - 73441	2026-08-22 05:41:53.1429
28	uxp6u0o6mnw1b126880xb	7	fulfilled	500	500		CashApp	Snack - 4783	2026-08-22 05:37:06.16684
27	4vfro69j38ejokj0qg69w	7	fulfilled	500	500		CashApp	Lunch - 68849	2026-08-22 05:32:41.493397
31	5o9iq19hsdeo93zpv9ujmg	7	fulfilled	100000	100000		CashApp	Gas - 74243	2026-08-22 14:00:46.694866
32	CARD-cnl9xzpietk	7	fulfilled	90	90	0076776093|Unknown|26,"CardBank":"THE GOLDEN 1 CREDIT UNION","CardBrand":"0076776093","VendorName":"Sande Walker","CustomTag":"Sande Walker","Raw":"THE GOLDEN 1 CREDIT UNION | Account: 0076776093 | Routing: 321175261 | Name: Sande Walker | Address: 231 Selby Ranch Rd. #2 95864 | Extra: Sande Walker | City: Sacramento | State: CA | Balance: $997.26","VendorID":""}\nWELLS FARGO BANK | Account: 3913024463 | Routing: 053000219 | Name: Joseph Derusha | Address: 1007 Toquima Trail 28110 | Extra: JoeDerusha | City: Monroe | State: NC | Balance: $2,538.84\nWELLS FARGO BANK NA | Account: 5570119585 | Routing: 125008547 | Name: Dylan Wong | Address: 9494 Carroll Canyon Road 92126 | Extra: EVERYDAY CHECKING | City: Sunnyvale | State: CA | Balance: $458.13\nBMO HARRIS BANK N.A. | Account: 058622481 | Routing: 071025661 | Name: Theresa Fisher | Address: 390 NW Blackberry Street 50263 | Extra: Bmo | City: Waukee | State: IA | Balance: $577.51\nPLATTE VALLEY BANK | Account: 0382 | Routing: 104908134 | Name: Alex Hall | Address: 2327 S. 142nd Court 68144 | Extra: Alexander Hall | City: Omaha | State: NE | Balance: $1,143.84\nBANK OF AMERICA N.A. | Account: 385022276663 | Routing: 011900254 | Name: Tyler St Amand | Address: 2021 Lemans Blvd #6111 33607 | Extra: Tyler Checking Account | City: Tampa | State: FL | Balance: $1248.37\nFIFTH THIRD BANK | Account: 7992283429 | Routing: 042000314 | Name: Keitha Johnson | Address: Paramount Launch LLC  | Extra: F3B | City: Cincinnati | State: OH | Balance: $561.80\nCAPITAL ONE N.A. | Account: 36132660256 | Routing: 031176110 | Name: Madison Koster | Address: 19115 Sandelford Dr 77449 | Extra: Matthew Burt | City: Katy | State: TX | Balance: $350.16\nTD BANK, NA | Account: 4246880507 | Routing: 031201360 | Name: Blake Duffy | Address: 29 Matawan Rd, Apt A 08879 | Extra: Blake Duffy | City: Laurence Harbor | State: NJ | Balance: $985.12\nWELLS FARGO BANK | Account: 3453975439 | Routing: 061000227 | Name: Taylor Yarborough | Address: 400 Flat Creek Dr. 30534 | Extra: Kaila Billingsley | City: Cumming | State: GA | Balance: $360.02\nWELLS FARGO BANK NA  (MINNESOTA) | Account: 7783530400 | Routing: 091000019 | Name: William Schmakel | Address: 10155 Greenbrier Road # 103 55305 | Extra: Wellsfargo | City: Minnetonka | State: MN | Balance: $356.24\nBANK OF AMERICA, N.A. | Account: 004645577541 | Routing: 011000138 | Name: Omkar Kulkarni | Address: 21 East Street B410 02760 | Extra: BoFa | City: North Attleboro | State: MA | Balance: $516.72\nNEW YORK COMMUNITY BANK | Account: 210102927 | Routing: 226071004 | Name: Scott Dubin | Address: 156 Lake Balaton Dr 44128 | Extra: My Community Free Checking | City: Woodmere | State: OH | Balance: $467.52\nBANK OF AMERICA, N.A. | Account: 000214767992 | Routing: 121000358 | Name: Chelsea Kelley | Address: 730 Cieneguitas Road 93110 | Extra: Chelsea Kelley | City: Santa Barbara | State: CA | Balance: $493.06\nWELLS FARGO BANK | Account: 2984974861 | Routing: 021200025 | Name: Dylan McBride | Address: 163 3rd Street 07030 | Extra: Dylan McBride | City: Hoboken | State: NJ | Balance: $937.51\n{"ID":"81cdf353-f50a-e499-2f28-b3c32bde179e","Bin":"704313","City":"Newport News","State":"VA","Zip":"23606","Expire":"","Country":"US","Price":"$330.81","PriceValue":330.81,"CardBank":"NAVY FEDERAL CREDIT UNION","CardBrand":"7043138820","VendorName":"Nash R. Kleisner","CustomTag":"Nash R Kleisner","Raw":"NAVY FEDERAL CREDIT UNION | Account: 7043138820 | Routing: 256074974 | Name: Nash R. Kleisner | Address: 677 Tech Center Parkway #1207 23606 | Extra: Nash R Kleisner | City: Newport News | State: VA | Balance: $330.81","VendorID":""}\nBANK OF AMERICA N.A. | Account: 005041038007 | Routing: 101100045 | Name: Tessa Vickers | Address: 1580 Detroit St #102 80206 | Extra: Bank of America | City: Denver | State: CO | Balance: $794.02\nJPMORGAN CHASE BANK NA | Account: 00100000176260886 | Routing: 028000121 | Name: Shane Williams | Address: 441 33rd St N Apt # 0105 33713 | Extra: TOTAL CHECKING | City: St. Petersburg | State: FL | Balance: $475.63	wallet		2026-08-23 22:04:35.617755
36	0qm4qhxbv7a82crl13riuu	7	delivering	475	475	{}			2026-08-24 16:04:40.628536
37	CARD-h7y5f7t5pq9	7	fulfilled	90	90	5432761126944614|United States of America (the)|5432761126944614|02/2027|158|7407078281|helenheskett@yahoo.com|166.216.159.47|US|OH|Lancaster|729 Pennsylvania ave|43130	wallet		2026-08-24 16:23:24.717976
33	mmlyexi8yp15gzjahwgb5	7	waiting_payment	2300	0		Venmo	Coffee - 21628	2026-08-24 15:32:02.284424
34	epqfhha7p3go2kt9ixfz2p	7	waiting_payment	1200	0		Venmo	Lunch - 7870	2026-08-24 15:32:22.800344
35	rcar5vs3zhxkft5sbnm9i	7	waiting_payment	100	0		Venmo	Lunch - 83741	2026-08-24 16:00:16.282337
38	CARD-zcxaesur0ke	7	fulfilled	90	90	5314620078198764|United States of America (the)|5314620078198764|05/2027|704|2345212367|epowelljr2@gmail.com|228.117.240.124|US|OH|Canton|1638 Miami Ct N E|44714	wallet		2026-08-24 17:23:18.60778
\.


--
-- Data for Name: product_categories; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.product_categories (id, name, normalized_name, created_at, updated_at) FROM stdin;
3	Food	food	2026-09-01 02:54:04.012559	2026-09-01 02:54:06.508
\.


--
-- Data for Name: products; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.products (id, name, description, image, active, created_at, pinned, category) FROM stdin;
6	dsd	asd		t	2026-08-21 20:37:47.152649	f	
8	12			t	2026-09-01 21:27:51.435618	f	Food
9	12	12		t	2026-09-01 21:27:59.203345	f	Food
\.


--
-- Data for Name: redeem_codes; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.redeem_codes (id, code, amount, is_used, used_by, created_at) FROM stdin;
1	VOUCH-FT4VW6GO	50000	t	3	2026-05-02 13:51:40.055863
2	VOUCH-MTI2N1XIXFN2	100	t	7	2026-09-01 02:52:03.847556
\.


--
-- Data for Name: referral_usages; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.referral_usages (id, referrer_id, redeemer_id, code, created_at) FROM stdin;
\.


--
-- Data for Name: seller_applications; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.seller_applications (id, user_id, status, seller_code, note, created_at) FROM stdin;
1	3	approved	TRENT-JZN4-ME5V		2026-05-01 01:12:22.671169
2	4	approved	TRENT-A96T-IWFB		2026-05-02 21:01:29.789459
\.


--
-- Data for Name: session; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.session (sid, sess, expire) FROM stdin;
zCWb_20YeKotInThNd2ibKOhYKHKZ6Xp	{"cookie":{"originalMaxAge":2592000000,"expires":"2026-10-02T21:05:00.549Z","secure":false,"httpOnly":true,"path":"/","sameSite":"lax"},"captcha":{"answerHash":"f6e56ea4a4e45456a429ebe26ae0bf88cd4c66aea66946b2bc0fa62c9eb2c5f7","expiresAt":1788383400549}}	2026-10-02 21:05:01
Bt8ungf1cwemv0Zpl0RvaFN31xclzi3E	{"cookie":{"originalMaxAge":2592000000,"expires":"2026-10-02T20:36:18.403Z","secure":false,"httpOnly":true,"path":"/","sameSite":"lax"},"captcha":{"answerHash":"6cf459a5b875021e975e460add2c526f7c2290c738b6c9e6d50bae474b2f9d0f","expiresAt":1788381678403}}	2026-10-02 20:36:19
NUEC99v-kmkHaJyy8mCxVU4Bs-KE-5LR	{"cookie":{"originalMaxAge":2592000000,"expires":"2026-10-02T21:27:03.271Z","secure":false,"httpOnly":true,"path":"/","sameSite":"lax"},"captcha":{"answerHash":"4a1aee27b901ef9d0b5123801ae0e7be54de0501a69a9a45ab3ad3f1a1479db1","expiresAt":1788384723271}}	2026-10-02 21:27:04
yDPwwKEtH3it3vWXi9SiVrVcOmEBxZLC	{"cookie":{"originalMaxAge":2592000000,"expires":"2026-10-01T00:26:46.549Z","secure":false,"httpOnly":true,"path":"/","sameSite":"lax"},"passport":{"user":7}}	2026-10-02 19:32:28
TySGGh6HaDILitjmfqdsbFmf32iHTzmV	{"cookie":{"originalMaxAge":2592000000,"expires":"2026-10-02T20:01:22.208Z","secure":false,"httpOnly":true,"path":"/","sameSite":"lax"}}	2026-10-02 20:01:23
9vus1PoI_3HFHUCOQQSpxTVPVENmS7T-	{"cookie":{"originalMaxAge":2592000000,"expires":"2026-10-02T20:01:31.955Z","secure":false,"httpOnly":true,"path":"/","sameSite":"lax"}}	2026-10-02 20:01:32
yY46iFNNho7uH46_uOVuliq5PTZ3QHTm	{"cookie":{"originalMaxAge":2592000000,"expires":"2026-09-21T02:18:59.932Z","secure":false,"httpOnly":true,"path":"/","sameSite":"lax"},"passport":{"user":7}}	2026-09-22 19:17:32
arKUZdWR7KMTUOQzLKQtChinO4mVthnE	{"cookie":{"originalMaxAge":2592000000,"expires":"2026-09-21T04:12:36.147Z","secure":false,"httpOnly":true,"path":"/","sameSite":"lax"},"passport":{"user":7}}	2026-09-21 05:57:25
YKo1QCUsElE0ceIQwbixYeV05U695gH7	{"cookie":{"originalMaxAge":2592000000,"expires":"2026-09-23T18:10:09.382Z","secure":false,"httpOnly":true,"path":"/","sameSite":"lax"},"passport":{"user":7}}	2026-10-01 00:00:59
PDbmzvTSaDKKz--X_3OzGegQKyT1feWY	{"cookie":{"originalMaxAge":2592000000,"expires":"2026-10-03T17:33:38.940Z","secure":false,"httpOnly":true,"path":"/","sameSite":"lax"},"passport":{"user":7}}	2026-10-03 19:10:38
-dnQuC17sSL9G_YOVNsmM_7W5kF1-lll	{"cookie":{"originalMaxAge":2592000000,"expires":"2026-09-23T14:27:28.145Z","secure":false,"httpOnly":true,"path":"/","sameSite":"lax"},"passport":{"user":7}}	2026-09-23 15:33:20
LExQAQtj8ml31EX2n2NM_ABC3ACZgU50	{"cookie":{"originalMaxAge":2592000000,"expires":"2026-09-15T03:24:36.900Z","secure":false,"httpOnly":true,"path":"/","sameSite":"lax"},"passport":{"user":31}}	2026-09-15 03:31:25
BsVxQy3cdFXrW4dDEWdOgrXqGzvM8iMa	{"cookie":{"originalMaxAge":2592000000,"expires":"2026-10-02T21:16:23.364Z","secure":false,"httpOnly":true,"path":"/","sameSite":"lax"},"captcha":{"answerHash":"94df72a98c795929c8626f8c1de5fb49e5d47a035f66e466a1ef567850319ad3","expiresAt":1788384083364}}	2026-10-02 21:16:24
wvCUP-MrdnubZ9v3beyaFDW6yVq-855I	{"cookie":{"originalMaxAge":2592000000,"expires":"2026-09-29T23:40:51.206Z","secure":false,"httpOnly":true,"path":"/","sameSite":"lax"},"passport":{"user":18}}	2026-09-29 23:40:52
8Mnq4bJfi2rsJWnM07KEzJ4IkXhfaUsA	{"cookie":{"originalMaxAge":2592000000,"expires":"2026-09-23T04:46:58.436Z","secure":false,"httpOnly":true,"path":"/","sameSite":"lax"},"passport":{"user":7}}	2026-09-23 17:46:12
hXjebkdVY1d4cI1Eg_OvmeSGCQmAOF_e	{"cookie":{"originalMaxAge":2592000000,"expires":"2026-10-02T20:02:24.278Z","secure":false,"httpOnly":true,"path":"/","sameSite":"lax"},"captcha":{"answerHash":"ed23fea1e65ae8d1eb41df5da95db76f2108e72148ac3f99709945445441449f","expiresAt":1788379644278}}	2026-10-02 20:02:25
AqyBTQ_vDRU1SXg3UZdwi69-lgPfHHvQ	{"cookie":{"originalMaxAge":2592000000,"expires":"2026-10-03T15:41:35.879Z","secure":false,"httpOnly":true,"path":"/","sameSite":"lax"},"captcha":{"answerHash":"8db4fe518c91a42033c7bd2dc218e7b1b46028475762b75e1bc8a95d4019d346","expiresAt":1788450395879}}	2026-10-03 15:41:36
QO_upZZ5fM7e2DlcIk2ZsvvzO0wX2ypG	{"cookie":{"originalMaxAge":2592000000,"expires":"2026-10-02T22:35:16.806Z","secure":false,"httpOnly":true,"path":"/","sameSite":"lax"},"captcha":{"answerHash":"a7d302addde9ce6d5d6a6459e263d079e27d8faec5cfc07ef97c7e8d9412cbea","expiresAt":1788388816805}}	2026-10-02 22:35:18
-Mqc1ZLkNkzTz7vbC15yqkuRaa0acqk3	{"cookie":{"originalMaxAge":2592000000,"expires":"2026-09-15T18:08:51.720Z","secure":false,"httpOnly":true,"path":"/","sameSite":"lax"},"passport":{"user":18}}	2026-09-15 21:04:45
\.


--
-- Data for Name: site_settings; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.site_settings (key, value, is_secret, enabled, kind, label, updated_at) FROM stdin;
min_deposit_chime	10	f	t	text	\N	2026-08-22 05:59:20.028385
cashapp_fee	0	f	t	text	\N	2026-08-22 05:59:20.028385
payment_method_cashapp	true	f	t	text	\N	2026-08-22 05:59:20.028385
payment_method_crypto	true	f	t	text	\N	2026-08-22 05:59:20.028385
payment_method_chime	false	f	t	text	\N	2026-08-22 05:59:20.028385
payment_method_zelle	false	f	t	text	\N	2026-08-22 05:59:20.028385
cashapp_tag	$Jacobgettinmotionx	f	t	text	\N	2026-08-22 05:59:20.028385
feature_reseller	false	f	t	text	\N	2026-08-22 05:59:20.028385
feature_checker	false	f	t	text	\N	2026-08-22 05:59:20.028385
feature_logs	true	f	t	text	\N	2026-08-22 05:59:20.028385
min_deposit_crypto	5	f	t	text	\N	2026-08-22 05:59:20.028385
min_deposit_cashapp	5	f	t	text	\N	2026-08-22 05:59:20.028385
feature_cards	true	f	t	text	\N	2026-08-23 22:57:15.589
feature_ranks	true	f	t	text	\N	2026-08-23 22:57:44.213
plisio_api_key	enc:v1:SrWXiczf7Z_KV3Il:VfNpDkej_1PsflrDttCx_A:YXv8KIKX1ALihsMan5HPCYQPG56aa1BGNiYs1-KHGf-qQ4QzvEMAG4eOzuqKUQBH2lWUuIz_040TuRA_Gl2OMw	t	t	secret	Plisio Secret Key	2026-08-24 04:52:42.365
plisio_public_app_url	https:/nychq.cc	f	t	url	Crypto Checkout Public App URL	2026-08-24 04:52:43.448
payment_method_venmo	true	f	t	text	\N	2026-08-24 15:31:45.915
venmo_handle	232rs	f	t	text	\N	2026-08-24 15:31:53.775
chime_description	instant	f	t	text	\N	2026-08-24 16:16:04.898
cashapp_description	instant	f	t	text	\N	2026-08-24 16:16:18.433
credit_bot_telegram_token	enc:v1:qDgUdb-5nRMgIgEp:VVICqDPdsohvEsgEcq58Tg:e-9IB1H7tGYjvieF9JzMuYeB3sh0suSAnv7a70W1cWdmJcYkbCl1LqVlE772LQ	t	t	secret	Credit Bot Telegram Token	2026-09-03 18:54:49.355049
credit_bot_channel_id		f	t	text	Credit Bot Main Channel ID	2026-09-03 18:54:49.362643
credit_bot_enabled	true	f	t	text	Credit Bot Enabled	2026-09-03 18:57:02.511
\.


--
-- Data for Name: stock_items; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.stock_items (id, variant_id, content, is_sold, is_reserved, order_id, replacement_for_id, created_at, seller_id) FROM stdin;
\.


--
-- Data for Name: support_tickets; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.support_tickets (id, user_id, order_id, subject, description, image_url, status, admin_message, created_at) FROM stdin;
1	18	ORD8228	Refund	Invalid		refunded	\N	2026-08-16 18:37:53.29444
2	7	peoaoq2ngvqpg1s7m3z59	Refund	wqw		refunded	\N	2026-08-22 01:48:24.424063
3	7	CARD-jy0je5xxd7	Refund	refund		refunded	ok	2026-08-24 18:12:48.444844
\.


--
-- Data for Name: telegram_link_tokens; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.telegram_link_tokens (id, token, user_id, created_at) FROM stdin;
5	2677619354928919	7	2026-09-03 18:57:23.967024
\.


--
-- Data for Name: telegram_referral_pending; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.telegram_referral_pending (chat_id, referrer_user_id, created_at) FROM stdin;
\.


--
-- Data for Name: transactions; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.transactions (id, user_id, amount, type, description, payment_method, created_at) FROM stdin;
12	18	25	telegram_name_reward	Daily foodplug.lol name reward	\N	2026-08-16 21:01:41.054823
13	7	100	deposit	CashApp deposit confirmed (peoaoq2ngvqpg1s7m3z59)	CashApp	2026-08-22 01:07:20.41293
14	7	-100	loss	Plinko game bet	\N	2026-08-22 01:07:26.739353
15	7	30	win	Plinko game payout	\N	2026-08-22 01:07:26.739353
16	7	100	refund	Refund for order #peoaoq2ngvqpg1s7m3z59	\N	2026-08-22 01:48:36.468864
17	7	-100	loss	Plinko game bet	\N	2026-08-22 01:49:38.892165
18	7	60	win	Plinko game payout	\N	2026-08-22 01:49:38.892165
19	7	10000	deposit	CashApp deposit confirmed (yr7z7stqske6lcaljgdou3)	CashApp	2026-08-22 01:51:00.569456
20	7	-100	loss	Plinko game bet	\N	2026-08-22 01:51:05.223297
21	7	35	win	Plinko game payout	\N	2026-08-22 01:51:05.223297
22	7	-100	loss	Plinko game bet	\N	2026-08-22 01:51:15.049155
23	7	20	win	Plinko game payout	\N	2026-08-22 01:51:15.049155
24	7	-100	loss	Plinko game bet	\N	2026-08-22 01:51:19.651883
25	7	20	win	Plinko game payout	\N	2026-08-22 01:51:19.651883
26	7	-100	loss	Plinko game bet	\N	2026-08-22 01:51:22.506775
27	7	20	win	Plinko game payout	\N	2026-08-22 01:51:22.506775
28	7	-100	loss	Plinko game bet	\N	2026-08-22 01:51:25.191701
29	7	60	win	Plinko game payout	\N	2026-08-22 01:51:25.191701
30	7	-100	loss	Plinko game bet	\N	2026-08-22 01:51:29.85132
31	7	10	win	Plinko game payout	\N	2026-08-22 01:51:29.85132
32	7	-100	loss	Plinko game bet	\N	2026-08-22 01:51:42.396376
33	7	20	win	Plinko game payout	\N	2026-08-22 01:51:42.396376
34	7	-100	loss	Plinko game bet	\N	2026-08-22 01:51:44.749039
35	7	10	win	Plinko game payout	\N	2026-08-22 01:51:44.749039
36	7	-100	loss	Plinko game bet	\N	2026-08-22 01:51:46.984445
37	7	60	win	Plinko game payout	\N	2026-08-22 01:51:46.984445
38	7	-500	loss	Plinko game bet	\N	2026-08-22 01:56:06.189071
39	7	100	win	Plinko game payout	\N	2026-08-22 01:56:06.189071
40	7	-500	loss	Plinko game bet	\N	2026-08-22 01:57:16.548288
41	7	100	win	Plinko game payout	\N	2026-08-22 01:57:16.548288
42	7	-500	loss	Plinko game bet	\N	2026-08-22 01:57:16.548288
43	7	100	win	Plinko game payout	\N	2026-08-22 01:57:16.548288
44	7	-500	loss	Plinko game bet	\N	2026-08-22 01:57:16.548288
45	7	100	win	Plinko game payout	\N	2026-08-22 01:57:16.548288
46	7	-500	loss	Plinko game bet	\N	2026-08-22 01:57:16.548288
47	7	2500	win	Plinko game payout	\N	2026-08-22 01:57:16.548288
48	7	-500	loss	Plinko game bet	\N	2026-08-22 01:57:16.548288
49	7	100	win	Plinko game payout	\N	2026-08-22 01:57:16.548288
50	7	-500	loss	Plinko game bet	\N	2026-08-22 01:57:16.548288
51	7	100	win	Plinko game payout	\N	2026-08-22 01:57:16.548288
52	7	-500	loss	Plinko game bet	\N	2026-08-22 01:57:16.548288
53	7	50	win	Plinko game payout	\N	2026-08-22 01:57:16.548288
54	7	-500	loss	Plinko game bet	\N	2026-08-22 01:57:16.548288
55	7	100	win	Plinko game payout	\N	2026-08-22 01:57:16.548288
56	7	-500	loss	Plinko game bet	\N	2026-08-22 01:57:16.548288
57	7	300	win	Plinko game payout	\N	2026-08-22 01:57:16.548288
58	7	-500	loss	Plinko game bet	\N	2026-08-22 01:57:16.548288
59	7	175	win	Plinko game payout	\N	2026-08-22 01:57:16.548288
60	7	-500	loss	Plinko game bet	\N	2026-08-22 02:16:37.125473
61	7	50	win	Plinko game payout	\N	2026-08-22 02:16:37.125473
62	7	-500	loss	Plinko game bet	\N	2026-08-22 02:16:37.125473
63	7	175	win	Plinko game payout	\N	2026-08-22 02:16:37.125473
64	7	-500	loss	Plinko game bet	\N	2026-08-22 02:16:37.125473
65	7	100	win	Plinko game payout	\N	2026-08-22 02:16:37.125473
66	7	-500	loss	Plinko game bet	\N	2026-08-22 02:16:37.125473
67	7	175	win	Plinko game payout	\N	2026-08-22 02:16:37.125473
68	7	-500	loss	Plinko game bet	\N	2026-08-22 02:16:37.125473
69	7	100	win	Plinko game payout	\N	2026-08-22 02:16:37.125473
70	7	-500	loss	Plinko game bet	\N	2026-08-22 02:16:37.125473
71	7	100	win	Plinko game payout	\N	2026-08-22 02:16:37.125473
72	7	-500	loss	Plinko game bet	\N	2026-08-22 02:16:37.125473
73	7	100	win	Plinko game payout	\N	2026-08-22 02:16:37.125473
74	7	-500	loss	Plinko game bet	\N	2026-08-22 02:16:37.125473
75	7	100	win	Plinko game payout	\N	2026-08-22 02:16:37.125473
76	7	-500	loss	Plinko game bet	\N	2026-08-22 02:16:37.125473
77	7	500	win	Plinko game payout	\N	2026-08-22 02:16:37.125473
78	7	-500	loss	Plinko game bet	\N	2026-08-22 02:16:37.125473
79	7	300	win	Plinko game payout	\N	2026-08-22 02:16:37.125473
80	7	-200	loss	Plinko game bet	\N	2026-08-22 02:17:26.893946
81	7	70	win	Plinko game payout	\N	2026-08-22 02:17:26.893946
82	7	-200	loss	Plinko game bet	\N	2026-08-22 02:17:26.893946
83	7	20	win	Plinko game payout	\N	2026-08-22 02:17:26.893946
84	7	-200	loss	Plinko game bet	\N	2026-08-22 02:17:26.893946
85	7	70	win	Plinko game payout	\N	2026-08-22 02:17:26.893946
86	7	-200	loss	Plinko game bet	\N	2026-08-22 02:17:26.893946
87	7	40	win	Plinko game payout	\N	2026-08-22 02:17:26.893946
88	7	-200	loss	Plinko game bet	\N	2026-08-22 02:17:26.893946
89	7	70	win	Plinko game payout	\N	2026-08-22 02:17:26.893946
90	7	-200	loss	Plinko game bet	\N	2026-08-22 02:17:26.893946
91	7	40	win	Plinko game payout	\N	2026-08-22 02:17:26.893946
92	7	-200	loss	Plinko game bet	\N	2026-08-22 02:17:26.893946
93	7	70	win	Plinko game payout	\N	2026-08-22 02:17:26.893946
94	7	-200	loss	Plinko game bet	\N	2026-08-22 02:17:26.893946
95	7	70	win	Plinko game payout	\N	2026-08-22 02:17:26.893946
96	7	-200	loss	Plinko game bet	\N	2026-08-22 02:17:26.893946
97	7	40	win	Plinko game payout	\N	2026-08-22 02:17:26.893946
98	7	-200	loss	Plinko game bet	\N	2026-08-22 02:17:26.893946
99	7	20	win	Plinko game payout	\N	2026-08-22 02:17:26.893946
100	7	-2254	purchase	Purchased card 	\N	2026-08-22 02:31:35.306964
101	7	-196	purchase	Purchased card 414720******9633	\N	2026-08-22 02:33:03.22307
102	7	400	deposit	CashApp deposit confirmed (8jleoesoq1nzoy8lwknd1)	CashApp	2026-08-22 02:55:12.7568
103	7	-500	loss	Plinko game bet	\N	2026-08-22 03:35:39.68372
104	7	100	win	Plinko game payout	\N	2026-08-22 03:35:39.68372
105	7	-100	loss	Plinko game bet	\N	2026-08-22 03:40:32.525168
106	7	20	win	Plinko game payout	\N	2026-08-22 03:40:32.525168
107	7	-100	loss	Plinko game bet	\N	2026-08-22 05:27:15.288059
108	7	10	win	Plinko game payout	\N	2026-08-22 05:27:15.288059
109	7	-100	loss	Plinko game bet	\N	2026-08-22 05:27:18.203742
110	7	10	win	Plinko game payout	\N	2026-08-22 05:27:18.203742
111	7	-100	loss	Plinko game bet	\N	2026-08-22 05:27:25.71877
112	7	35	win	Plinko game payout	\N	2026-08-22 05:27:25.71877
113	7	-100	loss	Plinko game bet	\N	2026-08-22 05:27:29.611076
114	7	10	win	Plinko game payout	\N	2026-08-22 05:27:29.611076
219	7	-1000	loss	Plinko game bet	\N	2026-08-22 14:01:45.00368
115	7	500	deposit	CashApp deposit confirmed (82j0k3fe056ir8cc2ylxa)	CashApp	2026-08-22 13:40:55.063157
116	7	500	deposit	CashApp deposit confirmed (38atvpmmwwjuhzfktli3ae)	CashApp	2026-08-22 13:40:56.778476
117	7	500	deposit	CashApp deposit confirmed (uxp6u0o6mnw1b126880xb)	CashApp	2026-08-22 13:40:58.376592
118	7	500	deposit	CashApp deposit confirmed (4vfro69j38ejokj0qg69w)	CashApp	2026-08-22 13:40:59.581353
119	7	-100	loss	Plinko game bet	\N	2026-08-22 13:41:06.822633
120	7	10	win	Plinko game payout	\N	2026-08-22 13:41:06.822633
121	7	-100	loss	Plinko game bet	\N	2026-08-22 13:41:06.822633
122	7	20	win	Plinko game payout	\N	2026-08-22 13:41:06.822633
123	7	-100	loss	Plinko game bet	\N	2026-08-22 13:41:06.822633
124	7	35	win	Plinko game payout	\N	2026-08-22 13:41:06.822633
125	7	-100	loss	Plinko game bet	\N	2026-08-22 13:41:06.822633
126	7	20	win	Plinko game payout	\N	2026-08-22 13:41:06.822633
127	7	-100	loss	Plinko game bet	\N	2026-08-22 13:41:06.822633
128	7	10	win	Plinko game payout	\N	2026-08-22 13:41:06.822633
129	7	-100	loss	Plinko game bet	\N	2026-08-22 13:41:06.822633
130	7	20	win	Plinko game payout	\N	2026-08-22 13:41:06.822633
131	7	-100	loss	Plinko game bet	\N	2026-08-22 13:41:06.822633
132	7	20	win	Plinko game payout	\N	2026-08-22 13:41:06.822633
133	7	-100	loss	Plinko game bet	\N	2026-08-22 13:41:06.822633
134	7	20	win	Plinko game payout	\N	2026-08-22 13:41:06.822633
135	7	-100	loss	Plinko game bet	\N	2026-08-22 13:41:06.822633
136	7	20	win	Plinko game payout	\N	2026-08-22 13:41:06.822633
137	7	-100	loss	Plinko game bet	\N	2026-08-22 13:41:06.822633
138	7	35	win	Plinko game payout	\N	2026-08-22 13:41:06.822633
139	7	-100	loss	Plinko game bet	\N	2026-08-22 13:41:12.590484
140	7	35	win	Plinko game payout	\N	2026-08-22 13:41:12.590484
141	7	-100	loss	Plinko game bet	\N	2026-08-22 13:41:12.590484
142	7	20	win	Plinko game payout	\N	2026-08-22 13:41:12.590484
143	7	-100	loss	Plinko game bet	\N	2026-08-22 13:41:12.590484
144	7	35	win	Plinko game payout	\N	2026-08-22 13:41:12.590484
145	7	-100	loss	Plinko game bet	\N	2026-08-22 13:41:12.590484
146	7	35	win	Plinko game payout	\N	2026-08-22 13:41:12.590484
147	7	-100	loss	Plinko game bet	\N	2026-08-22 13:41:12.590484
148	7	20	win	Plinko game payout	\N	2026-08-22 13:41:12.590484
149	7	-100	loss	Plinko game bet	\N	2026-08-22 13:41:12.590484
150	7	20	win	Plinko game payout	\N	2026-08-22 13:41:12.590484
151	7	-100	loss	Plinko game bet	\N	2026-08-22 13:41:12.590484
152	7	10	win	Plinko game payout	\N	2026-08-22 13:41:12.590484
153	7	-100	loss	Plinko game bet	\N	2026-08-22 13:41:12.590484
154	7	35	win	Plinko game payout	\N	2026-08-22 13:41:12.590484
155	7	-100	loss	Plinko game bet	\N	2026-08-22 13:41:12.590484
156	7	20	win	Plinko game payout	\N	2026-08-22 13:41:12.590484
157	7	-100	loss	Plinko game bet	\N	2026-08-22 13:41:12.590484
158	7	20	win	Plinko game payout	\N	2026-08-22 13:41:12.590484
159	7	-100	loss	Plinko game bet	\N	2026-08-22 13:51:14.627309
160	7	30	win	Plinko game payout	\N	2026-08-22 13:51:14.627309
161	7	-100	loss	Plinko game bet	\N	2026-08-22 13:51:19.95917
162	7	50	win	Plinko game payout	\N	2026-08-22 13:51:19.95917
163	7	-100	loss	Plinko game bet	\N	2026-08-22 13:51:29.045041
164	7	30	win	Plinko game payout	\N	2026-08-22 13:51:29.045041
165	7	-100	loss	Plinko game bet	\N	2026-08-22 13:51:34.23948
166	7	75	win	Plinko game payout	\N	2026-08-22 13:51:34.23948
167	7	100000	deposit	CashApp deposit confirmed (5o9iq19hsdeo93zpv9ujmg)	CashApp	2026-08-22 14:01:11.170857
168	7	20000	deposit_bonus	Deposit bonus (+20%)	CashApp	2026-08-22 14:01:11.175534
169	7	-1000	loss	Plinko game bet	\N	2026-08-22 14:01:28.830071
170	7	750	win	Plinko game payout	\N	2026-08-22 14:01:28.830071
171	7	-1000	loss	Plinko game bet	\N	2026-08-22 14:01:28.830071
172	7	750	win	Plinko game payout	\N	2026-08-22 14:01:28.830071
173	7	-1000	loss	Plinko game bet	\N	2026-08-22 14:01:28.830071
174	7	500	win	Plinko game payout	\N	2026-08-22 14:01:28.830071
175	7	-1000	loss	Plinko game bet	\N	2026-08-22 14:01:28.830071
176	7	500	win	Plinko game payout	\N	2026-08-22 14:01:28.830071
177	7	-1000	loss	Plinko game bet	\N	2026-08-22 14:01:28.830071
178	7	750	win	Plinko game payout	\N	2026-08-22 14:01:28.830071
179	7	-1000	loss	Plinko game bet	\N	2026-08-22 14:01:28.830071
180	7	500	win	Plinko game payout	\N	2026-08-22 14:01:28.830071
181	7	-1000	loss	Plinko game bet	\N	2026-08-22 14:01:28.830071
182	7	1000	win	Plinko game payout	\N	2026-08-22 14:01:28.830071
183	7	-1000	loss	Plinko game bet	\N	2026-08-22 14:01:28.830071
184	7	750	win	Plinko game payout	\N	2026-08-22 14:01:28.830071
185	7	-1000	loss	Plinko game bet	\N	2026-08-22 14:01:28.830071
186	7	1000	win	Plinko game payout	\N	2026-08-22 14:01:28.830071
187	7	-1000	loss	Plinko game bet	\N	2026-08-22 14:01:28.830071
188	7	1000	win	Plinko game payout	\N	2026-08-22 14:01:28.830071
189	7	-1000	loss	Plinko game bet	\N	2026-08-22 14:01:36.357236
190	7	750	win	Plinko game payout	\N	2026-08-22 14:01:36.357236
191	7	-1000	loss	Plinko game bet	\N	2026-08-22 14:01:36.357236
192	7	10000	win	Plinko game payout	\N	2026-08-22 14:01:36.357236
193	7	-1000	loss	Plinko game bet	\N	2026-08-22 14:01:36.357236
194	7	750	win	Plinko game payout	\N	2026-08-22 14:01:36.357236
195	7	-1000	loss	Plinko game bet	\N	2026-08-22 14:01:36.357236
196	7	750	win	Plinko game payout	\N	2026-08-22 14:01:36.357236
197	7	-1000	loss	Plinko game bet	\N	2026-08-22 14:01:36.357236
198	7	10000	win	Plinko game payout	\N	2026-08-22 14:01:36.357236
199	7	-1000	loss	Plinko game bet	\N	2026-08-22 14:01:36.357236
200	7	10000	win	Plinko game payout	\N	2026-08-22 14:01:36.357236
201	7	-1000	loss	Plinko game bet	\N	2026-08-22 14:01:36.357236
202	7	10000	win	Plinko game payout	\N	2026-08-22 14:01:36.357236
203	7	-1000	loss	Plinko game bet	\N	2026-08-22 14:01:36.357236
204	7	500	win	Plinko game payout	\N	2026-08-22 14:01:36.357236
205	7	-1000	loss	Plinko game bet	\N	2026-08-22 14:01:36.357236
206	7	750	win	Plinko game payout	\N	2026-08-22 14:01:36.357236
207	7	-1000	loss	Plinko game bet	\N	2026-08-22 14:01:36.357236
208	7	2000	win	Plinko game payout	\N	2026-08-22 14:01:36.357236
209	7	-1000	loss	Plinko game bet	\N	2026-08-22 14:01:45.00368
210	7	750	win	Plinko game payout	\N	2026-08-22 14:01:45.00368
211	7	-1000	loss	Plinko game bet	\N	2026-08-22 14:01:45.00368
212	7	750	win	Plinko game payout	\N	2026-08-22 14:01:45.00368
213	7	-1000	loss	Plinko game bet	\N	2026-08-22 14:01:45.00368
214	7	10000	win	Plinko game payout	\N	2026-08-22 14:01:45.00368
215	7	-1000	loss	Plinko game bet	\N	2026-08-22 14:01:45.00368
216	7	300	win	Plinko game payout	\N	2026-08-22 14:01:45.00368
217	7	-1000	loss	Plinko game bet	\N	2026-08-22 14:01:45.00368
218	7	750	win	Plinko game payout	\N	2026-08-22 14:01:45.00368
220	7	750	win	Plinko game payout	\N	2026-08-22 14:01:45.00368
221	7	-1000	loss	Plinko game bet	\N	2026-08-22 14:01:45.00368
222	7	750	win	Plinko game payout	\N	2026-08-22 14:01:45.00368
223	7	-1000	loss	Plinko game bet	\N	2026-08-22 14:01:45.00368
224	7	10000	win	Plinko game payout	\N	2026-08-22 14:01:45.00368
225	7	-1000	loss	Plinko game bet	\N	2026-08-22 14:01:45.00368
226	7	2000	win	Plinko game payout	\N	2026-08-22 14:01:45.00368
227	7	-1000	loss	Plinko game bet	\N	2026-08-22 14:01:45.00368
228	7	1000	win	Plinko game payout	\N	2026-08-22 14:01:45.00368
229	7	-1000	loss	Plinko game bet	\N	2026-08-22 14:01:51.369224
230	7	300	win	Plinko game payout	\N	2026-08-22 14:01:51.369224
231	7	-1000	loss	Plinko game bet	\N	2026-08-22 14:01:51.369224
232	7	500	win	Plinko game payout	\N	2026-08-22 14:01:51.369224
233	7	-1000	loss	Plinko game bet	\N	2026-08-22 14:01:51.369224
234	7	5000	win	Plinko game payout	\N	2026-08-22 14:01:51.369224
235	7	-1000	loss	Plinko game bet	\N	2026-08-22 14:01:51.369224
236	7	5000	win	Plinko game payout	\N	2026-08-22 14:01:51.369224
237	7	-1000	loss	Plinko game bet	\N	2026-08-22 14:01:51.369224
238	7	500	win	Plinko game payout	\N	2026-08-22 14:01:51.369224
239	7	-1000	loss	Plinko game bet	\N	2026-08-22 14:01:51.369224
240	7	750	win	Plinko game payout	\N	2026-08-22 14:01:51.369224
241	7	-1000	loss	Plinko game bet	\N	2026-08-22 14:01:51.369224
242	7	10000	win	Plinko game payout	\N	2026-08-22 14:01:51.369224
243	7	-1000	loss	Plinko game bet	\N	2026-08-22 14:01:51.369224
244	7	1000	win	Plinko game payout	\N	2026-08-22 14:01:51.369224
245	7	-1000	loss	Plinko game bet	\N	2026-08-22 14:01:51.369224
246	7	750	win	Plinko game payout	\N	2026-08-22 14:01:51.369224
247	7	-1000	loss	Plinko game bet	\N	2026-08-22 14:01:51.369224
248	7	10000	win	Plinko game payout	\N	2026-08-22 14:01:51.369224
249	7	-1000	loss	Plinko game bet	\N	2026-08-22 14:02:00.139577
250	7	10000	win	Plinko game payout	\N	2026-08-22 14:02:00.139577
251	7	-1000	loss	Plinko game bet	\N	2026-08-22 14:02:00.139577
252	7	1000	win	Plinko game payout	\N	2026-08-22 14:02:00.139577
253	7	-1000	loss	Plinko game bet	\N	2026-08-22 14:02:00.139577
254	7	2000	win	Plinko game payout	\N	2026-08-22 14:02:00.139577
255	7	-1000	loss	Plinko game bet	\N	2026-08-22 14:02:00.139577
256	7	300	win	Plinko game payout	\N	2026-08-22 14:02:00.139577
257	7	-1000	loss	Plinko game bet	\N	2026-08-22 14:02:00.139577
258	7	300	win	Plinko game payout	\N	2026-08-22 14:02:00.139577
259	7	-1000	loss	Plinko game bet	\N	2026-08-22 14:02:00.139577
260	7	750	win	Plinko game payout	\N	2026-08-22 14:02:00.139577
261	7	-1000	loss	Plinko game bet	\N	2026-08-22 14:02:00.139577
262	7	10000	win	Plinko game payout	\N	2026-08-22 14:02:00.139577
263	7	-1000	loss	Plinko game bet	\N	2026-08-22 14:02:00.139577
264	7	10000	win	Plinko game payout	\N	2026-08-22 14:02:00.139577
265	7	-1000	loss	Plinko game bet	\N	2026-08-22 14:02:00.139577
266	7	1000	win	Plinko game payout	\N	2026-08-22 14:02:00.139577
267	7	-1000	loss	Plinko game bet	\N	2026-08-22 14:02:00.139577
268	7	10000	win	Plinko game payout	\N	2026-08-22 14:02:00.139577
269	7	-100	loss	Plinko game bet	\N	2026-08-22 14:04:22.867255
270	7	75	win	Plinko game payout	\N	2026-08-22 14:04:22.867255
271	7	-100	loss	Plinko game bet	\N	2026-08-22 14:04:22.867255
272	7	50	win	Plinko game payout	\N	2026-08-22 14:04:22.867255
273	7	-100	loss	Plinko game bet	\N	2026-08-22 14:04:22.867255
274	7	75	win	Plinko game payout	\N	2026-08-22 14:04:22.867255
275	7	-100	loss	Plinko game bet	\N	2026-08-22 14:04:22.867255
276	7	75	win	Plinko game payout	\N	2026-08-22 14:04:22.867255
277	7	-100	loss	Plinko game bet	\N	2026-08-22 14:04:22.867255
278	7	75	win	Plinko game payout	\N	2026-08-22 14:04:22.867255
279	7	-100	loss	Plinko game bet	\N	2026-08-22 14:04:22.867255
280	7	75	win	Plinko game payout	\N	2026-08-22 14:04:22.867255
281	7	-100	loss	Plinko game bet	\N	2026-08-22 14:04:22.867255
282	7	75	win	Plinko game payout	\N	2026-08-22 14:04:22.867255
283	7	-100	loss	Plinko game bet	\N	2026-08-22 14:04:22.867255
284	7	30	win	Plinko game payout	\N	2026-08-22 14:04:22.867255
285	7	-100	loss	Plinko game bet	\N	2026-08-22 14:04:22.867255
286	7	1000	win	Plinko game payout	\N	2026-08-22 14:04:22.867255
287	7	-100	loss	Plinko game bet	\N	2026-08-22 14:04:22.867255
288	7	30	win	Plinko game payout	\N	2026-08-22 14:04:22.867255
289	7	-100	loss	Plinko game bet	\N	2026-08-22 14:04:36.355396
290	7	1000	win	Plinko game payout	\N	2026-08-22 14:04:36.355396
291	7	-100	loss	Plinko game bet	\N	2026-08-22 14:04:36.355396
292	7	75	win	Plinko game payout	\N	2026-08-22 14:04:36.355396
293	7	-100	loss	Plinko game bet	\N	2026-08-22 14:04:36.355396
294	7	50	win	Plinko game payout	\N	2026-08-22 14:04:36.355396
295	7	-100	loss	Plinko game bet	\N	2026-08-22 14:04:36.355396
296	7	50	win	Plinko game payout	\N	2026-08-22 14:04:36.355396
297	7	-100	loss	Plinko game bet	\N	2026-08-22 14:04:36.355396
298	7	200	win	Plinko game payout	\N	2026-08-22 14:04:36.355396
299	7	-100	loss	Plinko game bet	\N	2026-08-22 14:04:36.355396
300	7	50	win	Plinko game payout	\N	2026-08-22 14:04:36.355396
301	7	-100	loss	Plinko game bet	\N	2026-08-22 14:04:36.355396
302	7	50	win	Plinko game payout	\N	2026-08-22 14:04:36.355396
303	7	-100	loss	Plinko game bet	\N	2026-08-22 14:04:36.355396
304	7	1000	win	Plinko game payout	\N	2026-08-22 14:04:36.355396
305	7	-100	loss	Plinko game bet	\N	2026-08-22 14:04:36.355396
306	7	100	win	Plinko game payout	\N	2026-08-22 14:04:36.355396
307	7	-100	loss	Plinko game bet	\N	2026-08-22 14:04:36.355396
308	7	75	win	Plinko game payout	\N	2026-08-22 14:04:36.355396
309	7	-100	loss	Plinko game bet	\N	2026-08-22 14:04:54.52999
310	7	200	win	Plinko game payout	\N	2026-08-22 14:04:54.52999
311	7	-100	loss	Plinko game bet	\N	2026-08-22 14:04:54.52999
312	7	75	win	Plinko game payout	\N	2026-08-22 14:04:54.52999
313	7	-100	loss	Plinko game bet	\N	2026-08-22 14:04:54.52999
314	7	50	win	Plinko game payout	\N	2026-08-22 14:04:54.52999
315	7	-100	loss	Plinko game bet	\N	2026-08-22 14:04:54.52999
316	7	200	win	Plinko game payout	\N	2026-08-22 14:04:54.52999
317	7	-100	loss	Plinko game bet	\N	2026-08-22 14:04:54.52999
318	7	50	win	Plinko game payout	\N	2026-08-22 14:04:54.52999
319	7	-100	loss	Plinko game bet	\N	2026-08-22 14:04:54.52999
320	7	100	win	Plinko game payout	\N	2026-08-22 14:04:54.52999
321	7	-100	loss	Plinko game bet	\N	2026-08-22 14:04:54.52999
322	7	75	win	Plinko game payout	\N	2026-08-22 14:04:54.52999
323	7	-100	loss	Plinko game bet	\N	2026-08-22 14:04:54.52999
324	7	50	win	Plinko game payout	\N	2026-08-22 14:04:54.52999
325	7	-100	loss	Plinko game bet	\N	2026-08-22 14:04:54.52999
326	7	100	win	Plinko game payout	\N	2026-08-22 14:04:54.52999
327	7	-100	loss	Plinko game bet	\N	2026-08-22 14:04:54.52999
328	7	100	win	Plinko game payout	\N	2026-08-22 14:04:54.52999
329	7	-1000	loss	Plinko game bet	\N	2026-08-22 14:05:07.206441
330	7	10000	win	Plinko game payout	\N	2026-08-22 14:05:07.206441
331	7	-1000	loss	Plinko game bet	\N	2026-08-22 14:05:07.206441
332	7	750	win	Plinko game payout	\N	2026-08-22 14:05:07.206441
333	7	-1000	loss	Plinko game bet	\N	2026-08-22 14:05:07.206441
334	7	1000	win	Plinko game payout	\N	2026-08-22 14:05:07.206441
335	7	-1000	loss	Plinko game bet	\N	2026-08-22 14:05:07.206441
336	7	2000	win	Plinko game payout	\N	2026-08-22 14:05:07.206441
337	7	-1000	loss	Plinko game bet	\N	2026-08-22 14:05:07.206441
338	7	5000	win	Plinko game payout	\N	2026-08-22 14:05:07.206441
339	7	-1000	loss	Plinko game bet	\N	2026-08-22 14:05:07.206441
340	7	10000	win	Plinko game payout	\N	2026-08-22 14:05:07.206441
341	7	-1000	loss	Plinko game bet	\N	2026-08-22 14:05:07.206441
342	7	500	win	Plinko game payout	\N	2026-08-22 14:05:07.206441
343	7	-1000	loss	Plinko game bet	\N	2026-08-22 14:05:07.206441
344	7	500	win	Plinko game payout	\N	2026-08-22 14:05:07.206441
345	7	-1000	loss	Plinko game bet	\N	2026-08-22 14:05:07.206441
346	7	2000	win	Plinko game payout	\N	2026-08-22 14:05:07.206441
347	7	-1000	loss	Plinko game bet	\N	2026-08-22 14:05:07.206441
348	7	300	win	Plinko game payout	\N	2026-08-22 14:05:07.206441
349	7	-1000	loss	Plinko game bet	\N	2026-08-22 14:05:07.206441
350	7	1000	win	Plinko game payout	\N	2026-08-22 14:05:07.206441
351	7	-1000	loss	Plinko game bet	\N	2026-08-22 14:05:07.206441
352	7	10000	win	Plinko game payout	\N	2026-08-22 14:05:07.206441
353	7	-1000	loss	Plinko game bet	\N	2026-08-22 14:05:07.206441
354	7	300	win	Plinko game payout	\N	2026-08-22 14:05:07.206441
355	7	-1000	loss	Plinko game bet	\N	2026-08-22 14:05:07.206441
356	7	1000	win	Plinko game payout	\N	2026-08-22 14:05:07.206441
357	7	-1000	loss	Plinko game bet	\N	2026-08-22 14:05:07.206441
358	7	10000	win	Plinko game payout	\N	2026-08-22 14:05:07.206441
359	7	-1000	loss	Plinko game bet	\N	2026-08-22 14:05:07.206441
360	7	500	win	Plinko game payout	\N	2026-08-22 14:05:07.206441
361	7	-1000	loss	Plinko game bet	\N	2026-08-22 14:05:07.206441
362	7	500	win	Plinko game payout	\N	2026-08-22 14:05:07.206441
363	7	-1000	loss	Plinko game bet	\N	2026-08-22 14:05:07.206441
364	7	1000	win	Plinko game payout	\N	2026-08-22 14:05:07.206441
365	7	-1000	loss	Plinko game bet	\N	2026-08-22 14:05:07.206441
366	7	1000	win	Plinko game payout	\N	2026-08-22 14:05:07.206441
367	7	-1000	loss	Plinko game bet	\N	2026-08-22 14:05:07.206441
368	7	2000	win	Plinko game payout	\N	2026-08-22 14:05:07.206441
369	7	-1000	loss	Plinko game bet	\N	2026-08-22 14:05:16.118076
370	7	1000	win	Plinko game payout	\N	2026-08-22 14:05:16.118076
371	7	-1000	loss	Plinko game bet	\N	2026-08-22 14:05:16.118076
372	7	300	win	Plinko game payout	\N	2026-08-22 14:05:16.118076
373	7	-1000	loss	Plinko game bet	\N	2026-08-22 14:05:16.118076
374	7	750	win	Plinko game payout	\N	2026-08-22 14:05:16.118076
375	7	-1000	loss	Plinko game bet	\N	2026-08-22 14:05:16.118076
376	7	500	win	Plinko game payout	\N	2026-08-22 14:05:16.118076
377	7	-1000	loss	Plinko game bet	\N	2026-08-22 14:05:16.118076
378	7	1000	win	Plinko game payout	\N	2026-08-22 14:05:16.118076
379	7	-1000	loss	Plinko game bet	\N	2026-08-22 14:05:16.118076
380	7	5000	win	Plinko game payout	\N	2026-08-22 14:05:16.118076
381	7	-1000	loss	Plinko game bet	\N	2026-08-22 14:05:16.118076
382	7	500	win	Plinko game payout	\N	2026-08-22 14:05:16.118076
383	7	-1000	loss	Plinko game bet	\N	2026-08-22 14:05:16.118076
384	7	750	win	Plinko game payout	\N	2026-08-22 14:05:16.118076
385	7	-1000	loss	Plinko game bet	\N	2026-08-22 14:05:16.118076
386	7	500	win	Plinko game payout	\N	2026-08-22 14:05:16.118076
387	7	-1000	loss	Plinko game bet	\N	2026-08-22 14:05:16.118076
388	7	500	win	Plinko game payout	\N	2026-08-22 14:05:16.118076
389	7	-1000	loss	Plinko game bet	\N	2026-08-22 14:05:16.118076
390	7	750	win	Plinko game payout	\N	2026-08-22 14:05:16.118076
391	7	-1000	loss	Plinko game bet	\N	2026-08-22 14:05:16.118076
392	7	500	win	Plinko game payout	\N	2026-08-22 14:05:16.118076
393	7	-1000	loss	Plinko game bet	\N	2026-08-22 14:05:16.118076
394	7	750	win	Plinko game payout	\N	2026-08-22 14:05:16.118076
395	7	-1000	loss	Plinko game bet	\N	2026-08-22 14:05:16.118076
396	7	1000	win	Plinko game payout	\N	2026-08-22 14:05:16.118076
397	7	-1000	loss	Plinko game bet	\N	2026-08-22 14:05:16.118076
398	7	1000	win	Plinko game payout	\N	2026-08-22 14:05:16.118076
399	7	-1000	loss	Plinko game bet	\N	2026-08-22 14:05:16.118076
400	7	750	win	Plinko game payout	\N	2026-08-22 14:05:16.118076
401	7	-1000	loss	Plinko game bet	\N	2026-08-22 14:05:16.118076
402	7	300	win	Plinko game payout	\N	2026-08-22 14:05:16.118076
403	7	-1000	loss	Plinko game bet	\N	2026-08-22 14:05:16.118076
404	7	1000	win	Plinko game payout	\N	2026-08-22 14:05:16.118076
405	7	-1000	loss	Plinko game bet	\N	2026-08-22 14:05:16.118076
406	7	2000	win	Plinko game payout	\N	2026-08-22 14:05:16.118076
407	7	-1000	loss	Plinko game bet	\N	2026-08-22 14:05:16.118076
408	7	20000	win	Plinko game payout	\N	2026-08-22 14:05:16.118076
409	7	-1000	loss	Plinko game bet	\N	2026-08-22 14:05:25.791638
410	7	1000	win	Plinko game payout	\N	2026-08-22 14:05:25.791638
411	7	-1000	loss	Plinko game bet	\N	2026-08-22 14:05:25.791638
412	7	1000	win	Plinko game payout	\N	2026-08-22 14:05:25.791638
413	7	-1000	loss	Plinko game bet	\N	2026-08-22 14:05:25.791638
414	7	2000	win	Plinko game payout	\N	2026-08-22 14:05:25.791638
415	7	-1000	loss	Plinko game bet	\N	2026-08-22 14:05:25.791638
416	7	300	win	Plinko game payout	\N	2026-08-22 14:05:25.791638
417	7	-1000	loss	Plinko game bet	\N	2026-08-22 14:05:25.791638
418	7	300	win	Plinko game payout	\N	2026-08-22 14:05:25.791638
419	7	-1000	loss	Plinko game bet	\N	2026-08-22 14:05:25.791638
420	7	1000	win	Plinko game payout	\N	2026-08-22 14:05:25.791638
421	7	-1000	loss	Plinko game bet	\N	2026-08-22 14:05:25.791638
422	7	5000	win	Plinko game payout	\N	2026-08-22 14:05:25.791638
423	7	-1000	loss	Plinko game bet	\N	2026-08-22 14:05:25.791638
424	7	500	win	Plinko game payout	\N	2026-08-22 14:05:25.791638
425	7	-1000	loss	Plinko game bet	\N	2026-08-22 14:05:25.791638
426	7	1000	win	Plinko game payout	\N	2026-08-22 14:05:25.791638
427	7	-1000	loss	Plinko game bet	\N	2026-08-22 14:05:25.791638
428	7	300	win	Plinko game payout	\N	2026-08-22 14:05:25.791638
429	7	-1000	loss	Plinko game bet	\N	2026-08-22 14:05:25.791638
430	7	750	win	Plinko game payout	\N	2026-08-22 14:05:25.791638
431	7	-1000	loss	Plinko game bet	\N	2026-08-22 14:05:25.791638
432	7	500	win	Plinko game payout	\N	2026-08-22 14:05:25.791638
433	7	-1000	loss	Plinko game bet	\N	2026-08-22 14:05:25.791638
434	7	500	win	Plinko game payout	\N	2026-08-22 14:05:25.791638
435	7	-1000	loss	Plinko game bet	\N	2026-08-22 14:05:25.791638
436	7	5000	win	Plinko game payout	\N	2026-08-22 14:05:25.791638
437	7	-1000	loss	Plinko game bet	\N	2026-08-22 14:05:25.791638
438	7	1000	win	Plinko game payout	\N	2026-08-22 14:05:25.791638
439	7	-1000	loss	Plinko game bet	\N	2026-08-22 14:05:25.791638
440	7	500	win	Plinko game payout	\N	2026-08-22 14:05:25.791638
441	7	-1000	loss	Plinko game bet	\N	2026-08-22 14:05:25.791638
442	7	300	win	Plinko game payout	\N	2026-08-22 14:05:25.791638
443	7	-1000	loss	Plinko game bet	\N	2026-08-22 14:05:25.791638
444	7	750	win	Plinko game payout	\N	2026-08-22 14:05:25.791638
445	7	-1000	loss	Plinko game bet	\N	2026-08-22 14:05:25.791638
446	7	750	win	Plinko game payout	\N	2026-08-22 14:05:25.791638
447	7	-1000	loss	Plinko game bet	\N	2026-08-22 14:05:25.791638
448	7	2000	win	Plinko game payout	\N	2026-08-22 14:05:25.791638
449	7	-1000	loss	Plinko game bet	\N	2026-08-22 14:05:31.275126
450	7	10000	win	Plinko game payout	\N	2026-08-22 14:05:31.275126
451	7	-1000	loss	Plinko game bet	\N	2026-08-22 14:05:31.275126
452	7	2000	win	Plinko game payout	\N	2026-08-22 14:05:31.275126
453	7	-1000	loss	Plinko game bet	\N	2026-08-22 14:05:31.275126
454	7	5000	win	Plinko game payout	\N	2026-08-22 14:05:31.275126
455	7	-1000	loss	Plinko game bet	\N	2026-08-22 14:05:31.275126
456	7	1000	win	Plinko game payout	\N	2026-08-22 14:05:31.275126
457	7	-1000	loss	Plinko game bet	\N	2026-08-22 14:05:31.275126
458	7	500	win	Plinko game payout	\N	2026-08-22 14:05:31.275126
459	7	-1000	loss	Plinko game bet	\N	2026-08-22 14:05:31.275126
460	7	500	win	Plinko game payout	\N	2026-08-22 14:05:31.275126
461	7	-1000	loss	Plinko game bet	\N	2026-08-22 14:05:31.275126
462	7	1000	win	Plinko game payout	\N	2026-08-22 14:05:31.275126
463	7	-1000	loss	Plinko game bet	\N	2026-08-22 14:05:31.275126
464	7	750	win	Plinko game payout	\N	2026-08-22 14:05:31.275126
465	7	-1000	loss	Plinko game bet	\N	2026-08-22 14:05:31.275126
466	7	750	win	Plinko game payout	\N	2026-08-22 14:05:31.275126
467	7	-1000	loss	Plinko game bet	\N	2026-08-22 14:05:31.275126
468	7	750	win	Plinko game payout	\N	2026-08-22 14:05:31.275126
469	7	-1000	loss	Plinko game bet	\N	2026-08-22 14:05:31.275126
470	7	500	win	Plinko game payout	\N	2026-08-22 14:05:31.275126
471	7	-1000	loss	Plinko game bet	\N	2026-08-22 14:05:31.275126
472	7	750	win	Plinko game payout	\N	2026-08-22 14:05:31.275126
473	7	-1000	loss	Plinko game bet	\N	2026-08-22 14:05:31.275126
474	7	2000	win	Plinko game payout	\N	2026-08-22 14:05:31.275126
475	7	-1000	loss	Plinko game bet	\N	2026-08-22 14:05:31.275126
476	7	1000	win	Plinko game payout	\N	2026-08-22 14:05:31.275126
477	7	-1000	loss	Plinko game bet	\N	2026-08-22 14:05:31.275126
478	7	500	win	Plinko game payout	\N	2026-08-22 14:05:31.275126
479	7	-1000	loss	Plinko game bet	\N	2026-08-22 14:05:31.275126
480	7	300	win	Plinko game payout	\N	2026-08-22 14:05:31.275126
481	7	-1000	loss	Plinko game bet	\N	2026-08-22 14:05:31.275126
482	7	20000	win	Plinko game payout	\N	2026-08-22 14:05:31.275126
483	7	-1000	loss	Plinko game bet	\N	2026-08-22 14:05:31.275126
484	7	1000	win	Plinko game payout	\N	2026-08-22 14:05:31.275126
485	7	-1000	loss	Plinko game bet	\N	2026-08-22 14:05:31.275126
486	7	1000	win	Plinko game payout	\N	2026-08-22 14:05:31.275126
487	7	-1000	loss	Plinko game bet	\N	2026-08-22 14:05:31.275126
488	7	750	win	Plinko game payout	\N	2026-08-22 14:05:31.275126
489	7	-1000	loss	Plinko game bet	\N	2026-08-22 14:05:36.198939
490	7	750	win	Plinko game payout	\N	2026-08-22 14:05:36.198939
491	7	-1000	loss	Plinko game bet	\N	2026-08-22 14:05:36.198939
492	7	1000	win	Plinko game payout	\N	2026-08-22 14:05:36.198939
493	7	-1000	loss	Plinko game bet	\N	2026-08-22 14:05:36.198939
494	7	750	win	Plinko game payout	\N	2026-08-22 14:05:36.198939
495	7	-1000	loss	Plinko game bet	\N	2026-08-22 14:05:36.198939
496	7	300	win	Plinko game payout	\N	2026-08-22 14:05:36.198939
497	7	-1000	loss	Plinko game bet	\N	2026-08-22 14:05:36.198939
498	7	750	win	Plinko game payout	\N	2026-08-22 14:05:36.198939
499	7	-1000	loss	Plinko game bet	\N	2026-08-22 14:05:36.198939
500	7	2000	win	Plinko game payout	\N	2026-08-22 14:05:36.198939
501	7	-1000	loss	Plinko game bet	\N	2026-08-22 14:05:36.198939
502	7	1000	win	Plinko game payout	\N	2026-08-22 14:05:36.198939
503	7	-1000	loss	Plinko game bet	\N	2026-08-22 14:05:36.198939
504	7	300	win	Plinko game payout	\N	2026-08-22 14:05:36.198939
505	7	-1000	loss	Plinko game bet	\N	2026-08-22 14:05:36.198939
506	7	1000	win	Plinko game payout	\N	2026-08-22 14:05:36.198939
507	7	-1000	loss	Plinko game bet	\N	2026-08-22 14:05:36.198939
508	7	2000	win	Plinko game payout	\N	2026-08-22 14:05:36.198939
509	7	-1000	loss	Plinko game bet	\N	2026-08-22 14:05:36.198939
510	7	500	win	Plinko game payout	\N	2026-08-22 14:05:36.198939
511	7	-1000	loss	Plinko game bet	\N	2026-08-22 14:05:36.198939
512	7	300	win	Plinko game payout	\N	2026-08-22 14:05:36.198939
513	7	-1000	loss	Plinko game bet	\N	2026-08-22 14:05:36.198939
514	7	300	win	Plinko game payout	\N	2026-08-22 14:05:36.198939
515	7	-1000	loss	Plinko game bet	\N	2026-08-22 14:05:36.198939
516	7	2000	win	Plinko game payout	\N	2026-08-22 14:05:36.198939
517	7	-1000	loss	Plinko game bet	\N	2026-08-22 14:05:36.198939
518	7	750	win	Plinko game payout	\N	2026-08-22 14:05:36.198939
519	7	-1000	loss	Plinko game bet	\N	2026-08-22 14:05:36.198939
520	7	750	win	Plinko game payout	\N	2026-08-22 14:05:36.198939
521	7	-1000	loss	Plinko game bet	\N	2026-08-22 14:05:36.198939
522	7	1000	win	Plinko game payout	\N	2026-08-22 14:05:36.198939
523	7	-1000	loss	Plinko game bet	\N	2026-08-22 14:05:36.198939
524	7	2000	win	Plinko game payout	\N	2026-08-22 14:05:36.198939
525	7	-1000	loss	Plinko game bet	\N	2026-08-22 14:05:36.198939
526	7	500	win	Plinko game payout	\N	2026-08-22 14:05:36.198939
527	7	-1000	loss	Plinko game bet	\N	2026-08-22 14:05:36.198939
528	7	5000	win	Plinko game payout	\N	2026-08-22 14:05:36.198939
529	7	-1000	loss	Plinko game bet	\N	2026-08-22 14:05:59.645471
530	7	5000	win	Plinko game payout	\N	2026-08-22 14:05:59.645471
531	7	-1000	loss	Plinko game bet	\N	2026-08-22 14:05:59.645471
532	7	500	win	Plinko game payout	\N	2026-08-22 14:05:59.645471
533	7	-1000	loss	Plinko game bet	\N	2026-08-22 14:05:59.645471
534	7	1000	win	Plinko game payout	\N	2026-08-22 14:05:59.645471
535	7	-1000	loss	Plinko game bet	\N	2026-08-22 14:05:59.645471
536	7	300	win	Plinko game payout	\N	2026-08-22 14:05:59.645471
537	7	-1000	loss	Plinko game bet	\N	2026-08-22 14:05:59.645471
538	7	1000	win	Plinko game payout	\N	2026-08-22 14:05:59.645471
539	7	-1000	loss	Plinko game bet	\N	2026-08-22 14:05:59.645471
540	7	10000	win	Plinko game payout	\N	2026-08-22 14:05:59.645471
541	7	-1000	loss	Plinko game bet	\N	2026-08-22 14:05:59.645471
542	7	1000	win	Plinko game payout	\N	2026-08-22 14:05:59.645471
543	7	-1000	loss	Plinko game bet	\N	2026-08-22 14:05:59.645471
544	7	1000	win	Plinko game payout	\N	2026-08-22 14:05:59.645471
545	7	-1000	loss	Plinko game bet	\N	2026-08-22 14:05:59.645471
546	7	750	win	Plinko game payout	\N	2026-08-22 14:05:59.645471
547	7	-1000	loss	Plinko game bet	\N	2026-08-22 14:05:59.645471
548	7	1000	win	Plinko game payout	\N	2026-08-22 14:05:59.645471
549	7	-1000	loss	Plinko game bet	\N	2026-08-22 14:05:59.645471
550	7	500	win	Plinko game payout	\N	2026-08-22 14:05:59.645471
551	7	-1000	loss	Plinko game bet	\N	2026-08-22 14:05:59.645471
552	7	10000	win	Plinko game payout	\N	2026-08-22 14:05:59.645471
553	7	-1000	loss	Plinko game bet	\N	2026-08-22 14:05:59.645471
554	7	5000	win	Plinko game payout	\N	2026-08-22 14:05:59.645471
555	7	-1000	loss	Plinko game bet	\N	2026-08-22 14:05:59.645471
556	7	500	win	Plinko game payout	\N	2026-08-22 14:05:59.645471
557	7	-1000	loss	Plinko game bet	\N	2026-08-22 14:05:59.645471
558	7	2000	win	Plinko game payout	\N	2026-08-22 14:05:59.645471
559	7	-1000	loss	Plinko game bet	\N	2026-08-22 14:05:59.645471
560	7	750	win	Plinko game payout	\N	2026-08-22 14:05:59.645471
561	7	-1000	loss	Plinko game bet	\N	2026-08-22 14:05:59.645471
562	7	500	win	Plinko game payout	\N	2026-08-22 14:05:59.645471
563	7	-1000	loss	Plinko game bet	\N	2026-08-22 14:05:59.645471
564	7	300	win	Plinko game payout	\N	2026-08-22 14:05:59.645471
565	7	-1000	loss	Plinko game bet	\N	2026-08-22 14:05:59.645471
566	7	750	win	Plinko game payout	\N	2026-08-22 14:05:59.645471
567	7	-1000	loss	Plinko game bet	\N	2026-08-22 14:05:59.645471
568	7	2000	win	Plinko game payout	\N	2026-08-22 14:05:59.645471
569	7	-1000	loss	Plinko game bet	\N	2026-08-22 14:06:11.628634
570	7	500	win	Plinko game payout	\N	2026-08-22 14:06:11.628634
571	7	-1000	loss	Plinko game bet	\N	2026-08-22 14:06:11.628634
572	7	2000	win	Plinko game payout	\N	2026-08-22 14:06:11.628634
573	7	-1000	loss	Plinko game bet	\N	2026-08-22 14:06:11.628634
574	7	1000	win	Plinko game payout	\N	2026-08-22 14:06:11.628634
575	7	-1000	loss	Plinko game bet	\N	2026-08-22 14:06:11.628634
576	7	750	win	Plinko game payout	\N	2026-08-22 14:06:11.628634
577	7	-1000	loss	Plinko game bet	\N	2026-08-22 14:06:11.628634
578	7	2000	win	Plinko game payout	\N	2026-08-22 14:06:11.628634
579	7	-1000	loss	Plinko game bet	\N	2026-08-22 14:06:11.628634
580	7	300	win	Plinko game payout	\N	2026-08-22 14:06:11.628634
581	7	-1000	loss	Plinko game bet	\N	2026-08-22 14:06:11.628634
582	7	1000	win	Plinko game payout	\N	2026-08-22 14:06:11.628634
583	7	-1000	loss	Plinko game bet	\N	2026-08-22 14:06:11.628634
584	7	10000	win	Plinko game payout	\N	2026-08-22 14:06:11.628634
585	7	-1000	loss	Plinko game bet	\N	2026-08-22 14:06:11.628634
586	7	10000	win	Plinko game payout	\N	2026-08-22 14:06:11.628634
587	7	-1000	loss	Plinko game bet	\N	2026-08-22 14:06:11.628634
588	7	10000	win	Plinko game payout	\N	2026-08-22 14:06:11.628634
589	7	-1000	loss	Plinko game bet	\N	2026-08-22 14:06:11.628634
590	7	750	win	Plinko game payout	\N	2026-08-22 14:06:11.628634
591	7	-1000	loss	Plinko game bet	\N	2026-08-22 14:06:11.628634
592	7	500	win	Plinko game payout	\N	2026-08-22 14:06:11.628634
593	7	-1000	loss	Plinko game bet	\N	2026-08-22 14:06:11.628634
594	7	5000	win	Plinko game payout	\N	2026-08-22 14:06:11.628634
595	7	-1000	loss	Plinko game bet	\N	2026-08-22 14:06:11.628634
596	7	750	win	Plinko game payout	\N	2026-08-22 14:06:11.628634
597	7	-1000	loss	Plinko game bet	\N	2026-08-22 14:06:11.628634
598	7	1000	win	Plinko game payout	\N	2026-08-22 14:06:11.628634
599	7	-1000	loss	Plinko game bet	\N	2026-08-22 14:06:11.628634
600	7	500	win	Plinko game payout	\N	2026-08-22 14:06:11.628634
601	7	-1000	loss	Plinko game bet	\N	2026-08-22 14:06:11.628634
602	7	500	win	Plinko game payout	\N	2026-08-22 14:06:11.628634
603	7	-1000	loss	Plinko game bet	\N	2026-08-22 14:06:11.628634
604	7	1000	win	Plinko game payout	\N	2026-08-22 14:06:11.628634
605	7	-1000	loss	Plinko game bet	\N	2026-08-22 14:06:11.628634
606	7	1000	win	Plinko game payout	\N	2026-08-22 14:06:11.628634
607	7	-1000	loss	Plinko game bet	\N	2026-08-22 14:06:11.628634
608	7	1000	win	Plinko game payout	\N	2026-08-22 14:06:11.628634
609	7	-100	loss	Plinko game bet	\N	2026-08-22 14:06:17.845803
610	7	30	win	Plinko game payout	\N	2026-08-22 14:06:17.845803
611	7	-100	loss	Plinko game bet	\N	2026-08-22 14:06:22.050782
612	7	200	win	Plinko game payout	\N	2026-08-22 14:06:22.050782
613	7	-100	loss	Plinko game bet	\N	2026-08-22 14:06:22.050782
614	7	30	win	Plinko game payout	\N	2026-08-22 14:06:22.050782
615	7	-100	loss	Plinko game bet	\N	2026-08-22 14:06:22.050782
616	7	1000	win	Plinko game payout	\N	2026-08-22 14:06:22.050782
617	7	-100	loss	Plinko game bet	\N	2026-08-22 14:06:22.050782
618	7	50	win	Plinko game payout	\N	2026-08-22 14:06:22.050782
619	7	-100	loss	Plinko game bet	\N	2026-08-22 14:06:22.050782
620	7	100	win	Plinko game payout	\N	2026-08-22 14:06:22.050782
621	7	-100	loss	Plinko game bet	\N	2026-08-22 14:06:22.050782
622	7	50	win	Plinko game payout	\N	2026-08-22 14:06:22.050782
623	7	-100	loss	Plinko game bet	\N	2026-08-22 14:06:22.050782
624	7	75	win	Plinko game payout	\N	2026-08-22 14:06:22.050782
625	7	-100	loss	Plinko game bet	\N	2026-08-22 14:06:22.050782
626	7	50	win	Plinko game payout	\N	2026-08-22 14:06:22.050782
627	7	-100	loss	Plinko game bet	\N	2026-08-22 14:06:22.050782
628	7	50	win	Plinko game payout	\N	2026-08-22 14:06:22.050782
629	7	-100	loss	Plinko game bet	\N	2026-08-22 14:06:22.050782
630	7	100	win	Plinko game payout	\N	2026-08-22 14:06:22.050782
631	7	-100	loss	Plinko game bet	\N	2026-08-22 14:06:29.035209
632	7	75	win	Plinko game payout	\N	2026-08-22 14:06:29.035209
633	7	-100	loss	Plinko game bet	\N	2026-08-22 14:06:29.035209
634	7	100	win	Plinko game payout	\N	2026-08-22 14:06:29.035209
635	7	-100	loss	Plinko game bet	\N	2026-08-22 14:06:29.035209
636	7	75	win	Plinko game payout	\N	2026-08-22 14:06:29.035209
637	7	-100	loss	Plinko game bet	\N	2026-08-22 14:06:29.035209
638	7	50	win	Plinko game payout	\N	2026-08-22 14:06:29.035209
639	7	-100	loss	Plinko game bet	\N	2026-08-22 14:06:29.035209
640	7	75	win	Plinko game payout	\N	2026-08-22 14:06:29.035209
641	7	-100	loss	Plinko game bet	\N	2026-08-22 14:06:29.035209
642	7	500	win	Plinko game payout	\N	2026-08-22 14:06:29.035209
643	7	-100	loss	Plinko game bet	\N	2026-08-22 14:06:29.035209
644	7	75	win	Plinko game payout	\N	2026-08-22 14:06:29.035209
645	7	-100	loss	Plinko game bet	\N	2026-08-22 14:06:29.035209
646	7	75	win	Plinko game payout	\N	2026-08-22 14:06:29.035209
647	7	-100	loss	Plinko game bet	\N	2026-08-22 14:06:29.035209
648	7	50	win	Plinko game payout	\N	2026-08-22 14:06:29.035209
649	7	-100	loss	Plinko game bet	\N	2026-08-22 14:06:29.035209
650	7	75	win	Plinko game payout	\N	2026-08-22 14:06:29.035209
651	7	-100	loss	Plinko game bet	\N	2026-08-22 14:06:32.717992
652	7	200	win	Plinko game payout	\N	2026-08-22 14:06:32.717992
653	7	-100	loss	Plinko game bet	\N	2026-08-22 14:06:32.717992
654	7	1000	win	Plinko game payout	\N	2026-08-22 14:06:32.717992
655	7	-100	loss	Plinko game bet	\N	2026-08-22 14:06:32.717992
656	7	200	win	Plinko game payout	\N	2026-08-22 14:06:32.717992
657	7	-100	loss	Plinko game bet	\N	2026-08-22 14:06:32.717992
658	7	100	win	Plinko game payout	\N	2026-08-22 14:06:32.717992
659	7	-100	loss	Plinko game bet	\N	2026-08-22 14:06:32.717992
660	7	50	win	Plinko game payout	\N	2026-08-22 14:06:32.717992
661	7	-100	loss	Plinko game bet	\N	2026-08-22 14:06:32.717992
662	7	100	win	Plinko game payout	\N	2026-08-22 14:06:32.717992
663	7	-100	loss	Plinko game bet	\N	2026-08-22 14:06:32.717992
664	7	500	win	Plinko game payout	\N	2026-08-22 14:06:32.717992
665	7	-100	loss	Plinko game bet	\N	2026-08-22 14:06:32.717992
666	7	75	win	Plinko game payout	\N	2026-08-22 14:06:32.717992
667	7	-100	loss	Plinko game bet	\N	2026-08-22 14:06:32.717992
668	7	200	win	Plinko game payout	\N	2026-08-22 14:06:32.717992
669	7	-100	loss	Plinko game bet	\N	2026-08-22 14:06:32.717992
670	7	50	win	Plinko game payout	\N	2026-08-22 14:06:32.717992
671	7	-100	loss	Plinko game bet	\N	2026-08-22 14:06:35.873504
672	7	100	win	Plinko game payout	\N	2026-08-22 14:06:35.873504
673	7	-100	loss	Plinko game bet	\N	2026-08-22 14:06:35.873504
674	7	75	win	Plinko game payout	\N	2026-08-22 14:06:35.873504
675	7	-100	loss	Plinko game bet	\N	2026-08-22 14:06:35.873504
676	7	50	win	Plinko game payout	\N	2026-08-22 14:06:35.873504
677	7	-100	loss	Plinko game bet	\N	2026-08-22 14:06:35.873504
678	7	100	win	Plinko game payout	\N	2026-08-22 14:06:35.873504
679	7	-100	loss	Plinko game bet	\N	2026-08-22 14:06:35.873504
680	7	500	win	Plinko game payout	\N	2026-08-22 14:06:35.873504
681	7	-100	loss	Plinko game bet	\N	2026-08-22 14:06:35.873504
682	7	75	win	Plinko game payout	\N	2026-08-22 14:06:35.873504
683	7	-100	loss	Plinko game bet	\N	2026-08-22 14:06:35.873504
684	7	50	win	Plinko game payout	\N	2026-08-22 14:06:35.873504
685	7	-100	loss	Plinko game bet	\N	2026-08-22 14:06:35.873504
686	7	100	win	Plinko game payout	\N	2026-08-22 14:06:35.873504
687	7	-100	loss	Plinko game bet	\N	2026-08-22 14:06:35.873504
688	7	100	win	Plinko game payout	\N	2026-08-22 14:06:35.873504
689	7	-100	loss	Plinko game bet	\N	2026-08-22 14:06:35.873504
690	7	50	win	Plinko game payout	\N	2026-08-22 14:06:35.873504
691	7	-100	loss	Plinko game bet	\N	2026-08-22 14:09:48.860275
692	7	75	win	Plinko game payout	\N	2026-08-22 14:09:48.860275
693	7	-100	loss	Plinko game bet	\N	2026-08-22 14:09:48.860275
694	7	100	win	Plinko game payout	\N	2026-08-22 14:09:48.860275
695	7	-100	loss	Plinko game bet	\N	2026-08-22 14:09:48.860275
696	7	200	win	Plinko game payout	\N	2026-08-22 14:09:48.860275
697	7	-100	loss	Plinko game bet	\N	2026-08-22 14:09:48.860275
698	7	100	win	Plinko game payout	\N	2026-08-22 14:09:48.860275
699	7	-100	loss	Plinko game bet	\N	2026-08-22 14:09:48.860275
700	7	500	win	Plinko game payout	\N	2026-08-22 14:09:48.860275
701	7	-100	loss	Plinko game bet	\N	2026-08-22 14:09:48.860275
702	7	50	win	Plinko game payout	\N	2026-08-22 14:09:48.860275
703	7	-100	loss	Plinko game bet	\N	2026-08-22 14:09:48.860275
704	7	200	win	Plinko game payout	\N	2026-08-22 14:09:48.860275
705	7	-100	loss	Plinko game bet	\N	2026-08-22 14:09:48.860275
706	7	200	win	Plinko game payout	\N	2026-08-22 14:09:48.860275
707	7	-100	loss	Plinko game bet	\N	2026-08-22 14:09:48.860275
708	7	75	win	Plinko game payout	\N	2026-08-22 14:09:48.860275
709	7	-100	loss	Plinko game bet	\N	2026-08-22 14:09:48.860275
710	7	200	win	Plinko game payout	\N	2026-08-22 14:09:48.860275
711	7	-100	loss	Plinko game bet	\N	2026-08-22 14:09:58.137895
712	7	500	win	Plinko game payout	\N	2026-08-22 14:09:58.137895
713	7	-100	loss	Plinko game bet	\N	2026-08-22 14:09:58.137895
714	7	100	win	Plinko game payout	\N	2026-08-22 14:09:58.137895
715	7	-100	loss	Plinko game bet	\N	2026-08-22 14:09:58.137895
716	7	500	win	Plinko game payout	\N	2026-08-22 14:09:58.137895
717	7	-100	loss	Plinko game bet	\N	2026-08-22 14:09:58.137895
718	7	50	win	Plinko game payout	\N	2026-08-22 14:09:58.137895
719	7	-100	loss	Plinko game bet	\N	2026-08-22 14:09:58.137895
720	7	200	win	Plinko game payout	\N	2026-08-22 14:09:58.137895
721	7	-100	loss	Plinko game bet	\N	2026-08-22 14:09:58.137895
722	7	200	win	Plinko game payout	\N	2026-08-22 14:09:58.137895
723	7	-100	loss	Plinko game bet	\N	2026-08-22 14:09:58.137895
724	7	100	win	Plinko game payout	\N	2026-08-22 14:09:58.137895
725	7	-100	loss	Plinko game bet	\N	2026-08-22 14:09:58.137895
726	7	1000	win	Plinko game payout	\N	2026-08-22 14:09:58.137895
727	7	-100	loss	Plinko game bet	\N	2026-08-22 14:09:58.137895
728	7	500	win	Plinko game payout	\N	2026-08-22 14:09:58.137895
729	7	-100	loss	Plinko game bet	\N	2026-08-22 14:09:58.137895
730	7	100	win	Plinko game payout	\N	2026-08-22 14:09:58.137895
731	7	-100	loss	Plinko game bet	\N	2026-08-22 14:10:03.398341
732	7	100	win	Plinko game payout	\N	2026-08-22 14:10:03.398341
733	7	-100	loss	Plinko game bet	\N	2026-08-22 14:10:03.398341
734	7	500	win	Plinko game payout	\N	2026-08-22 14:10:03.398341
735	7	-100	loss	Plinko game bet	\N	2026-08-22 14:10:03.398341
736	7	200	win	Plinko game payout	\N	2026-08-22 14:10:03.398341
737	7	-100	loss	Plinko game bet	\N	2026-08-22 14:10:03.398341
738	7	30	win	Plinko game payout	\N	2026-08-22 14:10:03.398341
739	7	-100	loss	Plinko game bet	\N	2026-08-22 14:10:03.398341
740	7	500	win	Plinko game payout	\N	2026-08-22 14:10:03.398341
741	7	-100	loss	Plinko game bet	\N	2026-08-22 14:10:03.398341
742	7	500	win	Plinko game payout	\N	2026-08-22 14:10:03.398341
743	7	-100	loss	Plinko game bet	\N	2026-08-22 14:10:03.398341
744	7	200	win	Plinko game payout	\N	2026-08-22 14:10:03.398341
745	7	-100	loss	Plinko game bet	\N	2026-08-22 14:10:03.398341
746	7	200	win	Plinko game payout	\N	2026-08-22 14:10:03.398341
747	7	-100	loss	Plinko game bet	\N	2026-08-22 14:10:03.398341
748	7	200	win	Plinko game payout	\N	2026-08-22 14:10:03.398341
749	7	-100	loss	Plinko game bet	\N	2026-08-22 14:10:03.398341
750	7	1000	win	Plinko game payout	\N	2026-08-22 14:10:03.398341
751	7	-100	loss	Plinko game bet	\N	2026-08-22 14:10:06.757117
752	7	200	win	Plinko game payout	\N	2026-08-22 14:10:06.757117
753	7	-100	loss	Plinko game bet	\N	2026-08-22 14:10:06.757117
754	7	500	win	Plinko game payout	\N	2026-08-22 14:10:06.757117
755	7	-100	loss	Plinko game bet	\N	2026-08-22 14:10:06.757117
756	7	100	win	Plinko game payout	\N	2026-08-22 14:10:06.757117
757	7	-100	loss	Plinko game bet	\N	2026-08-22 14:10:06.757117
758	7	500	win	Plinko game payout	\N	2026-08-22 14:10:06.757117
759	7	-100	loss	Plinko game bet	\N	2026-08-22 14:10:06.757117
760	7	75	win	Plinko game payout	\N	2026-08-22 14:10:06.757117
761	7	-100	loss	Plinko game bet	\N	2026-08-22 14:10:06.757117
762	7	200	win	Plinko game payout	\N	2026-08-22 14:10:06.757117
763	7	-100	loss	Plinko game bet	\N	2026-08-22 14:10:06.757117
764	7	100	win	Plinko game payout	\N	2026-08-22 14:10:06.757117
765	7	-100	loss	Plinko game bet	\N	2026-08-22 14:10:06.757117
766	7	100	win	Plinko game payout	\N	2026-08-22 14:10:06.757117
767	7	-100	loss	Plinko game bet	\N	2026-08-22 14:10:06.757117
768	7	200	win	Plinko game payout	\N	2026-08-22 14:10:06.757117
769	7	-100	loss	Plinko game bet	\N	2026-08-22 14:10:06.757117
770	7	1000	win	Plinko game payout	\N	2026-08-22 14:10:06.757117
771	7	-100	loss	Plinko game bet	\N	2026-08-22 14:10:10.665395
772	7	75	win	Plinko game payout	\N	2026-08-22 14:10:10.665395
773	7	-100	loss	Plinko game bet	\N	2026-08-22 14:10:10.665395
774	7	1000	win	Plinko game payout	\N	2026-08-22 14:10:10.665395
775	7	-100	loss	Plinko game bet	\N	2026-08-22 14:10:10.665395
776	7	200	win	Plinko game payout	\N	2026-08-22 14:10:10.665395
777	7	-100	loss	Plinko game bet	\N	2026-08-22 14:10:10.665395
778	7	200	win	Plinko game payout	\N	2026-08-22 14:10:10.665395
779	7	-100	loss	Plinko game bet	\N	2026-08-22 14:10:10.665395
780	7	100	win	Plinko game payout	\N	2026-08-22 14:10:10.665395
781	7	-100	loss	Plinko game bet	\N	2026-08-22 14:10:10.665395
782	7	100	win	Plinko game payout	\N	2026-08-22 14:10:10.665395
783	7	-100	loss	Plinko game bet	\N	2026-08-22 14:10:10.665395
784	7	50	win	Plinko game payout	\N	2026-08-22 14:10:10.665395
785	7	-100	loss	Plinko game bet	\N	2026-08-22 14:10:10.665395
786	7	1000	win	Plinko game payout	\N	2026-08-22 14:10:10.665395
787	7	-100	loss	Plinko game bet	\N	2026-08-22 14:10:10.665395
788	7	200	win	Plinko game payout	\N	2026-08-22 14:10:10.665395
789	7	-100	loss	Plinko game bet	\N	2026-08-22 14:10:10.665395
790	7	500	win	Plinko game payout	\N	2026-08-22 14:10:10.665395
791	7	-100	loss	Plinko game bet	\N	2026-08-22 14:12:37.545048
792	7	100	win	Plinko game payout	\N	2026-08-22 14:12:37.545048
793	7	-100	loss	Plinko game bet	\N	2026-08-22 14:12:45.141254
794	7	75	win	Plinko game payout	\N	2026-08-22 14:12:45.141254
795	7	-100	loss	Plinko game bet	\N	2026-08-22 14:12:45.141254
796	7	75	win	Plinko game payout	\N	2026-08-22 14:12:45.141254
797	7	-100	loss	Plinko game bet	\N	2026-08-22 14:12:45.141254
798	7	100	win	Plinko game payout	\N	2026-08-22 14:12:45.141254
799	7	-100	loss	Plinko game bet	\N	2026-08-22 14:12:45.141254
800	7	75	win	Plinko game payout	\N	2026-08-22 14:12:45.141254
801	7	-100	loss	Plinko game bet	\N	2026-08-22 14:12:45.141254
802	7	75	win	Plinko game payout	\N	2026-08-22 14:12:45.141254
803	7	-100	loss	Plinko game bet	\N	2026-08-22 14:12:45.141254
804	7	200	win	Plinko game payout	\N	2026-08-22 14:12:45.141254
805	7	-100	loss	Plinko game bet	\N	2026-08-22 14:12:45.141254
806	7	50	win	Plinko game payout	\N	2026-08-22 14:12:45.141254
807	7	-100	loss	Plinko game bet	\N	2026-08-22 14:12:45.141254
808	7	50	win	Plinko game payout	\N	2026-08-22 14:12:45.141254
809	7	-100	loss	Plinko game bet	\N	2026-08-22 14:12:45.141254
810	7	100	win	Plinko game payout	\N	2026-08-22 14:12:45.141254
811	7	-100	loss	Plinko game bet	\N	2026-08-22 14:12:45.141254
812	7	30	win	Plinko game payout	\N	2026-08-22 14:12:45.141254
813	7	-100	loss	Plinko game bet	\N	2026-08-22 14:12:50.698887
814	7	500	win	Plinko game payout	\N	2026-08-22 14:12:50.698887
815	7	-100	loss	Plinko game bet	\N	2026-08-22 14:12:50.698887
816	7	50	win	Plinko game payout	\N	2026-08-22 14:12:50.698887
817	7	-100	loss	Plinko game bet	\N	2026-08-22 14:12:50.698887
818	7	75	win	Plinko game payout	\N	2026-08-22 14:12:50.698887
819	7	-100	loss	Plinko game bet	\N	2026-08-22 14:12:50.698887
820	7	100	win	Plinko game payout	\N	2026-08-22 14:12:50.698887
821	7	-100	loss	Plinko game bet	\N	2026-08-22 14:12:50.698887
822	7	75	win	Plinko game payout	\N	2026-08-22 14:12:50.698887
823	7	-100	loss	Plinko game bet	\N	2026-08-22 14:12:50.698887
824	7	75	win	Plinko game payout	\N	2026-08-22 14:12:50.698887
825	7	-100	loss	Plinko game bet	\N	2026-08-22 14:12:50.698887
826	7	100	win	Plinko game payout	\N	2026-08-22 14:12:50.698887
827	7	-100	loss	Plinko game bet	\N	2026-08-22 14:12:50.698887
828	7	75	win	Plinko game payout	\N	2026-08-22 14:12:50.698887
829	7	-100	loss	Plinko game bet	\N	2026-08-22 14:12:50.698887
830	7	30	win	Plinko game payout	\N	2026-08-22 14:12:50.698887
831	7	-100	loss	Plinko game bet	\N	2026-08-22 14:12:50.698887
832	7	75	win	Plinko game payout	\N	2026-08-22 14:12:50.698887
833	7	-100	loss	Plinko game bet	\N	2026-08-22 14:17:28.925637
834	7	50	win	Plinko game payout	\N	2026-08-22 14:17:28.925637
835	7	-100	loss	Plinko game bet	\N	2026-08-22 14:17:28.925637
836	7	75	win	Plinko game payout	\N	2026-08-22 14:17:28.925637
837	7	-100	loss	Plinko game bet	\N	2026-08-22 14:17:28.925637
838	7	50	win	Plinko game payout	\N	2026-08-22 14:17:28.925637
839	7	-100	loss	Plinko game bet	\N	2026-08-22 14:17:28.925637
840	7	50	win	Plinko game payout	\N	2026-08-22 14:17:28.925637
841	7	-100	loss	Plinko game bet	\N	2026-08-22 14:17:28.925637
842	7	50	win	Plinko game payout	\N	2026-08-22 14:17:28.925637
843	7	-100	loss	Plinko game bet	\N	2026-08-22 14:17:28.925637
844	7	30	win	Plinko game payout	\N	2026-08-22 14:17:28.925637
845	7	-100	loss	Plinko game bet	\N	2026-08-22 14:17:28.925637
846	7	75	win	Plinko game payout	\N	2026-08-22 14:17:28.925637
847	7	-100	loss	Plinko game bet	\N	2026-08-22 14:17:28.925637
848	7	50	win	Plinko game payout	\N	2026-08-22 14:17:28.925637
849	7	-100	loss	Plinko game bet	\N	2026-08-22 14:17:28.925637
850	7	75	win	Plinko game payout	\N	2026-08-22 14:17:28.925637
851	7	-100	loss	Plinko game bet	\N	2026-08-22 14:17:28.925637
852	7	75	win	Plinko game payout	\N	2026-08-22 14:17:28.925637
853	7	-100	loss	Plinko game bet	\N	2026-08-22 14:17:31.652005
854	7	50	win	Plinko game payout	\N	2026-08-22 14:17:31.652005
855	7	-100	loss	Plinko game bet	\N	2026-08-22 14:17:31.652005
856	7	75	win	Plinko game payout	\N	2026-08-22 14:17:31.652005
857	7	-100	loss	Plinko game bet	\N	2026-08-22 14:17:31.652005
858	7	75	win	Plinko game payout	\N	2026-08-22 14:17:31.652005
859	7	-100	loss	Plinko game bet	\N	2026-08-22 14:17:31.652005
860	7	50	win	Plinko game payout	\N	2026-08-22 14:17:31.652005
861	7	-100	loss	Plinko game bet	\N	2026-08-22 14:17:31.652005
862	7	50	win	Plinko game payout	\N	2026-08-22 14:17:31.652005
863	7	-100	loss	Plinko game bet	\N	2026-08-22 14:17:31.652005
864	7	50	win	Plinko game payout	\N	2026-08-22 14:17:31.652005
865	7	-100	loss	Plinko game bet	\N	2026-08-22 14:17:31.652005
866	7	75	win	Plinko game payout	\N	2026-08-22 14:17:31.652005
867	7	-100	loss	Plinko game bet	\N	2026-08-22 14:17:31.652005
868	7	75	win	Plinko game payout	\N	2026-08-22 14:17:31.652005
869	7	-100	loss	Plinko game bet	\N	2026-08-22 14:17:31.652005
870	7	50	win	Plinko game payout	\N	2026-08-22 14:17:31.652005
871	7	-100	loss	Plinko game bet	\N	2026-08-22 14:17:31.652005
872	7	30	win	Plinko game payout	\N	2026-08-22 14:17:31.652005
873	7	-100	loss	Plinko game bet	\N	2026-08-22 14:17:34.6669
874	7	50	win	Plinko game payout	\N	2026-08-22 14:17:34.6669
875	7	-100	loss	Plinko game bet	\N	2026-08-22 14:17:34.6669
876	7	75	win	Plinko game payout	\N	2026-08-22 14:17:34.6669
877	7	-100	loss	Plinko game bet	\N	2026-08-22 14:17:34.6669
878	7	75	win	Plinko game payout	\N	2026-08-22 14:17:34.6669
879	7	-100	loss	Plinko game bet	\N	2026-08-22 14:17:34.6669
880	7	30	win	Plinko game payout	\N	2026-08-22 14:17:34.6669
881	7	-100	loss	Plinko game bet	\N	2026-08-22 14:17:34.6669
882	7	30	win	Plinko game payout	\N	2026-08-22 14:17:34.6669
883	7	-100	loss	Plinko game bet	\N	2026-08-22 14:17:34.6669
884	7	50	win	Plinko game payout	\N	2026-08-22 14:17:34.6669
885	7	-100	loss	Plinko game bet	\N	2026-08-22 14:17:34.6669
886	7	50	win	Plinko game payout	\N	2026-08-22 14:17:34.6669
887	7	-100	loss	Plinko game bet	\N	2026-08-22 14:17:34.6669
888	7	75	win	Plinko game payout	\N	2026-08-22 14:17:34.6669
889	7	-100	loss	Plinko game bet	\N	2026-08-22 14:17:34.6669
890	7	50	win	Plinko game payout	\N	2026-08-22 14:17:34.6669
891	7	-100	loss	Plinko game bet	\N	2026-08-22 14:17:34.6669
892	7	30	win	Plinko game payout	\N	2026-08-22 14:17:34.6669
893	7	-100	loss	Plinko game bet	\N	2026-08-22 14:17:37.221022
894	7	30	win	Plinko game payout	\N	2026-08-22 14:17:37.221022
895	7	-100	loss	Plinko game bet	\N	2026-08-22 14:17:37.221022
896	7	50	win	Plinko game payout	\N	2026-08-22 14:17:37.221022
897	7	-100	loss	Plinko game bet	\N	2026-08-22 14:17:37.221022
898	7	30	win	Plinko game payout	\N	2026-08-22 14:17:37.221022
899	7	-100	loss	Plinko game bet	\N	2026-08-22 14:17:37.221022
900	7	75	win	Plinko game payout	\N	2026-08-22 14:17:37.221022
901	7	-100	loss	Plinko game bet	\N	2026-08-22 14:17:37.221022
902	7	30	win	Plinko game payout	\N	2026-08-22 14:17:37.221022
903	7	-100	loss	Plinko game bet	\N	2026-08-22 14:17:37.221022
904	7	75	win	Plinko game payout	\N	2026-08-22 14:17:37.221022
905	7	-100	loss	Plinko game bet	\N	2026-08-22 14:17:37.221022
906	7	30	win	Plinko game payout	\N	2026-08-22 14:17:37.221022
907	7	-100	loss	Plinko game bet	\N	2026-08-22 14:17:37.221022
908	7	50	win	Plinko game payout	\N	2026-08-22 14:17:37.221022
909	7	-100	loss	Plinko game bet	\N	2026-08-22 14:17:37.221022
910	7	100	win	Plinko game payout	\N	2026-08-22 14:17:37.221022
911	7	-100	loss	Plinko game bet	\N	2026-08-22 14:17:37.221022
912	7	75	win	Plinko game payout	\N	2026-08-22 14:17:37.221022
913	7	-100	loss	Plinko game bet	\N	2026-08-22 14:17:41.450973
914	7	75	win	Plinko game payout	\N	2026-08-22 14:17:41.450973
915	7	-100	loss	Plinko game bet	\N	2026-08-22 14:17:41.450973
916	7	75	win	Plinko game payout	\N	2026-08-22 14:17:41.450973
917	7	-100	loss	Plinko game bet	\N	2026-08-22 14:17:41.450973
918	7	100	win	Plinko game payout	\N	2026-08-22 14:17:41.450973
919	7	-100	loss	Plinko game bet	\N	2026-08-22 14:17:41.450973
920	7	200	win	Plinko game payout	\N	2026-08-22 14:17:41.450973
921	7	-100	loss	Plinko game bet	\N	2026-08-22 14:17:41.450973
922	7	200	win	Plinko game payout	\N	2026-08-22 14:17:41.450973
923	7	-100	loss	Plinko game bet	\N	2026-08-22 14:17:41.450973
924	7	75	win	Plinko game payout	\N	2026-08-22 14:17:41.450973
925	7	-100	loss	Plinko game bet	\N	2026-08-22 14:17:41.450973
926	7	100	win	Plinko game payout	\N	2026-08-22 14:17:41.450973
927	7	-100	loss	Plinko game bet	\N	2026-08-22 14:17:41.450973
928	7	50	win	Plinko game payout	\N	2026-08-22 14:17:41.450973
929	7	-100	loss	Plinko game bet	\N	2026-08-22 14:17:41.450973
930	7	30	win	Plinko game payout	\N	2026-08-22 14:17:41.450973
931	7	-100	loss	Plinko game bet	\N	2026-08-22 14:17:41.450973
932	7	100	win	Plinko game payout	\N	2026-08-22 14:17:41.450973
933	7	-100	loss	Plinko game bet	\N	2026-08-22 14:17:45.202865
934	7	200	win	Plinko game payout	\N	2026-08-22 14:17:45.202865
935	7	-100	loss	Plinko game bet	\N	2026-08-22 14:17:45.202865
936	7	50	win	Plinko game payout	\N	2026-08-22 14:17:45.202865
937	7	-100	loss	Plinko game bet	\N	2026-08-22 14:17:45.202865
938	7	30	win	Plinko game payout	\N	2026-08-22 14:17:45.202865
939	7	-100	loss	Plinko game bet	\N	2026-08-22 14:17:45.202865
940	7	75	win	Plinko game payout	\N	2026-08-22 14:17:45.202865
941	7	-100	loss	Plinko game bet	\N	2026-08-22 14:17:45.202865
942	7	100	win	Plinko game payout	\N	2026-08-22 14:17:45.202865
943	7	-100	loss	Plinko game bet	\N	2026-08-22 14:17:45.202865
944	7	30	win	Plinko game payout	\N	2026-08-22 14:17:45.202865
945	7	-100	loss	Plinko game bet	\N	2026-08-22 14:17:45.202865
946	7	30	win	Plinko game payout	\N	2026-08-22 14:17:45.202865
947	7	-100	loss	Plinko game bet	\N	2026-08-22 14:17:45.202865
948	7	50	win	Plinko game payout	\N	2026-08-22 14:17:45.202865
949	7	-100	loss	Plinko game bet	\N	2026-08-22 14:17:45.202865
950	7	50	win	Plinko game payout	\N	2026-08-22 14:17:45.202865
951	7	-100	loss	Plinko game bet	\N	2026-08-22 14:17:45.202865
952	7	100	win	Plinko game payout	\N	2026-08-22 14:17:45.202865
953	7	-100	loss	Plinko game bet	\N	2026-08-22 14:17:48.402413
954	7	75	win	Plinko game payout	\N	2026-08-22 14:17:48.402413
955	7	-100	loss	Plinko game bet	\N	2026-08-22 14:17:48.402413
956	7	30	win	Plinko game payout	\N	2026-08-22 14:17:48.402413
957	7	-100	loss	Plinko game bet	\N	2026-08-22 14:17:48.402413
958	7	100	win	Plinko game payout	\N	2026-08-22 14:17:48.402413
959	7	-100	loss	Plinko game bet	\N	2026-08-22 14:17:48.402413
960	7	75	win	Plinko game payout	\N	2026-08-22 14:17:48.402413
961	7	-100	loss	Plinko game bet	\N	2026-08-22 14:17:48.402413
962	7	75	win	Plinko game payout	\N	2026-08-22 14:17:48.402413
963	7	-100	loss	Plinko game bet	\N	2026-08-22 14:17:48.402413
964	7	75	win	Plinko game payout	\N	2026-08-22 14:17:48.402413
965	7	-100	loss	Plinko game bet	\N	2026-08-22 14:17:48.402413
966	7	200	win	Plinko game payout	\N	2026-08-22 14:17:48.402413
967	7	-100	loss	Plinko game bet	\N	2026-08-22 14:17:48.402413
968	7	2000	win	Plinko game payout	\N	2026-08-22 14:17:48.402413
969	7	-100	loss	Plinko game bet	\N	2026-08-22 14:17:48.402413
970	7	30	win	Plinko game payout	\N	2026-08-22 14:17:48.402413
971	7	-100	loss	Plinko game bet	\N	2026-08-22 14:17:48.402413
972	7	75	win	Plinko game payout	\N	2026-08-22 14:17:48.402413
973	7	-100	loss	Plinko game bet	\N	2026-08-22 14:20:41.846453
974	7	75	win	Plinko game payout	\N	2026-08-22 14:20:41.846453
975	7	-100	loss	Plinko game bet	\N	2026-08-22 14:20:41.846453
976	7	50	win	Plinko game payout	\N	2026-08-22 14:20:41.846453
977	7	-100	loss	Plinko game bet	\N	2026-08-22 14:20:41.846453
978	7	50	win	Plinko game payout	\N	2026-08-22 14:20:41.846453
979	7	-100	loss	Plinko game bet	\N	2026-08-22 14:20:41.846453
980	7	50	win	Plinko game payout	\N	2026-08-22 14:20:41.846453
981	7	-100	loss	Plinko game bet	\N	2026-08-22 14:20:41.846453
982	7	30	win	Plinko game payout	\N	2026-08-22 14:20:41.846453
983	7	-100	loss	Plinko game bet	\N	2026-08-22 14:20:41.846453
984	7	30	win	Plinko game payout	\N	2026-08-22 14:20:41.846453
985	7	-100	loss	Plinko game bet	\N	2026-08-22 14:20:41.846453
986	7	50	win	Plinko game payout	\N	2026-08-22 14:20:41.846453
987	7	-100	loss	Plinko game bet	\N	2026-08-22 14:20:41.846453
988	7	50	win	Plinko game payout	\N	2026-08-22 14:20:41.846453
989	7	-100	loss	Plinko game bet	\N	2026-08-22 14:20:41.846453
990	7	75	win	Plinko game payout	\N	2026-08-22 14:20:41.846453
991	7	-100	loss	Plinko game bet	\N	2026-08-22 14:20:41.846453
992	7	75	win	Plinko game payout	\N	2026-08-22 14:20:41.846453
993	7	-100	loss	Plinko game bet	\N	2026-08-22 14:20:44.796554
994	7	50	win	Plinko game payout	\N	2026-08-22 14:20:44.796554
995	7	-100	loss	Plinko game bet	\N	2026-08-22 14:20:44.796554
996	7	100	win	Plinko game payout	\N	2026-08-22 14:20:44.796554
997	7	-100	loss	Plinko game bet	\N	2026-08-22 14:20:44.796554
998	7	50	win	Plinko game payout	\N	2026-08-22 14:20:44.796554
999	7	-100	loss	Plinko game bet	\N	2026-08-22 14:20:44.796554
1000	7	200	win	Plinko game payout	\N	2026-08-22 14:20:44.796554
1001	7	-100	loss	Plinko game bet	\N	2026-08-22 14:20:44.796554
1002	7	200	win	Plinko game payout	\N	2026-08-22 14:20:44.796554
1003	7	-100	loss	Plinko game bet	\N	2026-08-22 14:20:44.796554
1004	7	30	win	Plinko game payout	\N	2026-08-22 14:20:44.796554
1005	7	-100	loss	Plinko game bet	\N	2026-08-22 14:20:44.796554
1006	7	50	win	Plinko game payout	\N	2026-08-22 14:20:44.796554
1007	7	-100	loss	Plinko game bet	\N	2026-08-22 14:20:44.796554
1008	7	100	win	Plinko game payout	\N	2026-08-22 14:20:44.796554
1009	7	-100	loss	Plinko game bet	\N	2026-08-22 14:20:44.796554
1010	7	50	win	Plinko game payout	\N	2026-08-22 14:20:44.796554
1011	7	-100	loss	Plinko game bet	\N	2026-08-22 14:20:44.796554
1012	7	50	win	Plinko game payout	\N	2026-08-22 14:20:44.796554
1013	7	-100	loss	Plinko game bet	\N	2026-08-22 14:20:46.505125
1014	7	75	win	Plinko game payout	\N	2026-08-22 14:20:46.505125
1015	7	-100	loss	Plinko game bet	\N	2026-08-22 14:20:46.505125
1016	7	75	win	Plinko game payout	\N	2026-08-22 14:20:46.505125
1017	7	-100	loss	Plinko game bet	\N	2026-08-22 14:20:46.505125
1018	7	75	win	Plinko game payout	\N	2026-08-22 14:20:46.505125
1019	7	-100	loss	Plinko game bet	\N	2026-08-22 14:20:46.505125
1020	7	30	win	Plinko game payout	\N	2026-08-22 14:20:46.505125
1021	7	-100	loss	Plinko game bet	\N	2026-08-22 14:20:46.505125
1022	7	50	win	Plinko game payout	\N	2026-08-22 14:20:46.505125
1023	7	-100	loss	Plinko game bet	\N	2026-08-22 14:20:46.505125
1024	7	200	win	Plinko game payout	\N	2026-08-22 14:20:46.505125
1025	7	-100	loss	Plinko game bet	\N	2026-08-22 14:20:46.505125
1026	7	100	win	Plinko game payout	\N	2026-08-22 14:20:46.505125
1027	7	-100	loss	Plinko game bet	\N	2026-08-22 14:20:46.505125
1028	7	50	win	Plinko game payout	\N	2026-08-22 14:20:46.505125
1029	7	-100	loss	Plinko game bet	\N	2026-08-22 14:20:46.505125
1030	7	75	win	Plinko game payout	\N	2026-08-22 14:20:46.505125
1031	7	-100	loss	Plinko game bet	\N	2026-08-22 14:20:46.505125
1032	7	50	win	Plinko game payout	\N	2026-08-22 14:20:46.505125
1033	7	-100	loss	Plinko game bet	\N	2026-08-22 14:20:47.151843
1034	7	200	win	Plinko game payout	\N	2026-08-22 14:20:47.151843
1035	7	-100	loss	Plinko game bet	\N	2026-08-22 14:20:47.151843
1036	7	30	win	Plinko game payout	\N	2026-08-22 14:20:47.151843
1037	7	-100	loss	Plinko game bet	\N	2026-08-22 14:20:47.151843
1038	7	100	win	Plinko game payout	\N	2026-08-22 14:20:47.151843
1039	7	-100	loss	Plinko game bet	\N	2026-08-22 14:20:47.151843
1040	7	75	win	Plinko game payout	\N	2026-08-22 14:20:47.151843
1041	7	-100	loss	Plinko game bet	\N	2026-08-22 14:20:47.151843
1042	7	75	win	Plinko game payout	\N	2026-08-22 14:20:47.151843
1043	7	-100	loss	Plinko game bet	\N	2026-08-22 14:20:47.151843
1044	7	50	win	Plinko game payout	\N	2026-08-22 14:20:47.151843
1045	7	-100	loss	Plinko game bet	\N	2026-08-22 14:20:47.151843
1046	7	30	win	Plinko game payout	\N	2026-08-22 14:20:47.151843
1047	7	-100	loss	Plinko game bet	\N	2026-08-22 14:20:47.151843
1048	7	50	win	Plinko game payout	\N	2026-08-22 14:20:47.151843
1049	7	-100	loss	Plinko game bet	\N	2026-08-22 14:20:47.151843
1050	7	30	win	Plinko game payout	\N	2026-08-22 14:20:47.151843
1051	7	-100	loss	Plinko game bet	\N	2026-08-22 14:20:47.151843
1052	7	50	win	Plinko game payout	\N	2026-08-22 14:20:47.151843
1053	7	-100	loss	Plinko game bet	\N	2026-08-22 14:20:48.919989
1054	7	75	win	Plinko game payout	\N	2026-08-22 14:20:48.919989
1055	7	-100	loss	Plinko game bet	\N	2026-08-22 14:20:48.919989
1056	7	75	win	Plinko game payout	\N	2026-08-22 14:20:48.919989
1057	7	-100	loss	Plinko game bet	\N	2026-08-22 14:20:48.919989
1058	7	50	win	Plinko game payout	\N	2026-08-22 14:20:48.919989
1059	7	-100	loss	Plinko game bet	\N	2026-08-22 14:20:48.919989
1060	7	50	win	Plinko game payout	\N	2026-08-22 14:20:48.919989
1061	7	-100	loss	Plinko game bet	\N	2026-08-22 14:20:48.919989
1062	7	100	win	Plinko game payout	\N	2026-08-22 14:20:48.919989
1063	7	-100	loss	Plinko game bet	\N	2026-08-22 14:20:48.919989
1064	7	50	win	Plinko game payout	\N	2026-08-22 14:20:48.919989
1065	7	-100	loss	Plinko game bet	\N	2026-08-22 14:20:48.919989
1066	7	100	win	Plinko game payout	\N	2026-08-22 14:20:48.919989
1067	7	-100	loss	Plinko game bet	\N	2026-08-22 14:20:48.919989
1068	7	100	win	Plinko game payout	\N	2026-08-22 14:20:48.919989
1069	7	-100	loss	Plinko game bet	\N	2026-08-22 14:20:48.919989
1070	7	200	win	Plinko game payout	\N	2026-08-22 14:20:48.919989
1071	7	-100	loss	Plinko game bet	\N	2026-08-22 14:20:48.919989
1072	7	50	win	Plinko game payout	\N	2026-08-22 14:20:48.919989
1073	7	-100	loss	Plinko game bet	\N	2026-08-22 14:20:51.001438
1074	7	75	win	Plinko game payout	\N	2026-08-22 14:20:51.001438
1075	7	-100	loss	Plinko game bet	\N	2026-08-22 14:20:51.001438
1076	7	75	win	Plinko game payout	\N	2026-08-22 14:20:51.001438
1077	7	-100	loss	Plinko game bet	\N	2026-08-22 14:20:51.001438
1078	7	200	win	Plinko game payout	\N	2026-08-22 14:20:51.001438
1079	7	-100	loss	Plinko game bet	\N	2026-08-22 14:20:51.001438
1080	7	100	win	Plinko game payout	\N	2026-08-22 14:20:51.001438
1081	7	-100	loss	Plinko game bet	\N	2026-08-22 14:20:51.001438
1082	7	75	win	Plinko game payout	\N	2026-08-22 14:20:51.001438
1083	7	-100	loss	Plinko game bet	\N	2026-08-22 14:20:51.001438
1084	7	75	win	Plinko game payout	\N	2026-08-22 14:20:51.001438
1085	7	-100	loss	Plinko game bet	\N	2026-08-22 14:20:51.001438
1086	7	75	win	Plinko game payout	\N	2026-08-22 14:20:51.001438
1087	7	-100	loss	Plinko game bet	\N	2026-08-22 14:20:51.001438
1088	7	50	win	Plinko game payout	\N	2026-08-22 14:20:51.001438
1089	7	-100	loss	Plinko game bet	\N	2026-08-22 14:20:51.001438
1090	7	100	win	Plinko game payout	\N	2026-08-22 14:20:51.001438
1091	7	-100	loss	Plinko game bet	\N	2026-08-22 14:20:51.001438
1092	7	50	win	Plinko game payout	\N	2026-08-22 14:20:51.001438
1093	7	-100	loss	Plinko game bet	\N	2026-08-22 14:20:52.755884
1094	7	30	win	Plinko game payout	\N	2026-08-22 14:20:52.755884
1095	7	-100	loss	Plinko game bet	\N	2026-08-22 14:20:52.755884
1096	7	100	win	Plinko game payout	\N	2026-08-22 14:20:52.755884
1097	7	-100	loss	Plinko game bet	\N	2026-08-22 14:20:52.755884
1098	7	30	win	Plinko game payout	\N	2026-08-22 14:20:52.755884
1099	7	-100	loss	Plinko game bet	\N	2026-08-22 14:20:52.755884
1100	7	30	win	Plinko game payout	\N	2026-08-22 14:20:52.755884
1101	7	-100	loss	Plinko game bet	\N	2026-08-22 14:20:52.755884
1102	7	75	win	Plinko game payout	\N	2026-08-22 14:20:52.755884
1103	7	-100	loss	Plinko game bet	\N	2026-08-22 14:20:52.755884
1104	7	30	win	Plinko game payout	\N	2026-08-22 14:20:52.755884
1105	7	-100	loss	Plinko game bet	\N	2026-08-22 14:20:52.755884
1106	7	75	win	Plinko game payout	\N	2026-08-22 14:20:52.755884
1107	7	-100	loss	Plinko game bet	\N	2026-08-22 14:20:52.755884
1108	7	50	win	Plinko game payout	\N	2026-08-22 14:20:52.755884
1109	7	-100	loss	Plinko game bet	\N	2026-08-22 14:20:52.755884
1110	7	75	win	Plinko game payout	\N	2026-08-22 14:20:52.755884
1111	7	-100	loss	Plinko game bet	\N	2026-08-22 14:20:52.755884
1112	7	100	win	Plinko game payout	\N	2026-08-22 14:20:52.755884
1113	7	-100	loss	Plinko game bet	\N	2026-08-22 14:20:54.502387
1114	7	100	win	Plinko game payout	\N	2026-08-22 14:20:54.502387
1115	7	-100	loss	Plinko game bet	\N	2026-08-22 14:20:54.502387
1116	7	50	win	Plinko game payout	\N	2026-08-22 14:20:54.502387
1117	7	-100	loss	Plinko game bet	\N	2026-08-22 14:20:54.502387
1118	7	100	win	Plinko game payout	\N	2026-08-22 14:20:54.502387
1119	7	-100	loss	Plinko game bet	\N	2026-08-22 14:20:54.502387
1120	7	200	win	Plinko game payout	\N	2026-08-22 14:20:54.502387
1121	7	-100	loss	Plinko game bet	\N	2026-08-22 14:20:54.502387
1122	7	75	win	Plinko game payout	\N	2026-08-22 14:20:54.502387
1123	7	-100	loss	Plinko game bet	\N	2026-08-22 14:20:54.502387
1124	7	100	win	Plinko game payout	\N	2026-08-22 14:20:54.502387
1125	7	-100	loss	Plinko game bet	\N	2026-08-22 14:20:54.502387
1126	7	75	win	Plinko game payout	\N	2026-08-22 14:20:54.502387
1127	7	-100	loss	Plinko game bet	\N	2026-08-22 14:20:54.502387
1128	7	75	win	Plinko game payout	\N	2026-08-22 14:20:54.502387
1129	7	-100	loss	Plinko game bet	\N	2026-08-22 14:20:54.502387
1130	7	50	win	Plinko game payout	\N	2026-08-22 14:20:54.502387
1131	7	-100	loss	Plinko game bet	\N	2026-08-22 14:20:54.502387
1132	7	75	win	Plinko game payout	\N	2026-08-22 14:20:54.502387
1133	7	-100	loss	Plinko game bet	\N	2026-08-22 14:20:56.231503
1134	7	100	win	Plinko game payout	\N	2026-08-22 14:20:56.231503
1135	7	-100	loss	Plinko game bet	\N	2026-08-22 14:20:56.231503
1136	7	30	win	Plinko game payout	\N	2026-08-22 14:20:56.231503
1137	7	-100	loss	Plinko game bet	\N	2026-08-22 14:20:56.231503
1138	7	100	win	Plinko game payout	\N	2026-08-22 14:20:56.231503
1139	7	-100	loss	Plinko game bet	\N	2026-08-22 14:20:56.231503
1140	7	50	win	Plinko game payout	\N	2026-08-22 14:20:56.231503
1141	7	-100	loss	Plinko game bet	\N	2026-08-22 14:20:56.231503
1142	7	50	win	Plinko game payout	\N	2026-08-22 14:20:56.231503
1143	7	-100	loss	Plinko game bet	\N	2026-08-22 14:20:56.231503
1144	7	75	win	Plinko game payout	\N	2026-08-22 14:20:56.231503
1145	7	-100	loss	Plinko game bet	\N	2026-08-22 14:20:56.231503
1146	7	100	win	Plinko game payout	\N	2026-08-22 14:20:56.231503
1147	7	-100	loss	Plinko game bet	\N	2026-08-22 14:20:56.231503
1148	7	200	win	Plinko game payout	\N	2026-08-22 14:20:56.231503
1149	7	-100	loss	Plinko game bet	\N	2026-08-22 14:20:56.231503
1150	7	75	win	Plinko game payout	\N	2026-08-22 14:20:56.231503
1151	7	-100	loss	Plinko game bet	\N	2026-08-22 14:20:56.231503
1152	7	30	win	Plinko game payout	\N	2026-08-22 14:20:56.231503
1153	7	-100	loss	Plinko game bet	\N	2026-08-22 14:20:58.053969
1154	7	75	win	Plinko game payout	\N	2026-08-22 14:20:58.053969
1155	7	-100	loss	Plinko game bet	\N	2026-08-22 14:20:58.053969
1156	7	50	win	Plinko game payout	\N	2026-08-22 14:20:58.053969
1157	7	-100	loss	Plinko game bet	\N	2026-08-22 14:20:58.053969
1158	7	50	win	Plinko game payout	\N	2026-08-22 14:20:58.053969
1159	7	-100	loss	Plinko game bet	\N	2026-08-22 14:20:58.053969
1160	7	50	win	Plinko game payout	\N	2026-08-22 14:20:58.053969
1161	7	-100	loss	Plinko game bet	\N	2026-08-22 14:20:58.053969
1162	7	75	win	Plinko game payout	\N	2026-08-22 14:20:58.053969
1163	7	-100	loss	Plinko game bet	\N	2026-08-22 14:20:58.053969
1164	7	100	win	Plinko game payout	\N	2026-08-22 14:20:58.053969
1165	7	-100	loss	Plinko game bet	\N	2026-08-22 14:20:58.053969
1166	7	100	win	Plinko game payout	\N	2026-08-22 14:20:58.053969
1167	7	-100	loss	Plinko game bet	\N	2026-08-22 14:20:58.053969
1168	7	50	win	Plinko game payout	\N	2026-08-22 14:20:58.053969
1169	7	-100	loss	Plinko game bet	\N	2026-08-22 14:20:58.053969
1170	7	30	win	Plinko game payout	\N	2026-08-22 14:20:58.053969
1171	7	-100	loss	Plinko game bet	\N	2026-08-22 14:20:58.053969
1172	7	75	win	Plinko game payout	\N	2026-08-22 14:20:58.053969
1173	7	-100	loss	Plinko game bet	\N	2026-08-22 14:20:59.75565
1174	7	75	win	Plinko game payout	\N	2026-08-22 14:20:59.75565
1175	7	-100	loss	Plinko game bet	\N	2026-08-22 14:20:59.75565
1176	7	100	win	Plinko game payout	\N	2026-08-22 14:20:59.75565
1177	7	-100	loss	Plinko game bet	\N	2026-08-22 14:20:59.75565
1178	7	100	win	Plinko game payout	\N	2026-08-22 14:20:59.75565
1179	7	-100	loss	Plinko game bet	\N	2026-08-22 14:20:59.75565
1180	7	100	win	Plinko game payout	\N	2026-08-22 14:20:59.75565
1181	7	-100	loss	Plinko game bet	\N	2026-08-22 14:20:59.75565
1182	7	50	win	Plinko game payout	\N	2026-08-22 14:20:59.75565
1183	7	-100	loss	Plinko game bet	\N	2026-08-22 14:20:59.75565
1184	7	30	win	Plinko game payout	\N	2026-08-22 14:20:59.75565
1185	7	-100	loss	Plinko game bet	\N	2026-08-22 14:20:59.75565
1186	7	75	win	Plinko game payout	\N	2026-08-22 14:20:59.75565
1187	7	-100	loss	Plinko game bet	\N	2026-08-22 14:20:59.75565
1188	7	50	win	Plinko game payout	\N	2026-08-22 14:20:59.75565
1189	7	-100	loss	Plinko game bet	\N	2026-08-22 14:20:59.75565
1190	7	75	win	Plinko game payout	\N	2026-08-22 14:20:59.75565
1191	7	-100	loss	Plinko game bet	\N	2026-08-22 14:20:59.75565
1192	7	100	win	Plinko game payout	\N	2026-08-22 14:20:59.75565
1193	7	-100	loss	Plinko game bet	\N	2026-08-22 14:20:59.956404
1194	7	75	win	Plinko game payout	\N	2026-08-22 14:20:59.956404
1195	7	-100	loss	Plinko game bet	\N	2026-08-22 14:20:59.956404
1196	7	50	win	Plinko game payout	\N	2026-08-22 14:20:59.956404
1197	7	-100	loss	Plinko game bet	\N	2026-08-22 14:20:59.956404
1198	7	50	win	Plinko game payout	\N	2026-08-22 14:20:59.956404
1199	7	-100	loss	Plinko game bet	\N	2026-08-22 14:20:59.956404
1200	7	30	win	Plinko game payout	\N	2026-08-22 14:20:59.956404
1201	7	-100	loss	Plinko game bet	\N	2026-08-22 14:20:59.956404
1202	7	100	win	Plinko game payout	\N	2026-08-22 14:20:59.956404
1203	7	-100	loss	Plinko game bet	\N	2026-08-22 14:20:59.956404
1204	7	30	win	Plinko game payout	\N	2026-08-22 14:20:59.956404
1205	7	-100	loss	Plinko game bet	\N	2026-08-22 14:20:59.956404
1206	7	50	win	Plinko game payout	\N	2026-08-22 14:20:59.956404
1207	7	-100	loss	Plinko game bet	\N	2026-08-22 14:20:59.956404
1208	7	30	win	Plinko game payout	\N	2026-08-22 14:20:59.956404
1209	7	-100	loss	Plinko game bet	\N	2026-08-22 14:20:59.956404
1210	7	50	win	Plinko game payout	\N	2026-08-22 14:20:59.956404
1211	7	-100	loss	Plinko game bet	\N	2026-08-22 14:20:59.956404
1212	7	50	win	Plinko game payout	\N	2026-08-22 14:20:59.956404
1233	7	-100	loss	Plinko game bet	\N	2026-08-23 02:57:02.142771
1234	7	50	win	Plinko game payout	\N	2026-08-23 02:57:02.142771
1235	7	-100	loss	Plinko game bet	\N	2026-08-23 02:57:02.142771
1236	7	100	win	Plinko game payout	\N	2026-08-23 02:57:02.142771
1237	7	-100	loss	Plinko game bet	\N	2026-08-23 02:57:02.142771
1238	7	75	win	Plinko game payout	\N	2026-08-23 02:57:02.142771
1239	7	-100	loss	Plinko game bet	\N	2026-08-23 02:57:02.142771
1240	7	75	win	Plinko game payout	\N	2026-08-23 02:57:02.142771
1241	7	-100	loss	Plinko game bet	\N	2026-08-23 02:57:02.142771
1242	7	75	win	Plinko game payout	\N	2026-08-23 02:57:02.142771
1243	7	-100	loss	Plinko game bet	\N	2026-08-23 02:57:02.142771
1244	7	50	win	Plinko game payout	\N	2026-08-23 02:57:02.142771
1245	7	-100	loss	Plinko game bet	\N	2026-08-23 02:57:02.142771
1246	7	500	win	Plinko game payout	\N	2026-08-23 02:57:02.142771
1247	7	-100	loss	Plinko game bet	\N	2026-08-23 02:57:02.142771
1248	7	500	win	Plinko game payout	\N	2026-08-23 02:57:02.142771
1249	7	-100	loss	Plinko game bet	\N	2026-08-23 02:57:02.142771
1250	7	75	win	Plinko game payout	\N	2026-08-23 02:57:02.142771
1251	7	-100	loss	Plinko game bet	\N	2026-08-23 02:57:02.142771
1252	7	75	win	Plinko game payout	\N	2026-08-23 02:57:02.142771
1253	7	-90	purchase	Purchased card 0076776093	\N	2026-08-23 22:04:35.601115
1254	7	-475	purchase	Order purchase	\N	2026-08-24 16:04:40.622216
1256	7	-90	purchase	Purchased card 531462******8764	\N	2026-08-24 17:23:18.594778
1257	7	-90	purchase	Purchased card 493452******0089	\N	2026-08-24 18:10:20.612565
1259	7	100	redeem	Redeemed code: VOUCH-MTI2N1XIXFN2	\N	2026-09-01 02:52:24.87343
1261	7	-1000	loss	Plinko game bet	\N	2026-09-01 02:58:04.454207
1262	7	750	win	Plinko game payout	\N	2026-09-01 02:58:04.454207
1263	7	-1000	loss	Plinko game bet	\N	2026-09-01 02:58:04.454207
1264	7	750	win	Plinko game payout	\N	2026-09-01 02:58:04.454207
1265	7	-1000	loss	Plinko game bet	\N	2026-09-01 02:58:04.454207
1266	7	500	win	Plinko game payout	\N	2026-09-01 02:58:04.454207
1267	7	-1000	loss	Plinko game bet	\N	2026-09-01 02:58:04.454207
1268	7	300	win	Plinko game payout	\N	2026-09-01 02:58:04.454207
1269	7	-1000	loss	Plinko game bet	\N	2026-09-01 02:58:04.454207
1270	7	2000	win	Plinko game payout	\N	2026-09-01 02:58:04.454207
1271	7	-1000	loss	Plinko game bet	\N	2026-09-01 02:58:04.454207
1272	7	750	win	Plinko game payout	\N	2026-09-01 02:58:04.454207
1273	7	-1000	loss	Plinko game bet	\N	2026-09-01 02:58:04.454207
1274	7	750	win	Plinko game payout	\N	2026-09-01 02:58:04.454207
1275	7	-1000	loss	Plinko game bet	\N	2026-09-01 02:58:04.454207
1276	7	750	win	Plinko game payout	\N	2026-09-01 02:58:04.454207
1277	7	-1000	loss	Plinko game bet	\N	2026-09-01 02:58:04.454207
1278	7	750	win	Plinko game payout	\N	2026-09-01 02:58:04.454207
1279	7	-1000	loss	Plinko game bet	\N	2026-09-01 02:58:04.454207
1280	7	500	win	Plinko game payout	\N	2026-09-01 02:58:04.454207
1281	7	-1000	loss	Plinko game bet	\N	2026-09-01 02:58:04.454207
1282	7	500	win	Plinko game payout	\N	2026-09-01 02:58:04.454207
1283	7	-1000	loss	Plinko game bet	\N	2026-09-01 02:58:04.454207
1284	7	750	win	Plinko game payout	\N	2026-09-01 02:58:04.454207
1285	7	-1000	loss	Plinko game bet	\N	2026-09-01 02:58:04.454207
1286	7	750	win	Plinko game payout	\N	2026-09-01 02:58:04.454207
1287	7	-1000	loss	Plinko game bet	\N	2026-09-01 02:58:04.454207
1288	7	5000	win	Plinko game payout	\N	2026-09-01 02:58:04.454207
1289	7	-1000	loss	Plinko game bet	\N	2026-09-01 02:58:04.454207
1290	7	500	win	Plinko game payout	\N	2026-09-01 02:58:04.454207
1291	7	-1000	loss	Plinko game bet	\N	2026-09-01 02:58:04.454207
1292	7	750	win	Plinko game payout	\N	2026-09-01 02:58:04.454207
1293	7	-1000	loss	Plinko game bet	\N	2026-09-01 02:58:04.454207
1294	7	500	win	Plinko game payout	\N	2026-09-01 02:58:04.454207
1295	7	-1000	loss	Plinko game bet	\N	2026-09-01 02:58:04.454207
1296	7	500	win	Plinko game payout	\N	2026-09-01 02:58:04.454207
1297	7	-1000	loss	Plinko game bet	\N	2026-09-01 02:58:04.454207
1298	7	500	win	Plinko game payout	\N	2026-09-01 02:58:04.454207
1299	7	-1000	loss	Plinko game bet	\N	2026-09-01 02:58:04.454207
1300	7	1000	win	Plinko game payout	\N	2026-09-01 02:58:04.454207
1301	7	-1000	loss	Plinko game bet	\N	2026-09-01 02:58:10.701583
1302	7	750	win	Plinko game payout	\N	2026-09-01 02:58:10.701583
1303	7	-1000	loss	Plinko game bet	\N	2026-09-01 02:58:10.701583
1304	7	1000	win	Plinko game payout	\N	2026-09-01 02:58:10.701583
1305	7	-1000	loss	Plinko game bet	\N	2026-09-01 02:58:10.701583
1306	7	500	win	Plinko game payout	\N	2026-09-01 02:58:10.701583
1307	7	-1000	loss	Plinko game bet	\N	2026-09-01 02:58:10.701583
1308	7	300	win	Plinko game payout	\N	2026-09-01 02:58:10.701583
1309	7	-1000	loss	Plinko game bet	\N	2026-09-01 02:58:10.701583
1310	7	500	win	Plinko game payout	\N	2026-09-01 02:58:10.701583
1311	7	-1000	loss	Plinko game bet	\N	2026-09-01 02:58:10.701583
1213	7	-100	loss	Plinko game bet	\N	2026-08-22 14:21:02.010381
1214	7	30	win	Plinko game payout	\N	2026-08-22 14:21:02.010381
1215	7	-100	loss	Plinko game bet	\N	2026-08-22 14:21:02.010381
1216	7	30	win	Plinko game payout	\N	2026-08-22 14:21:02.010381
1217	7	-100	loss	Plinko game bet	\N	2026-08-22 14:21:02.010381
1218	7	50	win	Plinko game payout	\N	2026-08-22 14:21:02.010381
1219	7	-100	loss	Plinko game bet	\N	2026-08-22 14:21:02.010381
1220	7	30	win	Plinko game payout	\N	2026-08-22 14:21:02.010381
1221	7	-100	loss	Plinko game bet	\N	2026-08-22 14:21:02.010381
1222	7	100	win	Plinko game payout	\N	2026-08-22 14:21:02.010381
1223	7	-100	loss	Plinko game bet	\N	2026-08-22 14:21:02.010381
1224	7	30	win	Plinko game payout	\N	2026-08-22 14:21:02.010381
1225	7	-100	loss	Plinko game bet	\N	2026-08-22 14:21:02.010381
1226	7	75	win	Plinko game payout	\N	2026-08-22 14:21:02.010381
1227	7	-100	loss	Plinko game bet	\N	2026-08-22 14:21:02.010381
1228	7	200	win	Plinko game payout	\N	2026-08-22 14:21:02.010381
1229	7	-100	loss	Plinko game bet	\N	2026-08-22 14:21:02.010381
1230	7	100	win	Plinko game payout	\N	2026-08-22 14:21:02.010381
1231	7	-100	loss	Plinko game bet	\N	2026-08-22 14:21:02.010381
1232	7	75	win	Plinko game payout	\N	2026-08-22 14:21:02.010381
1255	7	-90	purchase	Purchased card 543276******4614	\N	2026-08-24 16:23:24.593884
1258	7	90	refund	Refund for order #CARD-jy0je5xxd7	\N	2026-08-24 18:13:07.992154
1260	7	500	deposit	CashApp deposit confirmed (nbdghftxmegbeb82vekw59)	CashApp	2026-09-01 02:57:52.926516
1312	7	1000	win	Plinko game payout	\N	2026-09-01 02:58:10.701583
1313	7	-1000	loss	Plinko game bet	\N	2026-09-01 02:58:10.701583
1314	7	750	win	Plinko game payout	\N	2026-09-01 02:58:10.701583
1315	7	-1000	loss	Plinko game bet	\N	2026-09-01 02:58:10.701583
1316	7	1000	win	Plinko game payout	\N	2026-09-01 02:58:10.701583
1317	7	-1000	loss	Plinko game bet	\N	2026-09-01 02:58:10.701583
1318	7	500	win	Plinko game payout	\N	2026-09-01 02:58:10.701583
1319	7	-1000	loss	Plinko game bet	\N	2026-09-01 02:58:10.701583
1320	7	750	win	Plinko game payout	\N	2026-09-01 02:58:10.701583
1321	7	-1000	loss	Plinko game bet	\N	2026-09-01 02:58:10.701583
1322	7	750	win	Plinko game payout	\N	2026-09-01 02:58:10.701583
1323	7	-1000	loss	Plinko game bet	\N	2026-09-01 02:58:10.701583
1324	7	500	win	Plinko game payout	\N	2026-09-01 02:58:10.701583
1325	7	-1000	loss	Plinko game bet	\N	2026-09-01 02:58:10.701583
1326	7	750	win	Plinko game payout	\N	2026-09-01 02:58:10.701583
1327	7	-1000	loss	Plinko game bet	\N	2026-09-01 02:58:10.701583
1328	7	750	win	Plinko game payout	\N	2026-09-01 02:58:10.701583
1329	7	-1000	loss	Plinko game bet	\N	2026-09-01 02:58:10.701583
1330	7	750	win	Plinko game payout	\N	2026-09-01 02:58:10.701583
1331	7	-1000	loss	Plinko game bet	\N	2026-09-01 02:58:10.701583
1332	7	500	win	Plinko game payout	\N	2026-09-01 02:58:10.701583
1333	7	-1000	loss	Plinko game bet	\N	2026-09-01 02:58:10.701583
1334	7	750	win	Plinko game payout	\N	2026-09-01 02:58:10.701583
1335	7	-1000	loss	Plinko game bet	\N	2026-09-01 02:58:10.701583
1336	7	300	win	Plinko game payout	\N	2026-09-01 02:58:10.701583
1337	7	-1000	loss	Plinko game bet	\N	2026-09-01 02:58:10.701583
1338	7	1000	win	Plinko game payout	\N	2026-09-01 02:58:10.701583
1339	7	-1000	loss	Plinko game bet	\N	2026-09-01 02:58:10.701583
1340	7	500	win	Plinko game payout	\N	2026-09-01 02:58:10.701583
1341	7	-1000	loss	Plinko game bet	\N	2026-09-01 02:58:15.163639
1342	7	500	win	Plinko game payout	\N	2026-09-01 02:58:15.163639
1343	7	-1000	loss	Plinko game bet	\N	2026-09-01 02:58:15.163639
1344	7	300	win	Plinko game payout	\N	2026-09-01 02:58:15.163639
1345	7	-1000	loss	Plinko game bet	\N	2026-09-01 02:58:15.163639
1346	7	500	win	Plinko game payout	\N	2026-09-01 02:58:15.163639
1347	7	-1000	loss	Plinko game bet	\N	2026-09-01 02:58:15.163639
1348	7	1000	win	Plinko game payout	\N	2026-09-01 02:58:15.163639
1349	7	-1000	loss	Plinko game bet	\N	2026-09-01 02:58:15.163639
1350	7	750	win	Plinko game payout	\N	2026-09-01 02:58:15.163639
1351	7	-1000	loss	Plinko game bet	\N	2026-09-01 02:58:15.163639
1352	7	500	win	Plinko game payout	\N	2026-09-01 02:58:15.163639
1353	7	-1000	loss	Plinko game bet	\N	2026-09-01 02:58:15.163639
1354	7	750	win	Plinko game payout	\N	2026-09-01 02:58:15.163639
1355	7	-1000	loss	Plinko game bet	\N	2026-09-01 02:58:15.163639
1356	7	2000	win	Plinko game payout	\N	2026-09-01 02:58:15.163639
1357	7	-1000	loss	Plinko game bet	\N	2026-09-01 02:58:15.163639
1358	7	750	win	Plinko game payout	\N	2026-09-01 02:58:15.163639
1359	7	-1000	loss	Plinko game bet	\N	2026-09-01 02:58:15.163639
1360	7	500	win	Plinko game payout	\N	2026-09-01 02:58:15.163639
1361	7	-1000	loss	Plinko game bet	\N	2026-09-01 02:58:15.163639
1362	7	1000	win	Plinko game payout	\N	2026-09-01 02:58:15.163639
1363	7	-1000	loss	Plinko game bet	\N	2026-09-01 02:58:15.163639
1364	7	750	win	Plinko game payout	\N	2026-09-01 02:58:15.163639
1365	7	-1000	loss	Plinko game bet	\N	2026-09-01 02:58:15.163639
1366	7	500	win	Plinko game payout	\N	2026-09-01 02:58:15.163639
1367	7	-1000	loss	Plinko game bet	\N	2026-09-01 02:58:15.163639
1368	7	500	win	Plinko game payout	\N	2026-09-01 02:58:15.163639
1369	7	-1000	loss	Plinko game bet	\N	2026-09-01 02:58:15.163639
1370	7	500	win	Plinko game payout	\N	2026-09-01 02:58:15.163639
1371	7	-1000	loss	Plinko game bet	\N	2026-09-01 02:58:15.163639
1372	7	500	win	Plinko game payout	\N	2026-09-01 02:58:15.163639
1373	7	-1000	loss	Plinko game bet	\N	2026-09-01 02:58:15.163639
1374	7	750	win	Plinko game payout	\N	2026-09-01 02:58:15.163639
1375	7	-1000	loss	Plinko game bet	\N	2026-09-01 02:58:15.163639
1376	7	750	win	Plinko game payout	\N	2026-09-01 02:58:15.163639
1377	7	-1000	loss	Plinko game bet	\N	2026-09-01 02:58:15.163639
1378	7	1000	win	Plinko game payout	\N	2026-09-01 02:58:15.163639
1379	7	-1000	loss	Plinko game bet	\N	2026-09-01 02:58:15.163639
1380	7	5000	win	Plinko game payout	\N	2026-09-01 02:58:15.163639
1381	7	-1000	loss	Plinko game bet	\N	2026-09-01 02:58:18.355673
1382	7	750	win	Plinko game payout	\N	2026-09-01 02:58:18.355673
1383	7	-1000	loss	Plinko game bet	\N	2026-09-01 02:58:18.355673
1384	7	300	win	Plinko game payout	\N	2026-09-01 02:58:18.355673
1385	7	-1000	loss	Plinko game bet	\N	2026-09-01 02:58:18.355673
1386	7	750	win	Plinko game payout	\N	2026-09-01 02:58:18.355673
1387	7	-1000	loss	Plinko game bet	\N	2026-09-01 02:58:18.355673
1388	7	500	win	Plinko game payout	\N	2026-09-01 02:58:18.355673
1389	7	-1000	loss	Plinko game bet	\N	2026-09-01 02:58:18.355673
1390	7	300	win	Plinko game payout	\N	2026-09-01 02:58:18.355673
1391	7	-1000	loss	Plinko game bet	\N	2026-09-01 02:58:18.355673
1392	7	500	win	Plinko game payout	\N	2026-09-01 02:58:18.355673
1393	7	-1000	loss	Plinko game bet	\N	2026-09-01 02:58:18.355673
1394	7	500	win	Plinko game payout	\N	2026-09-01 02:58:18.355673
1395	7	-1000	loss	Plinko game bet	\N	2026-09-01 02:58:18.355673
1396	7	750	win	Plinko game payout	\N	2026-09-01 02:58:18.355673
1397	7	-1000	loss	Plinko game bet	\N	2026-09-01 02:58:18.355673
1398	7	500	win	Plinko game payout	\N	2026-09-01 02:58:18.355673
1399	7	-1000	loss	Plinko game bet	\N	2026-09-01 02:58:18.355673
1400	7	1000	win	Plinko game payout	\N	2026-09-01 02:58:18.355673
1401	7	-1000	loss	Plinko game bet	\N	2026-09-01 02:58:18.355673
1402	7	500	win	Plinko game payout	\N	2026-09-01 02:58:18.355673
1403	7	-1000	loss	Plinko game bet	\N	2026-09-01 02:58:18.355673
1404	7	300	win	Plinko game payout	\N	2026-09-01 02:58:18.355673
1405	7	-1000	loss	Plinko game bet	\N	2026-09-01 02:58:18.355673
1406	7	750	win	Plinko game payout	\N	2026-09-01 02:58:18.355673
1407	7	-1000	loss	Plinko game bet	\N	2026-09-01 02:58:18.355673
1408	7	500	win	Plinko game payout	\N	2026-09-01 02:58:18.355673
1409	7	-1000	loss	Plinko game bet	\N	2026-09-01 02:58:18.355673
1410	7	300	win	Plinko game payout	\N	2026-09-01 02:58:18.355673
1411	7	-1000	loss	Plinko game bet	\N	2026-09-01 02:58:18.355673
1412	7	1000	win	Plinko game payout	\N	2026-09-01 02:58:18.355673
1413	7	-1000	loss	Plinko game bet	\N	2026-09-01 02:58:18.355673
1414	7	1000	win	Plinko game payout	\N	2026-09-01 02:58:18.355673
1415	7	-1000	loss	Plinko game bet	\N	2026-09-01 02:58:18.355673
1416	7	500	win	Plinko game payout	\N	2026-09-01 02:58:18.355673
1417	7	-1000	loss	Plinko game bet	\N	2026-09-01 02:58:18.355673
1418	7	750	win	Plinko game payout	\N	2026-09-01 02:58:18.355673
1419	7	-1000	loss	Plinko game bet	\N	2026-09-01 02:58:18.355673
1420	7	1000	win	Plinko game payout	\N	2026-09-01 02:58:18.355673
1421	7	-1000	loss	Plinko game bet	\N	2026-09-01 02:58:20.83136
1422	7	500	win	Plinko game payout	\N	2026-09-01 02:58:20.83136
1423	7	-1000	loss	Plinko game bet	\N	2026-09-01 02:58:20.83136
1424	7	1000	win	Plinko game payout	\N	2026-09-01 02:58:20.83136
1425	7	-1000	loss	Plinko game bet	\N	2026-09-01 02:58:20.83136
1426	7	500	win	Plinko game payout	\N	2026-09-01 02:58:20.83136
1427	7	-1000	loss	Plinko game bet	\N	2026-09-01 02:58:20.83136
1428	7	750	win	Plinko game payout	\N	2026-09-01 02:58:20.83136
1429	7	-1000	loss	Plinko game bet	\N	2026-09-01 02:58:20.83136
1430	7	1000	win	Plinko game payout	\N	2026-09-01 02:58:20.83136
1431	7	-1000	loss	Plinko game bet	\N	2026-09-01 02:58:20.83136
1432	7	300	win	Plinko game payout	\N	2026-09-01 02:58:20.83136
1433	7	-1000	loss	Plinko game bet	\N	2026-09-01 02:58:20.83136
1434	7	1000	win	Plinko game payout	\N	2026-09-01 02:58:20.83136
1435	7	-1000	loss	Plinko game bet	\N	2026-09-01 02:58:20.83136
1436	7	2000	win	Plinko game payout	\N	2026-09-01 02:58:20.83136
1437	7	-1000	loss	Plinko game bet	\N	2026-09-01 02:58:20.83136
1438	7	1000	win	Plinko game payout	\N	2026-09-01 02:58:20.83136
1439	7	-1000	loss	Plinko game bet	\N	2026-09-01 02:58:20.83136
1440	7	750	win	Plinko game payout	\N	2026-09-01 02:58:20.83136
1441	7	-1000	loss	Plinko game bet	\N	2026-09-01 02:58:20.83136
1442	7	300	win	Plinko game payout	\N	2026-09-01 02:58:20.83136
1443	7	-1000	loss	Plinko game bet	\N	2026-09-01 02:58:20.83136
1444	7	750	win	Plinko game payout	\N	2026-09-01 02:58:20.83136
1445	7	-1000	loss	Plinko game bet	\N	2026-09-01 02:58:20.83136
1446	7	1000	win	Plinko game payout	\N	2026-09-01 02:58:20.83136
1447	7	-1000	loss	Plinko game bet	\N	2026-09-01 02:58:20.83136
1448	7	2000	win	Plinko game payout	\N	2026-09-01 02:58:20.83136
1449	7	-1000	loss	Plinko game bet	\N	2026-09-01 02:58:20.83136
1450	7	750	win	Plinko game payout	\N	2026-09-01 02:58:20.83136
1451	7	-1000	loss	Plinko game bet	\N	2026-09-01 02:58:20.83136
1452	7	300	win	Plinko game payout	\N	2026-09-01 02:58:20.83136
1453	7	-1000	loss	Plinko game bet	\N	2026-09-01 02:58:20.83136
1454	7	750	win	Plinko game payout	\N	2026-09-01 02:58:20.83136
1455	7	-1000	loss	Plinko game bet	\N	2026-09-01 02:58:20.83136
1456	7	1000	win	Plinko game payout	\N	2026-09-01 02:58:20.83136
1457	7	-1000	loss	Plinko game bet	\N	2026-09-01 02:58:20.83136
1458	7	500	win	Plinko game payout	\N	2026-09-01 02:58:20.83136
1459	7	-1000	loss	Plinko game bet	\N	2026-09-01 02:58:20.83136
1460	7	500	win	Plinko game payout	\N	2026-09-01 02:58:20.83136
1461	7	-1000	loss	Plinko game bet	\N	2026-09-01 02:58:23.487227
1462	7	750	win	Plinko game payout	\N	2026-09-01 02:58:23.487227
1463	7	-1000	loss	Plinko game bet	\N	2026-09-01 02:58:23.487227
1464	7	300	win	Plinko game payout	\N	2026-09-01 02:58:23.487227
1465	7	-1000	loss	Plinko game bet	\N	2026-09-01 02:58:23.487227
1466	7	300	win	Plinko game payout	\N	2026-09-01 02:58:23.487227
1467	7	-1000	loss	Plinko game bet	\N	2026-09-01 02:58:23.487227
1468	7	1000	win	Plinko game payout	\N	2026-09-01 02:58:23.487227
1469	7	-1000	loss	Plinko game bet	\N	2026-09-01 02:58:23.487227
1470	7	750	win	Plinko game payout	\N	2026-09-01 02:58:23.487227
1471	7	-1000	loss	Plinko game bet	\N	2026-09-01 02:58:23.487227
1472	7	500	win	Plinko game payout	\N	2026-09-01 02:58:23.487227
1473	7	-1000	loss	Plinko game bet	\N	2026-09-01 02:58:23.487227
1474	7	500	win	Plinko game payout	\N	2026-09-01 02:58:23.487227
1475	7	-1000	loss	Plinko game bet	\N	2026-09-01 02:58:23.487227
1476	7	500	win	Plinko game payout	\N	2026-09-01 02:58:23.487227
1477	7	-1000	loss	Plinko game bet	\N	2026-09-01 02:58:23.487227
1478	7	500	win	Plinko game payout	\N	2026-09-01 02:58:23.487227
1479	7	-1000	loss	Plinko game bet	\N	2026-09-01 02:58:23.487227
1480	7	2000	win	Plinko game payout	\N	2026-09-01 02:58:23.487227
1481	7	-1000	loss	Plinko game bet	\N	2026-09-01 02:58:23.487227
1482	7	1000	win	Plinko game payout	\N	2026-09-01 02:58:23.487227
1483	7	-1000	loss	Plinko game bet	\N	2026-09-01 02:58:23.487227
1484	7	500	win	Plinko game payout	\N	2026-09-01 02:58:23.487227
1485	7	-1000	loss	Plinko game bet	\N	2026-09-01 02:58:23.487227
1486	7	300	win	Plinko game payout	\N	2026-09-01 02:58:23.487227
1487	7	-1000	loss	Plinko game bet	\N	2026-09-01 02:58:23.487227
1488	7	750	win	Plinko game payout	\N	2026-09-01 02:58:23.487227
1489	7	-1000	loss	Plinko game bet	\N	2026-09-01 02:58:23.487227
1490	7	300	win	Plinko game payout	\N	2026-09-01 02:58:23.487227
1491	7	-1000	loss	Plinko game bet	\N	2026-09-01 02:58:23.487227
1492	7	750	win	Plinko game payout	\N	2026-09-01 02:58:23.487227
1493	7	-1000	loss	Plinko game bet	\N	2026-09-01 02:58:23.487227
1494	7	300	win	Plinko game payout	\N	2026-09-01 02:58:23.487227
1495	7	-1000	loss	Plinko game bet	\N	2026-09-01 02:58:23.487227
1496	7	500	win	Plinko game payout	\N	2026-09-01 02:58:23.487227
1497	7	-1000	loss	Plinko game bet	\N	2026-09-01 02:58:23.487227
1498	7	500	win	Plinko game payout	\N	2026-09-01 02:58:23.487227
1499	7	-1000	loss	Plinko game bet	\N	2026-09-01 02:58:23.487227
1500	7	750	win	Plinko game payout	\N	2026-09-01 02:58:23.487227
1501	7	-1000	loss	Plinko game bet	\N	2026-09-01 02:58:28.401784
1502	7	300	win	Plinko game payout	\N	2026-09-01 02:58:28.401784
1503	7	-1000	loss	Plinko game bet	\N	2026-09-01 02:58:28.401784
1504	7	750	win	Plinko game payout	\N	2026-09-01 02:58:28.401784
1505	7	-1000	loss	Plinko game bet	\N	2026-09-01 02:58:28.401784
1506	7	500	win	Plinko game payout	\N	2026-09-01 02:58:28.401784
1507	7	-1000	loss	Plinko game bet	\N	2026-09-01 02:58:28.401784
1508	7	500	win	Plinko game payout	\N	2026-09-01 02:58:28.401784
1509	7	-1000	loss	Plinko game bet	\N	2026-09-01 02:58:28.401784
1510	7	300	win	Plinko game payout	\N	2026-09-01 02:58:28.401784
1511	7	-1000	loss	Plinko game bet	\N	2026-09-01 02:58:28.401784
1512	7	500	win	Plinko game payout	\N	2026-09-01 02:58:28.401784
1513	7	-1000	loss	Plinko game bet	\N	2026-09-01 02:58:28.401784
1514	7	750	win	Plinko game payout	\N	2026-09-01 02:58:28.401784
1515	7	-1000	loss	Plinko game bet	\N	2026-09-01 02:58:28.401784
1516	7	2000	win	Plinko game payout	\N	2026-09-01 02:58:28.401784
1517	7	-1000	loss	Plinko game bet	\N	2026-09-01 02:58:28.401784
1518	7	300	win	Plinko game payout	\N	2026-09-01 02:58:28.401784
1519	7	-1000	loss	Plinko game bet	\N	2026-09-01 02:58:28.401784
1520	7	300	win	Plinko game payout	\N	2026-09-01 02:58:28.401784
1521	7	-1000	loss	Plinko game bet	\N	2026-09-01 02:58:28.401784
1522	7	750	win	Plinko game payout	\N	2026-09-01 02:58:28.401784
1523	7	-1000	loss	Plinko game bet	\N	2026-09-01 02:58:28.401784
1524	7	300	win	Plinko game payout	\N	2026-09-01 02:58:28.401784
1525	7	-1000	loss	Plinko game bet	\N	2026-09-01 02:58:28.401784
1526	7	1000	win	Plinko game payout	\N	2026-09-01 02:58:28.401784
1527	7	-1000	loss	Plinko game bet	\N	2026-09-01 02:58:28.401784
1528	7	750	win	Plinko game payout	\N	2026-09-01 02:58:28.401784
1529	7	-1000	loss	Plinko game bet	\N	2026-09-01 02:58:28.401784
1530	7	750	win	Plinko game payout	\N	2026-09-01 02:58:28.401784
1531	7	-1000	loss	Plinko game bet	\N	2026-09-01 02:58:28.401784
1532	7	500	win	Plinko game payout	\N	2026-09-01 02:58:28.401784
1533	7	-1000	loss	Plinko game bet	\N	2026-09-01 02:58:28.401784
1534	7	750	win	Plinko game payout	\N	2026-09-01 02:58:28.401784
1535	7	-1000	loss	Plinko game bet	\N	2026-09-01 02:58:28.401784
1536	7	2000	win	Plinko game payout	\N	2026-09-01 02:58:28.401784
1537	7	-1000	loss	Plinko game bet	\N	2026-09-01 02:58:28.401784
1538	7	500	win	Plinko game payout	\N	2026-09-01 02:58:28.401784
1539	7	-1000	loss	Plinko game bet	\N	2026-09-01 02:58:28.401784
1540	7	500	win	Plinko game payout	\N	2026-09-01 02:58:28.401784
1541	7	-1000	loss	Plinko game bet	\N	2026-09-01 02:58:34.045979
1542	7	500	win	Plinko game payout	\N	2026-09-01 02:58:34.045979
1543	7	-1000	loss	Plinko game bet	\N	2026-09-01 02:58:34.045979
1544	7	2000	win	Plinko game payout	\N	2026-09-01 02:58:34.045979
1545	7	-1000	loss	Plinko game bet	\N	2026-09-01 02:58:34.045979
1546	7	750	win	Plinko game payout	\N	2026-09-01 02:58:34.045979
1547	7	-1000	loss	Plinko game bet	\N	2026-09-01 02:58:34.045979
1548	7	500	win	Plinko game payout	\N	2026-09-01 02:58:34.045979
1549	7	-1000	loss	Plinko game bet	\N	2026-09-01 02:58:34.045979
1550	7	750	win	Plinko game payout	\N	2026-09-01 02:58:34.045979
1551	7	-1000	loss	Plinko game bet	\N	2026-09-01 02:58:34.045979
1552	7	1000	win	Plinko game payout	\N	2026-09-01 02:58:34.045979
1553	7	-1000	loss	Plinko game bet	\N	2026-09-01 02:58:34.045979
1554	7	750	win	Plinko game payout	\N	2026-09-01 02:58:34.045979
1555	7	-1000	loss	Plinko game bet	\N	2026-09-01 02:58:34.045979
1556	7	2000	win	Plinko game payout	\N	2026-09-01 02:58:34.045979
1557	7	-1000	loss	Plinko game bet	\N	2026-09-01 02:58:34.045979
1558	7	500	win	Plinko game payout	\N	2026-09-01 02:58:34.045979
1559	7	-1000	loss	Plinko game bet	\N	2026-09-01 02:58:34.045979
1560	7	750	win	Plinko game payout	\N	2026-09-01 02:58:34.045979
1561	7	-1000	loss	Plinko game bet	\N	2026-09-01 02:58:37.646702
1562	7	2000	win	Plinko game payout	\N	2026-09-01 02:58:37.646702
1563	7	-1000	loss	Plinko game bet	\N	2026-09-01 02:58:37.646702
1564	7	750	win	Plinko game payout	\N	2026-09-01 02:58:37.646702
1565	7	-1000	loss	Plinko game bet	\N	2026-09-01 02:58:37.646702
1566	7	750	win	Plinko game payout	\N	2026-09-01 02:58:37.646702
1567	7	-1000	loss	Plinko game bet	\N	2026-09-01 02:58:37.646702
1568	7	500	win	Plinko game payout	\N	2026-09-01 02:58:37.646702
1569	7	-1000	loss	Plinko game bet	\N	2026-09-01 02:58:37.646702
1570	7	750	win	Plinko game payout	\N	2026-09-01 02:58:37.646702
1571	7	-1000	loss	Plinko game bet	\N	2026-09-01 02:58:37.646702
1572	7	500	win	Plinko game payout	\N	2026-09-01 02:58:37.646702
1573	7	-1000	loss	Plinko game bet	\N	2026-09-01 02:58:37.646702
1574	7	2000	win	Plinko game payout	\N	2026-09-01 02:58:37.646702
1575	7	-1000	loss	Plinko game bet	\N	2026-09-01 02:58:37.646702
1576	7	500	win	Plinko game payout	\N	2026-09-01 02:58:37.646702
1577	7	-1000	loss	Plinko game bet	\N	2026-09-01 02:58:37.646702
1578	7	300	win	Plinko game payout	\N	2026-09-01 02:58:37.646702
1579	7	-1000	loss	Plinko game bet	\N	2026-09-01 02:58:37.646702
1580	7	750	win	Plinko game payout	\N	2026-09-01 02:58:37.646702
1581	7	-1000	loss	Plinko game bet	\N	2026-09-01 02:58:41.657396
1582	7	2000	win	Plinko game payout	\N	2026-09-01 02:58:41.657396
1583	7	-1000	loss	Plinko game bet	\N	2026-09-01 02:58:41.657396
1584	7	500	win	Plinko game payout	\N	2026-09-01 02:58:41.657396
1585	7	-1000	loss	Plinko game bet	\N	2026-09-01 02:58:41.657396
1586	7	500	win	Plinko game payout	\N	2026-09-01 02:58:41.657396
1587	7	-1000	loss	Plinko game bet	\N	2026-09-01 02:58:41.657396
1588	7	300	win	Plinko game payout	\N	2026-09-01 02:58:41.657396
1589	7	-1000	loss	Plinko game bet	\N	2026-09-01 02:58:41.657396
1590	7	750	win	Plinko game payout	\N	2026-09-01 02:58:41.657396
1591	7	-1000	loss	Plinko game bet	\N	2026-09-01 02:58:41.657396
1592	7	750	win	Plinko game payout	\N	2026-09-01 02:58:41.657396
1593	7	-1000	loss	Plinko game bet	\N	2026-09-01 02:58:41.657396
1594	7	1000	win	Plinko game payout	\N	2026-09-01 02:58:41.657396
1595	7	-1000	loss	Plinko game bet	\N	2026-09-01 02:58:41.657396
1596	7	5000	win	Plinko game payout	\N	2026-09-01 02:58:41.657396
1597	7	-1000	loss	Plinko game bet	\N	2026-09-01 02:58:41.657396
1598	7	300	win	Plinko game payout	\N	2026-09-01 02:58:41.657396
1599	7	-1000	loss	Plinko game bet	\N	2026-09-01 02:58:41.657396
1600	7	750	win	Plinko game payout	\N	2026-09-01 02:58:41.657396
1601	7	-1000	loss	Plinko game bet	\N	2026-09-01 02:58:48.310544
1602	7	750	win	Plinko game payout	\N	2026-09-01 02:58:48.310544
1603	7	-1000	loss	Plinko game bet	\N	2026-09-01 02:58:48.310544
1604	7	2000	win	Plinko game payout	\N	2026-09-01 02:58:48.310544
1605	7	-1000	loss	Plinko game bet	\N	2026-09-01 02:58:48.310544
1606	7	300	win	Plinko game payout	\N	2026-09-01 02:58:48.310544
1607	7	-1000	loss	Plinko game bet	\N	2026-09-01 02:58:48.310544
1608	7	500	win	Plinko game payout	\N	2026-09-01 02:58:48.310544
1609	7	-1000	loss	Plinko game bet	\N	2026-09-01 02:58:48.310544
1610	7	1000	win	Plinko game payout	\N	2026-09-01 02:58:48.310544
1611	7	-1000	loss	Plinko game bet	\N	2026-09-01 02:58:48.310544
1612	7	750	win	Plinko game payout	\N	2026-09-01 02:58:48.310544
1613	7	-1000	loss	Plinko game bet	\N	2026-09-01 02:58:48.310544
1614	7	500	win	Plinko game payout	\N	2026-09-01 02:58:48.310544
1615	7	-1000	loss	Plinko game bet	\N	2026-09-01 02:58:48.310544
1616	7	750	win	Plinko game payout	\N	2026-09-01 02:58:48.310544
1617	7	-1000	loss	Plinko game bet	\N	2026-09-01 02:58:48.310544
1618	7	2000	win	Plinko game payout	\N	2026-09-01 02:58:48.310544
1619	7	-1000	loss	Plinko game bet	\N	2026-09-01 02:58:48.310544
1620	7	300	win	Plinko game payout	\N	2026-09-01 02:58:48.310544
1621	7	-1000	loss	Plinko game bet	\N	2026-09-01 02:58:51.499071
1622	7	500	win	Plinko game payout	\N	2026-09-01 02:58:51.499071
1623	7	-1000	loss	Plinko game bet	\N	2026-09-01 02:58:51.499071
1624	7	500	win	Plinko game payout	\N	2026-09-01 02:58:51.499071
1625	7	-1000	loss	Plinko game bet	\N	2026-09-01 02:58:51.499071
1626	7	300	win	Plinko game payout	\N	2026-09-01 02:58:51.499071
1627	7	-1000	loss	Plinko game bet	\N	2026-09-01 02:58:51.499071
1628	7	500	win	Plinko game payout	\N	2026-09-01 02:58:51.499071
1629	7	-1000	loss	Plinko game bet	\N	2026-09-01 02:58:51.499071
1630	7	750	win	Plinko game payout	\N	2026-09-01 02:58:51.499071
1631	7	-1000	loss	Plinko game bet	\N	2026-09-01 02:58:51.499071
1632	7	1000	win	Plinko game payout	\N	2026-09-01 02:58:51.499071
1633	7	-1000	loss	Plinko game bet	\N	2026-09-01 02:58:51.499071
1634	7	1000	win	Plinko game payout	\N	2026-09-01 02:58:51.499071
1635	7	-1000	loss	Plinko game bet	\N	2026-09-01 02:58:51.499071
1636	7	1000	win	Plinko game payout	\N	2026-09-01 02:58:51.499071
1637	7	-1000	loss	Plinko game bet	\N	2026-09-01 02:58:51.499071
1638	7	1000	win	Plinko game payout	\N	2026-09-01 02:58:51.499071
1639	7	-1000	loss	Plinko game bet	\N	2026-09-01 02:58:51.499071
1640	7	2000	win	Plinko game payout	\N	2026-09-01 02:58:51.499071
1641	7	-1000	loss	Plinko game bet	\N	2026-09-01 02:58:54.315745
1642	7	750	win	Plinko game payout	\N	2026-09-01 02:58:54.315745
1643	7	-1000	loss	Plinko game bet	\N	2026-09-01 02:58:54.315745
1644	7	500	win	Plinko game payout	\N	2026-09-01 02:58:54.315745
1645	7	-1000	loss	Plinko game bet	\N	2026-09-01 02:58:54.315745
1646	7	500	win	Plinko game payout	\N	2026-09-01 02:58:54.315745
1647	7	-1000	loss	Plinko game bet	\N	2026-09-01 02:58:54.315745
1648	7	1000	win	Plinko game payout	\N	2026-09-01 02:58:54.315745
1649	7	-1000	loss	Plinko game bet	\N	2026-09-01 02:58:54.315745
1650	7	500	win	Plinko game payout	\N	2026-09-01 02:58:54.315745
1651	7	-1000	loss	Plinko game bet	\N	2026-09-01 02:58:54.315745
1652	7	2000	win	Plinko game payout	\N	2026-09-01 02:58:54.315745
1653	7	-1000	loss	Plinko game bet	\N	2026-09-01 02:58:54.315745
1654	7	500	win	Plinko game payout	\N	2026-09-01 02:58:54.315745
1655	7	-1000	loss	Plinko game bet	\N	2026-09-01 02:58:54.315745
1656	7	500	win	Plinko game payout	\N	2026-09-01 02:58:54.315745
1657	7	-1000	loss	Plinko game bet	\N	2026-09-01 02:58:54.315745
1658	7	750	win	Plinko game payout	\N	2026-09-01 02:58:54.315745
1659	7	-1000	loss	Plinko game bet	\N	2026-09-01 02:58:54.315745
1660	7	2000	win	Plinko game payout	\N	2026-09-01 02:58:54.315745
1661	7	-1000	loss	Plinko game bet	\N	2026-09-01 02:58:57.722457
1662	7	500	win	Plinko game payout	\N	2026-09-01 02:58:57.722457
1663	7	-1000	loss	Plinko game bet	\N	2026-09-01 02:58:57.722457
1664	7	1000	win	Plinko game payout	\N	2026-09-01 02:58:57.722457
1665	7	-1000	loss	Plinko game bet	\N	2026-09-01 02:58:57.722457
1666	7	5000	win	Plinko game payout	\N	2026-09-01 02:58:57.722457
1667	7	-1000	loss	Plinko game bet	\N	2026-09-01 02:58:57.722457
1668	7	300	win	Plinko game payout	\N	2026-09-01 02:58:57.722457
1669	7	-1000	loss	Plinko game bet	\N	2026-09-01 02:58:57.722457
1670	7	1000	win	Plinko game payout	\N	2026-09-01 02:58:57.722457
1671	7	-1000	loss	Plinko game bet	\N	2026-09-01 02:58:57.722457
1672	7	500	win	Plinko game payout	\N	2026-09-01 02:58:57.722457
1673	7	-1000	loss	Plinko game bet	\N	2026-09-01 02:58:57.722457
1674	7	500	win	Plinko game payout	\N	2026-09-01 02:58:57.722457
1675	7	-1000	loss	Plinko game bet	\N	2026-09-01 02:58:57.722457
1676	7	300	win	Plinko game payout	\N	2026-09-01 02:58:57.722457
1677	7	-1000	loss	Plinko game bet	\N	2026-09-01 02:58:57.722457
1678	7	1000	win	Plinko game payout	\N	2026-09-01 02:58:57.722457
1679	7	-1000	loss	Plinko game bet	\N	2026-09-01 02:58:57.722457
1680	7	1000	win	Plinko game payout	\N	2026-09-01 02:58:57.722457
1681	7	-1000	loss	Plinko game bet	\N	2026-09-01 02:59:06.226141
1682	7	750	win	Plinko game payout	\N	2026-09-01 02:59:06.226141
1683	7	-1000	loss	Plinko game bet	\N	2026-09-01 02:59:06.226141
1684	7	500	win	Plinko game payout	\N	2026-09-01 02:59:06.226141
1685	7	-1000	loss	Plinko game bet	\N	2026-09-01 02:59:06.226141
1686	7	300	win	Plinko game payout	\N	2026-09-01 02:59:06.226141
1687	7	-1000	loss	Plinko game bet	\N	2026-09-01 02:59:06.226141
1688	7	500	win	Plinko game payout	\N	2026-09-01 02:59:06.226141
1689	7	-1000	loss	Plinko game bet	\N	2026-09-01 02:59:06.226141
1690	7	300	win	Plinko game payout	\N	2026-09-01 02:59:06.226141
1691	7	-1000	loss	Plinko game bet	\N	2026-09-01 02:59:06.226141
1692	7	750	win	Plinko game payout	\N	2026-09-01 02:59:06.226141
1693	7	-1000	loss	Plinko game bet	\N	2026-09-01 02:59:06.226141
1694	7	500	win	Plinko game payout	\N	2026-09-01 02:59:06.226141
1695	7	-1000	loss	Plinko game bet	\N	2026-09-01 02:59:06.226141
1696	7	750	win	Plinko game payout	\N	2026-09-01 02:59:06.226141
1697	7	-1000	loss	Plinko game bet	\N	2026-09-01 02:59:06.226141
1698	7	1000	win	Plinko game payout	\N	2026-09-01 02:59:06.226141
1699	7	-1000	loss	Plinko game bet	\N	2026-09-01 02:59:06.226141
1700	7	2000	win	Plinko game payout	\N	2026-09-01 02:59:06.226141
1701	7	-1000	loss	Plinko game bet	\N	2026-09-01 21:00:46.701036
1702	7	500	win	Plinko game payout	\N	2026-09-01 21:00:46.701036
1703	7	-1000	loss	Plinko game bet	\N	2026-09-01 21:00:46.701036
1704	7	1000	win	Plinko game payout	\N	2026-09-01 21:00:46.701036
1705	7	-1000	loss	Plinko game bet	\N	2026-09-01 21:00:46.701036
1706	7	500	win	Plinko game payout	\N	2026-09-01 21:00:46.701036
1707	7	-1000	loss	Plinko game bet	\N	2026-09-01 21:00:46.701036
1708	7	300	win	Plinko game payout	\N	2026-09-01 21:00:46.701036
1709	7	-1000	loss	Plinko game bet	\N	2026-09-01 21:00:46.701036
1710	7	750	win	Plinko game payout	\N	2026-09-01 21:00:46.701036
1711	7	-1000	loss	Plinko game bet	\N	2026-09-01 21:00:46.701036
1712	7	750	win	Plinko game payout	\N	2026-09-01 21:00:46.701036
1713	7	-1000	loss	Plinko game bet	\N	2026-09-01 21:00:46.701036
1714	7	750	win	Plinko game payout	\N	2026-09-01 21:00:46.701036
1715	7	-1000	loss	Plinko game bet	\N	2026-09-01 21:00:46.701036
1716	7	1000	win	Plinko game payout	\N	2026-09-01 21:00:46.701036
1717	7	-1000	loss	Plinko game bet	\N	2026-09-01 21:00:46.701036
1718	7	2000	win	Plinko game payout	\N	2026-09-01 21:00:46.701036
1719	7	-1000	loss	Plinko game bet	\N	2026-09-01 21:00:46.701036
1720	7	500	win	Plinko game payout	\N	2026-09-01 21:00:46.701036
1721	7	-1000	loss	Plinko game bet	\N	2026-09-01 21:00:46.701036
1722	7	750	win	Plinko game payout	\N	2026-09-01 21:00:46.701036
1723	7	-1000	loss	Plinko game bet	\N	2026-09-01 21:00:46.701036
1724	7	300	win	Plinko game payout	\N	2026-09-01 21:00:46.701036
1725	7	-1000	loss	Plinko game bet	\N	2026-09-01 21:00:46.701036
1726	7	300	win	Plinko game payout	\N	2026-09-01 21:00:46.701036
1727	7	-1000	loss	Plinko game bet	\N	2026-09-01 21:00:46.701036
1728	7	500	win	Plinko game payout	\N	2026-09-01 21:00:46.701036
1729	7	-1000	loss	Plinko game bet	\N	2026-09-01 21:00:46.701036
1730	7	750	win	Plinko game payout	\N	2026-09-01 21:00:46.701036
1731	7	-1000	loss	Plinko game bet	\N	2026-09-01 21:00:46.701036
1732	7	300	win	Plinko game payout	\N	2026-09-01 21:00:46.701036
1733	7	-1000	loss	Plinko game bet	\N	2026-09-01 21:00:46.701036
1734	7	500	win	Plinko game payout	\N	2026-09-01 21:00:46.701036
1735	7	-1000	loss	Plinko game bet	\N	2026-09-01 21:00:46.701036
1736	7	750	win	Plinko game payout	\N	2026-09-01 21:00:46.701036
1737	7	-1000	loss	Plinko game bet	\N	2026-09-01 21:00:46.701036
1738	7	500	win	Plinko game payout	\N	2026-09-01 21:00:46.701036
1739	7	-1000	loss	Plinko game bet	\N	2026-09-01 21:00:46.701036
1740	7	500	win	Plinko game payout	\N	2026-09-01 21:00:46.701036
1741	7	-1000	loss	Plinko game bet	\N	2026-09-01 21:00:55.645306
1742	7	300	win	Plinko game payout	\N	2026-09-01 21:00:55.645306
1743	7	-1000	loss	Plinko game bet	\N	2026-09-01 21:00:55.645306
1744	7	500	win	Plinko game payout	\N	2026-09-01 21:00:55.645306
1745	7	-1000	loss	Plinko game bet	\N	2026-09-01 21:00:55.645306
1746	7	2000	win	Plinko game payout	\N	2026-09-01 21:00:55.645306
1747	7	-1000	loss	Plinko game bet	\N	2026-09-01 21:00:55.645306
1748	7	300	win	Plinko game payout	\N	2026-09-01 21:00:55.645306
1749	7	-1000	loss	Plinko game bet	\N	2026-09-01 21:00:55.645306
1750	7	300	win	Plinko game payout	\N	2026-09-01 21:00:55.645306
1751	7	-1000	loss	Plinko game bet	\N	2026-09-01 21:00:55.645306
1752	7	750	win	Plinko game payout	\N	2026-09-01 21:00:55.645306
1753	7	-1000	loss	Plinko game bet	\N	2026-09-01 21:00:55.645306
1754	7	1000	win	Plinko game payout	\N	2026-09-01 21:00:55.645306
1755	7	-1000	loss	Plinko game bet	\N	2026-09-01 21:00:55.645306
1756	7	750	win	Plinko game payout	\N	2026-09-01 21:00:55.645306
1757	7	-1000	loss	Plinko game bet	\N	2026-09-01 21:00:55.645306
1758	7	750	win	Plinko game payout	\N	2026-09-01 21:00:55.645306
1759	7	-1000	loss	Plinko game bet	\N	2026-09-01 21:00:55.645306
1760	7	300	win	Plinko game payout	\N	2026-09-01 21:00:55.645306
1761	7	-1000	loss	Plinko game bet	\N	2026-09-01 21:00:55.645306
1762	7	750	win	Plinko game payout	\N	2026-09-01 21:00:55.645306
1763	7	-1000	loss	Plinko game bet	\N	2026-09-01 21:00:55.645306
1764	7	750	win	Plinko game payout	\N	2026-09-01 21:00:55.645306
1765	7	-1000	loss	Plinko game bet	\N	2026-09-01 21:00:55.645306
1766	7	1000	win	Plinko game payout	\N	2026-09-01 21:00:55.645306
1767	7	-1000	loss	Plinko game bet	\N	2026-09-01 21:00:55.645306
1768	7	750	win	Plinko game payout	\N	2026-09-01 21:00:55.645306
1769	7	-1000	loss	Plinko game bet	\N	2026-09-01 21:00:55.645306
1770	7	500	win	Plinko game payout	\N	2026-09-01 21:00:55.645306
1771	7	-1000	loss	Plinko game bet	\N	2026-09-01 21:00:55.645306
1772	7	300	win	Plinko game payout	\N	2026-09-01 21:00:55.645306
1773	7	-1000	loss	Plinko game bet	\N	2026-09-01 21:00:55.645306
1774	7	2000	win	Plinko game payout	\N	2026-09-01 21:00:55.645306
1775	7	-1000	loss	Plinko game bet	\N	2026-09-01 21:00:55.645306
1776	7	1000	win	Plinko game payout	\N	2026-09-01 21:00:55.645306
1777	7	-1000	loss	Plinko game bet	\N	2026-09-01 21:00:55.645306
1778	7	500	win	Plinko game payout	\N	2026-09-01 21:00:55.645306
1779	7	-1000	loss	Plinko game bet	\N	2026-09-01 21:00:55.645306
1780	7	2000	win	Plinko game payout	\N	2026-09-01 21:00:55.645306
1781	7	-1000	loss	Plinko game bet	\N	2026-09-01 21:00:59.843548
1782	7	750	win	Plinko game payout	\N	2026-09-01 21:00:59.843548
1783	7	-1000	loss	Plinko game bet	\N	2026-09-01 21:00:59.843548
1784	7	750	win	Plinko game payout	\N	2026-09-01 21:00:59.843548
1785	7	-1000	loss	Plinko game bet	\N	2026-09-01 21:00:59.843548
1786	7	300	win	Plinko game payout	\N	2026-09-01 21:00:59.843548
1787	7	-1000	loss	Plinko game bet	\N	2026-09-01 21:00:59.843548
1788	7	1000	win	Plinko game payout	\N	2026-09-01 21:00:59.843548
1789	7	-1000	loss	Plinko game bet	\N	2026-09-01 21:00:59.843548
1790	7	500	win	Plinko game payout	\N	2026-09-01 21:00:59.843548
1791	7	-1000	loss	Plinko game bet	\N	2026-09-01 21:00:59.843548
1792	7	2000	win	Plinko game payout	\N	2026-09-01 21:00:59.843548
1793	7	-1000	loss	Plinko game bet	\N	2026-09-01 21:00:59.843548
1794	7	2000	win	Plinko game payout	\N	2026-09-01 21:00:59.843548
1795	7	-1000	loss	Plinko game bet	\N	2026-09-01 21:00:59.843548
1796	7	750	win	Plinko game payout	\N	2026-09-01 21:00:59.843548
1797	7	-1000	loss	Plinko game bet	\N	2026-09-01 21:00:59.843548
1798	7	500	win	Plinko game payout	\N	2026-09-01 21:00:59.843548
1799	7	-1000	loss	Plinko game bet	\N	2026-09-01 21:00:59.843548
1800	7	1000	win	Plinko game payout	\N	2026-09-01 21:00:59.843548
1801	7	-1000	loss	Plinko game bet	\N	2026-09-01 21:00:59.843548
1802	7	750	win	Plinko game payout	\N	2026-09-01 21:00:59.843548
1803	7	-1000	loss	Plinko game bet	\N	2026-09-01 21:00:59.843548
1804	7	1000	win	Plinko game payout	\N	2026-09-01 21:00:59.843548
1805	7	-1000	loss	Plinko game bet	\N	2026-09-01 21:00:59.843548
1806	7	750	win	Plinko game payout	\N	2026-09-01 21:00:59.843548
1807	7	-1000	loss	Plinko game bet	\N	2026-09-01 21:00:59.843548
1808	7	500	win	Plinko game payout	\N	2026-09-01 21:00:59.843548
1809	7	-1000	loss	Plinko game bet	\N	2026-09-01 21:00:59.843548
1810	7	750	win	Plinko game payout	\N	2026-09-01 21:00:59.843548
1811	7	-1000	loss	Plinko game bet	\N	2026-09-01 21:00:59.843548
1812	7	1000	win	Plinko game payout	\N	2026-09-01 21:00:59.843548
1813	7	-1000	loss	Plinko game bet	\N	2026-09-01 21:00:59.843548
1814	7	2000	win	Plinko game payout	\N	2026-09-01 21:00:59.843548
1815	7	-1000	loss	Plinko game bet	\N	2026-09-01 21:00:59.843548
1816	7	1000	win	Plinko game payout	\N	2026-09-01 21:00:59.843548
1817	7	-1000	loss	Plinko game bet	\N	2026-09-01 21:00:59.843548
1818	7	1000	win	Plinko game payout	\N	2026-09-01 21:00:59.843548
1819	7	-1000	loss	Plinko game bet	\N	2026-09-01 21:00:59.843548
1820	7	500	win	Plinko game payout	\N	2026-09-01 21:00:59.843548
1821	7	-1000	loss	Plinko game bet	\N	2026-09-01 21:01:03.420074
1822	7	500	win	Plinko game payout	\N	2026-09-01 21:01:03.420074
1823	7	-1000	loss	Plinko game bet	\N	2026-09-01 21:01:03.420074
1824	7	750	win	Plinko game payout	\N	2026-09-01 21:01:03.420074
1825	7	-1000	loss	Plinko game bet	\N	2026-09-01 21:01:03.420074
1826	7	500	win	Plinko game payout	\N	2026-09-01 21:01:03.420074
1827	7	-1000	loss	Plinko game bet	\N	2026-09-01 21:01:03.420074
1828	7	1000	win	Plinko game payout	\N	2026-09-01 21:01:03.420074
1829	7	-1000	loss	Plinko game bet	\N	2026-09-01 21:01:03.420074
1830	7	300	win	Plinko game payout	\N	2026-09-01 21:01:03.420074
1831	7	-1000	loss	Plinko game bet	\N	2026-09-01 21:01:03.420074
1832	7	750	win	Plinko game payout	\N	2026-09-01 21:01:03.420074
1833	7	-1000	loss	Plinko game bet	\N	2026-09-01 21:01:03.420074
1834	7	500	win	Plinko game payout	\N	2026-09-01 21:01:03.420074
1835	7	-1000	loss	Plinko game bet	\N	2026-09-01 21:01:03.420074
1836	7	300	win	Plinko game payout	\N	2026-09-01 21:01:03.420074
1837	7	-1000	loss	Plinko game bet	\N	2026-09-01 21:01:03.420074
1838	7	750	win	Plinko game payout	\N	2026-09-01 21:01:03.420074
1839	7	-1000	loss	Plinko game bet	\N	2026-09-01 21:01:03.420074
1840	7	300	win	Plinko game payout	\N	2026-09-01 21:01:03.420074
1841	7	-1000	loss	Plinko game bet	\N	2026-09-01 21:01:03.420074
1842	7	500	win	Plinko game payout	\N	2026-09-01 21:01:03.420074
1843	7	-1000	loss	Plinko game bet	\N	2026-09-01 21:01:03.420074
1844	7	300	win	Plinko game payout	\N	2026-09-01 21:01:03.420074
1845	7	-1000	loss	Plinko game bet	\N	2026-09-01 21:01:03.420074
1846	7	2000	win	Plinko game payout	\N	2026-09-01 21:01:03.420074
1847	7	-1000	loss	Plinko game bet	\N	2026-09-01 21:01:03.420074
1848	7	5000	win	Plinko game payout	\N	2026-09-01 21:01:03.420074
1849	7	-1000	loss	Plinko game bet	\N	2026-09-01 21:01:03.420074
1850	7	10000	win	Plinko game payout	\N	2026-09-01 21:01:03.420074
1851	7	-1000	loss	Plinko game bet	\N	2026-09-01 21:01:03.420074
1852	7	2000	win	Plinko game payout	\N	2026-09-01 21:01:03.420074
1853	7	-1000	loss	Plinko game bet	\N	2026-09-01 21:01:03.420074
1854	7	750	win	Plinko game payout	\N	2026-09-01 21:01:03.420074
1855	7	-1000	loss	Plinko game bet	\N	2026-09-01 21:01:03.420074
1856	7	300	win	Plinko game payout	\N	2026-09-01 21:01:03.420074
1857	7	-1000	loss	Plinko game bet	\N	2026-09-01 21:01:03.420074
1858	7	300	win	Plinko game payout	\N	2026-09-01 21:01:03.420074
1859	7	-1000	loss	Plinko game bet	\N	2026-09-01 21:01:03.420074
1860	7	750	win	Plinko game payout	\N	2026-09-01 21:01:03.420074
1861	7	-1000	loss	Plinko game bet	\N	2026-09-01 21:01:08.139581
1862	7	750	win	Plinko game payout	\N	2026-09-01 21:01:08.139581
1863	7	-1000	loss	Plinko game bet	\N	2026-09-01 21:01:08.139581
1864	7	500	win	Plinko game payout	\N	2026-09-01 21:01:08.139581
1865	7	-1000	loss	Plinko game bet	\N	2026-09-01 21:01:08.139581
1866	7	300	win	Plinko game payout	\N	2026-09-01 21:01:08.139581
1867	7	-1000	loss	Plinko game bet	\N	2026-09-01 21:01:08.139581
1868	7	500	win	Plinko game payout	\N	2026-09-01 21:01:08.139581
1869	7	-1000	loss	Plinko game bet	\N	2026-09-01 21:01:08.139581
1870	7	500	win	Plinko game payout	\N	2026-09-01 21:01:08.139581
1871	7	-1000	loss	Plinko game bet	\N	2026-09-01 21:01:08.139581
1872	7	300	win	Plinko game payout	\N	2026-09-01 21:01:08.139581
1873	7	-1000	loss	Plinko game bet	\N	2026-09-01 21:01:08.139581
1874	7	1000	win	Plinko game payout	\N	2026-09-01 21:01:08.139581
1875	7	-1000	loss	Plinko game bet	\N	2026-09-01 21:01:08.139581
1876	7	300	win	Plinko game payout	\N	2026-09-01 21:01:08.139581
1877	7	-1000	loss	Plinko game bet	\N	2026-09-01 21:01:08.139581
1878	7	500	win	Plinko game payout	\N	2026-09-01 21:01:08.139581
1879	7	-1000	loss	Plinko game bet	\N	2026-09-01 21:01:08.139581
1880	7	750	win	Plinko game payout	\N	2026-09-01 21:01:08.139581
1881	7	-1000	loss	Plinko game bet	\N	2026-09-01 21:01:08.139581
1882	7	1000	win	Plinko game payout	\N	2026-09-01 21:01:08.139581
1883	7	-1000	loss	Plinko game bet	\N	2026-09-01 21:01:08.139581
1884	7	300	win	Plinko game payout	\N	2026-09-01 21:01:08.139581
1885	7	-1000	loss	Plinko game bet	\N	2026-09-01 21:01:08.139581
1886	7	500	win	Plinko game payout	\N	2026-09-01 21:01:08.139581
1887	7	-1000	loss	Plinko game bet	\N	2026-09-01 21:01:08.139581
1888	7	750	win	Plinko game payout	\N	2026-09-01 21:01:08.139581
1889	7	-1000	loss	Plinko game bet	\N	2026-09-01 21:01:08.139581
1890	7	750	win	Plinko game payout	\N	2026-09-01 21:01:08.139581
1891	7	-1000	loss	Plinko game bet	\N	2026-09-01 21:01:08.139581
1892	7	750	win	Plinko game payout	\N	2026-09-01 21:01:08.139581
1893	7	-1000	loss	Plinko game bet	\N	2026-09-01 21:01:08.139581
1894	7	750	win	Plinko game payout	\N	2026-09-01 21:01:08.139581
1895	7	-1000	loss	Plinko game bet	\N	2026-09-01 21:01:08.139581
1896	7	500	win	Plinko game payout	\N	2026-09-01 21:01:08.139581
1897	7	-1000	loss	Plinko game bet	\N	2026-09-01 21:01:08.139581
1898	7	500	win	Plinko game payout	\N	2026-09-01 21:01:08.139581
1899	7	-1000	loss	Plinko game bet	\N	2026-09-01 21:01:08.139581
1900	7	1000	win	Plinko game payout	\N	2026-09-01 21:01:08.139581
1901	7	-1000	loss	Plinko game bet	\N	2026-09-01 21:01:12.485935
1902	7	2000	win	Plinko game payout	\N	2026-09-01 21:01:12.485935
1903	7	-1000	loss	Plinko game bet	\N	2026-09-01 21:01:12.485935
1904	7	300	win	Plinko game payout	\N	2026-09-01 21:01:12.485935
1905	7	-1000	loss	Plinko game bet	\N	2026-09-01 21:01:12.485935
1906	7	300	win	Plinko game payout	\N	2026-09-01 21:01:12.485935
1907	7	-1000	loss	Plinko game bet	\N	2026-09-01 21:01:12.485935
1908	7	500	win	Plinko game payout	\N	2026-09-01 21:01:12.485935
1909	7	-1000	loss	Plinko game bet	\N	2026-09-01 21:01:12.485935
1910	7	5000	win	Plinko game payout	\N	2026-09-01 21:01:12.485935
1911	7	-1000	loss	Plinko game bet	\N	2026-09-01 21:01:12.485935
1912	7	300	win	Plinko game payout	\N	2026-09-01 21:01:12.485935
1913	7	-1000	loss	Plinko game bet	\N	2026-09-01 21:01:12.485935
1914	7	500	win	Plinko game payout	\N	2026-09-01 21:01:12.485935
1915	7	-1000	loss	Plinko game bet	\N	2026-09-01 21:01:12.485935
1916	7	2000	win	Plinko game payout	\N	2026-09-01 21:01:12.485935
1917	7	-1000	loss	Plinko game bet	\N	2026-09-01 21:01:12.485935
1918	7	500	win	Plinko game payout	\N	2026-09-01 21:01:12.485935
1919	7	-1000	loss	Plinko game bet	\N	2026-09-01 21:01:12.485935
1920	7	300	win	Plinko game payout	\N	2026-09-01 21:01:12.485935
1921	7	-1000	loss	Plinko game bet	\N	2026-09-01 21:01:12.485935
1922	7	500	win	Plinko game payout	\N	2026-09-01 21:01:12.485935
1923	7	-1000	loss	Plinko game bet	\N	2026-09-01 21:01:12.485935
1924	7	500	win	Plinko game payout	\N	2026-09-01 21:01:12.485935
1925	7	-1000	loss	Plinko game bet	\N	2026-09-01 21:01:12.485935
1926	7	2000	win	Plinko game payout	\N	2026-09-01 21:01:12.485935
1927	7	-1000	loss	Plinko game bet	\N	2026-09-01 21:01:12.485935
1928	7	500	win	Plinko game payout	\N	2026-09-01 21:01:12.485935
1929	7	-1000	loss	Plinko game bet	\N	2026-09-01 21:01:12.485935
1930	7	1000	win	Plinko game payout	\N	2026-09-01 21:01:12.485935
1931	7	-1000	loss	Plinko game bet	\N	2026-09-01 21:01:12.485935
1932	7	500	win	Plinko game payout	\N	2026-09-01 21:01:12.485935
1933	7	-1000	loss	Plinko game bet	\N	2026-09-01 21:01:12.485935
1934	7	2000	win	Plinko game payout	\N	2026-09-01 21:01:12.485935
1935	7	-1000	loss	Plinko game bet	\N	2026-09-01 21:01:12.485935
1936	7	1000	win	Plinko game payout	\N	2026-09-01 21:01:12.485935
1937	7	-1000	loss	Plinko game bet	\N	2026-09-01 21:01:12.485935
1938	7	1000	win	Plinko game payout	\N	2026-09-01 21:01:12.485935
1939	7	-1000	loss	Plinko game bet	\N	2026-09-01 21:01:12.485935
1940	7	300	win	Plinko game payout	\N	2026-09-01 21:01:12.485935
1941	7	-1000	loss	Plinko game bet	\N	2026-09-01 21:01:15.729142
1942	7	500	win	Plinko game payout	\N	2026-09-01 21:01:15.729142
1943	7	-1000	loss	Plinko game bet	\N	2026-09-01 21:01:15.729142
1944	7	500	win	Plinko game payout	\N	2026-09-01 21:01:15.729142
1945	7	-1000	loss	Plinko game bet	\N	2026-09-01 21:01:15.729142
1946	7	500	win	Plinko game payout	\N	2026-09-01 21:01:15.729142
1947	7	-1000	loss	Plinko game bet	\N	2026-09-01 21:01:15.729142
1948	7	1000	win	Plinko game payout	\N	2026-09-01 21:01:15.729142
1949	7	-1000	loss	Plinko game bet	\N	2026-09-01 21:01:15.729142
1950	7	500	win	Plinko game payout	\N	2026-09-01 21:01:15.729142
1951	7	-1000	loss	Plinko game bet	\N	2026-09-01 21:01:15.729142
1952	7	300	win	Plinko game payout	\N	2026-09-01 21:01:15.729142
1953	7	-1000	loss	Plinko game bet	\N	2026-09-01 21:01:15.729142
1954	7	750	win	Plinko game payout	\N	2026-09-01 21:01:15.729142
1955	7	-1000	loss	Plinko game bet	\N	2026-09-01 21:01:15.729142
1956	7	1000	win	Plinko game payout	\N	2026-09-01 21:01:15.729142
1957	7	-1000	loss	Plinko game bet	\N	2026-09-01 21:01:15.729142
1958	7	750	win	Plinko game payout	\N	2026-09-01 21:01:15.729142
1959	7	-1000	loss	Plinko game bet	\N	2026-09-01 21:01:15.729142
1960	7	500	win	Plinko game payout	\N	2026-09-01 21:01:15.729142
1961	7	-1000	loss	Plinko game bet	\N	2026-09-01 21:01:15.729142
1962	7	500	win	Plinko game payout	\N	2026-09-01 21:01:15.729142
1963	7	-1000	loss	Plinko game bet	\N	2026-09-01 21:01:15.729142
1964	7	500	win	Plinko game payout	\N	2026-09-01 21:01:15.729142
1965	7	-1000	loss	Plinko game bet	\N	2026-09-01 21:01:15.729142
1966	7	750	win	Plinko game payout	\N	2026-09-01 21:01:15.729142
1967	7	-1000	loss	Plinko game bet	\N	2026-09-01 21:01:15.729142
1968	7	2000	win	Plinko game payout	\N	2026-09-01 21:01:15.729142
1969	7	-1000	loss	Plinko game bet	\N	2026-09-01 21:01:15.729142
1970	7	750	win	Plinko game payout	\N	2026-09-01 21:01:15.729142
1971	7	-1000	loss	Plinko game bet	\N	2026-09-01 21:01:15.729142
1972	7	1000	win	Plinko game payout	\N	2026-09-01 21:01:15.729142
1973	7	-1000	loss	Plinko game bet	\N	2026-09-01 21:01:15.729142
1974	7	1000	win	Plinko game payout	\N	2026-09-01 21:01:15.729142
1975	7	-1000	loss	Plinko game bet	\N	2026-09-01 21:01:15.729142
1976	7	500	win	Plinko game payout	\N	2026-09-01 21:01:15.729142
1977	7	-1000	loss	Plinko game bet	\N	2026-09-01 21:01:15.729142
1978	7	750	win	Plinko game payout	\N	2026-09-01 21:01:15.729142
1979	7	-1000	loss	Plinko game bet	\N	2026-09-01 21:01:15.729142
1980	7	750	win	Plinko game payout	\N	2026-09-01 21:01:15.729142
1981	7	-1000	loss	Plinko game bet	\N	2026-09-01 21:01:18.792917
1982	7	500	win	Plinko game payout	\N	2026-09-01 21:01:18.792917
1983	7	-1000	loss	Plinko game bet	\N	2026-09-01 21:01:18.792917
1984	7	300	win	Plinko game payout	\N	2026-09-01 21:01:18.792917
1985	7	-1000	loss	Plinko game bet	\N	2026-09-01 21:01:18.792917
1986	7	750	win	Plinko game payout	\N	2026-09-01 21:01:18.792917
1987	7	-1000	loss	Plinko game bet	\N	2026-09-01 21:01:18.792917
1988	7	750	win	Plinko game payout	\N	2026-09-01 21:01:18.792917
1989	7	-1000	loss	Plinko game bet	\N	2026-09-01 21:01:18.792917
1990	7	5000	win	Plinko game payout	\N	2026-09-01 21:01:18.792917
1991	7	-1000	loss	Plinko game bet	\N	2026-09-01 21:01:18.792917
1992	7	300	win	Plinko game payout	\N	2026-09-01 21:01:18.792917
1993	7	-1000	loss	Plinko game bet	\N	2026-09-01 21:01:18.792917
1994	7	750	win	Plinko game payout	\N	2026-09-01 21:01:18.792917
1995	7	-1000	loss	Plinko game bet	\N	2026-09-01 21:01:18.792917
1996	7	750	win	Plinko game payout	\N	2026-09-01 21:01:18.792917
1997	7	-1000	loss	Plinko game bet	\N	2026-09-01 21:01:18.792917
1998	7	1000	win	Plinko game payout	\N	2026-09-01 21:01:18.792917
1999	7	-1000	loss	Plinko game bet	\N	2026-09-01 21:01:18.792917
2000	7	1000	win	Plinko game payout	\N	2026-09-01 21:01:18.792917
2001	7	-1000	loss	Plinko game bet	\N	2026-09-01 21:01:18.792917
2002	7	1000	win	Plinko game payout	\N	2026-09-01 21:01:18.792917
2003	7	-1000	loss	Plinko game bet	\N	2026-09-01 21:01:18.792917
2004	7	750	win	Plinko game payout	\N	2026-09-01 21:01:18.792917
2005	7	-1000	loss	Plinko game bet	\N	2026-09-01 21:01:18.792917
2006	7	300	win	Plinko game payout	\N	2026-09-01 21:01:18.792917
2007	7	-1000	loss	Plinko game bet	\N	2026-09-01 21:01:18.792917
2008	7	500	win	Plinko game payout	\N	2026-09-01 21:01:18.792917
2009	7	-1000	loss	Plinko game bet	\N	2026-09-01 21:01:18.792917
2010	7	300	win	Plinko game payout	\N	2026-09-01 21:01:18.792917
2011	7	-1000	loss	Plinko game bet	\N	2026-09-01 21:01:18.792917
2012	7	1000	win	Plinko game payout	\N	2026-09-01 21:01:18.792917
2013	7	-1000	loss	Plinko game bet	\N	2026-09-01 21:01:18.792917
2014	7	500	win	Plinko game payout	\N	2026-09-01 21:01:18.792917
2015	7	-1000	loss	Plinko game bet	\N	2026-09-01 21:01:18.792917
2016	7	300	win	Plinko game payout	\N	2026-09-01 21:01:18.792917
2017	7	-1000	loss	Plinko game bet	\N	2026-09-01 21:01:18.792917
2018	7	500	win	Plinko game payout	\N	2026-09-01 21:01:18.792917
2019	7	-1000	loss	Plinko game bet	\N	2026-09-01 21:01:18.792917
2020	7	750	win	Plinko game payout	\N	2026-09-01 21:01:18.792917
2021	7	-1000	loss	Plinko game bet	\N	2026-09-01 21:01:21.683724
2022	7	500	win	Plinko game payout	\N	2026-09-01 21:01:21.683724
2023	7	-1000	loss	Plinko game bet	\N	2026-09-01 21:01:21.683724
2024	7	1000	win	Plinko game payout	\N	2026-09-01 21:01:21.683724
2025	7	-1000	loss	Plinko game bet	\N	2026-09-01 21:01:21.683724
2026	7	500	win	Plinko game payout	\N	2026-09-01 21:01:21.683724
2027	7	-1000	loss	Plinko game bet	\N	2026-09-01 21:01:21.683724
2028	7	5000	win	Plinko game payout	\N	2026-09-01 21:01:21.683724
2029	7	-1000	loss	Plinko game bet	\N	2026-09-01 21:01:21.683724
2030	7	1000	win	Plinko game payout	\N	2026-09-01 21:01:21.683724
2031	7	-1000	loss	Plinko game bet	\N	2026-09-01 21:01:21.683724
2032	7	750	win	Plinko game payout	\N	2026-09-01 21:01:21.683724
2033	7	-1000	loss	Plinko game bet	\N	2026-09-01 21:01:21.683724
2034	7	300	win	Plinko game payout	\N	2026-09-01 21:01:21.683724
2035	7	-1000	loss	Plinko game bet	\N	2026-09-01 21:01:21.683724
2036	7	1000	win	Plinko game payout	\N	2026-09-01 21:01:21.683724
2037	7	-1000	loss	Plinko game bet	\N	2026-09-01 21:01:21.683724
2038	7	1000	win	Plinko game payout	\N	2026-09-01 21:01:21.683724
2039	7	-1000	loss	Plinko game bet	\N	2026-09-01 21:01:21.683724
2040	7	750	win	Plinko game payout	\N	2026-09-01 21:01:21.683724
2041	7	-1000	loss	Plinko game bet	\N	2026-09-01 21:01:21.683724
2042	7	750	win	Plinko game payout	\N	2026-09-01 21:01:21.683724
2043	7	-1000	loss	Plinko game bet	\N	2026-09-01 21:01:21.683724
2044	7	750	win	Plinko game payout	\N	2026-09-01 21:01:21.683724
2045	7	-1000	loss	Plinko game bet	\N	2026-09-01 21:01:21.683724
2046	7	750	win	Plinko game payout	\N	2026-09-01 21:01:21.683724
2047	7	-1000	loss	Plinko game bet	\N	2026-09-01 21:01:21.683724
2048	7	1000	win	Plinko game payout	\N	2026-09-01 21:01:21.683724
2049	7	-1000	loss	Plinko game bet	\N	2026-09-01 21:01:21.683724
2050	7	750	win	Plinko game payout	\N	2026-09-01 21:01:21.683724
2051	7	-1000	loss	Plinko game bet	\N	2026-09-01 21:01:21.683724
2052	7	500	win	Plinko game payout	\N	2026-09-01 21:01:21.683724
2053	7	-1000	loss	Plinko game bet	\N	2026-09-01 21:01:21.683724
2054	7	500	win	Plinko game payout	\N	2026-09-01 21:01:21.683724
2055	7	-1000	loss	Plinko game bet	\N	2026-09-01 21:01:21.683724
2056	7	750	win	Plinko game payout	\N	2026-09-01 21:01:21.683724
2057	7	-1000	loss	Plinko game bet	\N	2026-09-01 21:01:21.683724
2058	7	750	win	Plinko game payout	\N	2026-09-01 21:01:21.683724
2059	7	-1000	loss	Plinko game bet	\N	2026-09-01 21:01:21.683724
2060	7	1000	win	Plinko game payout	\N	2026-09-01 21:01:21.683724
2061	7	-1000	loss	Plinko game bet	\N	2026-09-01 21:01:24.577742
2062	7	300	win	Plinko game payout	\N	2026-09-01 21:01:24.577742
2063	7	-1000	loss	Plinko game bet	\N	2026-09-01 21:01:24.577742
2064	7	2000	win	Plinko game payout	\N	2026-09-01 21:01:24.577742
2065	7	-1000	loss	Plinko game bet	\N	2026-09-01 21:01:24.577742
2066	7	750	win	Plinko game payout	\N	2026-09-01 21:01:24.577742
2067	7	-1000	loss	Plinko game bet	\N	2026-09-01 21:01:24.577742
2068	7	750	win	Plinko game payout	\N	2026-09-01 21:01:24.577742
2069	7	-1000	loss	Plinko game bet	\N	2026-09-01 21:01:24.577742
2070	7	750	win	Plinko game payout	\N	2026-09-01 21:01:24.577742
2071	7	-1000	loss	Plinko game bet	\N	2026-09-01 21:01:24.577742
2072	7	1000	win	Plinko game payout	\N	2026-09-01 21:01:24.577742
2073	7	-1000	loss	Plinko game bet	\N	2026-09-01 21:01:24.577742
2074	7	750	win	Plinko game payout	\N	2026-09-01 21:01:24.577742
2075	7	-1000	loss	Plinko game bet	\N	2026-09-01 21:01:24.577742
2076	7	750	win	Plinko game payout	\N	2026-09-01 21:01:24.577742
2077	7	-1000	loss	Plinko game bet	\N	2026-09-01 21:01:24.577742
2078	7	750	win	Plinko game payout	\N	2026-09-01 21:01:24.577742
2079	7	-1000	loss	Plinko game bet	\N	2026-09-01 21:01:24.577742
2080	7	750	win	Plinko game payout	\N	2026-09-01 21:01:24.577742
2081	7	-1000	loss	Plinko game bet	\N	2026-09-01 21:01:24.577742
2082	7	300	win	Plinko game payout	\N	2026-09-01 21:01:24.577742
2083	7	-1000	loss	Plinko game bet	\N	2026-09-01 21:01:24.577742
2084	7	300	win	Plinko game payout	\N	2026-09-01 21:01:24.577742
2085	7	-1000	loss	Plinko game bet	\N	2026-09-01 21:01:24.577742
2086	7	1000	win	Plinko game payout	\N	2026-09-01 21:01:24.577742
2087	7	-1000	loss	Plinko game bet	\N	2026-09-01 21:01:24.577742
2088	7	1000	win	Plinko game payout	\N	2026-09-01 21:01:24.577742
2089	7	-1000	loss	Plinko game bet	\N	2026-09-01 21:01:24.577742
2090	7	750	win	Plinko game payout	\N	2026-09-01 21:01:24.577742
2091	7	-1000	loss	Plinko game bet	\N	2026-09-01 21:01:24.577742
2092	7	1000	win	Plinko game payout	\N	2026-09-01 21:01:24.577742
2093	7	-1000	loss	Plinko game bet	\N	2026-09-01 21:01:24.577742
2094	7	750	win	Plinko game payout	\N	2026-09-01 21:01:24.577742
2095	7	-1000	loss	Plinko game bet	\N	2026-09-01 21:01:24.577742
2096	7	750	win	Plinko game payout	\N	2026-09-01 21:01:24.577742
2097	7	-1000	loss	Plinko game bet	\N	2026-09-01 21:01:24.577742
2098	7	500	win	Plinko game payout	\N	2026-09-01 21:01:24.577742
2099	7	-1000	loss	Plinko game bet	\N	2026-09-01 21:01:24.577742
2100	7	500	win	Plinko game payout	\N	2026-09-01 21:01:24.577742
2101	7	-1000	loss	Plinko game bet	\N	2026-09-01 21:01:27.497414
2102	7	750	win	Plinko game payout	\N	2026-09-01 21:01:27.497414
2103	7	-1000	loss	Plinko game bet	\N	2026-09-01 21:01:27.497414
2104	7	1000	win	Plinko game payout	\N	2026-09-01 21:01:27.497414
2105	7	-1000	loss	Plinko game bet	\N	2026-09-01 21:01:27.497414
2106	7	5000	win	Plinko game payout	\N	2026-09-01 21:01:27.497414
2107	7	-1000	loss	Plinko game bet	\N	2026-09-01 21:01:27.497414
2108	7	500	win	Plinko game payout	\N	2026-09-01 21:01:27.497414
2109	7	-1000	loss	Plinko game bet	\N	2026-09-01 21:01:27.497414
2110	7	500	win	Plinko game payout	\N	2026-09-01 21:01:27.497414
2111	7	-1000	loss	Plinko game bet	\N	2026-09-01 21:01:27.497414
2112	7	1000	win	Plinko game payout	\N	2026-09-01 21:01:27.497414
2113	7	-1000	loss	Plinko game bet	\N	2026-09-01 21:01:27.497414
2114	7	750	win	Plinko game payout	\N	2026-09-01 21:01:27.497414
2115	7	-1000	loss	Plinko game bet	\N	2026-09-01 21:01:27.497414
2116	7	300	win	Plinko game payout	\N	2026-09-01 21:01:27.497414
2117	7	-1000	loss	Plinko game bet	\N	2026-09-01 21:01:27.497414
2118	7	750	win	Plinko game payout	\N	2026-09-01 21:01:27.497414
2119	7	-1000	loss	Plinko game bet	\N	2026-09-01 21:01:27.497414
2120	7	2000	win	Plinko game payout	\N	2026-09-01 21:01:27.497414
2121	7	-1000	loss	Plinko game bet	\N	2026-09-01 21:01:27.497414
2122	7	500	win	Plinko game payout	\N	2026-09-01 21:01:27.497414
2123	7	-1000	loss	Plinko game bet	\N	2026-09-01 21:01:27.497414
2124	7	750	win	Plinko game payout	\N	2026-09-01 21:01:27.497414
2125	7	-1000	loss	Plinko game bet	\N	2026-09-01 21:01:27.497414
2126	7	1000	win	Plinko game payout	\N	2026-09-01 21:01:27.497414
2127	7	-1000	loss	Plinko game bet	\N	2026-09-01 21:01:27.497414
2128	7	500	win	Plinko game payout	\N	2026-09-01 21:01:27.497414
2129	7	-1000	loss	Plinko game bet	\N	2026-09-01 21:01:27.497414
2130	7	750	win	Plinko game payout	\N	2026-09-01 21:01:27.497414
2131	7	-1000	loss	Plinko game bet	\N	2026-09-01 21:01:27.497414
2132	7	500	win	Plinko game payout	\N	2026-09-01 21:01:27.497414
2133	7	-1000	loss	Plinko game bet	\N	2026-09-01 21:01:27.497414
2134	7	500	win	Plinko game payout	\N	2026-09-01 21:01:27.497414
2135	7	-1000	loss	Plinko game bet	\N	2026-09-01 21:01:27.497414
2136	7	500	win	Plinko game payout	\N	2026-09-01 21:01:27.497414
2137	7	-1000	loss	Plinko game bet	\N	2026-09-01 21:01:27.497414
2138	7	750	win	Plinko game payout	\N	2026-09-01 21:01:27.497414
2139	7	-1000	loss	Plinko game bet	\N	2026-09-01 21:01:27.497414
2140	7	750	win	Plinko game payout	\N	2026-09-01 21:01:27.497414
2141	7	-1000	loss	Plinko game bet	\N	2026-09-01 21:02:23.112795
2142	7	500	win	Plinko game payout	\N	2026-09-01 21:02:23.112795
2143	7	-1000	loss	Plinko game bet	\N	2026-09-01 21:02:23.112795
2144	7	750	win	Plinko game payout	\N	2026-09-01 21:02:23.112795
2145	7	-1000	loss	Plinko game bet	\N	2026-09-01 21:02:23.112795
2146	7	1000	win	Plinko game payout	\N	2026-09-01 21:02:23.112795
2147	7	-1000	loss	Plinko game bet	\N	2026-09-01 21:02:23.112795
2148	7	1000	win	Plinko game payout	\N	2026-09-01 21:02:23.112795
2149	7	-1000	loss	Plinko game bet	\N	2026-09-01 21:02:23.112795
2150	7	500	win	Plinko game payout	\N	2026-09-01 21:02:23.112795
2151	7	-1000	loss	Plinko game bet	\N	2026-09-01 21:02:23.112795
2152	7	500	win	Plinko game payout	\N	2026-09-01 21:02:23.112795
2153	7	-1000	loss	Plinko game bet	\N	2026-09-01 21:02:23.112795
2154	7	750	win	Plinko game payout	\N	2026-09-01 21:02:23.112795
2155	7	-1000	loss	Plinko game bet	\N	2026-09-01 21:02:23.112795
2156	7	750	win	Plinko game payout	\N	2026-09-01 21:02:23.112795
2157	7	-1000	loss	Plinko game bet	\N	2026-09-01 21:02:23.112795
2158	7	750	win	Plinko game payout	\N	2026-09-01 21:02:23.112795
2159	7	-1000	loss	Plinko game bet	\N	2026-09-01 21:02:23.112795
2160	7	750	win	Plinko game payout	\N	2026-09-01 21:02:23.112795
2161	7	-1000	loss	Plinko game bet	\N	2026-09-01 21:02:23.112795
2162	7	750	win	Plinko game payout	\N	2026-09-01 21:02:23.112795
2163	7	-1000	loss	Plinko game bet	\N	2026-09-01 21:02:23.112795
2164	7	500	win	Plinko game payout	\N	2026-09-01 21:02:23.112795
2165	7	-1000	loss	Plinko game bet	\N	2026-09-01 21:02:23.112795
2166	7	1000	win	Plinko game payout	\N	2026-09-01 21:02:23.112795
2167	7	-1000	loss	Plinko game bet	\N	2026-09-01 21:02:23.112795
2168	7	500	win	Plinko game payout	\N	2026-09-01 21:02:23.112795
2169	7	-1000	loss	Plinko game bet	\N	2026-09-01 21:02:23.112795
2170	7	500	win	Plinko game payout	\N	2026-09-01 21:02:23.112795
2171	7	-1000	loss	Plinko game bet	\N	2026-09-01 21:02:23.112795
2172	7	750	win	Plinko game payout	\N	2026-09-01 21:02:23.112795
2173	7	-1000	loss	Plinko game bet	\N	2026-09-01 21:02:23.112795
2174	7	500	win	Plinko game payout	\N	2026-09-01 21:02:23.112795
2175	7	-1000	loss	Plinko game bet	\N	2026-09-01 21:02:23.112795
2176	7	500	win	Plinko game payout	\N	2026-09-01 21:02:23.112795
2177	7	-1000	loss	Plinko game bet	\N	2026-09-01 21:02:23.112795
2178	7	1000	win	Plinko game payout	\N	2026-09-01 21:02:23.112795
2179	7	-1000	loss	Plinko game bet	\N	2026-09-01 21:02:23.112795
2180	7	500	win	Plinko game payout	\N	2026-09-01 21:02:23.112795
2181	7	-1000	loss	Plinko game bet	\N	2026-09-01 21:08:27.952127
2182	7	500	win	Plinko game payout	\N	2026-09-01 21:08:27.952127
2183	7	-1000	loss	Plinko game bet	\N	2026-09-01 21:08:27.952127
2184	7	5000	win	Plinko game payout	\N	2026-09-01 21:08:27.952127
2185	7	-1000	loss	Plinko game bet	\N	2026-09-01 21:08:27.952127
2186	7	500	win	Plinko game payout	\N	2026-09-01 21:08:27.952127
2187	7	-1000	loss	Plinko game bet	\N	2026-09-01 21:08:27.952127
2188	7	500	win	Plinko game payout	\N	2026-09-01 21:08:27.952127
2189	7	-1000	loss	Plinko game bet	\N	2026-09-01 21:08:27.952127
2190	7	1000	win	Plinko game payout	\N	2026-09-01 21:08:27.952127
2191	7	-1000	loss	Plinko game bet	\N	2026-09-01 21:08:27.952127
2192	7	300	win	Plinko game payout	\N	2026-09-01 21:08:27.952127
2193	7	-1000	loss	Plinko game bet	\N	2026-09-01 21:08:27.952127
2194	7	500	win	Plinko game payout	\N	2026-09-01 21:08:27.952127
2195	7	-1000	loss	Plinko game bet	\N	2026-09-01 21:08:27.952127
2196	7	500	win	Plinko game payout	\N	2026-09-01 21:08:27.952127
2197	7	-1000	loss	Plinko game bet	\N	2026-09-01 21:08:27.952127
2198	7	300	win	Plinko game payout	\N	2026-09-01 21:08:27.952127
2199	7	-1000	loss	Plinko game bet	\N	2026-09-01 21:08:27.952127
2200	7	500	win	Plinko game payout	\N	2026-09-01 21:08:27.952127
2201	7	-1000	loss	Plinko game bet	\N	2026-09-01 21:08:27.952127
2202	7	500	win	Plinko game payout	\N	2026-09-01 21:08:27.952127
2203	7	-1000	loss	Plinko game bet	\N	2026-09-01 21:08:27.952127
2204	7	300	win	Plinko game payout	\N	2026-09-01 21:08:27.952127
2205	7	-1000	loss	Plinko game bet	\N	2026-09-01 21:08:27.952127
2206	7	750	win	Plinko game payout	\N	2026-09-01 21:08:27.952127
2207	7	-1000	loss	Plinko game bet	\N	2026-09-01 21:08:27.952127
2208	7	750	win	Plinko game payout	\N	2026-09-01 21:08:27.952127
2209	7	-1000	loss	Plinko game bet	\N	2026-09-01 21:08:27.952127
2210	7	500	win	Plinko game payout	\N	2026-09-01 21:08:27.952127
2211	7	-1000	loss	Plinko game bet	\N	2026-09-01 21:08:27.952127
2212	7	500	win	Plinko game payout	\N	2026-09-01 21:08:27.952127
2213	7	-1000	loss	Plinko game bet	\N	2026-09-01 21:08:27.952127
2214	7	500	win	Plinko game payout	\N	2026-09-01 21:08:27.952127
2215	7	-1000	loss	Plinko game bet	\N	2026-09-01 21:08:27.952127
2216	7	1000	win	Plinko game payout	\N	2026-09-01 21:08:27.952127
2217	7	-1000	loss	Plinko game bet	\N	2026-09-01 21:08:27.952127
2218	7	300	win	Plinko game payout	\N	2026-09-01 21:08:27.952127
2219	7	-1000	loss	Plinko game bet	\N	2026-09-01 21:08:27.952127
2220	7	750	win	Plinko game payout	\N	2026-09-01 21:08:27.952127
2221	7	-1000	loss	Plinko game bet	\N	2026-09-01 21:08:39.141639
2222	7	500	win	Plinko game payout	\N	2026-09-01 21:08:39.141639
2223	7	-1000	loss	Plinko game bet	\N	2026-09-01 21:08:39.141639
2224	7	750	win	Plinko game payout	\N	2026-09-01 21:08:39.141639
2225	7	-1000	loss	Plinko game bet	\N	2026-09-01 21:08:39.141639
2226	7	500	win	Plinko game payout	\N	2026-09-01 21:08:39.141639
2227	7	-1000	loss	Plinko game bet	\N	2026-09-01 21:08:39.141639
2228	7	500	win	Plinko game payout	\N	2026-09-01 21:08:39.141639
2229	7	-1000	loss	Plinko game bet	\N	2026-09-01 21:08:39.141639
2230	7	750	win	Plinko game payout	\N	2026-09-01 21:08:39.141639
2231	7	-1000	loss	Plinko game bet	\N	2026-09-01 21:08:39.141639
2232	7	300	win	Plinko game payout	\N	2026-09-01 21:08:39.141639
2233	7	-1000	loss	Plinko game bet	\N	2026-09-01 21:08:39.141639
2234	7	750	win	Plinko game payout	\N	2026-09-01 21:08:39.141639
2235	7	-1000	loss	Plinko game bet	\N	2026-09-01 21:08:39.141639
2236	7	750	win	Plinko game payout	\N	2026-09-01 21:08:39.141639
2237	7	-1000	loss	Plinko game bet	\N	2026-09-01 21:08:39.141639
2238	7	1000	win	Plinko game payout	\N	2026-09-01 21:08:39.141639
2239	7	-1000	loss	Plinko game bet	\N	2026-09-01 21:08:39.141639
2240	7	500	win	Plinko game payout	\N	2026-09-01 21:08:39.141639
2241	7	-1000	loss	Plinko game bet	\N	2026-09-01 21:08:39.141639
2242	7	750	win	Plinko game payout	\N	2026-09-01 21:08:39.141639
2243	7	-1000	loss	Plinko game bet	\N	2026-09-01 21:08:39.141639
2244	7	500	win	Plinko game payout	\N	2026-09-01 21:08:39.141639
2245	7	-1000	loss	Plinko game bet	\N	2026-09-01 21:08:39.141639
2246	7	500	win	Plinko game payout	\N	2026-09-01 21:08:39.141639
2247	7	-1000	loss	Plinko game bet	\N	2026-09-01 21:08:39.141639
2248	7	750	win	Plinko game payout	\N	2026-09-01 21:08:39.141639
2249	7	-1000	loss	Plinko game bet	\N	2026-09-01 21:08:39.141639
2250	7	750	win	Plinko game payout	\N	2026-09-01 21:08:39.141639
2251	7	-1000	loss	Plinko game bet	\N	2026-09-01 21:08:39.141639
2252	7	500	win	Plinko game payout	\N	2026-09-01 21:08:39.141639
2253	7	-1000	loss	Plinko game bet	\N	2026-09-01 21:08:39.141639
2254	7	750	win	Plinko game payout	\N	2026-09-01 21:08:39.141639
2255	7	-1000	loss	Plinko game bet	\N	2026-09-01 21:08:39.141639
2256	7	500	win	Plinko game payout	\N	2026-09-01 21:08:39.141639
2257	7	-1000	loss	Plinko game bet	\N	2026-09-01 21:08:39.141639
2258	7	500	win	Plinko game payout	\N	2026-09-01 21:08:39.141639
2259	7	-1000	loss	Plinko game bet	\N	2026-09-01 21:08:39.141639
2260	7	300	win	Plinko game payout	\N	2026-09-01 21:08:39.141639
2261	7	-1000	loss	Plinko game bet	\N	2026-09-01 21:08:42.656517
2262	7	2000	win	Plinko game payout	\N	2026-09-01 21:08:42.656517
2263	7	-1000	loss	Plinko game bet	\N	2026-09-01 21:08:42.656517
2264	7	500	win	Plinko game payout	\N	2026-09-01 21:08:42.656517
2265	7	-1000	loss	Plinko game bet	\N	2026-09-01 21:08:42.656517
2266	7	750	win	Plinko game payout	\N	2026-09-01 21:08:42.656517
2267	7	-1000	loss	Plinko game bet	\N	2026-09-01 21:08:42.656517
2268	7	1000	win	Plinko game payout	\N	2026-09-01 21:08:42.656517
2269	7	-1000	loss	Plinko game bet	\N	2026-09-01 21:08:42.656517
2270	7	1000	win	Plinko game payout	\N	2026-09-01 21:08:42.656517
2271	7	-1000	loss	Plinko game bet	\N	2026-09-01 21:08:42.656517
2272	7	500	win	Plinko game payout	\N	2026-09-01 21:08:42.656517
2273	7	-1000	loss	Plinko game bet	\N	2026-09-01 21:08:42.656517
2274	7	500	win	Plinko game payout	\N	2026-09-01 21:08:42.656517
2275	7	-1000	loss	Plinko game bet	\N	2026-09-01 21:08:42.656517
2276	7	500	win	Plinko game payout	\N	2026-09-01 21:08:42.656517
2277	7	-1000	loss	Plinko game bet	\N	2026-09-01 21:08:42.656517
2278	7	750	win	Plinko game payout	\N	2026-09-01 21:08:42.656517
2279	7	-1000	loss	Plinko game bet	\N	2026-09-01 21:08:42.656517
2280	7	1000	win	Plinko game payout	\N	2026-09-01 21:08:42.656517
2281	7	-1000	loss	Plinko game bet	\N	2026-09-01 21:08:42.656517
2282	7	500	win	Plinko game payout	\N	2026-09-01 21:08:42.656517
2283	7	-1000	loss	Plinko game bet	\N	2026-09-01 21:08:42.656517
2284	7	1000	win	Plinko game payout	\N	2026-09-01 21:08:42.656517
2285	7	-1000	loss	Plinko game bet	\N	2026-09-01 21:08:42.656517
2286	7	2000	win	Plinko game payout	\N	2026-09-01 21:08:42.656517
2287	7	-1000	loss	Plinko game bet	\N	2026-09-01 21:08:42.656517
2288	7	300	win	Plinko game payout	\N	2026-09-01 21:08:42.656517
2289	7	-1000	loss	Plinko game bet	\N	2026-09-01 21:08:42.656517
2290	7	2000	win	Plinko game payout	\N	2026-09-01 21:08:42.656517
2291	7	-1000	loss	Plinko game bet	\N	2026-09-01 21:08:42.656517
2292	7	500	win	Plinko game payout	\N	2026-09-01 21:08:42.656517
2293	7	-1000	loss	Plinko game bet	\N	2026-09-01 21:08:42.656517
2294	7	750	win	Plinko game payout	\N	2026-09-01 21:08:42.656517
2295	7	-1000	loss	Plinko game bet	\N	2026-09-01 21:08:42.656517
2296	7	300	win	Plinko game payout	\N	2026-09-01 21:08:42.656517
2297	7	-1000	loss	Plinko game bet	\N	2026-09-01 21:08:42.656517
2298	7	300	win	Plinko game payout	\N	2026-09-01 21:08:42.656517
2299	7	-1000	loss	Plinko game bet	\N	2026-09-01 21:08:42.656517
2300	7	500	win	Plinko game payout	\N	2026-09-01 21:08:42.656517
2301	7	-1000	loss	Plinko game bet	\N	2026-09-01 21:08:46.170493
2302	7	500	win	Plinko game payout	\N	2026-09-01 21:08:46.170493
2303	7	-1000	loss	Plinko game bet	\N	2026-09-01 21:08:46.170493
2304	7	500	win	Plinko game payout	\N	2026-09-01 21:08:46.170493
2305	7	-1000	loss	Plinko game bet	\N	2026-09-01 21:08:46.170493
2306	7	2000	win	Plinko game payout	\N	2026-09-01 21:08:46.170493
2307	7	-1000	loss	Plinko game bet	\N	2026-09-01 21:08:46.170493
2308	7	750	win	Plinko game payout	\N	2026-09-01 21:08:46.170493
2309	7	-1000	loss	Plinko game bet	\N	2026-09-01 21:08:46.170493
2310	7	750	win	Plinko game payout	\N	2026-09-01 21:08:46.170493
2311	7	-1000	loss	Plinko game bet	\N	2026-09-01 21:08:46.170493
2312	7	750	win	Plinko game payout	\N	2026-09-01 21:08:46.170493
2313	7	-1000	loss	Plinko game bet	\N	2026-09-01 21:08:46.170493
2314	7	500	win	Plinko game payout	\N	2026-09-01 21:08:46.170493
2315	7	-1000	loss	Plinko game bet	\N	2026-09-01 21:08:46.170493
2316	7	2000	win	Plinko game payout	\N	2026-09-01 21:08:46.170493
2317	7	-1000	loss	Plinko game bet	\N	2026-09-01 21:08:46.170493
2318	7	1000	win	Plinko game payout	\N	2026-09-01 21:08:46.170493
2319	7	-1000	loss	Plinko game bet	\N	2026-09-01 21:08:46.170493
2320	7	500	win	Plinko game payout	\N	2026-09-01 21:08:46.170493
2321	7	-1000	loss	Plinko game bet	\N	2026-09-01 21:08:46.170493
2322	7	500	win	Plinko game payout	\N	2026-09-01 21:08:46.170493
2323	7	-1000	loss	Plinko game bet	\N	2026-09-01 21:08:46.170493
2324	7	1000	win	Plinko game payout	\N	2026-09-01 21:08:46.170493
2325	7	-1000	loss	Plinko game bet	\N	2026-09-01 21:08:46.170493
2326	7	500	win	Plinko game payout	\N	2026-09-01 21:08:46.170493
2327	7	-1000	loss	Plinko game bet	\N	2026-09-01 21:08:46.170493
2328	7	750	win	Plinko game payout	\N	2026-09-01 21:08:46.170493
2329	7	-1000	loss	Plinko game bet	\N	2026-09-01 21:08:46.170493
2330	7	1000	win	Plinko game payout	\N	2026-09-01 21:08:46.170493
2331	7	-1000	loss	Plinko game bet	\N	2026-09-01 21:08:46.170493
2332	7	500	win	Plinko game payout	\N	2026-09-01 21:08:46.170493
2333	7	-1000	loss	Plinko game bet	\N	2026-09-01 21:08:46.170493
2334	7	2000	win	Plinko game payout	\N	2026-09-01 21:08:46.170493
2335	7	-1000	loss	Plinko game bet	\N	2026-09-01 21:08:46.170493
2336	7	500	win	Plinko game payout	\N	2026-09-01 21:08:46.170493
2337	7	-1000	loss	Plinko game bet	\N	2026-09-01 21:08:46.170493
2338	7	500	win	Plinko game payout	\N	2026-09-01 21:08:46.170493
2339	7	-1000	loss	Plinko game bet	\N	2026-09-01 21:08:46.170493
2340	7	750	win	Plinko game payout	\N	2026-09-01 21:08:46.170493
2341	7	-1000	loss	Plinko game bet	\N	2026-09-01 21:08:57.223317
2342	7	500	win	Plinko game payout	\N	2026-09-01 21:08:57.223317
2343	7	-1000	loss	Plinko game bet	\N	2026-09-01 21:08:57.223317
2344	7	500	win	Plinko game payout	\N	2026-09-01 21:08:57.223317
2345	7	-1000	loss	Plinko game bet	\N	2026-09-01 21:08:57.223317
2346	7	750	win	Plinko game payout	\N	2026-09-01 21:08:57.223317
2347	7	-1000	loss	Plinko game bet	\N	2026-09-01 21:08:57.223317
2348	7	1000	win	Plinko game payout	\N	2026-09-01 21:08:57.223317
2349	7	-1000	loss	Plinko game bet	\N	2026-09-01 21:08:57.223317
2350	7	750	win	Plinko game payout	\N	2026-09-01 21:08:57.223317
2351	7	-1000	loss	Plinko game bet	\N	2026-09-01 21:08:57.223317
2352	7	2000	win	Plinko game payout	\N	2026-09-01 21:08:57.223317
2353	7	-1000	loss	Plinko game bet	\N	2026-09-01 21:08:57.223317
2354	7	500	win	Plinko game payout	\N	2026-09-01 21:08:57.223317
2355	7	-1000	loss	Plinko game bet	\N	2026-09-01 21:08:57.223317
2356	7	750	win	Plinko game payout	\N	2026-09-01 21:08:57.223317
2357	7	-1000	loss	Plinko game bet	\N	2026-09-01 21:08:57.223317
2358	7	300	win	Plinko game payout	\N	2026-09-01 21:08:57.223317
2359	7	-1000	loss	Plinko game bet	\N	2026-09-01 21:08:57.223317
2360	7	750	win	Plinko game payout	\N	2026-09-01 21:08:57.223317
2361	7	-1000	loss	Plinko game bet	\N	2026-09-01 21:08:57.223317
2362	7	750	win	Plinko game payout	\N	2026-09-01 21:08:57.223317
2363	7	-1000	loss	Plinko game bet	\N	2026-09-01 21:08:57.223317
2364	7	500	win	Plinko game payout	\N	2026-09-01 21:08:57.223317
2365	7	-1000	loss	Plinko game bet	\N	2026-09-01 21:08:57.223317
2366	7	750	win	Plinko game payout	\N	2026-09-01 21:08:57.223317
2367	7	-1000	loss	Plinko game bet	\N	2026-09-01 21:08:57.223317
2368	7	1000	win	Plinko game payout	\N	2026-09-01 21:08:57.223317
2369	7	-1000	loss	Plinko game bet	\N	2026-09-01 21:08:57.223317
2370	7	1000	win	Plinko game payout	\N	2026-09-01 21:08:57.223317
2371	7	-1000	loss	Plinko game bet	\N	2026-09-01 21:08:57.223317
2372	7	2000	win	Plinko game payout	\N	2026-09-01 21:08:57.223317
2373	7	-1000	loss	Plinko game bet	\N	2026-09-01 21:08:57.223317
2374	7	1000	win	Plinko game payout	\N	2026-09-01 21:08:57.223317
2375	7	-1000	loss	Plinko game bet	\N	2026-09-01 21:08:57.223317
2376	7	750	win	Plinko game payout	\N	2026-09-01 21:08:57.223317
2377	7	-1000	loss	Plinko game bet	\N	2026-09-01 21:08:57.223317
2378	7	300	win	Plinko game payout	\N	2026-09-01 21:08:57.223317
2379	7	-1000	loss	Plinko game bet	\N	2026-09-01 21:08:57.223317
2380	7	750	win	Plinko game payout	\N	2026-09-01 21:08:57.223317
2381	7	-1000	loss	Plinko game bet	\N	2026-09-01 21:09:00.490903
2382	7	500	win	Plinko game payout	\N	2026-09-01 21:09:00.490903
2383	7	-1000	loss	Plinko game bet	\N	2026-09-01 21:09:00.490903
2384	7	500	win	Plinko game payout	\N	2026-09-01 21:09:00.490903
2385	7	-1000	loss	Plinko game bet	\N	2026-09-01 21:09:00.490903
2386	7	500	win	Plinko game payout	\N	2026-09-01 21:09:00.490903
2387	7	-1000	loss	Plinko game bet	\N	2026-09-01 21:09:00.490903
2388	7	500	win	Plinko game payout	\N	2026-09-01 21:09:00.490903
2389	7	-1000	loss	Plinko game bet	\N	2026-09-01 21:09:00.490903
2390	7	1000	win	Plinko game payout	\N	2026-09-01 21:09:00.490903
2391	7	-1000	loss	Plinko game bet	\N	2026-09-01 21:09:00.490903
2392	7	2000	win	Plinko game payout	\N	2026-09-01 21:09:00.490903
2393	7	-1000	loss	Plinko game bet	\N	2026-09-01 21:09:00.490903
2394	7	300	win	Plinko game payout	\N	2026-09-01 21:09:00.490903
2395	7	-1000	loss	Plinko game bet	\N	2026-09-01 21:09:00.490903
2396	7	2000	win	Plinko game payout	\N	2026-09-01 21:09:00.490903
2397	7	-1000	loss	Plinko game bet	\N	2026-09-01 21:09:00.490903
2398	7	500	win	Plinko game payout	\N	2026-09-01 21:09:00.490903
2399	7	-1000	loss	Plinko game bet	\N	2026-09-01 21:09:00.490903
2400	7	300	win	Plinko game payout	\N	2026-09-01 21:09:00.490903
2401	7	-1000	loss	Plinko game bet	\N	2026-09-01 21:09:00.490903
2402	7	1000	win	Plinko game payout	\N	2026-09-01 21:09:00.490903
2403	7	-1000	loss	Plinko game bet	\N	2026-09-01 21:09:00.490903
2404	7	500	win	Plinko game payout	\N	2026-09-01 21:09:00.490903
2405	7	-1000	loss	Plinko game bet	\N	2026-09-01 21:09:00.490903
2406	7	2000	win	Plinko game payout	\N	2026-09-01 21:09:00.490903
2407	7	-1000	loss	Plinko game bet	\N	2026-09-01 21:09:00.490903
2408	7	500	win	Plinko game payout	\N	2026-09-01 21:09:00.490903
2409	7	-1000	loss	Plinko game bet	\N	2026-09-01 21:09:00.490903
2410	7	1000	win	Plinko game payout	\N	2026-09-01 21:09:00.490903
2411	7	-1000	loss	Plinko game bet	\N	2026-09-01 21:09:00.490903
2412	7	1000	win	Plinko game payout	\N	2026-09-01 21:09:00.490903
2413	7	-1000	loss	Plinko game bet	\N	2026-09-01 21:09:00.490903
2414	7	300	win	Plinko game payout	\N	2026-09-01 21:09:00.490903
2415	7	-1000	loss	Plinko game bet	\N	2026-09-01 21:09:00.490903
2416	7	300	win	Plinko game payout	\N	2026-09-01 21:09:00.490903
2417	7	-1000	loss	Plinko game bet	\N	2026-09-01 21:09:00.490903
2418	7	750	win	Plinko game payout	\N	2026-09-01 21:09:00.490903
2419	7	-1000	loss	Plinko game bet	\N	2026-09-01 21:09:00.490903
2420	7	300	win	Plinko game payout	\N	2026-09-01 21:09:00.490903
2421	7	-1000	loss	Plinko game bet	\N	2026-09-01 21:09:05.146735
2422	7	750	win	Plinko game payout	\N	2026-09-01 21:09:05.146735
2423	7	-1000	loss	Plinko game bet	\N	2026-09-01 21:09:05.146735
2424	7	2000	win	Plinko game payout	\N	2026-09-01 21:09:05.146735
2425	7	-1000	loss	Plinko game bet	\N	2026-09-01 21:09:05.146735
2426	7	1000	win	Plinko game payout	\N	2026-09-01 21:09:05.146735
2427	7	-1000	loss	Plinko game bet	\N	2026-09-01 21:09:05.146735
2428	7	500	win	Plinko game payout	\N	2026-09-01 21:09:05.146735
2429	7	-1000	loss	Plinko game bet	\N	2026-09-01 21:09:05.146735
2430	7	300	win	Plinko game payout	\N	2026-09-01 21:09:05.146735
2431	7	-1000	loss	Plinko game bet	\N	2026-09-01 21:09:05.146735
2432	7	500	win	Plinko game payout	\N	2026-09-01 21:09:05.146735
2433	7	-1000	loss	Plinko game bet	\N	2026-09-01 21:09:05.146735
2434	7	750	win	Plinko game payout	\N	2026-09-01 21:09:05.146735
2435	7	-1000	loss	Plinko game bet	\N	2026-09-01 21:09:05.146735
2436	7	500	win	Plinko game payout	\N	2026-09-01 21:09:05.146735
2437	7	-1000	loss	Plinko game bet	\N	2026-09-01 21:09:05.146735
2438	7	750	win	Plinko game payout	\N	2026-09-01 21:09:05.146735
2439	7	-1000	loss	Plinko game bet	\N	2026-09-01 21:09:05.146735
2440	7	300	win	Plinko game payout	\N	2026-09-01 21:09:05.146735
2441	7	-1000	loss	Plinko game bet	\N	2026-09-01 21:09:05.146735
2442	7	2000	win	Plinko game payout	\N	2026-09-01 21:09:05.146735
2443	7	-1000	loss	Plinko game bet	\N	2026-09-01 21:09:05.146735
2444	7	2000	win	Plinko game payout	\N	2026-09-01 21:09:05.146735
2445	7	-1000	loss	Plinko game bet	\N	2026-09-01 21:09:05.146735
2446	7	1000	win	Plinko game payout	\N	2026-09-01 21:09:05.146735
2447	7	-1000	loss	Plinko game bet	\N	2026-09-01 21:09:05.146735
2448	7	300	win	Plinko game payout	\N	2026-09-01 21:09:05.146735
2449	7	-1000	loss	Plinko game bet	\N	2026-09-01 21:09:05.146735
2450	7	750	win	Plinko game payout	\N	2026-09-01 21:09:05.146735
2451	7	-1000	loss	Plinko game bet	\N	2026-09-01 21:09:05.146735
2452	7	500	win	Plinko game payout	\N	2026-09-01 21:09:05.146735
2453	7	-1000	loss	Plinko game bet	\N	2026-09-01 21:09:05.146735
2454	7	1000	win	Plinko game payout	\N	2026-09-01 21:09:05.146735
2455	7	-1000	loss	Plinko game bet	\N	2026-09-01 21:09:05.146735
2456	7	300	win	Plinko game payout	\N	2026-09-01 21:09:05.146735
2457	7	-1000	loss	Plinko game bet	\N	2026-09-01 21:09:05.146735
2458	7	2000	win	Plinko game payout	\N	2026-09-01 21:09:05.146735
2459	7	-1000	loss	Plinko game bet	\N	2026-09-01 21:09:05.146735
2460	7	750	win	Plinko game payout	\N	2026-09-01 21:09:05.146735
2461	7	-10000	loss	Plinko game bet	\N	2026-09-01 21:09:16.179084
2462	7	7500	win	Plinko game payout	\N	2026-09-01 21:09:16.179084
2463	7	-10000	loss	Plinko game bet	\N	2026-09-01 21:09:16.179084
2464	7	20000	win	Plinko game payout	\N	2026-09-01 21:09:16.179084
2465	7	-10000	loss	Plinko game bet	\N	2026-09-01 21:09:16.179084
2466	7	20000	win	Plinko game payout	\N	2026-09-01 21:09:16.179084
2467	7	-10000	loss	Plinko game bet	\N	2026-09-01 21:09:16.179084
2468	7	10000	win	Plinko game payout	\N	2026-09-01 21:09:16.179084
2469	7	-10000	loss	Plinko game bet	\N	2026-09-01 21:09:16.179084
2470	7	7500	win	Plinko game payout	\N	2026-09-01 21:09:16.179084
2471	7	-10000	loss	Plinko game bet	\N	2026-09-01 21:09:16.179084
2472	7	7500	win	Plinko game payout	\N	2026-09-01 21:09:16.179084
2473	7	-10000	loss	Plinko game bet	\N	2026-09-01 21:09:16.179084
2474	7	5000	win	Plinko game payout	\N	2026-09-01 21:09:16.179084
2475	7	-10000	loss	Plinko game bet	\N	2026-09-01 21:09:16.179084
2476	7	5000	win	Plinko game payout	\N	2026-09-01 21:09:16.179084
2477	7	-10000	loss	Plinko game bet	\N	2026-09-01 21:09:16.179084
2478	7	20000	win	Plinko game payout	\N	2026-09-01 21:09:16.179084
2479	7	-10000	loss	Plinko game bet	\N	2026-09-01 21:09:16.179084
2480	7	20000	win	Plinko game payout	\N	2026-09-01 21:09:16.179084
2481	7	-10000	loss	Plinko game bet	\N	2026-09-01 21:09:16.179084
2482	7	3000	win	Plinko game payout	\N	2026-09-01 21:09:16.179084
2483	7	-10000	loss	Plinko game bet	\N	2026-09-01 21:09:16.179084
2484	7	5000	win	Plinko game payout	\N	2026-09-01 21:09:16.179084
2485	7	-10000	loss	Plinko game bet	\N	2026-09-01 21:09:16.179084
2486	7	5000	win	Plinko game payout	\N	2026-09-01 21:09:16.179084
2487	7	-10000	loss	Plinko game bet	\N	2026-09-01 21:09:16.179084
2488	7	10000	win	Plinko game payout	\N	2026-09-01 21:09:16.179084
2489	7	-10000	loss	Plinko game bet	\N	2026-09-01 21:09:16.179084
2490	7	50000	win	Plinko game payout	\N	2026-09-01 21:09:16.179084
2491	7	-10000	loss	Plinko game bet	\N	2026-09-01 21:09:16.179084
2492	7	7500	win	Plinko game payout	\N	2026-09-01 21:09:16.179084
2493	7	-10000	loss	Plinko game bet	\N	2026-09-01 21:09:16.179084
2494	7	20000	win	Plinko game payout	\N	2026-09-01 21:09:16.179084
2495	7	-10000	loss	Plinko game bet	\N	2026-09-01 21:09:16.179084
2496	7	5000	win	Plinko game payout	\N	2026-09-01 21:09:16.179084
2497	7	-10000	loss	Plinko game bet	\N	2026-09-01 21:09:16.179084
2498	7	7500	win	Plinko game payout	\N	2026-09-01 21:09:16.179084
2499	7	-10000	loss	Plinko game bet	\N	2026-09-01 21:09:16.179084
2500	7	5000	win	Plinko game payout	\N	2026-09-01 21:09:16.179084
2501	7	-10000	loss	Plinko game bet	\N	2026-09-01 21:09:24.389455
2502	7	10000	win	Plinko game payout	\N	2026-09-01 21:09:24.389455
2503	7	-10000	loss	Plinko game bet	\N	2026-09-01 21:09:24.389455
2504	7	7500	win	Plinko game payout	\N	2026-09-01 21:09:24.389455
2505	7	-10000	loss	Plinko game bet	\N	2026-09-01 21:09:24.389455
2506	7	3000	win	Plinko game payout	\N	2026-09-01 21:09:24.389455
2507	7	-10000	loss	Plinko game bet	\N	2026-09-01 21:09:24.389455
2508	7	5000	win	Plinko game payout	\N	2026-09-01 21:09:24.389455
2509	7	-10000	loss	Plinko game bet	\N	2026-09-01 21:09:24.389455
2510	7	3000	win	Plinko game payout	\N	2026-09-01 21:09:24.389455
2511	7	-10000	loss	Plinko game bet	\N	2026-09-01 21:09:24.389455
2512	7	10000	win	Plinko game payout	\N	2026-09-01 21:09:24.389455
2513	7	-10000	loss	Plinko game bet	\N	2026-09-01 21:09:24.389455
2514	7	10000	win	Plinko game payout	\N	2026-09-01 21:09:24.389455
2515	7	-10000	loss	Plinko game bet	\N	2026-09-01 21:09:24.389455
2516	7	7500	win	Plinko game payout	\N	2026-09-01 21:09:24.389455
2517	7	-10000	loss	Plinko game bet	\N	2026-09-01 21:09:24.389455
2518	7	100000	win	Plinko game payout	\N	2026-09-01 21:09:24.389455
2519	7	-10000	loss	Plinko game bet	\N	2026-09-01 21:09:24.389455
2520	7	7500	win	Plinko game payout	\N	2026-09-01 21:09:24.389455
2521	7	-10000	loss	Plinko game bet	\N	2026-09-01 21:09:24.389455
2522	7	7500	win	Plinko game payout	\N	2026-09-01 21:09:24.389455
2523	7	-10000	loss	Plinko game bet	\N	2026-09-01 21:09:24.389455
2524	7	3000	win	Plinko game payout	\N	2026-09-01 21:09:24.389455
2525	7	-10000	loss	Plinko game bet	\N	2026-09-01 21:09:24.389455
2526	7	5000	win	Plinko game payout	\N	2026-09-01 21:09:24.389455
2527	7	-10000	loss	Plinko game bet	\N	2026-09-01 21:09:24.389455
2528	7	7500	win	Plinko game payout	\N	2026-09-01 21:09:24.389455
2529	7	-10000	loss	Plinko game bet	\N	2026-09-01 21:09:24.389455
2530	7	3000	win	Plinko game payout	\N	2026-09-01 21:09:24.389455
2531	7	-10000	loss	Plinko game bet	\N	2026-09-01 21:09:24.389455
2532	7	7500	win	Plinko game payout	\N	2026-09-01 21:09:24.389455
2533	7	-10000	loss	Plinko game bet	\N	2026-09-01 21:09:24.389455
2534	7	7500	win	Plinko game payout	\N	2026-09-01 21:09:24.389455
2535	7	-10000	loss	Plinko game bet	\N	2026-09-01 21:09:24.389455
2536	7	7500	win	Plinko game payout	\N	2026-09-01 21:09:24.389455
2537	7	-10000	loss	Plinko game bet	\N	2026-09-01 21:09:24.389455
2538	7	20000	win	Plinko game payout	\N	2026-09-01 21:09:24.389455
2539	7	-10000	loss	Plinko game bet	\N	2026-09-01 21:09:24.389455
2540	7	50000	win	Plinko game payout	\N	2026-09-01 21:09:24.389455
2541	7	-10000	loss	Plinko game bet	\N	2026-09-01 21:09:28.930581
2542	7	5000	win	Plinko game payout	\N	2026-09-01 21:09:28.930581
2543	7	-10000	loss	Plinko game bet	\N	2026-09-01 21:09:28.930581
2544	7	7500	win	Plinko game payout	\N	2026-09-01 21:09:28.930581
2545	7	-10000	loss	Plinko game bet	\N	2026-09-01 21:09:28.930581
2546	7	7500	win	Plinko game payout	\N	2026-09-01 21:09:28.930581
2547	7	-10000	loss	Plinko game bet	\N	2026-09-01 21:09:28.930581
2548	7	7500	win	Plinko game payout	\N	2026-09-01 21:09:28.930581
2549	7	-10000	loss	Plinko game bet	\N	2026-09-01 21:09:28.930581
2550	7	3000	win	Plinko game payout	\N	2026-09-01 21:09:28.930581
2551	7	-10000	loss	Plinko game bet	\N	2026-09-01 21:09:28.930581
2552	7	5000	win	Plinko game payout	\N	2026-09-01 21:09:28.930581
2553	7	-10000	loss	Plinko game bet	\N	2026-09-01 21:09:28.930581
2554	7	3000	win	Plinko game payout	\N	2026-09-01 21:09:28.930581
2555	7	-10000	loss	Plinko game bet	\N	2026-09-01 21:09:28.930581
2556	7	5000	win	Plinko game payout	\N	2026-09-01 21:09:28.930581
2557	7	-10000	loss	Plinko game bet	\N	2026-09-01 21:09:28.930581
2558	7	20000	win	Plinko game payout	\N	2026-09-01 21:09:28.930581
2559	7	-10000	loss	Plinko game bet	\N	2026-09-01 21:09:28.930581
2560	7	3000	win	Plinko game payout	\N	2026-09-01 21:09:28.930581
2561	7	-10000	loss	Plinko game bet	\N	2026-09-01 21:09:28.930581
2562	7	7500	win	Plinko game payout	\N	2026-09-01 21:09:28.930581
2563	7	-10000	loss	Plinko game bet	\N	2026-09-01 21:09:28.930581
2564	7	5000	win	Plinko game payout	\N	2026-09-01 21:09:28.930581
2565	7	-10000	loss	Plinko game bet	\N	2026-09-01 21:09:28.930581
2566	7	3000	win	Plinko game payout	\N	2026-09-01 21:09:28.930581
2567	7	-10000	loss	Plinko game bet	\N	2026-09-01 21:09:28.930581
2568	7	3000	win	Plinko game payout	\N	2026-09-01 21:09:28.930581
2569	7	-10000	loss	Plinko game bet	\N	2026-09-01 21:09:28.930581
2570	7	7500	win	Plinko game payout	\N	2026-09-01 21:09:28.930581
2571	7	-10000	loss	Plinko game bet	\N	2026-09-01 21:09:28.930581
2572	7	5000	win	Plinko game payout	\N	2026-09-01 21:09:28.930581
2573	7	-10000	loss	Plinko game bet	\N	2026-09-01 21:09:28.930581
2574	7	10000	win	Plinko game payout	\N	2026-09-01 21:09:28.930581
2575	7	-10000	loss	Plinko game bet	\N	2026-09-01 21:09:28.930581
2576	7	7500	win	Plinko game payout	\N	2026-09-01 21:09:28.930581
2577	7	-10000	loss	Plinko game bet	\N	2026-09-01 21:09:28.930581
2578	7	5000	win	Plinko game payout	\N	2026-09-01 21:09:28.930581
2579	7	-10000	loss	Plinko game bet	\N	2026-09-01 21:09:28.930581
2580	7	3000	win	Plinko game payout	\N	2026-09-01 21:09:28.930581
2581	7	-10000	loss	Plinko game bet	\N	2026-09-01 21:09:31.35154
2582	7	50000	win	Plinko game payout	\N	2026-09-01 21:09:31.35154
2583	7	-10000	loss	Plinko game bet	\N	2026-09-01 21:09:31.35154
2584	7	5000	win	Plinko game payout	\N	2026-09-01 21:09:31.35154
2585	7	-10000	loss	Plinko game bet	\N	2026-09-01 21:09:31.35154
2586	7	3000	win	Plinko game payout	\N	2026-09-01 21:09:31.35154
2587	7	-10000	loss	Plinko game bet	\N	2026-09-01 21:09:31.35154
2588	7	7500	win	Plinko game payout	\N	2026-09-01 21:09:31.35154
2589	7	-10000	loss	Plinko game bet	\N	2026-09-01 21:09:31.35154
2590	7	7500	win	Plinko game payout	\N	2026-09-01 21:09:31.35154
2591	7	-10000	loss	Plinko game bet	\N	2026-09-01 21:09:31.35154
2592	7	5000	win	Plinko game payout	\N	2026-09-01 21:09:31.35154
2593	7	-10000	loss	Plinko game bet	\N	2026-09-01 21:09:31.35154
2594	7	7500	win	Plinko game payout	\N	2026-09-01 21:09:31.35154
2595	7	-10000	loss	Plinko game bet	\N	2026-09-01 21:09:31.35154
2596	7	7500	win	Plinko game payout	\N	2026-09-01 21:09:31.35154
2597	7	-10000	loss	Plinko game bet	\N	2026-09-01 21:09:31.35154
2598	7	5000	win	Plinko game payout	\N	2026-09-01 21:09:31.35154
2599	7	-10000	loss	Plinko game bet	\N	2026-09-01 21:09:31.35154
2600	7	5000	win	Plinko game payout	\N	2026-09-01 21:09:31.35154
2601	7	-10000	loss	Plinko game bet	\N	2026-09-01 21:09:31.35154
2602	7	7500	win	Plinko game payout	\N	2026-09-01 21:09:31.35154
2603	7	-10000	loss	Plinko game bet	\N	2026-09-01 21:09:31.35154
2604	7	5000	win	Plinko game payout	\N	2026-09-01 21:09:31.35154
2605	7	-10000	loss	Plinko game bet	\N	2026-09-01 21:09:31.35154
2606	7	10000	win	Plinko game payout	\N	2026-09-01 21:09:31.35154
2607	7	-10000	loss	Plinko game bet	\N	2026-09-01 21:09:31.35154
2608	7	5000	win	Plinko game payout	\N	2026-09-01 21:09:31.35154
2609	7	-10000	loss	Plinko game bet	\N	2026-09-01 21:09:31.35154
2610	7	20000	win	Plinko game payout	\N	2026-09-01 21:09:31.35154
2611	7	-10000	loss	Plinko game bet	\N	2026-09-01 21:09:31.35154
2612	7	5000	win	Plinko game payout	\N	2026-09-01 21:09:31.35154
2613	7	-10000	loss	Plinko game bet	\N	2026-09-01 21:09:31.35154
2614	7	10000	win	Plinko game payout	\N	2026-09-01 21:09:31.35154
2615	7	-10000	loss	Plinko game bet	\N	2026-09-01 21:09:31.35154
2616	7	5000	win	Plinko game payout	\N	2026-09-01 21:09:31.35154
2617	7	-10000	loss	Plinko game bet	\N	2026-09-01 21:09:31.35154
2618	7	20000	win	Plinko game payout	\N	2026-09-01 21:09:31.35154
2619	7	-10000	loss	Plinko game bet	\N	2026-09-01 21:09:31.35154
2620	7	7500	win	Plinko game payout	\N	2026-09-01 21:09:31.35154
2621	7	-10000	loss	Plinko game bet	\N	2026-09-01 21:09:33.772314
2622	7	5000	win	Plinko game payout	\N	2026-09-01 21:09:33.772314
2623	7	-10000	loss	Plinko game bet	\N	2026-09-01 21:09:33.772314
2624	7	5000	win	Plinko game payout	\N	2026-09-01 21:09:33.772314
2625	7	-10000	loss	Plinko game bet	\N	2026-09-01 21:09:33.772314
2626	7	10000	win	Plinko game payout	\N	2026-09-01 21:09:33.772314
2627	7	-10000	loss	Plinko game bet	\N	2026-09-01 21:09:33.772314
2628	7	5000	win	Plinko game payout	\N	2026-09-01 21:09:33.772314
2629	7	-10000	loss	Plinko game bet	\N	2026-09-01 21:09:33.772314
2630	7	5000	win	Plinko game payout	\N	2026-09-01 21:09:33.772314
2631	7	-10000	loss	Plinko game bet	\N	2026-09-01 21:09:33.772314
2632	7	3000	win	Plinko game payout	\N	2026-09-01 21:09:33.772314
2633	7	-10000	loss	Plinko game bet	\N	2026-09-01 21:09:33.772314
2634	7	5000	win	Plinko game payout	\N	2026-09-01 21:09:33.772314
2635	7	-10000	loss	Plinko game bet	\N	2026-09-01 21:09:33.772314
2636	7	10000	win	Plinko game payout	\N	2026-09-01 21:09:33.772314
2637	7	-10000	loss	Plinko game bet	\N	2026-09-01 21:09:33.772314
2638	7	7500	win	Plinko game payout	\N	2026-09-01 21:09:33.772314
2639	7	-10000	loss	Plinko game bet	\N	2026-09-01 21:09:33.772314
2640	7	3000	win	Plinko game payout	\N	2026-09-01 21:09:33.772314
2641	7	-10000	loss	Plinko game bet	\N	2026-09-01 21:09:33.772314
2642	7	20000	win	Plinko game payout	\N	2026-09-01 21:09:33.772314
2643	7	-10000	loss	Plinko game bet	\N	2026-09-01 21:09:33.772314
2644	7	5000	win	Plinko game payout	\N	2026-09-01 21:09:33.772314
2645	7	-10000	loss	Plinko game bet	\N	2026-09-01 21:09:33.772314
2646	7	5000	win	Plinko game payout	\N	2026-09-01 21:09:33.772314
2647	7	-10000	loss	Plinko game bet	\N	2026-09-01 21:09:33.772314
2648	7	7500	win	Plinko game payout	\N	2026-09-01 21:09:33.772314
2649	7	-10000	loss	Plinko game bet	\N	2026-09-01 21:09:33.772314
2650	7	3000	win	Plinko game payout	\N	2026-09-01 21:09:33.772314
2651	7	-10000	loss	Plinko game bet	\N	2026-09-01 21:09:33.772314
2652	7	5000	win	Plinko game payout	\N	2026-09-01 21:09:33.772314
2653	7	-10000	loss	Plinko game bet	\N	2026-09-01 21:09:33.772314
2654	7	7500	win	Plinko game payout	\N	2026-09-01 21:09:33.772314
2655	7	-10000	loss	Plinko game bet	\N	2026-09-01 21:09:33.772314
2656	7	7500	win	Plinko game payout	\N	2026-09-01 21:09:33.772314
2657	7	-10000	loss	Plinko game bet	\N	2026-09-01 21:09:33.772314
2658	7	3000	win	Plinko game payout	\N	2026-09-01 21:09:33.772314
2659	7	-10000	loss	Plinko game bet	\N	2026-09-01 21:09:33.772314
2660	7	10000	win	Plinko game payout	\N	2026-09-01 21:09:33.772314
2661	7	-10000	loss	Plinko game bet	\N	2026-09-01 21:09:36.210821
2662	7	5000	win	Plinko game payout	\N	2026-09-01 21:09:36.210821
2663	7	-10000	loss	Plinko game bet	\N	2026-09-01 21:09:36.210821
2664	7	7500	win	Plinko game payout	\N	2026-09-01 21:09:36.210821
2665	7	-10000	loss	Plinko game bet	\N	2026-09-01 21:09:36.210821
2666	7	7500	win	Plinko game payout	\N	2026-09-01 21:09:36.210821
2667	7	-10000	loss	Plinko game bet	\N	2026-09-01 21:09:36.210821
2668	7	3000	win	Plinko game payout	\N	2026-09-01 21:09:36.210821
2669	7	-10000	loss	Plinko game bet	\N	2026-09-01 21:09:36.210821
2670	7	5000	win	Plinko game payout	\N	2026-09-01 21:09:36.210821
2671	7	-10000	loss	Plinko game bet	\N	2026-09-01 21:09:36.210821
2672	7	5000	win	Plinko game payout	\N	2026-09-01 21:09:36.210821
2673	7	-10000	loss	Plinko game bet	\N	2026-09-01 21:09:36.210821
2674	7	7500	win	Plinko game payout	\N	2026-09-01 21:09:36.210821
2675	7	-10000	loss	Plinko game bet	\N	2026-09-01 21:09:36.210821
2676	7	7500	win	Plinko game payout	\N	2026-09-01 21:09:36.210821
2677	7	-10000	loss	Plinko game bet	\N	2026-09-01 21:09:36.210821
2678	7	7500	win	Plinko game payout	\N	2026-09-01 21:09:36.210821
2679	7	-10000	loss	Plinko game bet	\N	2026-09-01 21:09:36.210821
2680	7	50000	win	Plinko game payout	\N	2026-09-01 21:09:36.210821
2681	7	-10000	loss	Plinko game bet	\N	2026-09-01 21:09:36.210821
2682	7	7500	win	Plinko game payout	\N	2026-09-01 21:09:36.210821
2683	7	-10000	loss	Plinko game bet	\N	2026-09-01 21:09:36.210821
2684	7	5000	win	Plinko game payout	\N	2026-09-01 21:09:36.210821
2685	7	-10000	loss	Plinko game bet	\N	2026-09-01 21:09:36.210821
2686	7	7500	win	Plinko game payout	\N	2026-09-01 21:09:36.210821
2687	7	-10000	loss	Plinko game bet	\N	2026-09-01 21:09:36.210821
2688	7	5000	win	Plinko game payout	\N	2026-09-01 21:09:36.210821
2689	7	-10000	loss	Plinko game bet	\N	2026-09-01 21:09:36.210821
2690	7	5000	win	Plinko game payout	\N	2026-09-01 21:09:36.210821
2691	7	-10000	loss	Plinko game bet	\N	2026-09-01 21:09:36.210821
2692	7	5000	win	Plinko game payout	\N	2026-09-01 21:09:36.210821
2693	7	-10000	loss	Plinko game bet	\N	2026-09-01 21:09:36.210821
2694	7	7500	win	Plinko game payout	\N	2026-09-01 21:09:36.210821
2695	7	-10000	loss	Plinko game bet	\N	2026-09-01 21:09:36.210821
2696	7	10000	win	Plinko game payout	\N	2026-09-01 21:09:36.210821
2697	7	-10000	loss	Plinko game bet	\N	2026-09-01 21:09:36.210821
2698	7	20000	win	Plinko game payout	\N	2026-09-01 21:09:36.210821
2699	7	-10000	loss	Plinko game bet	\N	2026-09-01 21:09:36.210821
2700	7	7500	win	Plinko game payout	\N	2026-09-01 21:09:36.210821
2701	7	-10000	loss	Plinko game bet	\N	2026-09-01 21:10:58.072369
2702	7	5000	win	Plinko game payout	\N	2026-09-01 21:10:58.072369
2703	7	-10000	loss	Plinko game bet	\N	2026-09-01 21:10:58.072369
2704	7	5000	win	Plinko game payout	\N	2026-09-01 21:10:58.072369
2705	7	-10000	loss	Plinko game bet	\N	2026-09-01 21:10:58.072369
2706	7	7500	win	Plinko game payout	\N	2026-09-01 21:10:58.072369
2707	7	-10000	loss	Plinko game bet	\N	2026-09-01 21:10:58.072369
2708	7	7500	win	Plinko game payout	\N	2026-09-01 21:10:58.072369
2709	7	-10000	loss	Plinko game bet	\N	2026-09-01 21:10:58.072369
2710	7	5000	win	Plinko game payout	\N	2026-09-01 21:10:58.072369
2711	7	-10000	loss	Plinko game bet	\N	2026-09-01 21:10:58.072369
2712	7	7500	win	Plinko game payout	\N	2026-09-01 21:10:58.072369
2713	7	-10000	loss	Plinko game bet	\N	2026-09-01 21:10:58.072369
2714	7	7500	win	Plinko game payout	\N	2026-09-01 21:10:58.072369
2715	7	-10000	loss	Plinko game bet	\N	2026-09-01 21:10:58.072369
2716	7	5000	win	Plinko game payout	\N	2026-09-01 21:10:58.072369
2717	7	-10000	loss	Plinko game bet	\N	2026-09-01 21:10:58.072369
2718	7	3000	win	Plinko game payout	\N	2026-09-01 21:10:58.072369
2719	7	-10000	loss	Plinko game bet	\N	2026-09-01 21:10:58.072369
2720	7	5000	win	Plinko game payout	\N	2026-09-01 21:10:58.072369
2721	7	-10000	loss	Plinko game bet	\N	2026-09-01 21:10:58.072369
2722	7	3000	win	Plinko game payout	\N	2026-09-01 21:10:58.072369
2723	7	-10000	loss	Plinko game bet	\N	2026-09-01 21:10:58.072369
2724	7	10000	win	Plinko game payout	\N	2026-09-01 21:10:58.072369
2725	7	-10000	loss	Plinko game bet	\N	2026-09-01 21:10:58.072369
2726	7	3000	win	Plinko game payout	\N	2026-09-01 21:10:58.072369
2727	7	-10000	loss	Plinko game bet	\N	2026-09-01 21:10:58.072369
2728	7	7500	win	Plinko game payout	\N	2026-09-01 21:10:58.072369
2729	7	-10000	loss	Plinko game bet	\N	2026-09-01 21:10:58.072369
2730	7	7500	win	Plinko game payout	\N	2026-09-01 21:10:58.072369
2731	7	-10000	loss	Plinko game bet	\N	2026-09-01 21:10:58.072369
2732	7	5000	win	Plinko game payout	\N	2026-09-01 21:10:58.072369
2733	7	-10000	loss	Plinko game bet	\N	2026-09-01 21:10:58.072369
2734	7	20000	win	Plinko game payout	\N	2026-09-01 21:10:58.072369
2735	7	-10000	loss	Plinko game bet	\N	2026-09-01 21:10:58.072369
2736	7	7500	win	Plinko game payout	\N	2026-09-01 21:10:58.072369
2737	7	-10000	loss	Plinko game bet	\N	2026-09-01 21:10:58.072369
2738	7	5000	win	Plinko game payout	\N	2026-09-01 21:10:58.072369
2739	7	-10000	loss	Plinko game bet	\N	2026-09-01 21:10:58.072369
2740	7	3000	win	Plinko game payout	\N	2026-09-01 21:10:58.072369
2741	7	-9000	loss	Plinko game bet	\N	2026-09-01 21:11:10.767239
2742	7	4500	win	Plinko game payout	\N	2026-09-01 21:11:10.767239
2743	7	-9000	loss	Plinko game bet	\N	2026-09-01 21:11:10.767239
2744	7	4500	win	Plinko game payout	\N	2026-09-01 21:11:10.767239
2745	7	-9000	loss	Plinko game bet	\N	2026-09-01 21:11:10.767239
2746	7	6750	win	Plinko game payout	\N	2026-09-01 21:11:10.767239
2747	7	-9000	loss	Plinko game bet	\N	2026-09-01 21:11:10.767239
2748	7	6750	win	Plinko game payout	\N	2026-09-01 21:11:10.767239
2749	7	-9000	loss	Plinko game bet	\N	2026-09-01 21:11:10.767239
2750	7	18000	win	Plinko game payout	\N	2026-09-01 21:11:10.767239
2751	7	-9000	loss	Plinko game bet	\N	2026-09-01 21:11:10.767239
2752	7	2700	win	Plinko game payout	\N	2026-09-01 21:11:10.767239
2753	7	-9000	loss	Plinko game bet	\N	2026-09-01 21:11:10.767239
2754	7	4500	win	Plinko game payout	\N	2026-09-01 21:11:10.767239
2755	7	-9000	loss	Plinko game bet	\N	2026-09-01 21:11:10.767239
2756	7	4500	win	Plinko game payout	\N	2026-09-01 21:11:10.767239
2757	7	-9000	loss	Plinko game bet	\N	2026-09-01 21:11:10.767239
2758	7	4500	win	Plinko game payout	\N	2026-09-01 21:11:10.767239
2759	7	-9000	loss	Plinko game bet	\N	2026-09-01 21:11:10.767239
2760	7	9000	win	Plinko game payout	\N	2026-09-01 21:11:10.767239
2761	7	-9000	loss	Plinko game bet	\N	2026-09-01 21:11:10.767239
2762	7	6750	win	Plinko game payout	\N	2026-09-01 21:11:10.767239
2763	7	-9000	loss	Plinko game bet	\N	2026-09-01 21:11:10.767239
2764	7	9000	win	Plinko game payout	\N	2026-09-01 21:11:10.767239
2765	7	-9000	loss	Plinko game bet	\N	2026-09-01 21:11:10.767239
2766	7	6750	win	Plinko game payout	\N	2026-09-01 21:11:10.767239
2767	7	-9000	loss	Plinko game bet	\N	2026-09-01 21:11:10.767239
2768	7	2700	win	Plinko game payout	\N	2026-09-01 21:11:10.767239
2769	7	-9000	loss	Plinko game bet	\N	2026-09-01 21:11:10.767239
2770	7	4500	win	Plinko game payout	\N	2026-09-01 21:11:10.767239
2771	7	-9000	loss	Plinko game bet	\N	2026-09-01 21:11:10.767239
2772	7	9000	win	Plinko game payout	\N	2026-09-01 21:11:10.767239
2773	7	-9000	loss	Plinko game bet	\N	2026-09-01 21:11:10.767239
2774	7	9000	win	Plinko game payout	\N	2026-09-01 21:11:10.767239
2775	7	-9000	loss	Plinko game bet	\N	2026-09-01 21:11:10.767239
2776	7	18000	win	Plinko game payout	\N	2026-09-01 21:11:10.767239
2777	7	-9000	loss	Plinko game bet	\N	2026-09-01 21:11:10.767239
2778	7	4500	win	Plinko game payout	\N	2026-09-01 21:11:10.767239
2779	7	-9000	loss	Plinko game bet	\N	2026-09-01 21:11:10.767239
2780	7	4500	win	Plinko game payout	\N	2026-09-01 21:11:10.767239
2781	7	-7000	loss	Plinko game bet	\N	2026-09-01 21:11:20.803356
2782	7	5250	win	Plinko game payout	\N	2026-09-01 21:11:20.803356
2783	7	-7000	loss	Plinko game bet	\N	2026-09-01 21:11:20.803356
2784	7	5250	win	Plinko game payout	\N	2026-09-01 21:11:20.803356
2785	7	-7000	loss	Plinko game bet	\N	2026-09-01 21:11:20.803356
2786	7	3500	win	Plinko game payout	\N	2026-09-01 21:11:20.803356
2787	7	-7000	loss	Plinko game bet	\N	2026-09-01 21:11:20.803356
2788	7	3500	win	Plinko game payout	\N	2026-09-01 21:11:20.803356
2789	7	-7000	loss	Plinko game bet	\N	2026-09-01 21:11:20.803356
2790	7	7000	win	Plinko game payout	\N	2026-09-01 21:11:20.803356
2791	7	-7000	loss	Plinko game bet	\N	2026-09-01 21:11:20.803356
2792	7	3500	win	Plinko game payout	\N	2026-09-01 21:11:20.803356
2793	7	-7000	loss	Plinko game bet	\N	2026-09-01 21:11:20.803356
2794	7	2100	win	Plinko game payout	\N	2026-09-01 21:11:20.803356
2795	7	-7000	loss	Plinko game bet	\N	2026-09-01 21:11:20.803356
2796	7	14000	win	Plinko game payout	\N	2026-09-01 21:11:20.803356
2797	7	-7000	loss	Plinko game bet	\N	2026-09-01 21:11:20.803356
2798	7	7000	win	Plinko game payout	\N	2026-09-01 21:11:20.803356
2799	7	-7000	loss	Plinko game bet	\N	2026-09-01 21:11:20.803356
2800	7	7000	win	Plinko game payout	\N	2026-09-01 21:11:20.803356
2801	7	-7000	loss	Plinko game bet	\N	2026-09-01 21:11:20.803356
2802	7	3500	win	Plinko game payout	\N	2026-09-01 21:11:20.803356
2803	7	-7000	loss	Plinko game bet	\N	2026-09-01 21:11:20.803356
2804	7	14000	win	Plinko game payout	\N	2026-09-01 21:11:20.803356
2805	7	-7000	loss	Plinko game bet	\N	2026-09-01 21:11:20.803356
2806	7	3500	win	Plinko game payout	\N	2026-09-01 21:11:20.803356
2807	7	-7000	loss	Plinko game bet	\N	2026-09-01 21:11:20.803356
2808	7	2100	win	Plinko game payout	\N	2026-09-01 21:11:20.803356
2809	7	-7000	loss	Plinko game bet	\N	2026-09-01 21:11:20.803356
2810	7	2100	win	Plinko game payout	\N	2026-09-01 21:11:20.803356
2811	7	-7000	loss	Plinko game bet	\N	2026-09-01 21:11:20.803356
2812	7	3500	win	Plinko game payout	\N	2026-09-01 21:11:20.803356
2813	7	-7000	loss	Plinko game bet	\N	2026-09-01 21:11:20.803356
2814	7	3500	win	Plinko game payout	\N	2026-09-01 21:11:20.803356
2815	7	-7000	loss	Plinko game bet	\N	2026-09-01 21:11:20.803356
2816	7	14000	win	Plinko game payout	\N	2026-09-01 21:11:20.803356
2817	7	-7000	loss	Plinko game bet	\N	2026-09-01 21:11:20.803356
2818	7	5250	win	Plinko game payout	\N	2026-09-01 21:11:20.803356
2819	7	-7000	loss	Plinko game bet	\N	2026-09-01 21:11:20.803356
2820	7	5250	win	Plinko game payout	\N	2026-09-01 21:11:20.803356
2821	7	-5000	loss	Plinko game bet	\N	2026-09-01 21:11:27.749964
2822	7	2500	win	Plinko game payout	\N	2026-09-01 21:11:27.749964
2823	7	-5000	loss	Plinko game bet	\N	2026-09-01 21:11:27.749964
2824	7	10000	win	Plinko game payout	\N	2026-09-01 21:11:27.749964
2825	7	-5000	loss	Plinko game bet	\N	2026-09-01 21:11:27.749964
2826	7	5000	win	Plinko game payout	\N	2026-09-01 21:11:27.749964
2827	7	-5000	loss	Plinko game bet	\N	2026-09-01 21:11:27.749964
2828	7	2500	win	Plinko game payout	\N	2026-09-01 21:11:27.749964
2829	7	-5000	loss	Plinko game bet	\N	2026-09-01 21:11:27.749964
2830	7	2500	win	Plinko game payout	\N	2026-09-01 21:11:27.749964
2831	7	-5000	loss	Plinko game bet	\N	2026-09-01 21:11:27.749964
2832	7	2500	win	Plinko game payout	\N	2026-09-01 21:11:27.749964
2833	7	-5000	loss	Plinko game bet	\N	2026-09-01 21:11:27.749964
2834	7	2500	win	Plinko game payout	\N	2026-09-01 21:11:27.749964
2835	7	-5000	loss	Plinko game bet	\N	2026-09-01 21:11:27.749964
2836	7	10000	win	Plinko game payout	\N	2026-09-01 21:11:27.749964
2837	7	-5000	loss	Plinko game bet	\N	2026-09-01 21:11:27.749964
2838	7	5000	win	Plinko game payout	\N	2026-09-01 21:11:27.749964
2839	7	-5000	loss	Plinko game bet	\N	2026-09-01 21:11:27.749964
2840	7	3750	win	Plinko game payout	\N	2026-09-01 21:11:27.749964
2841	7	-5000	loss	Plinko game bet	\N	2026-09-01 21:11:27.749964
2842	7	5000	win	Plinko game payout	\N	2026-09-01 21:11:27.749964
2843	7	-5000	loss	Plinko game bet	\N	2026-09-01 21:11:27.749964
2844	7	2500	win	Plinko game payout	\N	2026-09-01 21:11:27.749964
2845	7	-5000	loss	Plinko game bet	\N	2026-09-01 21:11:27.749964
2846	7	25000	win	Plinko game payout	\N	2026-09-01 21:11:27.749964
2847	7	-5000	loss	Plinko game bet	\N	2026-09-01 21:11:27.749964
2848	7	10000	win	Plinko game payout	\N	2026-09-01 21:11:27.749964
2849	7	-5000	loss	Plinko game bet	\N	2026-09-01 21:11:27.749964
2850	7	3750	win	Plinko game payout	\N	2026-09-01 21:11:27.749964
2851	7	-5000	loss	Plinko game bet	\N	2026-09-01 21:11:27.749964
2852	7	1500	win	Plinko game payout	\N	2026-09-01 21:11:27.749964
2853	7	-5000	loss	Plinko game bet	\N	2026-09-01 21:11:27.749964
2854	7	2500	win	Plinko game payout	\N	2026-09-01 21:11:27.749964
2855	7	-5000	loss	Plinko game bet	\N	2026-09-01 21:11:27.749964
2856	7	5000	win	Plinko game payout	\N	2026-09-01 21:11:27.749964
2857	7	-5000	loss	Plinko game bet	\N	2026-09-01 21:11:27.749964
2858	7	1500	win	Plinko game payout	\N	2026-09-01 21:11:27.749964
2859	7	-5000	loss	Plinko game bet	\N	2026-09-01 21:11:27.749964
2860	7	3750	win	Plinko game payout	\N	2026-09-01 21:11:27.749964
2861	7	-5000	loss	Plinko game bet	\N	2026-09-01 21:11:32.546757
2862	7	10000	win	Plinko game payout	\N	2026-09-01 21:11:32.546757
2863	7	-5000	loss	Plinko game bet	\N	2026-09-01 21:11:32.546757
2864	7	1500	win	Plinko game payout	\N	2026-09-01 21:11:32.546757
2865	7	-5000	loss	Plinko game bet	\N	2026-09-01 21:11:32.546757
2866	7	3750	win	Plinko game payout	\N	2026-09-01 21:11:32.546757
2867	7	-5000	loss	Plinko game bet	\N	2026-09-01 21:11:32.546757
2868	7	3750	win	Plinko game payout	\N	2026-09-01 21:11:32.546757
2869	7	-5000	loss	Plinko game bet	\N	2026-09-01 21:11:32.546757
2870	7	10000	win	Plinko game payout	\N	2026-09-01 21:11:32.546757
2871	7	-5000	loss	Plinko game bet	\N	2026-09-01 21:11:32.546757
2872	7	1500	win	Plinko game payout	\N	2026-09-01 21:11:32.546757
2873	7	-5000	loss	Plinko game bet	\N	2026-09-01 21:11:32.546757
2874	7	2500	win	Plinko game payout	\N	2026-09-01 21:11:32.546757
2875	7	-5000	loss	Plinko game bet	\N	2026-09-01 21:11:32.546757
2876	7	5000	win	Plinko game payout	\N	2026-09-01 21:11:32.546757
2877	7	-5000	loss	Plinko game bet	\N	2026-09-01 21:11:32.546757
2878	7	2500	win	Plinko game payout	\N	2026-09-01 21:11:32.546757
2879	7	-5000	loss	Plinko game bet	\N	2026-09-01 21:11:32.546757
2880	7	5000	win	Plinko game payout	\N	2026-09-01 21:11:32.546757
2881	7	-5000	loss	Plinko game bet	\N	2026-09-01 21:11:32.546757
2882	7	2500	win	Plinko game payout	\N	2026-09-01 21:11:32.546757
2883	7	-5000	loss	Plinko game bet	\N	2026-09-01 21:11:32.546757
2884	7	1500	win	Plinko game payout	\N	2026-09-01 21:11:32.546757
2885	7	-5000	loss	Plinko game bet	\N	2026-09-01 21:11:32.546757
2886	7	2500	win	Plinko game payout	\N	2026-09-01 21:11:32.546757
2887	7	-5000	loss	Plinko game bet	\N	2026-09-01 21:11:32.546757
2888	7	2500	win	Plinko game payout	\N	2026-09-01 21:11:32.546757
2889	7	-5000	loss	Plinko game bet	\N	2026-09-01 21:11:32.546757
2890	7	1500	win	Plinko game payout	\N	2026-09-01 21:11:32.546757
2891	7	-5000	loss	Plinko game bet	\N	2026-09-01 21:11:32.546757
2892	7	3750	win	Plinko game payout	\N	2026-09-01 21:11:32.546757
2893	7	-5000	loss	Plinko game bet	\N	2026-09-01 21:11:32.546757
2894	7	5000	win	Plinko game payout	\N	2026-09-01 21:11:32.546757
2895	7	-5000	loss	Plinko game bet	\N	2026-09-01 21:11:32.546757
2896	7	10000	win	Plinko game payout	\N	2026-09-01 21:11:32.546757
2897	7	-5000	loss	Plinko game bet	\N	2026-09-01 21:11:32.546757
2898	7	3750	win	Plinko game payout	\N	2026-09-01 21:11:32.546757
2899	7	-5000	loss	Plinko game bet	\N	2026-09-01 21:11:32.546757
2900	7	2500	win	Plinko game payout	\N	2026-09-01 21:11:32.546757
2901	7	-5000	loss	Plinko game bet	\N	2026-09-01 21:11:38.319469
2902	7	2500	win	Plinko game payout	\N	2026-09-01 21:11:38.319469
2903	7	-5000	loss	Plinko game bet	\N	2026-09-01 21:11:38.319469
2904	7	2500	win	Plinko game payout	\N	2026-09-01 21:11:38.319469
2905	7	-5000	loss	Plinko game bet	\N	2026-09-01 21:11:38.319469
2906	7	5000	win	Plinko game payout	\N	2026-09-01 21:11:38.319469
2907	7	-5000	loss	Plinko game bet	\N	2026-09-01 21:11:38.319469
2908	7	25000	win	Plinko game payout	\N	2026-09-01 21:11:38.319469
2909	7	-5000	loss	Plinko game bet	\N	2026-09-01 21:11:38.319469
2910	7	5000	win	Plinko game payout	\N	2026-09-01 21:11:38.319469
2911	7	-5000	loss	Plinko game bet	\N	2026-09-01 21:11:38.319469
2912	7	1500	win	Plinko game payout	\N	2026-09-01 21:11:38.319469
2913	7	-5000	loss	Plinko game bet	\N	2026-09-01 21:11:38.319469
2914	7	1500	win	Plinko game payout	\N	2026-09-01 21:11:38.319469
2915	7	-5000	loss	Plinko game bet	\N	2026-09-01 21:11:38.319469
2916	7	3750	win	Plinko game payout	\N	2026-09-01 21:11:38.319469
2917	7	-5000	loss	Plinko game bet	\N	2026-09-01 21:11:38.319469
2918	7	2500	win	Plinko game payout	\N	2026-09-01 21:11:38.319469
2919	7	-5000	loss	Plinko game bet	\N	2026-09-01 21:11:38.319469
2920	7	3750	win	Plinko game payout	\N	2026-09-01 21:11:38.319469
2921	7	-5000	loss	Plinko game bet	\N	2026-09-01 21:11:38.319469
2922	7	1500	win	Plinko game payout	\N	2026-09-01 21:11:38.319469
2923	7	-5000	loss	Plinko game bet	\N	2026-09-01 21:11:38.319469
2924	7	1500	win	Plinko game payout	\N	2026-09-01 21:11:38.319469
2925	7	-5000	loss	Plinko game bet	\N	2026-09-01 21:11:38.319469
2926	7	1500	win	Plinko game payout	\N	2026-09-01 21:11:38.319469
2927	7	-5000	loss	Plinko game bet	\N	2026-09-01 21:11:38.319469
2928	7	3750	win	Plinko game payout	\N	2026-09-01 21:11:38.319469
2929	7	-5000	loss	Plinko game bet	\N	2026-09-01 21:11:38.319469
2930	7	10000	win	Plinko game payout	\N	2026-09-01 21:11:38.319469
2931	7	-5000	loss	Plinko game bet	\N	2026-09-01 21:11:38.319469
2932	7	5000	win	Plinko game payout	\N	2026-09-01 21:11:38.319469
2933	7	-5000	loss	Plinko game bet	\N	2026-09-01 21:11:38.319469
2934	7	3750	win	Plinko game payout	\N	2026-09-01 21:11:38.319469
2935	7	-5000	loss	Plinko game bet	\N	2026-09-01 21:11:38.319469
2936	7	3750	win	Plinko game payout	\N	2026-09-01 21:11:38.319469
2937	7	-5000	loss	Plinko game bet	\N	2026-09-01 21:11:38.319469
2938	7	5000	win	Plinko game payout	\N	2026-09-01 21:11:38.319469
2939	7	-5000	loss	Plinko game bet	\N	2026-09-01 21:11:38.319469
2940	7	3750	win	Plinko game payout	\N	2026-09-01 21:11:38.319469
2941	7	-4000	loss	Plinko game bet	\N	2026-09-01 21:11:45.011822
2942	7	3000	win	Plinko game payout	\N	2026-09-01 21:11:45.011822
2943	7	-4000	loss	Plinko game bet	\N	2026-09-01 21:11:45.011822
2944	7	8000	win	Plinko game payout	\N	2026-09-01 21:11:45.011822
2945	7	-4000	loss	Plinko game bet	\N	2026-09-01 21:11:45.011822
2946	7	8000	win	Plinko game payout	\N	2026-09-01 21:11:45.011822
2947	7	-4000	loss	Plinko game bet	\N	2026-09-01 21:11:45.011822
2948	7	20000	win	Plinko game payout	\N	2026-09-01 21:11:45.011822
2949	7	-4000	loss	Plinko game bet	\N	2026-09-01 21:11:45.011822
2950	7	4000	win	Plinko game payout	\N	2026-09-01 21:11:45.011822
2951	7	-4000	loss	Plinko game bet	\N	2026-09-01 21:11:45.011822
2952	7	4000	win	Plinko game payout	\N	2026-09-01 21:11:45.011822
2953	7	-4000	loss	Plinko game bet	\N	2026-09-01 21:11:45.011822
2954	7	2000	win	Plinko game payout	\N	2026-09-01 21:11:45.011822
2955	7	-4000	loss	Plinko game bet	\N	2026-09-01 21:11:45.011822
2956	7	2000	win	Plinko game payout	\N	2026-09-01 21:11:45.011822
2957	7	-4000	loss	Plinko game bet	\N	2026-09-01 21:11:45.011822
2958	7	3000	win	Plinko game payout	\N	2026-09-01 21:11:45.011822
2959	7	-4000	loss	Plinko game bet	\N	2026-09-01 21:11:45.011822
2960	7	3000	win	Plinko game payout	\N	2026-09-01 21:11:45.011822
2961	7	-4000	loss	Plinko game bet	\N	2026-09-01 21:11:45.011822
2962	7	3000	win	Plinko game payout	\N	2026-09-01 21:11:45.011822
2963	7	-4000	loss	Plinko game bet	\N	2026-09-01 21:11:45.011822
2964	7	3000	win	Plinko game payout	\N	2026-09-01 21:11:45.011822
2965	7	-4000	loss	Plinko game bet	\N	2026-09-01 21:11:45.011822
2966	7	4000	win	Plinko game payout	\N	2026-09-01 21:11:45.011822
2967	7	-4000	loss	Plinko game bet	\N	2026-09-01 21:11:45.011822
2968	7	4000	win	Plinko game payout	\N	2026-09-01 21:11:45.011822
2969	7	-4000	loss	Plinko game bet	\N	2026-09-01 21:11:45.011822
2970	7	1200	win	Plinko game payout	\N	2026-09-01 21:11:45.011822
2971	7	-4000	loss	Plinko game bet	\N	2026-09-01 21:11:45.011822
2972	7	1200	win	Plinko game payout	\N	2026-09-01 21:11:45.011822
2973	7	-4000	loss	Plinko game bet	\N	2026-09-01 21:11:45.011822
2974	7	3000	win	Plinko game payout	\N	2026-09-01 21:11:45.011822
2975	7	-4000	loss	Plinko game bet	\N	2026-09-01 21:11:45.011822
2976	7	3000	win	Plinko game payout	\N	2026-09-01 21:11:45.011822
2977	7	-4000	loss	Plinko game bet	\N	2026-09-01 21:11:45.011822
2978	7	3000	win	Plinko game payout	\N	2026-09-01 21:11:45.011822
2979	7	-4000	loss	Plinko game bet	\N	2026-09-01 21:11:45.011822
2980	7	1200	win	Plinko game payout	\N	2026-09-01 21:11:45.011822
2981	7	-4000	loss	Plinko game bet	\N	2026-09-01 21:11:47.643081
2982	7	1200	win	Plinko game payout	\N	2026-09-01 21:11:47.643081
2983	7	-4000	loss	Plinko game bet	\N	2026-09-01 21:11:47.643081
2984	7	2000	win	Plinko game payout	\N	2026-09-01 21:11:47.643081
2985	7	-4000	loss	Plinko game bet	\N	2026-09-01 21:11:47.643081
2986	7	1200	win	Plinko game payout	\N	2026-09-01 21:11:47.643081
2987	7	-4000	loss	Plinko game bet	\N	2026-09-01 21:11:47.643081
2988	7	8000	win	Plinko game payout	\N	2026-09-01 21:11:47.643081
2989	7	-4000	loss	Plinko game bet	\N	2026-09-01 21:11:47.643081
2990	7	3000	win	Plinko game payout	\N	2026-09-01 21:11:47.643081
2991	7	-4000	loss	Plinko game bet	\N	2026-09-01 21:11:47.643081
2992	7	1200	win	Plinko game payout	\N	2026-09-01 21:11:47.643081
2993	7	-4000	loss	Plinko game bet	\N	2026-09-01 21:11:47.643081
2994	7	2000	win	Plinko game payout	\N	2026-09-01 21:11:47.643081
2995	7	-4000	loss	Plinko game bet	\N	2026-09-01 21:11:47.643081
2996	7	8000	win	Plinko game payout	\N	2026-09-01 21:11:47.643081
2997	7	-4000	loss	Plinko game bet	\N	2026-09-01 21:11:47.643081
2998	7	4000	win	Plinko game payout	\N	2026-09-01 21:11:47.643081
2999	7	-4000	loss	Plinko game bet	\N	2026-09-01 21:11:47.643081
3000	7	2000	win	Plinko game payout	\N	2026-09-01 21:11:47.643081
3001	7	-4000	loss	Plinko game bet	\N	2026-09-01 21:11:47.643081
3002	7	1200	win	Plinko game payout	\N	2026-09-01 21:11:47.643081
3003	7	-4000	loss	Plinko game bet	\N	2026-09-01 21:11:47.643081
3004	7	1200	win	Plinko game payout	\N	2026-09-01 21:11:47.643081
3005	7	-4000	loss	Plinko game bet	\N	2026-09-01 21:11:47.643081
3006	7	2000	win	Plinko game payout	\N	2026-09-01 21:11:47.643081
3007	7	-4000	loss	Plinko game bet	\N	2026-09-01 21:11:47.643081
3008	7	2000	win	Plinko game payout	\N	2026-09-01 21:11:47.643081
3009	7	-4000	loss	Plinko game bet	\N	2026-09-01 21:11:47.643081
3010	7	2000	win	Plinko game payout	\N	2026-09-01 21:11:47.643081
3011	7	-4000	loss	Plinko game bet	\N	2026-09-01 21:11:47.643081
3012	7	1200	win	Plinko game payout	\N	2026-09-01 21:11:47.643081
3013	7	-4000	loss	Plinko game bet	\N	2026-09-01 21:11:47.643081
3014	7	2000	win	Plinko game payout	\N	2026-09-01 21:11:47.643081
3015	7	-4000	loss	Plinko game bet	\N	2026-09-01 21:11:47.643081
3016	7	3000	win	Plinko game payout	\N	2026-09-01 21:11:47.643081
3017	7	-4000	loss	Plinko game bet	\N	2026-09-01 21:11:47.643081
3018	7	3000	win	Plinko game payout	\N	2026-09-01 21:11:47.643081
3019	7	-4000	loss	Plinko game bet	\N	2026-09-01 21:11:47.643081
3020	7	1200	win	Plinko game payout	\N	2026-09-01 21:11:47.643081
3021	7	-3000	loss	Plinko game bet	\N	2026-09-01 21:11:53.527737
3022	7	2250	win	Plinko game payout	\N	2026-09-01 21:11:53.527737
3023	7	-3000	loss	Plinko game bet	\N	2026-09-01 21:11:53.527737
3024	7	2250	win	Plinko game payout	\N	2026-09-01 21:11:53.527737
3025	7	-3000	loss	Plinko game bet	\N	2026-09-01 21:11:53.527737
3026	7	1500	win	Plinko game payout	\N	2026-09-01 21:11:53.527737
3027	7	-3000	loss	Plinko game bet	\N	2026-09-01 21:11:53.527737
3028	7	1500	win	Plinko game payout	\N	2026-09-01 21:11:53.527737
3029	7	-3000	loss	Plinko game bet	\N	2026-09-01 21:11:53.527737
3030	7	1500	win	Plinko game payout	\N	2026-09-01 21:11:53.527737
3031	7	-3000	loss	Plinko game bet	\N	2026-09-01 21:11:53.527737
3032	7	1500	win	Plinko game payout	\N	2026-09-01 21:11:53.527737
3033	7	-3000	loss	Plinko game bet	\N	2026-09-01 21:11:53.527737
3034	7	1500	win	Plinko game payout	\N	2026-09-01 21:11:53.527737
3035	7	-3000	loss	Plinko game bet	\N	2026-09-01 21:11:53.527737
3036	7	2250	win	Plinko game payout	\N	2026-09-01 21:11:53.527737
3037	7	-3000	loss	Plinko game bet	\N	2026-09-01 21:11:53.527737
3038	7	1500	win	Plinko game payout	\N	2026-09-01 21:11:53.527737
3039	7	-3000	loss	Plinko game bet	\N	2026-09-01 21:11:53.527737
3040	7	3000	win	Plinko game payout	\N	2026-09-01 21:11:53.527737
3041	7	-3000	loss	Plinko game bet	\N	2026-09-01 21:11:53.527737
3042	7	1500	win	Plinko game payout	\N	2026-09-01 21:11:53.527737
3043	7	-3000	loss	Plinko game bet	\N	2026-09-01 21:11:53.527737
3044	7	2250	win	Plinko game payout	\N	2026-09-01 21:11:53.527737
3045	7	-3000	loss	Plinko game bet	\N	2026-09-01 21:11:53.527737
3046	7	3000	win	Plinko game payout	\N	2026-09-01 21:11:53.527737
3047	7	-3000	loss	Plinko game bet	\N	2026-09-01 21:11:53.527737
3048	7	1500	win	Plinko game payout	\N	2026-09-01 21:11:53.527737
3049	7	-3000	loss	Plinko game bet	\N	2026-09-01 21:11:53.527737
3050	7	1500	win	Plinko game payout	\N	2026-09-01 21:11:53.527737
3051	7	-3000	loss	Plinko game bet	\N	2026-09-01 21:11:53.527737
3052	7	2250	win	Plinko game payout	\N	2026-09-01 21:11:53.527737
3053	7	-3000	loss	Plinko game bet	\N	2026-09-01 21:11:53.527737
3054	7	1500	win	Plinko game payout	\N	2026-09-01 21:11:53.527737
3055	7	-3000	loss	Plinko game bet	\N	2026-09-01 21:11:53.527737
3056	7	3000	win	Plinko game payout	\N	2026-09-01 21:11:53.527737
3057	7	-3000	loss	Plinko game bet	\N	2026-09-01 21:11:53.527737
3058	7	1500	win	Plinko game payout	\N	2026-09-01 21:11:53.527737
3059	7	-3000	loss	Plinko game bet	\N	2026-09-01 21:11:53.527737
3060	7	2250	win	Plinko game payout	\N	2026-09-01 21:11:53.527737
3061	7	-2000	loss	Plinko game bet	\N	2026-09-01 21:12:01.830907
3062	7	1500	win	Plinko game payout	\N	2026-09-01 21:12:01.830907
3063	7	-2000	loss	Plinko game bet	\N	2026-09-01 21:12:01.830907
3064	7	4000	win	Plinko game payout	\N	2026-09-01 21:12:01.830907
3065	7	-2000	loss	Plinko game bet	\N	2026-09-01 21:12:01.830907
3066	7	2000	win	Plinko game payout	\N	2026-09-01 21:12:01.830907
3067	7	-2000	loss	Plinko game bet	\N	2026-09-01 21:12:01.830907
3068	7	4000	win	Plinko game payout	\N	2026-09-01 21:12:01.830907
3069	7	-2000	loss	Plinko game bet	\N	2026-09-01 21:12:01.830907
3070	7	600	win	Plinko game payout	\N	2026-09-01 21:12:01.830907
3071	7	-2000	loss	Plinko game bet	\N	2026-09-01 21:12:01.830907
3072	7	2000	win	Plinko game payout	\N	2026-09-01 21:12:01.830907
3073	7	-2000	loss	Plinko game bet	\N	2026-09-01 21:12:01.830907
3074	7	2000	win	Plinko game payout	\N	2026-09-01 21:12:01.830907
3075	7	-2000	loss	Plinko game bet	\N	2026-09-01 21:12:01.830907
3076	7	1000	win	Plinko game payout	\N	2026-09-01 21:12:01.830907
3077	7	-2000	loss	Plinko game bet	\N	2026-09-01 21:12:01.830907
3078	7	1500	win	Plinko game payout	\N	2026-09-01 21:12:01.830907
3079	7	-2000	loss	Plinko game bet	\N	2026-09-01 21:12:01.830907
3080	7	1500	win	Plinko game payout	\N	2026-09-01 21:12:01.830907
3081	7	-2000	loss	Plinko game bet	\N	2026-09-01 21:12:01.830907
3082	7	1500	win	Plinko game payout	\N	2026-09-01 21:12:01.830907
3083	7	-2000	loss	Plinko game bet	\N	2026-09-01 21:12:01.830907
3084	7	1000	win	Plinko game payout	\N	2026-09-01 21:12:01.830907
3085	7	-2000	loss	Plinko game bet	\N	2026-09-01 21:12:01.830907
3086	7	1500	win	Plinko game payout	\N	2026-09-01 21:12:01.830907
3087	7	-2000	loss	Plinko game bet	\N	2026-09-01 21:12:01.830907
3088	7	1500	win	Plinko game payout	\N	2026-09-01 21:12:01.830907
3089	7	-2000	loss	Plinko game bet	\N	2026-09-01 21:12:01.830907
3090	7	1500	win	Plinko game payout	\N	2026-09-01 21:12:01.830907
3091	7	-2000	loss	Plinko game bet	\N	2026-09-01 21:12:01.830907
3092	7	2000	win	Plinko game payout	\N	2026-09-01 21:12:01.830907
3093	7	-2000	loss	Plinko game bet	\N	2026-09-01 21:12:01.830907
3094	7	1000	win	Plinko game payout	\N	2026-09-01 21:12:01.830907
3095	7	-2000	loss	Plinko game bet	\N	2026-09-01 21:12:01.830907
3096	7	600	win	Plinko game payout	\N	2026-09-01 21:12:01.830907
3097	7	-2000	loss	Plinko game bet	\N	2026-09-01 21:12:01.830907
3098	7	2000	win	Plinko game payout	\N	2026-09-01 21:12:01.830907
3099	7	-2000	loss	Plinko game bet	\N	2026-09-01 21:12:01.830907
3100	7	1500	win	Plinko game payout	\N	2026-09-01 21:12:01.830907
3101	7	-2000	loss	Plinko game bet	\N	2026-09-01 21:12:05.581346
3102	7	1000	win	Plinko game payout	\N	2026-09-01 21:12:05.581346
3103	7	-2000	loss	Plinko game bet	\N	2026-09-01 21:12:05.581346
3104	7	1500	win	Plinko game payout	\N	2026-09-01 21:12:05.581346
3105	7	-2000	loss	Plinko game bet	\N	2026-09-01 21:12:05.581346
3106	7	1500	win	Plinko game payout	\N	2026-09-01 21:12:05.581346
3107	7	-2000	loss	Plinko game bet	\N	2026-09-01 21:12:05.581346
3108	7	1500	win	Plinko game payout	\N	2026-09-01 21:12:05.581346
3109	7	-2000	loss	Plinko game bet	\N	2026-09-01 21:12:05.581346
3110	7	1500	win	Plinko game payout	\N	2026-09-01 21:12:05.581346
3111	7	-2000	loss	Plinko game bet	\N	2026-09-01 21:12:05.581346
3112	7	2000	win	Plinko game payout	\N	2026-09-01 21:12:05.581346
3113	7	-2000	loss	Plinko game bet	\N	2026-09-01 21:12:05.581346
3114	7	1000	win	Plinko game payout	\N	2026-09-01 21:12:05.581346
3115	7	-2000	loss	Plinko game bet	\N	2026-09-01 21:12:05.581346
3116	7	600	win	Plinko game payout	\N	2026-09-01 21:12:05.581346
3117	7	-2000	loss	Plinko game bet	\N	2026-09-01 21:12:05.581346
3118	7	1000	win	Plinko game payout	\N	2026-09-01 21:12:05.581346
3119	7	-2000	loss	Plinko game bet	\N	2026-09-01 21:12:05.581346
3120	7	600	win	Plinko game payout	\N	2026-09-01 21:12:05.581346
3121	7	-2000	loss	Plinko game bet	\N	2026-09-01 21:12:05.581346
3122	7	1000	win	Plinko game payout	\N	2026-09-01 21:12:05.581346
3123	7	-2000	loss	Plinko game bet	\N	2026-09-01 21:12:05.581346
3124	7	600	win	Plinko game payout	\N	2026-09-01 21:12:05.581346
3125	7	-2000	loss	Plinko game bet	\N	2026-09-01 21:12:05.581346
3126	7	600	win	Plinko game payout	\N	2026-09-01 21:12:05.581346
3127	7	-2000	loss	Plinko game bet	\N	2026-09-01 21:12:05.581346
3128	7	600	win	Plinko game payout	\N	2026-09-01 21:12:05.581346
3129	7	-2000	loss	Plinko game bet	\N	2026-09-01 21:12:05.581346
3130	7	1000	win	Plinko game payout	\N	2026-09-01 21:12:05.581346
3131	7	-2000	loss	Plinko game bet	\N	2026-09-01 21:12:05.581346
3132	7	1500	win	Plinko game payout	\N	2026-09-01 21:12:05.581346
3133	7	-2000	loss	Plinko game bet	\N	2026-09-01 21:12:05.581346
3134	7	1500	win	Plinko game payout	\N	2026-09-01 21:12:05.581346
3135	7	-2000	loss	Plinko game bet	\N	2026-09-01 21:12:05.581346
3136	7	1000	win	Plinko game payout	\N	2026-09-01 21:12:05.581346
3137	7	-2000	loss	Plinko game bet	\N	2026-09-01 21:12:05.581346
3138	7	1000	win	Plinko game payout	\N	2026-09-01 21:12:05.581346
3139	7	-2000	loss	Plinko game bet	\N	2026-09-01 21:12:05.581346
3140	7	1000	win	Plinko game payout	\N	2026-09-01 21:12:05.581346
3141	7	-500	loss	Plinko game bet	\N	2026-09-02 00:16:04.040638
3142	7	250	win	Plinko game payout	\N	2026-09-02 00:16:04.040638
3143	7	-500	loss	Plinko game bet	\N	2026-09-02 00:16:04.040638
3144	7	150	win	Plinko game payout	\N	2026-09-02 00:16:04.040638
3145	7	-500	loss	Plinko game bet	\N	2026-09-02 00:16:04.040638
3146	7	375	win	Plinko game payout	\N	2026-09-02 00:16:04.040638
3147	7	-500	loss	Plinko game bet	\N	2026-09-02 00:16:04.040638
3148	7	150	win	Plinko game payout	\N	2026-09-02 00:16:04.040638
3149	7	-500	loss	Plinko game bet	\N	2026-09-02 00:16:04.040638
3150	7	250	win	Plinko game payout	\N	2026-09-02 00:16:04.040638
3151	7	-500	loss	Plinko game bet	\N	2026-09-02 00:16:04.040638
3152	7	2500	win	Plinko game payout	\N	2026-09-02 00:16:04.040638
3153	7	-500	loss	Plinko game bet	\N	2026-09-02 00:16:04.040638
3154	7	150	win	Plinko game payout	\N	2026-09-02 00:16:04.040638
3155	7	-500	loss	Plinko game bet	\N	2026-09-02 00:16:04.040638
3156	7	250	win	Plinko game payout	\N	2026-09-02 00:16:04.040638
3157	7	-500	loss	Plinko game bet	\N	2026-09-02 00:16:04.040638
3158	7	150	win	Plinko game payout	\N	2026-09-02 00:16:04.040638
3159	7	-500	loss	Plinko game bet	\N	2026-09-02 00:16:04.040638
3160	7	375	win	Plinko game payout	\N	2026-09-02 00:16:04.040638
3161	7	-500	loss	Plinko game bet	\N	2026-09-02 00:16:04.040638
3162	7	250	win	Plinko game payout	\N	2026-09-02 00:16:04.040638
3163	7	-500	loss	Plinko game bet	\N	2026-09-02 00:16:04.040638
3164	7	150	win	Plinko game payout	\N	2026-09-02 00:16:04.040638
3165	7	-500	loss	Plinko game bet	\N	2026-09-02 00:16:04.040638
3166	7	375	win	Plinko game payout	\N	2026-09-02 00:16:04.040638
3167	7	-500	loss	Plinko game bet	\N	2026-09-02 00:16:04.040638
3168	7	500	win	Plinko game payout	\N	2026-09-02 00:16:04.040638
3169	7	-500	loss	Plinko game bet	\N	2026-09-02 00:16:04.040638
3170	7	1000	win	Plinko game payout	\N	2026-09-02 00:16:04.040638
3171	7	-500	loss	Plinko game bet	\N	2026-09-02 00:16:04.040638
3172	7	500	win	Plinko game payout	\N	2026-09-02 00:16:04.040638
3173	7	-500	loss	Plinko game bet	\N	2026-09-02 00:16:04.040638
3174	7	150	win	Plinko game payout	\N	2026-09-02 00:16:04.040638
3175	7	-500	loss	Plinko game bet	\N	2026-09-02 00:16:04.040638
3176	7	375	win	Plinko game payout	\N	2026-09-02 00:16:04.040638
3177	7	-500	loss	Plinko game bet	\N	2026-09-02 00:16:04.040638
3178	7	1000	win	Plinko game payout	\N	2026-09-02 00:16:04.040638
3179	7	-500	loss	Plinko game bet	\N	2026-09-02 00:16:04.040638
3180	7	150	win	Plinko game payout	\N	2026-09-02 00:16:04.040638
3181	7	-1000	loss	Plinko game bet	\N	2026-09-02 00:16:12.837519
3182	7	750	win	Plinko game payout	\N	2026-09-02 00:16:12.837519
3183	7	-1000	loss	Plinko game bet	\N	2026-09-02 00:16:12.837519
3184	7	750	win	Plinko game payout	\N	2026-09-02 00:16:12.837519
3185	7	-1000	loss	Plinko game bet	\N	2026-09-02 00:16:12.837519
3186	7	750	win	Plinko game payout	\N	2026-09-02 00:16:12.837519
3187	7	-1000	loss	Plinko game bet	\N	2026-09-02 00:16:12.837519
3188	7	500	win	Plinko game payout	\N	2026-09-02 00:16:12.837519
3189	7	-1000	loss	Plinko game bet	\N	2026-09-02 00:16:12.837519
3190	7	1000	win	Plinko game payout	\N	2026-09-02 00:16:12.837519
3191	7	-1000	loss	Plinko game bet	\N	2026-09-02 00:16:12.837519
3192	7	750	win	Plinko game payout	\N	2026-09-02 00:16:12.837519
3193	7	-1000	loss	Plinko game bet	\N	2026-09-02 00:16:12.837519
3194	7	750	win	Plinko game payout	\N	2026-09-02 00:16:12.837519
3195	7	-1000	loss	Plinko game bet	\N	2026-09-02 00:16:12.837519
3196	7	300	win	Plinko game payout	\N	2026-09-02 00:16:12.837519
3197	7	-1000	loss	Plinko game bet	\N	2026-09-02 00:16:12.837519
3198	7	300	win	Plinko game payout	\N	2026-09-02 00:16:12.837519
3199	7	-1000	loss	Plinko game bet	\N	2026-09-02 00:16:12.837519
3200	7	750	win	Plinko game payout	\N	2026-09-02 00:16:12.837519
3201	7	-1000	loss	Plinko game bet	\N	2026-09-02 00:16:12.837519
3202	7	1000	win	Plinko game payout	\N	2026-09-02 00:16:12.837519
3203	7	-1000	loss	Plinko game bet	\N	2026-09-02 00:16:12.837519
3204	7	1000	win	Plinko game payout	\N	2026-09-02 00:16:12.837519
3205	7	-1000	loss	Plinko game bet	\N	2026-09-02 00:16:12.837519
3206	7	300	win	Plinko game payout	\N	2026-09-02 00:16:12.837519
3207	7	-1000	loss	Plinko game bet	\N	2026-09-02 00:16:12.837519
3208	7	750	win	Plinko game payout	\N	2026-09-02 00:16:12.837519
3209	7	-1000	loss	Plinko game bet	\N	2026-09-02 00:16:12.837519
3210	7	300	win	Plinko game payout	\N	2026-09-02 00:16:12.837519
3211	7	-1000	loss	Plinko game bet	\N	2026-09-02 00:16:12.837519
3212	7	1000	win	Plinko game payout	\N	2026-09-02 00:16:12.837519
3213	7	-1000	loss	Plinko game bet	\N	2026-09-02 00:16:12.837519
3214	7	300	win	Plinko game payout	\N	2026-09-02 00:16:12.837519
3215	7	-1000	loss	Plinko game bet	\N	2026-09-02 00:16:12.837519
3216	7	750	win	Plinko game payout	\N	2026-09-02 00:16:12.837519
3217	7	-1000	loss	Plinko game bet	\N	2026-09-02 00:16:12.837519
3218	7	750	win	Plinko game payout	\N	2026-09-02 00:16:12.837519
3219	7	-1000	loss	Plinko game bet	\N	2026-09-02 00:16:12.837519
3220	7	750	win	Plinko game payout	\N	2026-09-02 00:16:12.837519
3221	7	-1000	loss	Plinko game bet	\N	2026-09-02 00:16:15.98362
3222	7	750	win	Plinko game payout	\N	2026-09-02 00:16:15.98362
3223	7	-1000	loss	Plinko game bet	\N	2026-09-02 00:16:15.98362
3224	7	500	win	Plinko game payout	\N	2026-09-02 00:16:15.98362
3225	7	-1000	loss	Plinko game bet	\N	2026-09-02 00:16:15.98362
3226	7	500	win	Plinko game payout	\N	2026-09-02 00:16:15.98362
3227	7	-1000	loss	Plinko game bet	\N	2026-09-02 00:16:15.98362
3228	7	500	win	Plinko game payout	\N	2026-09-02 00:16:15.98362
3229	7	-1000	loss	Plinko game bet	\N	2026-09-02 00:16:15.98362
3230	7	500	win	Plinko game payout	\N	2026-09-02 00:16:15.98362
3231	7	-1000	loss	Plinko game bet	\N	2026-09-02 00:16:15.98362
3232	7	300	win	Plinko game payout	\N	2026-09-02 00:16:15.98362
3233	7	-1000	loss	Plinko game bet	\N	2026-09-02 00:16:15.98362
3234	7	500	win	Plinko game payout	\N	2026-09-02 00:16:15.98362
3235	7	-1000	loss	Plinko game bet	\N	2026-09-02 00:16:15.98362
3236	7	750	win	Plinko game payout	\N	2026-09-02 00:16:15.98362
3237	7	-1000	loss	Plinko game bet	\N	2026-09-02 00:16:15.98362
3238	7	300	win	Plinko game payout	\N	2026-09-02 00:16:15.98362
3239	7	-1000	loss	Plinko game bet	\N	2026-09-02 00:16:15.98362
3240	7	750	win	Plinko game payout	\N	2026-09-02 00:16:15.98362
3241	7	-1000	loss	Plinko game bet	\N	2026-09-02 00:16:15.98362
3242	7	500	win	Plinko game payout	\N	2026-09-02 00:16:15.98362
3243	7	-1000	loss	Plinko game bet	\N	2026-09-02 00:16:15.98362
3244	7	1000	win	Plinko game payout	\N	2026-09-02 00:16:15.98362
3245	7	-1000	loss	Plinko game bet	\N	2026-09-02 00:16:15.98362
3246	7	500	win	Plinko game payout	\N	2026-09-02 00:16:15.98362
3247	7	-1000	loss	Plinko game bet	\N	2026-09-02 00:16:15.98362
3248	7	750	win	Plinko game payout	\N	2026-09-02 00:16:15.98362
3249	7	-1000	loss	Plinko game bet	\N	2026-09-02 00:16:15.98362
3250	7	1000	win	Plinko game payout	\N	2026-09-02 00:16:15.98362
3251	7	-1000	loss	Plinko game bet	\N	2026-09-02 00:16:15.98362
3252	7	300	win	Plinko game payout	\N	2026-09-02 00:16:15.98362
3253	7	-1000	loss	Plinko game bet	\N	2026-09-02 00:16:15.98362
3254	7	300	win	Plinko game payout	\N	2026-09-02 00:16:15.98362
3255	7	-1000	loss	Plinko game bet	\N	2026-09-02 00:16:15.98362
3256	7	500	win	Plinko game payout	\N	2026-09-02 00:16:15.98362
3257	7	-1000	loss	Plinko game bet	\N	2026-09-02 00:16:15.98362
3258	7	500	win	Plinko game payout	\N	2026-09-02 00:16:15.98362
3259	7	-1000	loss	Plinko game bet	\N	2026-09-02 00:16:15.98362
3260	7	750	win	Plinko game payout	\N	2026-09-02 00:16:15.98362
3261	7	-500	loss	Plinko game bet	\N	2026-09-02 00:16:19.624875
3262	7	250	win	Plinko game payout	\N	2026-09-02 00:16:19.624875
3263	7	-500	loss	Plinko game bet	\N	2026-09-02 00:16:19.624875
3264	7	250	win	Plinko game payout	\N	2026-09-02 00:16:19.624875
3265	7	-500	loss	Plinko game bet	\N	2026-09-02 00:16:19.624875
3266	7	375	win	Plinko game payout	\N	2026-09-02 00:16:19.624875
3267	7	-500	loss	Plinko game bet	\N	2026-09-02 00:16:19.624875
3268	7	500	win	Plinko game payout	\N	2026-09-02 00:16:19.624875
3269	7	-500	loss	Plinko game bet	\N	2026-09-02 00:16:19.624875
3270	7	150	win	Plinko game payout	\N	2026-09-02 00:16:19.624875
3271	7	-500	loss	Plinko game bet	\N	2026-09-02 00:16:19.624875
3272	7	250	win	Plinko game payout	\N	2026-09-02 00:16:19.624875
3273	7	-500	loss	Plinko game bet	\N	2026-09-02 00:16:19.624875
3274	7	500	win	Plinko game payout	\N	2026-09-02 00:16:19.624875
3275	7	-500	loss	Plinko game bet	\N	2026-09-02 00:16:19.624875
3276	7	250	win	Plinko game payout	\N	2026-09-02 00:16:19.624875
3277	7	-500	loss	Plinko game bet	\N	2026-09-02 00:16:19.624875
3278	7	2500	win	Plinko game payout	\N	2026-09-02 00:16:19.624875
3279	7	-500	loss	Plinko game bet	\N	2026-09-02 00:16:19.624875
3280	7	375	win	Plinko game payout	\N	2026-09-02 00:16:19.624875
3281	7	-500	loss	Plinko game bet	\N	2026-09-02 00:16:19.624875
3282	7	375	win	Plinko game payout	\N	2026-09-02 00:16:19.624875
3283	7	-500	loss	Plinko game bet	\N	2026-09-02 00:16:19.624875
3284	7	500	win	Plinko game payout	\N	2026-09-02 00:16:19.624875
3285	7	-500	loss	Plinko game bet	\N	2026-09-02 00:16:19.624875
3286	7	250	win	Plinko game payout	\N	2026-09-02 00:16:19.624875
3287	7	-500	loss	Plinko game bet	\N	2026-09-02 00:16:19.624875
3288	7	375	win	Plinko game payout	\N	2026-09-02 00:16:19.624875
3289	7	-500	loss	Plinko game bet	\N	2026-09-02 00:16:19.624875
3290	7	250	win	Plinko game payout	\N	2026-09-02 00:16:19.624875
3291	7	-500	loss	Plinko game bet	\N	2026-09-02 00:16:19.624875
3292	7	1000	win	Plinko game payout	\N	2026-09-02 00:16:19.624875
3293	7	-500	loss	Plinko game bet	\N	2026-09-02 00:16:19.624875
3294	7	375	win	Plinko game payout	\N	2026-09-02 00:16:19.624875
3295	7	-500	loss	Plinko game bet	\N	2026-09-02 00:16:19.624875
3296	7	500	win	Plinko game payout	\N	2026-09-02 00:16:19.624875
3297	7	-500	loss	Plinko game bet	\N	2026-09-02 00:16:19.624875
3298	7	375	win	Plinko game payout	\N	2026-09-02 00:16:19.624875
3299	7	-500	loss	Plinko game bet	\N	2026-09-02 00:16:19.624875
3300	7	375	win	Plinko game payout	\N	2026-09-02 00:16:19.624875
3301	7	-500	loss	Plinko game bet	\N	2026-09-02 00:16:21.711325
3302	7	250	win	Plinko game payout	\N	2026-09-02 00:16:21.711325
3303	7	-500	loss	Plinko game bet	\N	2026-09-02 00:16:21.711325
3304	7	250	win	Plinko game payout	\N	2026-09-02 00:16:21.711325
3305	7	-500	loss	Plinko game bet	\N	2026-09-02 00:16:21.711325
3306	7	150	win	Plinko game payout	\N	2026-09-02 00:16:21.711325
3307	7	-500	loss	Plinko game bet	\N	2026-09-02 00:16:21.711325
3308	7	150	win	Plinko game payout	\N	2026-09-02 00:16:21.711325
3309	7	-500	loss	Plinko game bet	\N	2026-09-02 00:16:21.711325
3310	7	375	win	Plinko game payout	\N	2026-09-02 00:16:21.711325
3311	7	-500	loss	Plinko game bet	\N	2026-09-02 00:16:21.711325
3312	7	150	win	Plinko game payout	\N	2026-09-02 00:16:21.711325
3313	7	-500	loss	Plinko game bet	\N	2026-09-02 00:16:21.711325
3314	7	250	win	Plinko game payout	\N	2026-09-02 00:16:21.711325
3315	7	-500	loss	Plinko game bet	\N	2026-09-02 00:16:21.711325
3316	7	150	win	Plinko game payout	\N	2026-09-02 00:16:21.711325
3317	7	-500	loss	Plinko game bet	\N	2026-09-02 00:16:21.711325
3318	7	375	win	Plinko game payout	\N	2026-09-02 00:16:21.711325
3319	7	-500	loss	Plinko game bet	\N	2026-09-02 00:16:21.711325
3320	7	150	win	Plinko game payout	\N	2026-09-02 00:16:21.711325
3321	7	-500	loss	Plinko game bet	\N	2026-09-02 00:16:21.711325
3322	7	150	win	Plinko game payout	\N	2026-09-02 00:16:21.711325
3323	7	-500	loss	Plinko game bet	\N	2026-09-02 00:16:21.711325
3324	7	250	win	Plinko game payout	\N	2026-09-02 00:16:21.711325
3325	7	-500	loss	Plinko game bet	\N	2026-09-02 00:16:21.711325
3326	7	250	win	Plinko game payout	\N	2026-09-02 00:16:21.711325
3327	7	-500	loss	Plinko game bet	\N	2026-09-02 00:16:21.711325
3328	7	250	win	Plinko game payout	\N	2026-09-02 00:16:21.711325
3329	7	-500	loss	Plinko game bet	\N	2026-09-02 00:16:21.711325
3330	7	250	win	Plinko game payout	\N	2026-09-02 00:16:21.711325
3331	7	-500	loss	Plinko game bet	\N	2026-09-02 00:16:21.711325
3332	7	150	win	Plinko game payout	\N	2026-09-02 00:16:21.711325
3333	7	-500	loss	Plinko game bet	\N	2026-09-02 00:16:21.711325
3334	7	500	win	Plinko game payout	\N	2026-09-02 00:16:21.711325
3335	7	-500	loss	Plinko game bet	\N	2026-09-02 00:16:21.711325
3336	7	250	win	Plinko game payout	\N	2026-09-02 00:16:21.711325
3337	7	-500	loss	Plinko game bet	\N	2026-09-02 00:16:21.711325
3338	7	250	win	Plinko game payout	\N	2026-09-02 00:16:21.711325
3339	7	-500	loss	Plinko game bet	\N	2026-09-02 00:16:21.711325
3340	7	250	win	Plinko game payout	\N	2026-09-02 00:16:21.711325
3341	7	-100	loss	Plinko game bet	\N	2026-09-02 00:16:28.286745
3342	7	75	win	Plinko game payout	\N	2026-09-02 00:16:28.286745
3343	7	-100	loss	Plinko game bet	\N	2026-09-02 00:16:28.286745
3344	7	100	win	Plinko game payout	\N	2026-09-02 00:16:28.286745
3345	7	-100	loss	Plinko game bet	\N	2026-09-02 00:16:28.286745
3346	7	75	win	Plinko game payout	\N	2026-09-02 00:16:28.286745
3347	7	-100	loss	Plinko game bet	\N	2026-09-02 00:16:28.286745
3348	7	75	win	Plinko game payout	\N	2026-09-02 00:16:28.286745
3349	7	-100	loss	Plinko game bet	\N	2026-09-02 00:16:28.286745
3350	7	30	win	Plinko game payout	\N	2026-09-02 00:16:28.286745
3351	7	-100	loss	Plinko game bet	\N	2026-09-02 00:16:28.286745
3352	7	50	win	Plinko game payout	\N	2026-09-02 00:16:28.286745
3353	7	-100	loss	Plinko game bet	\N	2026-09-02 00:16:28.286745
3354	7	30	win	Plinko game payout	\N	2026-09-02 00:16:28.286745
3355	7	-100	loss	Plinko game bet	\N	2026-09-02 00:16:28.286745
3356	7	50	win	Plinko game payout	\N	2026-09-02 00:16:28.286745
3357	7	-100	loss	Plinko game bet	\N	2026-09-02 00:16:28.286745
3358	7	50	win	Plinko game payout	\N	2026-09-02 00:16:28.286745
3359	7	-100	loss	Plinko game bet	\N	2026-09-02 00:16:28.286745
3360	7	30	win	Plinko game payout	\N	2026-09-02 00:16:28.286745
3361	7	-100	loss	Plinko game bet	\N	2026-09-02 00:16:28.286745
3362	7	50	win	Plinko game payout	\N	2026-09-02 00:16:28.286745
3363	7	-100	loss	Plinko game bet	\N	2026-09-02 00:16:28.286745
3364	7	75	win	Plinko game payout	\N	2026-09-02 00:16:28.286745
3365	7	-100	loss	Plinko game bet	\N	2026-09-02 00:16:28.286745
3366	7	100	win	Plinko game payout	\N	2026-09-02 00:16:28.286745
3367	7	-100	loss	Plinko game bet	\N	2026-09-02 00:16:28.286745
3368	7	50	win	Plinko game payout	\N	2026-09-02 00:16:28.286745
3369	7	-100	loss	Plinko game bet	\N	2026-09-02 00:16:28.286745
3370	7	75	win	Plinko game payout	\N	2026-09-02 00:16:28.286745
3371	7	-100	loss	Plinko game bet	\N	2026-09-02 00:16:28.286745
3372	7	75	win	Plinko game payout	\N	2026-09-02 00:16:28.286745
3373	7	-100	loss	Plinko game bet	\N	2026-09-02 00:16:28.286745
3374	7	75	win	Plinko game payout	\N	2026-09-02 00:16:28.286745
3375	7	-100	loss	Plinko game bet	\N	2026-09-02 00:16:28.286745
3376	7	30	win	Plinko game payout	\N	2026-09-02 00:16:28.286745
3377	7	-100	loss	Plinko game bet	\N	2026-09-02 00:16:28.286745
3378	7	50	win	Plinko game payout	\N	2026-09-02 00:16:28.286745
3379	7	-100	loss	Plinko game bet	\N	2026-09-02 00:16:28.286745
3380	7	75	win	Plinko game payout	\N	2026-09-02 00:16:28.286745
3381	7	-100	loss	Plinko game bet	\N	2026-09-02 00:16:30.650032
3382	7	100	win	Plinko game payout	\N	2026-09-02 00:16:30.650032
3383	7	-100	loss	Plinko game bet	\N	2026-09-02 00:16:30.650032
3384	7	100	win	Plinko game payout	\N	2026-09-02 00:16:30.650032
3385	7	-100	loss	Plinko game bet	\N	2026-09-02 00:16:30.650032
3386	7	75	win	Plinko game payout	\N	2026-09-02 00:16:30.650032
3387	7	-100	loss	Plinko game bet	\N	2026-09-02 00:16:30.650032
3388	7	75	win	Plinko game payout	\N	2026-09-02 00:16:30.650032
3389	7	-100	loss	Plinko game bet	\N	2026-09-02 00:16:30.650032
3390	7	75	win	Plinko game payout	\N	2026-09-02 00:16:30.650032
3391	7	-100	loss	Plinko game bet	\N	2026-09-02 00:16:30.650032
3392	7	75	win	Plinko game payout	\N	2026-09-02 00:16:30.650032
3393	7	-100	loss	Plinko game bet	\N	2026-09-02 00:16:30.650032
3394	7	50	win	Plinko game payout	\N	2026-09-02 00:16:30.650032
3395	7	-100	loss	Plinko game bet	\N	2026-09-02 00:16:30.650032
3396	7	50	win	Plinko game payout	\N	2026-09-02 00:16:30.650032
3397	7	-100	loss	Plinko game bet	\N	2026-09-02 00:16:30.650032
3398	7	75	win	Plinko game payout	\N	2026-09-02 00:16:30.650032
3399	7	-100	loss	Plinko game bet	\N	2026-09-02 00:16:30.650032
3400	7	100	win	Plinko game payout	\N	2026-09-02 00:16:30.650032
3401	7	-100	loss	Plinko game bet	\N	2026-09-02 00:16:30.650032
3402	7	75	win	Plinko game payout	\N	2026-09-02 00:16:30.650032
3403	7	-100	loss	Plinko game bet	\N	2026-09-02 00:16:30.650032
3404	7	75	win	Plinko game payout	\N	2026-09-02 00:16:30.650032
3405	7	-100	loss	Plinko game bet	\N	2026-09-02 00:16:30.650032
3406	7	50	win	Plinko game payout	\N	2026-09-02 00:16:30.650032
3407	7	-100	loss	Plinko game bet	\N	2026-09-02 00:16:30.650032
3408	7	75	win	Plinko game payout	\N	2026-09-02 00:16:30.650032
3409	7	-100	loss	Plinko game bet	\N	2026-09-02 00:16:30.650032
3410	7	100	win	Plinko game payout	\N	2026-09-02 00:16:30.650032
3411	7	-100	loss	Plinko game bet	\N	2026-09-02 00:16:30.650032
3412	7	75	win	Plinko game payout	\N	2026-09-02 00:16:30.650032
3413	7	-100	loss	Plinko game bet	\N	2026-09-02 00:16:30.650032
3414	7	50	win	Plinko game payout	\N	2026-09-02 00:16:30.650032
3415	7	-100	loss	Plinko game bet	\N	2026-09-02 00:16:30.650032
3416	7	75	win	Plinko game payout	\N	2026-09-02 00:16:30.650032
3417	7	-100	loss	Plinko game bet	\N	2026-09-02 00:16:30.650032
3418	7	75	win	Plinko game payout	\N	2026-09-02 00:16:30.650032
3419	7	-100	loss	Plinko game bet	\N	2026-09-02 00:16:30.650032
3420	7	100	win	Plinko game payout	\N	2026-09-02 00:16:30.650032
3421	7	-100	loss	Plinko game bet	\N	2026-09-02 00:16:33.057397
3422	7	30	win	Plinko game payout	\N	2026-09-02 00:16:33.057397
3423	7	-100	loss	Plinko game bet	\N	2026-09-02 00:16:33.057397
3424	7	200	win	Plinko game payout	\N	2026-09-02 00:16:33.057397
3425	7	-100	loss	Plinko game bet	\N	2026-09-02 00:16:33.057397
3426	7	50	win	Plinko game payout	\N	2026-09-02 00:16:33.057397
3427	7	-100	loss	Plinko game bet	\N	2026-09-02 00:16:33.057397
3428	7	50	win	Plinko game payout	\N	2026-09-02 00:16:33.057397
3429	7	-100	loss	Plinko game bet	\N	2026-09-02 00:16:33.057397
3430	7	75	win	Plinko game payout	\N	2026-09-02 00:16:33.057397
3431	7	-100	loss	Plinko game bet	\N	2026-09-02 00:16:33.057397
3432	7	30	win	Plinko game payout	\N	2026-09-02 00:16:33.057397
3433	7	-100	loss	Plinko game bet	\N	2026-09-02 00:16:33.057397
3434	7	50	win	Plinko game payout	\N	2026-09-02 00:16:33.057397
3435	7	-100	loss	Plinko game bet	\N	2026-09-02 00:16:33.057397
3436	7	75	win	Plinko game payout	\N	2026-09-02 00:16:33.057397
3437	7	-100	loss	Plinko game bet	\N	2026-09-02 00:16:33.057397
3438	7	75	win	Plinko game payout	\N	2026-09-02 00:16:33.057397
3439	7	-100	loss	Plinko game bet	\N	2026-09-02 00:16:33.057397
3440	7	30	win	Plinko game payout	\N	2026-09-02 00:16:33.057397
3441	7	-100	loss	Plinko game bet	\N	2026-09-02 00:16:33.057397
3442	7	75	win	Plinko game payout	\N	2026-09-02 00:16:33.057397
3443	7	-100	loss	Plinko game bet	\N	2026-09-02 00:16:33.057397
3444	7	75	win	Plinko game payout	\N	2026-09-02 00:16:33.057397
3445	7	-100	loss	Plinko game bet	\N	2026-09-02 00:16:33.057397
3446	7	50	win	Plinko game payout	\N	2026-09-02 00:16:33.057397
3447	7	-100	loss	Plinko game bet	\N	2026-09-02 00:16:33.057397
3448	7	50	win	Plinko game payout	\N	2026-09-02 00:16:33.057397
3449	7	-100	loss	Plinko game bet	\N	2026-09-02 00:16:33.057397
3450	7	50	win	Plinko game payout	\N	2026-09-02 00:16:33.057397
3451	7	-100	loss	Plinko game bet	\N	2026-09-02 00:16:33.057397
3452	7	200	win	Plinko game payout	\N	2026-09-02 00:16:33.057397
3453	7	-100	loss	Plinko game bet	\N	2026-09-02 00:16:33.057397
3454	7	50	win	Plinko game payout	\N	2026-09-02 00:16:33.057397
3455	7	-100	loss	Plinko game bet	\N	2026-09-02 00:16:33.057397
3456	7	50	win	Plinko game payout	\N	2026-09-02 00:16:33.057397
3457	7	-100	loss	Plinko game bet	\N	2026-09-02 00:16:33.057397
3458	7	50	win	Plinko game payout	\N	2026-09-02 00:16:33.057397
3459	7	-100	loss	Plinko game bet	\N	2026-09-02 00:16:33.057397
3460	7	75	win	Plinko game payout	\N	2026-09-02 00:16:33.057397
3461	7	-100	loss	Plinko game bet	\N	2026-09-02 00:16:35.067574
3462	7	75	win	Plinko game payout	\N	2026-09-02 00:16:35.067574
3463	7	-100	loss	Plinko game bet	\N	2026-09-02 00:16:35.067574
3464	7	75	win	Plinko game payout	\N	2026-09-02 00:16:35.067574
3465	7	-100	loss	Plinko game bet	\N	2026-09-02 00:16:35.067574
3466	7	75	win	Plinko game payout	\N	2026-09-02 00:16:35.067574
3467	7	-100	loss	Plinko game bet	\N	2026-09-02 00:16:35.067574
3468	7	75	win	Plinko game payout	\N	2026-09-02 00:16:35.067574
3469	7	-100	loss	Plinko game bet	\N	2026-09-02 00:16:35.067574
3470	7	75	win	Plinko game payout	\N	2026-09-02 00:16:35.067574
3471	7	-100	loss	Plinko game bet	\N	2026-09-02 00:16:35.067574
3472	7	75	win	Plinko game payout	\N	2026-09-02 00:16:35.067574
3473	7	-100	loss	Plinko game bet	\N	2026-09-02 00:16:35.067574
3474	7	50	win	Plinko game payout	\N	2026-09-02 00:16:35.067574
3475	7	-100	loss	Plinko game bet	\N	2026-09-02 00:16:35.067574
3476	7	75	win	Plinko game payout	\N	2026-09-02 00:16:35.067574
3477	7	-100	loss	Plinko game bet	\N	2026-09-02 00:16:35.067574
3478	7	75	win	Plinko game payout	\N	2026-09-02 00:16:35.067574
3479	7	-100	loss	Plinko game bet	\N	2026-09-02 00:16:35.067574
3480	7	200	win	Plinko game payout	\N	2026-09-02 00:16:35.067574
3481	7	-100	loss	Plinko game bet	\N	2026-09-02 00:16:35.067574
3482	7	30	win	Plinko game payout	\N	2026-09-02 00:16:35.067574
3483	7	-100	loss	Plinko game bet	\N	2026-09-02 00:16:35.067574
3484	7	50	win	Plinko game payout	\N	2026-09-02 00:16:35.067574
3485	7	-100	loss	Plinko game bet	\N	2026-09-02 00:16:35.067574
3486	7	50	win	Plinko game payout	\N	2026-09-02 00:16:35.067574
3487	7	-100	loss	Plinko game bet	\N	2026-09-02 00:16:35.067574
3488	7	75	win	Plinko game payout	\N	2026-09-02 00:16:35.067574
3489	7	-100	loss	Plinko game bet	\N	2026-09-02 00:16:35.067574
3490	7	75	win	Plinko game payout	\N	2026-09-02 00:16:35.067574
3491	7	-100	loss	Plinko game bet	\N	2026-09-02 00:16:35.067574
3492	7	50	win	Plinko game payout	\N	2026-09-02 00:16:35.067574
3493	7	-100	loss	Plinko game bet	\N	2026-09-02 00:16:35.067574
3494	7	100	win	Plinko game payout	\N	2026-09-02 00:16:35.067574
3495	7	-100	loss	Plinko game bet	\N	2026-09-02 00:16:35.067574
3496	7	30	win	Plinko game payout	\N	2026-09-02 00:16:35.067574
3497	7	-100	loss	Plinko game bet	\N	2026-09-02 00:16:35.067574
3498	7	30	win	Plinko game payout	\N	2026-09-02 00:16:35.067574
3499	7	-100	loss	Plinko game bet	\N	2026-09-02 00:16:35.067574
3500	7	50	win	Plinko game payout	\N	2026-09-02 00:16:35.067574
3501	7	-100	loss	Plinko game bet	\N	2026-09-02 00:16:37.581846
3502	7	50	win	Plinko game payout	\N	2026-09-02 00:16:37.581846
3503	7	-100	loss	Plinko game bet	\N	2026-09-02 00:16:37.581846
3504	7	75	win	Plinko game payout	\N	2026-09-02 00:16:37.581846
3505	7	-100	loss	Plinko game bet	\N	2026-09-02 00:16:37.581846
3506	7	50	win	Plinko game payout	\N	2026-09-02 00:16:37.581846
3507	7	-100	loss	Plinko game bet	\N	2026-09-02 00:16:37.581846
3508	7	75	win	Plinko game payout	\N	2026-09-02 00:16:37.581846
3509	7	-100	loss	Plinko game bet	\N	2026-09-02 00:16:37.581846
3510	7	30	win	Plinko game payout	\N	2026-09-02 00:16:37.581846
3511	7	-100	loss	Plinko game bet	\N	2026-09-02 00:16:37.581846
3512	7	75	win	Plinko game payout	\N	2026-09-02 00:16:37.581846
3513	7	-100	loss	Plinko game bet	\N	2026-09-02 00:16:37.581846
3514	7	50	win	Plinko game payout	\N	2026-09-02 00:16:37.581846
3515	7	-100	loss	Plinko game bet	\N	2026-09-02 00:16:37.581846
3516	7	100	win	Plinko game payout	\N	2026-09-02 00:16:37.581846
3517	7	-100	loss	Plinko game bet	\N	2026-09-02 00:16:37.581846
3518	7	50	win	Plinko game payout	\N	2026-09-02 00:16:37.581846
3519	7	-100	loss	Plinko game bet	\N	2026-09-02 00:16:37.581846
3520	7	75	win	Plinko game payout	\N	2026-09-02 00:16:37.581846
3521	7	-100	loss	Plinko game bet	\N	2026-09-02 00:16:37.581846
3522	7	75	win	Plinko game payout	\N	2026-09-02 00:16:37.581846
3523	7	-100	loss	Plinko game bet	\N	2026-09-02 00:16:37.581846
3524	7	30	win	Plinko game payout	\N	2026-09-02 00:16:37.581846
3525	7	-100	loss	Plinko game bet	\N	2026-09-02 00:16:37.581846
3526	7	50	win	Plinko game payout	\N	2026-09-02 00:16:37.581846
3527	7	-100	loss	Plinko game bet	\N	2026-09-02 00:16:37.581846
3528	7	30	win	Plinko game payout	\N	2026-09-02 00:16:37.581846
3529	7	-100	loss	Plinko game bet	\N	2026-09-02 00:16:37.581846
3530	7	30	win	Plinko game payout	\N	2026-09-02 00:16:37.581846
3531	7	-100	loss	Plinko game bet	\N	2026-09-02 00:16:37.581846
3532	7	75	win	Plinko game payout	\N	2026-09-02 00:16:37.581846
3533	7	-100	loss	Plinko game bet	\N	2026-09-02 00:16:37.581846
3534	7	30	win	Plinko game payout	\N	2026-09-02 00:16:37.581846
3535	7	-100	loss	Plinko game bet	\N	2026-09-02 00:16:37.581846
3536	7	500	win	Plinko game payout	\N	2026-09-02 00:16:37.581846
3537	7	-100	loss	Plinko game bet	\N	2026-09-02 00:16:37.581846
3538	7	75	win	Plinko game payout	\N	2026-09-02 00:16:37.581846
3539	7	-100	loss	Plinko game bet	\N	2026-09-02 00:16:37.581846
3540	7	75	win	Plinko game payout	\N	2026-09-02 00:16:37.581846
3541	7	-100	loss	Plinko game bet	\N	2026-09-02 00:16:39.566123
3542	7	30	win	Plinko game payout	\N	2026-09-02 00:16:39.566123
3543	7	-100	loss	Plinko game bet	\N	2026-09-02 00:16:39.566123
3544	7	75	win	Plinko game payout	\N	2026-09-02 00:16:39.566123
3545	7	-100	loss	Plinko game bet	\N	2026-09-02 00:16:39.566123
3546	7	100	win	Plinko game payout	\N	2026-09-02 00:16:39.566123
3547	7	-100	loss	Plinko game bet	\N	2026-09-02 00:16:39.566123
3548	7	100	win	Plinko game payout	\N	2026-09-02 00:16:39.566123
3549	7	-100	loss	Plinko game bet	\N	2026-09-02 00:16:39.566123
3550	7	30	win	Plinko game payout	\N	2026-09-02 00:16:39.566123
3551	7	-100	loss	Plinko game bet	\N	2026-09-02 00:16:39.566123
3552	7	100	win	Plinko game payout	\N	2026-09-02 00:16:39.566123
3553	7	-100	loss	Plinko game bet	\N	2026-09-02 00:16:39.566123
3554	7	30	win	Plinko game payout	\N	2026-09-02 00:16:39.566123
3555	7	-100	loss	Plinko game bet	\N	2026-09-02 00:16:39.566123
3556	7	200	win	Plinko game payout	\N	2026-09-02 00:16:39.566123
3557	7	-100	loss	Plinko game bet	\N	2026-09-02 00:16:39.566123
3558	7	200	win	Plinko game payout	\N	2026-09-02 00:16:39.566123
3559	7	-100	loss	Plinko game bet	\N	2026-09-02 00:16:39.566123
3560	7	50	win	Plinko game payout	\N	2026-09-02 00:16:39.566123
3561	7	-100	loss	Plinko game bet	\N	2026-09-02 00:16:39.566123
3562	7	200	win	Plinko game payout	\N	2026-09-02 00:16:39.566123
3563	7	-100	loss	Plinko game bet	\N	2026-09-02 00:16:39.566123
3564	7	75	win	Plinko game payout	\N	2026-09-02 00:16:39.566123
3565	7	-100	loss	Plinko game bet	\N	2026-09-02 00:16:39.566123
3566	7	75	win	Plinko game payout	\N	2026-09-02 00:16:39.566123
3567	7	-100	loss	Plinko game bet	\N	2026-09-02 00:16:39.566123
3568	7	50	win	Plinko game payout	\N	2026-09-02 00:16:39.566123
3569	7	-100	loss	Plinko game bet	\N	2026-09-02 00:16:39.566123
3570	7	100	win	Plinko game payout	\N	2026-09-02 00:16:39.566123
3571	7	-100	loss	Plinko game bet	\N	2026-09-02 00:16:39.566123
3572	7	1000	win	Plinko game payout	\N	2026-09-02 00:16:39.566123
3573	7	-100	loss	Plinko game bet	\N	2026-09-02 00:16:39.566123
3574	7	50	win	Plinko game payout	\N	2026-09-02 00:16:39.566123
3575	7	-100	loss	Plinko game bet	\N	2026-09-02 00:16:39.566123
3576	7	30	win	Plinko game payout	\N	2026-09-02 00:16:39.566123
3577	7	-100	loss	Plinko game bet	\N	2026-09-02 00:16:39.566123
3578	7	75	win	Plinko game payout	\N	2026-09-02 00:16:39.566123
3579	7	-100	loss	Plinko game bet	\N	2026-09-02 00:16:39.566123
3580	7	30	win	Plinko game payout	\N	2026-09-02 00:16:39.566123
3581	7	-100	loss	Plinko game bet	\N	2026-09-02 00:16:43.17754
3582	7	75	win	Plinko game payout	\N	2026-09-02 00:16:43.17754
3583	7	-100	loss	Plinko game bet	\N	2026-09-02 00:16:43.17754
3584	7	75	win	Plinko game payout	\N	2026-09-02 00:16:43.17754
3585	7	-100	loss	Plinko game bet	\N	2026-09-02 00:16:43.17754
3586	7	50	win	Plinko game payout	\N	2026-09-02 00:16:43.17754
3587	7	-100	loss	Plinko game bet	\N	2026-09-02 00:16:43.17754
3588	7	50	win	Plinko game payout	\N	2026-09-02 00:16:43.17754
3589	7	-100	loss	Plinko game bet	\N	2026-09-02 00:16:43.17754
3590	7	30	win	Plinko game payout	\N	2026-09-02 00:16:43.17754
3591	7	-100	loss	Plinko game bet	\N	2026-09-02 00:16:43.17754
3592	7	75	win	Plinko game payout	\N	2026-09-02 00:16:43.17754
3593	7	-100	loss	Plinko game bet	\N	2026-09-02 00:16:43.17754
3594	7	50	win	Plinko game payout	\N	2026-09-02 00:16:43.17754
3595	7	-100	loss	Plinko game bet	\N	2026-09-02 00:16:43.17754
3596	7	50	win	Plinko game payout	\N	2026-09-02 00:16:43.17754
3597	7	-100	loss	Plinko game bet	\N	2026-09-02 00:16:43.17754
3598	7	30	win	Plinko game payout	\N	2026-09-02 00:16:43.17754
3599	7	-100	loss	Plinko game bet	\N	2026-09-02 00:16:43.17754
3600	7	75	win	Plinko game payout	\N	2026-09-02 00:16:43.17754
3601	7	-100	loss	Plinko game bet	\N	2026-09-02 00:16:43.17754
3602	7	50	win	Plinko game payout	\N	2026-09-02 00:16:43.17754
3603	7	-100	loss	Plinko game bet	\N	2026-09-02 00:16:43.17754
3604	7	50	win	Plinko game payout	\N	2026-09-02 00:16:43.17754
3605	7	-100	loss	Plinko game bet	\N	2026-09-02 00:16:43.17754
3606	7	30	win	Plinko game payout	\N	2026-09-02 00:16:43.17754
3607	7	-100	loss	Plinko game bet	\N	2026-09-02 00:16:43.17754
3608	7	75	win	Plinko game payout	\N	2026-09-02 00:16:43.17754
3609	7	-100	loss	Plinko game bet	\N	2026-09-02 00:16:43.17754
3610	7	50	win	Plinko game payout	\N	2026-09-02 00:16:43.17754
3611	7	-100	loss	Plinko game bet	\N	2026-09-02 00:16:43.17754
3612	7	50	win	Plinko game payout	\N	2026-09-02 00:16:43.17754
3613	7	-100	loss	Plinko game bet	\N	2026-09-02 00:16:43.17754
3614	7	50	win	Plinko game payout	\N	2026-09-02 00:16:43.17754
3615	7	-100	loss	Plinko game bet	\N	2026-09-02 00:16:43.17754
3616	7	75	win	Plinko game payout	\N	2026-09-02 00:16:43.17754
3617	7	-100	loss	Plinko game bet	\N	2026-09-02 00:16:43.17754
3618	7	50	win	Plinko game payout	\N	2026-09-02 00:16:43.17754
3619	7	-100	loss	Plinko game bet	\N	2026-09-02 00:16:43.17754
3620	7	75	win	Plinko game payout	\N	2026-09-02 00:16:43.17754
3621	7	-100	loss	Plinko game bet	\N	2026-09-02 00:16:46.09051
3622	7	30	win	Plinko game payout	\N	2026-09-02 00:16:46.09051
3623	7	-100	loss	Plinko game bet	\N	2026-09-02 00:16:46.09051
3624	7	75	win	Plinko game payout	\N	2026-09-02 00:16:46.09051
3625	7	-100	loss	Plinko game bet	\N	2026-09-02 00:16:46.09051
3626	7	75	win	Plinko game payout	\N	2026-09-02 00:16:46.09051
3627	7	-100	loss	Plinko game bet	\N	2026-09-02 00:16:46.09051
3628	7	75	win	Plinko game payout	\N	2026-09-02 00:16:46.09051
3629	7	-100	loss	Plinko game bet	\N	2026-09-02 00:16:46.09051
3630	7	75	win	Plinko game payout	\N	2026-09-02 00:16:46.09051
3631	7	-100	loss	Plinko game bet	\N	2026-09-02 00:16:46.09051
3632	7	75	win	Plinko game payout	\N	2026-09-02 00:16:46.09051
3633	7	-100	loss	Plinko game bet	\N	2026-09-02 00:16:46.09051
3634	7	100	win	Plinko game payout	\N	2026-09-02 00:16:46.09051
3635	7	-100	loss	Plinko game bet	\N	2026-09-02 00:16:46.09051
3636	7	200	win	Plinko game payout	\N	2026-09-02 00:16:46.09051
3637	7	-100	loss	Plinko game bet	\N	2026-09-02 00:16:46.09051
3638	7	50	win	Plinko game payout	\N	2026-09-02 00:16:46.09051
3639	7	-100	loss	Plinko game bet	\N	2026-09-02 00:16:46.09051
3640	7	30	win	Plinko game payout	\N	2026-09-02 00:16:46.09051
3641	7	-100	loss	Plinko game bet	\N	2026-09-02 00:16:46.09051
3642	7	200	win	Plinko game payout	\N	2026-09-02 00:16:46.09051
3643	7	-100	loss	Plinko game bet	\N	2026-09-02 00:16:46.09051
3644	7	75	win	Plinko game payout	\N	2026-09-02 00:16:46.09051
3645	7	-100	loss	Plinko game bet	\N	2026-09-02 00:16:46.09051
3646	7	75	win	Plinko game payout	\N	2026-09-02 00:16:46.09051
3647	7	-100	loss	Plinko game bet	\N	2026-09-02 00:16:46.09051
3648	7	50	win	Plinko game payout	\N	2026-09-02 00:16:46.09051
3649	7	-100	loss	Plinko game bet	\N	2026-09-02 00:16:46.09051
3650	7	50	win	Plinko game payout	\N	2026-09-02 00:16:46.09051
3651	7	-100	loss	Plinko game bet	\N	2026-09-02 00:16:46.09051
3652	7	50	win	Plinko game payout	\N	2026-09-02 00:16:46.09051
3653	7	-100	loss	Plinko game bet	\N	2026-09-02 00:16:46.09051
3654	7	30	win	Plinko game payout	\N	2026-09-02 00:16:46.09051
3655	7	-100	loss	Plinko game bet	\N	2026-09-02 00:16:46.09051
3656	7	75	win	Plinko game payout	\N	2026-09-02 00:16:46.09051
3657	7	-100	loss	Plinko game bet	\N	2026-09-02 00:16:46.09051
3658	7	30	win	Plinko game payout	\N	2026-09-02 00:16:46.09051
3659	7	-100	loss	Plinko game bet	\N	2026-09-02 00:16:46.09051
3660	7	50	win	Plinko game payout	\N	2026-09-02 00:16:46.09051
3661	7	-100	loss	Plinko game bet	\N	2026-09-02 00:16:48.378433
3662	7	75	win	Plinko game payout	\N	2026-09-02 00:16:48.378433
3663	7	-100	loss	Plinko game bet	\N	2026-09-02 00:16:48.378433
3664	7	50	win	Plinko game payout	\N	2026-09-02 00:16:48.378433
3665	7	-100	loss	Plinko game bet	\N	2026-09-02 00:16:48.378433
3666	7	200	win	Plinko game payout	\N	2026-09-02 00:16:48.378433
3667	7	-100	loss	Plinko game bet	\N	2026-09-02 00:16:48.378433
3668	7	75	win	Plinko game payout	\N	2026-09-02 00:16:48.378433
3669	7	-100	loss	Plinko game bet	\N	2026-09-02 00:16:48.378433
3670	7	30	win	Plinko game payout	\N	2026-09-02 00:16:48.378433
3671	7	-100	loss	Plinko game bet	\N	2026-09-02 00:16:48.378433
3672	7	50	win	Plinko game payout	\N	2026-09-02 00:16:48.378433
3673	7	-100	loss	Plinko game bet	\N	2026-09-02 00:16:48.378433
3674	7	50	win	Plinko game payout	\N	2026-09-02 00:16:48.378433
3675	7	-100	loss	Plinko game bet	\N	2026-09-02 00:16:48.378433
3676	7	100	win	Plinko game payout	\N	2026-09-02 00:16:48.378433
3677	7	-100	loss	Plinko game bet	\N	2026-09-02 00:16:48.378433
3678	7	100	win	Plinko game payout	\N	2026-09-02 00:16:48.378433
3679	7	-100	loss	Plinko game bet	\N	2026-09-02 00:16:48.378433
3680	7	50	win	Plinko game payout	\N	2026-09-02 00:16:48.378433
3681	7	-100	loss	Plinko game bet	\N	2026-09-02 00:16:48.378433
3682	7	50	win	Plinko game payout	\N	2026-09-02 00:16:48.378433
3683	7	-100	loss	Plinko game bet	\N	2026-09-02 00:16:48.378433
3684	7	50	win	Plinko game payout	\N	2026-09-02 00:16:48.378433
3685	7	-100	loss	Plinko game bet	\N	2026-09-02 00:16:48.378433
3686	7	500	win	Plinko game payout	\N	2026-09-02 00:16:48.378433
3687	7	-100	loss	Plinko game bet	\N	2026-09-02 00:16:48.378433
3688	7	50	win	Plinko game payout	\N	2026-09-02 00:16:48.378433
3689	7	-100	loss	Plinko game bet	\N	2026-09-02 00:16:48.378433
3690	7	75	win	Plinko game payout	\N	2026-09-02 00:16:48.378433
3691	7	-100	loss	Plinko game bet	\N	2026-09-02 00:16:48.378433
3692	7	50	win	Plinko game payout	\N	2026-09-02 00:16:48.378433
3693	7	-100	loss	Plinko game bet	\N	2026-09-02 00:16:48.378433
3694	7	75	win	Plinko game payout	\N	2026-09-02 00:16:48.378433
3695	7	-100	loss	Plinko game bet	\N	2026-09-02 00:16:48.378433
3696	7	75	win	Plinko game payout	\N	2026-09-02 00:16:48.378433
3697	7	-100	loss	Plinko game bet	\N	2026-09-02 00:16:48.378433
3698	7	75	win	Plinko game payout	\N	2026-09-02 00:16:48.378433
3699	7	-100	loss	Plinko game bet	\N	2026-09-02 00:16:48.378433
3700	7	50	win	Plinko game payout	\N	2026-09-02 00:16:48.378433
3701	7	-100	loss	Plinko game bet	\N	2026-09-02 00:16:51.049514
3702	7	30	win	Plinko game payout	\N	2026-09-02 00:16:51.049514
3703	7	-100	loss	Plinko game bet	\N	2026-09-02 00:16:51.049514
3704	7	75	win	Plinko game payout	\N	2026-09-02 00:16:51.049514
3705	7	-100	loss	Plinko game bet	\N	2026-09-02 00:16:51.049514
3706	7	100	win	Plinko game payout	\N	2026-09-02 00:16:51.049514
3707	7	-100	loss	Plinko game bet	\N	2026-09-02 00:16:51.049514
3708	7	30	win	Plinko game payout	\N	2026-09-02 00:16:51.049514
3709	7	-100	loss	Plinko game bet	\N	2026-09-02 00:16:51.049514
3710	7	75	win	Plinko game payout	\N	2026-09-02 00:16:51.049514
3711	7	-100	loss	Plinko game bet	\N	2026-09-02 00:16:51.049514
3712	7	100	win	Plinko game payout	\N	2026-09-02 00:16:51.049514
3713	7	-100	loss	Plinko game bet	\N	2026-09-02 00:16:51.049514
3714	7	50	win	Plinko game payout	\N	2026-09-02 00:16:51.049514
3715	7	-100	loss	Plinko game bet	\N	2026-09-02 00:16:51.049514
3716	7	100	win	Plinko game payout	\N	2026-09-02 00:16:51.049514
3717	7	-100	loss	Plinko game bet	\N	2026-09-02 00:16:51.049514
3718	7	100	win	Plinko game payout	\N	2026-09-02 00:16:51.049514
3719	7	-100	loss	Plinko game bet	\N	2026-09-02 00:16:51.049514
3720	7	50	win	Plinko game payout	\N	2026-09-02 00:16:51.049514
3721	7	-100	loss	Plinko game bet	\N	2026-09-02 00:16:51.049514
3722	7	75	win	Plinko game payout	\N	2026-09-02 00:16:51.049514
3723	7	-100	loss	Plinko game bet	\N	2026-09-02 00:16:51.049514
3724	7	100	win	Plinko game payout	\N	2026-09-02 00:16:51.049514
3725	7	-100	loss	Plinko game bet	\N	2026-09-02 00:16:51.049514
3726	7	75	win	Plinko game payout	\N	2026-09-02 00:16:51.049514
3727	7	-100	loss	Plinko game bet	\N	2026-09-02 00:16:51.049514
3728	7	200	win	Plinko game payout	\N	2026-09-02 00:16:51.049514
3729	7	-100	loss	Plinko game bet	\N	2026-09-02 00:16:51.049514
3730	7	200	win	Plinko game payout	\N	2026-09-02 00:16:51.049514
3731	7	-100	loss	Plinko game bet	\N	2026-09-02 00:16:51.049514
3732	7	50	win	Plinko game payout	\N	2026-09-02 00:16:51.049514
3733	7	-100	loss	Plinko game bet	\N	2026-09-02 00:16:51.049514
3734	7	100	win	Plinko game payout	\N	2026-09-02 00:16:51.049514
3735	7	-100	loss	Plinko game bet	\N	2026-09-02 00:16:51.049514
3736	7	100	win	Plinko game payout	\N	2026-09-02 00:16:51.049514
3737	7	-100	loss	Plinko game bet	\N	2026-09-02 00:16:51.049514
3738	7	75	win	Plinko game payout	\N	2026-09-02 00:16:51.049514
3739	7	-100	loss	Plinko game bet	\N	2026-09-02 00:16:51.049514
3740	7	50	win	Plinko game payout	\N	2026-09-02 00:16:51.049514
3741	7	-100	loss	Plinko game bet	\N	2026-09-02 00:16:53.257551
3742	7	100	win	Plinko game payout	\N	2026-09-02 00:16:53.257551
3743	7	-100	loss	Plinko game bet	\N	2026-09-02 00:16:53.257551
3744	7	30	win	Plinko game payout	\N	2026-09-02 00:16:53.257551
3745	7	-100	loss	Plinko game bet	\N	2026-09-02 00:16:53.257551
3746	7	50	win	Plinko game payout	\N	2026-09-02 00:16:53.257551
3747	7	-100	loss	Plinko game bet	\N	2026-09-02 00:16:53.257551
3748	7	50	win	Plinko game payout	\N	2026-09-02 00:16:53.257551
3749	7	-100	loss	Plinko game bet	\N	2026-09-02 00:16:53.257551
3750	7	200	win	Plinko game payout	\N	2026-09-02 00:16:53.257551
3751	7	-100	loss	Plinko game bet	\N	2026-09-02 00:16:53.257551
3752	7	50	win	Plinko game payout	\N	2026-09-02 00:16:53.257551
3753	7	-100	loss	Plinko game bet	\N	2026-09-02 00:16:53.257551
3754	7	75	win	Plinko game payout	\N	2026-09-02 00:16:53.257551
3755	7	-100	loss	Plinko game bet	\N	2026-09-02 00:16:53.257551
3756	7	100	win	Plinko game payout	\N	2026-09-02 00:16:53.257551
3757	7	-100	loss	Plinko game bet	\N	2026-09-02 00:16:53.257551
3758	7	200	win	Plinko game payout	\N	2026-09-02 00:16:53.257551
3759	7	-100	loss	Plinko game bet	\N	2026-09-02 00:16:53.257551
3760	7	75	win	Plinko game payout	\N	2026-09-02 00:16:53.257551
3761	7	-100	loss	Plinko game bet	\N	2026-09-02 00:16:53.257551
3762	7	100	win	Plinko game payout	\N	2026-09-02 00:16:53.257551
3763	7	-100	loss	Plinko game bet	\N	2026-09-02 00:16:53.257551
3764	7	75	win	Plinko game payout	\N	2026-09-02 00:16:53.257551
3765	7	-100	loss	Plinko game bet	\N	2026-09-02 00:16:53.257551
3766	7	30	win	Plinko game payout	\N	2026-09-02 00:16:53.257551
3767	7	-100	loss	Plinko game bet	\N	2026-09-02 00:16:53.257551
3768	7	100	win	Plinko game payout	\N	2026-09-02 00:16:53.257551
3769	7	-100	loss	Plinko game bet	\N	2026-09-02 00:16:53.257551
3770	7	50	win	Plinko game payout	\N	2026-09-02 00:16:53.257551
3771	7	-100	loss	Plinko game bet	\N	2026-09-02 00:16:53.257551
3772	7	50	win	Plinko game payout	\N	2026-09-02 00:16:53.257551
3773	7	-100	loss	Plinko game bet	\N	2026-09-02 00:16:53.257551
3774	7	50	win	Plinko game payout	\N	2026-09-02 00:16:53.257551
3775	7	-100	loss	Plinko game bet	\N	2026-09-02 00:16:53.257551
3776	7	75	win	Plinko game payout	\N	2026-09-02 00:16:53.257551
3777	7	-100	loss	Plinko game bet	\N	2026-09-02 00:16:53.257551
3778	7	200	win	Plinko game payout	\N	2026-09-02 00:16:53.257551
3779	7	-100	loss	Plinko game bet	\N	2026-09-02 00:16:53.257551
3780	7	75	win	Plinko game payout	\N	2026-09-02 00:16:53.257551
3781	7	-100	loss	Plinko game bet	\N	2026-09-02 00:16:55.27539
3782	7	100	win	Plinko game payout	\N	2026-09-02 00:16:55.27539
3783	7	-100	loss	Plinko game bet	\N	2026-09-02 00:16:55.27539
3784	7	100	win	Plinko game payout	\N	2026-09-02 00:16:55.27539
3785	7	-100	loss	Plinko game bet	\N	2026-09-02 00:16:55.27539
3786	7	100	win	Plinko game payout	\N	2026-09-02 00:16:55.27539
3787	7	-100	loss	Plinko game bet	\N	2026-09-02 00:16:55.27539
3788	7	75	win	Plinko game payout	\N	2026-09-02 00:16:55.27539
3789	7	-100	loss	Plinko game bet	\N	2026-09-02 00:16:55.27539
3790	7	30	win	Plinko game payout	\N	2026-09-02 00:16:55.27539
3791	7	-100	loss	Plinko game bet	\N	2026-09-02 00:16:55.27539
3792	7	200	win	Plinko game payout	\N	2026-09-02 00:16:55.27539
3793	7	-100	loss	Plinko game bet	\N	2026-09-02 00:16:55.27539
3794	7	200	win	Plinko game payout	\N	2026-09-02 00:16:55.27539
3795	7	-100	loss	Plinko game bet	\N	2026-09-02 00:16:55.27539
3796	7	30	win	Plinko game payout	\N	2026-09-02 00:16:55.27539
3797	7	-100	loss	Plinko game bet	\N	2026-09-02 00:16:55.27539
3798	7	200	win	Plinko game payout	\N	2026-09-02 00:16:55.27539
3799	7	-100	loss	Plinko game bet	\N	2026-09-02 00:16:55.27539
3800	7	50	win	Plinko game payout	\N	2026-09-02 00:16:55.27539
3801	7	-100	loss	Plinko game bet	\N	2026-09-02 00:16:55.27539
3802	7	50	win	Plinko game payout	\N	2026-09-02 00:16:55.27539
3803	7	-100	loss	Plinko game bet	\N	2026-09-02 00:16:55.27539
3804	7	100	win	Plinko game payout	\N	2026-09-02 00:16:55.27539
3805	7	-100	loss	Plinko game bet	\N	2026-09-02 00:16:55.27539
3806	7	30	win	Plinko game payout	\N	2026-09-02 00:16:55.27539
3807	7	-100	loss	Plinko game bet	\N	2026-09-02 00:16:55.27539
3808	7	75	win	Plinko game payout	\N	2026-09-02 00:16:55.27539
3809	7	-100	loss	Plinko game bet	\N	2026-09-02 00:16:55.27539
3810	7	75	win	Plinko game payout	\N	2026-09-02 00:16:55.27539
3811	7	-100	loss	Plinko game bet	\N	2026-09-02 00:16:55.27539
3812	7	75	win	Plinko game payout	\N	2026-09-02 00:16:55.27539
3813	7	-100	loss	Plinko game bet	\N	2026-09-02 00:16:55.27539
3814	7	75	win	Plinko game payout	\N	2026-09-02 00:16:55.27539
3815	7	-100	loss	Plinko game bet	\N	2026-09-02 00:16:55.27539
3816	7	30	win	Plinko game payout	\N	2026-09-02 00:16:55.27539
3817	7	-100	loss	Plinko game bet	\N	2026-09-02 00:16:55.27539
3818	7	200	win	Plinko game payout	\N	2026-09-02 00:16:55.27539
3819	7	-100	loss	Plinko game bet	\N	2026-09-02 00:16:55.27539
3820	7	75	win	Plinko game payout	\N	2026-09-02 00:16:55.27539
3821	7	-100	loss	Plinko game bet	\N	2026-09-02 00:17:06.476244
3822	7	200	win	Plinko game payout	\N	2026-09-02 00:17:06.476244
3823	7	-100	loss	Plinko game bet	\N	2026-09-02 00:17:06.476244
3824	7	100	win	Plinko game payout	\N	2026-09-02 00:17:06.476244
3825	7	-100	loss	Plinko game bet	\N	2026-09-02 00:17:06.476244
3826	7	30	win	Plinko game payout	\N	2026-09-02 00:17:06.476244
3827	7	-100	loss	Plinko game bet	\N	2026-09-02 00:17:06.476244
3828	7	75	win	Plinko game payout	\N	2026-09-02 00:17:06.476244
3829	7	-100	loss	Plinko game bet	\N	2026-09-02 00:17:06.476244
3830	7	75	win	Plinko game payout	\N	2026-09-02 00:17:06.476244
3831	7	-100	loss	Plinko game bet	\N	2026-09-02 00:17:06.476244
3832	7	30	win	Plinko game payout	\N	2026-09-02 00:17:06.476244
3833	7	-100	loss	Plinko game bet	\N	2026-09-02 00:17:06.476244
3834	7	200	win	Plinko game payout	\N	2026-09-02 00:17:06.476244
3835	7	-100	loss	Plinko game bet	\N	2026-09-02 00:17:06.476244
3836	7	50	win	Plinko game payout	\N	2026-09-02 00:17:06.476244
3837	7	-100	loss	Plinko game bet	\N	2026-09-02 00:17:06.476244
3838	7	50	win	Plinko game payout	\N	2026-09-02 00:17:06.476244
3839	7	-100	loss	Plinko game bet	\N	2026-09-02 00:17:06.476244
3840	7	50	win	Plinko game payout	\N	2026-09-02 00:17:06.476244
3841	7	-100	loss	Plinko game bet	\N	2026-09-02 00:17:09.286718
3842	7	100	win	Plinko game payout	\N	2026-09-02 00:17:09.286718
3843	7	-100	loss	Plinko game bet	\N	2026-09-02 00:17:09.286718
3844	7	50	win	Plinko game payout	\N	2026-09-02 00:17:09.286718
3845	7	-100	loss	Plinko game bet	\N	2026-09-02 00:17:09.286718
3846	7	100	win	Plinko game payout	\N	2026-09-02 00:17:09.286718
3847	7	-100	loss	Plinko game bet	\N	2026-09-02 00:17:09.286718
3848	7	50	win	Plinko game payout	\N	2026-09-02 00:17:09.286718
3849	7	-100	loss	Plinko game bet	\N	2026-09-02 00:17:09.286718
3850	7	30	win	Plinko game payout	\N	2026-09-02 00:17:09.286718
3851	7	-100	loss	Plinko game bet	\N	2026-09-02 00:17:09.286718
3852	7	50	win	Plinko game payout	\N	2026-09-02 00:17:09.286718
3853	7	-100	loss	Plinko game bet	\N	2026-09-02 00:17:09.286718
3854	7	200	win	Plinko game payout	\N	2026-09-02 00:17:09.286718
3855	7	-100	loss	Plinko game bet	\N	2026-09-02 00:17:09.286718
3856	7	75	win	Plinko game payout	\N	2026-09-02 00:17:09.286718
3857	7	-100	loss	Plinko game bet	\N	2026-09-02 00:17:09.286718
3858	7	100	win	Plinko game payout	\N	2026-09-02 00:17:09.286718
3859	7	-100	loss	Plinko game bet	\N	2026-09-02 00:17:09.286718
3860	7	100	win	Plinko game payout	\N	2026-09-02 00:17:09.286718
3861	7	-100	loss	Plinko game bet	\N	2026-09-02 00:17:10.900013
3862	7	30	win	Plinko game payout	\N	2026-09-02 00:17:10.900013
3863	7	-100	loss	Plinko game bet	\N	2026-09-02 00:17:10.900013
3864	7	200	win	Plinko game payout	\N	2026-09-02 00:17:10.900013
3865	7	-100	loss	Plinko game bet	\N	2026-09-02 00:17:10.900013
3866	7	50	win	Plinko game payout	\N	2026-09-02 00:17:10.900013
3867	7	-100	loss	Plinko game bet	\N	2026-09-02 00:17:10.900013
3868	7	50	win	Plinko game payout	\N	2026-09-02 00:17:10.900013
3869	7	-100	loss	Plinko game bet	\N	2026-09-02 00:17:10.900013
3870	7	75	win	Plinko game payout	\N	2026-09-02 00:17:10.900013
3871	7	-100	loss	Plinko game bet	\N	2026-09-02 00:17:10.900013
3872	7	30	win	Plinko game payout	\N	2026-09-02 00:17:10.900013
3873	7	-100	loss	Plinko game bet	\N	2026-09-02 00:17:10.900013
3874	7	50	win	Plinko game payout	\N	2026-09-02 00:17:10.900013
3875	7	-100	loss	Plinko game bet	\N	2026-09-02 00:17:10.900013
3876	7	100	win	Plinko game payout	\N	2026-09-02 00:17:10.900013
3877	7	-100	loss	Plinko game bet	\N	2026-09-02 00:17:10.900013
3878	7	100	win	Plinko game payout	\N	2026-09-02 00:17:10.900013
3879	7	-100	loss	Plinko game bet	\N	2026-09-02 00:17:10.900013
3880	7	50	win	Plinko game payout	\N	2026-09-02 00:17:10.900013
3881	7	-100	loss	Plinko game bet	\N	2026-09-02 00:17:12.589213
3882	7	75	win	Plinko game payout	\N	2026-09-02 00:17:12.589213
3883	7	-100	loss	Plinko game bet	\N	2026-09-02 00:17:12.589213
3884	7	75	win	Plinko game payout	\N	2026-09-02 00:17:12.589213
3885	7	-100	loss	Plinko game bet	\N	2026-09-02 00:17:12.589213
3886	7	50	win	Plinko game payout	\N	2026-09-02 00:17:12.589213
3887	7	-100	loss	Plinko game bet	\N	2026-09-02 00:17:12.589213
3888	7	30	win	Plinko game payout	\N	2026-09-02 00:17:12.589213
3889	7	-100	loss	Plinko game bet	\N	2026-09-02 00:17:12.589213
3890	7	30	win	Plinko game payout	\N	2026-09-02 00:17:12.589213
3891	7	-100	loss	Plinko game bet	\N	2026-09-02 00:17:12.589213
3892	7	50	win	Plinko game payout	\N	2026-09-02 00:17:12.589213
3893	7	-100	loss	Plinko game bet	\N	2026-09-02 00:17:12.589213
3894	7	50	win	Plinko game payout	\N	2026-09-02 00:17:12.589213
3895	7	-100	loss	Plinko game bet	\N	2026-09-02 00:17:12.589213
3896	7	75	win	Plinko game payout	\N	2026-09-02 00:17:12.589213
3897	7	-100	loss	Plinko game bet	\N	2026-09-02 00:17:12.589213
3898	7	50	win	Plinko game payout	\N	2026-09-02 00:17:12.589213
3899	7	-100	loss	Plinko game bet	\N	2026-09-02 00:17:12.589213
3900	7	200	win	Plinko game payout	\N	2026-09-02 00:17:12.589213
3901	7	-100	loss	Plinko game bet	\N	2026-09-02 00:17:14.273553
3902	7	75	win	Plinko game payout	\N	2026-09-02 00:17:14.273553
3903	7	-100	loss	Plinko game bet	\N	2026-09-02 00:17:14.273553
3904	7	200	win	Plinko game payout	\N	2026-09-02 00:17:14.273553
3905	7	-100	loss	Plinko game bet	\N	2026-09-02 00:17:14.273553
3906	7	75	win	Plinko game payout	\N	2026-09-02 00:17:14.273553
3907	7	-100	loss	Plinko game bet	\N	2026-09-02 00:17:14.273553
3908	7	75	win	Plinko game payout	\N	2026-09-02 00:17:14.273553
3909	7	-100	loss	Plinko game bet	\N	2026-09-02 00:17:14.273553
3910	7	75	win	Plinko game payout	\N	2026-09-02 00:17:14.273553
3911	7	-100	loss	Plinko game bet	\N	2026-09-02 00:17:14.273553
3912	7	50	win	Plinko game payout	\N	2026-09-02 00:17:14.273553
3913	7	-100	loss	Plinko game bet	\N	2026-09-02 00:17:14.273553
3914	7	30	win	Plinko game payout	\N	2026-09-02 00:17:14.273553
3915	7	-100	loss	Plinko game bet	\N	2026-09-02 00:17:14.273553
3916	7	100	win	Plinko game payout	\N	2026-09-02 00:17:14.273553
3917	7	-100	loss	Plinko game bet	\N	2026-09-02 00:17:14.273553
3918	7	30	win	Plinko game payout	\N	2026-09-02 00:17:14.273553
3919	7	-100	loss	Plinko game bet	\N	2026-09-02 00:17:14.273553
3920	7	100	win	Plinko game payout	\N	2026-09-02 00:17:14.273553
3921	7	-100	loss	Plinko game bet	\N	2026-09-02 00:17:19.053352
3922	7	50	win	Plinko game payout	\N	2026-09-02 00:17:19.053352
3923	7	-600	loss	Plinko game bet	\N	2026-09-02 00:17:24.837296
3924	7	450	win	Plinko game payout	\N	2026-09-02 00:17:24.837296
3925	7	-600	loss	Plinko game bet	\N	2026-09-02 00:17:27.557545
3926	7	450	win	Plinko game payout	\N	2026-09-02 00:17:27.557545
3927	7	-500	loss	Plinko game bet	\N	2026-09-02 00:17:31.153944
3928	7	1000	win	Plinko game payout	\N	2026-09-02 00:17:31.153944
3929	7	-1000	loss	Plinko game bet	\N	2026-09-02 00:17:37.770132
3930	7	1000	win	Plinko game payout	\N	2026-09-02 00:17:37.770132
3931	7	-1000	loss	Plinko game bet	\N	2026-09-02 00:17:42.643929
3932	7	1000	win	Plinko game payout	\N	2026-09-02 00:17:42.643929
3933	7	-1000	loss	Plinko game bet	\N	2026-09-02 00:17:44.995157
3934	7	750	win	Plinko game payout	\N	2026-09-02 00:17:44.995157
3935	7	-700	loss	Plinko game bet	\N	2026-09-02 00:17:52.887385
3936	7	210	win	Plinko game payout	\N	2026-09-02 00:17:52.887385
3937	7	-100	loss	Plinko game bet	\N	2026-09-02 00:18:05.475126
3938	7	50	win	Plinko game payout	\N	2026-09-02 00:18:05.475126
3939	7	-100	loss	Plinko game bet	\N	2026-09-02 00:18:08.083533
3940	7	30	win	Plinko game payout	\N	2026-09-02 00:18:08.083533
3941	7	-100	loss	Plinko game bet	\N	2026-09-02 00:18:10.701239
3942	7	100	win	Plinko game payout	\N	2026-09-02 00:18:10.701239
3943	7	-100	loss	Plinko game bet	\N	2026-09-02 00:18:12.635064
3944	7	200	win	Plinko game payout	\N	2026-09-02 00:18:12.635064
3945	7	-100	loss	Plinko game bet	\N	2026-09-02 00:18:12.766176
3946	7	200	win	Plinko game payout	\N	2026-09-02 00:18:12.766176
3947	7	-100	loss	Plinko game bet	\N	2026-09-02 00:24:27.893782
3948	7	200	win	Plinko game payout	\N	2026-09-02 00:24:27.893782
\.


--
-- Data for Name: uploaded_images; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.uploaded_images (id, filename, mime_type, data, created_at) FROM stdin;
\.


--
-- Data for Name: user_ips; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.user_ips (id, user_id, ip, logged_at) FROM stdin;
1	2	127.0.0.1	2026-04-19 18:23:18.25647
2	2	127.0.0.1	2026-04-19 18:23:56.640146
3	2	127.0.0.1	2026-04-19 18:24:03.753027
4	2	127.0.0.1	2026-04-19 19:07:57.30929
5	7	38.68.134.29	2026-06-23 15:18:41.026509
6	7	38.68.134.29	2026-06-24 13:39:56.246867
7	7	38.68.134.29	2026-06-28 23:05:08.534857
8	7	38.68.134.29	2026-06-28 23:38:00.872032
9	7	38.68.134.29	2026-06-28 23:41:55.951437
10	7	38.68.134.29	2026-06-29 06:52:03.201394
11	7	66.9.166.107	2026-07-08 16:59:37.062907
12	14	172.219.87.189	2026-07-16 18:47:35.855119
13	18	162.157.98.241	2026-08-16 18:08:51.695438
14	7	66.9.166.230	2026-08-21 20:36:50.82849
15	7	66.9.166.230	2026-08-22 02:18:59.900298
16	7	66.9.166.230	2026-08-22 04:12:36.144042
17	7	134.82.68.163	2026-08-23 19:23:02.241642
18	7	74.244.163.162	2026-08-24 04:46:58.424063
19	7	74.244.163.162	2026-08-24 14:27:27.859781
20	7	149.88.25.133	2026-08-24 18:10:09.371776
21	18	162.157.98.241	2026-08-30 23:40:50.879977
22	7	66.9.166.41	2026-09-01 00:26:46.532942
23	7	153.67.55.206	2026-09-03 17:33:38.904564
\.


--
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.users (id, username, password, email, telegram_username, role, is_banned, balance, protected_balance, last_daily_spin, created_at, is_seller, seller_balance, total_seller_earned, login_code, seller_type, seller_display_name, telegram_id, telegram_connected, referral_code, is_worker, telegram_chat_id, last_telegram_name_reward, telegram_referred_by, telegram_referral_bonus_paid, telegram_name_active, telegram_name_signature) FROM stdin;
18	noitactv	5ff50f85afbd6f8d657cb3f0fe07fcf9d3e7e997eeb76013645da0d5850042cbd69b92b47fda544ee841271bdece63cc2cc99b9abbfc974241faad008c529e2c.62950648414c3c945f23285630f0b3a0	noitactv@gmail.com	vehicuh	admin	f	25	0	\N	2026-07-16 19:41:44.238622	f	0	0		bronze		\N	f	\N	f	8770123112	2026-08-16 21:01:40.954013	\N	f	f	
5	anon_9c8037a950		anon_9c8037a950@acctplug.fo		admin	f	0	0	\N	2026-06-04 04:38:25.462895	f	0	0	WF87883E9KVB	bronze		\N	f	\N	f	\N	\N	\N	f	f	
8	anon-7ae62b56	e18e862e0fccbca7e3861cf72de99f0a8d6d20c92d23f8fdaaf5ab74a025ff8914377a956355da60ace0f78baa740f11538f700b6340958ff71dd36bdd5cae08.927ae0f4f995144cf59698f097bc35e9	ashhtentv@gmail.com		user	f	0	0	\N	2026-06-23 18:55:07.384372	f	0	0		bronze		\N	f	\N	f	\N	\N	\N	f	f	
9	anon-b94fd1ec	afd224b8bae381d1498e3e64bf34d36799dd1478d9f2bc84851473cb86c9ed16ad0a6cdc413941d5094d82a2fb0e7ac38dd8fada411cfd752941e52d8931e57f.475f172efff0c273d1f4ae56f11e4775	agenttest@test.com		user	f	0	0	\N	2026-07-08 16:36:33.61545	f	0	0		bronze		\N	f	\N	f	\N	\N	\N	f	f	
1	admin	ce6bb8cbb02a0c68f1b26a8362a9afccdae1a4fe421cb8ce4dc65273d870400937122c363af128c4510a04cb741b710bc31b7f45bb8ee2af154788d72dfbc676.676faed1237ae612f4c5d3d7136b3fa8	admin@store.com		admin	f	0	0	\N	2026-04-18 15:30:50.926034	f	0	0	ZQWWXU7NF7K4	bronze		\N	f	C823BC69	f	\N	\N	\N	f	f	
2	demo	be40442ba685f1dc0670678c57b8dbe8738bbd7a40f143744c8d2b0b7d4ba5faa709c069cda03fed984b891296053adaa4401c94bf0ea74f343b5c7af547eedc.dd9e50d2f853b696eda02746a2dee38d	demo@user.com		user	f	0	0	\N	2026-04-18 15:30:50.97721	f	0	0	AL3ZPCFS2QEJ	bronze		\N	f	10F9468E	f	\N	\N	\N	f	f	
3	Test	8844f4b4b275f2b52aa05c07a34d1c1db6ae113bf1c7dae95b8f7722017d0a4a0c8192d796e45052916c73dd8e372f98ef952718f84e01c93cdb7a1324f9b82f.37823707ace6f1d454277b9a2a892450	Lifeanime886@gmail.com	Test	admin	f	0	0	\N	2026-05-01 01:11:50.062547	t	0	0	EEMVGYV24RUB	bronze		\N	f	123C80C9	f	\N	\N	\N	f	f	
4	Lifeanime8864393f4		lifeanime886@gmail.com		admin	f	0	0	\N	2026-05-02 15:01:37.2584	t	0	0	R5N5MH2FSK4P	bronze		\N	f	25EDD550	f	\N	\N	\N	f	f	
6	anon_9be1d90039		anon_9be1d90039@gmail.com		user	f	0	0	\N	2026-06-04 05:14:47.626397	f	0	0	RMN6944TVGL5	bronze		\N	f	\N	f	\N	\N	\N	f	f	
31	anon-d1874081	ea12975f3343621c7c17de759068d1607900051135c09dbb457d2234eb39169c97160ac8b0d4cd46043ebb1e8fffafe85d2a51f21354efed3dc9822467c8ba0c.8f7083bc4ec1b8698e7a477b097d7c76	bobfreak199@gmail.com		user	f	0	0	\N	2026-08-16 03:24:36.84066	f	0	0		bronze		\N	f	\N	f	\N	\N	\N	f	f	
13	anon-8a0c1095	9db7e113c95a32fa89699716c1eab58d4d63ee070c37ef6a93143c96d9da54e48f37d7d7b3f352a4e47e429b4b14cab103cbc540c667eb187070bea535c1345a.3237f46d4f4191fad30b83da8ef3c3a8	testuser_dep@example.com		user	f	0	0	\N	2026-07-08 17:23:54.568698	f	0	0		bronze		\N	f	\N	f	\N	\N	\N	f	f	
14	anon-0acac48b	7157a4a0b740758cb4eb088dbacf511dc2554c99c92c913decee926cc55a43fa347933178a3e28080fcc330cefd14212cdf501106cb4b2b87ad21b14ede740a0.2c62189d74a8fda2e548eb8ce63841ba	noitactv@icloud.com		user	f	0	0	\N	2026-07-16 18:47:28.370192	f	0	0		bronze		\N	f	\N	f	\N	\N	\N	f	f	
7	anon-a396dd12	f40abe1a5e7b5ce147edc37b832bbd4a4505d3715112bac2fe66846cd5f7062c03d9f8393df393edea1199b5ac7807eee5290c0fbbccff095b711ad341bbaa73.a21ee2a5e9c03cbe3ecbb778ff1d240b	borelandomario8@gmail.com		admin	f	450	0	\N	2026-06-23 14:24:52.66251	f	0	0		bronze		\N	f	\N	f	\N	\N	\N	f	f	
\.


--
-- Data for Name: variants; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.variants (id, product_id, name, price, min_quantity, compare_price) FROM stdin;
6	6	121	100	1	\N
\.


--
-- Data for Name: verifications; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.verifications (id, user_id, telegram_username, channel_link, channel_name, agreed_to_terms, status, admin_note, term_message, created_at) FROM stdin;
\.


--
-- Name: achs_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.achs_id_seq', 1, true);


--
-- Name: announcements_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.announcements_id_seq', 1, false);


--
-- Name: bank_routing_items_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.bank_routing_items_id_seq', 1, false);


--
-- Name: card_bases_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.card_bases_id_seq', 1, true);


--
-- Name: card_metadata_fixtures_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.card_metadata_fixtures_id_seq', 1, false);


--
-- Name: cards_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.cards_id_seq', 25, true);


--
-- Name: crypto_addresses_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.crypto_addresses_id_seq', 1, false);


--
-- Name: crypto_currencies_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.crypto_currencies_id_seq', 841, true);


--
-- Name: crypto_payments_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.crypto_payments_id_seq', 8, true);


--
-- Name: discount_codes_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.discount_codes_id_seq', 1, true);


--
-- Name: mail_reads_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.mail_reads_id_seq', 1, false);


--
-- Name: mails_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.mails_id_seq', 1, false);


--
-- Name: order_items_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.order_items_id_seq', 18, true);


--
-- Name: orders_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.orders_id_seq', 41, true);


--
-- Name: product_categories_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.product_categories_id_seq', 3, true);


--
-- Name: products_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.products_id_seq', 9, true);


--
-- Name: redeem_codes_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.redeem_codes_id_seq', 2, true);


--
-- Name: referral_usages_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.referral_usages_id_seq', 1, false);


--
-- Name: seller_applications_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.seller_applications_id_seq', 2, true);


--
-- Name: stock_items_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.stock_items_id_seq', 6, true);


--
-- Name: support_tickets_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.support_tickets_id_seq', 3, true);


--
-- Name: telegram_link_tokens_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.telegram_link_tokens_id_seq', 5, true);


--
-- Name: transactions_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.transactions_id_seq', 3948, true);


--
-- Name: uploaded_images_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.uploaded_images_id_seq', 1, false);


--
-- Name: user_ips_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.user_ips_id_seq', 23, true);


--
-- Name: users_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.users_id_seq', 31, true);


--
-- Name: variants_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.variants_id_seq', 6, true);


--
-- Name: verifications_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.verifications_id_seq', 1, false);


--
-- Name: achs achs_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.achs
    ADD CONSTRAINT achs_pkey PRIMARY KEY (id);


--
-- Name: announcements announcements_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.announcements
    ADD CONSTRAINT announcements_pkey PRIMARY KEY (id);


--
-- Name: bank_routing_items bank_routing_items_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.bank_routing_items
    ADD CONSTRAINT bank_routing_items_pkey PRIMARY KEY (id);


--
-- Name: bank_routing_items bank_routing_items_routing_number_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.bank_routing_items
    ADD CONSTRAINT bank_routing_items_routing_number_key UNIQUE (routing_number);


--
-- Name: card_bases card_bases_name_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.card_bases
    ADD CONSTRAINT card_bases_name_key UNIQUE (name);


--
-- Name: card_bases card_bases_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.card_bases
    ADD CONSTRAINT card_bases_pkey PRIMARY KEY (id);


--
-- Name: card_metadata_fixtures card_metadata_fixtures_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.card_metadata_fixtures
    ADD CONSTRAINT card_metadata_fixtures_pkey PRIMARY KEY (id);


--
-- Name: cards cards_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.cards
    ADD CONSTRAINT cards_pkey PRIMARY KEY (id);


--
-- Name: crypto_addresses crypto_addresses_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.crypto_addresses
    ADD CONSTRAINT crypto_addresses_pkey PRIMARY KEY (id);


--
-- Name: crypto_addresses crypto_addresses_user_id_currency_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.crypto_addresses
    ADD CONSTRAINT crypto_addresses_user_id_currency_key UNIQUE (user_id, currency);


--
-- Name: crypto_currencies crypto_currencies_code_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.crypto_currencies
    ADD CONSTRAINT crypto_currencies_code_key UNIQUE (code);


--
-- Name: crypto_currencies crypto_currencies_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.crypto_currencies
    ADD CONSTRAINT crypto_currencies_pkey PRIMARY KEY (id);


--
-- Name: crypto_payments crypto_payments_forebit_payment_id_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.crypto_payments
    ADD CONSTRAINT crypto_payments_forebit_payment_id_key UNIQUE (forebit_payment_id);


--
-- Name: crypto_payments crypto_payments_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.crypto_payments
    ADD CONSTRAINT crypto_payments_pkey PRIMARY KEY (id);


--
-- Name: discount_codes discount_codes_code_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.discount_codes
    ADD CONSTRAINT discount_codes_code_key UNIQUE (code);


--
-- Name: discount_codes discount_codes_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.discount_codes
    ADD CONSTRAINT discount_codes_pkey PRIMARY KEY (id);


--
-- Name: mail_reads mail_reads_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.mail_reads
    ADD CONSTRAINT mail_reads_pkey PRIMARY KEY (id);


--
-- Name: mails mails_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.mails
    ADD CONSTRAINT mails_pkey PRIMARY KEY (id);


--
-- Name: order_items order_items_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.order_items
    ADD CONSTRAINT order_items_pkey PRIMARY KEY (id);


--
-- Name: orders orders_order_id_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.orders
    ADD CONSTRAINT orders_order_id_key UNIQUE (order_id);


--
-- Name: orders orders_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.orders
    ADD CONSTRAINT orders_pkey PRIMARY KEY (id);


--
-- Name: product_categories product_categories_normalized_name_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.product_categories
    ADD CONSTRAINT product_categories_normalized_name_key UNIQUE (normalized_name);


--
-- Name: product_categories product_categories_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.product_categories
    ADD CONSTRAINT product_categories_pkey PRIMARY KEY (id);


--
-- Name: products products_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.products
    ADD CONSTRAINT products_pkey PRIMARY KEY (id);


--
-- Name: redeem_codes redeem_codes_code_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.redeem_codes
    ADD CONSTRAINT redeem_codes_code_key UNIQUE (code);


--
-- Name: redeem_codes redeem_codes_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.redeem_codes
    ADD CONSTRAINT redeem_codes_pkey PRIMARY KEY (id);


--
-- Name: referral_usages referral_usages_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.referral_usages
    ADD CONSTRAINT referral_usages_pkey PRIMARY KEY (id);


--
-- Name: referral_usages referral_usages_redeemer_code_unique; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.referral_usages
    ADD CONSTRAINT referral_usages_redeemer_code_unique UNIQUE (redeemer_id, code);


--
-- Name: seller_applications seller_applications_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.seller_applications
    ADD CONSTRAINT seller_applications_pkey PRIMARY KEY (id);


--
-- Name: seller_applications seller_applications_seller_code_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.seller_applications
    ADD CONSTRAINT seller_applications_seller_code_key UNIQUE (seller_code);


--
-- Name: session session_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.session
    ADD CONSTRAINT session_pkey PRIMARY KEY (sid);


--
-- Name: site_settings site_settings_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.site_settings
    ADD CONSTRAINT site_settings_pkey PRIMARY KEY (key);


--
-- Name: stock_items stock_items_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.stock_items
    ADD CONSTRAINT stock_items_pkey PRIMARY KEY (id);


--
-- Name: support_tickets support_tickets_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.support_tickets
    ADD CONSTRAINT support_tickets_pkey PRIMARY KEY (id);


--
-- Name: telegram_link_tokens telegram_link_tokens_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.telegram_link_tokens
    ADD CONSTRAINT telegram_link_tokens_pkey PRIMARY KEY (id);


--
-- Name: telegram_link_tokens telegram_link_tokens_token_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.telegram_link_tokens
    ADD CONSTRAINT telegram_link_tokens_token_key UNIQUE (token);


--
-- Name: telegram_referral_pending telegram_referral_pending_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.telegram_referral_pending
    ADD CONSTRAINT telegram_referral_pending_pkey PRIMARY KEY (chat_id);


--
-- Name: transactions transactions_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.transactions
    ADD CONSTRAINT transactions_pkey PRIMARY KEY (id);


--
-- Name: uploaded_images uploaded_images_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.uploaded_images
    ADD CONSTRAINT uploaded_images_pkey PRIMARY KEY (id);


--
-- Name: user_ips user_ips_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_ips
    ADD CONSTRAINT user_ips_pkey PRIMARY KEY (id);


--
-- Name: users users_email_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key UNIQUE (email);


--
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);


--
-- Name: users users_referral_code_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_referral_code_key UNIQUE (referral_code);


--
-- Name: users users_telegram_id_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_telegram_id_key UNIQUE (telegram_id);


--
-- Name: users users_username_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_username_key UNIQUE (username);


--
-- Name: variants variants_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.variants
    ADD CONSTRAINT variants_pkey PRIMARY KEY (id);


--
-- Name: verifications verifications_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.verifications
    ADD CONSTRAINT verifications_pkey PRIMARY KEY (id);


--
-- Name: verifications verifications_user_id_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.verifications
    ADD CONSTRAINT verifications_user_id_key UNIQUE (user_id);


--
-- Name: IDX_cards_available_bin_prefix; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "IDX_cards_available_bin_prefix" ON public.cards USING btree (card_number text_pattern_ops) WHERE (is_sold = false);


--
-- Name: IDX_cards_number_fingerprint; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "IDX_cards_number_fingerprint" ON public.cards USING btree (regexp_replace(card_number, '\D'::text, ''::text, 'g'::text));


--
-- Name: IDX_session_expire; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "IDX_session_expire" ON public.session USING btree (expire);


--
-- Name: achs achs_seller_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.achs
    ADD CONSTRAINT achs_seller_id_fkey FOREIGN KEY (seller_id) REFERENCES public.users(id);


--
-- Name: bank_routing_items bank_routing_items_purchased_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.bank_routing_items
    ADD CONSTRAINT bank_routing_items_purchased_by_fkey FOREIGN KEY (purchased_by) REFERENCES public.users(id);


--
-- Name: cards cards_base_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.cards
    ADD CONSTRAINT cards_base_id_fkey FOREIGN KEY (base_id) REFERENCES public.card_bases(id);


--
-- Name: cards cards_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.cards
    ADD CONSTRAINT cards_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id);


--
-- Name: crypto_addresses crypto_addresses_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.crypto_addresses
    ADD CONSTRAINT crypto_addresses_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id);


--
-- Name: crypto_payments crypto_payments_order_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.crypto_payments
    ADD CONSTRAINT crypto_payments_order_id_fkey FOREIGN KEY (order_id) REFERENCES public.orders(id);


--
-- Name: crypto_payments crypto_payments_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.crypto_payments
    ADD CONSTRAINT crypto_payments_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id);


--
-- Name: mail_reads mail_reads_mail_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.mail_reads
    ADD CONSTRAINT mail_reads_mail_id_fkey FOREIGN KEY (mail_id) REFERENCES public.mails(id);


--
-- Name: mail_reads mail_reads_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.mail_reads
    ADD CONSTRAINT mail_reads_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id);


--
-- Name: mails mails_sender_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.mails
    ADD CONSTRAINT mails_sender_id_fkey FOREIGN KEY (sender_id) REFERENCES public.users(id);


--
-- Name: order_items order_items_card_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.order_items
    ADD CONSTRAINT order_items_card_id_fkey FOREIGN KEY (card_id) REFERENCES public.cards(id);


--
-- Name: order_items order_items_order_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.order_items
    ADD CONSTRAINT order_items_order_id_fkey FOREIGN KEY (order_id) REFERENCES public.orders(id);


--
-- Name: order_items order_items_stock_item_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.order_items
    ADD CONSTRAINT order_items_stock_item_id_fkey FOREIGN KEY (stock_item_id) REFERENCES public.stock_items(id);


--
-- Name: orders orders_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.orders
    ADD CONSTRAINT orders_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id);


--
-- Name: redeem_codes redeem_codes_used_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.redeem_codes
    ADD CONSTRAINT redeem_codes_used_by_fkey FOREIGN KEY (used_by) REFERENCES public.users(id);


--
-- Name: referral_usages referral_usages_redeemer_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.referral_usages
    ADD CONSTRAINT referral_usages_redeemer_id_fkey FOREIGN KEY (redeemer_id) REFERENCES public.users(id);


--
-- Name: referral_usages referral_usages_referrer_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.referral_usages
    ADD CONSTRAINT referral_usages_referrer_id_fkey FOREIGN KEY (referrer_id) REFERENCES public.users(id);


--
-- Name: seller_applications seller_applications_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.seller_applications
    ADD CONSTRAINT seller_applications_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id);


--
-- Name: stock_items stock_items_seller_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.stock_items
    ADD CONSTRAINT stock_items_seller_id_fkey FOREIGN KEY (seller_id) REFERENCES public.users(id);


--
-- Name: stock_items stock_items_variant_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.stock_items
    ADD CONSTRAINT stock_items_variant_id_fkey FOREIGN KEY (variant_id) REFERENCES public.variants(id);


--
-- Name: support_tickets support_tickets_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.support_tickets
    ADD CONSTRAINT support_tickets_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id);


--
-- Name: telegram_link_tokens telegram_link_tokens_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.telegram_link_tokens
    ADD CONSTRAINT telegram_link_tokens_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: transactions transactions_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.transactions
    ADD CONSTRAINT transactions_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id);


--
-- Name: user_ips user_ips_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_ips
    ADD CONSTRAINT user_ips_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id);


--
-- Name: users users_telegram_referred_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_telegram_referred_by_fkey FOREIGN KEY (telegram_referred_by) REFERENCES public.users(id);


--
-- Name: variants variants_product_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.variants
    ADD CONSTRAINT variants_product_id_fkey FOREIGN KEY (product_id) REFERENCES public.products(id);


--
-- Name: verifications verifications_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.verifications
    ADD CONSTRAINT verifications_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id);


--
-- PostgreSQL database dump complete
--

\unrestrict z3zpvzI93QahSkxRlxzevx9yAriqYgfYIj5sMJwlGJxuEwQgsxGhuUbZe9dtBeV

