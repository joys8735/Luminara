-- Supabase Backup
-- Generated: 2026-02-05T20:36:24.340Z

-- ====================================
-- Table: avatar_frames
-- ====================================

CREATE TABLE "avatar_frames" (
  "id" INTEGER NOT NULL DEFAULT nextval('avatar_frames_id_seq'::regclass),
  "frame_id" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "color" TEXT NOT NULL,
  "unlocked" BOOLEAN DEFAULT false,
  "unlock_requirement" TEXT,
  "rarity" TEXT NOT NULL,
  "image_url" TEXT
);


-- Дані для avatar_frames (4 рядків)
INSERT INTO "avatar_frames" ("id", "frame_id", "name", "color", "unlocked", "unlock_requirement", "rarity", "image_url") VALUES (1, 'none', 'No Frame', 'transparent', true, NULL, 'common', NULL);
INSERT INTO "avatar_frames" ("id", "frame_id", "name", "color", "unlocked", "unlock_requirement", "rarity", "image_url") VALUES (3, 'silver', 'Silver', '#C0C0C0', true, '2500 AP', 'rare', NULL);
INSERT INTO "avatar_frames" ("id", "frame_id", "name", "color", "unlocked", "unlock_requirement", "rarity", "image_url") VALUES (4, 'gold', 'Gold', '#FFD700', true, '10000 AP', 'epic', NULL);
INSERT INTO "avatar_frames" ("id", "frame_id", "name", "color", "unlocked", "unlock_requirement", "rarity", "image_url") VALUES (2, 'bronze', 'Bronze', '#CD7F32', true, '500 AP', 'common', 'https://foni.papik.pro/uploads/posts/2024-10/foni-papik-pro-gg65-p-kartinki-rozhki-dyavola-na-prozrachnom-fon-1.png');

-- ====================================
-- Table: avatars
-- ====================================

CREATE TABLE "avatars" (
  "id" INTEGER NOT NULL DEFAULT nextval('avatars_id_seq'::regclass),
  "avatar_id" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "unlocked" BOOLEAN DEFAULT false,
  "unlock_requirement" TEXT,
  "rarity" TEXT NOT NULL,
  "image_url" TEXT NOT NULL,
  "original_url" TEXT NOT NULL
);


-- Дані для avatars (5 рядків)
INSERT INTO "avatars" ("id", "avatar_id", "name", "unlocked", "unlock_requirement", "rarity", "image_url", "original_url") VALUES (1, 'avatar1', 'Classic Trader', true, NULL, 'common', 'https://static.beebom.com/wp-content/uploads/2022/02/Featured.jpg?w=750&quality=75&crop=0,0,100,100', 'https://static.beebom.com/wp-content/uploads/2022/02/Featured.jpg?w=750&quality=75&crop=0,0,100,100');
INSERT INTO "avatars" ("id", "avatar_id", "name", "unlocked", "unlock_requirement", "rarity", "image_url", "original_url") VALUES (2, 'avatar2', 'Blue Filter', true, NULL, 'common', 'https://pics.craiyon.com/2023-08-02/eae102a637ec410e9fa38d20b66e8ff8.webp', 'https://pics.craiyon.com/2023-08-02/eae102a637ec410e9fa38d20b66e8ff8.webp');
INSERT INTO "avatars" ("id", "avatar_id", "name", "unlocked", "unlock_requirement", "rarity", "image_url", "original_url") VALUES (3, 'avatar3', 'Zoom In', true, NULL, 'common', 'https://nftevening.com/wp-content/uploads/2022/05/Lil-Baby-DeadFellaz-3439.png', 'https://nftevening.com/wp-content/uploads/2022/05/Lil-Baby-DeadFellaz-3439.png');
INSERT INTO "avatars" ("id", "avatar_id", "name", "unlocked", "unlock_requirement", "rarity", "image_url", "original_url") VALUES (4, 'avatar4', 'Grayscale', true, 'NULL', 'rare', 'https://i.pinimg.com/736x/67/bc/91/67bc916bd54bebec3544c6e0e7cfe0ad.jpg', 'https://i.pinimg.com/736x/67/bc/91/67bc916bd54bebec3544c6e0e7cfe0ad.jpg');
INSERT INTO "avatars" ("id", "avatar_id", "name", "unlocked", "unlock_requirement", "rarity", "image_url", "original_url") VALUES (5, 'avatar5', 'Vintage', false, 'NULL', 'rare', 'https://airnfts.s3.amazonaws.com/profile-images/20211123/0x0184461978d64EdDc068e83e0bA67Ce1c84E0410_1637629464443.gif', 'https://airnfts.s3.amazonaws.com/profile-images/20211123/0x0184461978d64EdDc068e83e0bA67Ce1c84E0410_1637629464443.gif');

-- ====================================
-- Table: daily_stats
-- ====================================

CREATE TABLE "daily_stats" (
  "id" UUID NOT NULL DEFAULT gen_random_uuid(),
  "user_id" TEXT NOT NULL,
  "date" DATE NOT NULL DEFAULT CURRENT_DATE,
  "total_deposited" NUMERIC DEFAULT 0,
  "total_withdrawn" NUMERIC DEFAULT 0,
  "prediction_spent" NUMERIC DEFAULT 0,
  "prediction_won" NUMERIC DEFAULT 0,
  "net_pnl" NUMERIC DEFAULT 0,
  "total_fees" NUMERIC DEFAULT 0
);


-- ====================================
-- Table: platform_fees
-- ====================================

CREATE TABLE "platform_fees" (
  "id" INTEGER NOT NULL DEFAULT nextval('platform_fees_id_seq'::regclass),
  "fee_type" CHARACTER VARYING(50) NOT NULL,
  "fee_percent" NUMERIC NOT NULL DEFAULT 0,
  "min_amount" NUMERIC DEFAULT 0,
  "max_amount" NUMERIC,
  "is_active" BOOLEAN DEFAULT true,
  "description" TEXT,
  "created_at" TIMESTAMP WITHOUT TIME ZONE DEFAULT now(),
  "updated_at" TIMESTAMP WITHOUT TIME ZONE DEFAULT now()
);


