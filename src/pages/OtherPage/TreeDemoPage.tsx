import React from 'react';
import TreeExample from "../../components/UiExample/TreeExample.tsx"

const TreeDemoPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12">
      <div className="container mx-auto px-4">
        <TreeExample />
      </div>
    </div>
  );
};

export default TreeDemoPage;