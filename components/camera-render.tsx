import { Camera, RefreshCcw, SwitchCamera, Upload } from "lucide-react";
import React, { useEffect, useRef, useState } from "react";
import { usePrivy, useWallets } from "@privy-io/react-auth";

import { Loader2 } from "lucide-react";
import { uploadImage } from "../utils/irysFunctions";
import { useRouter } from "next/router";

type Props = {
  uploadCallback: () => void;
};

const CameraRender = ({ uploadCallback }: Props) => {
  const router = useRouter();
  const [isUploading, setIsUploading] = useState(false);
  const [currentDeviceId, setCurrentDeviceId] = useState<string | null>(null);
  const [isMobileDevice, setIsMobileDevice] = useState(false);
  const { sendTransaction } = usePrivy();

  const videoRef = useRef<HTMLVideoElement>(null);
  const [streamActive, setStreamActive] = useState(false);
  const [imageBlob, setImageBlob] = useState<Blob | null>(null);
  const { wallets } = useWallets();

  // The 0th position wallet is the most recently connected one
  const w = wallets.at(0);

  useEffect(() => {
    // Mobile detection

    const isTouchDevice =
      //@ts-ignore
      "ontouchstart" in window ||
      navigator.maxTouchPoints > 0 ||
      //@ts-ignore
      navigator.msMaxTouchPoints > 0;
    setIsMobileDevice(isTouchDevice);
  }, []);

  useEffect(() => {
    async function enableStream(deviceId = currentDeviceId) {
      try {
        const constraints = {
          video: deviceId ? { deviceId: { exact: deviceId } } : true,
        };
        const stream = await navigator.mediaDevices.getUserMedia(constraints);
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          setStreamActive(true);
        }
      } catch (err) {
        console.error(err);
      }
    }

    if (!streamActive) {
      enableStream();
    }

    return () => {
      if (streamActive && videoRef.current && videoRef.current.srcObject) {
        const mediaStream = videoRef.current.srcObject as MediaStream;
        const tracks = mediaStream.getTracks();
        tracks.forEach((track: MediaStreamTrack) => track.stop());
      }
    };
  }, [streamActive, currentDeviceId]);

  const switchCamera = async () => {
    const devices = await navigator.mediaDevices.enumerateDevices();
    const videoDevices = devices.filter(
      (device) => device.kind === "videoinput"
    );

    if (videoDevices.length > 0) {
      if (currentDeviceId === null) {
        // Set to the default mobile device ID (first device in the list)
        const defaultDeviceId = videoDevices[0]?.deviceId;
        if (defaultDeviceId) {
          setCurrentDeviceId(defaultDeviceId);
        }
      } else {
        const currentDeviceIndex = videoDevices.findIndex(
          (device) => device.deviceId === currentDeviceId
        );
        const nextDeviceIndex = (currentDeviceIndex + 1) % videoDevices.length;
        const nextDeviceId = videoDevices[nextDeviceIndex]?.deviceId;
        if (nextDeviceId) {
          setCurrentDeviceId(nextDeviceId);
        }
      }
    }
  };

  const handleCapture = () => {
    if (videoRef.current) {
      const video = videoRef.current;
      const canvas = document.createElement("canvas");
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const context = canvas.getContext("2d");
      if (context) {
        context.drawImage(video, 0, 0, canvas.width, canvas.height);
        canvas.toBlob((blob) => {
          if (blob) {
            setImageBlob(blob);
          }
        });
      }
    }
  };

  const handleRetake = async () => {
    setImageBlob(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        setStreamActive(true);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const onUpload = async (originalBlob: Blob): Promise<void> => {
    if (w) {
      setIsUploading(true);
      // pass in categeory from UI
      await uploadImage(originalBlob, w, sendTransaction);
      // Back to the feed
      router.push("/feed");
      setIsUploading(false);
      uploadCallback && uploadCallback();
    }
  };

  return (
    <div className="p-4 flex flex-col items-center justify-center">
      {!imageBlob ? (
        <>
          <div className="rounded-3xl overflow-hidden bg-black shadow-xl">
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted // Add padding around the video element
            />
          </div>
          <div className="flex space-x-2 w-full">
            <button
              className="flex items-center justify-center border-black w-full mt-4 bg-neon-radial-gradient text-black py-2 px-4 rounded-full border border-1 hover:border-black focus:outline-none focus:border-black hover:ring ring-neutral-800"
              onClick={handleCapture}
            >
              <Camera />
            </button>
            {isMobileDevice && (
              <button
                className="mt-4 bg-neon-radial-gradient text-black py-2 px-4 rounded-full border border-1 hover:border-black focus:outline-none focus:border-black"
                onClick={switchCamera}
              >
                <SwitchCamera />
              </button>
            )}
          </div>
        </>
      ) : (
        <>
          <div className="rounded-3xl overflow-hidden bg-black shadow-xl">
            <img
              src={URL.createObjectURL(imageBlob)}
              alt="Preview"
              // className="px-2 py-2 rounded-xl"
            />
          </div>

          <div className="flex space-x-2 mt-4">
            <button
              className="group bg-neon-radial-gradient text-black py-2 px-4 rounded-full  hover:border-black focus:outline-none focus:border-black"
              onClick={handleRetake}
            >
              <RefreshCcw className="group-hover:-rotate-90 transition-all" />
            </button>

            <button
              className="bg-neon-radial-gradient border border-1 text-black py-2 px-4 rounded-full border-black focus:outline-none focus:border-black hover:ring ring-black disabled:opacity-40"
              onClick={() => imageBlob && onUpload(imageBlob)}
              disabled={isUploading}
            >
              {isUploading ? <Loader2 className="animate-spin" /> : <Upload />}
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default CameraRender;