-- Дані для platform_fees (4 рядків)
INSERT INTO "platform_fees" ("id", "fee_type", "fee_percent", "min_amount", "max_amount", "is_active", "description", "created_at", "updated_at") VALUES (1, 'deposit', '0.10', '0.000000', NULL, true, 'Комісія за депозит', '"2026-02-01T18:18:00.705Z"', '"2026-02-01T18:18:00.705Z"');
INSERT INTO "platform_fees" ("id", "fee_type", "fee_percent", "min_amount", "max_amount", "is_active", "description", "created_at", "updated_at") VALUES (2, 'withdrawal', '0.20', '0.001000', '100.000000', true, 'Комісія за виведення', '"2026-02-01T18:18:00.705Z"', '"2026-02-01T18:18:00.705Z"');
INSERT INTO "platform_fees" ("id", "fee_type", "fee_percent", "min_amount", "max_amount", "is_active", "description", "created_at", "updated_at") VALUES (3, 'prediction_bet', '0.00', '0.000000', NULL, true, 'Комісія за ставку', '"2026-02-01T18:18:00.705Z"', '"2026-02-01T18:18:00.705Z"');
INSERT INTO "platform_fees" ("id", "fee_type", "fee_percent", "min_amount", "max_amount", "is_active", "description", "created_at", "updated_at") VALUES (4, 'prediction_win', '2.00', '0.000000', NULL, true, 'Комісія з виграшу', '"2026-02-01T18:18:00.705Z"', '"2026-02-01T18:18:00.705Z"');

-- ====================================
-- Table: predictions
-- ====================================

CREATE TABLE "predictions" (
  "id" UUID NOT NULL DEFAULT gen_random_uuid(),
  "user_id" TEXT NOT NULL,
  "prediction_id" CHARACTER VARYING(50) NOT NULL,
  "asset" CHARACTER VARYING(20) NOT NULL,
  "direction" CHARACTER VARYING(10),
  "amount" NUMERIC NOT NULL,
  "entry_price" NUMERIC NOT NULL,
  "target_price" NUMERIC,
  "stop_loss" NUMERIC,
  "leverage" INTEGER DEFAULT 1,
  "pnl" NUMERIC,
  "pnl_percent" NUMERIC,
  "status" CHARACTER VARYING(20) DEFAULT 'open'::character varying,
  "opened_at" TIMESTAMP WITHOUT TIME ZONE DEFAULT now(),
  "closed_at" TIMESTAMP WITHOUT TIME ZONE,
  "duration" INTEGER,
  "metadata" JSONB DEFAULT '{}'::jsonb,
  "created_at" TIMESTAMP WITHOUT TIME ZONE DEFAULT now()
);


-- ====================================
-- Table: user_profiles
-- ====================================

CREATE TABLE "user_profiles" (
  "id" UUID NOT NULL DEFAULT gen_random_uuid(),
  "user_id" TEXT NOT NULL,
  "username" TEXT NOT NULL,
  "avatar" TEXT DEFAULT 'avatar1'::text,
  "avatar_frame" TEXT DEFAULT 'none'::text,
  "bio" TEXT DEFAULT 'Just started my trading journey! 🚀'::text,
  "level" INTEGER NOT NULL DEFAULT 1,
  "xp" INTEGER DEFAULT 0,
  "xp_to_next_level" INTEGER DEFAULT 1000,
  "created_at" TIMESTAMP WITH TIME ZONE DEFAULT now(),
  "last_updated" TIMESTAMP WITH TIME ZONE DEFAULT now(),
  "last_username_change" TIMESTAMP WITH TIME ZONE DEFAULT now(),
  "can_change_username" BOOLEAN DEFAULT true,
  "username_changes_count" INTEGER DEFAULT 0
);


