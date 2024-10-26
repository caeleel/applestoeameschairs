import React, { ReactNode } from 'react';

const SplitPanel = ({ children }: { children: ReactNode }) => {
  const [leftChild, rightChild] = React.Children.toArray(children);

  return (
    <div className="flex flex-col md:flex-row w-full h-[calc(100svh-4rem)]">
      <div className="w-full md:w-1/2 h-1/2 md:h-full">
        {leftChild}
      </div>
      <div className="w-full md:w-1/2 h-1/2 md:h-full">
        {rightChild}
      </div>
    </div>
  );
};

export default SplitPanel;
