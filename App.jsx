import React, { useState, useEffect } from 'react';
import { Box, Text, useInput, useApp } from 'ink';
import TextInput from 'ink-text-input';
import Gradient from 'ink-gradient';
import BigText from 'ink-big-text';

// ============================================================================
// PLANET DATA
// Each planet has:
//   gravity  - surface gravity in m/s²  (used for weight calculation)
//   orbit    - orbital period in Earth years (used for age calculation)
//   fact     - a fun fact shown on the results screen
//   ascii    - a small ASCII art drawing of the planet
// ============================================================================
const PLANETS = [
	{
		name: 'Mars',
		value: 'mars',
		gravity: 3.71,
		orbit: 1.88,
		fact: "Bring a coat — it's about -60°C!",
		color: 'red',
		ascii: [
			'   .-"""-.  ',
			'  /  O  O  \\',
			' |   \\___/  |',
			'  \\ ~~~~~~ / ',
			'   `------\'  ',
		],
	},
	{
		name: 'Jupiter',
		value: 'jupiter',
		gravity: 24.79,
		orbit: 11.86,
		fact: "You're a heavyweight on this gas giant!",
		color: 'yellow',
		ascii: [
			'  .--------. ',
			' /  ~~~~~~  \\',
			'|  ~  ()  ~  |',
			' \\  ~~~~~~  /',
			'  `--------\' ',
		],
	},
	{
		name: 'Moon',
		value: 'moon',
		gravity: 1.62,
		orbit: 0.074,
		fact: 'Perfect for giant leaps!',
		color: 'white',
		ascii: [
			'    .----.   ',
			'   / .--. \\  ',
			'  | (    ) | ',
			'   \\ `--\' /  ',
			'    `----\'   ',
		],
	},
	{
		name: 'Venus',
		value: 'venus',
		gravity: 8.87,
		orbit: 0.61,
		fact: 'Watch out for the acid rain!',
		color: 'magenta',
		ascii: [
			'   .------.  ',
			'  /  *  *  \\ ',
			' | * Venus * |',
			'  \\  *  *  / ',
			'   `------\'  ',
		],
	},
];

// ============================================================================
// COMPONENT: BootSequence
// Displays a series of animated "loading" messages one by one using
// setTimeout so it feels like a real spaceship computer booting up.
// Props:
//   onComplete — called when all messages have been shown
// ============================================================================
const BootSequence = ({ onComplete }) => {
	const [shown, setShown] = useState([]);
	const [index, setIndex] = useState(0);

	const lines = [
		'[ OK ] INITIALIZING ASTRO-CALC 9000...',
		'[ OK ] LOADING PLANETARY DATABASE...',
		'[ OK ] CONNECTING TO SATELLITE NETWORK...',
		'[ OK ] CALIBRATING GRAVITY SENSORS...',
		'[ ** ] READY FOR MISSION — WELCOME, ASTRONAUT!',
	];

	useEffect(() => {
		if (index < lines.length) {
			const t = setTimeout(() => {
				setShown((prev) => [...prev, lines[index]]);
				setIndex((i) => i + 1);
			}, 380);
			return () => clearTimeout(t);
		} else {
			const t = setTimeout(onComplete, 700);
			return () => clearTimeout(t);
		}
	}, [index]);

	return (
		<Box flexDirection="column" paddingLeft={2} paddingTop={1}>
			{shown.map((line, i) => (
				<Text key={i} color={i === shown.length - 1 && index >= lines.length ? 'green' : 'cyan'}>
					{line}
				</Text>
			))}
			{index < lines.length && <Text color="yellow">{'▓'.repeat(index + 1)}</Text>}
		</Box>
	);
};

// ============================================================================
// COMPONENT: Header
// Big gradient ASCII title + subtitle box drawn with box-drawing characters.
// ============================================================================
const Header = () => (
	<Box flexDirection="column" alignItems="center" marginBottom={1}>
		<Gradient name="teen">
			<BigText text="ASTRO-CALC" font="block" />
		</Gradient>
		<Text bold color="cyan">{'╔══════════════════════════════════════╗'}</Text>
		<Text bold color="cyan">{'║        9000  ·  SPACE  EDITION       ║'}</Text>
		<Text bold color="cyan">{'╚══════════════════════════════════════╝'}</Text>
	</Box>
);

