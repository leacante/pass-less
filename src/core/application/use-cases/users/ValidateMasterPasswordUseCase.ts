import { verifyMasterPassword } from '@/lib/masterPassword';

export interface ValidateMasterPasswordRequest {
  userId: string;
  masterPassword: string;
}

export interface ValidateMasterPasswordResponse {
  isValid: boolean;
  message: string;
}

export class ValidateMasterPasswordUseCase {
  constructor(private userRepository: any) {}

  async execute(request: ValidateMasterPasswordRequest): Promise<ValidateMasterPasswordResponse> {
    try {
      // Obtener el usuario con sus datos de master password
      const user = await this.userRepository.findById(request.userId);

      if (!user) {
        return {
          isValid: false,
          message: 'Usuario no encontrado',
        };
      }

      // Si el usuario no tiene master password configurado
      if (!user.masterPasswordHash || !user.masterPasswordSalt) {
        return {
          isValid: false,
          message: 'El usuario no tiene un master password configurado',
        };
      }

      // Verificar el master password
      const isValid = verifyMasterPassword(
        request.masterPassword,
        user.masterPasswordHash,
        user.masterPasswordSalt
      );

      if (!isValid) {
        return {
          isValid: false,
          message: 'Master password incorrecto',
        };
      }

      return {
        isValid: true,
        message: 'Master password válido',
      };
    } catch (error) {
      return {
        isValid: false,
        message: 'Error al validar el master password',
      };
    }
  }
}
