import { useEffect, useRef, useState } from "react";
import CrtTv from "./CrtTv";
import InfoBox from "./InfoBox";
import { getRawImage, loadUpscaler } from "../utils/upscaler";
import playSound from "../utils/sound";

export default function ZoomEnhance() {
  const [currentImage, setCurrentImage] = useState(null);
  const [enhanceCount, setEnhanceCount] = useState(0);
  const [isZooming, setIsZooming] = useState(false);
  const [rect, setRect] = useState(null);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [ratio, setRatio] = useState(null);
  const [modelStatus, setModelStatus] = useState("loading");

  const containerRef = useRef(null);

  useEffect(() => {
    let cancelled = false;
    loadUpscaler()
      .then(() => {
        if (!cancelled) setModelStatus("ready");
      })
      .catch((err) => {
        console.error("Upscaler failed to load:", err);
        if (!cancelled) setModelStatus("error");
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const resetAll = () => {
    setCurrentImage(null);
    setEnhanceCount(0);
    setZoomLevel(1);
    setOffset({ x: 0, y: 0 });
    setRect(null);
    setIsZooming(false);
  };

  const upscaleImage = async (canvas, ctx) => {
    const [upscaler, RawImage] = await Promise.all([loadUpscaler(), getRawImage()]);
    const input = await RawImage.fromCanvas(canvas);
    const output = await upscaler(input);
    const image = Array.isArray(output) ? output[0] : output;

    const rgba = new Uint8ClampedArray(image.width * image.height * 4);
    const src = image.data;
    const channels = image.channels ?? 3;
    for (let i = 0, j = 0; i < src.length; i += channels, j += 4) {
      rgba[j] = src[i];
      rgba[j + 1] = channels > 1 ? src[i + 1] : src[i];
      rgba[j + 2] = channels > 2 ? src[i + 2] : src[i];
      rgba[j + 3] = channels === 4 ? src[i + 3] : 255;
    }
    ctx.putImageData(new ImageData(rgba, image.width, image.height), 0, 0);

    return canvas.toDataURL();
  };

  const handleImageUpload = (e) => {
    const file = e.target.files?.[0];
    const url = URL.createObjectURL(file);
    const img = new Image();

    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        img.onload = () => {
          setRatio(img.width / img.height);
          URL.revokeObjectURL(url);
        };

        img.onerror = () => {
          URL.revokeObjectURL(url);
        };

        img.src = url;

        setCurrentImage(event.target?.result);
        setZoomLevel(1);
        setOffset({ x: 0, y: 0 });
        setRect(null);
        setEnhanceCount(0);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleImageClick = async (e) => {
    if (!currentImage || isZooming || !containerRef.current || modelStatus !== "ready") return;

    const container = containerRef.current;
    const rect = container.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const w = 120;
    const h = 120;

    const cropX = Math.max(0, Math.min(x - w / 1.4, container.clientWidth - w));
    const cropY = Math.max(0, Math.min(y - h / 1.6, container.clientHeight - h));

    setRect({ x: cropX, y: cropY, w, h });
    setIsZooming(true);
    setZoomLevel(1);
    setOffset({ x: 0, y: 0 });

    const interval = setInterval(() => playSound(Math.random() * 400 + 400, "square", 0.05), 100);

    setTimeout(async () => {
      clearInterval(interval);
      playSound(200, "sawtooth", 0.5);

      const scale = container.clientWidth / w;
      setZoomLevel(scale);
      setOffset({ x: -cropX * scale, y: -cropY * scale });

      const enhanceInterval = setInterval(
        () => playSound(800 + Math.random() * 200, "sine", 0.1),
        150
      );

      try {
        const img = new Image();
        img.src = currentImage;
        await img.decode();

        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");

        if (ctx) {
          const scaleX = img.naturalWidth / container.clientWidth;
          const scaleY = img.naturalHeight / container.clientHeight;

          canvas.width = w * scaleX;
          canvas.height = h * scaleY;

          ctx.drawImage(
            img,
            cropX * scaleX,
            cropY * scaleY,
            w * scaleX,
            h * scaleY,
            0,
            0,
            canvas.width,
            canvas.height
          );

          const upscaled = await upscaleImage(canvas, ctx);
          setCurrentImage(upscaled);
          setZoomLevel(1);
          setOffset({ x: 0, y: 0 });
          setRect(null);
          setEnhanceCount((prev) => prev + 1);
        }
      } catch (err) {
        console.error("Enhancement failed: ", err);
      } finally {
        clearInterval(enhanceInterval);
        setIsZooming(false);
        playSound(1200, "sine", 0.3);
      }
    }, 1500);
  };

  return (
    <div className="main-container">
      <div className="columns">
        <CrtTv
          currentImage={currentImage}
          enhanceCount={enhanceCount}
          rect={rect}
          ratio={ratio}
          zoomLevel={zoomLevel}
          offset={offset}
          isZooming={isZooming}
          containerRef={containerRef}
          handleImageClick={handleImageClick}
        />

        <InfoBox
          isZooming={isZooming}
          rect={rect}
          enhanceCount={enhanceCount}
          handleImageUpload={handleImageUpload}
          resetAll={resetAll}
          modelStatus={modelStatus}
        />
      </div>
    </div>
  );
}