// ============================================================================
// COMPONENT: InputPhase
// Two-step form: first collect age, then weight.
// Uses ink-text-input which handles raw keyboard input for us.
// Props:
//   age, setAge, weight, setWeight — state lifted to App
//   onComplete — called when both values are valid
// ============================================================================
const InputPhase = ({ age, setAge, weight, setWeight, onComplete }) => {
	// 'age' | 'weight' — which field is currently active
	const [step, setStep] = useState('age');

	const handleAgeSubmit = (val) => {
		const n = parseFloat(val);
		if (!isNaN(n) && n > 0) setStep('weight');
	};

	const handleWeightSubmit = (val) => {
		const n = parseFloat(val);
		if (!isNaN(n) && n > 0) onComplete();
	};

	return (
		<Box flexDirection="column" gap={1} paddingLeft={2}>
			<Text bold color="magenta">{'━'.repeat(42)}</Text>
			<Text bold color="yellow">  MISSION DATA ENTRY</Text>
			<Text bold color="magenta">{'━'.repeat(42)}</Text>

			{/* ── Age input ───────────────────────────────── */}
			<Box flexDirection="column">
				<Text color={step === 'age' ? 'green' : 'gray'}>
					{step === 'age' ? '▸' : '✓'} Earth Age (years):
					{step !== 'age' && <Text color="white"> {age}</Text>}
				</Text>
				{step === 'age' && (
					<Box>
						<Text color="green">  {'> '}</Text>
						<TextInput
							value={age}
							onChange={setAge}
							onSubmit={handleAgeSubmit}
							placeholder="type your age and press ENTER"
						/>
					</Box>
				)}
			</Box>

			{/* ── Weight input ─────────────────────────────── */}
			<Box flexDirection="column">
				<Text color={step === 'weight' ? 'green' : step === 'age' ? 'gray' : 'gray'}>
					{step === 'weight' ? '▸' : '○'} Earth Weight (kg):
				</Text>
				{step === 'weight' && (
					<Box>
						<Text color="green">  {'> '}</Text>
						<TextInput
							value={weight}
							onChange={setWeight}
							onSubmit={handleWeightSubmit}
							placeholder="type your weight and press ENTER"
						/>
					</Box>
				)}
			</Box>
		</Box>
	);
};

// ============================================================================
// COMPONENT: PlanetList
// Shows all planets with ASCII art. Arrow keys / j/k move the selection,
// ENTER confirms. The highlighted planet gets a bold green border.
// Props:
//   onSelect(planet) — called when user confirms a planet
// ============================================================================
const PlanetList = ({ onSelect }) => {
	const [idx, setIdx] = useState(0);

	// useInput is the correct ink hook for keyboard input — it requires
	// raw mode which our patched stdin in index.js enables permanently.
	useInput((input, key) => {
		if (key.upArrow || input === 'k') {
			setIdx((prev) => (prev === 0 ? PLANETS.length - 1 : prev - 1));
		} else if (key.downArrow || input === 'j') {
			setIdx((prev) => (prev === PLANETS.length - 1 ? 0 : prev + 1));
		} else if (key.return) {
			onSelect(PLANETS[idx]);
		} else if (['1', '2', '3', '4'].includes(input)) {
			const i = parseInt(input, 10) - 1;
			setIdx(i);
			onSelect(PLANETS[i]);
		}
	});

	return (
		<Box flexDirection="column" paddingLeft={2} gap={1}>
			<Text bold color="magenta">{'━'.repeat(42)}</Text>
			<Text bold color="yellow">  SELECT DESTINATION PLANET</Text>
			<Text color="cyan">  ↑ ↓  or  j / k  to move  ·  ENTER to confirm  ·  1-4 to pick instantly</Text>
			<Text bold color="magenta">{'━'.repeat(42)}</Text>

			{PLANETS.map((planet, i) => {
				const selected = i === idx;
				return (
					<Box
						key={planet.value}
						flexDirection="row"
						borderStyle={selected ? 'bold' : 'single'}
						borderColor={selected ? 'green' : 'gray'}
						paddingX={1}
						marginBottom={0}
					>
						{/* Left: selector + name */}
						<Box flexDirection="column" width={16} justifyContent="center">
							<Text color={selected ? 'green' : 'white'} bold={selected}>
								{selected ? '► ' : '  '}{i + 1}. {planet.name}
							</Text>
							{selected && (
								<Text color="green" dimColor>
									{'  press ENTER'}
								</Text>
							)}
						</Box>

						{/* Right: ASCII art */}
						<Box flexDirection="column">
							{planet.ascii.map((line, li) => (
								<Text key={li} color={selected ? planet.color : 'gray'}>
									{line}
								</Text>
							))}
						</Box>
					</Box>
				);
			})}
		</Box>
	);
};

