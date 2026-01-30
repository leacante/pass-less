export interface IUserRepository {
  findById(id: string): Promise<any>;
  findByEmail(email: string): Promise<any>;
  updateMasterPassword(userId: string, hash: string, salt: string): Promise<any>;
  create(user: any): Promise<any>;
  update(id: string, user: any): Promise<any>;
}
