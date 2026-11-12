import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { App } from 'antd';
import { MemoryRouter } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { WeddingManagersDrawer } from './WeddingManagersDrawer';

const mocks = vi.hoisted(() => ({
  fetchWeddingManagers: vi.fn(),
  createWeddingManager: vi.fn(),
  updateWeddingManagerEmail: vi.fn(),
  resetWeddingManagerPassword: vi.fn(),
  deleteWeddingManager: vi.fn(),
}));

vi.mock('../../../services/wedding/api/wedding-managers.api', () => mocks);

const WEDDING = { id: 1, slug: 'anna-joan', title: 'Anna & Joan' };

const deferred = <T,>() => {
  let resolve!: (value: T) => void;
  const promise = new Promise<T>(settle => { resolve = settle; });
  return { promise, resolve };
};

const MANAGER = {
  id: 1,
  email: 'gestor.anna@example.com',
  weddingId: 1,
  createdAt: '2026-01-12T09:00:00.000Z',
};

const renderDrawer = (wedding: typeof WEDDING = WEDDING) =>
  render(
    <MemoryRouter>
      <App>
        <WeddingManagersDrawer open wedding={wedding} onClose={() => {}} />
      </App>
    </MemoryRouter>,
  );

describe('WeddingManagersDrawer', () => {
  beforeEach(() => {
    Object.values(mocks).forEach(mock => mock.mockReset());
    mocks.fetchWeddingManagers.mockResolvedValue([]);
  });

  it('lists the managers of the wedding', async () => {
    mocks.fetchWeddingManagers.mockResolvedValue([
      MANAGER,
      { ...MANAGER, id: 2, email: 'segon@example.com', createdAt: '2026-02-03T17:30:00.000Z' },
    ]);

    renderDrawer();

    expect(await screen.findByText('gestor.anna@example.com')).toBeInTheDocument();
    expect(screen.getByText('segon@example.com')).toBeInTheDocument();
    expect(screen.getByText('12/01/2026')).toBeInTheDocument();
    expect(screen.getByText('03/02/2026')).toBeInTheDocument();
    expect(mocks.fetchWeddingManagers).toHaveBeenCalledWith(1);
  });

  it('shows the empty state when the wedding has no managers', async () => {
    renderDrawer();

    expect(await screen.findByText('Aquesta boda encara no té cap gestor.')).toBeInTheDocument();
  });

  it('creates a manager and shows the credentials to hand over', async () => {
    const user = userEvent.setup();
    mocks.createWeddingManager.mockResolvedValue({ ...MANAGER, id: 3, email: 'nou@example.com' });

    renderDrawer();
    await screen.findByText('Aquesta boda encara no té cap gestor.');

    await user.type(screen.getByLabelText('Correu electrònic'), ' nou@example.com ');
    await user.type(screen.getByLabelText('Contrasenya'), 'Aa1!abcdefgh');
    await user.type(screen.getByLabelText('Repeteix la contrasenya'), 'Aa1!abcdefgh');
    await user.click(screen.getByRole('button', { name: 'Crear gestor' }));

    expect(await screen.findByText('Credencials del gestor')).toBeInTheDocument();
    expect(mocks.createWeddingManager).toHaveBeenCalledWith(1, {
      email: 'nou@example.com',
      password: 'Aa1!abcdefgh',
    });
    expect(screen.getByText('Aa1!abcdefgh')).toBeInTheDocument();
    expect(screen.getByText(`${window.location.origin}/weddings/anna-joan/manager`)).toBeInTheDocument();
  });

  it('blocks a password that breaks the policy', async () => {
    const user = userEvent.setup();

    renderDrawer();
    await screen.findByText('Aquesta boda encara no té cap gestor.');

    await user.type(screen.getByLabelText('Correu electrònic'), 'nou@example.com');
    await user.type(screen.getByLabelText('Contrasenya'), 'Aa1!short');
    await user.type(screen.getByLabelText('Repeteix la contrasenya'), 'Aa1!short');
    await user.click(screen.getByRole('button', { name: 'Crear gestor' }));

    expect(
      await screen.findByText('La contrasenya ha de tenir com a mínim 12 caràcters.'),
    ).toBeInTheDocument();
    expect(mocks.createWeddingManager).not.toHaveBeenCalled();
  });

  it('requires the confirmation field', async () => {
    const user = userEvent.setup();

    renderDrawer();
    await screen.findByText('Aquesta boda encara no té cap gestor.');

    await user.type(screen.getByLabelText('Correu electrònic'), 'nou@example.com');
    await user.type(screen.getByLabelText('Contrasenya'), 'Aa1!abcdefgh');
    await user.click(screen.getByRole('button', { name: 'Crear gestor' }));

    expect(await screen.findByText('Camp obligatori')).toBeInTheDocument();
    expect(mocks.createWeddingManager).not.toHaveBeenCalled();
  });

  it('never shows the previous wedding rows while the new list loads', async () => {
    mocks.fetchWeddingManagers.mockResolvedValueOnce([MANAGER]);
    const pending = deferred<never[]>();
    mocks.fetchWeddingManagers.mockReturnValueOnce(pending.promise);

    const { rerender } = renderDrawer();
    await screen.findByText(MANAGER.email);

    rerender(
      <MemoryRouter>
        <App>
          <WeddingManagersDrawer
            open
            wedding={{ id: 2, slug: 'marta-joan', title: 'Marta & Joan' }}
            onClose={() => {}}
          />
        </App>
      </MemoryRouter>,
    );

    expect(await screen.findByText('Gestors · Marta & Joan')).toBeInTheDocument();
    expect(screen.queryByText(MANAGER.email)).not.toBeInTheDocument();
  });

  it('asks for confirmation before deleting a manager', async () => {    const user = userEvent.setup();
    mocks.fetchWeddingManagers.mockResolvedValue([MANAGER]);
    mocks.deleteWeddingManager.mockResolvedValue(undefined);

    renderDrawer();
    await screen.findByText('gestor.anna@example.com');

    await user.click(screen.getByRole('button', { name: `Eliminar el gestor ${MANAGER.email}` }));
    expect(mocks.deleteWeddingManager).not.toHaveBeenCalled();

    await user.click(await screen.findByRole('button', { name: 'Eliminar' }));
    await waitFor(() => expect(mocks.deleteWeddingManager).toHaveBeenCalledWith(1, 1));
  });

  it('resets the password and shows the new value once', async () => {
    const user = userEvent.setup();
    mocks.fetchWeddingManagers.mockResolvedValue([MANAGER]);
    mocks.resetWeddingManagerPassword.mockResolvedValue(undefined);

    renderDrawer();
    await screen.findByText('gestor.anna@example.com');

    await user.click(
      screen.getByRole('button', { name: `Restablir la contrasenya de ${MANAGER.email}` }),
    );
    const dialog = await screen.findByRole('dialog', { name: /Restablir contrasenya/ });

    await user.type(within(dialog).getByLabelText('Contrasenya nova'), 'Aa1!abcdefgh');
    await user.type(within(dialog).getByLabelText('Repeteix la contrasenya'), 'Aa1!abcdefgh');
    await user.click(within(dialog).getByRole('button', { name: 'Restablir contrasenya' }));

    expect(await screen.findByText('Credencials del gestor')).toBeInTheDocument();
    expect(mocks.resetWeddingManagerPassword).toHaveBeenCalledWith(1, 1, 'Aa1!abcdefgh');
    expect(screen.getByText('Aa1!abcdefgh')).toBeInTheDocument();
  });

  it('saves a new email through the edit dialog', async () => {
    const user = userEvent.setup();
    mocks.fetchWeddingManagers.mockResolvedValue([MANAGER]);
    mocks.updateWeddingManagerEmail.mockResolvedValue({ ...MANAGER, email: 'nou@example.com' });

    renderDrawer();
    await screen.findByText('gestor.anna@example.com');

    await user.click(screen.getByRole('button', { name: `Editar el correu de ${MANAGER.email}` }));
    const dialog = await screen.findByRole('dialog', { name: 'Editar correu' });
    const field = within(dialog).getByLabelText('Correu electrònic');

    await user.clear(field);
    await user.type(field, 'nou@example.com');
    await user.click(within(dialog).getByRole('button', { name: 'Desar' }));

    await waitFor(() =>
      expect(mocks.updateWeddingManagerEmail).toHaveBeenCalledWith(1, 1, 'nou@example.com'),
    );
  });
});
