import { createContext } from 'react';

export const UserProfileContext = createContext({
  userProfile: null,
  session: null,
  loading: true,
  error: null,
  updateProfile: async () => { return { success: false }; },
  clearProfile: () => {},
});
