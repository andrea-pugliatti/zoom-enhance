import { x2 } from "@upscalerjs/esrgan-slim";
import { useMemo, useRef, useState } from "react";
import Upscaler from "upscaler";
import CrtTv from "./CrtTv";
import InfoBox from "./InfoBox";

export default function ZoomEnhance() {
	const [currentImage, setCurrentImage] = useState(null);
	const [enhanceCount, setEnhanceCount] = useState(0);
	const [isZooming, setIsZooming] = useState(false);
	const [rect, setRect] = useState(null);
	const [zoomLevel, setZoomLevel] = useState(1);
	const [offset, setOffset] = useState({ x: 0, y: 0 });
	const [ratio, setRatio] = useState(null);

	const containerRef = useRef(null);

	const resetAll = () => {
		setCurrentImage(null);
		setEnhanceCount(0);
		setZoomLevel(1);
		setOffset({ x: 0, y: 0 });
		setRect(null);
		setIsZooming(false);
	};

	const upscaler = useMemo(
		() =>
			new Upscaler({
				model: x2,
			}),
		[],
	);

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

	const playSound = (freq, type, duration) => {
		try {
			const audioCtx = new window.AudioContext();
			const oscillator = audioCtx.createOscillator();
			const gainNode = audioCtx.createGain();

			oscillator.type = type;
			oscillator.frequency.setValueAtTime(freq, audioCtx.currentTime);

			gainNode.gain.setValueAtTime(0.03, audioCtx.currentTime);
			gainNode.gain.exponentialRampToValueAtTime(
				0.01,
				audioCtx.currentTime + duration,
			);

			oscillator.connect(gainNode);
			gainNode.connect(audioCtx.destination);

			oscillator.start();
			oscillator.stop(audioCtx.currentTime + duration);
		} catch (e) {
			console.error("Audio not supported: ", e);
		}
	};

	const handleImageClick = async (e) => {
		if (!currentImage || isZooming || !containerRef.current) return;

		const container = containerRef.current;
		const rect = container.getBoundingClientRect();
		const x = e.clientX - rect.left;
		const y = e.clientY - rect.top;

		const w = 120;
		const h = 120;

		const cropX = Math.max(0, Math.min(x - w / 1.4, container.clientWidth - w));
		const cropY = Math.max(
			0,
			Math.min(y - h / 1.6, container.clientHeight - h),
		);

		setRect({ x: cropX, y: cropY, w, h });
		setIsZooming(true);
		setZoomLevel(1);
		setOffset({ x: 0, y: 0 });

		const interval = setInterval(
			() => playSound(Math.random() * 400 + 400, "square", 0.05),
			100,
		);

		setTimeout(async () => {
			clearInterval(interval);
			playSound(200, "sawtooth", 0.5);

			const scale = container.clientWidth / w;
			setZoomLevel(scale);
			setOffset({ x: -cropX * scale, y: -cropY * scale });

			const enhanceInterval = setInterval(
				() => playSound(800 + Math.random() * 200, "sine", 0.1),
				150,
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
						canvas.height,
					);

					if (upscaler) {
						const upscaled = await upscaler.upscale(canvas.toDataURL());
						setCurrentImage(upscaled);
						setZoomLevel(1);
						setOffset({ x: 0, y: 0 });
						setRect(null);
						setEnhanceCount((prev) => prev + 1);
					}
				}
			} catch (err) {
				console.error("Enhancement failed", err);
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
				/>
			</div>
		</div>
	);
}
