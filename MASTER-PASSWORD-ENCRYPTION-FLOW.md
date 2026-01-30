# Flujo de Encriptación y Desencriptación con Master Password

## 📌 Visión General

Una vez que el usuario crea un **Master Password**, todas las contraseñas almacenadas se encriptan usando una clave derivada de ese master password, en lugar de solo usar el ID del usuario.

---

## 🔄 Flujo Detallado

### **Fase 1: Setup del Master Password**

```
Usuario configura Master Password
         ↓
┌─────────────────────────────────────┐
│  hashMasterPassword(masterPassword) │
│  - Genera salt aleatorio            │
│  - Calcula: PBKDF2(password, salt)  │
│  - Retorna: hash + salt             │
└─────────────────────────────────────┘
         ↓
  Se almacena en BD:
  - User.masterPasswordHash = hash
  - User.masterPasswordSalt = salt
```

---

### **Fase 2: Encriptación de Contraseñas (Crear/Actualizar)**

#### **SIN Master Password** (Comportamiento anterior):
```
createPassword(username, password, description)
         ↓
NodeCryptoService.encrypt(password, userId)
         ↓
┌──────────────────────────────────────┐
│ Key derivation:                      │
│ key = PBKDF2(MASTER_KEY, userId)     │
│ (100,000 iteraciones)                │
└──────────────────────────────────────┘
         ↓
┌──────────────────────────────────┐
│ AES-256-GCM Encryption:          │
│ - iv = random 16 bytes           │
│ - encrypted = AES256(password)   │
│ - authTag = verificación         │
└──────────────────────────────────┘
         ↓
Se guarda en BD:
{
  encryptedPassword: "base64...",
  iv: "base64...",
  authTag: "base64..."
}
```

#### **CON Master Password** (Nuevo):
```
createPassword(username, password, description, masterPassword)
         ↓
NodeCryptoService.encrypt(password, userId, masterPassword)
         ↓
┌──────────────────────────────────────┐
│ Key derivation:                      │
│ key = PBKDF2(masterPassword, userId) │
│ (100,000 iteraciones)                │
│ ← CAMBIO IMPORTANTE: usa el master   │
│   password en lugar de MASTER_KEY    │
└──────────────────────────────────────┘
         ↓
┌──────────────────────────────────┐
│ AES-256-GCM Encryption:          │
│ - iv = random 16 bytes           │
│ - encrypted = AES256(password)   │
│ - authTag = verificación         │
└──────────────────────────────────┘
         ↓
Se guarda en BD (igual que antes):
{
  encryptedPassword: "base64...",
  iv: "base64...",
  authTag: "base64..."
}
```

**Ventaja:** La encriptación es más fuerte porque depende del master password que solo el usuario conoce.

---

### **Fase 3: Desencriptación (Ver Contraseña)**

#### **Flujo con Master Password**:

```
Usuario hace click en "Ver contraseña"
         ↓
Cliente necesita validar primero:
┌──────────────────────────────────────┐
│ Mostrar modal: "Ingresa Master Pass" │
└──────────────────────────────────────┘
         ↓
fetch('/api/users/validate-master-password', {
  method: 'POST',
  body: { masterPassword: inputMasterPassword }
})
         ↓
┌──────────────────────────────────────┐
│ Backend valida:                      │
│ - Obtiene user.masterPasswordHash    │
│ - Obtiene user.masterPasswordSalt    │
│ - Calcula: PBKDF2(inputMasterPass,   │
│            salt, 100000 iter)        │
│ - Compara con hash almacenado        │
│ - Si coincide: retorna isValid:true  │
└──────────────────────────────────────┘
         ↓
Si es válido, cliente envía:
fetch('/api/passwords/:id/decrypt', {
  method: 'POST',
  body: { masterPassword: inputMasterPassword }
})
         ↓
Backend:
┌──────────────────────────────────────┐
│ decryptPassword(id, userId,          │
│                 masterPassword)      │
│                                      │
│ 1. Obtiene el registro encriptado    │
│ 2. Deriva clave:                     │
│    key = PBKDF2(masterPassword,      │
│           userId, 100000)            │
│ 3. AES-256-GCM Decrypt con:          │
│    - encrypted text                  │
│    - iv                              │
│    - authTag                         │
│ 4. Retorna: password desencriptado   │
└──────────────────────────────────────┘
         ↓
Cliente recibe el password desencriptado
y lo muestra al usuario
```

