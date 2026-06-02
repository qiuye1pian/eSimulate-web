import { PropsWithChildren } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ConfigProvider, App as AntdApp } from 'antd';
import zhCN from 'antd/locale/zh_CN';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

export function AppProviders({ children }: PropsWithChildren) {
  return (
    <ConfigProvider locale={zhCN} theme={{ token: { borderRadius: 6 } }}>
      <AntdApp>
        <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
      </AntdApp>
    </ConfigProvider>
  );
}
