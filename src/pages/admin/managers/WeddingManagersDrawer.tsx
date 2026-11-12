import { FC, useEffect, useRef, useState } from 'react';
import {
  Alert, App, Button, Drawer, Form, Input, Modal, Popconfirm, Space, Table, Typography,
} from 'antd';
import type { FormInstance, TableColumnsType } from 'antd';
import { Icons, IconButton } from '@ui/icons';
import { useIsMobile } from '@ui/hooks/useIsMobile';
import { weddingManagerPath } from '../../../model/routes.model';
import { useApiError } from '../useApiError';
import {
  createWeddingManager,
  deleteWeddingManager,
  fetchWeddingManagers,
  resetWeddingManagerPassword,
  updateWeddingManagerEmail,
} from '../../../services/wedding/api/wedding-managers.api';
import type { WeddingManager } from '../../../services/wedding/api/wedding-managers.api';
import { validateManagerPassword } from './passwordPolicy';
import { generateManagerPassword } from './generatePassword';
import styles from './WeddingManagersDrawer.module.css';

const { Title, Text } = Typography;

export interface WeddingManagersTarget {
  id: number;
  slug: string;
  title: string;
}

export interface WeddingManagersDrawerProps {
  open: boolean;
  wedding: WeddingManagersTarget | null;
  onClose: () => void;
}

interface Credentials {
  email: string;
  password: string;
}

interface CreateManagerFormValues {
  email: string;
  password: string;
  confirm: string;
}

const formatDate = (date: string) =>
  new Date(date).toLocaleDateString('ca-ES', { day: '2-digit', month: '2-digit', year: 'numeric' });

/**
 * Mirrors the API policy on the password field. The API stays authoritative: a value that
 * slips through is rejected server-side and shown through `errorMessage`.
 */
const passwordRule = {
  validator: (_: unknown, value: string | undefined) => {
    const message = validateManagerPassword(value ?? '');
    return message ? Promise.reject(new Error(message)) : Promise.resolve();
  },
};

const confirmRule = (form: FormInstance) => ({
  validator: (_: unknown, value: string | undefined) => {
    if (!value || form.getFieldValue('password') === value) return Promise.resolve();
    return Promise.reject(new Error('Les contrasenyes no coincideixen.'));
  },
});

/** One read-only row with its own copy action: the password is never refetchable. */
const CredentialRow: FC<{ label: string; value: string; onCopy: () => void }> = ({ label, value, onCopy }) => (
  <div className={styles.credentialRow}>
    <div className={styles.credentialText}>
      <span className={styles.credentialLabel}>{label}</span>
      <span className={styles.credentialValue}>{value}</span>
    </div>
    <Button size="small" icon={<Icons.copy />} onClick={onCopy}>Copiar</Button>
  </div>
);

