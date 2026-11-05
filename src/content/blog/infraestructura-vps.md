---
title: "Infraestructura VPS para side projects"
description: "Un VPS reproducible y seguro para desplegar Nuxt/Next.js + FastAPI + PostgreSQL con Docker Compose, Traefik, Cloudflare y CI/CD con GitHub Actions."
pubDate: 2026-11-03
tags: ["Docker Compose", "Traefik", "Cloudflare", "Let's Encrypt", "GitHub Actions", "GHCR"]
---
## Objetivo

Construir un único VPS reproducible y seguro para desplegar aplicaciones completas (Nuxt/Next.js + FastAPI + PostgreSQL), practicar infraestructura y mantener un camino natural hacia GitOps y k3s.

| Dato | Decisión |
| --- | --- |
| Perfil | Side projects / laboratorio serio, no alta disponibilidad |
| Sistema | Ubuntu Server LTS |
| Runtime | Docker Engine + Docker Compose v2 |
| Entrada web | Cloudflare Proxy -> Traefik |
| TLS | Let's Encrypt con DNS-01 mediante Cloudflare |
| CI/CD | GitHub Actions -> GHCR -> SSH -> Docker Compose |
| Versionado | Publicar `latest` + `sha-<commit>`; desplegar siempre el SHA |
| Usuarios | root sin SSH, `admin` con sudo, `deploy` en grupo docker |

## Resumen de decisiones

Esta es la configuración base. El objetivo es aprender cada capa sin introducir complejidad innecesaria.

| Área | Decisión base | Motivo |
| --- | --- | --- |
| SSH | Root no inicia sesión por SSH | Se conserva root mediante `sudo -i` y consola de recovery. |
| Administración | Usuario `admin` con clave SSH y sudo | Cuenta humana con trazabilidad. |
| Despliegue | Usuario `deploy` con clave propia y grupo docker | Pipeline sencillo. Se acepta que docker equivale a privilegios root. |
| Podman | No por ahora | Rootless mejora aislamiento, pero complica Traefik/Compose y el objetivo inicial. |
| Cloudflare Tunnel | No | El VPS tiene IP pública; practicamos ingress, firewall y reverse proxy reales. |
| TLS | DNS-01 | No depende del puerto 80 y permite wildcard si se necesita. |
| Registry | GHCR | Build fuera del VPS y artefactos reproducibles. |
| Deploy | SHA inmutable | Trazabilidad y rollback inmediato. |
| Dashboard Traefik | Cloudflare Zero Trust Access | Acceso autenticado sin abrir puertos extra. |
| GitOps | Fase posterior | Primero CD push-based; luego Git como fuente de verdad. |

## Arquitectura objetivo

```text
Internet
   |
Cloudflare Proxy (DNS + protección + Zero Trust Access para el dashboard)
   |
Firewall del proveedor (80/443 solo desde IPs de Cloudflare, 22 key-only)
   |
VPS :80 / :443
   |
Traefik
   /        \
app.<dominio>   api.<dominio>
   |              |
Frontend       FastAPI
                  |
        red interna del proyecto
                  |
              PostgreSQL

Control plane Docker:
  Traefik -> docker-socket-proxy (red docker-api, internal) -> /var/run/docker.sock

CI/CD:
  git push -> GitHub Actions -> GHCR (:latest + :sha-...) -> SSH deploy -> VPS

TLS:
  Traefik -> Cloudflare API (DNS-01) -> Let's Encrypt
```

> **Límite de seguridad importante:** el socket proxy reduce lo que Traefik puede hacer sobre Docker, pero no protege frente al usuario `deploy`. Al pertenecer al grupo docker, `deploy` tiene capacidad equivalente a root. Es una decisión consciente para este laboratorio y debe tratarse como tal.

---

# 1. Preparar el VPS y la vía de recuperación

Antes de endurecer SSH, confirma que el proveedor ofrece consola web, VNC, rescue o un mecanismo equivalente. Si una regla de firewall o sshd te bloquea, esa consola será tu última vía de entrada.

## 1.1 Actualización inicial

```bash
sudo apt update
sudo apt full-upgrade -y
sudo apt install -y curl ca-certificates git vim unattended-upgrades
sudo systemctl reboot
```

Tras el reinicio, comprueba que vuelves a entrar antes de tocar la configuración de SSH.

## 1.2 Actualizaciones automáticas de seguridad

```bash
sudo dpkg-reconfigure --priority=low unattended-upgrades
sudo systemctl status unattended-upgrades
```

