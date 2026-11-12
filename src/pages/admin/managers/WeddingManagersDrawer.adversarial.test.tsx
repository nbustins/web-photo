import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { App } from 'antd';
import { MemoryRouter } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { WeddingManagersDrawer } from './WeddingManagersDrawer';
import { validateManagerPassword } from './passwordPolicy';

const mocks = vi.hoisted(() => ({
  fetchWeddingManagers: vi.fn(),
  createWeddingManager: vi.fn(),
  updateWeddingManagerEmail: vi.fn(),
  resetWeddingManagerPassword: vi.fn(),
  deleteWeddingManager: vi.fn(),
}));
vi.mock('../../../services/wedding/api/wedding-managers.api', () => mocks);

const WEDDING = { id: 1, slug: 'anna-joan', title: 'Anna & Joan' };
const MANAGER = { id: 1, email: 'gestor.anna@example.com', weddingId: 1, createdAt: '2026-01-12T09:00:00.000Z' };
const PASSWORD = 'Aa1!probe-abcdef';

const ui = () => (
  <MemoryRouter><App><WeddingManagersDrawer open wedding={WEDDING} onClose={() => {}} /></App></MemoryRouter>
);

const openCreate = async (user: ReturnType<typeof userEvent.setup>, email = 'nou@example.com') => {
  await screen.findByText('Aquesta boda encara no té cap gestor.');
  await user.type(screen.getByLabelText('Correu electrònic'), email);
  await user.type(screen.getByLabelText('Contrasenya'), PASSWORD);
  await user.type(screen.getByLabelText('Repeteix la contrasenya'), PASSWORD);
  await user.click(screen.getByRole('button', { name: 'Crear gestor' }));
};

describe('WeddingManagersDrawer — adversarial', () => {
  beforeEach(() => {
    Object.values(mocks).forEach(mock => mock.mockReset());
    mocks.fetchWeddingManagers.mockResolvedValue([]);
  });

  it('removes the password from the DOM when the panel and the drawer close', async () => {
    const user = userEvent.setup();
    mocks.createWeddingManager.mockResolvedValue({ ...MANAGER, email: 'nou@example.com' });
    render(ui());
    await openCreate(user);
    await screen.findByText('Credencials del gestor');
    expect(document.body.innerHTML).toContain(PASSWORD);

    await user.click(screen.getByRole('button', { name: 'Fet' }));
    await waitFor(() => expect(document.body.innerHTML).not.toContain(PASSWORD));

    await openCreate(user, 'segon@example.com');
    await screen.findByText('Credencials del gestor');
    await user.click(document.querySelector('.ant-drawer-close') as HTMLButtonElement);
    await waitFor(() => expect(document.body.innerHTML).not.toContain(PASSWORD));
  });

  it('resets the password without reloading the list and shows it once', async () => {
    const user = userEvent.setup();
    mocks.fetchWeddingManagers.mockResolvedValue([MANAGER]);
    mocks.resetWeddingManagerPassword.mockResolvedValue(undefined);
    render(ui());
    await screen.findByText(MANAGER.email);
    await user.click(screen.getByRole('button', { name: `Restablir la contrasenya de ${MANAGER.email}` }));
    const dialog = await screen.findByRole('dialog', { name: /Restablir contrasenya/ });
    await user.type(within(dialog).getByLabelText('Contrasenya nova'), PASSWORD);
    await user.type(within(dialog).getByLabelText('Repeteix la contrasenya'), PASSWORD);
    await user.click(within(dialog).getByRole('button', { name: 'Restablir contrasenya' }));
    await screen.findByText('Credencials del gestor');
    expect(mocks.resetWeddingManagerPassword).toHaveBeenCalledWith(1, 1, PASSWORD);
    expect(mocks.fetchWeddingManagers).toHaveBeenCalledTimes(1);
  });

  it('deleting the last manager reloads to the empty state', async () => {
    const user = userEvent.setup();
    mocks.fetchWeddingManagers.mockResolvedValueOnce([MANAGER]).mockResolvedValue([]);
    mocks.deleteWeddingManager.mockResolvedValue(undefined);
    render(ui());
    await screen.findByText(MANAGER.email);
    await user.click(screen.getByRole('button', { name: `Eliminar el gestor ${MANAGER.email}` }));
    await user.click(await screen.findByRole('button', { name: 'Eliminar' }));
    expect(await screen.findByText('Aquesta boda encara no té cap gestor.')).toBeInTheDocument();
    expect(mocks.fetchWeddingManagers).toHaveBeenCalledTimes(2);
  });

  it('Generar fills both password fields with a valid value without calling the server', async () => {
    const user = userEvent.setup();
    render(ui());
    await screen.findByText('Aquesta boda encara no té cap gestor.');
    await user.click(screen.getByRole('button', { name: /Generar/ }));
    const password = (screen.getByLabelText('Contrasenya') as HTMLInputElement).value;
    expect(password).toHaveLength(16);
    expect((screen.getByLabelText('Repeteix la contrasenya') as HTMLInputElement).value).toBe(password);
    expect(validateManagerPassword(password)).toBeNull();
    expect(mocks.createWeddingManager).not.toHaveBeenCalled();
  });
});