-- Дані для user_profiles (11 рядків)
INSERT INTO "user_profiles" ("id", "user_id", "username", "avatar", "avatar_frame", "bio", "level", "xp", "xp_to_next_level", "created_at", "last_updated", "last_username_change", "can_change_username", "username_changes_count") VALUES ('ac1d3332-2b5e-45e8-94c2-3d23e8123714', '7fe2c34e-1aeb-4a39-8199-8d403fdb2cbe', 'Вальтрон', 'avatar1', 'bronze', 'Just started my trading journey! 🚀', 1, 0, 1000, '"2026-01-27T21:10:43.697Z"', '"2026-02-05T17:20:26.974Z"', '"2026-01-27T21:24:30.416Z"', false, 1);
INSERT INTO "user_profiles" ("id", "user_id", "username", "avatar", "avatar_frame", "bio", "level", "xp", "xp_to_next_level", "created_at", "last_updated", "last_username_change", "can_change_username", "username_changes_count") VALUES ('7e1faba4-a7d6-473c-b540-a39717fc9eb1', '0xBDDff8122D35b01fD0b16194d8d1a0a9056f5b0a', 'test_user', 'avatar1', 'none', 'Just started my trading journey! 🚀', 1, 0, 1000, '"2026-02-01T21:01:49.026Z"', '"2026-02-01T21:01:49.026Z"', '"2026-02-01T21:01:49.026Z"', true, 0);
INSERT INTO "user_profiles" ("id", "user_id", "username", "avatar", "avatar_frame", "bio", "level", "xp", "xp_to_next_level", "created_at", "last_updated", "last_username_change", "can_change_username", "username_changes_count") VALUES ('7c6a5918-fc65-41e5-b295-2229e5af1017', 'wallet_0xbddff8122d35b01fd0b16194d8d1a0a9056f5b0a', 'wallet_bddff812', 'avatar1', 'none', 'Just started my trading journey! 🚀', 1, 0, 1000, '"2026-02-01T22:56:13.625Z"', '"2026-02-01T22:56:13.625Z"', '"2026-02-01T22:56:13.625Z"', true, 0);
INSERT INTO "user_profiles" ("id", "user_id", "username", "avatar", "avatar_frame", "bio", "level", "xp", "xp_to_next_level", "created_at", "last_updated", "last_username_change", "can_change_username", "username_changes_count") VALUES ('148d1d75-668d-4038-baa9-39fe95ef8cba', '371356b9-9862-4cc6-9734-2ec9d2b35912', 'Dj Melony', 'avatar1', 'none', 'Just started my trading journey! 🚀', 1, 0, 1000, '"2026-02-01T23:20:05.255Z"', '"2026-02-01T23:20:05.255Z"', '"2026-02-01T23:20:05.255Z"', true, 0);
INSERT INTO "user_profiles" ("id", "user_id", "username", "avatar", "avatar_frame", "bio", "level", "xp", "xp_to_next_level", "created_at", "last_updated", "last_username_change", "can_change_username", "username_changes_count") VALUES ('7f8f0485-76cd-41b7-98f4-771a9b301496', '876d3c2b-ebfb-40b0-bbc3-769d748223a0', '@toki', 'avatar2', 'bronze', 'Just started my trading journey! 🚀', 1, 0, 1000, '"2026-01-27T22:01:41.806Z"', '"2026-02-02T22:08:07.242Z"', '"2026-01-28T16:01:16.490Z"', false, 1);
INSERT INTO "user_profiles" ("id", "user_id", "username", "avatar", "avatar_frame", "bio", "level", "xp", "xp_to_next_level", "created_at", "last_updated", "last_username_change", "can_change_username", "username_changes_count") VALUES ('65d6e63e-aeb2-4633-bd2a-0e746e8c3d05', '933c4745-d1de-4bd8-9401-b0f2ebf498f5', 'Босман Грозний', 'avatar1', 'none', 'Just started my trading journey! 🚀', 1, 0, 1000, '"2026-01-28T16:04:35.768Z"', '"2026-01-28T16:04:35.768Z"', '"2026-01-28T16:04:35.768Z"', true, 0);
INSERT INTO "user_profiles" ("id", "user_id", "username", "avatar", "avatar_frame", "bio", "level", "xp", "xp_to_next_level", "created_at", "last_updated", "last_username_change", "can_change_username", "username_changes_count") VALUES ('647b9eea-efb8-4c5a-8db5-4c79daf66257', '530e80ce-e46c-47cd-ba43-f75349c7915a', 'Villa Cream', 'avatar1', 'none', 'Just started my trading journey! 🚀', 1, 0, 1000, '"2026-01-27T21:13:01.366Z"', '"2026-01-27T21:13:01.366Z"', '"2026-01-27T21:13:01.366Z"', true, 0);
INSERT INTO "user_profiles" ("id", "user_id", "username", "avatar", "avatar_frame", "bio", "level", "xp", "xp_to_next_level", "created_at", "last_updated", "last_username_change", "can_change_username", "username_changes_count") VALUES ('1c3aac28-0757-4b1d-a341-e009d476956f', '9a5a7140-d83d-4870-899c-d3903fe19a07', 'Polina', 'avatar4', 'none', 'Just started my trading journey! 🚀', 1, 0, 1000, '"2026-01-27T21:25:33.396Z"', '"2026-01-27T21:53:19.435Z"', '"2026-01-27T21:25:33.396Z"', true, 0);
INSERT INTO "user_profiles" ("id", "user_id", "username", "avatar", "avatar_frame", "bio", "level", "xp", "xp_to_next_level", "created_at", "last_updated", "last_username_change", "can_change_username", "username_changes_count") VALUES ('b8fc82de-c8d8-4581-ad36-541327a535b8', 'ec0cd65b-da08-4b14-8324-1971dff47806', 'Mr.Joys', 'avatar4', 'gold', 'Just started my trading journey! 🚀', 1, 0, 1000, '"2026-02-02T22:17:28.435Z"', '"2026-02-03T18:10:05.498Z"', '"2026-02-03T18:10:05.498Z"', false, 1);
INSERT INTO "user_profiles" ("id", "user_id", "username", "avatar", "avatar_frame", "bio", "level", "xp", "xp_to_next_level", "created_at", "last_updated", "last_username_change", "can_change_username", "username_changes_count") VALUES ('b66105ce-096e-4132-99ff-febb99b8f587', '212d082b-14f1-4083-8cee-0a879ae685de', 'soska piska', 'avatar2', 'bronze', 'Just started my trading journey! 🚀', 1, 500, 1000, '"2026-01-28T16:13:36.047Z"', '"2026-02-03T22:48:31.727Z"', '"2026-01-28T16:13:36.047Z"', true, 0);
INSERT INTO "user_profiles" ("id", "user_id", "username", "avatar", "avatar_frame", "bio", "level", "xp", "xp_to_next_level", "created_at", "last_updated", "last_username_change", "can_change_username", "username_changes_count") VALUES ('aa6f2dc6-6974-4f6d-abca-a1da1d30659e', 'e35b34d3-426c-4fba-9eca-3fe3a6b2c66b', 'West Stein', 'avatar4', 'none', 'Just started my trading journey! 🚀', 1, 0, 1000, '"2026-01-27T21:56:20.358Z"', '"2026-01-27T21:59:47.420Z"', '"2026-01-27T21:56:20.358Z"', true, 0);

-- ====================================
-- Table: user_wallets
-- ====================================

CREATE TABLE "user_wallets" (
  "id" UUID NOT NULL DEFAULT gen_random_uuid(),
  "profile_id" UUID NOT NULL,
  "wallet_address" TEXT NOT NULL,
  "wallet_type" TEXT DEFAULT 'metamask'::text,
  "is_primary" BOOLEAN DEFAULT true,
  "created_at" TIMESTAMP WITH TIME ZONE DEFAULT now()
);


-- ====================================
-- Table: vault_transactions
-- ====================================

CREATE TABLE "vault_transactions" (
  "id" UUID NOT NULL DEFAULT gen_random_uuid(),
  "vault_id" UUID,
  "type" CHARACTER VARYING(20),
  "asset" CHARACTER VARYING(10),
  "amount" NUMERIC NOT NULL,
  "fee" NUMERIC DEFAULT 0,
  "net_amount" NUMERIC NOT NULL,
  "status" CHARACTER VARYING(20) DEFAULT 'pending'::character varying,
  "tx_hash" CHARACTER VARYING(66),
  "on_chain" BOOLEAN DEFAULT false,
  "from_address" CHARACTER VARYING(42),
  "to_address" CHARACTER VARYING(42),
  "metadata" JSONB DEFAULT '{}'::jsonb,
  "confirmed_at" TIMESTAMP WITHOUT TIME ZONE,
  "created_at" TIMESTAMP WITHOUT TIME ZONE DEFAULT now(),
  "updated_at" TIMESTAMP WITHOUT TIME ZONE DEFAULT now()
);


