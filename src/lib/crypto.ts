import crypto from 'crypto';

const ALGORITHM = 'aes-256-gcm';
const IV_LENGTH = 16;
const AUTH_TAG_LENGTH = 16;
const PBKDF2_ITERATIONS = 100000; // Número de iteraciones para derivar la clave
const KEY_LENGTH = 32; // 256 bits

/**
 * Obtiene la clave maestra del entorno
 */
function getMasterKey(): Buffer {
    const key = process.env.ENCRYPTION_KEY;
    if (!key) {
        throw new Error('ENCRYPTION_KEY environment variable is not set');
    }

    // Key should be 64 hex characters (32 bytes)
    if (key.length !== 64) {
        throw new Error('ENCRYPTION_KEY must be 64 hex characters (32 bytes)');
    }

    return Buffer.from(key, 'hex');
}

/**
 * Deriva una clave de cifrado única para cada usuario usando PBKDF2
 * Combina la clave maestra con el ID único del usuario de Google
 */
function deriveUserKey(userId: string): Buffer {
    const masterKey = getMasterKey();
    
    // Usar el userId como salt para derivar una clave única
    // PBKDF2 deriva una clave segura combinando la clave maestra con el userId
    const derivedKey = crypto.pbkdf2Sync(
        masterKey,
        userId, // Salt único por usuario
        PBKDF2_ITERATIONS,
        KEY_LENGTH,
        'sha256'
    );

    return derivedKey;
}

export interface EncryptedData {
    encrypted: string;
    iv: string;
    authTag: string;
}

/**
 * Cifra un texto plano usando una clave derivada única para el usuario
 * @param plaintext - Texto a cifrar
 * @param userId - ID único del usuario (típicamente el ID de la cuenta de Google)
 */
export function encrypt(plaintext: string, userId: string): EncryptedData {
    const key = deriveUserKey(userId);
    const iv = crypto.randomBytes(IV_LENGTH);

    const cipher = crypto.createCipheriv(ALGORITHM, key, iv);

    let encrypted = cipher.update(plaintext, 'utf8', 'base64');
    encrypted += cipher.final('base64');

    const authTag = cipher.getAuthTag();

    return {
        encrypted,
        iv: iv.toString('base64'),
        authTag: authTag.toString('base64'),
    };
}

/**
 * Descifra un texto cifrado usando la clave derivada única del usuario
 * @param encrypted - Texto cifrado en base64
 * @param iv - Vector de inicialización en base64
 * @param authTag - Tag de autenticación en base64
 * @param userId - ID único del usuario (típicamente el ID de la cuenta de Google)
 */
export function decrypt(encrypted: string, iv: string, authTag: string, userId: string): string {
    const key = deriveUserKey(userId);
    const ivBuffer = Buffer.from(iv, 'base64');
    const authTagBuffer = Buffer.from(authTag, 'base64');

    const decipher = crypto.createDecipheriv(ALGORITHM, key, ivBuffer);
    decipher.setAuthTag(authTagBuffer);

    let decrypted = decipher.update(encrypted, 'base64', 'utf8');
    decrypted += decipher.final('utf8');

    return decrypted;
}
