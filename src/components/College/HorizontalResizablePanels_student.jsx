import React, { useState, useCallback, useEffect, useRef } from 'react';
import './HorizontalResizablePanels_student.css';

const HorizontalResizablePanels_student = ({ 
  leftPanel, 
  rightPanel, 
  initialSplitPercentage = 50,
  minLeftWidth = 300,
  minRightWidth = 400 
}) => {
  const [splitPercentage, setSplitPercentage] = useState(initialSplitPercentage);
  const [isDragging, setIsDragging] = useState(false);
  const isDraggingRef = useRef(false);

  const handleMouseDown = useCallback((e) => {
    e.preventDefault();
    console.log('🔴 Horizontal splitter mouse down - starting drag');
    setIsDragging(true);
    isDraggingRef.current = true;
  }, []);

  const handleMouseMove = useCallback((e) => {
    if (!isDraggingRef.current) {
      return;
    }
    
    const container = document.querySelector('.horizontal-resizable-container-student');
    if (!container) {
      console.log('🔴 No horizontal container found!');
      return;
    }

    const rect = container.getBoundingClientRect();
    const isVerticalLayout = window.innerWidth <= 900;
    
    if (isVerticalLayout) {
      // Vertical layout - use Y coordinate for height calculation
      const y = e.clientY - rect.top;
      const newPercentage = (y / rect.height) * 100;
      
      console.log('📏 Vertical resize calculation:', {
        containerHeight: rect.height,
        mouseY: y,
        newPercentage: newPercentage.toFixed(1)
      });

      // For vertical layout, use minimum heights as percentages
      const minTopPercentage = 20; // 20% minimum
      const minBottomPercentage = 30; // 30% minimum

      const constrainedPercentage = Math.max(
        minTopPercentage,
        Math.min(100 - minBottomPercentage, newPercentage)
      );

      console.log('🎯 Setting vertical split percentage:', constrainedPercentage.toFixed(1));
      setSplitPercentage(constrainedPercentage);
    } else {
      // Horizontal layout - use X coordinate for width calculation
      const x = e.clientX - rect.left;
      const newPercentage = (x / rect.width) * 100;

      console.log('📏 Horizontal resize calculation:', {
        containerWidth: rect.width,
        mouseX: x,
        newPercentage: newPercentage.toFixed(1)
      });

      // Calculate minimum percentages based on pixel values
      const minLeftPercentage = (minLeftWidth / rect.width) * 100;
      const minRightPercentage = (minRightWidth / rect.width) * 100;

      // Constrain the percentage within bounds
      const constrainedPercentage = Math.max(
        minLeftPercentage,
        Math.min(100 - minRightPercentage, newPercentage)
      );

      console.log('🎯 Setting horizontal split percentage:', constrainedPercentage.toFixed(1));
      setSplitPercentage(constrainedPercentage);
    }
  }, [minLeftWidth, minRightWidth]);

  const handleMouseUp = useCallback(() => {
    console.log('🔵 Horizontal mouse up - ending drag');
    setIsDragging(false);
    isDraggingRef.current = false;
  }, []);

  // Add global mouse event listeners when dragging
  useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      
      // Set cursor based on layout
      const isVerticalLayout = window.innerWidth <= 900;
      document.body.style.cursor = isVerticalLayout ? 'row-resize' : 'col-resize';
      document.body.style.userSelect = 'none';

      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
        document.body.style.cursor = '';
        document.body.style.userSelect = '';
      };
    }
  }, [isDragging, handleMouseMove, handleMouseUp]);

  return (
    <div className="horizontal-resizable-container-student">
      <div 
        className="horizontal-left-panel-student"
        style={{ width: `${splitPercentage}%` }}
      >
        {leftPanel}
      </div>
      
      <div 
        className={`horizontal-splitter-student ${isDragging ? 'dragging' : ''}`}
        onMouseDown={handleMouseDown}
        title={`Split: ${splitPercentage.toFixed(1)}% | ${isDragging ? 'Dragging' : 'Ready'}`}
      >
        <div className="horizontal-splitter-handle-student">
          <div className="horizontal-splitter-dots-student">
            <span></span>
            <span></span>
            <span></span>
          </div>
        </div>
      </div>
      
      <div 
        className="horizontal-right-panel-student"
        style={{ width: `${100 - splitPercentage}%` }}
      >
        {rightPanel}
      </div>
    </div>
  );
};

export default HorizontalResizablePanels_student;