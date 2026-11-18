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

- Run `./deploy/deploy.sh` to deploy the current `main` commit using its application and migrator images from GitHub Container Registry.
  If either image is unavailable, deployment stops before backup or migrations. Wait for both Docker jobs to pass and rerun.
  There will be a backup of the sqlite db made in /home/backups automatically.
  `/home/backups/` is a special directory that is backed up twice a day, and backups are kept for 60 days.
  If you wish to skip this step and not back up the database before deployment, you can run the deploy script with the `--no-backup` flag.

The deploy script runs off of git. If you get a message along the lines of 'fatal: detected dubious ownership in repository at /opt/sts',
run the following command: `git config --global --add safe.directory /opt/sts`

## Helpful commands

- To deploy with Compose directly, select a full commit SHA whose Docker jobs have passed, then pull its images before applying migrations and starting the app. Application settings still come from `.env`.

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

## Backups

There are two kinds of SQLite backups. Both are written to `/home/backups`.

- **Deploy:** every `./deploy/deploy.sh` (unless `--no-backup`). Named `prod.db.<timestamp>`.
- **Archive:** 12:00 on the 1st of every other month (Feb, Apr, ... Dec). Named `prod.db.<timestamp>-archive`. The newest 6 are kept and older ones are deleted.

The archive backups are taken by a systemd timer that runs `deploy/backup.sh --label archive`.

### Manual backup

```bash
./deploy/backup.sh --label manual
```

This writes `prod.db.<timestamp>-manual`. Manual backups are never pruned.
The script uses SQLite's online backup and checks the result, so it is safe to run while the app is up.
If anything fails it exits with an error and does not leave a backup file behind.

### Install the archive timer

Run this once from `/opt/sts` (needs sudo):

```bash
sudo cp deploy/systemd/sts-backup-archive.{service,timer} /etc/systemd/system/
sudo systemctl daemon-reload
sudo systemctl enable --now sts-backup-archive.timer
```

To stop the archive backups, run `sudo systemctl disable --now sts-backup-archive.timer`.

If the server is off at the scheduled time, the backup runs the next time it boots.

### Check that it works

```bash
systemctl list-timers sts-backup-archive.timer     # shows the next run
sudo systemctl start sts-backup-archive.service    # take an archive backup right now
journalctl -u sts-backup-archive                   # logs, including errors
ls -l /home/backups
```

A failed run shows up as `failed` in `systemctl status sts-backup-archive.service`.
Nothing alerts you, so check this after the 1st of each backup month.

### Restore a backup

This will replace the live database be careful.
To see the available backups, run `ls /home/backups`.

```bash
cd /opt/sts
export STS_IMAGE_TAG=<full-commit-sha>   # same value used for deploying
docker compose stop sts

# keeps the current db as prod.db.before-restore, then restores the chosen backup
docker run --rm -v sts_sqlite:/data -v /home/backups:/backups alpine:3 sh -c \
  'cp /data/prod.db /backups/prod.db.before-restore && cp /backups/<backup file> /data/prod.db'

docker compose start sts
```
