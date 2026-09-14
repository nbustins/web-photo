import { FC } from 'react';
import { Descriptions, Drawer, List, Space, Tag, Typography } from 'antd';
import type { InvitationSummary } from '../WeddingManager.types';
import { StatusPill } from './ManagerShared';
import shared from './ManagerShared.module.css';

const { Title, Text } = Typography;

interface ManagerInvitationDrawerProps {
  summary: InvitationSummary | null;
  onClose: () => void;
}

export const ManagerInvitationDrawer: FC<ManagerInvitationDrawerProps> = ({ summary, onClose }) => (
  <Drawer title={summary?.label} open={!!summary} onClose={onClose} width={360}>
    {summary && (
      <Space direction="vertical" style={{ width: '100%' }} size="middle">
        <Descriptions column={1} size="small" bordered>
          <Descriptions.Item label="Codi">
            <Text copyable code>{summary.inviteCode}</Text>
          </Descriptions.Item>
          <Descriptions.Item label="Màx. afegits">{summary.maxAddedGuests}</Descriptions.Item>
          {summary.notes && (
            <Descriptions.Item label="Notes">{summary.notes}</Descriptions.Item>
          )}
        </Descriptions>

        <Title level={5} style={{ margin: 0 }}>Convidats</Title>
        <List
          size="small"
          dataSource={summary.guests}
          renderItem={guest => (
            <List.Item extra={<StatusPill attending={guest.attending} />}>
              <Space size={6}>
                <span className={shared.guestName}>{guest.name}</span>
                {!guest.isPredefined && <Tag className={shared.addedTag}>Afegit</Tag>}
              </Space>
            </List.Item>
          )}
        />
      </Space>
    )}
  </Drawer>
);
