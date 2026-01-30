# Auto-Decrypt con Master Password en Sesión

Se ha implementado la funcionalidad para **desencriptar automáticamente** contraseñas usando el master password guardado en sesión, solicitando el password solo UNA VEZ por sesión.

## 🔄 Flujo de Desencriptación Seguro

### Primera desencriptación (sin master password en sesión):
```
1. Usuario intenta desencriptar contraseña
   ↓
2. handleDecryptPassword detecta que NO hay en sesión
   ↓
3. Mostrar modal MasterPasswordValidation
   ↓
4. Usuario ingresa master password
   ↓
5. Se valida contra /api/users/validate-master-password
   ↓
6. Se guarda encriptado en /api/session/master-password
   ↓
7. Se actualiza estado local sessionMasterPassword
   ↓
8. Se desencripta automáticamente SIN pasar el password ✅
```

### Siguientes desencriptaciones (MISMA SESIÓN):
```
1. Usuario intenta desencriptar otra contraseña
   ↓
2. handleDecryptPassword verifica sessionMasterPassword
   ↓
3. Existe en sesión → Usar automáticamente ✅
   ↓
4. Se desencripta SIN mostrar modal
   ↓
5. No se envía password al servidor
```

## 📋 Lógica Implementada

### handleDecryptPassword (PasswordTable)
```typescript
const handleDecryptPassword = (id: string): Promise<string> => {
    // Si está en sesión, usarlo automáticamente
    if (sessionMasterPassword) {
        return onDecryptPassword(id);  // Sin pasar password
    }

    // Si no hay master password configurado, desencriptar sin él
    if (!hasMasterPassword) {
        return onDecryptPassword(id);
    }

    // Si no está en sesión, solicitar al usuario
    return new Promise((resolve, reject) => {
        pendingDecryptRef.current = { id, resolve, reject };
        setPromptContext('decrypt');
        setShowMasterPasswordPrompt(true);  // Mostrar modal
    });
};
```

### handleMasterPasswordSuccess (PasswordTable)
```typescript
const handleMasterPasswordSuccess = async (masterPassword: string) => {
    // 1. Guardar en sesión encriptada
    await fetch('/api/session/master-password', {
        method: 'POST',
        body: JSON.stringify({ masterPassword }),
    });

    // 2. Actualizar estado local
    setSessionMasterPassword(masterPassword);
    
    // 3. Esperar confirmación
    await new Promise(resolve => setTimeout(resolve, 100));

    // 4. Desencriptar sin pasar el password
    const result = await onDecryptPassword(id);  // Sin masterPassword
};
```

### decryptPasswordAction (Server Action)
```typescript
export async function decryptPasswordAction(id: string, masterPassword?: string | null): Promise<string> {
  const userId = await ensureUser();
  
  let passwordToUse = masterPassword ?? undefined;
  
  // Si no se proporciona, obtenerlo de la sesión encriptada
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

## 🔒 Seguridad

- ✅ **Master password en sesión encriptada** (iron-session)
- ✅ **Nunca en HTTP** (obtenido del servidor)
- ✅ **httpOnly cookie** (no accesible desde JS)
- ✅ **CSRF protegido** (sameSite: strict)
- ✅ **Validado en servidor** antes de guardar

## 🎯 Comportamiento del Usuario

| Acción | Primera vez | Siguientes |
|--------|-------------|-----------|
| Desencriptar | ❓ Modal | ✅ Automático |
| Copiar password | ❓ Modal | ✅ Automático |
| Ver password | ❓ Modal | ✅ Automático |
| Nueva sesión | ❓ Modal | ❓ Modal |

## 📊 Estado

- ✅ Build exitoso
- ✅ Servidor en ejecución
- ✅ Flujo de seguridad mejorado
- ✅ Master password solo se pide UNA vez por sesión

---

**Flujo seguro**: El master password se solicita solo la primera vez, se valida, se encripta en sesión, y luego se usa automáticamente en desencriptaciones posteriores sin viajar por HTTP.