---

## 🔐 Comparativa de Seguridad

| Aspecto | Sin Master Password | Con Master Password |
|--------|-------------------|-------------------|
| **Clave derivada de** | MASTER_KEY (env var) | Master Password (usuario) |
| **Complejidad** | Igual para todos | Única por usuario |
| **Si alguien accede a BD** | Puede desencriptar con MASTER_KEY | No puede sin master password |
| **Si MASTER_KEY se filtra** | ⚠️ Todos los datos vulnerable | ✅ Datos aún seguros |
| **Requiere validación** | No | Sí, cada vez que descifra |

---

## 📋 Pasos de Implementación en el Cliente

### 1. **Crear Contraseña**
```javascript
const response = await fetch('/api/passwords', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    username: 'admin',
    password: 'MySecurePassword123',
    description: 'Gmail account',
    masterPassword: userProvidedMasterPassword, // ← NUEVO
  })
});
```

### 2. **Ver/Desencriptar Contraseña**
```javascript
// Paso 1: Validar master password
const validateResponse = await fetch('/api/users/validate-master-password', {
  method: 'POST',
  body: JSON.stringify({ masterPassword: inputMasterPassword })
});

// Paso 2: Si es válido, desencriptar
if (validateResponse.ok) {
  const decryptResponse = await fetch(`/api/passwords/${id}/decrypt`, {
    method: 'POST',
    body: JSON.stringify({ masterPassword: inputMasterPassword })
  });
  const { password } = await decryptResponse.json();
  console.log(password); // Contraseña desencriptada
}
```

### 3. **Actualizar Contraseña**
```javascript
const response = await fetch(`/api/passwords/${id}`, {
  method: 'PUT',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    username: 'admin',
    password: 'NewPassword456',
    description: 'Gmail account',
    masterPassword: userProvidedMasterPassword, // ← NUEVO
  })
});
```

---

## ⚠️ Consideraciones Importantes

### **Registros Antiguos (Anteriores al Master Password)**
- Se encriptaron con MASTER_KEY (del env)
- Siguen siendo desencriptables sin master password
- Se pueden seguir usando normalmente

### **Migración de Registros Antiguos**
Para re-encriptar registros antiguos con el nuevo master password:
```typescript
// Use Case opcional: MigrateOldPasswordsUseCase
async migrate(userId: string, masterPassword: string) {
  1. Obtener todos los registros del usuario
  2. Para cada registro:
     - Desencriptar con clave antigua (sin masterPassword)
     - Re-encriptar con clave nueva (con masterPassword)
     - Guardar
}
```

### **Re-encriptación (Cambiar Master Password)**
Si el usuario olvida el master password, las contraseñas encriptadas son **irrecuperables**.

Opciones:
1. **No permitir cambio** - Master password es definitivo
2. **Re-encriptación permitida** - Usuario proporciona password viejo → nuevo
3. **Borrar y reconfigurar** - Usuario borra todos sus passwords y comienza de nuevo

---

## 🛡️ Resumen de Seguridad

```
Encriptación multinivel:
┌─────────────────────────────────────────┐
│ 1. Master Password (solo usuario sabe)  │
│ 2. PBKDF2 derivation (100k iterations)  │
│ 3. AES-256-GCM encryption               │
│ 4. Unique IV por registro               │
│ 5. Auth Tag para integridad             │
└─────────────────────────────────────────┘
```

---

## 📚 Archivos Actualizados

- `src/lib/masterPassword.ts` - Funciones de hash y verificación
- `src/core/application/use-cases/passwords/CreatePasswordUseCase.ts`
- `src/core/application/use-cases/passwords/UpdatePasswordUseCase.ts`
- `src/core/application/use-cases/passwords/DecryptPasswordUseCase.ts`
- `src/core/infrastructure/crypto/NodeCryptoService.ts`
- `src/app/api/passwords/route.ts` - Crear con master password
- `src/app/api/passwords/[id]/route.ts` - Actualizar con master password
- `src/app/api/passwords/[id]/decrypt/route.ts` - Desencriptar con validación
- `src/components/MasterPasswordSetup.tsx` - Setup UI
- `src/components/MasterPasswordValidation.tsx` - Validación antes de desencriptar
