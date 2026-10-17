import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_services_type" AS ENUM('liturgy', 'vigil', 'vespers', 'matins', 'moleben', 'panikhida', 'akathist', 'sacrament', 'other');
  CREATE TYPE "public"."enum_services_status" AS ENUM('scheduled', 'cancelled', 'moved');
  CREATE TYPE "public"."enum_services_feast_rank" AS ENUM('none', 'great', 'twelve');
  CREATE TYPE "public"."enum_schedule_templates_weekday" AS ENUM('1', '2', '3', '4', '5', '6', '7');
  CREATE TYPE "public"."enum_schedule_templates_type" AS ENUM('liturgy', 'vigil', 'vespers', 'matins', 'moleben', 'panikhida', 'akathist', 'sacrament', 'other');
  CREATE TYPE "public"."enum_service_titles_type" AS ENUM('liturgy', 'vigil', 'vespers', 'matins', 'moleben', 'panikhida', 'akathist', 'sacrament', 'other');
  CREATE TYPE "public"."enum_posts_category" AS ENUM('obyavlenie', 'sobytie', 'propoved', 'prihod');
  CREATE TYPE "public"."enum_posts_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum__posts_v_version_category" AS ENUM('obyavlenie', 'sobytie', 'propoved', 'prihod');
  CREATE TYPE "public"."enum__posts_v_version_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum_albums_type" AS ENUM('bogosluzhenie', 'prazdnik', 'istoriya', 'prihod', 'istoricheskie');
  CREATE TYPE "public"."enum_albums_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum__albums_v_version_type" AS ENUM('bogosluzhenie', 'prazdnik', 'istoriya', 'prihod', 'istoricheskie');
  CREATE TYPE "public"."enum__albums_v_version_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum_requests_type" AS ENUM('zapiska', 'tainstvo', 'vopros');
  CREATE TYPE "public"."enum_requests_status" AS ENUM('new', 'progress', 'done');
  CREATE TYPE "public"."enum_churches_color" AS ENUM('nina', 'stena', 'gold');
  CREATE TYPE "public"."enum__churches_v_version_color" AS ENUM('nina', 'stena', 'gold');
  CREATE TYPE "public"."enum_pages_blocks_callout_tone" AS ENUM('gold', 'lazur');
  CREATE TYPE "public"."enum_pages_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum__pages_v_blocks_callout_tone" AS ENUM('gold', 'lazur');
  CREATE TYPE "public"."enum__pages_v_version_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum_users_role" AS ENUM('admin', 'editor', 'clergy');
  CREATE TYPE "public"."enum_audit_log_action" AS ENUM('create', 'update', 'publish', 'trash', 'delete');
  CREATE TYPE "public"."enum_payload_jobs_log_task_slug" AS ENUM('inline', 'schedulePublish');
  CREATE TYPE "public"."enum_payload_jobs_log_state" AS ENUM('failed', 'succeeded');
  CREATE TYPE "public"."enum_payload_jobs_task_slug" AS ENUM('inline', 'schedulePublish');
  CREATE TABLE "services" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"date" timestamp(3) with time zone NOT NULL,
  	"time" varchar NOT NULL,
  	"church_id" integer NOT NULL,
  	"preset_id" integer,
  	"title" varchar,
  	"type" "enum_services_type" DEFAULT 'other',
  	"status" "enum_services_status" DEFAULT 'scheduled',
  	"feast" varchar,
  	"feast_rank" "enum_services_feast_rank" DEFAULT 'none',
  	"celebrant_id" integer,
  	"note" varchar,
  	"published" boolean DEFAULT true,
  	"label" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "schedule_templates" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"weekday" "enum_schedule_templates_weekday" NOT NULL,
  	"time" varchar NOT NULL,
  	"church_id" integer NOT NULL,
  	"preset_id" integer,
  	"title" varchar,
  	"type" "enum_schedule_templates_type" DEFAULT 'other',
  	"note" varchar,
  	"active" boolean DEFAULT true,
  	"label" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "service_titles" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"title" varchar NOT NULL,
  	"type" "enum_service_titles_type" NOT NULL,
  	"order" numeric DEFAULT 0,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "posts" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"title" varchar,
  	"lead" varchar,
  	"cover_id" integer,
  	"content" jsonb,
  	"album_id" integer,
  	"category" "enum_posts_category" DEFAULT 'obyavlenie',
  	"church_id" integer,
  	"published_at" timestamp(3) with time zone,
  	"send_to_telegram" boolean DEFAULT false,
  	"telegram_sent_at" timestamp(3) with time zone,
  	"slug" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"deleted_at" timestamp(3) with time zone,
  	"_status" "enum_posts_status" DEFAULT 'draft'
  );
  
  CREATE TABLE "_posts_v" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"parent_id" integer,
  	"version_title" varchar,
  	"version_lead" varchar,
  	"version_cover_id" integer,
  	"version_content" jsonb,
  	"version_album_id" integer,
  	"version_category" "enum__posts_v_version_category" DEFAULT 'obyavlenie',
  	"version_church_id" integer,
  	"version_published_at" timestamp(3) with time zone,
  	"version_send_to_telegram" boolean DEFAULT false,
  	"version_telegram_sent_at" timestamp(3) with time zone,
  	"version_slug" varchar,
  	"version_updated_at" timestamp(3) with time zone,
  	"version_created_at" timestamp(3) with time zone,
  	"version_deleted_at" timestamp(3) with time zone,
  	"version__status" "enum__posts_v_version_status" DEFAULT 'draft',
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"latest" boolean,
  	"autosave" boolean
  );
  
  CREATE TABLE "albums" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"title" varchar,
  	"date" timestamp(3) with time zone,
  	"type" "enum_albums_type" DEFAULT 'bogosluzhenie',
  	"church_id" integer,
  	"description" varchar,
  	"cover_id" integer,
  	"allow_download" boolean DEFAULT false,
  	"slug" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"deleted_at" timestamp(3) with time zone,
  	"_status" "enum_albums_status" DEFAULT 'draft'
  );
  
  CREATE TABLE "albums_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"media_id" integer
  );
  
  CREATE TABLE "_albums_v" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"parent_id" integer,
  	"version_title" varchar,
  	"version_date" timestamp(3) with time zone,
  	"version_type" "enum__albums_v_version_type" DEFAULT 'bogosluzhenie',
  	"version_church_id" integer,
  	"version_description" varchar,
  	"version_cover_id" integer,
  	"version_allow_download" boolean DEFAULT false,
  	"version_slug" varchar,
  	"version_updated_at" timestamp(3) with time zone,
  	"version_created_at" timestamp(3) with time zone,
  	"version_deleted_at" timestamp(3) with time zone,
  	"version__status" "enum__albums_v_version_status" DEFAULT 'draft',
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"latest" boolean
  );
  
  CREATE TABLE "_albums_v_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"media_id" integer
  );
  
  CREATE TABLE "media" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"alt" varchar,
  	"caption" varchar,
  	"author" varchar,
  	"year" varchar,
  	"source" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"url" varchar,
  	"thumbnail_u_r_l" varchar,
  	"filename" varchar,
  	"mime_type" varchar,
  	"filesize" numeric,
  	"width" numeric,
  	"height" numeric,
  	"focal_x" numeric,
  	"focal_y" numeric,
  	"sizes_thumb_url" varchar,
  	"sizes_thumb_width" numeric,
  	"sizes_thumb_height" numeric,
  	"sizes_thumb_mime_type" varchar,
  	"sizes_thumb_filesize" numeric,
  	"sizes_thumb_filename" varchar,
  	"sizes_card_url" varchar,
  	"sizes_card_width" numeric,
  	"sizes_card_height" numeric,
  	"sizes_card_mime_type" varchar,
  	"sizes_card_filesize" numeric,
  	"sizes_card_filename" varchar,
  	"sizes_hero_url" varchar,
  	"sizes_hero_width" numeric,
  	"sizes_hero_height" numeric,
  	"sizes_hero_mime_type" varchar,
  	"sizes_hero_filesize" numeric,
  	"sizes_hero_filename" varchar
  );
  
  CREATE TABLE "requests" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"summary" varchar,
  	"type" "enum_requests_type" NOT NULL,
  	"status" "enum_requests_status" DEFAULT 'new' NOT NULL,
  	"contact_name" varchar,
  	"contact_phone" varchar,
  	"contact_email" varchar,
  	"church_id" integer,
  	"details" jsonb,
  	"internal_note" varchar,
  	"consent_at" timestamp(3) with time zone,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"deleted_at" timestamp(3) with time zone
  );
  
  CREATE TABLE "churches_facts" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"label" varchar NOT NULL,
  	"value" varchar NOT NULL
  );
  
  CREATE TABLE "churches_blocks_timeline_item" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"year" varchar NOT NULL,
  	"title" varchar NOT NULL,
  	"text" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "churches_blocks_rich_text" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"body" jsonb,
  	"block_name" varchar
  );
  
  CREATE TABLE "churches_blocks_gallery" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"caption" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "churches_shrines" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"title" varchar NOT NULL,
  	"text" varchar,
  	"image_id" integer
  );
  
  CREATE TABLE "churches_patronal_feasts" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"date" varchar NOT NULL,
  	"title" varchar NOT NULL,
  	"note" varchar
  );
  
  CREATE TABLE "churches" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"name" varchar NOT NULL,
  	"short_name" varchar NOT NULL,
  	"color" "enum_churches_color" NOT NULL,
  	"aliases" varchar,
  	"intro" varchar,
  	"order" numeric DEFAULT 0,
  	"architecture" jsonb,
  	"extra_section_heading" varchar,
  	"extra_section_image_id" integer,
  	"extra_section_body" jsonb,
  	"address" varchar NOT NULL,
  	"lat" numeric,
  	"lng" numeric,
  	"yandex_org_id" varchar,
  	"opening_hours" varchar,
  	"how_to_get" jsonb,
  	"slug" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "churches_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"media_id" integer
  );
  
  CREATE TABLE "_churches_v_version_facts" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"label" varchar NOT NULL,
  	"value" varchar NOT NULL,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_churches_v_blocks_timeline_item" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"year" varchar NOT NULL,
  	"title" varchar NOT NULL,
  	"text" varchar,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_churches_v_blocks_rich_text" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"body" jsonb,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_churches_v_blocks_gallery" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"caption" varchar,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_churches_v_version_shrines" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"title" varchar NOT NULL,
  	"text" varchar,
  	"image_id" integer,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_churches_v_version_patronal_feasts" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"date" varchar NOT NULL,
  	"title" varchar NOT NULL,
  	"note" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_churches_v" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"parent_id" integer,
  	"version_name" varchar NOT NULL,
  	"version_short_name" varchar NOT NULL,
  	"version_color" "enum__churches_v_version_color" NOT NULL,
  	"version_aliases" varchar,
  	"version_intro" varchar,
  	"version_order" numeric DEFAULT 0,
  	"version_architecture" jsonb,
  	"version_extra_section_heading" varchar,
  	"version_extra_section_image_id" integer,
  	"version_extra_section_body" jsonb,
  	"version_address" varchar NOT NULL,
  	"version_lat" numeric,
  	"version_lng" numeric,
  	"version_yandex_org_id" varchar,
  	"version_opening_hours" varchar,
  	"version_how_to_get" jsonb,
  	"version_slug" varchar,
  	"version_updated_at" timestamp(3) with time zone,
  	"version_created_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "_churches_v_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"media_id" integer
  );
  
  CREATE TABLE "clergy" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"rank" varchar NOT NULL,
  	"name" varchar NOT NULL,
  	"position" varchar,
  	"photo_id" integer,
  	"ordination_date" varchar,
  	"name_day" varchar,
  	"bio" varchar,
  	"order" numeric DEFAULT 10,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "sacraments" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"title" varchar NOT NULL,
  	"intro" varchar NOT NULL,
  	"preparation" jsonb,
  	"documents" jsonb,
  	"schedule" varchar,
  	"contact" varchar,
  	"cta" varchar DEFAULT 'Записаться',
  	"order" numeric DEFAULT 10,
  	"slug" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "_sacraments_v" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"parent_id" integer,
  	"version_title" varchar NOT NULL,
  	"version_intro" varchar NOT NULL,
  	"version_preparation" jsonb,
  	"version_documents" jsonb,
  	"version_schedule" varchar,
  	"version_contact" varchar,
  	"version_cta" varchar DEFAULT 'Записаться',
  	"version_order" numeric DEFAULT 10,
  	"version_slug" varchar,
  	"version_updated_at" timestamp(3) with time zone,
  	"version_created_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "pages_blocks_text" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"heading" varchar,
  	"path_label" varchar,
  	"body" jsonb,
  	"block_name" varchar
  );
  
  CREATE TABLE "pages_blocks_cards_items" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"title" varchar,
  	"text" varchar,
  	"link" varchar
  );
  
  CREATE TABLE "pages_blocks_cards" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"heading" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "pages_blocks_steps_items" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"title" varchar,
  	"text" varchar
  );
  
  CREATE TABLE "pages_blocks_steps" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"heading" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "pages_blocks_faq_items" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"question" varchar,
  	"answer" varchar
  );
  
  CREATE TABLE "pages_blocks_faq" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"heading" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "pages_blocks_callout" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"text" varchar,
  	"tone" "enum_pages_blocks_callout_tone" DEFAULT 'gold',
  	"block_name" varchar
  );
  
  CREATE TABLE "pages_blocks_image" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"image_id" integer,
  	"caption" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "pages_blocks_contacts" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"note" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "pages_blocks_map" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"heading" varchar DEFAULT 'Как нас найти',
  	"block_name" varchar
  );
  
  CREATE TABLE "pages" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"title" varchar,
  	"path_label" varchar,
  	"lead" varchar,
  	"cover_id" integer,
  	"meta_description" varchar,
  	"slug" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"deleted_at" timestamp(3) with time zone,
  	"_status" "enum_pages_status" DEFAULT 'draft'
  );
  
  CREATE TABLE "_pages_v_blocks_text" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"heading" varchar,
  	"path_label" varchar,
  	"body" jsonb,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_cards_items" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"title" varchar,
  	"text" varchar,
  	"link" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_cards" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"heading" varchar,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_steps_items" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"title" varchar,
  	"text" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_steps" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"heading" varchar,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_faq_items" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"question" varchar,
  	"answer" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_faq" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"heading" varchar,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_callout" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"text" varchar,
  	"tone" "enum__pages_v_blocks_callout_tone" DEFAULT 'gold',
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_image" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"image_id" integer,
  	"caption" varchar,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_contacts" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"note" varchar,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_map" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"heading" varchar DEFAULT 'Как нас найти',
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_pages_v" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"parent_id" integer,
  	"version_title" varchar,
  	"version_path_label" varchar,
  	"version_lead" varchar,
  	"version_cover_id" integer,
  	"version_meta_description" varchar,
  	"version_slug" varchar,
  	"version_updated_at" timestamp(3) with time zone,
  	"version_created_at" timestamp(3) with time zone,
  	"version_deleted_at" timestamp(3) with time zone,
  	"version__status" "enum__pages_v_version_status" DEFAULT 'draft',
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"latest" boolean,
  	"autosave" boolean
  );
  
  CREATE TABLE "users_sessions" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"created_at" timestamp(3) with time zone,
  	"expires_at" timestamp(3) with time zone NOT NULL
  );
  
  CREATE TABLE "users" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"name" varchar NOT NULL,
  	"role" "enum_users_role" DEFAULT 'editor' NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"email" varchar NOT NULL,
  	"reset_password_token" varchar,
  	"reset_password_expiration" timestamp(3) with time zone,
  	"salt" varchar,
  	"hash" varchar,
  	"reset_password_requested_at" timestamp(3) with time zone,
  	"login_attempts" numeric DEFAULT 0,
  	"lock_until" timestamp(3) with time zone
  );
  
  CREATE TABLE "audit_log" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"action" "enum_audit_log_action",
  	"collection_slug" varchar,
  	"doc_id" varchar,
  	"doc_title" varchar,
  	"user_id" integer,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "payload_kv" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"key" varchar NOT NULL,
  	"data" jsonb NOT NULL
  );
  
  CREATE TABLE "payload_jobs_log" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"executed_at" timestamp(3) with time zone NOT NULL,
  	"completed_at" timestamp(3) with time zone NOT NULL,
  	"task_slug" "enum_payload_jobs_log_task_slug" NOT NULL,
  	"task_i_d" varchar NOT NULL,
  	"input" jsonb,
  	"output" jsonb,
  	"state" "enum_payload_jobs_log_state" NOT NULL,
  	"error" jsonb
  );
  
  CREATE TABLE "payload_jobs" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"input" jsonb,
  	"completed_at" timestamp(3) with time zone,
  	"total_tried" numeric DEFAULT 0,
  	"has_error" boolean DEFAULT false,
  	"error" jsonb,
  	"task_slug" "enum_payload_jobs_task_slug",
  	"queue" varchar DEFAULT 'default',
  	"wait_until" timestamp(3) with time zone,
  	"processing" boolean DEFAULT false,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "payload_locked_documents" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"global_slug" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "payload_locked_documents_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"services_id" integer,
  	"schedule_templates_id" integer,
  	"service_titles_id" integer,
  	"posts_id" integer,
  	"albums_id" integer,
  	"media_id" integer,
  	"requests_id" integer,
  	"churches_id" integer,
  	"clergy_id" integer,
  	"sacraments_id" integer,
  	"pages_id" integer,
  	"users_id" integer,
  	"audit_log_id" integer
  );
  
  CREATE TABLE "payload_preferences" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"key" varchar,
  	"value" jsonb,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "payload_preferences_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"users_id" integer
  );
  
  CREATE TABLE "payload_migrations" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"name" varchar,
  	"batch" numeric,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "settings_phones" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"number" varchar NOT NULL,
  	"label" varchar
  );
  
  CREATE TABLE "settings_needs" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"title" varchar NOT NULL,
  	"text" varchar
  );
  
  CREATE TABLE "settings" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"parish_name" varchar NOT NULL,
  	"site_name" varchar DEFAULT 'Храмы Гаспры' NOT NULL,
  	"email" varchar,
  	"telegram" varchar,
  	"vk" varchar,
  	"shop_hours" varchar,
  	"requisites_recipient" varchar,
  	"requisites_inn" varchar,
  	"requisites_kpp" varchar,
  	"requisites_ogrn" varchar,
  	"requisites_account" varchar,
  	"requisites_bank" varchar,
  	"requisites_bik" varchar,
  	"requisites_corr_account" varchar,
  	"requisites_purpose" varchar DEFAULT 'Добровольное пожертвование на уставную деятельность',
  	"sbp_qr_id" integer,
  	"sbp_link" varchar,
  	"legal_address" varchar,
  	"campaign_enabled" boolean DEFAULT false,
  	"campaign_title" varchar,
  	"campaign_description" varchar,
  	"campaign_goal" numeric,
  	"campaign_collected" numeric,
  	"banner_enabled" boolean DEFAULT false,
  	"banner_text" varchar,
  	"banner_link" varchar,
  	"banner_until" timestamp(3) with time zone,
  	"calendar_saints_date" timestamp(3) with time zone,
  	"calendar_saints" varchar,
  	"notify_emails" varchar,
  	"notify_telegram_chat_id" varchar,
  	"meta_description" varchar,
  	"og_image_id" integer,
  	"updated_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone
  );
  
  CREATE TABLE "_settings_v_version_phones" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"number" varchar NOT NULL,
  	"label" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_settings_v_version_needs" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"title" varchar NOT NULL,
  	"text" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_settings_v" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"version_parish_name" varchar NOT NULL,
  	"version_site_name" varchar DEFAULT 'Храмы Гаспры' NOT NULL,
  	"version_email" varchar,
  	"version_telegram" varchar,
  	"version_vk" varchar,
  	"version_shop_hours" varchar,
  	"version_requisites_recipient" varchar,
  	"version_requisites_inn" varchar,
  	"version_requisites_kpp" varchar,
  	"version_requisites_ogrn" varchar,
  	"version_requisites_account" varchar,
  	"version_requisites_bank" varchar,
  	"version_requisites_bik" varchar,
  	"version_requisites_corr_account" varchar,
  	"version_requisites_purpose" varchar DEFAULT 'Добровольное пожертвование на уставную деятельность',
  	"version_sbp_qr_id" integer,
  	"version_sbp_link" varchar,
  	"version_legal_address" varchar,
  	"version_campaign_enabled" boolean DEFAULT false,
  	"version_campaign_title" varchar,
  	"version_campaign_description" varchar,
  	"version_campaign_goal" numeric,
  	"version_campaign_collected" numeric,
  	"version_banner_enabled" boolean DEFAULT false,
  	"version_banner_text" varchar,
  	"version_banner_link" varchar,
  	"version_banner_until" timestamp(3) with time zone,
  	"version_calendar_saints_date" timestamp(3) with time zone,
  	"version_calendar_saints" varchar,
  	"version_notify_emails" varchar,
  	"version_notify_telegram_chat_id" varchar,
  	"version_meta_description" varchar,
  	"version_og_image_id" integer,
  	"version_updated_at" timestamp(3) with time zone,
  	"version_created_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  ALTER TABLE "services" ADD CONSTRAINT "services_church_id_churches_id_fk" FOREIGN KEY ("church_id") REFERENCES "public"."churches"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "services" ADD CONSTRAINT "services_preset_id_service_titles_id_fk" FOREIGN KEY ("preset_id") REFERENCES "public"."service_titles"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "services" ADD CONSTRAINT "services_celebrant_id_clergy_id_fk" FOREIGN KEY ("celebrant_id") REFERENCES "public"."clergy"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "schedule_templates" ADD CONSTRAINT "schedule_templates_church_id_churches_id_fk" FOREIGN KEY ("church_id") REFERENCES "public"."churches"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "schedule_templates" ADD CONSTRAINT "schedule_templates_preset_id_service_titles_id_fk" FOREIGN KEY ("preset_id") REFERENCES "public"."service_titles"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "posts" ADD CONSTRAINT "posts_cover_id_media_id_fk" FOREIGN KEY ("cover_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "posts" ADD CONSTRAINT "posts_album_id_albums_id_fk" FOREIGN KEY ("album_id") REFERENCES "public"."albums"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "posts" ADD CONSTRAINT "posts_church_id_churches_id_fk" FOREIGN KEY ("church_id") REFERENCES "public"."churches"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_posts_v" ADD CONSTRAINT "_posts_v_parent_id_posts_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."posts"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_posts_v" ADD CONSTRAINT "_posts_v_version_cover_id_media_id_fk" FOREIGN KEY ("version_cover_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_posts_v" ADD CONSTRAINT "_posts_v_version_album_id_albums_id_fk" FOREIGN KEY ("version_album_id") REFERENCES "public"."albums"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_posts_v" ADD CONSTRAINT "_posts_v_version_church_id_churches_id_fk" FOREIGN KEY ("version_church_id") REFERENCES "public"."churches"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "albums" ADD CONSTRAINT "albums_church_id_churches_id_fk" FOREIGN KEY ("church_id") REFERENCES "public"."churches"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "albums" ADD CONSTRAINT "albums_cover_id_media_id_fk" FOREIGN KEY ("cover_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "albums_rels" ADD CONSTRAINT "albums_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."albums"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "albums_rels" ADD CONSTRAINT "albums_rels_media_fk" FOREIGN KEY ("media_id") REFERENCES "public"."media"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_albums_v" ADD CONSTRAINT "_albums_v_parent_id_albums_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."albums"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_albums_v" ADD CONSTRAINT "_albums_v_version_church_id_churches_id_fk" FOREIGN KEY ("version_church_id") REFERENCES "public"."churches"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_albums_v" ADD CONSTRAINT "_albums_v_version_cover_id_media_id_fk" FOREIGN KEY ("version_cover_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_albums_v_rels" ADD CONSTRAINT "_albums_v_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."_albums_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_albums_v_rels" ADD CONSTRAINT "_albums_v_rels_media_fk" FOREIGN KEY ("media_id") REFERENCES "public"."media"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "requests" ADD CONSTRAINT "requests_church_id_churches_id_fk" FOREIGN KEY ("church_id") REFERENCES "public"."churches"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "churches_facts" ADD CONSTRAINT "churches_facts_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."churches"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "churches_blocks_timeline_item" ADD CONSTRAINT "churches_blocks_timeline_item_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."churches"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "churches_blocks_rich_text" ADD CONSTRAINT "churches_blocks_rich_text_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."churches"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "churches_blocks_gallery" ADD CONSTRAINT "churches_blocks_gallery_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."churches"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "churches_shrines" ADD CONSTRAINT "churches_shrines_image_id_media_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "churches_shrines" ADD CONSTRAINT "churches_shrines_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."churches"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "churches_patronal_feasts" ADD CONSTRAINT "churches_patronal_feasts_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."churches"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "churches" ADD CONSTRAINT "churches_extra_section_image_id_media_id_fk" FOREIGN KEY ("extra_section_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "churches_rels" ADD CONSTRAINT "churches_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."churches"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "churches_rels" ADD CONSTRAINT "churches_rels_media_fk" FOREIGN KEY ("media_id") REFERENCES "public"."media"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_churches_v_version_facts" ADD CONSTRAINT "_churches_v_version_facts_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_churches_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_churches_v_blocks_timeline_item" ADD CONSTRAINT "_churches_v_blocks_timeline_item_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_churches_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_churches_v_blocks_rich_text" ADD CONSTRAINT "_churches_v_blocks_rich_text_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_churches_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_churches_v_blocks_gallery" ADD CONSTRAINT "_churches_v_blocks_gallery_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_churches_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_churches_v_version_shrines" ADD CONSTRAINT "_churches_v_version_shrines_image_id_media_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_churches_v_version_shrines" ADD CONSTRAINT "_churches_v_version_shrines_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_churches_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_churches_v_version_patronal_feasts" ADD CONSTRAINT "_churches_v_version_patronal_feasts_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_churches_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_churches_v" ADD CONSTRAINT "_churches_v_parent_id_churches_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."churches"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_churches_v" ADD CONSTRAINT "_churches_v_version_extra_section_image_id_media_id_fk" FOREIGN KEY ("version_extra_section_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_churches_v_rels" ADD CONSTRAINT "_churches_v_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."_churches_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_churches_v_rels" ADD CONSTRAINT "_churches_v_rels_media_fk" FOREIGN KEY ("media_id") REFERENCES "public"."media"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "clergy" ADD CONSTRAINT "clergy_photo_id_media_id_fk" FOREIGN KEY ("photo_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_sacraments_v" ADD CONSTRAINT "_sacraments_v_parent_id_sacraments_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."sacraments"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "pages_blocks_text" ADD CONSTRAINT "pages_blocks_text_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_cards_items" ADD CONSTRAINT "pages_blocks_cards_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages_blocks_cards"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_cards" ADD CONSTRAINT "pages_blocks_cards_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_steps_items" ADD CONSTRAINT "pages_blocks_steps_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages_blocks_steps"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_steps" ADD CONSTRAINT "pages_blocks_steps_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_faq_items" ADD CONSTRAINT "pages_blocks_faq_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages_blocks_faq"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_faq" ADD CONSTRAINT "pages_blocks_faq_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_callout" ADD CONSTRAINT "pages_blocks_callout_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_image" ADD CONSTRAINT "pages_blocks_image_image_id_media_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "pages_blocks_image" ADD CONSTRAINT "pages_blocks_image_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_contacts" ADD CONSTRAINT "pages_blocks_contacts_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_map" ADD CONSTRAINT "pages_blocks_map_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages" ADD CONSTRAINT "pages_cover_id_media_id_fk" FOREIGN KEY ("cover_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_text" ADD CONSTRAINT "_pages_v_blocks_text_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_cards_items" ADD CONSTRAINT "_pages_v_blocks_cards_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v_blocks_cards"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_cards" ADD CONSTRAINT "_pages_v_blocks_cards_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_steps_items" ADD CONSTRAINT "_pages_v_blocks_steps_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v_blocks_steps"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_steps" ADD CONSTRAINT "_pages_v_blocks_steps_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_faq_items" ADD CONSTRAINT "_pages_v_blocks_faq_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v_blocks_faq"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_faq" ADD CONSTRAINT "_pages_v_blocks_faq_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_callout" ADD CONSTRAINT "_pages_v_blocks_callout_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_image" ADD CONSTRAINT "_pages_v_blocks_image_image_id_media_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_image" ADD CONSTRAINT "_pages_v_blocks_image_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_contacts" ADD CONSTRAINT "_pages_v_blocks_contacts_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_map" ADD CONSTRAINT "_pages_v_blocks_map_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v" ADD CONSTRAINT "_pages_v_parent_id_pages_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."pages"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_pages_v" ADD CONSTRAINT "_pages_v_version_cover_id_media_id_fk" FOREIGN KEY ("version_cover_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "users_sessions" ADD CONSTRAINT "users_sessions_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "audit_log" ADD CONSTRAINT "audit_log_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "payload_jobs_log" ADD CONSTRAINT "payload_jobs_log_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."payload_jobs"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."payload_locked_documents"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_services_fk" FOREIGN KEY ("services_id") REFERENCES "public"."services"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_schedule_templates_fk" FOREIGN KEY ("schedule_templates_id") REFERENCES "public"."schedule_templates"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_service_titles_fk" FOREIGN KEY ("service_titles_id") REFERENCES "public"."service_titles"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_posts_fk" FOREIGN KEY ("posts_id") REFERENCES "public"."posts"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_albums_fk" FOREIGN KEY ("albums_id") REFERENCES "public"."albums"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_media_fk" FOREIGN KEY ("media_id") REFERENCES "public"."media"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_requests_fk" FOREIGN KEY ("requests_id") REFERENCES "public"."requests"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_churches_fk" FOREIGN KEY ("churches_id") REFERENCES "public"."churches"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_clergy_fk" FOREIGN KEY ("clergy_id") REFERENCES "public"."clergy"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_sacraments_fk" FOREIGN KEY ("sacraments_id") REFERENCES "public"."sacraments"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_pages_fk" FOREIGN KEY ("pages_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_users_fk" FOREIGN KEY ("users_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_audit_log_fk" FOREIGN KEY ("audit_log_id") REFERENCES "public"."audit_log"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_preferences_rels" ADD CONSTRAINT "payload_preferences_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."payload_preferences"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_preferences_rels" ADD CONSTRAINT "payload_preferences_rels_users_fk" FOREIGN KEY ("users_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "settings_phones" ADD CONSTRAINT "settings_phones_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."settings"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "settings_needs" ADD CONSTRAINT "settings_needs_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."settings"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "settings" ADD CONSTRAINT "settings_sbp_qr_id_media_id_fk" FOREIGN KEY ("sbp_qr_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "settings" ADD CONSTRAINT "settings_og_image_id_media_id_fk" FOREIGN KEY ("og_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_settings_v_version_phones" ADD CONSTRAINT "_settings_v_version_phones_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_settings_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_settings_v_version_needs" ADD CONSTRAINT "_settings_v_version_needs_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_settings_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_settings_v" ADD CONSTRAINT "_settings_v_version_sbp_qr_id_media_id_fk" FOREIGN KEY ("version_sbp_qr_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_settings_v" ADD CONSTRAINT "_settings_v_version_og_image_id_media_id_fk" FOREIGN KEY ("version_og_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  CREATE INDEX "services_date_idx" ON "services" USING btree ("date");
  CREATE INDEX "services_church_idx" ON "services" USING btree ("church_id");
  CREATE INDEX "services_preset_idx" ON "services" USING btree ("preset_id");
  CREATE INDEX "services_celebrant_idx" ON "services" USING btree ("celebrant_id");
  CREATE INDEX "services_published_idx" ON "services" USING btree ("published");
  CREATE INDEX "services_updated_at_idx" ON "services" USING btree ("updated_at");
  CREATE INDEX "services_created_at_idx" ON "services" USING btree ("created_at");
  CREATE INDEX "schedule_templates_church_idx" ON "schedule_templates" USING btree ("church_id");
  CREATE INDEX "schedule_templates_preset_idx" ON "schedule_templates" USING btree ("preset_id");
  CREATE INDEX "schedule_templates_updated_at_idx" ON "schedule_templates" USING btree ("updated_at");
  CREATE INDEX "schedule_templates_created_at_idx" ON "schedule_templates" USING btree ("created_at");
  CREATE UNIQUE INDEX "service_titles_title_idx" ON "service_titles" USING btree ("title");
  CREATE INDEX "service_titles_updated_at_idx" ON "service_titles" USING btree ("updated_at");
  CREATE INDEX "service_titles_created_at_idx" ON "service_titles" USING btree ("created_at");
  CREATE INDEX "posts_cover_idx" ON "posts" USING btree ("cover_id");
  CREATE INDEX "posts_album_idx" ON "posts" USING btree ("album_id");
  CREATE INDEX "posts_church_idx" ON "posts" USING btree ("church_id");
  CREATE INDEX "posts_published_at_idx" ON "posts" USING btree ("published_at");
  CREATE UNIQUE INDEX "posts_slug_idx" ON "posts" USING btree ("slug");
  CREATE INDEX "posts_updated_at_idx" ON "posts" USING btree ("updated_at");
  CREATE INDEX "posts_created_at_idx" ON "posts" USING btree ("created_at");
  CREATE INDEX "posts_deleted_at_idx" ON "posts" USING btree ("deleted_at");
  CREATE INDEX "posts__status_idx" ON "posts" USING btree ("_status");
  CREATE INDEX "_posts_v_parent_idx" ON "_posts_v" USING btree ("parent_id");
  CREATE INDEX "_posts_v_version_version_cover_idx" ON "_posts_v" USING btree ("version_cover_id");
  CREATE INDEX "_posts_v_version_version_album_idx" ON "_posts_v" USING btree ("version_album_id");
  CREATE INDEX "_posts_v_version_version_church_idx" ON "_posts_v" USING btree ("version_church_id");
  CREATE INDEX "_posts_v_version_version_published_at_idx" ON "_posts_v" USING btree ("version_published_at");
  CREATE INDEX "_posts_v_version_version_slug_idx" ON "_posts_v" USING btree ("version_slug");
  CREATE INDEX "_posts_v_version_version_updated_at_idx" ON "_posts_v" USING btree ("version_updated_at");
  CREATE INDEX "_posts_v_version_version_created_at_idx" ON "_posts_v" USING btree ("version_created_at");
  CREATE INDEX "_posts_v_version_version_deleted_at_idx" ON "_posts_v" USING btree ("version_deleted_at");
  CREATE INDEX "_posts_v_version_version__status_idx" ON "_posts_v" USING btree ("version__status");
  CREATE INDEX "_posts_v_created_at_idx" ON "_posts_v" USING btree ("created_at");
  CREATE INDEX "_posts_v_updated_at_idx" ON "_posts_v" USING btree ("updated_at");
  CREATE INDEX "_posts_v_latest_idx" ON "_posts_v" USING btree ("latest");
  CREATE INDEX "_posts_v_autosave_idx" ON "_posts_v" USING btree ("autosave");
  CREATE INDEX "albums_church_idx" ON "albums" USING btree ("church_id");
  CREATE INDEX "albums_cover_idx" ON "albums" USING btree ("cover_id");
  CREATE UNIQUE INDEX "albums_slug_idx" ON "albums" USING btree ("slug");
  CREATE INDEX "albums_updated_at_idx" ON "albums" USING btree ("updated_at");
  CREATE INDEX "albums_created_at_idx" ON "albums" USING btree ("created_at");
  CREATE INDEX "albums_deleted_at_idx" ON "albums" USING btree ("deleted_at");
  CREATE INDEX "albums__status_idx" ON "albums" USING btree ("_status");
  CREATE INDEX "albums_rels_order_idx" ON "albums_rels" USING btree ("order");
  CREATE INDEX "albums_rels_parent_idx" ON "albums_rels" USING btree ("parent_id");
  CREATE INDEX "albums_rels_path_idx" ON "albums_rels" USING btree ("path");
  CREATE INDEX "albums_rels_media_id_idx" ON "albums_rels" USING btree ("media_id");
  CREATE INDEX "_albums_v_parent_idx" ON "_albums_v" USING btree ("parent_id");
  CREATE INDEX "_albums_v_version_version_church_idx" ON "_albums_v" USING btree ("version_church_id");
  CREATE INDEX "_albums_v_version_version_cover_idx" ON "_albums_v" USING btree ("version_cover_id");
  CREATE INDEX "_albums_v_version_version_slug_idx" ON "_albums_v" USING btree ("version_slug");
  CREATE INDEX "_albums_v_version_version_updated_at_idx" ON "_albums_v" USING btree ("version_updated_at");
  CREATE INDEX "_albums_v_version_version_created_at_idx" ON "_albums_v" USING btree ("version_created_at");
  CREATE INDEX "_albums_v_version_version_deleted_at_idx" ON "_albums_v" USING btree ("version_deleted_at");
  CREATE INDEX "_albums_v_version_version__status_idx" ON "_albums_v" USING btree ("version__status");
  CREATE INDEX "_albums_v_created_at_idx" ON "_albums_v" USING btree ("created_at");
  CREATE INDEX "_albums_v_updated_at_idx" ON "_albums_v" USING btree ("updated_at");
  CREATE INDEX "_albums_v_latest_idx" ON "_albums_v" USING btree ("latest");
  CREATE INDEX "_albums_v_rels_order_idx" ON "_albums_v_rels" USING btree ("order");
  CREATE INDEX "_albums_v_rels_parent_idx" ON "_albums_v_rels" USING btree ("parent_id");
  CREATE INDEX "_albums_v_rels_path_idx" ON "_albums_v_rels" USING btree ("path");
  CREATE INDEX "_albums_v_rels_media_id_idx" ON "_albums_v_rels" USING btree ("media_id");
  CREATE INDEX "media_updated_at_idx" ON "media" USING btree ("updated_at");
  CREATE INDEX "media_created_at_idx" ON "media" USING btree ("created_at");
  CREATE UNIQUE INDEX "media_filename_idx" ON "media" USING btree ("filename");
  CREATE INDEX "media_sizes_thumb_sizes_thumb_filename_idx" ON "media" USING btree ("sizes_thumb_filename");
  CREATE INDEX "media_sizes_card_sizes_card_filename_idx" ON "media" USING btree ("sizes_card_filename");
  CREATE INDEX "media_sizes_hero_sizes_hero_filename_idx" ON "media" USING btree ("sizes_hero_filename");
  CREATE INDEX "requests_status_idx" ON "requests" USING btree ("status");
  CREATE INDEX "requests_church_idx" ON "requests" USING btree ("church_id");
  CREATE INDEX "requests_updated_at_idx" ON "requests" USING btree ("updated_at");
  CREATE INDEX "requests_created_at_idx" ON "requests" USING btree ("created_at");
  CREATE INDEX "requests_deleted_at_idx" ON "requests" USING btree ("deleted_at");
  CREATE INDEX "churches_facts_order_idx" ON "churches_facts" USING btree ("_order");
  CREATE INDEX "churches_facts_parent_id_idx" ON "churches_facts" USING btree ("_parent_id");
  CREATE INDEX "churches_blocks_timeline_item_order_idx" ON "churches_blocks_timeline_item" USING btree ("_order");
  CREATE INDEX "churches_blocks_timeline_item_parent_id_idx" ON "churches_blocks_timeline_item" USING btree ("_parent_id");
  CREATE INDEX "churches_blocks_timeline_item_path_idx" ON "churches_blocks_timeline_item" USING btree ("_path");
  CREATE INDEX "churches_blocks_rich_text_order_idx" ON "churches_blocks_rich_text" USING btree ("_order");
  CREATE INDEX "churches_blocks_rich_text_parent_id_idx" ON "churches_blocks_rich_text" USING btree ("_parent_id");
  CREATE INDEX "churches_blocks_rich_text_path_idx" ON "churches_blocks_rich_text" USING btree ("_path");
  CREATE INDEX "churches_blocks_gallery_order_idx" ON "churches_blocks_gallery" USING btree ("_order");
  CREATE INDEX "churches_blocks_gallery_parent_id_idx" ON "churches_blocks_gallery" USING btree ("_parent_id");
  CREATE INDEX "churches_blocks_gallery_path_idx" ON "churches_blocks_gallery" USING btree ("_path");
  CREATE INDEX "churches_shrines_order_idx" ON "churches_shrines" USING btree ("_order");
  CREATE INDEX "churches_shrines_parent_id_idx" ON "churches_shrines" USING btree ("_parent_id");
  CREATE INDEX "churches_shrines_image_idx" ON "churches_shrines" USING btree ("image_id");
  CREATE INDEX "churches_patronal_feasts_order_idx" ON "churches_patronal_feasts" USING btree ("_order");
  CREATE INDEX "churches_patronal_feasts_parent_id_idx" ON "churches_patronal_feasts" USING btree ("_parent_id");
  CREATE INDEX "churches_extra_section_extra_section_image_idx" ON "churches" USING btree ("extra_section_image_id");
  CREATE UNIQUE INDEX "churches_slug_idx" ON "churches" USING btree ("slug");
  CREATE INDEX "churches_updated_at_idx" ON "churches" USING btree ("updated_at");
  CREATE INDEX "churches_created_at_idx" ON "churches" USING btree ("created_at");
  CREATE INDEX "churches_rels_order_idx" ON "churches_rels" USING btree ("order");
  CREATE INDEX "churches_rels_parent_idx" ON "churches_rels" USING btree ("parent_id");
  CREATE INDEX "churches_rels_path_idx" ON "churches_rels" USING btree ("path");
  CREATE INDEX "churches_rels_media_id_idx" ON "churches_rels" USING btree ("media_id");
  CREATE INDEX "_churches_v_version_facts_order_idx" ON "_churches_v_version_facts" USING btree ("_order");
  CREATE INDEX "_churches_v_version_facts_parent_id_idx" ON "_churches_v_version_facts" USING btree ("_parent_id");
  CREATE INDEX "_churches_v_blocks_timeline_item_order_idx" ON "_churches_v_blocks_timeline_item" USING btree ("_order");
  CREATE INDEX "_churches_v_blocks_timeline_item_parent_id_idx" ON "_churches_v_blocks_timeline_item" USING btree ("_parent_id");
  CREATE INDEX "_churches_v_blocks_timeline_item_path_idx" ON "_churches_v_blocks_timeline_item" USING btree ("_path");
  CREATE INDEX "_churches_v_blocks_rich_text_order_idx" ON "_churches_v_blocks_rich_text" USING btree ("_order");
  CREATE INDEX "_churches_v_blocks_rich_text_parent_id_idx" ON "_churches_v_blocks_rich_text" USING btree ("_parent_id");
  CREATE INDEX "_churches_v_blocks_rich_text_path_idx" ON "_churches_v_blocks_rich_text" USING btree ("_path");
  CREATE INDEX "_churches_v_blocks_gallery_order_idx" ON "_churches_v_blocks_gallery" USING btree ("_order");
  CREATE INDEX "_churches_v_blocks_gallery_parent_id_idx" ON "_churches_v_blocks_gallery" USING btree ("_parent_id");
  CREATE INDEX "_churches_v_blocks_gallery_path_idx" ON "_churches_v_blocks_gallery" USING btree ("_path");
  CREATE INDEX "_churches_v_version_shrines_order_idx" ON "_churches_v_version_shrines" USING btree ("_order");
  CREATE INDEX "_churches_v_version_shrines_parent_id_idx" ON "_churches_v_version_shrines" USING btree ("_parent_id");
  CREATE INDEX "_churches_v_version_shrines_image_idx" ON "_churches_v_version_shrines" USING btree ("image_id");
  CREATE INDEX "_churches_v_version_patronal_feasts_order_idx" ON "_churches_v_version_patronal_feasts" USING btree ("_order");
  CREATE INDEX "_churches_v_version_patronal_feasts_parent_id_idx" ON "_churches_v_version_patronal_feasts" USING btree ("_parent_id");
  CREATE INDEX "_churches_v_parent_idx" ON "_churches_v" USING btree ("parent_id");
  CREATE INDEX "_churches_v_version_extra_section_version_extra_section__idx" ON "_churches_v" USING btree ("version_extra_section_image_id");
  CREATE INDEX "_churches_v_version_version_slug_idx" ON "_churches_v" USING btree ("version_slug");
  CREATE INDEX "_churches_v_version_version_updated_at_idx" ON "_churches_v" USING btree ("version_updated_at");
  CREATE INDEX "_churches_v_version_version_created_at_idx" ON "_churches_v" USING btree ("version_created_at");
  CREATE INDEX "_churches_v_created_at_idx" ON "_churches_v" USING btree ("created_at");
  CREATE INDEX "_churches_v_updated_at_idx" ON "_churches_v" USING btree ("updated_at");
  CREATE INDEX "_churches_v_rels_order_idx" ON "_churches_v_rels" USING btree ("order");
  CREATE INDEX "_churches_v_rels_parent_idx" ON "_churches_v_rels" USING btree ("parent_id");
  CREATE INDEX "_churches_v_rels_path_idx" ON "_churches_v_rels" USING btree ("path");
  CREATE INDEX "_churches_v_rels_media_id_idx" ON "_churches_v_rels" USING btree ("media_id");
  CREATE INDEX "clergy_photo_idx" ON "clergy" USING btree ("photo_id");
  CREATE INDEX "clergy_updated_at_idx" ON "clergy" USING btree ("updated_at");
  CREATE INDEX "clergy_created_at_idx" ON "clergy" USING btree ("created_at");
  CREATE UNIQUE INDEX "sacraments_slug_idx" ON "sacraments" USING btree ("slug");
  CREATE INDEX "sacraments_updated_at_idx" ON "sacraments" USING btree ("updated_at");
  CREATE INDEX "sacraments_created_at_idx" ON "sacraments" USING btree ("created_at");
  CREATE INDEX "_sacraments_v_parent_idx" ON "_sacraments_v" USING btree ("parent_id");
  CREATE INDEX "_sacraments_v_version_version_slug_idx" ON "_sacraments_v" USING btree ("version_slug");
  CREATE INDEX "_sacraments_v_version_version_updated_at_idx" ON "_sacraments_v" USING btree ("version_updated_at");
  CREATE INDEX "_sacraments_v_version_version_created_at_idx" ON "_sacraments_v" USING btree ("version_created_at");
  CREATE INDEX "_sacraments_v_created_at_idx" ON "_sacraments_v" USING btree ("created_at");
  CREATE INDEX "_sacraments_v_updated_at_idx" ON "_sacraments_v" USING btree ("updated_at");
  CREATE INDEX "pages_blocks_text_order_idx" ON "pages_blocks_text" USING btree ("_order");
  CREATE INDEX "pages_blocks_text_parent_id_idx" ON "pages_blocks_text" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_text_path_idx" ON "pages_blocks_text" USING btree ("_path");
  CREATE INDEX "pages_blocks_cards_items_order_idx" ON "pages_blocks_cards_items" USING btree ("_order");
  CREATE INDEX "pages_blocks_cards_items_parent_id_idx" ON "pages_blocks_cards_items" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_cards_order_idx" ON "pages_blocks_cards" USING btree ("_order");
  CREATE INDEX "pages_blocks_cards_parent_id_idx" ON "pages_blocks_cards" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_cards_path_idx" ON "pages_blocks_cards" USING btree ("_path");
  CREATE INDEX "pages_blocks_steps_items_order_idx" ON "pages_blocks_steps_items" USING btree ("_order");
  CREATE INDEX "pages_blocks_steps_items_parent_id_idx" ON "pages_blocks_steps_items" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_steps_order_idx" ON "pages_blocks_steps" USING btree ("_order");
  CREATE INDEX "pages_blocks_steps_parent_id_idx" ON "pages_blocks_steps" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_steps_path_idx" ON "pages_blocks_steps" USING btree ("_path");
  CREATE INDEX "pages_blocks_faq_items_order_idx" ON "pages_blocks_faq_items" USING btree ("_order");
  CREATE INDEX "pages_blocks_faq_items_parent_id_idx" ON "pages_blocks_faq_items" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_faq_order_idx" ON "pages_blocks_faq" USING btree ("_order");
  CREATE INDEX "pages_blocks_faq_parent_id_idx" ON "pages_blocks_faq" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_faq_path_idx" ON "pages_blocks_faq" USING btree ("_path");
  CREATE INDEX "pages_blocks_callout_order_idx" ON "pages_blocks_callout" USING btree ("_order");
  CREATE INDEX "pages_blocks_callout_parent_id_idx" ON "pages_blocks_callout" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_callout_path_idx" ON "pages_blocks_callout" USING btree ("_path");
  CREATE INDEX "pages_blocks_image_order_idx" ON "pages_blocks_image" USING btree ("_order");
  CREATE INDEX "pages_blocks_image_parent_id_idx" ON "pages_blocks_image" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_image_path_idx" ON "pages_blocks_image" USING btree ("_path");
  CREATE INDEX "pages_blocks_image_image_idx" ON "pages_blocks_image" USING btree ("image_id");
  CREATE INDEX "pages_blocks_contacts_order_idx" ON "pages_blocks_contacts" USING btree ("_order");
  CREATE INDEX "pages_blocks_contacts_parent_id_idx" ON "pages_blocks_contacts" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_contacts_path_idx" ON "pages_blocks_contacts" USING btree ("_path");
  CREATE INDEX "pages_blocks_map_order_idx" ON "pages_blocks_map" USING btree ("_order");
  CREATE INDEX "pages_blocks_map_parent_id_idx" ON "pages_blocks_map" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_map_path_idx" ON "pages_blocks_map" USING btree ("_path");
  CREATE INDEX "pages_cover_idx" ON "pages" USING btree ("cover_id");
  CREATE UNIQUE INDEX "pages_slug_idx" ON "pages" USING btree ("slug");
  CREATE INDEX "pages_updated_at_idx" ON "pages" USING btree ("updated_at");
  CREATE INDEX "pages_created_at_idx" ON "pages" USING btree ("created_at");
  CREATE INDEX "pages_deleted_at_idx" ON "pages" USING btree ("deleted_at");
  CREATE INDEX "pages__status_idx" ON "pages" USING btree ("_status");
  CREATE INDEX "_pages_v_blocks_text_order_idx" ON "_pages_v_blocks_text" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_text_parent_id_idx" ON "_pages_v_blocks_text" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_text_path_idx" ON "_pages_v_blocks_text" USING btree ("_path");
  CREATE INDEX "_pages_v_blocks_cards_items_order_idx" ON "_pages_v_blocks_cards_items" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_cards_items_parent_id_idx" ON "_pages_v_blocks_cards_items" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_cards_order_idx" ON "_pages_v_blocks_cards" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_cards_parent_id_idx" ON "_pages_v_blocks_cards" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_cards_path_idx" ON "_pages_v_blocks_cards" USING btree ("_path");
  CREATE INDEX "_pages_v_blocks_steps_items_order_idx" ON "_pages_v_blocks_steps_items" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_steps_items_parent_id_idx" ON "_pages_v_blocks_steps_items" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_steps_order_idx" ON "_pages_v_blocks_steps" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_steps_parent_id_idx" ON "_pages_v_blocks_steps" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_steps_path_idx" ON "_pages_v_blocks_steps" USING btree ("_path");
  CREATE INDEX "_pages_v_blocks_faq_items_order_idx" ON "_pages_v_blocks_faq_items" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_faq_items_parent_id_idx" ON "_pages_v_blocks_faq_items" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_faq_order_idx" ON "_pages_v_blocks_faq" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_faq_parent_id_idx" ON "_pages_v_blocks_faq" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_faq_path_idx" ON "_pages_v_blocks_faq" USING btree ("_path");
  CREATE INDEX "_pages_v_blocks_callout_order_idx" ON "_pages_v_blocks_callout" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_callout_parent_id_idx" ON "_pages_v_blocks_callout" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_callout_path_idx" ON "_pages_v_blocks_callout" USING btree ("_path");
  CREATE INDEX "_pages_v_blocks_image_order_idx" ON "_pages_v_blocks_image" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_image_parent_id_idx" ON "_pages_v_blocks_image" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_image_path_idx" ON "_pages_v_blocks_image" USING btree ("_path");
  CREATE INDEX "_pages_v_blocks_image_image_idx" ON "_pages_v_blocks_image" USING btree ("image_id");
  CREATE INDEX "_pages_v_blocks_contacts_order_idx" ON "_pages_v_blocks_contacts" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_contacts_parent_id_idx" ON "_pages_v_blocks_contacts" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_contacts_path_idx" ON "_pages_v_blocks_contacts" USING btree ("_path");
  CREATE INDEX "_pages_v_blocks_map_order_idx" ON "_pages_v_blocks_map" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_map_parent_id_idx" ON "_pages_v_blocks_map" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_map_path_idx" ON "_pages_v_blocks_map" USING btree ("_path");
  CREATE INDEX "_pages_v_parent_idx" ON "_pages_v" USING btree ("parent_id");
  CREATE INDEX "_pages_v_version_version_cover_idx" ON "_pages_v" USING btree ("version_cover_id");
  CREATE INDEX "_pages_v_version_version_slug_idx" ON "_pages_v" USING btree ("version_slug");
  CREATE INDEX "_pages_v_version_version_updated_at_idx" ON "_pages_v" USING btree ("version_updated_at");
  CREATE INDEX "_pages_v_version_version_created_at_idx" ON "_pages_v" USING btree ("version_created_at");
  CREATE INDEX "_pages_v_version_version_deleted_at_idx" ON "_pages_v" USING btree ("version_deleted_at");
  CREATE INDEX "_pages_v_version_version__status_idx" ON "_pages_v" USING btree ("version__status");
  CREATE INDEX "_pages_v_created_at_idx" ON "_pages_v" USING btree ("created_at");
  CREATE INDEX "_pages_v_updated_at_idx" ON "_pages_v" USING btree ("updated_at");
  CREATE INDEX "_pages_v_latest_idx" ON "_pages_v" USING btree ("latest");
  CREATE INDEX "_pages_v_autosave_idx" ON "_pages_v" USING btree ("autosave");
  CREATE INDEX "users_sessions_order_idx" ON "users_sessions" USING btree ("_order");
  CREATE INDEX "users_sessions_parent_id_idx" ON "users_sessions" USING btree ("_parent_id");
  CREATE INDEX "users_updated_at_idx" ON "users" USING btree ("updated_at");
  CREATE INDEX "users_created_at_idx" ON "users" USING btree ("created_at");
  CREATE UNIQUE INDEX "users_email_idx" ON "users" USING btree ("email");
  CREATE INDEX "audit_log_user_idx" ON "audit_log" USING btree ("user_id");
  CREATE INDEX "audit_log_updated_at_idx" ON "audit_log" USING btree ("updated_at");
  CREATE INDEX "audit_log_created_at_idx" ON "audit_log" USING btree ("created_at");
  CREATE UNIQUE INDEX "payload_kv_key_idx" ON "payload_kv" USING btree ("key");
  CREATE INDEX "payload_jobs_log_order_idx" ON "payload_jobs_log" USING btree ("_order");
  CREATE INDEX "payload_jobs_log_parent_id_idx" ON "payload_jobs_log" USING btree ("_parent_id");
  CREATE INDEX "payload_jobs_completed_at_idx" ON "payload_jobs" USING btree ("completed_at");
  CREATE INDEX "payload_jobs_total_tried_idx" ON "payload_jobs" USING btree ("total_tried");
  CREATE INDEX "payload_jobs_has_error_idx" ON "payload_jobs" USING btree ("has_error");
  CREATE INDEX "payload_jobs_task_slug_idx" ON "payload_jobs" USING btree ("task_slug");
  CREATE INDEX "payload_jobs_queue_idx" ON "payload_jobs" USING btree ("queue");
  CREATE INDEX "payload_jobs_wait_until_idx" ON "payload_jobs" USING btree ("wait_until");
  CREATE INDEX "payload_jobs_processing_idx" ON "payload_jobs" USING btree ("processing");
  CREATE INDEX "payload_jobs_updated_at_idx" ON "payload_jobs" USING btree ("updated_at");
  CREATE INDEX "payload_jobs_created_at_idx" ON "payload_jobs" USING btree ("created_at");
  CREATE INDEX "payload_locked_documents_global_slug_idx" ON "payload_locked_documents" USING btree ("global_slug");
  CREATE INDEX "payload_locked_documents_updated_at_idx" ON "payload_locked_documents" USING btree ("updated_at");
  CREATE INDEX "payload_locked_documents_created_at_idx" ON "payload_locked_documents" USING btree ("created_at");
  CREATE INDEX "payload_locked_documents_rels_order_idx" ON "payload_locked_documents_rels" USING btree ("order");
  CREATE INDEX "payload_locked_documents_rels_parent_idx" ON "payload_locked_documents_rels" USING btree ("parent_id");
  CREATE INDEX "payload_locked_documents_rels_path_idx" ON "payload_locked_documents_rels" USING btree ("path");
  CREATE INDEX "payload_locked_documents_rels_services_id_idx" ON "payload_locked_documents_rels" USING btree ("services_id");
  CREATE INDEX "payload_locked_documents_rels_schedule_templates_id_idx" ON "payload_locked_documents_rels" USING btree ("schedule_templates_id");
  CREATE INDEX "payload_locked_documents_rels_service_titles_id_idx" ON "payload_locked_documents_rels" USING btree ("service_titles_id");
  CREATE INDEX "payload_locked_documents_rels_posts_id_idx" ON "payload_locked_documents_rels" USING btree ("posts_id");
  CREATE INDEX "payload_locked_documents_rels_albums_id_idx" ON "payload_locked_documents_rels" USING btree ("albums_id");
  CREATE INDEX "payload_locked_documents_rels_media_id_idx" ON "payload_locked_documents_rels" USING btree ("media_id");
  CREATE INDEX "payload_locked_documents_rels_requests_id_idx" ON "payload_locked_documents_rels" USING btree ("requests_id");
  CREATE INDEX "payload_locked_documents_rels_churches_id_idx" ON "payload_locked_documents_rels" USING btree ("churches_id");
  CREATE INDEX "payload_locked_documents_rels_clergy_id_idx" ON "payload_locked_documents_rels" USING btree ("clergy_id");
  CREATE INDEX "payload_locked_documents_rels_sacraments_id_idx" ON "payload_locked_documents_rels" USING btree ("sacraments_id");
  CREATE INDEX "payload_locked_documents_rels_pages_id_idx" ON "payload_locked_documents_rels" USING btree ("pages_id");
  CREATE INDEX "payload_locked_documents_rels_users_id_idx" ON "payload_locked_documents_rels" USING btree ("users_id");
  CREATE INDEX "payload_locked_documents_rels_audit_log_id_idx" ON "payload_locked_documents_rels" USING btree ("audit_log_id");
  CREATE INDEX "payload_preferences_key_idx" ON "payload_preferences" USING btree ("key");
  CREATE INDEX "payload_preferences_updated_at_idx" ON "payload_preferences" USING btree ("updated_at");
  CREATE INDEX "payload_preferences_created_at_idx" ON "payload_preferences" USING btree ("created_at");
  CREATE INDEX "payload_preferences_rels_order_idx" ON "payload_preferences_rels" USING btree ("order");
  CREATE INDEX "payload_preferences_rels_parent_idx" ON "payload_preferences_rels" USING btree ("parent_id");
  CREATE INDEX "payload_preferences_rels_path_idx" ON "payload_preferences_rels" USING btree ("path");
  CREATE INDEX "payload_preferences_rels_users_id_idx" ON "payload_preferences_rels" USING btree ("users_id");
  CREATE INDEX "payload_migrations_updated_at_idx" ON "payload_migrations" USING btree ("updated_at");
  CREATE INDEX "payload_migrations_created_at_idx" ON "payload_migrations" USING btree ("created_at");
  CREATE INDEX "settings_phones_order_idx" ON "settings_phones" USING btree ("_order");
  CREATE INDEX "settings_phones_parent_id_idx" ON "settings_phones" USING btree ("_parent_id");
  CREATE INDEX "settings_needs_order_idx" ON "settings_needs" USING btree ("_order");
  CREATE INDEX "settings_needs_parent_id_idx" ON "settings_needs" USING btree ("_parent_id");
  CREATE INDEX "settings_sbp_qr_idx" ON "settings" USING btree ("sbp_qr_id");
  CREATE INDEX "settings_og_image_idx" ON "settings" USING btree ("og_image_id");
  CREATE INDEX "_settings_v_version_phones_order_idx" ON "_settings_v_version_phones" USING btree ("_order");
  CREATE INDEX "_settings_v_version_phones_parent_id_idx" ON "_settings_v_version_phones" USING btree ("_parent_id");
  CREATE INDEX "_settings_v_version_needs_order_idx" ON "_settings_v_version_needs" USING btree ("_order");
  CREATE INDEX "_settings_v_version_needs_parent_id_idx" ON "_settings_v_version_needs" USING btree ("_parent_id");
  CREATE INDEX "_settings_v_version_version_sbp_qr_idx" ON "_settings_v" USING btree ("version_sbp_qr_id");
  CREATE INDEX "_settings_v_version_version_og_image_idx" ON "_settings_v" USING btree ("version_og_image_id");
  CREATE INDEX "_settings_v_created_at_idx" ON "_settings_v" USING btree ("created_at");
  CREATE INDEX "_settings_v_updated_at_idx" ON "_settings_v" USING btree ("updated_at");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   DROP TABLE "services" CASCADE;
  DROP TABLE "schedule_templates" CASCADE;
  DROP TABLE "service_titles" CASCADE;
  DROP TABLE "posts" CASCADE;
  DROP TABLE "_posts_v" CASCADE;
  DROP TABLE "albums" CASCADE;
  DROP TABLE "albums_rels" CASCADE;
  DROP TABLE "_albums_v" CASCADE;
  DROP TABLE "_albums_v_rels" CASCADE;
  DROP TABLE "media" CASCADE;
  DROP TABLE "requests" CASCADE;
  DROP TABLE "churches_facts" CASCADE;
  DROP TABLE "churches_blocks_timeline_item" CASCADE;
  DROP TABLE "churches_blocks_rich_text" CASCADE;
  DROP TABLE "churches_blocks_gallery" CASCADE;
  DROP TABLE "churches_shrines" CASCADE;
  DROP TABLE "churches_patronal_feasts" CASCADE;
  DROP TABLE "churches" CASCADE;
  DROP TABLE "churches_rels" CASCADE;
  DROP TABLE "_churches_v_version_facts" CASCADE;
  DROP TABLE "_churches_v_blocks_timeline_item" CASCADE;
  DROP TABLE "_churches_v_blocks_rich_text" CASCADE;
  DROP TABLE "_churches_v_blocks_gallery" CASCADE;
  DROP TABLE "_churches_v_version_shrines" CASCADE;
  DROP TABLE "_churches_v_version_patronal_feasts" CASCADE;
  DROP TABLE "_churches_v" CASCADE;
  DROP TABLE "_churches_v_rels" CASCADE;
  DROP TABLE "clergy" CASCADE;
  DROP TABLE "sacraments" CASCADE;
  DROP TABLE "_sacraments_v" CASCADE;
  DROP TABLE "pages_blocks_text" CASCADE;
  DROP TABLE "pages_blocks_cards_items" CASCADE;
  DROP TABLE "pages_blocks_cards" CASCADE;
  DROP TABLE "pages_blocks_steps_items" CASCADE;
  DROP TABLE "pages_blocks_steps" CASCADE;
  DROP TABLE "pages_blocks_faq_items" CASCADE;
  DROP TABLE "pages_blocks_faq" CASCADE;
  DROP TABLE "pages_blocks_callout" CASCADE;
  DROP TABLE "pages_blocks_image" CASCADE;
  DROP TABLE "pages_blocks_contacts" CASCADE;
  DROP TABLE "pages_blocks_map" CASCADE;
  DROP TABLE "pages" CASCADE;
  DROP TABLE "_pages_v_blocks_text" CASCADE;
  DROP TABLE "_pages_v_blocks_cards_items" CASCADE;
  DROP TABLE "_pages_v_blocks_cards" CASCADE;
  DROP TABLE "_pages_v_blocks_steps_items" CASCADE;
  DROP TABLE "_pages_v_blocks_steps" CASCADE;
  DROP TABLE "_pages_v_blocks_faq_items" CASCADE;
  DROP TABLE "_pages_v_blocks_faq" CASCADE;
  DROP TABLE "_pages_v_blocks_callout" CASCADE;
  DROP TABLE "_pages_v_blocks_image" CASCADE;
  DROP TABLE "_pages_v_blocks_contacts" CASCADE;
  DROP TABLE "_pages_v_blocks_map" CASCADE;
  DROP TABLE "_pages_v" CASCADE;
  DROP TABLE "users_sessions" CASCADE;
  DROP TABLE "users" CASCADE;
  DROP TABLE "audit_log" CASCADE;
  DROP TABLE "payload_kv" CASCADE;
  DROP TABLE "payload_jobs_log" CASCADE;
  DROP TABLE "payload_jobs" CASCADE;
  DROP TABLE "payload_locked_documents" CASCADE;
  DROP TABLE "payload_locked_documents_rels" CASCADE;
  DROP TABLE "payload_preferences" CASCADE;
  DROP TABLE "payload_preferences_rels" CASCADE;
  DROP TABLE "payload_migrations" CASCADE;
  DROP TABLE "settings_phones" CASCADE;
  DROP TABLE "settings_needs" CASCADE;
  DROP TABLE "settings" CASCADE;
  DROP TABLE "_settings_v_version_phones" CASCADE;
  DROP TABLE "_settings_v_version_needs" CASCADE;
  DROP TABLE "_settings_v" CASCADE;
  DROP TYPE "public"."enum_services_type";
  DROP TYPE "public"."enum_services_status";
  DROP TYPE "public"."enum_services_feast_rank";
  DROP TYPE "public"."enum_schedule_templates_weekday";
  DROP TYPE "public"."enum_schedule_templates_type";
  DROP TYPE "public"."enum_service_titles_type";
  DROP TYPE "public"."enum_posts_category";
  DROP TYPE "public"."enum_posts_status";
  DROP TYPE "public"."enum__posts_v_version_category";
  DROP TYPE "public"."enum__posts_v_version_status";
  DROP TYPE "public"."enum_albums_type";
  DROP TYPE "public"."enum_albums_status";
  DROP TYPE "public"."enum__albums_v_version_type";
  DROP TYPE "public"."enum__albums_v_version_status";
  DROP TYPE "public"."enum_requests_type";
  DROP TYPE "public"."enum_requests_status";
  DROP TYPE "public"."enum_churches_color";
  DROP TYPE "public"."enum__churches_v_version_color";
  DROP TYPE "public"."enum_pages_blocks_callout_tone";
  DROP TYPE "public"."enum_pages_status";
  DROP TYPE "public"."enum__pages_v_blocks_callout_tone";
  DROP TYPE "public"."enum__pages_v_version_status";
  DROP TYPE "public"."enum_users_role";
  DROP TYPE "public"."enum_audit_log_action";
  DROP TYPE "public"."enum_payload_jobs_log_task_slug";
  DROP TYPE "public"."enum_payload_jobs_log_state";
  DROP TYPE "public"."enum_payload_jobs_task_slug";`)
}
