import { FC } from 'react';
import { Divider, Form, Switch } from 'antd';
import { toContentFieldValue } from '@utils/richHtml.utils';
import { RichHtmlEditor } from './RichHtmlEditor';
import { WEDDING_CONTENT_FIELDS } from './weddingContentFields';

/**
 * Feature toggles plus the eight rich-HTML content fields, shared by the create
 * and update wedding forms. Uses nested field names (`features.*`, `content.*`),
 * so both forms can submit their values straight to the API.
 */
export const WeddingContentFields: FC = () => (
  <>
    <Divider orientation="left" plain>
      Funcionalitats
    </Divider>
    <Form.Item name={['features', 'transportToHotel']} label="Transport a l'hotel" valuePropName="checked">
      <Switch />
    </Form.Item>
    <Form.Item name={['features', 'songRequests']} label="Cançons per a la festa" valuePropName="checked">
      <Switch />
    </Form.Item>
    <Form.Item name={['features', 'allergens']} label="Al·lèrgies i intoleràncies" valuePropName="checked">
      <Switch />
    </Form.Item>

    <Divider orientation="left" plain>
      Contingut
    </Divider>
    {WEDDING_CONTENT_FIELDS.map((field) => (
      <Form.Item
        key={field.name}
        name={['content', field.name]}
        label={field.label}
        rules={[
          {
            // Validates the value the form will persist, not the raw editor HTML.
            validator: (_rule, value: string | undefined) =>
              toContentFieldValue(value ?? '').length > field.maxLength
                ? Promise.reject(new Error(`Màxim ${field.maxLength} caràcters`))
                : Promise.resolve(),
          },
        ]}
      >
        <RichHtmlEditor maxLength={field.maxLength} previewLabel={field.label} />
      </Form.Item>
    ))}
  </>
);

export default WeddingContentFields;
