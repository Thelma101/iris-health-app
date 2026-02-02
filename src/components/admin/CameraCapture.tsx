'use client';
import React, { useState, useRef, useEffect, useCallback } from 'react';

interface CameraCaptureProps {
  isOpen: boolean;
  onClose: () => void;
  onCapture: (file: File) => void;
}

export default function CameraCapture({ isOpen, onClose, onCapture }: CameraCaptureProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const isStartingRef = useRef(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [facingMode, setFacingMode] = useState<'user' | 'environment'>('environment');
  const [permissionDenied, setPermissionDenied] = useState(false);

  const stopStream = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
  }, []);

  const startCamera = useCallback(async () => {
    // Prevent multiple simultaneous startCamera calls
    if (isStartingRef.current) {
      return;
    }
    
    isStartingRef.current = true;
    setIsLoading(true);
    setError(null);

    if (permissionDenied) {
      setIsLoading(false);
      isStartingRef.current = false;
      return;
    }

    try {
      if (typeof navigator === 'undefined' || !navigator.mediaDevices?.getUserMedia) {
        setError('Camera not supported in this browser. Please upload a photo instead.');
        return;
      }

      // Stop any existing stream first
      stopStream();

      // Try preferred mode first, then fallback to the opposite to make desktop cameras work
      const attemptOrder: Array<'user' | 'environment'> =
        facingMode === 'environment' ? ['environment', 'user'] : ['user', 'environment'];

      let mediaStream: MediaStream | null = null;
      let lastError: unknown = null;

      for (const mode of attemptOrder) {
        try {
          mediaStream = await navigator.mediaDevices.getUserMedia({
            video: {
              facingMode: { ideal: mode },
              width: { ideal: 1280 },
              height: { ideal: 720 },
            },
            audio: false,
          });
          break;
        } catch (err) {
          lastError = err;
        }
      }

      if (!mediaStream) {
        throw lastError || new Error('Unable to start camera');
      }

      streamRef.current = mediaStream;

      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
        try {
          await videoRef.current.play();
        } catch (playErr) {
          // Ignore AbortError as it happens when component unmounts or stream changes
          if (playErr instanceof Error && playErr.name === 'AbortError') {
            // Silently ignore - this is expected when switching cameras or closing modal
            return;
          }
          throw playErr;
        }
      }
    } catch (err) {
      // Ignore AbortError as it's expected during rapid state changes
      if (err instanceof Error && err.name === 'AbortError') {
        return;
      }
      
      if (err instanceof Error && err.name === 'NotAllowedError') {
        setPermissionDenied(true);
        setError('Camera access denied. Please allow camera access in your browser settings.');
        setIsLoading(false);
        return;
      }

      if (err instanceof Error) {
        if (err.name === 'NotAllowedError') {
          setError('Camera access denied. Please allow camera access in your browser settings.');
        } else if (err.name === 'NotFoundError') {
          setError('No camera found. Please connect a camera and try again.');
        } else if (err.name === 'NotSupportedError') {
          setError('Camera not supported in this browser.');
        } else {
          setError(`Camera error: ${err.message}`);
        }
      } else {
        setError('Failed to access camera. Please try again.');
      }
    } finally {
      setIsLoading(false);
      isStartingRef.current = false;
    }
  }, [facingMode, permissionDenied, stopStream]);

  // Start camera when modal opens
  useEffect(() => {
    if (isOpen && !permissionDenied) {
      startCamera();
    }

    return () => {
      stopStream();
      isStartingRef.current = false;
    };
  }, [isOpen, permissionDenied]);

  // Restart camera when facing mode changes (separate effect to avoid dependency loops)
  useEffect(() => {
    if (isOpen && !permissionDenied && !isLoading) {
      // Small delay to ensure previous stream is fully stopped
      const timeout = setTimeout(() => {
        startCamera();
      }, 100);
      return () => clearTimeout(timeout);
    }
  }, [facingMode]);

  const handleCapture = () => {
    if (!videoRef.current || !canvasRef.current) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const context = canvas.getContext('2d');

    if (!context) return;

    // Set canvas dimensions to match video
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    // Draw video frame to canvas
    context.drawImage(video, 0, 0, canvas.width, canvas.height);

    // Convert canvas to blob
    canvas.toBlob((blob) => {
      if (blob) {
        // Create a File object from the blob
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        const file = new File([blob], `photo-${timestamp}.jpg`, { type: 'image/jpeg' });
        
        // Stop camera stream
        stopStream();
        
        onCapture(file);
        onClose();
      }
    }, 'image/jpeg', 0.9);
  };

  const handleSwitchCamera = () => {
    setFacingMode(prev => prev === 'user' ? 'environment' : 'user');
  };

  const handleClose = () => {
    stopStream();
    setPermissionDenied(false);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] bg-black flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 bg-black/80">
        <button
          onClick={handleClose}
          className="text-white hover:text-gray-300 transition-colors"
        >
          <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
        <h2 className="text-white text-lg font-medium font-poppins">Take Photo</h2>
        <button
          onClick={handleSwitchCamera}
          className="text-white hover:text-gray-300 transition-colors"
        >
          <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
        </button>
      </div>

      {/* Camera View */}
      <div className="flex-1 flex items-center justify-center relative overflow-hidden">
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-black">
            <div className="flex flex-col items-center gap-3">
              <div className="w-10 h-10 border-4 border-white/30 border-t-white rounded-full animate-spin" />
              <p className="text-white font-poppins">Starting camera...</p>
            </div>
          </div>
        )}
        
        {error && (
          <div className="absolute inset-0 flex items-center justify-center bg-black p-6">
            <div className="flex flex-col items-center gap-4 text-center">
              <svg className="w-16 h-16 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              <p className="text-white font-poppins">{error}</p>
              <button
                onClick={startCamera}
                className="px-6 py-2 bg-white text-black rounded-lg font-medium hover:bg-gray-200 transition-colors"
              >
                Try Again
              </button>
            </div>
          </div>
        )}

        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          className={`w-full h-full object-cover ${isLoading || error ? 'opacity-0' : 'opacity-100'}`}
        />
        
        {/* Hidden canvas for capture */}
        <canvas ref={canvasRef} className="hidden" />
      </div>

      {/* Capture Button */}
      <div className="flex items-center justify-center py-6 bg-black/80">
        <button
          onClick={handleCapture}
          disabled={isLoading || !!error}
          className="w-20 h-20 rounded-full border-4 border-white flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed hover:bg-white/10 transition-colors"
        >
          <div className="w-14 h-14 rounded-full bg-white" />
        </button>
      </div>
    </div>
  );
}
