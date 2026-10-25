import fs from "node:fs";
import path from "node:path";
import { spawnSync } from "node:child_process";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const projectRefMatch = supabaseUrl.match(/^https:\/\/([a-z0-9-]+)\.supabase\.co/i);
const projectRef = projectRefMatch ? projectRefMatch[1] : "";

const databaseUrl =
  process.env.DATABASE_URL ||
  process.env.DIRECT_URL ||
  process.env.SUPABASE_DB_URL ||
  "";
const accessToken = process.env.SUPABASE_ACCESS_TOKEN || "";

const migrationPath = path.resolve(
  process.cwd(),
  "supabase/migrations/001_initial_schema.sql"
);

if (!fs.existsSync(migrationPath)) {
  console.error(`File migrasi tidak ditemukan: ${migrationPath}`);
  process.exit(1);
}

const sql = fs.readFileSync(migrationPath, "utf8");

async function runViaManagementApi() {
  console.log(
    `Menjalankan migrasi ke project Supabase (${projectRef}) melalui Supabase Management API...`
  );
  const response = await fetch(
    `https://api.supabase.com/v1/projects/${projectRef}/database/query`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ query: sql }),
    }
  );

  if (!response.ok) {
    const errText = await response.text();
    console.error(
      `Gagal menjalankan migrasi via Management API (${response.status}): ${errText}`
    );
    process.exit(1);
  }

  console.log(
    "Migrasi 001_initial_schema.sql berhasil dijalankan di Supabase!"
  );
}

function runViaPsql() {
  console.log("Menjalankan migrasi ke Supabase PostgreSQL menggunakan psql...");
  const result = spawnSync("psql", [databaseUrl, "-v", "ON_ERROR_STOP=1", "-f", migrationPath], {
    stdio: "inherit",
  });

  if (result.error) {
    console.error("Gagal menjalankan psql:", result.error.message);
    process.exit(1);
  }

  if (result.status !== 0) {
    console.error(`psql keluar dengan kode status ${result.status}`);
    process.exit(result.status ?? 1);
  }

  console.log(
    "Migrasi 001_initial_schema.sql berhasil dijalankan di Supabase!"
  );
}

async function main() {
  if (databaseUrl) {
    runViaPsql();
    return;
  }

  if (accessToken && projectRef) {
    await runViaManagementApi();
    return;
  }

  console.error(`
================================================================================
INFO KREDENSIAL MIGRASI DATABASE SUPABASE
================================================================================
Saat ini file .env sudah memiliki:
- NEXT_PUBLIC_SUPABASE_URL (${supabaseUrl || "belum diisi"})
- NEXT_PUBLIC_SUPABASE_ANON_KEY
- SUPABASE_SERVICE_ROLE_KEY

Namun, Supabase Cloud tidak mengizinkan eksekusi perintah DDL (CREATE TABLE,
CREATE POLICY, CREATE TRIGGER) melalui HTTP REST API menggunakan Service Role Key.

Untuk menjalankan migrasi dari terminal (npm run db:migrate), tambahkan SALAH SATU
variabel berikut ke dalam file .env Anda:

OPSI 1 — Koneksi PostgreSQL Langsung (Disarankan, menggunakan psql yang sudah terinstal):
Tambahkan baris berikut ke .env (dapatkan dari Supabase Dashboard -> Connect -> URI):
DATABASE_URL=postgresql://postgres.${projectRef || "[PROJECT-REF]"}:[PASSWORD-DATABASE-ANDA]@aws-0-ap-southeast-1.pooler.supabase.com:6543/postgres

OPSI 2 — Supabase Personal Access Token (Management API):
Tambahkan baris berikut ke .env (dapatkan dari https://supabase.com/dashboard/account/tokens):
SUPABASE_ACCESS_TOKEN=sbp_xxxxxxxxxxxxxxxxxxxxxxxx

Atau OPSI 3 — Melalui Dashboard Web:
Salin seluruh isi file supabase/migrations/001_initial_schema.sql lalu jalankan
langsung di Supabase Dashboard -> SQL Editor:
https://supabase.com/dashboard/project/${projectRef || ""}/sql/new
================================================================================
`);
  process.exit(1);
}

main();