-- Дані для vault_transactions (24 рядків)
INSERT INTO "vault_transactions" ("id", "vault_id", "type", "asset", "amount", "fee", "net_amount", "status", "tx_hash", "on_chain", "from_address", "to_address", "metadata", "confirmed_at", "created_at", "updated_at") VALUES ('432186f9-9e0c-4cf6-bc62-603300d4ba17', '95937a02-8d6b-49a9-87a5-57bd0664fa01', 'deposit', 'USDT', '90.000000', '0.090000', '89.910000', 'completed', '0xf7fd34884fe9e651b634f7c5017ebdeb302e0e2cb900dd80322b8f18ff750200', false, '0xbddff8122d35b01fd0b16194d8d1a0a9056f5b0a', '0x34f26715d6fCfCAbd3F3eDaa6936Ff120E99d013', '{"method":"depositUSDT"}', '"2026-02-02T13:32:38.651Z"', '"2026-02-02T13:32:38.651Z"', '"2026-02-02T13:32:38.651Z"');
INSERT INTO "vault_transactions" ("id", "vault_id", "type", "asset", "amount", "fee", "net_amount", "status", "tx_hash", "on_chain", "from_address", "to_address", "metadata", "confirmed_at", "created_at", "updated_at") VALUES ('63ab0020-8f67-4d55-b39d-4c9c596828ed', '95937a02-8d6b-49a9-87a5-57bd0664fa01', 'deposit', 'USDT', '200.000000', '0.200000', '199.800000', 'completed', '0xfd6505cae9204cbcde21b58ca1e8cc2c36b81e7cc76eb47b30dc112958314776', false, '0xbddff8122d35b01fd0b16194d8d1a0a9056f5b0a', '0x34f26715d6fCfCAbd3F3eDaa6936Ff120E99d013', '{"method":"depositUSDT","timestamp":"2026-02-02T14:34:12.319Z","asset_price":1}', '"2026-02-02T13:34:13.837Z"', '"2026-02-02T13:34:13.837Z"', '"2026-02-02T13:34:13.926Z"');
INSERT INTO "vault_transactions" ("id", "vault_id", "type", "asset", "amount", "fee", "net_amount", "status", "tx_hash", "on_chain", "from_address", "to_address", "metadata", "confirmed_at", "created_at", "updated_at") VALUES ('be0a95f7-a20d-4b2b-827d-08e1c5e24ff5', '95937a02-8d6b-49a9-87a5-57bd0664fa01', 'deposit', 'USDT', '200.000000', '0.200000', '199.800000', 'completed', '0xfd6505cae9204cbcde21b58ca1e8cc2c36b81e7cc76eb47b30dc112958314776', false, '0xbddff8122d35b01fd0b16194d8d1a0a9056f5b0a', '0x34f26715d6fCfCAbd3F3eDaa6936Ff120E99d013', '{"method":"depositUSDT","timestamp":"2026-02-02T14:34:13.871Z","asset_price":1}', '"2026-02-02T13:34:15.193Z"', '"2026-02-02T13:34:15.193Z"', '"2026-02-02T13:34:15.240Z"');
INSERT INTO "vault_transactions" ("id", "vault_id", "type", "asset", "amount", "fee", "net_amount", "status", "tx_hash", "on_chain", "from_address", "to_address", "metadata", "confirmed_at", "created_at", "updated_at") VALUES ('8e8c4d09-eeb4-4265-8d26-1544d4d70f3f', '95937a02-8d6b-49a9-87a5-57bd0664fa01', 'deposit', 'USDT', '4000.000000', '4.000000', '3996.000000', 'completed', '0xf5ad3ff03ba40b00a3f30abd50fe4fb20ec5188eca41bc293c7cb23fe5895991', false, '0xbddff8122d35b01fd0b16194d8d1a0a9056f5b0a', '0x34f26715d6fCfCAbd3F3eDaa6936Ff120E99d013', '{"method":"depositUSDT","timestamp":"2026-02-02T14:45:55.425Z","asset_price":1}', '"2026-02-02T13:45:56.853Z"', '"2026-02-02T13:45:56.853Z"', '"2026-02-02T13:45:56.919Z"');
INSERT INTO "vault_transactions" ("id", "vault_id", "type", "asset", "amount", "fee", "net_amount", "status", "tx_hash", "on_chain", "from_address", "to_address", "metadata", "confirmed_at", "created_at", "updated_at") VALUES ('ca4c28cf-0286-4a1c-b598-1d465c27591b', '95937a02-8d6b-49a9-87a5-57bd0664fa01', 'deposit', 'BNB', '0.100000', '0.000100', '0.099900', 'completed', '0x4b06586070896ea2d655cecb9389f917bb47312356acae53557025241ff0928b', false, '0xbddff8122d35b01fd0b16194d8d1a0a9056f5b0a', '0x34f26715d6fCfCAbd3F3eDaa6936Ff120E99d013', '{"method":"depositBNB","timestamp":"2026-02-02T14:58:06.018Z","asset_price":300}', '"2026-02-02T13:58:07.231Z"', '"2026-02-02T13:58:07.230Z"', '"2026-02-02T13:58:07.285Z"');
INSERT INTO "vault_transactions" ("id", "vault_id", "type", "asset", "amount", "fee", "net_amount", "status", "tx_hash", "on_chain", "from_address", "to_address", "metadata", "confirmed_at", "created_at", "updated_at") VALUES ('3c79e754-4c2a-4b26-969d-63c882e791c7', '95937a02-8d6b-49a9-87a5-57bd0664fa01', 'deposit', 'BNB', '0.100000', '0.000100', '0.099900', 'completed', '0xd2309bf07dc2f122480971186d4cc0e1a5b43977d754ccc79aeaf17743b14eae', false, '0xbddff8122d35b01fd0b16194d8d1a0a9056f5b0a', '0x34f26715d6fCfCAbd3F3eDaa6936Ff120E99d013', '{"method":"depositBNB","timestamp":"2026-02-02T15:16:20.965Z","asset_price":300}', '"2026-02-02T14:16:22.177Z"', '"2026-02-02T14:16:22.177Z"', '"2026-02-02T14:16:22.241Z"');
INSERT INTO "vault_transactions" ("id", "vault_id", "type", "asset", "amount", "fee", "net_amount", "status", "tx_hash", "on_chain", "from_address", "to_address", "metadata", "confirmed_at", "created_at", "updated_at") VALUES ('d3921359-4335-47fd-9a6a-3baeb55dacc8', '95937a02-8d6b-49a9-87a5-57bd0664fa01', 'deposit', 'USDT', '500.000000', '0.500000', '499.500000', 'completed', '0x674fd4c217f9479cd0073628afc08d9e622c69e6a0167c0a380bf94ad928c6e3', false, '0xbddff8122d35b01fd0b16194d8d1a0a9056f5b0a', '0x34f26715d6fCfCAbd3F3eDaa6936Ff120E99d013', '{"method":"depositUSDT","timestamp":"2026-02-02T15:28:07.370Z","asset_price":1}', '"2026-02-02T14:28:08.484Z"', '"2026-02-02T14:28:08.484Z"', '"2026-02-02T14:28:08.553Z"');
INSERT INTO "vault_transactions" ("id", "vault_id", "type", "asset", "amount", "fee", "net_amount", "status", "tx_hash", "on_chain", "from_address", "to_address", "metadata", "confirmed_at", "created_at", "updated_at") VALUES ('2dc30d9d-b9d3-4964-9f78-e1386817a402', '95937a02-8d6b-49a9-87a5-57bd0664fa01', 'withdrawal', 'USDT', '50.000000', '0.050000', '49.950000', 'completed', '0xa0144b7b60e0fe5783cab45bfbc408d470a4bedcd7550024b23cb50e8d067bb7', false, '0x34f26715d6fCfCAbd3F3eDaa6936Ff120E99d013', '0xbddff8122d35b01fd0b16194d8d1a0a9056f5b0a', '{"method":"withdrawUSDT","timestamp":"2026-02-02T15:35:30.049Z","asset_price":1}', '"2026-02-02T14:35:32.240Z"', '"2026-02-02T14:35:32.240Z"', '"2026-02-02T14:35:32.285Z"');
INSERT INTO "vault_transactions" ("id", "vault_id", "type", "asset", "amount", "fee", "net_amount", "status", "tx_hash", "on_chain", "from_address", "to_address", "metadata", "confirmed_at", "created_at", "updated_at") VALUES ('0579a00c-86af-4ce5-b15a-281aea023604', '95937a02-8d6b-49a9-87a5-57bd0664fa01', 'deposit', 'BNB', '0.100000', '0.000100', '0.099900', 'completed', '0x639c41f285222bae41f7311b77ebcada3b499f167869b54e01cad09bdcb0304f', false, '0xbddff8122d35b01fd0b16194d8d1a0a9056f5b0a', '0x34f26715d6fCfCAbd3F3eDaa6936Ff120E99d013', '{"method":"depositBNB","timestamp":"2026-02-02T15:36:12.631Z","asset_price":300}', '"2026-02-02T14:36:13.746Z"', '"2026-02-02T14:36:13.746Z"', '"2026-02-02T14:36:13.859Z"');
INSERT INTO "vault_transactions" ("id", "vault_id", "type", "asset", "amount", "fee", "net_amount", "status", "tx_hash", "on_chain", "from_address", "to_address", "metadata", "confirmed_at", "created_at", "updated_at") VALUES ('122d3d72-a76e-4fd1-af5c-32653c6069e0', '95937a02-8d6b-49a9-87a5-57bd0664fa01', 'withdrawal', 'BNB', '0.099900', '0.000100', '0.099800', 'completed', '0xfa568af0a8a6a8850ac69eece25fb372728f1c9e52e140e248fb0fba01ebe5f9', false, '0x34f26715d6fCfCAbd3F3eDaa6936Ff120E99d013', '0xbddff8122d35b01fd0b16194d8d1a0a9056f5b0a', '{"method":"withdrawBNB","timestamp":"2026-02-02T15:36:44.323Z","asset_price":300}', '"2026-02-02T14:36:45.488Z"', '"2026-02-02T14:36:45.488Z"', '"2026-02-02T14:36:45.543Z"');
INSERT INTO "vault_transactions" ("id", "vault_id", "type", "asset", "amount", "fee", "net_amount", "status", "tx_hash", "on_chain", "from_address", "to_address", "metadata", "confirmed_at", "created_at", "updated_at") VALUES ('07394ba2-a8e4-49df-a112-c13640d84598', '95937a02-8d6b-49a9-87a5-57bd0664fa01', 'deposit', 'USDT', '600.000000', '0.600000', '599.400000', 'completed', '0x354943c72facace39efd6291bb5a16bac0ef22cf64d929ce5ad8922753fcfe8e', false, '0xbddff8122d35b01fd0b16194d8d1a0a9056f5b0a', '0x34f26715d6fCfCAbd3F3eDaa6936Ff120E99d013', '{"method":"depositUSDT","timestamp":"2026-02-02T15:50:53.319Z","asset_price":1}', '"2026-02-02T14:50:54.795Z"', '"2026-02-02T14:50:54.795Z"', '"2026-02-02T14:50:54.845Z"');
INSERT INTO "vault_transactions" ("id", "vault_id", "type", "asset", "amount", "fee", "net_amount", "status", "tx_hash", "on_chain", "from_address", "to_address", "metadata", "confirmed_at", "created_at", "updated_at") VALUES ('c8733259-54bc-407d-a778-741f3f88a100', '95937a02-8d6b-49a9-87a5-57bd0664fa01', 'withdrawal', 'USDT', '90.000000', '0.090000', '89.910000', 'completed', '0xf3bfb89fe88d5260787668ab2b31f0d520a9eb6eb7fdb61aa5a7716e31cfd712', false, '0x34f26715d6fCfCAbd3F3eDaa6936Ff120E99d013', '0xbddff8122d35b01fd0b16194d8d1a0a9056f5b0a', '{"method":"withdrawUSDT","timestamp":"2026-02-02T15:52:01.795Z","asset_price":1}', '"2026-02-02T14:52:03.551Z"', '"2026-02-02T14:52:03.551Z"', '"2026-02-02T14:52:03.628Z"');
INSERT INTO "vault_transactions" ("id", "vault_id", "type", "asset", "amount", "fee", "net_amount", "status", "tx_hash", "on_chain", "from_address", "to_address", "metadata", "confirmed_at", "created_at", "updated_at") VALUES ('75f7fc22-363f-4644-87c4-cf5b76be6dbb', '95937a02-8d6b-49a9-87a5-57bd0664fa01', 'deposit', 'BNB', '0.100000', '0.000100', '0.099900', 'completed', '0xd6fccc9ac48a9eef1d4d0850665b4484e575f839ac228ffc90c8cad7da0acfad', false, '0xbddff8122d35b01fd0b16194d8d1a0a9056f5b0a', '0x34f26715d6fCfCAbd3F3eDaa6936Ff120E99d013', '{"method":"depositBNB","timestamp":"2026-02-02T15:52:44.653Z","asset_price":300}', '"2026-02-02T14:52:45.958Z"', '"2026-02-02T14:52:45.958Z"', '"2026-02-02T14:52:46.053Z"');
INSERT INTO "vault_transactions" ("id", "vault_id", "type", "asset", "amount", "fee", "net_amount", "status", "tx_hash", "on_chain", "from_address", "to_address", "metadata", "confirmed_at", "created_at", "updated_at") VALUES ('f8219746-f683-4dc9-a65f-e1e9fc4aa7ff', '95937a02-8d6b-49a9-87a5-57bd0664fa01', 'withdrawal', 'BNB', '0.099900', '0.000100', '0.099800', 'completed', '0x02ce22227e09890db24486ea256b246fd077d273fc7f57452e40dee0a810d6ce', false, '0x34f26715d6fCfCAbd3F3eDaa6936Ff120E99d013', '0xbddff8122d35b01fd0b16194d8d1a0a9056f5b0a', '{"method":"withdrawBNB","timestamp":"2026-02-02T15:53:59.433Z","asset_price":300}', '"2026-02-02T14:54:00.922Z"', '"2026-02-02T14:54:00.922Z"', '"2026-02-02T15:24:44.096Z"');
INSERT INTO "vault_transactions" ("id", "vault_id", "type", "asset", "amount", "fee", "net_amount", "status", "tx_hash", "on_chain", "from_address", "to_address", "metadata", "confirmed_at", "created_at", "updated_at") VALUES ('752d054c-1928-437a-9c8d-e6b82d336dd8', '95937a02-8d6b-49a9-87a5-57bd0664fa01', 'deposit', 'USDT', '150.000000', '0.150000', '149.850000', 'completed', '0xce7557611c9ba427d30af9502066df9feefe2a9fb28324f24c1ff4055db78ad6', false, '0x565fbd50836b0b70f2173e0901aaf8a2cdaed867', '0x34f26715d6fCfCAbd3F3eDaa6936Ff120E99d013', '{"method":"depositUSDT","timestamp":"2026-02-02T16:49:34.995Z","asset_price":1}', '"2026-02-02T15:49:36.195Z"', '"2026-02-02T15:49:36.195Z"', '"2026-02-02T15:49:36.256Z"');
INSERT INTO "vault_transactions" ("id", "vault_id", "type", "asset", "amount", "fee", "net_amount", "status", "tx_hash", "on_chain", "from_address", "to_address", "metadata", "confirmed_at", "created_at", "updated_at") VALUES ('1ff6e1eb-7ec3-41e4-8dd1-7ed7fc5a5b87', '95937a02-8d6b-49a9-87a5-57bd0664fa01', 'deposit', 'USDT', '333.000000', '0.333000', '332.667000', 'completed', '0x65bb23cd853d9800b1935ae24bc6a15eb52a994dc127244d743d959e4d119ac5', false, '0xbddff8122d35b01fd0b16194d8d1a0a9056f5b0a', '0x34f26715d6fCfCAbd3F3eDaa6936Ff120E99d013', '{"method":"depositUSDT","timestamp":"2026-02-02T16:53:44.738Z","asset_price":1}', '"2026-02-02T15:53:47.843Z"', '"2026-02-02T15:53:47.843Z"', '"2026-02-02T15:53:47.917Z"');
INSERT INTO "vault_transactions" ("id", "vault_id", "type", "asset", "amount", "fee", "net_amount", "status", "tx_hash", "on_chain", "from_address", "to_address", "metadata", "confirmed_at", "created_at", "updated_at") VALUES ('037e9b3b-21b4-45c9-b2ad-47f22f6c5039', '95937a02-8d6b-49a9-87a5-57bd0664fa01', 'deposit', 'USDT', '90.000000', '0.090000', '89.910000', 'completed', '0x6907465791cc34f4237217a430630709d2e77f2fe564dd135c611bdf43d7d1d8', false, '0x565fbd50836b0b70f2173e0901aaf8a2cdaed867', '0x34f26715d6fCfCAbd3F3eDaa6936Ff120E99d013', '{"method":"depositUSDT","timestamp":"2026-02-02T16:55:57.260Z","asset_price":1}', '"2026-02-02T15:55:58.707Z"', '"2026-02-02T15:55:58.707Z"', '"2026-02-02T15:55:58.776Z"');
INSERT INTO "vault_transactions" ("id", "vault_id", "type", "asset", "amount", "fee", "net_amount", "status", "tx_hash", "on_chain", "from_address", "to_address", "metadata", "confirmed_at", "created_at", "updated_at") VALUES ('ae01d6a8-c67c-4384-a9eb-f701fa1cf0bb', '95937a02-8d6b-49a9-87a5-57bd0664fa01', 'withdrawal', 'USDT', '59.000000', '0.059000', '58.941000', 'completed', '0x8046e7199639a555d80567d9650efbdbeb73af0a690e0ebbb3bcba471b79c99d', false, '0x34f26715d6fCfCAbd3F3eDaa6936Ff120E99d013', '0x565fbd50836b0b70f2173e0901aaf8a2cdaed867', '{"method":"withdrawUSDT","timestamp":"2026-02-02T18:05:13.368Z","asset_price":1}', '"2026-02-02T17:05:14.815Z"', '"2026-02-02T17:05:14.815Z"', '"2026-02-02T17:05:14.884Z"');
INSERT INTO "vault_transactions" ("id", "vault_id", "type", "asset", "amount", "fee", "net_amount", "status", "tx_hash", "on_chain", "from_address", "to_address", "metadata", "confirmed_at", "created_at", "updated_at") VALUES ('6d04e010-5047-4ed6-a07f-0c45759a077e', '16bfd4a9-c6aa-4090-abee-1337e3552bcf', 'deposit', 'BNB', '0.000100', '0.000000', '0.000100', 'completed', '0x83d9fc720bc42b8f055cc35a5bffc8734a8fc5cd2fdb6a6a1baa8da688e5dbc6', false, '0x82bf00a547336e6b2fb86300b01b8a6d366d501f', '0x34f26715d6fCfCAbd3F3eDaa6936Ff120E99d013', '{"method":"depositBNB","timestamp":"2026-02-02T19:01:24.832Z","asset_price":300}', '"2026-02-02T18:01:26.075Z"', '"2026-02-02T18:01:26.075Z"', '"2026-02-02T18:01:26.130Z"');
INSERT INTO "vault_transactions" ("id", "vault_id", "type", "asset", "amount", "fee", "net_amount", "status", "tx_hash", "on_chain", "from_address", "to_address", "metadata", "confirmed_at", "created_at", "updated_at") VALUES ('64512f72-d793-4939-bd36-d8b2e855c7b0', 'c22234d5-84e3-4481-9346-183c1e0c30e1', 'deposit', 'BNB', '0.010000', '0.000010', '0.009990', 'completed', '0x2fcc6fed035c1c3a7392b011c8b038bf72a4d3184866fba8c094012a914862bd', false, '0x8cd86e2129594c276140c4caf316360ce6a49a51', '0x34f26715d6fCfCAbd3F3eDaa6936Ff120E99d013', '{"method":"depositBNB","timestamp":"2026-02-02T19:07:47.530Z","asset_price":300}', '"2026-02-02T18:07:48.761Z"', '"2026-02-02T18:07:48.761Z"', '"2026-02-02T18:07:48.802Z"');
INSERT INTO "vault_transactions" ("id", "vault_id", "type", "asset", "amount", "fee", "net_amount", "status", "tx_hash", "on_chain", "from_address", "to_address", "metadata", "confirmed_at", "created_at", "updated_at") VALUES ('63294524-bb40-44a0-a814-6552f13dc769', 'bc1c7da6-d031-499a-9c66-2807fd7717cf', 'deposit', 'BNB', '0.004000', '0.000004', '0.003996', 'completed', '0xf93aa2cf90881dae9986cdca0b03a57d4e5d9acc0f49930e77e5fd87aea73077', false, '0x237bef6650d8621bee3937f131673d9dea49aaed', '0x34f26715d6fCfCAbd3F3eDaa6936Ff120E99d013', '{"method":"depositBNB","timestamp":"2026-02-02T22:21:33.077Z","asset_price":300}', '"2026-02-02T21:21:34.173Z"', '"2026-02-02T21:21:34.173Z"', '"2026-02-02T21:21:34.223Z"');
INSERT INTO "vault_transactions" ("id", "vault_id", "type", "asset", "amount", "fee", "net_amount", "status", "tx_hash", "on_chain", "from_address", "to_address", "metadata", "confirmed_at", "created_at", "updated_at") VALUES ('270f7263-4f4b-4244-98cd-506037feaf77', 'bc1c7da6-d031-499a-9c66-2807fd7717cf', 'deposit', 'BNB', '0.002000', '0.000002', '0.001998', 'completed', '0x4ed17704fa5902a5aa443b8deee86f500d67a9a469984006fdf7bd74d90041e9', false, '0x237bef6650d8621bee3937f131673d9dea49aaed', '0x34f26715d6fCfCAbd3F3eDaa6936Ff120E99d013', '{"method":"depositBNB","timestamp":"2026-02-02T22:30:01.620Z","asset_price":300}', '"2026-02-02T21:30:07.330Z"', '"2026-02-02T21:30:07.330Z"', '"2026-02-02T21:30:07.376Z"');
INSERT INTO "vault_transactions" ("id", "vault_id", "type", "asset", "amount", "fee", "net_amount", "status", "tx_hash", "on_chain", "from_address", "to_address", "metadata", "confirmed_at", "created_at", "updated_at") VALUES ('cc62eb83-0515-401b-a073-fa89325a1ca3', 'bc1c7da6-d031-499a-9c66-2807fd7717cf', 'deposit', 'BNB', '0.001000', '0.000001', '0.000999', 'completed', '0x1f8cb07512692a154bfe08b254011a64da3412cfb45b183bdd3bc67a6a7838cc', false, '0x237bef6650d8621bee3937f131673d9dea49aaed', '0x34f26715d6fCfCAbd3F3eDaa6936Ff120E99d013', '{"method":"depositBNB","timestamp":"2026-02-02T22:34:59.127Z","asset_price":300}', '"2026-02-02T21:35:00.590Z"', '"2026-02-02T21:35:00.590Z"', '"2026-02-02T21:35:00.642Z"');
INSERT INTO "vault_transactions" ("id", "vault_id", "type", "asset", "amount", "fee", "net_amount", "status", "tx_hash", "on_chain", "from_address", "to_address", "metadata", "confirmed_at", "created_at", "updated_at") VALUES ('6e3b6706-6b32-41ff-91b0-dc319c026875', 'bc1c7da6-d031-499a-9c66-2807fd7717cf', 'withdrawal', 'BNB', '0.006993', '0.000007', '0.006986', 'completed', '0x10773b2f04b58921e8c97feb0a764f7bf52129dd2f0fa5c5bf008ed3259881aa', false, '0x34f26715d6fCfCAbd3F3eDaa6936Ff120E99d013', '0x237bef6650d8621bee3937f131673d9dea49aaed', '{"method":"withdrawBNB","timestamp":"2026-02-02T23:31:01.652Z","asset_price":300}', '"2026-02-02T22:31:02.983Z"', '"2026-02-02T22:31:02.983Z"', '"2026-02-02T22:31:03.035Z"');