export const WeddingManagersDrawer: FC<WeddingManagersDrawerProps> = ({ open, wedding, onClose }) => {
  const onError = useApiError();
  const { message } = App.useApp();
  const isMobile = useIsMobile();
  const [createForm] = Form.useForm<CreateManagerFormValues>();
  const [emailForm] = Form.useForm<{ email: string }>();
  const [resetForm] = Form.useForm<{ password: string; confirm: string }>();

  const [managers, setManagers] = useState<WeddingManager[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadFailed, setLoadFailed] = useState(false);
  const [creating, setCreating] = useState(false);
  const [credentials, setCredentials] = useState<Credentials | null>(null);
  const [editing, setEditing] = useState<WeddingManager | null>(null);
  const [savingEmail, setSavingEmail] = useState(false);
  const [resetting, setResetting] = useState<WeddingManager | null>(null);
  const [savingPassword, setSavingPassword] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const weddingId = wedding?.id;
  /**
   * The latest wedding the drawer was opened for. A slow GET for wedding A must never land
   * rows under the title of wedding B.
   */
  const requestedWeddingId = useRef<number | undefined>(weddingId);

  const loadManagers = async (id: number) => {
    setManagers([]);
    setLoading(true);
    setLoadFailed(false);
    try {
      const list = await fetchWeddingManagers(id);
      if (requestedWeddingId.current === id) setManagers(list);
    } catch (err) {
      if (requestedWeddingId.current !== id) return;
      setLoadFailed(true);
      onError(err, "No s'han pogut carregar els gestors.");
    } finally {
      if (requestedWeddingId.current === id) setLoading(false);
    }
  };

  useEffect(() => {
    requestedWeddingId.current = open ? weddingId : undefined;
    if (!open || !weddingId) {
      setManagers([]);
      return;
    }
    // A new wedding (or a reopened drawer) never inherits the previous session's password.
    setCredentials(null);
    setEditing(null);
    setResetting(null);
    createForm.resetFields();
    loadManagers(weddingId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, weddingId]);

  const copy = async (value: string, success: string) => {
    try {
      await navigator.clipboard.writeText(value);
      message.success(success);
    } catch {
      message.error("No s'ha pogut copiar");
    }
  };

  const generateInto = (form: FormInstance) => (field: string) => {
    const password = generateManagerPassword();
    form.setFieldsValue({ [field]: password, confirm: password });
  };

  const submitCreate = async ({ email, password }: CreateManagerFormValues) => {
    if (!wedding) return;
    setCreating(true);
    try {
      const created = await createWeddingManager(wedding.id, { email: email.trim(), password });
      createForm.resetFields();
      setCredentials({ email: created.email ?? email.trim(), password });
      message.success('Gestor creat');
      await loadManagers(wedding.id);
    } catch (err) {
      onError(err, "No s'ha pogut crear el gestor. Torna-ho a provar.");
    } finally {
      setCreating(false);
    }
  };

  const submitEmail = async ({ email }: { email: string }) => {
    if (!wedding || !editing) return;
    setSavingEmail(true);
    try {
      await updateWeddingManagerEmail(wedding.id, editing.id, email.trim());
      setEditing(null);
      emailForm.resetFields();
      message.success('Correu actualitzat');
      await loadManagers(wedding.id);
    } catch (err) {
      onError(err, "No s'ha pogut desar el correu. Torna-ho a provar.");
    } finally {
      setSavingEmail(false);
    }
  };

  const submitReset = async ({ password }: { password: string }) => {
    if (!wedding || !resetting) return;
    setSavingPassword(true);
    try {
      await resetWeddingManagerPassword(wedding.id, resetting.id, password);
      setCredentials({ email: resetting.email ?? '', password });
      setResetting(null);
      resetForm.resetFields();
      message.success('Contrasenya restablerta');
    } catch (err) {
      onError(err, "No s'ha pogut restablir la contrasenya. Torna-ho a provar.");
    } finally {
      setSavingPassword(false);
    }
  };

  const remove = async (manager: WeddingManager) => {
    if (!wedding) return;
    setDeletingId(manager.id);
    try {
      await deleteWeddingManager(wedding.id, manager.id);
      message.success('Gestor eliminat');
      await loadManagers(wedding.id);
    } catch (err) {
      onError(err, "No s'ha pogut eliminar el gestor. Torna-ho a provar.");
    } finally {
      setDeletingId(null);
    }
  };

  const openEmail = (manager: WeddingManager) => {
    setEditing(manager);
    emailForm.setFieldsValue({ email: manager.email ?? '' });
  };

  const openReset = (manager: WeddingManager) => {
    setResetting(manager);
    resetForm.resetFields();
  };

  const close = () => {
    requestedWeddingId.current = undefined;
    setCredentials(null);
    setEditing(null);
    setResetting(null);
    setManagers([]);
    createForm.resetFields();
    resetForm.resetFields();
    onClose();
  };

  const columns: TableColumnsType<WeddingManager> = [
    {
      title: 'Correu',
      dataIndex: 'email',
      render: (email: string | null) => email ?? '—',
    },
    {
      title: 'Creat',
      dataIndex: 'createdAt',
      width: 120,
      render: (createdAt: string) => formatDate(createdAt),
    },
    {
      title: 'Accions',
      key: 'actions',
      width: 160,
      render: (_, manager) => (
        <Space size={4}>
          <IconButton
            icon="edit"
            label={`Editar el correu de ${manager.email ?? 'aquest gestor'}`}
            onClick={() => openEmail(manager)}
          />
          <IconButton
            icon="refresh"
            label={`Restablir la contrasenya de ${manager.email ?? 'aquest gestor'}`}
            onClick={() => openReset(manager)}
          />
          <Popconfirm
            title={`Eliminar el gestor ${manager.email ?? ''}?`}
            description="Aquesta acció no es pot desfer."
            okText="Eliminar"
            cancelText="Cancel·la"
            okButtonProps={{ danger: true }}
            onConfirm={() => remove(manager)}
          >
            <Button
              danger
              icon={<Icons.remove />}
              aria-label={`Eliminar el gestor ${manager.email ?? ''}`}
              loading={deletingId === manager.id}
            />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  const accessUrl = wedding ? `${window.location.origin}${weddingManagerPath(wedding.slug)}` : '';

  return (
    <Drawer
      width={isMobile ? '100%' : 720}
      open={open}
      onClose={close}
      title={wedding ? `Gestors · ${wedding.title}` : 'Gestors'}
    >
      {loadFailed ? (
        <Alert
          type="warning"
          showIcon
          message="No s'han pogut carregar els gestors."
          action={
            <Button size="small" onClick={() => weddingId && loadManagers(weddingId)}>
              Torna-ho a provar
            </Button>
          }
        />
      ) : (
        <Table
          rowKey="id"
          size="small"
          loading={loading}
          columns={columns}
          dataSource={managers}
          pagination={false}
          locale={{ emptyText: 'Aquesta boda encara no té cap gestor.' }}
        />
      )}

      {credentials ? (
        <section className={styles.section}>
          <Title level={5} className={styles.sectionTitle}>Credencials del gestor</Title>
          <Alert
            type="warning"
            showIcon
            message="Aquesta contrasenya no es tornarà a mostrar. Copia-la ara i comparteix-la amb el gestor."
          />
          <CredentialRow
            label="Correu electrònic"
            value={credentials.email}
            onCopy={() => copy(credentials.email, 'Correu copiat')}
          />
          <CredentialRow
            label="Contrasenya"
            value={credentials.password}
            onCopy={() => copy(credentials.password, 'Contrasenya copiada')}
          />
          {wedding && (
            <CredentialRow
              label="Accés"
              value={accessUrl}
              onCopy={() => copy(accessUrl, "Enllaç d'accés copiat")}
            />
          )}
          <Button type="primary" block onClick={() => setCredentials(null)}>Fet</Button>
        </section>
      ) : (
        <section className={styles.section}>
          <Title level={5} className={styles.sectionTitle}>Nou gestor</Title>
          <Form
            form={createForm}
            name="weddingManagerCreate"
            layout="vertical"
            onFinish={submitCreate}
            disabled={creating}
          >
            <Form.Item
              name="email"
              label="Correu electrònic"
              normalize={(value: string) => value.trim()}
              rules={[
                { required: true, message: 'Camp obligatori' },
                { type: 'email', message: 'Introdueix un correu vàlid.' },
              ]}
            >
              <Input autoComplete="off" placeholder="gestor@example.com" />
            </Form.Item>
            <Form.Item name="password" label="Contrasenya" rules={[passwordRule]}>
              <Input.Password autoComplete="new-password" />
            </Form.Item>
            <Form.Item
              name="confirm"
              label="Repeteix la contrasenya"
              dependencies={['password']}
              rules={[{ required: true, message: 'Camp obligatori' }, confirmRule(createForm)]}
            >
              <Input.Password autoComplete="new-password" />
            </Form.Item>
            <Space className={styles.formActions}>
              <Button icon={<Icons.refresh />} onClick={() => generateInto(createForm)('password')}>
                Generar
              </Button>
              <Button type="primary" htmlType="submit" loading={creating}>Crear gestor</Button>
            </Space>
            <Text type="secondary" className={styles.hint}>
              Mínim 12 caràcters, amb majúscula, minúscula, número i caràcter especial.
            </Text>
          </Form>
        </section>
      )}

      <Modal
        open={!!editing}
        title="Editar correu"
        okText="Desar"
        cancelText="Cancel·la"
        confirmLoading={savingEmail}
        onOk={() => emailForm.submit()}
        onCancel={() => {
          setEditing(null);
          emailForm.resetFields();
        }}
      >
        <Form
          form={emailForm}
          name="weddingManagerEmail"
          layout="vertical"
          onFinish={submitEmail}
          disabled={savingEmail}
        >
          <Form.Item
            name="email"
            label="Correu electrònic"
            normalize={(value: string) => value.trim()}
            rules={[
              { required: true, message: 'Camp obligatori' },
              { type: 'email', message: 'Introdueix un correu vàlid.' },
            ]}
          >
            <Input autoComplete="off" />
          </Form.Item>
        </Form>
      </Modal>

      <Modal
        open={!!resetting}
        title={resetting ? `Restablir contrasenya · ${resetting.email ?? ''}` : 'Restablir contrasenya'}
        okText="Restablir contrasenya"
        cancelText="Cancel·la"
        confirmLoading={savingPassword}
        onOk={() => resetForm.submit()}
        onCancel={() => {
          setResetting(null);
          resetForm.resetFields();
        }}
      >
        <Form
          form={resetForm}
          name="weddingManagerReset"
          layout="vertical"
          onFinish={submitReset}
          disabled={savingPassword}
        >
          <Form.Item name="password" label="Contrasenya nova" rules={[passwordRule]}>
            <Input.Password autoComplete="new-password" />
          </Form.Item>
          <Form.Item
            name="confirm"
            label="Repeteix la contrasenya"
            dependencies={['password']}
            rules={[{ required: true, message: 'Camp obligatori' }, confirmRule(resetForm)]}
          >
            <Input.Password autoComplete="new-password" />
          </Form.Item>
          <Button icon={<Icons.refresh />} onClick={() => generateInto(resetForm)('password')}>
            Generar
          </Button>
        </Form>
      </Modal>
    </Drawer>
  );
};
