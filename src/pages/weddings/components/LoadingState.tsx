import { FC } from 'react';
import './wedding-states.css';

export const LoadingState: FC = () => {
  return (
    <div className="wedding-loading">
      <div className="wedding-spinner" />
    </div>
  );
};