-- ====================================
-- Table: vaults
-- ====================================

CREATE TABLE "vaults" (
  "id" UUID NOT NULL DEFAULT gen_random_uuid(),
  "profile_id" UUID NOT NULL,
  "user_address" TEXT NOT NULL,
  "vault_address" TEXT NOT NULL DEFAULT '0x34f26715d6fCfCAbd3F3eDaa6936Ff120E99d013'::text,
  "bnb_balance" NUMERIC DEFAULT 0,
  "usdt_balance" NUMERIC DEFAULT 0,
  "created_at" TIMESTAMP WITH TIME ZONE DEFAULT now(),
  "updated_at" TIMESTAMP WITH TIME ZONE DEFAULT now()
);


-- Дані для vaults (6 рядків)
INSERT INTO "vaults" ("id", "profile_id", "user_address", "vault_address", "bnb_balance", "usdt_balance", "created_at", "updated_at") VALUES ('bc1c7da6-d031-499a-9c66-2807fd7717cf', 'b8fc82de-c8d8-4581-ad36-541327a535b8', '0x237bef6650d8621bee3937f131673d9dea49aaed', '0x34f26715d6fCfCAbd3F3eDaa6936Ff120E99d013', '0.007', '0', '"2026-02-02T22:19:51.101Z"', '"2026-02-02T23:31:03.130Z"');
INSERT INTO "vaults" ("id", "profile_id", "user_address", "vault_address", "bnb_balance", "usdt_balance", "created_at", "updated_at") VALUES ('95937a02-8d6b-49a9-87a5-57bd0664fa01', '647b9eea-efb8-4c5a-8db5-4c79daf66257', '0x565fbd50836b0b70f2173e0901aaf8a2cdaed867', '0x34f26715d6fCfCAbd3F3eDaa6936Ff120E99d013', '0.30000000000000004', '1673', '"2026-02-01T22:56:13.655Z"', '"2026-02-02T18:05:15.006Z"');
INSERT INTO "vaults" ("id", "profile_id", "user_address", "vault_address", "bnb_balance", "usdt_balance", "created_at", "updated_at") VALUES ('7a7f2dfa-1dcd-4b71-8667-711b9563c82a', '1c3aac28-0757-4b1d-a341-e009d476956f', '0x82bF00a547336e6B2Fb86300B01B8A6D366D501f', '0x34f26715d6fCfCAbd3F3eDaa6936Ff120E99d013', '0', '0', '"2026-02-02T18:47:39.642Z"', '"2026-02-02T18:47:39.642Z"');
INSERT INTO "vaults" ("id", "profile_id", "user_address", "vault_address", "bnb_balance", "usdt_balance", "created_at", "updated_at") VALUES ('16bfd4a9-c6aa-4090-abee-1337e3552bcf', '647b9eea-efb8-4c5a-8db5-4c79daf66257', '0x82bf00a547336e6b2fb86300b01b8a6d366d501f', '0x34f26715d6fCfCAbd3F3eDaa6936Ff120E99d013', '0.0001', '0', '"2026-02-02T19:01:25.950Z"', '"2026-02-02T19:01:26.215Z"');
INSERT INTO "vaults" ("id", "profile_id", "user_address", "vault_address", "bnb_balance", "usdt_balance", "created_at", "updated_at") VALUES ('c22234d5-84e3-4481-9346-183c1e0c30e1', '647b9eea-efb8-4c5a-8db5-4c79daf66257', '0x8cd86e2129594c276140c4caf316360ce6a49a51', '0x34f26715d6fCfCAbd3F3eDaa6936Ff120E99d013', '0.01', '0', '"2026-02-02T19:03:59.454Z"', '"2026-02-02T19:07:48.912Z"');
INSERT INTO "vaults" ("id", "profile_id", "user_address", "vault_address", "bnb_balance", "usdt_balance", "created_at", "updated_at") VALUES ('9ee8a096-8bd3-4112-ae23-ca8c68fe2396', '647b9eea-efb8-4c5a-8db5-4c79daf66257', '0x64f9cccc9dee50b2015c2d2595db3ce285511f11', '0x34f26715d6fCfCAbd3F3eDaa6936Ff120E99d013', '0', '0', '"2026-02-02T19:11:49.762Z"', '"2026-02-02T19:11:49.762Z"');

