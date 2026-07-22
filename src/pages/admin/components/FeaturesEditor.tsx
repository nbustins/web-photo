import { FC } from 'react';
import { Button, Input, Space } from 'antd';
import { ArrowDownOutlined, ArrowUpOutlined, DeleteOutlined, PlusOutlined } from '@ant-design/icons';

/**
 * Ordered feature list of a pricing card (API spec 007 QC5): add / remove / move up-down.
 * No drag & drop dependency for lists of 4-8 rows.
 *
 * Shaped as an antd custom form control: `value` / `onChange` come from Form.Item.
 */
export const FeaturesEditor: FC<{
  value?: string[];
  onChange?: (value: string[]) => void;
}> = ({ value = [], onChange }) => {
  const emit = (next: string[]) => onChange?.(next);

  const setAt = (index: number, text: string) =>
    emit(value.map((item, i) => (i === index ? text : item)));

  const move = (index: number, delta: number) => {
    const target = index + delta;
    if (target < 0 || target >= value.length) return;
    const next = [...value];
    [next[index], next[target]] = [next[target], next[index]];
    emit(next);
  };

  return (
    <Space direction="vertical" style={{ width: '100%' }}>
      {value.map((item, index) => (
        <Space.Compact key={index} style={{ width: '100%' }}>
          <Input value={item} onChange={(e) => setAt(index, e.target.value)} />
          <Button icon={<ArrowUpOutlined />} disabled={index === 0} onClick={() => move(index, -1)} />
          <Button icon={<ArrowDownOutlined />} disabled={index === value.length - 1} onClick={() => move(index, 1)} />
          <Button icon={<DeleteOutlined />} danger onClick={() => emit(value.filter((_, i) => i !== index))} />
        </Space.Compact>
      ))}
      <Button icon={<PlusOutlined />} onClick={() => emit([...value, ''])} block>
        Afegir línia
      </Button>
    </Space>
  );
};

export default FeaturesEditor;
