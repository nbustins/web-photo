import { FC } from 'react';
import { Form, Input, FormInstance } from 'antd';
import type { Invitation } from '../../../../model/wedding.types';
import type { InvitationFormValues } from '../WeddingGuestPage.types';
import { GuestAttendanceSection } from './GuestAttendanceSection';
import { TransportSection } from './TransportSection';
import { AllergensSection } from './AllergensSection';
import { SongRequestsSection } from './SongRequestsSection';
import { GuestRichHtmlSection } from './GuestRichHtml';
import { PlaceScheduleSection } from './PlaceScheduleSection';
import shared from './GuestShared.module.css';

interface GuestFormFieldsProps {
  invitation: Invitation;
  form: FormInstance<InvitationFormValues>;
  compact?: boolean;
  showIntroduction?: boolean;
}

/** Body of the invitation card, shared by the desktop card and the mobile sheet. Must render inside a <Form>. */
export const GuestFormFields: FC<GuestFormFieldsProps> = ({ invitation, form, compact, showIntroduction = true }) => {
  const { features, content } = invitation;
  const guests = Form.useWatch('guests', form) ?? [];

  return (
    <>
      {showIntroduction && content?.introductionText && <GuestRichHtmlSection label="Benvinguda" html={content.introductionText} italic />}
      <PlaceScheduleSection place={content?.weddingPlace} schedule={content?.schedule} />

      <GuestAttendanceSection form={form} compact={compact} />
      {features.allergens && <AllergensSection guests={guests} />}
      
      {content?.hotelInfo && <GuestRichHtmlSection label="Allotjament" html={content.hotelInfo} />}
      {features.transportToHotel && <TransportSection guests={guests} prompt={content?.transportToHotelPhrase} />}

      {features.songRequests && <SongRequestsSection prompt={content?.songRequestsPhrase} />}

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
      
      {content?.donations && <GuestRichHtmlSection label="Regals" html={content.donations} />}
      {content?.contact && <GuestRichHtmlSection label="Contacte" html={content.contact} />}
    </>
  );
};
