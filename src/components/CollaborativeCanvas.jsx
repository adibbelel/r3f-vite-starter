import React, { useState, useRef, useEffect } from 'react';
import './CollaborativeCanvas.css';

const CollaborativeCanvas = () => {
  // Refs
  const canvasRef = useRef(null);
  const mainCanvasRef = useRef(null);
  const fileInputRef = useRef(null);
  
  // State
  const [currentImage, setCurrentImage] = useState(null);
  const [currentImageData, setCurrentImageData] = useState(null);
  const [uploadTimer, setUploadTimer] = useState(30);
  const [onlineUsers, setOnlineUsers] = useState(1);
  const [scale, setScale] = useState(0.1);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [isPlacingMode, setIsPlacingMode] = useState(false);
  const [placementPosition, setPlacementPosition] = useState(null);
  const [size, setSize] = useState(100);
  const [rotation, setRotation] = useState(0);
  const [backendStatus, setBackendStatus] = useState('Connected to backend');
  
  // Constants
  const CANVAS_WIDTH = 6144;
  const CANVAS_HEIGHT = 6144;
  const MAX_IMAGE_SIZE = 300;
  const PLACEMENT_COOLDOWN = 30;

  // Initialize canvas
  useEffect(() => {
    const mainCanvas = mainCanvasRef.current;
    const mainCtx = mainCanvas.getContext('2d');
    
    // Initialize main canvas
    mainCanvas.width = CANVAS_WIDTH;
    mainCanvas.height = CANVAS_HEIGHT;
    
    // Fill with background
    mainCtx.fillStyle = '#111122';
    mainCtx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
    
    // Draw grid
    mainCtx.strokeStyle = 'rgba(255, 255, 255, 0.05)';
    mainCtx.lineWidth = 1;
    
    const gridSize = 256;
    for (let x = 0; x < CANVAS_WIDTH; x += gridSize) {
      mainCtx.beginPath();
      mainCtx.moveTo(x, 0);
      mainCtx.lineTo(x, CANVAS_HEIGHT);
      mainCtx.stroke();
    }
    
    for (let y = 0; y < CANVAS_HEIGHT; y += gridSize) {
      mainCtx.beginPath();
      mainCtx.moveTo(0, y);
      mainCtx.lineTo(CANVAS_WIDTH, y);
      mainCtx.stroke();
    }
    
    // Draw center marker
    mainCtx.strokeStyle = '#0070f3';
    mainCtx.lineWidth = 3;
    mainCtx.beginPath();
    mainCtx.arc(CANVAS_WIDTH/2, CANVAS_HEIGHT/2, 100, 0, Math.PI * 2);
    mainCtx.stroke();
    
    // Add initial content
    mainCtx.font = 'Bold 300px Arial';
    mainCtx.fillStyle = '#0070f3';
    mainCtx.textAlign = 'center';
    mainCtx.fillText('Next.js Canvas', CANVAS_WIDTH/2, CANVAS_HEIGHT/2 - 200);
    
    mainCtx.font = '150px Arial';
    mainCtx.fillStyle = '#0070f3';
    mainCtx.fillText('Auto-save to Backend', CANVAS_WIDTH/2, CANVAS_HEIGHT/2 + 100);
    
    // Set up display canvas
    const displayCanvas = canvasRef.current;
    displayCanvas.width = displayCanvas.parentElement.clientWidth;
    displayCanvas.height = displayCanvas.parentElement.clientHeight;
    
    updateCanvasDisplay();
  }, []);

  // Timer effect
  useEffect(() => {
    if (uploadTimer <= 0) return;
    
    const timer = setInterval(() => {
      setUploadTimer(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    
    return () => clearInterval(timer);
  }, [uploadTimer]);

  // Simulate user activity
  useEffect(() => {
    const interval = setInterval(() => {
      setOnlineUsers(1 + Math.floor(Math.random() * 15));
    }, 3000);
    
    return () => clearInterval(interval);
  }, []);

  // Update canvas display
  const updateCanvasDisplay = () => {
    const displayCanvas = canvasRef.current;
    const mainCanvas = mainCanvasRef.current;
    const ctx = displayCanvas.getContext('2d');
    
    ctx.clearRect(0, 0, displayCanvas.width, displayCanvas.height);
    
    ctx.save();
    ctx.translate(offset.x, offset.y);
    ctx.scale(scale, scale);
    ctx.drawImage(mainCanvas, 0, 0);
    ctx.restore();
    
    // Draw viewport border
    ctx.strokeStyle = '#0070f3';
    ctx.lineWidth = 2;
    ctx.strokeRect(0, 0, displayCanvas.width, displayCanvas.height);
    
    // Draw zoom level indicator
    ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
    ctx.fillRect(10, 10, 140, 40);
    ctx.fillStyle = '#0070f3';
    ctx.font = '14px Arial';
    ctx.fillText(`Zoom: ${Math.round(scale * 100)}%`, 20, 30);
    ctx.fillText(`Position: ${Math.round(-offset.x/scale)}, ${Math.round(-offset.y/scale)}`, 20, 50);
  };

  // Handle image upload
  const handleFileSelect = (e) => {
    if (uploadTimer > 0) {
      alert(`Please wait ${uploadTimer} seconds before placing another image.`);
      return;
    }
    
    const file = e.target.files[0];
    if (!file || !file.type.match('image.*')) {
      alert('Please select an image file.');
      return;
    }
    
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        // Resize if needed
        let width = img.width;
        let height = img.height;
        
        if (width > height && width > MAX_IMAGE_SIZE) {
          height = (height * MAX_IMAGE_SIZE) / width;
          width = MAX_IMAGE_SIZE;
        } else if (height > MAX_IMAGE_SIZE) {
          width = (width * MAX_IMAGE_SIZE) / height;
          height = MAX_IMAGE_SIZE;
        }
        
        // Create canvas for resizing
        const resizingCanvas = document.createElement('canvas');
        resizingCanvas.width = width;
        resizingCanvas.height = height;
        
        const resizingCtx = resizingCanvas.getContext('2d');
        resizingCtx.drawImage(img, 0, 0, width, height);
        
        setCurrentImage(resizingCanvas.toDataURL('image/jpeg'));
        setCurrentImageData({ img, width, height });
        setIsPlacingMode(true);
      };
      img.src = e.target.result;
    };
    reader.readAsDataURL(file);
  };

  // Handle canvas click (placement)
  const handleCanvasClick = (e) => {
    if (!isPlacingMode || !currentImageData) return;
    
    const rect = e.target.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    // Convert to main canvas coordinates
    const mainX = (x - offset.x) / scale;
    const mainY = (y - offset.y) / scale;
    
    setPlacementPosition({ x: mainX, y: mainY });
    addImageToCanvas();
  };

  // Add image to canvas
  const addImageToCanvas = () => {
    if (!currentImageData || !placementPosition) return;
    
    const mainCanvas = mainCanvasRef.current;
    const mainCtx = mainCanvas.getContext('2d');
    const img = currentImageData.img;
    
    const width = currentImageData.width * (size / 100);
    const height = currentImageData.height * (size / 100);
    
    const x = Math.max(0, Math.min(CANVAS_WIDTH - width, placementPosition.x - width/2));
    const y = Math.max(0, Math.min(CANVAS_HEIGHT - height, placementPosition.y - height/2));
    
    mainCtx.save();
    mainCtx.translate(x + width/2, y + height/2);
    mainCtx.rotate(rotation * Math.PI / 180);
    mainCtx.drawImage(img, -width/2, -height/2, width, height);
    mainCtx.restore();
    
    // Update display
    updateCanvasDisplay();
    
    // Simulate backend save
    simulateBackendSave();
    
    // Reset state
    setCurrentImage(null);
    setCurrentImageData(null);
    setIsPlacingMode(false);
    setPlacementPosition(null);
    setUploadTimer(PLACEMENT_COOLDOWN);
  };

  // Simulate backend save
  const simulateBackendSave = () => {
    setBackendStatus('Saving to backend...');
    
    setTimeout(() => {
      setBackendStatus('Saved to backend ✓');
      
      setTimeout(() => {
        setBackendStatus('Connected to backend');
      }, 2000);
    }, 1000);
  };

  // Handle zoom
  const handleZoom = (e) => {
    e.preventDefault();
    
    const zoomIntensity = 0.1;
    const wheel = e.deltaY < 0 ? 1 : -1;
    const zoom = Math.exp(wheel * zoomIntensity);
    
    const rect = e.target.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    const canvasX = (x - offset.x) / scale;
    const canvasY = (y - offset.y) / scale;
    
    const newScale = Math.max(0.05, Math.min(scale * zoom, 1));
    
    setOffset({
      x: x - canvasX * newScale,
      y: y - canvasY * newScale
    });
    setScale(newScale);
    
    updateCanvasDisplay();
  };

  // Handle drag
  const handleDrag = (e) => {
    if (!isDragging) return;
    
    setOffset(prev => ({
      x: prev.x + e.movementX,
      y: prev.y + e.movementY
    }));
    
    updateCanvasDisplay();
  };

  return (
    <div className="collaborative-canvas">
      <header>
        <div className="logo">▲</div>
        <h1>Next.js Collaborative Canvas</h1>
        <p className="subtitle">Real-time collaboration with automatic backend synchronization</p>
      </header>
      
      <div className="main-content">
        <div className="upload-section">
          <h2>Add Your Image</h2>
          <div 
            className="upload-box" 
            onClick={() => fileInputRef.current.click()}
          >
            <div className="upload-icon">📁</div>
            <p>Click to browse or drag & drop your image</p>
            <p><small>Max size: 300x300px</small></p>
            <input 
              type="file" 
              ref={fileInputRef} 
              accept="image/*" 
              style={{ display: 'none' }}
              onChange={handleFileSelect}
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="image-size">
              Image Size: <span className="value-display">{size}</span>%
            </label>
            <input 
              type="range" 
              id="image-size" 
              min="50" 
              max="100" 
              value={size}
              onChange={(e) => setSize(parseInt(e.target.value))}
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="image-rotation">
              Rotation: <span className="value-display">{rotation}</span>°
            </label>
            <input 
              type="range" 
              id="image-rotation" 
              min="0" 
              max="360" 
              value={rotation}
              onChange={(e) => setRotation(parseInt(e.target.value))}
            />
          </div>
          
          <div className="timer-container">
            <p>Time until next placement:</p>
            <div className="timer">{uploadTimer}s</div>
          </div>
          
          <div className="status-indicator">
            <div className="status-dot"></div>
            <span>{backendStatus}</span>
          </div>
          
          <div className="online-users">
            <div className="user-dot"></div>
            <span>{onlineUsers}</span> users online
          </div>
        </div>
        
        <div className="canvas-section">
          <h2>Collaborative Canvas <small>(6K resolution - 6144×6144 pixels)</small></h2>
          <p>Click anywhere on the canvas to place your image. Auto-saves to backend.</p>
          <div 
            className="canvas-container"
            onMouseDown={() => setIsDragging(true)}
            onMouseMove={handleDrag}
            onMouseUp={() => setIsDragging(false)}
            onMouseLeave={() => setIsDragging(false)}
            onWheel={handleZoom}
            onClick={handleCanvasClick}
          >
            <canvas ref={canvasRef}></canvas>
            <canvas ref={mainCanvasRef} style={{ display: 'none' }}></canvas>
          </div>
        </div>
      </div>
      
      <div className="nextjs-badge">
        <span>{onlineUsers}</span> online • Next.js
      </div>
      
      <div className="zoom-controls">
        <button onClick={() => {
          setScale(prev => Math.min(prev + 0.1, 1));
          updateCanvasDisplay();
        }}>+</button>
        <button onClick={() => {
          setScale(prev => Math.max(prev - 0.1, 0.05));
          updateCanvasDisplay();
        }}>-</button>
        <button onClick={() => {
          setScale(0.1);
          setOffset({ x: 0, y: 0 });
          updateCanvasDisplay();
        }}>⟳</button>
      </div>
      
      <footer>
        <p>Powered by Next.js • Real-time collaboration with automatic backend synchronization</p>
      </footer>
    </div>
  );
};

export default CollaborativeCanvas;