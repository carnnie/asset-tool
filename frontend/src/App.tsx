import axios from 'axios';
import Router from './router';
import { createContext, useEffect, useState } from 'react';
import CircularSpinner from './components/spinner';
import { createTheme, ThemeProvider } from '@mui/material';
import { Loader } from './components/loader';

export interface user {
  username: string;
  email: string;
  roles: Array<string>;
  store_role: Array<string>;
}

const baseUser: user = {
  username: '',
  email: '',
  roles: [],
  store_role: [],
};
// Get user once and sharre it across app
export const UserContext = createContext<user>(baseUser);
export const LoaderContext = createContext<React.Dispatch<React.SetStateAction<boolean>>>(() => {});

const getUser = async () => {
  if (window.location.hostname != 'asset-tool.metro-cc.ru') {
    return {
      username: 'test.user',
      email: 'some@domen.zz',
      roles: [
        'MCC_RU_INSIGHT_IT_ROLE',
        'MCC_RU_INSIGHT_IT_INVENTADMIN_ROLE',
        'MCC_RU_INSIGHT_ACCOUNTANT',
        'MCC_RU_INSIGHT_IT_STORAGE_ROLE',
      ],
      store_role: [],
    };
  }
  try {
    const responce = await axios.get('/auth/whoami/');
    return responce.data;
  } catch (error) {
    console.log(error);
  }
};

function App() {
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState<user | undefined>();

  const theme = createTheme({});

  useEffect(() => {
    setLoading(true);
    (async () => {
      const tmp: user = await getUser();
      setUser(tmp);
      setLoading(false);
    })();
  }, []);

  return (
    <>
      {user && (
        <UserContext.Provider value={user}>
          <LoaderContext.Provider value={setLoading}>
            <ThemeProvider theme={theme}>
              <Router />
            </ThemeProvider>
          </LoaderContext.Provider>
        </UserContext.Provider>
      )}
      <Loader loading={loading} />
    </>
  );
}

export default App;
