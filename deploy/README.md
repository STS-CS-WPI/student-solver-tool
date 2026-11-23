# Deploying on sts.cs.wpi.edu

by Mina Boktor

> [!WARNING]
> Please read this whole file before attempting to deploy.

Before the first deployment, [make the GHCR package public](../.github/ci-setup.md) so images can be pulled without credentials.

## Steps

- Make sure you have sudo access. Please ask someone with sudo privileges to run this command: `sudo usermod -aG sudo <your username>`
- After logging in, cd to `/opt/sts`. This is where the repo is cloned to, and all deploy commands will need to be ran from this directory.
- Create or update `/opt/sts/.env` using the instructions in [`.env.example`](../.env.example).

  Periodically, you will need to rotate the Microsoft Entra Id API keys.
  The app will not work without these (no one will be able to sign in).
  They expire anywhere from 6 months to 2 years.
  Ask the coordinator for these.
  You will need to redeploy/restart the app in order of this to take effect.

Now, you will need to add your user to the `docker` and `deploysts` groups in order to have the proper permissions to run the deploy scripts.
Run the following commands:

```bash
sudo usermod -aG docker $USER
sudo usermod -aG deploysts $USER
```

You might need to sign out and sign back in to the server.

The deploy script is in `./deploy`. Run `./deploy/deploy.sh -h` to see options.

- Run `./deploy/deploy.sh` to deploy the latest `origin/main` commit using its runner and migrator images from GitHub Container Registry.
  Select a release tag or full commit SHA with `./deploy/deploy.sh --ref <release-tag>` or `./deploy/deploy.sh --ref <full-commit-sha>`.
  The script checks out the selected commit and pulls its SHA-tagged images.
  If either image is unavailable, deployment stops before backup or migrations. Wait for both Docker jobs to pass and rerun.
  There will be a backup of the sqlite db made in /home/backups automatically.
  `/home/backups/` is a special directory that is backed up twice a day, and backups are kept for 60 days.
  If you wish to skip this step and not back up the database before deployment, you can run the deploy script with the `--no-backup` flag.

Database migrations remain applied when deploying an older release.

The deploy script runs off of git. If you get a message along the lines of 'fatal: detected dubious ownership in repository at /opt/sts',
run the following command: `git config --global --add safe.directory /opt/sts`

## Helpful commands

- To deploy with Compose directly, check out the selected commit and set `STS_IMAGE_TAG` to its full SHA. These commands do not back up the database.

```bash
export STS_IMAGE_TAG=<full-commit-sha>
docker compose --profile migrate pull sts sts-migrate
docker compose --profile migrate run --rm --pull never sts-migrate
docker compose up -d --no-build
```

- To display application logs, run:

```bash
STS_IMAGE_TAG="$(git rev-parse HEAD)" docker compose logs -f sts
```

- To copy the live db somewhere, you can run this command:

```bash
docker cp sts-sts-1:/data/prod.db /tmp/prod.db
```

This will copy the prod db into `/tmp/prod.db`.
You can then copy the database to your local computer by running something like this from your local project directory:

> [!WARNING]
> This will replace your current dev.db if it exists. Only run this command if your are absolutely sure.
> You can also change the destination path to something else if you wish.

```bash
scp <your username>@sts.cs.wpi.edu:/tmp/prod.db ./prisma/dev.db
```

## Profile pictures, backups, and restore

Users upload static JPEG, PNG, or WebP pictures on `/profile`. Only the owner can
retrieve a saved picture. Inputs are limited to 2 MiB and 4096 pixels per dimension;
stored pictures are WebP, at most 256 × 256 pixels. The account menu links to this page.

`PROFILE_PICTURE_DIR` defaults to `./.local/profile-pictures` for development.
Compose sets it to `/data/profile-pictures`, alongside `/data/prod.db` in the
existing `sts_sqlite` volume. Both application and migrator explicitly use that
database. The application must be able to create/write this directory; the current
runner uses root. If changing its user, grant that user write access to `/data`.
Sharp is a runtime dependency; include its native Linux binaries in the standalone
image and smoke-test upload/retrieval after a build.

The deploy script stops a running `sts` service before backing up and migrating,
then starts the services after migration. On failure it attempts to restart the
previous container. Backups now archive the entire volume (including pictures,
SQLite journals, and the database) in `/home/backups/sts-data.<timestamp>.tar.gz`.
An archive failure aborts deployment. The `--no-backup` flag skips the archive.
The volume is persistent storage, not a backup; deleting it deletes both pictures
and the database. There may be brief downtime during backup and migration.

To restore, stop `sts`, preserve the current volume as another backup, and extract
a chosen archive into an **empty replacement volume** mounted at `/data`. Restore
the entire archive together, preserving permissions; do not mix database and
picture files from different backups. Attach that replacement volume as
`sts_sqlite`, apply migrations if needed, and start the application. Verify a user
with a saved picture can sign in and retrieve it. Old `prod.db.<timestamp>` backups
contain only the database and cannot restore pictures.

After deployment, upload a photo, sign out/in, and recreate the application
container with the same volume. Confirm the profile and both account avatars
still load. Check `docker compose logs sts` for write/decoder errors. Local storage
supports a single Docker host; multiple hosts require shared storage.

### Reviewing unused pictures

Interrupted uploads can leave unused files. Stop `sts` (and every other writer),
back up the whole volume, and query the backed-up database with:

```sql
SELECT profilePictureFilename FROM User WHERE profilePictureFilename IS NOT NULL;
```

Compare these exact basenames with files directly inside `profile-pictures/`.
Review candidates before deleting only UUID `.webp` files absent from the query;
never delete a referenced file or follow a path from an upload. Keep writers
stopped throughout review and deletion, then restart `sts`. User deletion cleans
up the last saved file; failed cleanup is logged and can be reconciled here.
There is no background cleanup job or saved-photo deletion UI.
