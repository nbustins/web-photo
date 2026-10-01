import { FC } from 'react';
import { Button, ButtonProps, Tooltip } from 'antd';
import {
  AppstoreOutlined,
  ArrowDownOutlined,
  ArrowUpOutlined,
  CalendarOutlined,
  CloseOutlined,
  ClockCircleOutlined,
  CopyOutlined,
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
  SaveOutlined,
  SearchOutlined,
  StopOutlined,
  TeamOutlined,
  UnorderedListOutlined,
} from '@ant-design/icons';

/**
 * The shared icon vocabulary (admin panel, wedding manager). One meaning, one icon, defined here — add a case rather than
 * reaching into @ant-design/icons from a page, or the language drifts.
 *
 * `retire` is deliberately not `remove`: retiring a session type unpublishes it (API spec 007
 * FR-8), it does not delete anything.
 */
export const Icons = {
  create: PlusOutlined,
  close: CloseOutlined,
  edit: EditOutlined,
  copy: CopyOutlined,
  remove: DeleteOutlined,
  retire: EyeInvisibleOutlined,
  refresh: ReloadOutlined,
  save: SaveOutlined,
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

export type IconName = keyof typeof Icons;

/**
 * Icon-only button. `label` is mandatory: it is both the tooltip and the accessible name, so an
 * icon button can never ship without one.
 */
export const IconButton: FC<Omit<ButtonProps, 'icon' | 'children'> & {
  icon: IconName;
  label: string;
}> = ({ icon, label, ...buttonProps }) => {
  const Icon = Icons[icon];
  return (
    <Tooltip title={label}>
      <Button {...buttonProps} icon={<Icon />} aria-label={label} />
    </Tooltip>
  );
};
