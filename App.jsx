import React, { useState, useEffect } from 'react';
import { Box, Text, useInput, useApp } from 'ink';
import TextInput from 'ink-text-input';
import Gradient from 'ink-gradient';
import BigText from 'ink-big-text';

// ============================================================================
// PLANET DATA
// gravity  — surface gravity in m/s²      (weight formula)
// orbit    — orbital period in Earth years (age formula)
// fact     — fun fact shown on results
// color    — accent color used for borders / labels
// ============================================================================
const PLANETS = [
	{
		name:    'Mars',
		value:   'mars',
		gravity: 3.71,
		orbit:   1.88,
		fact:    "Bring a coat - it's about -60C!",
		color:   'red',
	},
	{
		name:    'Jupiter',
		value:   'jupiter',
		gravity: 24.79,
		orbit:   11.86,
		fact:    "You're a heavyweight on this gas giant!",
		color:   'yellow',
	},
	{
		name:    'Moon',
		value:   'moon',
		gravity: 1.62,
		orbit:   0.074,
		fact:    'Perfect for giant leaps!',
		color:   'white',
	},
	{
		name:    'Venus',
		value:   'venus',
		gravity: 8.87,
		orbit:   0.61,
		fact:    'Watch out for the acid rain!',
		color:   'magenta',
	},
];

