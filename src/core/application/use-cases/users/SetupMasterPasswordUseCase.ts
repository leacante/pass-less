import { hashMasterPassword } from '@/lib/masterPassword';

export interface SetupMasterPasswordRequest {
  userId: string;
  masterPassword: string;
}

export interface SetupMasterPasswordResponse {
  success: boolean;
  message: string;
}

export class SetupMasterPasswordUseCase {
  constructor(private userRepository: any) {}

  async execute(request: SetupMasterPasswordRequest): Promise<SetupMasterPasswordResponse> {
    // Validar que el master password no esté vacío y tenga una longitud mínima
    if (!request.masterPassword || request.masterPassword.length < 8) {
      return {
        success: false,
        message: 'El master password debe tener al menos 8 caracteres',
      };
    }

    try {
      // Generar hash y salt del master password
      const { hash, salt } = hashMasterPassword(request.masterPassword);

      // Actualizar el usuario con el hash y salt
      await this.userRepository.updateMasterPassword(request.userId, hash, salt);

      return {
        success: true,
        message: 'Master password configurado correctamente',
      };
    } catch (error) {
      return {
        success: false,
        message: 'Error al configurar el master password',
      };
    }
  }
}
