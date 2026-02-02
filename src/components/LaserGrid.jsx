export default function LaserGrid() {
	return (
		<div className="grid">
			{[...Array(9)].map((_, i) => (
				<div key={`line-${Math.random() * 100}-${i}`} className="line">
					<div
						className="pulse"
						style={{
							animationDelay: `${i * 0.1}s`,
							width: `${Math.random() * 100}%`,
						}}
					/>
				</div>
			))}
		</div>
	);
}
