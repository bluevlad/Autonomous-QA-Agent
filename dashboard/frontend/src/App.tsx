import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { ConfigProvider, Layout, theme } from 'antd';
import Dashboard from './pages/Dashboard';
import RunDetail from './pages/RunDetail';
import ProjectTimeline from './pages/ProjectTimeline';

const { Content } = Layout;

function App() {
  return (
    <ConfigProvider
      theme={{
        algorithm: theme.defaultAlgorithm,
        token: { colorPrimary: '#1677ff' },
      }}
    >
      <BrowserRouter>
        <Layout style={{ minHeight: '100vh', background: '#f5f5f5' }}>
          <Content style={{ maxWidth: 1400, margin: '0 auto', width: '100%' }}>
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/runs/:runId" element={<RunDetail />} />
              <Route path="/projects/:name" element={<ProjectTimeline />} />
            </Routes>
          </Content>
        </Layout>
      </BrowserRouter>
    </ConfigProvider>
  );
}

export default App;
