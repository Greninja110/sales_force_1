// File: frontend/src/hooks/useStats.js
import { useState, useEffect, useRef } from 'react';

export const useStats = () => {
  const [renderTime, setRenderTime] = useState(0);
  const [dataProcessTime, setDataProcessTime] = useState(0);
  const [dataSize, setDataSize] = useState(0);
  const [cpuUsage, setCpuUsage] = useState(0);
  const [memoryUsage, setMemoryUsage] = useState(0);
  
  const renderStartTime = useRef(Date.now());
  const dataStartTime = useRef(Date.now());
  const frameCount = useRef(0);
  const lastFrameTime = useRef(0);
  const frameRates = useRef([]);
  
  // Check for performance API support
  const hasPerformanceAPI = typeof performance !== 'undefined' && 
                           typeof performance.now === 'function' &&
                           typeof performance.memory !== 'undefined';
  
  // Number of CPU cores (hardware concurrency)
  const cpuCores = navigator.hardwareConcurrency || 'unknown';
  
  // Start monitoring rendering performance
  useEffect(() => {
    let frameId;
    
    const monitorFrame = () => {
      const now = performance.now();
      
      // Calculate frame rate
      if (lastFrameTime.current) {
        const delta = now - lastFrameTime.current;
        const fps = 1000 / delta;
        
        // Keep last 10 frames for average
        frameRates.current.push(fps);
        if (frameRates.current.length > 10) {
          frameRates.current.shift();
        }
      }
      
      lastFrameTime.current = now;
      frameCount.current++;
      
      // Check memory usage if available
      if (hasPerformanceAPI && performance.memory) {
        setMemoryUsage(Math.round(performance.memory.usedJSHeapSize / 1048576)); // Convert to MB
      }
      
      frameId = requestAnimationFrame(monitorFrame);
    };
    
    // Start monitoring
    frameId = requestAnimationFrame(monitorFrame);
    
    // Cleanup
    return () => {
      cancelAnimationFrame(frameId);
    };
  }, [hasPerformanceAPI]);
  
  // Calculate CPU usage based on rendering time
  useEffect(() => {
    const cpuMonitorInterval = setInterval(() => {
      if (frameRates.current.length > 0) {
        const avgFrameRate = frameRates.current.reduce((a, b) => a + b, 0) / frameRates.current.length;
        
        // Estimate CPU usage based on frame rate
        // This is a rough approximation: lower frame rate = higher CPU usage
        const targetFrameRate = 60;
        const estimatedUsage = Math.min(100, Math.max(0, 100 - (avgFrameRate / targetFrameRate * 100)));
        
        setCpuUsage(Math.round(estimatedUsage));
      }
    }, 1000);
    
    return () => {
      clearInterval(cpuMonitorInterval);
    };
  }, []);
  
  // Track dashboard load time
  const trackDashboardLoad = (loadTime, data) => {
    // Calculate render time
    const renderEnd = Date.now();
    const renderDuration = renderEnd - renderStartTime.current;
    setRenderTime(renderDuration);
    
    // Calculate data processing time
    const dataProcessDuration = renderEnd - dataStartTime.current - loadTime;
    setDataProcessTime(Math.max(0, dataProcessDuration));
    
    // Calculate data size
    if (data) {
      // Estimate data size in KB
      const jsonSize = JSON.stringify(data).length;
      setDataSize(Math.round(jsonSize / 1024));
    }
    
    // Reset timers for next load
    renderStartTime.current = Date.now();
    dataStartTime.current = Date.now();
  };
  
  // Start data processing timer
  const startDataProcessTimer = () => {
    dataStartTime.current = Date.now();
  };
  
  // Get current stats
  const getStats = () => ({
    renderTime,
    dataProcessTime,
    dataSize,
    cpuUsage,
    memoryUsage,
    cpuCores,
    frameRate: frameRates.current.length > 0 
      ? Math.round(frameRates.current.reduce((a, b) => a + b, 0) / frameRates.current.length) 
      : 0,
    totalFrames: frameCount.current
  });
  
  // Format stats for display
  const getRenderTime = () => renderTime;
  const getDataProcessTime = () => dataProcessTime;
  const getCpuUsage = () => `${cpuUsage}%`;
  const getMemoryUsage = () => `${memoryUsage} MB`;
  const getFrameRate = () => {
    if (frameRates.current.length === 0) return '0 FPS';
    const avg = frameRates.current.reduce((a, b) => a + b, 0) / frameRates.current.length;
    return `${Math.round(avg)} FPS`;
  };
  
  return {
    trackDashboardLoad,
    startDataProcessTimer,
    getStats,
    getRenderTime,
    getDataProcessTime,
    getCpuUsage,
    getMemoryUsage,
    getFrameRate
  };
};