import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { ConfigProvider, App as AntdApp } from 'antd';
import { AuthProvider } from './features/auth/context/AuthContext';
import App from './App.tsx';
import './styles/global.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ConfigProvider
      theme={{
        token: {
          colorPrimary: '#4f46e5',
          borderRadius: 8,
          fontFamily: "'Outfit', 'Inter', sans-serif",
          colorLink: '#4f46e5',
        },
        components: {
          Button: {
            borderRadius: 6,
            fontWeight: 500,
          },
        },
      }}
    >
      <AuthProvider>
        <AntdApp>
          <App />
        </AntdApp>
      </AuthProvider>
    </ConfigProvider>
  </StrictMode>
);