-- ====================================
-- Table: wallet_connections
-- ====================================

CREATE TABLE "wallet_connections" (
  "id" UUID NOT NULL DEFAULT gen_random_uuid(),
  "profile_id" UUID NOT NULL,
  "wallet_address" TEXT NOT NULL,
  "wallet_type" TEXT DEFAULT 'metamask'::text,
  "is_primary" BOOLEAN DEFAULT true,
  "connected_at" TIMESTAMP WITH TIME ZONE DEFAULT now()
);


-- ====================================
-- Table: withdrawal_limits
-- ====================================

CREATE TABLE "withdrawal_limits" (
  "id" INTEGER NOT NULL DEFAULT nextval('withdrawal_limits_id_seq'::regclass),
  "level" INTEGER NOT NULL,
  "daily_limit" NUMERIC NOT NULL,
  "per_transaction_limit" NUMERIC NOT NULL,
  "monthly_limit" NUMERIC NOT NULL,
  "requires_kyc" BOOLEAN DEFAULT false,
  "description" TEXT
);


-- Дані для withdrawal_limits (5 рядків)
INSERT INTO "withdrawal_limits" ("id", "level", "daily_limit", "per_transaction_limit", "monthly_limit", "requires_kyc", "description") VALUES (1, 1, '100.000000', '50.000000', '1000.000000', false, NULL);
INSERT INTO "withdrawal_limits" ("id", "level", "daily_limit", "per_transaction_limit", "monthly_limit", "requires_kyc", "description") VALUES (2, 2, '500.000000', '200.000000', '5000.000000', false, NULL);
INSERT INTO "withdrawal_limits" ("id", "level", "daily_limit", "per_transaction_limit", "monthly_limit", "requires_kyc", "description") VALUES (3, 3, '2000.000000', '1000.000000', '20000.000000', false, NULL);
INSERT INTO "withdrawal_limits" ("id", "level", "daily_limit", "per_transaction_limit", "monthly_limit", "requires_kyc", "description") VALUES (4, 4, '10000.000000', '5000.000000', '100000.000000', true, NULL);
INSERT INTO "withdrawal_limits" ("id", "level", "daily_limit", "per_transaction_limit", "monthly_limit", "requires_kyc", "description") VALUES (5, 5, '50000.000000', '20000.000000', '500000.000000', true, NULL);

-- ====================================
-- Table: withdrawal_whitelist
-- ====================================

CREATE TABLE "withdrawal_whitelist" (
  "id" UUID NOT NULL DEFAULT gen_random_uuid(),
  "vault_id" UUID,
  "destination_address" CHARACTER VARYING(42) NOT NULL,
  "nickname" CHARACTER VARYING(50),
  "is_active" BOOLEAN DEFAULT true,
  "added_at" TIMESTAMP WITHOUT TIME ZONE DEFAULT now()
);


