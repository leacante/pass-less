'use client';

import { useMemo, useState } from 'react';
import {
  createPasswordAction,
  updatePasswordAction,
  deletePasswordAction,
  decryptPasswordAction,
  createTagAction,
  createWorkspaceAction,
  deleteWorkspaceAction,
} from '@/app/dashboard/actions';
import { PasswordDTO } from '@/core/application/dto/PasswordDTO';
import { Tag, Workspace } from '@/core/domain/models/password';

export interface PasswordControllerState {
  passwords: PasswordDTO[];
  tags: Tag[];
  workspaces: Workspace[];
}

export function usePasswordController(initialState: PasswordControllerState) {
  const [passwords, setPasswords] = useState<PasswordDTO[]>(initialState.passwords);
  const [tags, setTags] = useState<Tag[]>(initialState.tags);
  const [workspaces, setWorkspaces] = useState<Workspace[]>(initialState.workspaces);
  const [isPending, setIsPending] = useState(false);

  const run = async <T,>(operation: () => Promise<T>): Promise<T> => {
    try {
      setIsPending(true);
      return await operation();
    } finally {
      setIsPending(false);
    }
  };

  const handlers = useMemo(() => ({
    createPassword: (input: Omit<Parameters<typeof createPasswordAction>[0], 'userId'>) =>
      run(async () => {
        const created = await createPasswordAction(input);
        setPasswords((prev) => [created, ...prev]);
      }),
    updatePassword: (id: string, data: Omit<Parameters<typeof updatePasswordAction>[0], 'id'>) =>
      run(async () => {
        const updated = await updatePasswordAction({ id, ...data });
        setPasswords((prev) => prev.map((item) => (item.id === updated.id ? updated : item)));
      }),
    deletePassword: (id: string) =>
      run(async () => {
        await deletePasswordAction(id);
        setPasswords((prev) => prev.filter((item) => item.id !== id));
      }),
    decryptPassword: (id: string) => decryptPasswordAction(id),
    createTag: (name: string) =>
      run(async () => {
        const created = await createTagAction({ name });
        setTags((prev) => [...prev, created].sort((a, b) => a.name.localeCompare(b.name)));
        return created;
      }),
    createWorkspace: (name: string) =>
      run(async () => {
        const created = await createWorkspaceAction({ name });
        setWorkspaces((prev) => [...prev, created].sort((a, b) => a.name.localeCompare(b.name)));
        return created;
      }),
    deleteWorkspace: (id: string) =>
      run(async () => {
        await deleteWorkspaceAction(id);
        setWorkspaces((prev) => prev.filter((item) => item.id !== id));
        setPasswords((prev) => prev.map((item) => (item.workspaceId === id ? { ...item, workspaceId: null, workspace: null } : item)));
      }),
  }), []);

  return {
    passwords,
    tags,
    workspaces,
    isPending,
    ...handlers,
  };
}
