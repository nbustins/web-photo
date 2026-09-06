import { useNavigate } from 'react-router-dom';
import { message } from 'antd';
import { ApiError } from '../../services/api.client';
import { errorMessage, GENERIC_ERROR } from '../../services/error-messages';
import { logout } from '../../services/auth/auth.service';

// Maps an error to a toast; on 401 clears the session and returns to login.
export function useApiError() {
  const navigate = useNavigate();
  return (err: unknown, fallback = GENERIC_ERROR) => {
    if (err instanceof ApiError && err.status === 401) {
      logout();
      navigate('/admin/login', { replace: true });
      return;
    }
    message.error(errorMessage(err, fallback));
  };
}
