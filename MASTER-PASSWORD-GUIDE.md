# Master Password Feature - Guía de Integración

## Descripción General

Se ha implementado una feature completa de **Master Password** que permite a cada usuario crear y usar una contraseña maestra para encriptar sus datos de forma más segura.

## Cambios Realizados

### 1. **Schema de Prisma** (`prisma/schema.prisma`)
Se agregaron tres campos al modelo `User`:
- `masterPasswordHash`: Almacena el hash del master password (PBKDF2)
- `masterPasswordSalt`: Almacena el salt único para cada usuario
- `masterPasswordSetupAt`: Timestamp de cuándo se configuró el master password

### 2. **Utilidades de Crypto** (`src/lib/masterPassword.ts`)
Nuevas funciones para manejar el master password:
- `hashMasterPassword()`: Genera hash y salt del master password
- `verifyMasterPassword()`: Verifica si un password es correcto
- `deriveMasterPasswordKey()`: Deriva una clave de encriptación a partir del master password

### 3. **Use Cases** 
- `SetupMasterPasswordUseCase.ts`: Configura el master password de un usuario
- `ValidateMasterPasswordUseCase.ts`: Valida el master password ingresado

### 4. **Repositorios**
- `UserRepository.ts` (interfaz): Define operaciones de usuario
- `PrismaUserRepository.ts`: Implementación con Prisma

### 5. **Servicio de Encriptación** (`src/core/infrastructure/crypto/NodeCryptoService.ts`)
Actualizado para soportar encriptación opcional con master password:
- Si se proporciona `masterPassword`, se usa para derivar la clave de encriptación
- Si no se proporciona, usa el comportamiento anterior (clave derivada del userId)

### 6. **API Endpoints**
- `POST /api/users/master-password`: Configura el master password
- `POST /api/users/validate-master-password`: Valida el master password

### 7. **Componentes UI**
- `MasterPasswordSetup.tsx`: Modal para configurar el master password (primera vez)
- `MasterPasswordValidation.tsx`: Modal para ingresar el master password

## Instrucciones de Integración

### Paso 1: Ejecutar Migración de Base de Datos
```bash
npx prisma migrate dev --name add_master_password
```

### Paso 2: Integrar en el Dashboard
En `src/app/dashboard/page.tsx` o `DashboardClient.tsx`, agregar:

```typescript
import { useEffect, useState } from 'react';
import MasterPasswordSetup from '@/components/MasterPasswordSetup';
import MasterPasswordValidation from '@/components/MasterPasswordValidation';
import { useSession } from 'next-auth/react';

// En el componente:
const { data: session } = useSession();
const [showMasterPasswordSetup, setShowMasterPasswordSetup] = useState(false);
const [showMasterPasswordValidation, setShowMasterPasswordValidation] = useState(false);
const [masterPassword, setMasterPassword] = useState<string | null>(null);
const [hasMasterPassword, setHasMasterPassword] = useState(false);

useEffect(() => {
  // Verificar si el usuario tiene master password configurado
  const checkMasterPasswordStatus = async () => {
    if (!session?.user?.email) return;
    
    try {
      const response = await fetch('/api/users/profile'); // necesita implementarse
      const data = await response.json();
      setHasMasterPassword(!!data.masterPasswordHash);
      
      if (!hasMasterPassword && !localStorage.getItem('masterPasswordSetupDismissed')) {
        setShowMasterPasswordSetup(true);
      }
    } catch (error) {
      console.error('Error checking master password status:', error);
    }
  };

  checkMasterPasswordStatus();
}, [session]);
```

### Paso 3: Usar Master Password en Encriptación
Cuando se creen o actualicen contraseñas, pasar el master password a los endpoints:

```typescript
// En CreatePasswordUseCase o similar:
const createPassword = async (data: PasswordData) => {
  const response = await fetch('/api/passwords', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      ...data,
      masterPassword: masterPassword || undefined, // Solo si existe
    }),
  });
  // ...
};
```

### Paso 4: Crear Endpoint de Perfil de Usuario (Opcional)
Para obtener información del usuario, crear:
`src/app/api/users/profile/route.ts`

```typescript
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/db';

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return new Response('Unauthorized', { status: 401 });
  }

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    select: {
      id: true,
      email: true,
      name: true,
      image: true,
      masterPasswordHash: true,
      masterPasswordSetupAt: true,
    },
  });

  if (!user) {
    return new Response('User not found', { status: 404 });
  }

  return Response.json(user);
}
```

## Flujo de Seguridad

1. **Setup**: Usuario configura master password → Se genera hash + salt → Se almacena en BD
2. **Validación**: Usuario ingresa password → Se valida contra hash almacenado
3. **Encriptación**: Si valida correctamente → Se usa para derivar clave de encriptación
4. **Desencriptación**: Se solicita master password → Se desencriptan los datos con la clave derivada

## Notas Importantes

⚠️ **IMPORTANTE**: 
- El master password **NUNCA** se almacena en texto plano, solo su hash
- La encriptación es compatible hacia atrás: si un usuario no tiene master password, se usa el método anterior
- El usuario debe recordar su master password; **NO HAY RECUPERACIÓN** si la olvida
- Se recomienda agregar una advertencia clara en la UI sobre esto

## Próximos Pasos Opcionales

1. Integrar la validación de master password en cada operación de descifrado
2. Agregar opción para cambiar/resetear master password
3. Implementar validación biométrica como alternativa
4. Agregar historiales de cuándo se usó el master password
5. Implementar lockout temporal después de N intentos fallidos

## Testing

Para probar la feature manualmente:

```bash
# 1. Iniciar la app
npm run dev

# 2. Crear cuenta y acceder al dashboard
# 3. Configurar master password
# 4. Intentar crear/editar una contraseña
# 5. Verificar que se encripte correctamente
```
