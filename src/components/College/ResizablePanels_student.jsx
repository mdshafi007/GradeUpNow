import React, { useState, useCallback, useEffect, useRef } from 'react';
import './ResizablePanels_student.css';

const ResizablePanels_student = ({ 
  topPanel, 
  bottomPanel, 
  initialSplitPercentage = 60,
  minTopHeight = 200,
  minBottomHeight = 100 
}) => {
  const [splitPercentage, setSplitPercentage] = useState(initialSplitPercentage);
  const [isDragging, setIsDragging] = useState(false);
  const [containerHeight, setContainerHeight] = useState(600);
  const isDraggingRef = useRef(false);

  const handleMouseDown = useCallback((e) => {
    e.preventDefault();
    console.log('🔴 Mouse down on splitter - starting drag');
    setIsDragging(true);
    isDraggingRef.current = true;
  }, []);

  const handleMouseMove = useCallback((e) => {
    if (!isDraggingRef.current) {
      return;
    }

    console.log('🟢 Mouse move while dragging', { clientY: e.clientY });
    
    const container = document.querySelector('.resizable-panels-container-student');
    if (!container) {
      console.log('🔴 No container found!');
      return;
    }

    const rect = container.getBoundingClientRect();
    const y = e.clientY - rect.top;
    const newPercentage = (y / rect.height) * 100;

    console.log('📏 Resize calculation:', {
      containerHeight: rect.height,
      mouseY: y,
      newPercentage: newPercentage.toFixed(1)
    });

    // Calculate minimum percentages based on pixel values
    const minTopPercentage = (minTopHeight / rect.height) * 100;
    const minBottomPercentage = (minBottomHeight / rect.height) * 100;

    // Constrain the percentage within bounds
    const constrainedPercentage = Math.max(
      minTopPercentage,
      Math.min(100 - minBottomPercentage, newPercentage)
    );

    console.log('🎯 Setting split percentage:', constrainedPercentage.toFixed(1));
    setSplitPercentage(constrainedPercentage);
  }, [minTopHeight, minBottomHeight]);

  const handleMouseUp = useCallback(() => {
    console.log('🔵 Mouse up - ending drag');
    setIsDragging(false);
    isDraggingRef.current = false;
  }, []);

  // Add global mouse event listeners when dragging
  useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      document.body.style.cursor = 'row-resize';
      document.body.style.userSelect = 'none';

      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
        document.body.style.cursor = '';
        document.body.style.userSelect = '';
      };
    }
  }, [isDragging, handleMouseMove, handleMouseUp]);

  // Measure container height on resize
  useEffect(() => {
    const updateHeight = () => {
      const container = document.querySelector('.resizable-panels-container-student');
      if (container) {
        setContainerHeight(container.clientHeight);
      }
    };

    updateHeight();
    window.addEventListener('resize', updateHeight);
    return () => window.removeEventListener('resize', updateHeight);
  }, []);

  return (
    <div className="resizable-panels-container-student">
      <div 
        className="resizable-top-panel-student"
        style={{ height: `${splitPercentage}%` }}
      >
        {topPanel}
      </div>
      
      <div 
        className={`resizable-splitter-student ${isDragging ? 'dragging' : ''}`}
        onMouseDown={handleMouseDown}
        title={`Split: ${splitPercentage.toFixed(1)}% | ${isDragging ? 'Dragging' : 'Ready'}`}
      >
        <div className="splitter-handle-student">
          <div className="splitter-dots-student">
            <span></span>
            <span></span>
            <span></span>
          </div>
        </div>
      </div>
      
      <div 
        className="resizable-bottom-panel-student"
        style={{ height: `${100 - splitPercentage}%` }}
      >
        {bottomPanel}
      </div>
    </div>
  );
};

export default ResizablePanels_student;