// ============================================================================
// COMPONENT: Results
// Displays the final mission readout inside a rounded box.
// Calculations:
//   weight = (earthWeight / 9.81) * planet.gravity
//   age    = earthAge / planet.orbit
// Props:
//   age, weight — strings from user input
//   planet      — the selected PLANETS entry
// ============================================================================
const Results = ({ age, weight, planet }) => {
	const { exit } = useApp();

	const newWeight = ((parseFloat(weight) / 9.81) * planet.gravity).toFixed(2);
	const newAge    = (parseFloat(age) / planet.orbit).toFixed(2);

	// Quit on any key press after results are shown
	useInput((input, key) => {
		if (key.return || input === 'q' || key.escape) exit();
	});

	return (
		<Box flexDirection="column" alignItems="center" paddingX={2}>
			<Text bold color="magenta">{'━'.repeat(44)}</Text>
			<Text bold color="yellow">      ★  MISSION RESULTS  ★</Text>
			<Text bold color="magenta">{'━'.repeat(44)}</Text>

			{/* Main result box */}
			<Box
				borderStyle="round"
				borderColor="cyan"
				flexDirection="column"
				paddingX={3}
				paddingY={1}
				marginTop={1}
				width={44}
			>
				<Text bold color="white">
					DESTINATION: <Text color={planet.color} bold>{planet.name.toUpperCase()}</Text>
				</Text>

				<Text>{'─'.repeat(36)}</Text>

				<Text color="cyan">
					{'Earth Age:   '}<Text color="white">{age} years</Text>
				</Text>
				<Text color="cyan">
					{'Age on ' + planet.name + ':  '}<Text color="green" bold>{newAge} years</Text>
				</Text>

				<Text>{'─'.repeat(36)}</Text>

				<Text color="cyan">
					{'Earth Weight:'}<Text color="white">  {weight} kg</Text>
				</Text>
				<Text color="cyan">
					{'Weight on ' + planet.name + ':'}<Text color="green" bold>  {newWeight} kg</Text>
				</Text>
			</Box>

			{/* Fun fact */}
			<Box
				marginTop={1}
				borderStyle="bold"
				borderColor="yellow"
				paddingX={2}
				paddingY={0}
				width={44}
			>
				<Text color="yellow">💡 {planet.fact}</Text>
			</Box>

			<Text bold color="green" marginTop={1}>
				MISSION COMPLETE! Safe travels, Astronaut!
			</Text>
			<Text dimColor>Press ENTER or Q to exit</Text>
		</Box>
	);
};

// ============================================================================
// MAIN COMPONENT: App
// State machine with four phases:
//   booting → input → select → results
// ============================================================================
const App = () => {
	const [phase, setPhase]               = useState('booting');
	const [age, setAge]                   = useState('');
	const [weight, setWeight]             = useState('');
	const [selectedPlanet, setSelected]   = useState(null);

	const handlePlanetSelect = (planet) => {
		setSelected(planet);
		setPhase('results');
	};

	return (
		<Box flexDirection="column" paddingTop={1}>
			{/* Header is shown on every screen except the boot screen */}
			{phase !== 'booting' && <Header />}

			{phase === 'booting' && (
				<BootSequence onComplete={() => setPhase('input')} />
			)}

			{phase === 'input' && (
				<InputPhase
					age={age}
					setAge={setAge}
					weight={weight}
					setWeight={setWeight}
					onComplete={() => setPhase('select')}
				/>
			)}

			{phase === 'select' && (
				<PlanetList onSelect={handlePlanetSelect} />
			)}

			{phase === 'results' && selectedPlanet && (
				<Results age={age} weight={weight} planet={selectedPlanet} />
			)}
		</Box>
	);
};

export default App;
