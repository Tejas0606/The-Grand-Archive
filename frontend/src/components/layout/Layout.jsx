import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Header from './Header';
import RightWidgetSidebar from './RightWidgetSidebar';
import ArchivistModal from '../ai/ArchivistModal';

const Layout = () => {
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [aiModalOpen, setAiModalOpen] = useState(false);
  const [aiModalTab, setAiModalTab] = useState('polish');

  const openAiModal = (tab = 'polish') => {
    setAiModalTab(tab);
    setAiModalOpen(true);
  };

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-parchment text-ink">
      {/* Desktop Left Sidebar */}
      <div className="hidden lg:block h-full flex-shrink-0">
        <Sidebar />
      </div>

      {/* Mobile Sidebar Overlay */}
      {mobileSidebarOpen && (
        <div className="fixed inset-0 z-50 flex lg:hidden">
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setMobileSidebarOpen(false)}
          />
          <div className="relative z-10 w-64 h-full shadow-2xl">
            <Sidebar onCloseMobile={() => setMobileSidebarOpen(false)} />
          </div>
        </div>
      )}

      {/* Center & Main Content Column */}
      <div className="flex-1 flex flex-col h-full min-w-0 overflow-hidden">
        {/* Top Header */}
        <Header onOpenMobile={() => setMobileSidebarOpen(true)} />

        {/* Inner Content Area */}
        <div className="flex-1 flex overflow-hidden">
          <main className="flex-1 overflow-y-auto px-4 sm:px-8 py-6 max-w-5xl mx-auto w-full">
            <Outlet context={{ openAiModal }} />
          </main>

          {/* Right Literary Widget Sidebar */}
          <RightWidgetSidebar onOpenAIArchivist={() => openAiModal('recommend')} />
        </div>
      </div>

      {/* Persistent AI Archivist Modal */}
      <ArchivistModal
        isOpen={aiModalOpen}
        onClose={() => setAiModalOpen(false)}
        initialTab={aiModalTab}
      />
    </div>
  );
};

export default Layout;
