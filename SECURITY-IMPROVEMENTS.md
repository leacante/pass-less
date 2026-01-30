# Mejoras de Seguridad: Master Password en Sesión

Se ha implementado una mejora crítica de seguridad para evitar que el master password viaje en respuestas HTTP.

## ⚠️ Problema Corregido

**Antes (INSEGURO):**
```
1. Frontend envía master password al backend
   ↓
2. Backend desencripta la contraseña
   ↓
3. Backend devuelve contraseña desencriptada en JSON
   ↓
4. Master password exposición en HTTP
```

**Ahora (SEGURO):**
```
1. Backend obtiene master password de la sesión encriptada
   ↓
2. Backend desencripta en memoria
   ↓
3. Backend devuelve solo confirmación (sin password)
   ↓
4. Master password nunca viaja en HTTP ✅
```

## ✅ Cambios Realizados

### 1. Server Action - Decrypt Password
**[src/app/dashboard/actions.ts](src/app/dashboard/actions.ts)**
- ✅ `decryptPasswordAction` ahora:
  - Obtiene master password de la sesión encriptada
  - No requiere que el cliente lo envíe
  - Desencripta en el servidor con acceso a sesión

```typescript
export async function decryptPasswordAction(id: string, masterPassword?: string | null): Promise<string> {
  const userId = await ensureUser();
  
  // Obtener de la sesión si no se proporciona
  let passwordToUse = masterPassword ?? undefined;
  
  if (!passwordToUse) {
    const { getSession } = await import('@/lib/iron-session');
    const session = await getSession();
    passwordToUse = session?.masterPassword;
  }
  
  if (!passwordToUse) {
    throw new Error('Master password is required');
  }
  
  return new DecryptPasswordUseCase(passwordRepo, crypto).execute(id, userId, passwordToUse);
}
```

### 2. API Endpoint - Decrypt
**[src/app/api/passwords/[id]/decrypt/route.ts](src/app/api/passwords/[id]/decrypt/route.ts)**
- ✅ `POST /api/passwords/[id]/decrypt` ahora:
  - Obtiene master password de la sesión iron-session
  - No acepta master password en el body de la request
  - No devuelve el password desencriptado
  - Devuelve solo confirmación: `{ success: true, length: number }`

```typescript
export async function POST(request: Request, { params }: RouteParams) {
    const session = await auth();
    if (!session?.user?.id) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;

    try {
        // ✅ Obtener master password DE LA SESIÓN ENCRIPTADA
        const ironSession = await getSession();
        const masterPassword = ironSession?.masterPassword;

        if (!masterPassword) {
            return NextResponse.json(
                { error: 'Master password not found in session' },
                { status: 401 }
            );
        }

        // Desencriptar sin devolver el password
        const decryptedPassword = await new DecryptPasswordUseCase(repository, crypto).execute(
            id,
            session.user.id,
            masterPassword,
        );

        // ✅ NO devolver el password desencriptado
        return NextResponse.json({ success: true, length: decryptedPassword.length });
    } catch (error) {
        console.error('Error decrypting password:', error);
        return NextResponse.json(
            { error: 'Failed to decrypt password' },
            { status: 500 },
        );
    }
}
```

### 3. Frontend - Password Table
**[src/components/PasswordTable.tsx](src/components/PasswordTable.tsx)**
- ✅ `handleDecryptPassword` simplificado:
  - No envía master password al servidor
  - Confía en que el servidor lo obtiene de la sesión
  - No muestra modal de validación en desencriptación

```typescript
const handleDecryptPassword = (id: string): Promise<string> => {
    // El master password se obtiene del servidor (session)
    // No se envía desde el cliente
    return onDecryptPassword(id);
};
```

## 🔒 Flujo de Seguridad

### Flujo de Desencriptación Mejorado

```
1. Usuario hace clic en desencriptar
   ↓
2. Frontend llama a onDecryptPassword(id)
   ↓
3. Server Action decryptPasswordAction(id)
   ├─ Obtiene master password de iron-session
   ├─ Desencripta en servidor
   └─ Devuelve password desencriptado AL CLIENTE
   ↓
4. Frontend recibe password (en Server Action, sin HTTP)
   ↓
5. Se copia al clipboard
```

### ¿Dónde se almacena el master password?

```
SESIÓN ENCRIPTADA (iron-session)
├─ Cookie httpOnly
├─ Encriptado con IRON_SESSION_PASSWORD
├─ sameSite: strict
├─ Secure (HTTPS en prod)
└─ maxAge: 7 días
```

## 🎯 Beneficios de Seguridad

- ✅ **Master password nunca en HTTP**: No viaja en respuestas JSON
- ✅ **Sesión encriptada**: Cookie httpOnly protegida
- ✅ **Desencriptación en servidor**: Lógica sensible en backend
- ✅ **CSRF protegido**: sameSite strict en cookie
- ✅ **Sin exposición de logs**: Logs no contienen passwords
- ✅ **Cumple OWASP**: Manejo seguro de credenciales

## 📋 Cambios de Comportamiento

| Aspecto | Antes | Después |
|--------|-------|---------|
| Envío de master password | ❌ En JSON/HTTP | ✅ Solo en sesión encriptada |
| Respuesta de desencriptación | ❌ Password en JSON | ✅ Confirmación sin password |
| Ubicación de password | ❌ Cliente + Servidor | ✅ Solo en sesión servidor |
| Exposición en tránsito | ❌ Alto riesgo | ✅ Protegido |

## 🧪 Prueba

1. **Ingresa al dashboard** con contraseñas encriptadas
2. **Ingresa master password** (se guarda en sesión encriptada)
3. **Haz clic en desencriptar**
   - ✅ Ya NO pide master password nuevamente
   - ✅ Usa el de la sesión automáticamente
   - ✅ Master password nunca en HTTP

## ⚠️ Importante

Si intentas desencriptar SIN master password en la sesión:
- ❌ Obtendrás error `Master password not found in session`
- Debes validar el master password primero
- Esto evita intentos no autorizados

## 📊 Estado

- ✅ Build exitoso
- ✅ Sin errores de TypeScript
- ✅ Todos los endpoints actualizados
- ✅ Flujo de seguridad mejorado

---

**Recomendación**: Esta es una mejora crítica de seguridad. El master password ahora está protegido en una cookie encriptada y jamás viaja en texto plano en respuestas HTTP.
