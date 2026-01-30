import crypto from 'crypto';

const PBKDF2_ITERATIONS = 100000;
const KEY_LENGTH = 32; // 256 bits
const SALT_LENGTH = 16;

export interface MasterPasswordHash {
  hash: string;
  salt: string;
}

/**
 * Genera un salt aleatorio para el master password
 */
function generateSalt(): Buffer {
  return crypto.randomBytes(SALT_LENGTH);
}

/**
 * Genera un hash seguro del master password usando PBKDF2
 * @param masterPassword - Contraseña maestra del usuario
 * @returns Hash y salt codificados en base64
 */
export function hashMasterPassword(masterPassword: string): MasterPasswordHash {
  const salt = generateSalt();
  
  const hash = crypto.pbkdf2Sync(
    masterPassword,
    salt,
    PBKDF2_ITERATIONS,
    KEY_LENGTH,
    'sha256'
  );

  return {
    hash: hash.toString('base64'),
    salt: salt.toString('base64'),
  };
}

/**
 * Verifica si un master password es correcto
 * @param masterPassword - Contraseña maestra ingresada por el usuario
 * @param storedHash - Hash almacenado en la base de datos
 * @param salt - Salt almacenado en la base de datos
 * @returns true si el password es correcto
 */
export function verifyMasterPassword(masterPassword: string, storedHash: string, salt: string): boolean {
  const saltBuffer = Buffer.from(salt, 'base64');
  
  const hash = crypto.pbkdf2Sync(
    masterPassword,
    saltBuffer,
    PBKDF2_ITERATIONS,
    KEY_LENGTH,
    'sha256'
  );

  const computedHash = hash.toString('base64');
  
  // Comparar usando timingSafeEqual para evitar timing attacks
  try {
    return crypto.timingSafeEqual(
      Buffer.from(computedHash),
      Buffer.from(storedHash)
    );
  } catch {
    return false;
  }
}

/**
 * Deriva una clave de encriptación a partir del master password
 * @param masterPassword - Contraseña maestra del usuario
 * @param userId - ID del usuario (como salt adicional)
 * @returns Clave derivada
 */
export function deriveMasterPasswordKey(masterPassword: string, userId: string): Buffer {
  // Combina el master password con el userId para mayor seguridad
  const key = crypto.pbkdf2Sync(
    masterPassword,
    userId,
    PBKDF2_ITERATIONS,
    32, // 256 bits
    'sha256'
  );

  return key;
}
