import { FC } from 'react';
import { Button, ButtonProps, Tooltip } from 'antd';
import {
  AppstoreOutlined,
  ArrowDownOutlined,
  ArrowUpOutlined,
  CalendarOutlined,
  ClockCircleOutlined,
  DeleteOutlined,
  DownloadOutlined,
  EditOutlined,
  EyeInvisibleOutlined,
  HeartOutlined,
  LeftOutlined,
  LinkOutlined,
  LogoutOutlined,
  MailOutlined,
  MenuOutlined,
  PlusOutlined,
  ReloadOutlined,
  RightOutlined,
  SearchOutlined,
  StopOutlined,
  TeamOutlined,
  UnorderedListOutlined,
} from '@ant-design/icons';

/**
 * The admin panel's icon vocabulary. One meaning, one icon, defined here — add a case rather than
 * reaching into @ant-design/icons from a tab, or the language drifts.
 *
 * `retire` is deliberately not `remove`: retiring a session type unpublishes it (API spec 007
 * FR-8), it does not delete anything.
 */
export const AdminIcons = {
  create: PlusOutlined,
  edit: EditOutlined,
  remove: DeleteOutlined,
  retire: EyeInvisibleOutlined,
  refresh: ReloadOutlined,
  block: StopOutlined,
  download: DownloadOutlined,
  email: MailOutlined,
  moveUp: ArrowUpOutlined,
  moveDown: ArrowDownOutlined,
  // Shell sections. `calendar` doubles as the bookings section: bookings are the calendar.
  calendar: CalendarOutlined,
  sessions: AppstoreOutlined,
  schedule: ClockCircleOutlined,
  weddings: HeartOutlined,
  logout: LogoutOutlined,
  menu: MenuOutlined,
  list: UnorderedListOutlined,
  search: SearchOutlined,
  prev: LeftOutlined,
  next: RightOutlined,
  guests: TeamOutlined,
  link: LinkOutlined,
} as const;

export type IconName = keyof typeof AdminIcons;

/**
 * Icon-only button. `label` is mandatory: it is both the tooltip and the accessible name, so an
 * icon button can never ship without one.
 */
export const IconButton: FC<Omit<ButtonProps, 'icon' | 'children'> & {
  icon: IconName;
  label: string;
}> = ({ icon, label, ...buttonProps }) => {
  const Icon = AdminIcons[icon];
  return (
    <Tooltip title={label}>
      <Button {...buttonProps} icon={<Icon />} aria-label={label} />
    </Tooltip>
  );
};
