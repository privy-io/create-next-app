import { Camera, RefreshCcw, SwitchCamera, Upload } from "lucide-react";
import React, { useCallback, useEffect, useRef, useState } from "react";
import { usePrivy, useWallets } from "@privy-io/react-auth";

import { ComboboxDemo } from "./ui/combobox";
import { Loader2 } from "lucide-react";
import Webcam from "react-webcam";
import { uploadImage } from "../utils/irysFunctions";
import { useCategory } from "./category-context";
import { useRouter } from "next/router";

type Props = {
  uploadCallback: () => void;
};

const CameraRender = ({ uploadCallback }: Props) => {
  const router = useRouter();
  const [category, setCategory] = useState("");
  const [isUploading, setIsUploading] = useState(false);

  const [isMobileDevice, setIsMobileDevice] = useState(false);
  const { sendTransaction } = usePrivy();
  const { setShouldUpdate } = useCategory();

  const videoRef = useRef<Webcam>(null);
  const [imageBlob, setImageBlob] = useState<Blob | null>(null);
  console.log("🚀 ~ CameraRender ~ imageBlob:", imageBlob);
  const { wallets } = useWallets();

  const [imgSrc, setImgSrc] = useState<string | null>(null);
  const [facingMode, setFacingMode] = useState<"environment" | "user">(
    "environment"
  );

  const handleCapture = useCallback(async () => {
    if (!videoRef.current) return;
    const imageSrc = videoRef.current.getScreenshot();
    // @ts-ignore
    const blob = await fetch(imageSrc).then((r) => r.blob());
    setImageBlob(blob);
    setImgSrc(imageSrc);
  }, [videoRef]);

  const handleRetake = () => {
    setImgSrc(null);
  };

  const handleSwitchCamera = () => {
    setFacingMode((prev) => (prev === "environment" ? "user" : "environment"));
  };

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

  const onUpload = async (originalBlob: Blob): Promise<void> => {
    if (w) {
      setIsUploading(true);
      await uploadImage(originalBlob, w, sendTransaction, category);
      router.push("/feed");
      setIsUploading(false);
      // @ts-ignore
      setShouldUpdate((prev: number) => prev + 1);
      uploadCallback && uploadCallback();
    }
  };

  return (
    <div className="p-4 flex flex-col items-center justify-center">
      {!imgSrc ? (
        <>
          <div className="rounded-3xl overflow-hidden bg-white shadow-xl max-h-[265px] lg:max-h-full">
            <Webcam
              audio={false}
              ref={videoRef}
              screenshotFormat="image/jpeg"
              videoConstraints={{
                facingMode,
              }}
              className="w-full max-h-[265px]"
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
                onClick={handleSwitchCamera}
              >
                <SwitchCamera />
              </button>
            )}
          </div>
        </>
      ) : (
        <>
          <div className="rounded-3xl overflow-hidden bg-black shadow-xl max-h-[265px] lg:max-h-full">
            <img
              src={imgSrc}
              alt="Preview"
              // className="px-2 py-2 rounded-xl"
            />
          </div>

          {category ? (
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
                {isUploading ? (
                  <Loader2 className="animate-spin" />
                ) : (
                  <Upload />
                )}
              </button>
            </div>
          ) : (
            <div className="w-full mt-4">
              <ComboboxDemo setValue={setCategory} value={category} />
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default CameraRender;