// ============================================================================
// COMPONENT: BootSequence
// Sequentially reveals loading messages with a small delay between each,
// then calls onComplete so the app moves to the input phase.
// ============================================================================
const BootSequence = ({ onComplete }) => {
	const [shown, setShown]   = useState([]);
	const [index, setIndex]   = useState(0);

	const lines = [
		'[ OK ] INITIALIZING ASTRONEX...',
		'[ OK ] LOADING PLANETARY DATABASE...',
		'[ OK ] CONNECTING TO SATELLITE NETWORK...',
		'[ OK ] CALIBRATING GRAVITY SENSORS...',
		'[ ** ] READY FOR MISSION — WELCOME, ASTRONAUT!',
	];

	useEffect(() => {
		if (index < lines.length) {
			const t = setTimeout(() => {
				setShown(prev => [...prev, lines[index]]);
				setIndex(i => i + 1);
			}, 380);
			return () => clearTimeout(t);
		} else {
			const t = setTimeout(onComplete, 600);
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
			{index < lines.length && (
				<Text color="yellow">{'▓'.repeat(index + 1)}</Text>
			)}
		</Box>
	);
};

// ============================================================================
// COMPONENT: Header
// Big gradient "ASTRONEX" title + decorative subtitle box.
// ============================================================================
const Header = () => (
	<Box flexDirection="column" alignItems="center" marginBottom={1}>
		<Gradient name="teen">
			<BigText text="ASTRONEX" font="block" />
		</Gradient>
		<Text bold color="cyan">{'╔══════════════════════════════════════╗'}</Text>
		<Text bold color="cyan">{'║        PLANETARY  CALCULATOR         ║'}</Text>
		<Text bold color="cyan">{'╚══════════════════════════════════════╝'}</Text>
	</Box>
);

// ============================================================================
// COMPONENT: InputPhase
// Two-step form: age first, then weight.
// ink-text-input handles raw keyboard capture; we just track state here.
// ============================================================================
const InputPhase = ({ age, setAge, weight, setWeight, onComplete }) => {
	const [step, setStep] = useState('age');

	const handleAgeSubmit = (val) => {
		if (!isNaN(parseFloat(val)) && parseFloat(val) > 0) setStep('weight');
	};

	const handleWeightSubmit = (val) => {
		if (!isNaN(parseFloat(val)) && parseFloat(val) > 0) onComplete();
	};

	return (
		<Box flexDirection="column" gap={1} paddingLeft={2}>
			<Text bold color="magenta">{'━'.repeat(42)}</Text>
			<Text bold color="yellow">  MISSION DATA ENTRY</Text>
			<Text bold color="magenta">{'━'.repeat(42)}</Text>

			{/* Age field */}
			<Box flexDirection="column">
				<Text color={step === 'age' ? 'green' : 'gray'}>
					{step === 'age' ? '▸' : '✓'} Earth Age (years):
					{step !== 'age' && <Text color="white">  {age}</Text>}
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

			{/* Weight field */}
			<Box flexDirection="column">
				<Text color={step === 'weight' ? 'green' : 'gray'}>
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
// Shows each planet in a list. Arrow keys / j/k navigate, ENTER or 1-4 selects.
// ============================================================================
const PlanetList = ({ onSelect }) => {
	const [idx, setIdx] = useState(0);

	useInput((input, key) => {
		if (key.upArrow || input === 'k') {
			setIdx(prev => (prev === 0 ? PLANETS.length - 1 : prev - 1));
		} else if (key.downArrow || input === 'j') {
			setIdx(prev => (prev === PLANETS.length - 1 ? 0 : prev + 1));
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
			<Text bold color="yellow">  SELECT YOUR DESTINATION PLANET</Text>
			<Text color="cyan">  Use arrow keys or j/k to navigate</Text>
			<Text color="cyan">  Press ENTER to confirm or 1-4 to quick-pick</Text>
			<Text bold color="magenta">{'━'.repeat(42)}</Text>

			{PLANETS.map((planet, i) => {
				const selected = i === idx;

				return (
					<Box
						key={planet.value}
						flexDirection="column"
						borderStyle={selected ? 'bold' : 'single'}
						borderColor={selected ? planet.color : 'gray'}
						paddingX={1}
						paddingY={0}
					>
						<Text color={selected ? planet.color : 'white'} bold={selected}>
							{selected ? '► ' : '  '}{i + 1}. {planet.name}
						</Text>
						<Text color="gray">    Gravity: {planet.gravity} m/s²  |  Orbit: {planet.orbit} Earth years</Text>
						{selected && (
							<Text color="green" dimColor>    Press ENTER to select</Text>
						)}
					</Box>
				);
			})}
		</Box>
	);
};

// ============================================================================
// COMPONENT: Results
// Final mission readout with calculated weight and age.
// Press ENTER or Q to exit, B to go back to planet selection.
// ============================================================================
const Results = ({ age, weight, planet, onBack }) => {
	const { exit } = useApp();

	// weight formula: (earthWeight / 9.81) * planetGravity
	const newWeight = ((parseFloat(weight) / 9.81) * planet.gravity).toFixed(2);
	// age formula: earthAge / planetOrbitalPeriod
	const newAge    = (parseFloat(age)    / planet.orbit).toFixed(2);

	useInput((input, key) => {
		if (input === 'q' || input === 'Q') {
			exit();
		} else if (input === 'b' || input === 'B') {
			onBack();
		}
	});

	return (
		<Box flexDirection="column" alignItems="center" paddingX={2}>
			<Text bold color="magenta">{'━'.repeat(44)}</Text>
			<Text bold color="yellow">      ★  MISSION RESULTS  ★</Text>
			<Text bold color="magenta">{'━'.repeat(44)}</Text>

			<Box
				borderStyle="round"
				borderColor={planet.color}
				flexDirection="column"
				paddingX={3}
				paddingY={1}
				marginTop={1}
				width={42}
			>
				<Text bold color="white">
					DESTINATION: <Text color={planet.color} bold>{planet.name.toUpperCase()}</Text>
				</Text>

				<Text>{'─'.repeat(32)}</Text>

				<Text color="cyan">
					Earth Age:    <Text color="white">{age} years</Text>
				</Text>
				<Text color="cyan">
					Age on {planet.name}:  <Text color="green" bold>{newAge} years</Text>
				</Text>

				<Text>{'─'.repeat(32)}</Text>

				<Text color="cyan">
					Earth Weight: <Text color="white">{weight} kg</Text>
				</Text>
				<Text color="cyan">
					Weight on {planet.name}: <Text color="green" bold>{newWeight} kg</Text>
				</Text>
			</Box>

			{/* Fun fact */}
			<Box marginTop={1} borderStyle="bold" borderColor="yellow" paddingX={2}>
				<Text color="yellow">💡 {planet.fact}</Text>
			</Box>

			<Text bold color="green" marginTop={1}>MISSION COMPLETE! Safe travels, Astronaut!</Text>
			<Text dimColor>Press Q to exit  |  Press B to go back</Text>
		</Box>
	);
};

// ============================================================================
// MAIN COMPONENT: App
// Simple state-machine:  booting → input → select → results
// ============================================================================
const App = () => {
	const [phase, setPhase]             = useState('booting');
	const [age, setAge]                 = useState('');
	const [weight, setWeight]           = useState('');
	const [selectedPlanet, setSelected] = useState(null);

	const handlePlanetSelect = (planet) => {
		setSelected(planet);
		setPhase('results');
	};

	const handleGoBack = () => {
		setPhase('select');
	};

	return (
		<Box flexDirection="column" paddingTop={1}>
			{phase !== 'booting' && <Header />}

			{phase === 'booting' && (
				<BootSequence onComplete={() => setPhase('input')} />
			)}

			{phase === 'input' && (
				<InputPhase
					age={age}       setAge={setAge}
					weight={weight} setWeight={setWeight}
					onComplete={() => setPhase('select')}
				/>
			)}

			{phase === 'select' && (
				<PlanetList onSelect={handlePlanetSelect} />
			)}

			{phase === 'results' && selectedPlanet && (
				<Results
					age={age} weight={weight}
					planet={selectedPlanet}
					onBack={handleGoBack}
				/>
			)}
		</Box>
	);
};

export default App;
