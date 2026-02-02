import LaserGrid from "./LaserGrid";

export default function InfoBox({
	isZooming,
	rect,
	enhanceCount,
	handleImageUpload,
	resetAll,
}) {
	return (
		<div className="info-box">
			<div>
				<h1 className="title">CSI: ZOOM</h1>
				<p className="subtitle">Image Enhancement Suite v4.0.2</p>
			</div>

			<div className="info">
				<div className="darker-text">STATUS</div>
				<div>{isZooming ? "ENHANCING" : "READY"}</div>
				<div className="darker-text">COORDINATES</div>
				<div>
					{rect ? `(${Math.round(rect.x)},${Math.round(rect.y)})` : "(0,0)"}
				</div>
				<div className="darker-text">ENHANCE LEVEL</div>
				<div>{enhanceCount} / 3</div>
				<div className="darker-text">FREQUENCY</div>
				<div>44.1 KHZ</div>
			</div>

			<LaserGrid />

			<div className="buttons">
				<label className="block">
					<input
						type="file"
						onChange={handleImageUpload}
						className="hidden"
						accept="image/*"
					/>
					<div className="import-button">IMPORT EVIDENCE</div>
				</label>

				<button type="button" onClick={resetAll} className="reset-button">
					RESET PROGRAM
				</button>

				<div className="instructions">
					<div className="instructions-title">INSTRUCTIONS:</div>
					Click any region on the display to trigger localized image
					reconstruction and AI-assisted sharpening.
				</div>
			</div>
		</div>
	);
}
