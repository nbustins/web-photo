import { FC } from 'react';
import { Form, Input, FormInstance } from 'antd';
import type { Invitation } from '../../../../model/wedding.types';
import type { InvitationFormValues } from '../WeddingGuestPage.types';
import { GuestAttendanceSection } from './GuestAttendanceSection';
import { HotelInfoSection } from './HotelInfoSection';
import { TransportSection } from './TransportSection';
import { AllergensSection } from './AllergensSection';
import { SongRequestsSection } from './SongRequestsSection';
import shared from './GuestShared.module.css';

interface GuestFormFieldsProps {
  invitation: Invitation;
  form: FormInstance<InvitationFormValues>;
  compact?: boolean;
}

/** Body of the invitation card, shared by the desktop card and the mobile sheet. Must render inside a <Form>. */
export const GuestFormFields: FC<GuestFormFieldsProps> = ({ invitation, form, compact }) => {
  const { features, hotelInfo } = invitation;
  const guests = Form.useWatch('guests', form) ?? [];

  return (
    <>
      <GuestAttendanceSection form={form} compact={compact} />

      {features.hotelInfo && hotelInfo && <HotelInfoSection html={hotelInfo} />}
      {features.transportToHotel && <TransportSection guests={guests} />}
      {features.allergens && <AllergensSection guests={guests} />}
      {features.songRequests && <SongRequestsSection />}

      <Form.Item
        name="notes"
        label={
          <span className={shared.label}>
            {features.allergens ? 'Observacions' : 'Observacions (al·lèrgies, menú especial, etc.)'}
          </span>
        }
      >
        <Input.TextArea
          rows={3}
          placeholder={
            features.allergens ? 'Alguna cosa més que vulguis dir-nos?' : 'Escriu les teves observacions aquí...'
          }
          className={shared.input}
          showCount
          maxLength={500}
        />
      </Form.Item>
    </>
  );
};
