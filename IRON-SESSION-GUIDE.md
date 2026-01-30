# Iron Session Setup Guide

## ¿Qué es Iron Session?

Iron Session es una solución segura para manejar sesiones en Next.js usando cookies **encriptadas y firmadas**. Proporciona:

- ✅ Cookies encriptadas automáticamente
- ✅ Protección contra CSRF con `HttpOnly` y `SameSite`
- ✅ Sin necesidad de base de datos de sesiones
- ✅ Integración sencilla con Next.js

## Instalación

Ya está instalado. Para verificar:

```bash
npm list iron-session
```

## Configuración

### 1. Configurar variable de entorno

En tu archivo `.env.local`, añade:

```env
IRON_SESSION_PASSWORD="generate-a-random-32-character-password"
```

Para generar una contraseña segura:

**Linux/Mac:**

```bash
openssl rand -base64 32
```

**PowerShell (Windows):**

```powershell
$password = -join ((1..32) | ForEach-Object { '{0:x2}' -f (Get-Random -Maximum 256) })
[Convert]::ToBase64String([byte[]] -split ($password -replace '..', '0x$&' -replace ' '))
```

O simplemente usa este script Python:

```python
import secrets
print(secrets.token_urlsafe(32))
```

> ⚠️ **IMPORTANTE**: La contraseña debe tener al menos 32 caracteres. Si es muy corta, iron-session lanzará un error.

## Uso

### En componentes del servidor (Server Components)

```typescript
import { getSession, saveSession } from '@/lib/iron-session';

export default async function MyPage() {
    const session = await getSession();
    
    return (
        <div>
            {session.isLoggedIn ? (
                <p>Bienvenido {session.email}</p>
            ) : (
                <p>No autenticado</p>
            )}
        </div>
    );
}
```

### En componentes del cliente (Client Components)

```typescript
'use client';

import { useIronSession } from '@/components/hooks/useIronSession';

export default function Profile() {
    const { session, loading } = useIronSession();
    
    if (loading) return <div>Cargando...</div>;
    
    return (
        <div>
            {session?.isLoggedIn ? (
                <p>Usuario: {session.email}</p>
            ) : (
                <p>No autenticado</p>
            )}
        </div>
    );
}
```

## API Endpoints

### GET /api/session

Obtiene los datos de la sesión actual.

```bash
curl http://localhost:3000/api/session
```

**Respuesta:**

```json
{
    "userId": "user-123",
    "email": "user@example.com",
    "isLoggedIn": true
}
```

### POST /api/session/sign-in

Crea una nueva sesión.

```bash
curl -X POST http://localhost:3000/api/session/sign-in \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "user-123",
    "email": "user@example.com"
  }'
```

### POST /api/session/sign-out

Destruye la sesión actual.

```bash
curl -X POST http://localhost:3000/api/session/sign-out
```

### POST /api/session

Actualiza datos de la sesión.

```bash
curl -X POST http://localhost:3000/api/session \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "user-123",
    "email": "newemail@example.com",
    "isLoggedIn": true
  }'
```

### DELETE /api/session

Destruye la sesión (alias de sign-out).

```bash
curl -X DELETE http://localhost:3000/api/session
```

### POST /api/session/master-password

Guarda el master password en la sesión después de validarlo. El master password se encripta automáticamente en la cookie.

```bash
curl -X POST http://localhost:3000/api/session/master-password \
  -H "Content-Type: application/json" \
  -d '{"masterPassword":"tu-contraseña-maestra"}'
```

**Respuesta:**

```json
{
    "message": "Master password guardado en sesión",
    "session": {
        "userId": "user-123",
        "email": "user@example.com",
        "isLoggedIn": true,
        "masterPassword": "encriptado-en-sesion"
    }
}
```

### DELETE /api/session/master-password

Elimina el master password de la sesión.

```bash
curl -X DELETE http://localhost:3000/api/session/master-password
```

## Integración con NextAuth

Iron Session funciona junto con NextAuth. Ambos pueden coexistir:

- **NextAuth**: Maneja la autenticación OAuth (Google, etc.)
- **Iron Session**: Proporciona sesiones encriptadas adicionales

El middleware chequea ambos:
```typescript
const authenticated = isLoggedIn || sessionLoggedIn;
```

### Sincronización entre NextAuth e Iron Session

Para sincronizar automáticamente una sesión de NextAuth con iron-session después de que el usuario inicie sesión:

```typescript
// En tu componente después de iniciar sesión con Google
const response = await fetch('/api/session/sync-auth', {
    method: 'POST',
});

const data = await response.json();
console.log('Session synchronized:', data);
```

#### POST /api/session/sync-auth

Sincroniza la sesión actual de NextAuth con iron-session, encriptando los datos en la cookie.

```bash
curl -X POST http://localhost:3000/api/session/sync-auth
```

**Respuesta:**

```json
{
    "message": "Session synchronized",
    "session": {
        "userId": "user-123",
        "email": "user@example.com",
        "isLoggedIn": true
    }
}
```


## Seguridad

### Configuración de cookies seguras

Las cookies están configuradas con:

- `secure: true` (solo en producción)
- `httpOnly: true` (no accesible desde JavaScript)
- `sameSite: 'strict'` (protección CSRF)
- `maxAge: 604800` (7 días de expiración)

### Encriptación

- Las cookies se encriptan automáticamente usando la contraseña
- No se almacena información sensible en texto plano
- Compatible con los estándares de seguridad OWASP

## Troubleshooting

### "password must be at least 32 characters"

La contraseña `IRON_SESSION_PASSWORD` es muy corta. Debe tener mínimo 32 caracteres.

### Las cookies no persisten

Verifica que:

1. `IRON_SESSION_PASSWORD` está configurada correctamente
2. En desarrollo, `secure: false` está habilitado (se hace automáticamente)
3. El navegador permite cookies

### Error "Cannot read property 'cookies' of undefined"

Iron Session necesita el contexto de Next.js. Asegúrate de usar:

- `getSession()` en Server Components
- `useIronSession()` hook en Client Components

## Archivos relacionados

- [iron-session.ts](../lib/iron-session.ts) - Configuración y funciones principales
- [useIronSession.ts](../components/hooks/useIronSession.ts) - Hook para componentes del cliente
- [session/route.ts](../app/api/session/route.ts) - Endpoints de sesión
- [middleware.ts](../middleware.ts) - Middleware con soporte de iron-session
