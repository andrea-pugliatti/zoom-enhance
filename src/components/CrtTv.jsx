import Overlay from "./Overlay";

export default function CrtTv({
	currentImage,
	containerRef,
	handleImageClick,
	enhanceCount,
	rect,
	isZooming,
	ratio,
	zoomLevel,
	offset,
}) {
	return (
		<div className="crt-tv">
			<button
				type="button"
				ref={containerRef}
				onClick={handleImageClick}
				onKeyDown={handleImageClick}
				className="screen-tv"
			>
				<Overlay />

				{enhanceCount >= 3 ? (
					<div className="video-tv">
						<iframe
							width="100%"
							height="100%"
							src="https://www.youtube.com/embed/dQw4w9WgXcQ?autoplay=1"
							title="YouTube video player"
							allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
							allowFullScreen
						/>
					</div>
				) : currentImage ? (
					<div className="image-tv">
						<div
							className="image-container"
							style={{
								transform: `translate(${offset.x}px, ${offset.y}px) scale(${zoomLevel})`,
								transformOrigin: "0 0",
							}}
						>
							<img src={currentImage} alt="Evidence" />
						</div>
					</div>
				) : (
					<div className="text-tv">NO SIGNAL</div>
				)}

				{rect && isZooming && (
					<div
						className="zoom-rect"
						style={{
							left: rect.x,
							top: rect.y,
							width: rect.w * ratio,
							height: rect.h,
						}}
					>
						<div className="zoom-text">TARGET ACQUIRED</div>
					</div>
				)}
			</button>
		</div>
	);
}
