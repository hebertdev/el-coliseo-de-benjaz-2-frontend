# 🚀 Guía Definitiva: Instalación de Plausible Analytics (Self-Hosted) en VPS Ubuntu + Next.js

Guía paso a paso probada y garantizada para instalar **Plausible Analytics Community Edition** en un VPS con **Ubuntu** usando **Docker**, exponer el panel web y conectarlo con **Next.js**.

---

## 📋 Requisitos Previos

- Servidor VPS (Ubuntu 22.04 / 24.04).
- IP Pública de tu VPS (ejemplo: `64.177.41.212`).
- Acceso por SSH como usuario `root` o con privilegios `sudo`.

---

## 🛠️ Paso 1: Instalar Docker y Docker Compose en el VPS

Ejecuta en la terminal de tu VPS:

```bash
# 1. Actualizar repositorios e instalar Docker y el plugin de Compose v2
apt update
apt install -y docker.io docker-compose-v2

# 2. Habilitar e iniciar el servicio de Docker
systemctl enable --now docker
```

---

## 🛡️ Paso 2: Abrir el Puerto 8000 en el Cortafuegos (Firewall)

Para evitar errores de conexión (_Timeout_), abre el puerto 8000:

```bash
ufw allow 8000/tcp
iptables -I INPUT -p tcp --dport 8000 -j ACCEPT
```

---

## 📦 Paso 3: Clonar Plausible CE y Configurar Variables

```bash
# 1. Ir al directorio raíz del usuario
cd ~

# 2. Clonar el repositorio oficial de Plausible Community Edition
git clone https://github.com/plausible/community-edition.git plausible
cd plausible

# 3. Generar una clave secreta aleatoria en una variable
SECRET=$(openssl rand -base64 48)

# 4. Crear el archivo .env con la IP pública de tu VPS (Reemplaza TU_IP_VPS por la tuya)
cat <<EOF > .env
BASE_URL=http://TU_IP_VPS:8000
SECRET_KEY_BASE=$SECRET
EOF

# 5. Duplicar la configuración para compatibilidad
cp .env plausible-conf.env
```

> 📌 **Ejemplo real:** `BASE_URL=http://64.177.41.212:8000`

---

## 🌐 Paso 4: Permitir Conexiones Externas al Puerto 8000

Por defecto Plausible escucha solo en `127.0.0.1`. Crea un archivo de anulación (`compose.override.yml`) para publicar el puerto a la IP pública:

```bash
cat <<EOF > compose.override.yml
services:
  plausible:
    ports:
      - "8000:8000"
EOF
```

---

## 🚀 Paso 5: Levantar los Contenedores con Docker Compose

```bash
docker compose up -d
```

Verifica que los contenedores estén activos con:

```bash
docker ps
```

_Deberías ver `plausible-plausible-1` en estado `Up` y mostrando `0.0.0.0:8000->8000/tcp`._

---

## 💻 Paso 6: Configurar la Cuenta de Administrador

1. Abre tu navegador e ingresa a: **`http://TU_IP_VPS:8000`**
2. Completa el formulario de registro inicial (Nombre, Email y Contraseña).
3. Agrega el dominio de tu sitio web (ejemplo: `elcoliseodebenjaz.com`).

---

## ⚛️ Paso 7: Integrar el Script en Next.js (App Router)

En el proyecto de Next.js, abre el archivo `src/app/layout.tsx` e incluye la etiqueta `<Script>` de Next.js:

```tsx
import Script from "next/script";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es">
      <head>
        {/* Script de Rastreo de Plausible Analytics */}
        <Script
          defer
          data-domain="elcoliseodebenjaz.com" // Tu dominio registrado
          src="http://TU_IP_VPS:8000/js/script.js" // URL de tu VPS
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
```

---

## 🔍 Cheat Sheet / Solución de Errores Comunes

| Error en el Navegador      | Causa                                                 | Solución                                                                                                |
| :------------------------- | :---------------------------------------------------- | :------------------------------------------------------------------------------------------------------ |
| `ERR_CONNECTION_TIMED_OUT` | El Firewall del VPS bloquea el puerto 8000            | Ejecutar `ufw allow 8000/tcp`                                                                           |
| `ERR_CONNECTION_REFUSED`   | Plausible no expone el puerto al exterior (`0.0.0.0`) | Crear `compose.override.yml` con `ports: ["8000:8000"]` y ejecutar `docker compose up -d`               |
| Contenedor en `Restarting` | Variables `BASE_URL` o `SECRET_KEY_BASE` no definidas | Crear el archivo `.env` con las variables y reiniciar con `docker compose down && docker compose up -d` |
