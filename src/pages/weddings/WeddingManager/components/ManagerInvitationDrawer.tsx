import { FC } from 'react';
import { Descriptions, Drawer, List, Space, Tag, Typography } from 'antd';
import type { InvitationSummary } from '../WeddingManager.types';
import {
  COLOR_OLIVE,
  COLOR_TEXT_DARK,
  FONT_BODY,
  FONT_TITLE,
  StatusPill,
} from './ManagerShared';

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
                <span style={{ fontFamily: FONT_TITLE, fontSize: 17, color: COLOR_TEXT_DARK, letterSpacing: '0.01em' }}>
                  {guest.name}
                </span>
                {!guest.isPredefined && (
                  <Tag
                    style={{
                      fontFamily: FONT_BODY,
                      fontSize: 11,
                      color: COLOR_OLIVE,
                      background: 'rgba(124,116,88,0.08)',
                      border: '1px solid rgba(124,116,88,0.35)',
                      borderRadius: 999,
                    }}
                  >
                    Afegit
                  </Tag>
                )}
              </Space>
            </List.Item>
          )}
        />
      </Space>
    )}
  </Drawer>
);
