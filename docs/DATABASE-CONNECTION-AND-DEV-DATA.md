# Database connection and dev data

## Where the DB connection is configured and used

### 1. Connection configuration

**File:** `apps/server/src/vendure-config.ts`

The connection is defined in `dbConnectionOptions`:

```ts
dbConnectionOptions: {
    type: 'postgres',
    host: process.env.DB_HOST,      // from .env → localhost
    port: +process.env.DB_PORT,    // from .env → 6543
    database: process.env.DB_NAME, // from .env → vendure
    schema: process.env.DB_SCHEMA, // from .env → public
    username: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    synchronize: IS_DEV,
    migrations: [path.join(__dirname, './migrations/*.+(js|ts)')],
    // ...
}
```

**Env source:** `apps/server/.env` (loaded by `import 'dotenv/config'` in vendure-config.ts):

- `DB_HOST=localhost`
- `DB_PORT=6543`
- `DB_NAME=vendure`
- `DB_USERNAME=vendure`
- `DB_PASSWORD=...`
- `DB_SCHEMA=public`

So the connection is to **PostgreSQL at localhost:6543**, database **vendure**, schema **public**.

---

### 2. Where the connection is actually opened

Vendure uses TypeORM under the hood. The connection is **not** opened in your code directly; it is opened when Vendure starts.

**Server (main process):** `apps/server/src/index.ts`

```ts
runMigrations(config)
    .then(() => bootstrap(config))
    .catch(err => { console.log(err); });
```

- `runMigrations(config)` runs any files in `src/migrations/*.+(js|ts)` against the DB (using the same connection config).
- `bootstrap(config)` starts the Vendure server and **opens the DB connection** (TypeORM creates the connection using `dbConnectionOptions`). All Admin API / Shop API and plugins use this connection.

**Worker process:** `apps/server/src/index-worker.ts`

```ts
bootstrapWorker(config)
    .then(worker => worker.startJobQueue())
    .catch(err => { console.log(err); });
```

- `bootstrapWorker(config)` starts the job queue worker and **opens a second connection** to the same database (same `config` → same `dbConnectionOptions`).

So:

- **Config:** `vendure-config.ts` → `dbConnectionOptions` + `.env`
- **Opened when:** Server and worker start, inside `bootstrap(config)` / `bootstrapWorker(config)`.

---

### 3. Schema in dev (no migration files needed)

In dev, `synchronize: IS_DEV` is `true`, so:

- TypeORM **creates or updates tables** automatically from Vendure’s entities when the server starts.
- You do **not** need to run schema migrations for dev; the schema is kept in sync automatically.
- There is **no** `src/migrations/` folder in this project, so `runMigrations()` currently runs no migration files. It’s safe and normal for dev with `synchronize: true`.

---

## Do we have a sample data migration for dev?

**No.** This repo does not include:

- A migration that inserts sample products, collections, or channels.
- A seed script or `initialData`-style population.

So:

- **Schema:** Yes – created/updated automatically in dev via `synchronize: true`.
- **Sample data:** No – you have to add data yourself.

---

## How to get data in dev

1. **Use the Vendure Dashboard (recommended)**  
   - Open `http://localhost:5173/dashboard` (or the URL your server prints).  
   - Log in with superadmin (see `.env`: `SUPERADMIN_USERNAME` / `SUPERADMIN_PASSWORD`).  
   - Create a channel (if needed), then add products, collections, etc.  
   - No migration or seed script required.

2. **Use the Admin API (GraphiQL)**  
   - Open `http://localhost:3000/admin-api` (GraphiQL).  
   - Run mutations to create channels, products, and other data.

3. **Add your own seed script (optional)**  
   - You can add a Node script that uses the Vendure `AdministratorService`, `ProductService`, etc. (or raw SQL) to insert sample data, and run it once after DB is up.  
   - That would be custom code in your repo, not a “sample data migration” in the migrations folder.

---

## Summary

| Question | Answer |
|----------|--------|
| Where is the DB connection configured? | `apps/server/src/vendure-config.ts` → `dbConnectionOptions`, values from `apps/server/.env`. |
| Where is the connection opened? | When the server starts in `index.ts` (`bootstrap(config)`) and when the worker starts in `index-worker.ts` (`bootstrapWorker(config)`). |
| Do we run a schema migration for dev? | Schema is handled by `synchronize: true` in dev; no migration files are required. `runMigrations()` runs only if you add files under `src/migrations/`. |
| Do we have a sample data migration for dev? | No. Add data via the Dashboard or Admin API, or add your own seed script. |
