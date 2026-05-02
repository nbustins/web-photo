import { FC } from 'react';
import { Modal, Typography } from 'antd';

const { Text } = Typography;

interface ManagerNotesModalProps {
  note: string | null;
  onClose: () => void;
}

export const ManagerNotesModal: FC<ManagerNotesModalProps> = ({ note, onClose }) => (
  <Modal open={!!note} onCancel={onClose} footer={null} title="Notes" width={480}>
    <Text style={{ whiteSpace: 'pre-wrap' }}>{note}</Text>
  </Modal>
);
