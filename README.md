# Pass-Less 🔐

Gestor de contraseñas seguro con encriptación AES-256-GCM, autenticación con Google OAuth, y listo para Cloud Run.

## ✨ Características

- 🔒 **Encriptación AES-256-GCM** - Las contraseñas se almacenan encriptadas con IV único por registro
- 🔑 **Google SSO** - Login seguro con tu cuenta de Google
- 📋 **Gestión inline** - Alta, edición y eliminación directamente en la tabla
- 📱 **Responsive** - Diseño adaptable a cualquier dispositivo
- ☁️ **Cloud Ready** - Optimizado para Google Cloud Run

## 🏗️ Arquitectura

```
Frontend (React/Next.js)
    ↓
API Routes (Next.js)
    ↓
Encryption Module (AES-256-GCM)
    ↓
SQLite/Prisma
```

### Seguridad

- Las passwords **nunca se almacenan en texto plano**
- AES-256-GCM con:
  - IV aleatorio de 16 bytes por registro
  - Auth tag para verificación de integridad
- Desencriptación solo al momento de copiar (endpoint `/api/passwords/[id]/decrypt`)
- Sesiones JWT con NextAuth v5

## 🚀 Setup Local

### 1. Clonar e instalar

```powershell
git clone <repo-url>
cd pass-less
npm install
```

### 2. Configurar variables de entorno

```powershell
Copy-Item .env.example .env
```

Editar `.env`:

```env
DATABASE_URL="file:./data.db"
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="<generar con: openssl rand -base64 32>"
GOOGLE_CLIENT_ID="<tu-client-id>.apps.googleusercontent.com"
GOOGLE_CLIENT_SECRET="GOCSPX-<tu-secret>"
ENCRYPTION_KEY="<generar con: openssl rand -hex 32>"
```

### 3. Configurar Google OAuth

1. Ir a [Google Cloud Console](https://console.cloud.google.com/apis/credentials)
2. Crear proyecto o seleccionar existente
3. Crear credenciales → OAuth 2.0 Client ID → Aplicación web
4. Agregar URIs autorizados:
   - Orígenes: `http://localhost:3000`
   - Redirección: `http://localhost:3000/api/auth/callback/google`
5. Copiar Client ID y Secret al `.env`

### 4. Inicializar base de datos

```powershell
npx prisma generate
npx prisma db push
```

### 5. Ejecutar

```powershell
npm run dev
```

Abrir [http://localhost:3000](http://localhost:3000)

## 🐳 Docker

### Build local

```powershell
docker build -t pass-less .
docker run -p 3000:3000 --env-file .env pass-less
```

## ☁️ Deploy en Cloud Run

### 1. Preparar GCP

```powershell
# Autenticarse
gcloud auth login
gcloud config set project [PROJECT_ID]

# Habilitar APIs
gcloud services enable run.googleapis.com
gcloud services enable secretmanager.googleapis.com
gcloud services enable cloudbuild.googleapis.com
```

### 2. Crear secrets

```powershell
# Crear secrets en Secret Manager
echo -n "tu-nextauth-secret" | gcloud secrets create nextauth-secret --data-file=-
echo -n "tu-google-client-secret" | gcloud secrets create google-client-secret --data-file=-
echo -n "tu-encryption-key-64-chars" | gcloud secrets create encryption-key --data-file=-
```

### 3. Build y deploy

```powershell
# Build con Cloud Build
gcloud builds submit --tag gcr.io/[PROJECT_ID]/pass-less

# Deploy a Cloud Run
gcloud run deploy pass-less `
  --image gcr.io/[PROJECT_ID]/pass-less `
  --platform managed `
  --region us-central1 `
  --allow-unauthenticated `
  --set-env-vars "DATABASE_URL=file:./data.db,NEXTAUTH_URL=https://pass-less-xxx.run.app,GOOGLE_CLIENT_ID=xxx.apps.googleusercontent.com" `
  --set-secrets "NEXTAUTH_SECRET=nextauth-secret:latest,GOOGLE_CLIENT_SECRET=google-client-secret:latest,ENCRYPTION_KEY=encryption-key:latest"
```

### 4. Actualizar OAuth

Agregar la URL de Cloud Run a las URIs autorizadas en Google Cloud Console:
- Origen: `https://pass-less-xxx.run.app`
- Redirección: `https://pass-less-xxx.run.app/api/auth/callback/google`

## ⚠️ Producción: Base de datos persistente

> **Nota**: SQLite en Cloud Run no persiste entre deploys. Para producción:

1. Usar **Cloud SQL (PostgreSQL)** o **Firestore**
2. Modificar `DATABASE_URL` en Prisma
3. El schema es compatible con PostgreSQL sin cambios

## 📁 Estructura

```
pass-less/
├── prisma/
│   └── schema.prisma          # Modelo de datos
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   ├── auth/          # NextAuth endpoints
│   │   │   └── passwords/     # CRUD + decrypt
│   │   ├── dashboard/         # Pantalla principal
│   │   ├── globals.css        # Estilos
│   │   ├── layout.tsx         # Layout con providers
│   │   └── page.tsx           # Landing
│   ├── components/            # React components
│   ├── lib/
│   │   ├── auth.ts            # NextAuth config
│   │   ├── crypto.ts          # AES-256-GCM
│   │   └── db.ts              # Prisma client
│   └── middleware.ts          # Route protection
├── Dockerfile
└── .env.example
```

## 🔧 Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Auth**: NextAuth v5 + Google OAuth
- **Database**: SQLite + Prisma ORM
- **Encryption**: Node.js crypto (AES-256-GCM)
- **Styling**: CSS vanilla con variables
- **Deploy**: Docker + Cloud Run

## 📄 Licencia

MIT
