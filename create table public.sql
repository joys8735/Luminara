create table public.avatar_frames (
  id serial not null,
  frame_id text not null,
  name text not null,
  color text not null,
  unlocked boolean null default false,
  unlock_requirement text null,
  rarity text not null,
  constraint avatar_frames_pkey primary key (id),
  constraint avatar_frames_frame_id_key unique (frame_id),
  constraint avatar_frames_rarity_check check (
    (
      rarity = any (
        array[
          'common'::text,
          'rare'::text,
          'epic'::text,
          'legendary'::text
        ]
      )
    )
  )
) TABLESPACE pg_default;

create index IF not exists idx_avatar_frames_frame_id on public.avatar_frames using btree (frame_id) TABLESPACE pg_default;

create table public.avatar_frames (
  id serial not null,
  frame_id text not null,
  name text not null,
  color text not null,
  unlocked boolean null default false,
  unlock_requirement text null,
  rarity text not null,
  constraint avatar_frames_pkey primary key (id),
  constraint avatar_frames_frame_id_key unique (frame_id),
  constraint avatar_frames_rarity_check check (
    (
      rarity = any (
        array[
          'common'::text,
          'rare'::text,
          'epic'::text,
          'legendary'::text
        ]
      )
    )
  )
) TABLESPACE pg_default;

create index IF not exists idx_avatar_frames_frame_id on public.avatar_frames using btree (frame_id) TABLESPACE pg_default;

create table public.user_profiles (
  id uuid not null default gen_random_uuid (),
  user_id text not null,
  username text not null,
  avatar text null default 'avatar1'::text,
  avatar_frame text null default 'none'::text,
  bio text null default 'Just started my trading journey! 🚀'::text,
  level integer null default 1,
  xp integer null default 0,
  xp_to_next_level integer null default 1000,
  created_at timestamp with time zone null default now(),
  last_updated timestamp with time zone null default now(),
  last_username_change timestamp with time zone null default now(),
  can_change_username boolean null default true,
  username_changes_count integer null default 0,
  constraint user_profiles_pkey primary key (id),
  constraint user_profiles_user_id_key unique (user_id)
) TABLESPACE pg_default;

create index IF not exists idx_user_profiles_user_id on public.user_profiles using btree (user_id) TABLESPACE pg_default;