import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { QueryClientProvider } from '@tanstack/react-query';
import { queryClient } from '@/lib/queryClient';
import { Layout } from '@/components/layout/Layout';
import { CollectionPage } from '@/pages/CollectionPage';
import { DownloadPage } from '@/pages/DownloadPage';
import { NotFoundPage } from '@/pages/NotFoundPage';
import { VideoAudioProvider } from '@/hooks/useVideoAudio';

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <VideoAudioProvider>
        <BrowserRouter>
          <Routes>
            <Route element={<Layout />}>
              <Route path="/" element={<DownloadPage />} />
              <Route path="/download" element={<DownloadPage />} />
              <Route path="/:username/:slug" element={<CollectionPage />} />
              <Route path="*" element={<NotFoundPage />} />
            </Route>
          </Routes>
        </BrowserRouter>
      </VideoAudioProvider>
    </QueryClientProvider>
  );
}