> [!NOTE] **Criterio:** activa parches automáticos de seguridad. No configures reinicios automáticos hasta tener claro cuándo pueden afectar a tus aplicaciones.

**Referencia:** [Ubuntu Server - Automatic updates](https://ubuntu.com/server/docs/how-to/software/automatic-updates/)

- [ ] Puedo entrar en la consola/recovery del proveedor.
- [ ] El sistema está actualizado y ha reiniciado correctamente.
- [ ] `unattended-upgrades` está activo.

# 2. Usuarios y hardening de SSH

Mantenemos root como cuenta del sistema, pero no permitimos iniciar sesión como root por SSH. El acceso privilegiado se obtiene desde `admin` mediante `sudo -i`.

## 2.1 Crear admin

```bash
sudo adduser admin
sudo usermod -aG sudo admin
sudo install -d -m 700 -o admin -g admin /home/admin/.ssh
sudo nano /home/admin/.ssh/authorized_keys
sudo chmod 600 /home/admin/.ssh/authorized_keys
sudo chown admin:admin /home/admin/.ssh/authorized_keys
```

Genera una clave Ed25519 desde tu equipo local y copia solo la clave pública al VPS.

```bash
# En tu equipo local
ssh-keygen -t ed25519 -a 64 -f ~/.ssh/vps_admin
ssh -i ~/.ssh/vps_admin admin@<VPS_IP>
sudo -i
```

## 2.2 Crear deploy

```bash
sudo adduser --disabled-password --gecos "" deploy
sudo install -d -m 700 -o deploy -g deploy /home/deploy/.ssh
sudo nano /home/deploy/.ssh/authorized_keys
sudo chmod 700 /home/deploy/.ssh
sudo chmod 600 /home/deploy/.ssh/authorized_keys
sudo chown -R deploy:deploy /home/deploy/.ssh
```

Usa una clave **distinta** a la de `admin`, **dedicada a GitHub Actions y sin passphrase** (Actions no puede introducirla de forma interactiva; ver troubleshooting A.2). La privada acabará como secreto `VPS_DEPLOY_KEY`; la pública queda en `authorized_keys` del VPS.

```bash
# En tu equipo local
ssh-keygen -t ed25519 -N "" -C "gha-deploy" -f ~/.ssh/vps_deploy_gha
# Copia el contenido de ~/.ssh/vps_deploy_gha.pub a /home/deploy/.ssh/authorized_keys
```

## 2.3 Configurar los hosts en ~/.ssh/config (PC local)

Una vez creadas las claves de `admin` y `deploy`, regístralas como hosts en el fichero `config` de la carpeta `.ssh` de tu PC local. Así te conectas con un alias en lugar de `ssh -i <clave> <usuario>@<VPS_IP>`.

- Linux/macOS: `~/.ssh/config`
- Windows: `C:\Users\<usuario>\.ssh\config` (sin extensión)

```text
Host vps-admin
    HostName <VPS_IP>
    User admin
    IdentityFile ~/.ssh/vps_admin
    IdentitiesOnly yes

Host vps-deploy
    HostName <VPS_IP>
    User deploy
    IdentityFile ~/.ssh/vps_deploy_gha
    IdentitiesOnly yes
```

```bash
# Linux/macOS: el fichero solo debe ser legible por tu usuario
chmod 600 ~/.ssh/config

# Prueba los alias
ssh vps-admin
ssh vps-deploy
```

`IdentitiesOnly yes` hace que SSH use solo la clave indicada y no ofrezca el resto de claves del agente (evita fallos por `Too many authentication failures`).

## 2.4 Deshabilitar root y password por SSH

> **No cierres la sesión actual.** Abre una segunda terminal y prueba `admin` y `deploy` antes de recargar sshd. Solo después bloquea root/password.

```bash
sudo nano /etc/ssh/sshd_config.d/99-hardening.conf
```

```ini
PermitRootLogin no
PasswordAuthentication no
KbdInteractiveAuthentication no
PubkeyAuthentication yes

# Opcional cuando todo funcione:
# AllowUsers admin deploy
```

```bash
sudo sshd -t
sudo systemctl reload ssh

# Desde otra terminal:
ssh vps-admin
ssh vps-deploy
```

> **Cuidado con cloud-init:** los ficheros de `/etc/ssh/sshd_config.d/` se leen en orden alfabético y **gana el primer valor** que aparece. En muchos VPS existe `50-cloud-init.conf` con `PasswordAuthentication yes`, que se lee antes que `99-hardening.conf` y lo anula. Localízalo y corrígelo (o renombra tu fichero a un prefijo menor, p. ej. `01-hardening.conf`).

```bash
sudo grep -ri passwordauthentication /etc/ssh/sshd_config /etc/ssh/sshd_config.d/
# Verifica siempre la configuración EFECTIVA:
sudo sshd -T | grep -iE 'passwordauthentication|permitrootlogin|kbdinteractive'
```

Root sigue disponible: entra como `admin` y ejecuta `sudo -i`. Deshabilitar `PermitRootLogin` solo elimina el login remoto directo como root.

**Referencia:** [Ubuntu OpenSSH - sshd_config](https://manpages.ubuntu.com/manpages/noble/man5/sshd_config.5.html)

# 3. Instalar Docker Engine y Compose

Usamos Docker Engine desde el repositorio oficial de Docker y el plugin `docker compose`. Evita paquetes antiguos como `docker.io` si quieres seguir la documentación oficial con versiones actuales.

Primero configura el repositorio oficial de Docker para Ubuntu:

```bash
# Add Docker's official GPG key:
sudo apt update
sudo apt install ca-certificates curl
sudo install -m 0755 -d /etc/apt/keyrings
sudo curl -fsSL https://download.docker.com/linux/ubuntu/gpg -o /etc/apt/keyrings/docker.asc
sudo chmod a+r /etc/apt/keyrings/docker.asc

# Add the repository to Apt sources:
sudo tee /etc/apt/sources.list.d/docker.sources <<EOF
Types: deb
URIs: https://download.docker.com/linux/ubuntu
Suites: $(. /etc/os-release && echo "${UBUNTU_CODENAME:-$VERSION_CODENAME}")
Components: stable
Architectures: $(dpkg --print-architecture)
Signed-By: /etc/apt/keyrings/docker.asc
EOF

sudo apt update
```

Después instala Docker Engine y el plugin de Compose:

```bash
sudo apt install -y docker-ce docker-ce-cli containerd.io \
  docker-buildx-plugin docker-compose-plugin

sudo systemctl enable --now docker
docker --version
docker compose version
```

**Referencia:** [Docker - Install Engine on Ubuntu](https://docs.docker.com/engine/install/ubuntu/)
**Referencia:** [Docker - Install Compose plugin](https://docs.docker.com/compose/install/linux/)

## 3.1 Permisos de deploy

```bash
sudo usermod -aG docker deploy

# Cierra y vuelve a abrir la sesión de deploy, luego:
ssh vps-deploy
docker run --rm hello-world
```

> **Grupo docker = privilegios root.** Docker lo advierte explícitamente: un usuario con acceso al socket del daemon puede conseguir privilegios de nivel root. `deploy` no tiene sudo general, pero debes considerarla una cuenta privilegiada.

**Referencia:** [Docker - Linux post-installation steps](https://docs.docker.com/engine/install/linux-postinstall)

## 3.2 Estructura del servidor

Clonamos la infraestructura de Traefik en `/opt/infra/traefik`, preparamos el almacenamiento ACME y creamos `/opt/apps` como propiedad de `deploy`.

```bash
sudo mkdir -p /opt/infra
cd /opt/infra
sudo git clone https://github.com/flaviooria/infra_traefik traefik

# Almacenamiento de certificados ACME
sudo mkdir -p /opt/infra/traefik/letsencrypt
sudo touch /opt/infra/traefik/letsencrypt/acme.json
sudo chmod 600 /opt/infra/traefik/letsencrypt/acme.json

# Carpeta de aplicaciones, propiedad de deploy
sudo mkdir -p /opt/apps
sudo chown deploy:deploy /opt/apps
```

Resultado:

```text
/opt/
├── infra/
│   └── traefik/               # repo infra_traefik (administrado por admin)
│       ├── compose.yaml
│       ├── .env.example
│       ├── .env
│       └── letsencrypt/
│           └── acme.json      # chmod 600
└── apps/                      # propiedad de deploy
    └── el_contable/           # repo el_contable
        ├── compose.prod.yml
        ├── .env.example
        ├── .env.prod
        └── .env.deploy
```

Recuerda que `deploy`, al tener Docker, puede inspeccionar contenedores y variables de entorno de cualquier proyecto, incluido Traefik.

# 4. Redes Docker

Creamos la red externa `proxy`. La usaremos para conectar los servicios HTTP que Traefik debe descubrir y enrutar (frontend, API, dashboard). PostgreSQL **nunca** entra en esta red.

```bash
docker network create proxy
```

La red `docker-api` no se crea a mano: la define como `internal` el compose de `infra_traefik`. En ella viven Traefik y el socket proxy:

- Imagen: `ghcr.io/tecnativa/docker-socket-proxy:v0.5.0`
- Traefik se conecta con `--providers.docker.endpoint=tcp://socket-proxy:2375`
- El proxy filtra los endpoints de la API Docker y deja deshabilitadas las operaciones de escritura. Traefik necesita descubrir contenedores, no controlar el daemon.

> **No publiques 2375.** El socket proxy debe existir solo en una red interna Docker. Nunca expongas su puerto al host ni a Internet.

# 5. Firewall del VPS

El firewall del proveedor es la primera barrera porque se aplica antes de que el tráfico alcance Docker. UFW sigue siendo útil para el host, pero no debes asumir que bloquea puertos publicados por Docker.

## 5.1 Reglas de seguridad

| Puerto | Origen permitido | Uso |
| --- | --- | --- |
| 22/tcp | Internet (baseline) / IP estática después | SSH key-only para `admin`/`deploy` y GitHub Actions. |
| 80/tcp | Rangos IPv4 + IPv6 de Cloudflare | HTTP -> redirección a HTTPS. |
| 443/tcp | Rangos IPv4 + IPv6 de Cloudflare | Tráfico web al origen. |
| Resto | Denegar | No publicar DB, Redis, dashboards, etc. |

Rangos de Cloudflare (consultados el **2026-11-03** en <https://www.cloudflare.com/es-es/ips/>), listos para pegar separados por comas:

**IPv4**

```text
173.245.48.0/20,103.21.244.0/22,103.22.200.0/22,103.31.4.0/22,141.101.64.0/18,108.162.192.0/18,190.93.240.0/20,188.114.96.0/20,197.234.240.0/22,198.41.128.0/17,162.158.0.0/15,104.16.0.0/13,104.24.0.0/14,172.64.0.0/13,131.0.72.0/22
```

**IPv6**

```text
2400:cb00::/32,2606:4700::/32,2803:f800::/32,2405:b500::/32,2405:8100::/32,2a06:98c0::/29,2c0f:f248::/32
```

> [!NOTE] **Revisa los rangos periódicamente.** Cloudflare puede actualizarlos. Las listas en texto plano están en <https://www.cloudflare.com/ips-v4> y <https://www.cloudflare.com/ips-v6>.

> **Puerto 22 y GitHub-hosted Actions:** con runners estándar no hay un rango IP fijo práctico para allowlist, y GitHub no recomienda usar sus amplios rangos dinámicos. En esta versión dejamos 22 accesible, pero solo con claves, root/password deshabilitados y usuarios `admin`/`deploy`. Más adelante puedes cerrarlo con un runner de IP estática, un self-hosted runner o una red administrativa como Tailscale.

> **Docker + UFW:** Docker crea reglas NAT/iptables para los puertos publicados, y ese tráfico puede desviarse antes de las cadenas que usa UFW. Aplica la restricción de Cloudflare en el firewall del proveedor y publica solo 80/443 desde Traefik.

**Referencia:** [GitHub - GitHub-hosted runners / IP addresses](https://docs.github.com/en/actions/reference/runners/github-hosted-runners)
**Referencia:** [Cloudflare - IP ranges](https://www.cloudflare.com/ips/)
**Referencia:** [Cloudflare - Cloudflare IP addresses](https://developers.cloudflare.com/fundamentals/concepts/cloudflare-ip-addresses/)
**Referencia:** [Docker - Packet filtering and firewalls](https://docs.docker.com/engine/network/packet-filtering-firewalls/)

# 6. Cloudflare - DNS-01

Cloudflare es el DNS autoritativo y proxy público. Traefik termina TLS en el origen con un certificado válido de Let's Encrypt obtenido mediante DNS-01.

## 6.1 Dominio y registros DNS

1. Añade el dominio a Cloudflare.
2. En el proveedor donde compraste el dominio, sustituye los nameservers por los que te asigna Cloudflare. Espera a que la zona aparezca como **Active**.
3. Crea los registros:

| Tipo | Nombre | Destino | Proxy |
| --- | --- | --- | --- |
| A | app | `<VPS_IP>` | Activado / nube naranja |
| A | api | `<VPS_IP>` | Activado / nube naranja |
| A | traefik (dashboard) | `<VPS_IP>` | Activado / nube naranja |

Evita un wildcard DNS al principio. Crea registros explícitos para reducir exposiciones accidentales.

## 6.2 SSL/TLS en modo Full (strict)

```text
Cloudflare Dashboard
  SSL/TLS
    Encryption mode: Full (strict)
```

**Referencia:** [Cloudflare - Full (strict)](https://developers.cloudflare.com/ssl/origin-configuration/ssl-modes/full-strict/)

## 6.3 API token para DNS-01

Traefik usa el cliente ACME lego para Cloudflare. Crea un API Token con `Zone:Zone:Read` y `Zone:DNS:Edit`, restringido únicamente a tu zona. Si quieres mínimo privilegio más estricto, usa un token de lectura de zona y otro de edición DNS.

> **Permisos del token:** no uses la Global API Key. Mantener credenciales DNS en el VPS aumenta el impacto de un compromiso, así que restringe el alcance.

**Referencia:** [Cloudflare - Create API token](https://developers.cloudflare.com/fundamentals/api/get-started/create-token/)
**Referencia:** [lego - Cloudflare DNS provider](https://go-acme.github.io/lego/dns/cloudflare/)
**Referencia:** [Let's Encrypt - Challenge types](https://letsencrypt.org/docs/challenge-types/)

# 7. Primer arranque de Traefik

## 7.1 Fichero .env

```bash
cd /opt/infra/traefik
sudo cp .env.example .env
sudo nano .env
sudo chmod 600 .env
```

```ini
# /opt/infra/traefik/.env
TRAEFIK_ACME_EMAIL=tu-correo@example.com
CF_DNS_API_TOKEN=<token-cloudflare-del-paso-6.3>
DOMAIN_NAME=example.com
```

## 7.2 Validar el compose

```bash
docker compose config
```

## 7.3 Levantar y verificar logs

```bash
docker compose up -d
docker compose logs -f traefik
```

Busca en los logs que Let's Encrypt emite los certificados mediante DNS-01 y que no aparecen errores de resolver. DNS-01 no necesita el puerto 80 para validar; mantenemos 80 solo para redirigir a HTTPS.

> [!NOTE] El nombre del certificate resolver es **`cf`**. Todos los routers (API, dashboard, apps) deben usar `tls.certresolver=cf`. Ver troubleshooting D.9.

**Referencia:** [Traefik - Docker provider](https://doc.traefik.io/traefik/reference/install-configuration/providers/docker/)
**Referencia:** [Traefik - Expose services with Docker](https://doc.traefik.io/traefik/expose/docker/basic/)
**Referencia:** [Traefik - ACME certificate resolver](https://doc.traefik.io/traefik/v3.6/reference/install-configuration/tls/certificate-resolvers/acme/)

## 7.4 Dashboard de Traefik con Cloudflare Zero Trust Access

Los labels del router del dashboard (`api@internal`, entrypoint `websecure`, `tls.certresolver=cf`) **ya vienen montados en el compose de [`infra_traefik`](https://github.com/flaviooria/infra_traefik)**; no hay que añadir nada en Traefik. Solo falta la parte de Cloudflare:

1. **DNS:** registro `A traefik` apuntando al VPS con proxy naranja (paso 6.1).
2. **Zero Trust → Access → Applications → Add an application → Self-hosted:**
   - Application domain: `traefik.<dominio>`.
   - Identity provider: One-time PIN por email o GitHub.
3. **Política:** acción *Allow*, regla *Emails* con tu correo (o un grupo de Access).
4. Comprueba en una ventana privada que `https://traefik.<dominio>` pide login de Cloudflare antes de mostrar el dashboard.

> [!NOTE] **Defensa en profundidad:** Access protege el tráfico que pasa por tu zona de Cloudflare. El firewall solo admite IPs de Cloudflare, pero otras cuentas de Cloudflare también salen por esas IPs y podrían enviar peticiones al origen con tu `Host`. Recomendado (pendiente, ver sección 12): añadir un middleware `basicAuth` al router del dashboard, o validar la cabecera `Cf-Access-Jwt-Assertion`, o activar Authenticated Origin Pulls (mTLS Cloudflare -> origen).

**Referencia:** [Cloudflare Access - Self-hosted applications](https://developers.cloudflare.com/cloudflare-one/applications/configure-apps/self-hosted-public-app/)
**Referencia:** [Cloudflare Access - Validate JWTs](https://developers.cloudflare.com/cloudflare-one/identity/authorization-cookie/validating-json/)

# 8. Primer proyecto: FastAPI + PostgreSQL (el_contable)

Cada proyecto tiene una red interna privada y usa la red `proxy` solo para los servicios HTTP que Traefik debe alcanzar.

## 8.1 Clonar el repo

```bash
cd /opt/apps
git clone https://github.com/flaviooria/el_contable.git
cd el_contable
```

## 8.2 Variables de entorno

```bash
cp .env.example .env.prod
nano .env.prod
chmod 600 .env.prod
```

```ini
# /opt/apps/el_contable/.env.prod
DOMAIN=example.com
POSTGRES_DB=el_contable
POSTGRES_USER=<usuario>
POSTGRES_PASSWORD=<password-largo-aleatorio>
IMAGE_TAG=sha-<commit>
```

```ini
# /opt/apps/el_contable/.env.deploy  (lo actualiza el pipeline en cada despliegue)
IMAGE_TAG=sha-<commit>
```

- Imagen: `ghcr.io/flaviooria/el-contable-api` (incluye siempre el owner; ver troubleshooting B.4).
- Los labels del router usan `tls.certresolver=cf`.
- El workflow de CI/CD ya está en el repo.

> **No ejecutes `docker compose down -v`**: borra el volumen de PostgreSQL con los datos persistentes.

## 8.3 Validar el compose

```bash
docker compose -f compose.prod.yml --env-file .env.prod config
```

# 9. Secretos de GitHub

## 9.1 Repository Secrets

| Secret | Función |
| --- | --- |
| `VPS_DEPLOY_KEY` | Clave privada ED25519 (sin passphrase) para autenticarse por SSH desde GitHub Actions al VPS. |
| `VPS_GHCR_TOKEN` | PAT de GitHub (`read:packages`) para que el VPS se autentique en GHCR y descargue imágenes privadas. |
| `VPS_GHCR_USERNAME` | Usuario de GitHub asociado al PAT de GHCR. |
| `VPS_HOST` | IP o hostname del VPS al que se conecta el workflow. |
| `VPS_KNOWN_HOSTS` | Clave pública del host SSH, para verificar la identidad del servidor. |
| `VPS_USER` | Usuario SSH de despliegue: `deploy`. |

`GITHUB_TOKEN` no es un secret creado a mano: lo proporciona GitHub Actions automáticamente en cada job.

## 9.2 Flujo de utilización

```text
GitHub Actions (workflow CI/CD)
  │
  ├─ Build + push imagen      -> GITHUB_TOKEN (permissions: packages: write)
  │                              ghcr.io/flaviooria/el-contable-api:{latest,sha-<commit>}
  │
  ├─ Autenticación SSH        -> VPS_HOST, VPS_USER, VPS_DEPLOY_KEY, VPS_KNOWN_HOSTS
  │
  ├─ Autenticación GHCR (VPS) -> VPS_GHCR_USERNAME, VPS_GHCR_TOKEN (read:packages)
  │
  └─ Despliegue Docker        -> escribe .env.deploy (IMAGE_TAG=sha-...), pull, up -d
```

## 9.3 Obtener VPS_KNOWN_HOSTS

Obtén la clave del host **desde el propio VPS** (consola del proveedor o sesión SSH ya verificada), no con un `ssh-keyscan` sin verificar.

```bash
# En el VPS
sudo cat /etc/ssh/ssh_host_ed25519_key.pub
```

```text
# Valor del secret VPS_KNOWN_HOSTS
<VPS_HOST> ssh-ed25519 <host-public-key-base64>
```

## 9.4 Repo y registry privados

**Publicar (push):** funciona igual con repo privado. El job usa `GITHUB_TOKEN` con `permissions: packages: write`. Añade la label `org.opencontainers.image.source=https://github.com/flaviooria/el_contable` a la imagen para que el paquete quede vinculado al repo y herede su visibilidad y permisos.

**Descargar en el VPS (pull):**

**Opción A — actual (la que usamos):** PAT clásico con **solo** `read:packages`, pasado como `VPS_GHCR_USERNAME` / `VPS_GHCR_TOKEN`.

```bash
echo "$VPS_GHCR_TOKEN" | docker login ghcr.io -u "$VPS_GHCR_USERNAME" --password-stdin
```

- Ventaja: permite hacer `pull` manual en el VPS (p. ej. rollback a mano).
- Inconveniente: credencial de larga duración. Ponle fecha de caducidad y rótala periódicamente.

**Opción B — alternativa:** reutilizar el `GITHUB_TOKEN` efímero del job dentro de la sesión SSH. Elimina el PAT y los secrets `VPS_GHCR_*`.

```bash
# Ejecutado en el VPS a través de la sesión SSH del workflow
echo "$GITHUB_TOKEN" | docker login ghcr.io -u "$GITHUB_ACTOR" --password-stdin
docker compose -f compose.prod.yml --env-file .env.prod --env-file .env.deploy pull
docker compose -f compose.prod.yml --env-file .env.prod --env-file .env.deploy up -d
docker logout ghcr.io
```

- Ventaja: el token caduca al terminar el job; si se filtra, su utilidad es mínima.
- Inconveniente: un `pull` manual en el VPS necesita otra credencial. El rollback se hace relanzando el workflow con el SHA anterior.

**Otras implicaciones de un repo privado:**

- `git clone` en el VPS requiere credenciales: usa una **deploy key de solo lectura** por repo, o evita clonar haciendo que el workflow copie `compose.prod.yml` por `scp` (el VPS solo guarda `.env.prod` y `.env.deploy`).
- Los minutos de GitHub Actions consumen cuota (2000 min/mes en el plan Free); en repos públicos son gratis.
- Los environments con protection rules (aprobación manual antes del deploy) no están disponibles en el plan Free para repos privados.

**Referencia:** [GitHub - Working with the Container registry](https://docs.github.com/en/packages/working-with-a-github-packages-registry/working-with-the-container-registry)

# 10. Troubleshooting

Formato: **Síntoma / Causa / Solución / Estado**.

## A. SSH y conexión desde GitHub Actions

**A.1 GitHub Actions no podía conectar con el VPS** <span class="badge ok">Resuelto</span>
- Síntoma: timeout al conectar por SSH.
- Causa: reglas del firewall del VPS.
- Solución: revisar el firewall y permitir 22/tcp (sección 5.1).

**A.2 SSH aceptaba la clave, pero la conexión no terminaba** <span class="badge ok">Resuelto</span>
- Síntoma: los logs mostraban `Server accepts key`, pero la conexión fallaba o se quedaba esperando.
- Causa: la clave privada tenía passphrase y Actions no puede introducirla de forma interactiva.
- Solución: clave ED25519 dedicada sin passphrase y su pública en `authorized_keys` de `deploy` (sección 2.2).

**A.3 Permisos SSH** <span class="badge ok">Resuelto</span>
- Solución:
  ```bash
  chmod 700 /home/deploy/.ssh
  chmod 600 /home/deploy/.ssh/authorized_keys
  chown -R deploy:deploy /home/deploy/.ssh
  ```

## B. GitHub Container Registry (GHCR)

**B.4 Nombre incorrecto de la imagen** <span class="badge ok">Resuelto</span>
- Causa: faltaba el owner de GitHub en el nombre.
- Solución: usar `ghcr.io/flaviooria/el-contable-api` en lugar de `ghcr.io/el-contable-api`.

**B.5 Autenticación contra GHCR** <span class="badge ok">Resuelto</span>
- En GitHub Actions: `GITHUB_TOKEN` con `packages: write`.
- En el VPS: PAT con `read:packages` (opción A, sección 9.4).
- La etiqueta desplegada se separa en `.env.deploy`.

## C. PostgreSQL

**C.6 Error de autenticación del usuario postgres** <span class="badge partial">Parcialmente resuelto</span>
- Síntoma: `password authentication failed for user "postgres"`.
- Causa: el volumen persistente se inicializó con otro usuario (`el_contable`). Las variables `POSTGRES_*` solo se aplican la primera vez que se crea el volumen.
- Solución aplicada: crear el rol `postgres` y revisar permisos. Estado actual:
  ```text
  el_contable | Superuser, Create role, Create DB, Replication, Bypass RLS
  postgres    | Superuser
  ```
- Revisado cómo migrar la propiedad de objetos y bases de datos (`REASSIGN OWNED BY el_contable TO postgres;` en cada BD, `ALTER DATABASE ... OWNER TO postgres;`) antes de eliminar `el_contable`.
- Pendiente: verificar que la aplicación conecta con el nuevo usuario y que todos los objetos están reasignados.
- **Importante:** no usar `docker compose down -v`; borra los datos.

## D. Traefik y Docker

**D.7 Permisos para acceder al socket Docker** <span class="badge ok">Resuelto</span>
- Síntoma: `permission denied` en `/var/run/docker.sock`.
- Causa: el usuario que ejecutaba los comandos no tenía permisos.
- Solución: usar sudo y, después, dar acceso a Traefik mediante socket proxy.

**D.8 Configuración del Docker Socket Proxy** <span class="badge ok">Resuelto</span>
- `image: ghcr.io/tecnativa/docker-socket-proxy:v0.5.0`
- Traefik: `--providers.docker.endpoint=tcp://socket-proxy:2375`
- Red interna `docker-api`.

**D.9 Certificate resolver inexistente** <span class="badge check">En comprobación</span>
- Síntoma:
  ```text
  Router uses a nonexistent certificate resolver
  certificateResolver=cf routerName=el-contable-api@docker
  ```
- Causa: nombres inconsistentes. La configuración estática declaraba `cf`, la API usaba `cf` y el dashboard usaba `cloudflare`.
- Solución: unificar todos los routers con `tls.certresolver=cf`. Además se separó correctamente el compose:
  - `command:` configuración estática de Traefik.
  - `labels:` configuración dinámica de routers y servicios.
- Pendiente: confirmar en los logs que Let's Encrypt emite los certificados por DNS-01.

## E. Seguridad del VPS

**E.10 Configuración SSH sobrescrita por cloud-init** <span class="badge check">En comprobación</span>
- Síntoma: tras modificar SSH, `PasswordAuthentication` seguía en `yes`.
- Causa: `50-cloud-init.conf` se lee antes que nuestro fichero y su valor prevalece.
- Diagnóstico: `grep` en `/etc/ssh/sshd_config` y `/etc/ssh/sshd_config.d/`.
- Pendiente: verificar la configuración efectiva:
  ```bash
  sudo sshd -T | grep -i passwordauthentication
  ```

# 11. Inventario de credenciales

| Credencial / recurso | Dónde está | Estado |
| --- | --- | --- |
| Cloudflare API Token | VPS `/opt/infra/traefik/.env` | Configurado según compose |
| Email ACME | VPS `/opt/infra/traefik/.env` | Configurado según compose |
| Contraseña PostgreSQL | VPS `/opt/apps/el_contable/.env.prod` | Utilizada (rotar, ver 12) |
| GitHub PAT `read:packages` | GitHub Secrets (`VPS_GHCR_TOKEN`) / VPS | Configurado |
| `GITHUB_TOKEN` | GitHub Actions (automático) | Utilizado |
| Clave privada SSH deploy | GitHub Secrets (`VPS_DEPLOY_KEY`) | Generada |
| Clave pública SSH deploy | VPS `/home/deploy/.ssh/authorized_keys` | Configurada |
| `acme.json` | VPS `/opt/infra/traefik/letsencrypt/` | Montado en Traefik |
| Variables de despliegue | VPS `/opt/apps/el_contable/.env.deploy` | Utilizadas |

| Ubicación | Variables / credenciales |
| --- | --- |
| GitHub Repository Secrets | `VPS_DEPLOY_KEY`, `VPS_GHCR_TOKEN`, `VPS_GHCR_USERNAME`, `VPS_HOST`, `VPS_KNOWN_HOSTS`, `VPS_USER` |
| `/opt/infra/traefik/.env` | `CF_DNS_API_TOKEN`, `TRAEFIK_ACME_EMAIL`, `DOMAIN_NAME` |
| `/opt/apps/el_contable/.env.prod` | `POSTGRES_USER`, `POSTGRES_PASSWORD`, `POSTGRES_DB`, `DOMAIN`, `IMAGE_TAG` |
| VPS | `acme.json`, clave pública SSH, configuración Docker |
| GitHub Actions | `GITHUB_TOKEN` |

# 12. Recomendaciones de seguridad y pendientes

Antes de considerar cerrada la infraestructura:

- [ ] **Rotar la contraseña de PostgreSQL:** se compartió durante la configuración; sustitúyela por una aleatoria y robusta.
- [ ] **Revisar el PAT:** mantener únicamente `read:packages`, con caducidad.
- [ ] **Verificar los secretos de Actions:** la clave privada SSH está como secret y nunca aparece en los logs.
- [ ] **C.6** Verificar conexión de la app con el nuevo usuario de PostgreSQL y reasignación de objetos.
- [ ] **D.9** Confirmar emisión de certificados DNS-01 en los logs de Traefik.
- [ ] **E.10** Confirmar `passwordauthentication no` con `sudo sshd -T`.
- [ ] **7.4** Añadir defensa en profundidad al dashboard (`basicAuth`, validación JWT de Access o Authenticated Origin Pulls).
- [ ] **9.4** Valorar migrar a la opción B (`GITHUB_TOKEN` efímero) para eliminar el PAT.
- [ ] Revisar periódicamente los rangos IP de Cloudflare en el firewall.
