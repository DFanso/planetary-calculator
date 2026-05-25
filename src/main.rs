use std::io::{self, stdout, Stdout};
use std::time::{Duration, Instant};

use crossterm::{
    event::{self, Event, KeyCode, KeyEventKind, KeyModifiers},
    execute,
    terminal::{disable_raw_mode, enable_raw_mode, EnterAlternateScreen, LeaveAlternateScreen},
};
use ratatui::{
    backend::CrosstermBackend,
    layout::{Alignment, Constraint, Direction, Layout, Rect},
    style::{Color, Modifier, Style},
    text::{Line, Span},
    widgets::{Block, BorderType, Borders, Paragraph},
    Frame, Terminal,
};

// ─── PLANET DATA ───────────────────────────────────────────────────────────
struct Planet {
    name: &'static str,
    gravity: f64,
    orbit: f64,
    fact: &'static str,
    color: Color,
}

const PLANETS: &[Planet] = &[
    Planet {
        name: "Mars",
        gravity: 3.71,
        orbit: 1.88,
        fact: "Bring a coat - it's about -60C!",
        color: Color::Red,
    },
    Planet {
        name: "Jupiter",
        gravity: 24.79,
        orbit: 11.86,
        fact: "You're a heavyweight on this gas giant!",
        color: Color::Yellow,
    },
    Planet {
        name: "Moon",
        gravity: 1.62,
        orbit: 0.074,
        fact: "Perfect for giant leaps!",
        color: Color::White,
    },
    Planet {
        name: "Venus",
        gravity: 8.87,
        orbit: 0.61,
        fact: "Watch out for the acid rain!",
        color: Color::Magenta,
    },
];

const BOOT_LINES: &[&str] = &[
    "[ OK ] INITIALIZING ASTRONEX...",
    "[ OK ] LOADING PLANETARY DATABASE...",
    "[ OK ] CONNECTING TO SATELLITE NETWORK...",
    "[ OK ] CALIBRATING GRAVITY SENSORS...",
    "[ ** ] READY FOR MISSION - WELCOME, ASTRONAUT!",
];

const BOOT_TICK_MS: u64 = 380;
const BOOT_FINAL_HOLD_MS: u64 = 600;

const ASTRONEX_LOGO: &[&str] = &[
    " █████  ███████ ████████ ██████   ██████  ███    ██ ███████ ██   ██",
    "██   ██ ██         ██    ██   ██ ██    ██ ████   ██ ██       ██ ██ ",
    "███████ ███████    ██    ██████  ██    ██ ██ ██  ██ █████     ███  ",
    "██   ██      ██    ██    ██   ██ ██    ██ ██  ██ ██ ██       ██ ██ ",
    "██   ██ ███████    ██    ██   ██  ██████  ██   ████ ███████ ██   ██",
];

// ─── STATE ─────────────────────────────────────────────────────────────────
#[derive(PartialEq, Eq, Clone, Copy)]
enum Phase {
    Booting,
    InputAge,
    InputWeight,
    Select,
    Results,
}

struct App {
    phase: Phase,
    boot_index: usize,
    boot_done_at: Option<Instant>,
    last_boot_tick: Instant,
    age: String,
    weight: String,
    selected: usize,
    should_quit: bool,
}

impl App {
    fn new() -> Self {
        Self {
            phase: Phase::Booting,
            boot_index: 0,
            boot_done_at: None,
            last_boot_tick: Instant::now(),
            age: String::new(),
            weight: String::new(),
            selected: 0,
            should_quit: false,
        }
    }

    fn tick(&mut self) {
        if self.phase != Phase::Booting {
            return;
        }
        if self.boot_index < BOOT_LINES.len() {
            if self.last_boot_tick.elapsed() >= Duration::from_millis(BOOT_TICK_MS) {
                self.boot_index += 1;
                self.last_boot_tick = Instant::now();
                if self.boot_index == BOOT_LINES.len() {
                    self.boot_done_at = Some(Instant::now());
                }
            }
        } else if let Some(done_at) = self.boot_done_at {
            if done_at.elapsed() >= Duration::from_millis(BOOT_FINAL_HOLD_MS) {
                self.phase = Phase::InputAge;
            }
        }
    }

    fn reset(&mut self) {
        self.age.clear();
        self.weight.clear();
        self.selected = 0;
        self.phase = Phase::InputAge;
    }

    fn handle_key(&mut self, code: KeyCode) {
        match self.phase {
            Phase::Booting => {}
            Phase::InputAge => self.handle_text_input(code, true),
            Phase::InputWeight => self.handle_text_input(code, false),
            Phase::Select => self.handle_select(code),
            Phase::Results => self.handle_results(code),
        }
    }

    fn handle_text_input(&mut self, code: KeyCode, is_age: bool) {
        let buf = if is_age { &mut self.age } else { &mut self.weight };
        match code {
            KeyCode::Char(c) if c.is_ascii_digit() || c == '.' => {
                if c == '.' && buf.contains('.') {
                    return;
                }
                buf.push(c);
            }
            KeyCode::Backspace => {
                buf.pop();
            }
            KeyCode::Enter => {
                if let Ok(n) = buf.parse::<f64>() {
                    if n > 0.0 {
                        self.phase = if is_age { Phase::InputWeight } else { Phase::Select };
                    }
                }
            }
            _ => {}
        }
    }

    fn handle_select(&mut self, code: KeyCode) {
        match code {
            KeyCode::Up | KeyCode::Char('k') => {
                self.selected = if self.selected == 0 {
                    PLANETS.len() - 1
                } else {
                    self.selected - 1
                };
            }
            KeyCode::Down | KeyCode::Char('j') => {
                self.selected = (self.selected + 1) % PLANETS.len();
            }
            KeyCode::Enter => {
                self.phase = Phase::Results;
            }
            KeyCode::Char(c @ '1'..='4') => {
                let i = (c as u8 - b'1') as usize;
                if i < PLANETS.len() {
                    self.selected = i;
                    self.phase = Phase::Results;
                }
            }
            _ => {}
        }
    }

    fn handle_results(&mut self, code: KeyCode) {
        match code {
            KeyCode::Char('q') | KeyCode::Char('Q') => self.should_quit = true,
            KeyCode::Char('b') | KeyCode::Char('B') => self.phase = Phase::Select,
            KeyCode::Char('r') | KeyCode::Char('R') => self.reset(),
            _ => {}
        }
    }
}

// ─── RENDERING ─────────────────────────────────────────────────────────────
fn ui(f: &mut Frame, app: &App) {
    if app.phase == Phase::Booting {
        render_boot(f, app);
        return;
    }

    let logo_height = ASTRONEX_LOGO.len() as u16 + 4; // logo + subtitle box
    let chunks = Layout::default()
        .direction(Direction::Vertical)
        .margin(1)
        .constraints([
            Constraint::Length(logo_height),
            Constraint::Min(0),
        ])
        .split(f.area());

    render_header(f, chunks[0]);

    match app.phase {
        Phase::InputAge | Phase::InputWeight => render_input(f, chunks[1], app),
        Phase::Select => render_planet_list(f, chunks[1], app),
        Phase::Results => render_results(f, chunks[1], app),
        Phase::Booting => unreachable!(),
    }
}

fn render_boot(f: &mut Frame, app: &App) {
    let mut lines: Vec<Line> = Vec::new();
    for (i, line) in BOOT_LINES.iter().take(app.boot_index).enumerate() {
        let is_last = i == app.boot_index - 1 && app.boot_index == BOOT_LINES.len();
        let color = if is_last { Color::Green } else { Color::Cyan };
        lines.push(Line::from(Span::styled(
            *line,
            Style::default().fg(color).add_modifier(Modifier::BOLD),
        )));
    }
    if app.boot_index < BOOT_LINES.len() {
        let bar = "▓".repeat(app.boot_index + 1);
        lines.push(Line::from(Span::styled(bar, Style::default().fg(Color::Yellow))));
    }
    let para = Paragraph::new(lines);
    let area = Rect {
        x: f.area().x + 2,
        y: f.area().y + 1,
        width: f.area().width.saturating_sub(2),
        height: f.area().height.saturating_sub(1),
    };
    f.render_widget(para, area);
}

fn gradient(t: f64) -> Color {
    // Magenta → cyan teen-style gradient
    let r = (255.0 * (1.0 - t) + 0.0 * t) as u8;
    let g = (60.0 * (1.0 - t) + 220.0 * t) as u8;
    let b = (200.0 * (1.0 - t) + 255.0 * t) as u8;
    Color::Rgb(r, g, b)
}

fn render_header(f: &mut Frame, area: Rect) {
    let logo_width = ASTRONEX_LOGO[0].chars().count();
    let mut logo_lines: Vec<Line> = Vec::with_capacity(ASTRONEX_LOGO.len());
    for row in ASTRONEX_LOGO {
        let mut spans: Vec<Span> = Vec::with_capacity(row.chars().count());
        for (i, ch) in row.chars().enumerate() {
            let t = if logo_width > 1 { i as f64 / (logo_width - 1) as f64 } else { 0.0 };
            spans.push(Span::styled(
                ch.to_string(),
                Style::default().fg(gradient(t)).add_modifier(Modifier::BOLD),
            ));
        }
        logo_lines.push(Line::from(spans));
    }

    logo_lines.push(Line::from(Span::styled(
        "╔══════════════════════════════════════╗",
        Style::default().fg(Color::Cyan).add_modifier(Modifier::BOLD),
    )));
    logo_lines.push(Line::from(Span::styled(
        "║        PLANETARY  CALCULATOR         ║",
        Style::default().fg(Color::Cyan).add_modifier(Modifier::BOLD),
    )));
    logo_lines.push(Line::from(Span::styled(
        "╚══════════════════════════════════════╝",
        Style::default().fg(Color::Cyan).add_modifier(Modifier::BOLD),
    )));

    let para = Paragraph::new(logo_lines).alignment(Alignment::Center);
    f.render_widget(para, area);
}

fn render_input(f: &mut Frame, area: Rect, app: &App) {
    let mut lines: Vec<Line> = Vec::new();
    let sep = "━".repeat(42);
    lines.push(Line::from(Span::styled(
        sep.clone(),
        Style::default().fg(Color::Magenta).add_modifier(Modifier::BOLD),
    )));
    lines.push(Line::from(Span::styled(
        "  MISSION DATA ENTRY",
        Style::default().fg(Color::Yellow).add_modifier(Modifier::BOLD),
    )));
    lines.push(Line::from(Span::styled(
        sep,
        Style::default().fg(Color::Magenta).add_modifier(Modifier::BOLD),
    )));
    lines.push(Line::from(""));

    // Age field
    let age_active = app.phase == Phase::InputAge;
    let age_done = matches!(app.phase, Phase::InputWeight | Phase::Select | Phase::Results);
    let age_marker = if age_active { "▸" } else if age_done { "✓" } else { "○" };
    let age_color = if age_active { Color::Green } else { Color::Gray };

    let mut age_label = vec![Span::styled(
        format!("{} Earth Age (years):", age_marker),
        Style::default().fg(age_color),
    )];
    if age_done {
        age_label.push(Span::styled(
            format!("  {}", app.age),
            Style::default().fg(Color::White),
        ));
    }
    lines.push(Line::from(age_label));

    if age_active {
        let cursor = if (Instant::now().elapsed().as_millis() / 500) % 2 == 0 { "█" } else { " " };
        let display = if app.age.is_empty() {
            Span::styled(
                "type your age and press ENTER",
                Style::default().fg(Color::DarkGray),
            )
        } else {
            Span::styled(app.age.clone(), Style::default().fg(Color::White))
        };
        lines.push(Line::from(vec![
            Span::styled("  > ", Style::default().fg(Color::Green)),
            display,
            Span::styled(cursor, Style::default().fg(Color::Green)),
        ]));
    }

    lines.push(Line::from(""));

    // Weight field
    let weight_active = app.phase == Phase::InputWeight;
    let weight_marker = if weight_active { "▸" } else { "○" };
    let weight_color = if weight_active { Color::Green } else { Color::Gray };
    lines.push(Line::from(Span::styled(
        format!("{} Earth Weight (kg):", weight_marker),
        Style::default().fg(weight_color),
    )));
    if weight_active {
        let cursor = if (Instant::now().elapsed().as_millis() / 500) % 2 == 0 { "█" } else { " " };
        let display = if app.weight.is_empty() {
            Span::styled(
                "type your weight and press ENTER",
                Style::default().fg(Color::DarkGray),
            )
        } else {
            Span::styled(app.weight.clone(), Style::default().fg(Color::White))
        };
        lines.push(Line::from(vec![
            Span::styled("  > ", Style::default().fg(Color::Green)),
            display,
            Span::styled(cursor, Style::default().fg(Color::Green)),
        ]));
    }

    let inner = Rect {
        x: area.x + 2,
        y: area.y,
        width: area.width.saturating_sub(2),
        height: area.height,
    };
    f.render_widget(Paragraph::new(lines), inner);
}

fn render_planet_list(f: &mut Frame, area: Rect, app: &App) {
    // Header block
    let header_lines = vec![
        Line::from(Span::styled(
            "━".repeat(42),
            Style::default().fg(Color::Magenta).add_modifier(Modifier::BOLD),
        )),
        Line::from(Span::styled(
            "  SELECT YOUR DESTINATION PLANET",
            Style::default().fg(Color::Yellow).add_modifier(Modifier::BOLD),
        )),
        Line::from(Span::styled(
            "  Use arrow keys or j/k to navigate",
            Style::default().fg(Color::Cyan),
        )),
        Line::from(Span::styled(
            "  Press ENTER to confirm or 1-4 to quick-pick",
            Style::default().fg(Color::Cyan),
        )),
        Line::from(Span::styled(
            "━".repeat(42),
            Style::default().fg(Color::Magenta).add_modifier(Modifier::BOLD),
        )),
    ];

    // Layout: header + one row per planet
    let mut constraints = vec![Constraint::Length(header_lines.len() as u16 + 1)];
    for _ in PLANETS {
        constraints.push(Constraint::Length(4));
    }
    let chunks = Layout::default()
        .direction(Direction::Vertical)
        .horizontal_margin(2)
        .constraints(constraints)
        .split(area);

    f.render_widget(Paragraph::new(header_lines), chunks[0]);

    for (i, planet) in PLANETS.iter().enumerate() {
        let selected = i == app.selected;
        let border_color = if selected { planet.color } else { Color::DarkGray };
        let title_color = if selected { planet.color } else { Color::White };

        let block = Block::default()
            .borders(Borders::ALL)
            .border_type(if selected { BorderType::Thick } else { BorderType::Plain })
            .border_style(Style::default().fg(border_color));

        let mut lines: Vec<Line> = Vec::new();
        let marker = if selected { "► " } else { "  " };
        let title_style = Style::default().fg(title_color);
        let title_style = if selected { title_style.add_modifier(Modifier::BOLD) } else { title_style };
        lines.push(Line::from(Span::styled(
            format!("{}{}. {}", marker, i + 1, planet.name),
            title_style,
        )));
        lines.push(Line::from(Span::styled(
            format!(
                "  Gravity: {} m/s²  |  Orbit: {} Earth years",
                planet.gravity, planet.orbit
            ),
            Style::default().fg(Color::Gray),
        )));

        let para = Paragraph::new(lines).block(block);
        f.render_widget(para, chunks[i + 1]);
    }
}

fn render_results(f: &mut Frame, area: Rect, app: &App) {
    let planet = &PLANETS[app.selected];
    let earth_age: f64 = app.age.parse().unwrap_or(0.0);
    let earth_weight: f64 = app.weight.parse().unwrap_or(0.0);
    let new_age = earth_age / planet.orbit;
    let new_weight = (earth_weight / 9.81) * planet.gravity;

    // Center column 44 wide
    let total_w: u16 = 46;
    let x_off = area.x + (area.width.saturating_sub(total_w)) / 2;
    let centered = Rect {
        x: x_off,
        y: area.y,
        width: total_w.min(area.width),
        height: area.height,
    };

    let mut lines: Vec<Line> = Vec::new();
    lines.push(Line::from(Span::styled(
        "━".repeat(44),
        Style::default().fg(Color::Magenta).add_modifier(Modifier::BOLD),
    )));
    lines.push(Line::from(Span::styled(
        "      ★  MISSION RESULTS  ★",
        Style::default().fg(Color::Yellow).add_modifier(Modifier::BOLD),
    )));
    lines.push(Line::from(Span::styled(
        "━".repeat(44),
        Style::default().fg(Color::Magenta).add_modifier(Modifier::BOLD),
    )));
    lines.push(Line::from(""));

    let para = Paragraph::new(lines).alignment(Alignment::Center);
    let header_h = 4;
    let header_area = Rect { height: header_h, ..centered };
    f.render_widget(para, header_area);

    // Destination box
    let box_area = Rect {
        x: centered.x,
        y: centered.y + header_h,
        width: centered.width,
        height: 9,
    };
    let dest_block = Block::default()
        .borders(Borders::ALL)
        .border_type(BorderType::Rounded)
        .border_style(Style::default().fg(planet.color));

    let dest_lines = vec![
        Line::from(vec![
            Span::styled("DESTINATION: ", Style::default().fg(Color::White).add_modifier(Modifier::BOLD)),
            Span::styled(
                planet.name.to_uppercase(),
                Style::default().fg(planet.color).add_modifier(Modifier::BOLD),
            ),
        ]),
        Line::from(Span::styled("─".repeat(32), Style::default().fg(Color::DarkGray))),
        Line::from(vec![
            Span::styled("Earth Age:    ", Style::default().fg(Color::Cyan)),
            Span::styled(format!("{} years", app.age), Style::default().fg(Color::White)),
        ]),
        Line::from(vec![
            Span::styled(format!("Age on {}: ", planet.name), Style::default().fg(Color::Cyan)),
            Span::styled(
                format!("{:.2} years", new_age),
                Style::default().fg(Color::Green).add_modifier(Modifier::BOLD),
            ),
        ]),
        Line::from(Span::styled("─".repeat(32), Style::default().fg(Color::DarkGray))),
        Line::from(vec![
            Span::styled("Earth Weight: ", Style::default().fg(Color::Cyan)),
            Span::styled(format!("{} kg", app.weight), Style::default().fg(Color::White)),
        ]),
        Line::from(vec![
            Span::styled(format!("Weight on {}: ", planet.name), Style::default().fg(Color::Cyan)),
            Span::styled(
                format!("{:.2} kg", new_weight),
                Style::default().fg(Color::Green).add_modifier(Modifier::BOLD),
            ),
        ]),
    ];

    f.render_widget(Paragraph::new(dest_lines).block(dest_block), box_area);

    // Fun fact
    let fact_area = Rect {
        x: centered.x,
        y: box_area.y + box_area.height + 1,
        width: centered.width,
        height: 3,
    };
    let fact_block = Block::default()
        .borders(Borders::ALL)
        .border_type(BorderType::Thick)
        .border_style(Style::default().fg(Color::Yellow));
    let fact_para = Paragraph::new(Line::from(Span::styled(
        format!("💡 {}", planet.fact),
        Style::default().fg(Color::Yellow),
    )))
    .block(fact_block)
    .alignment(Alignment::Center);
    f.render_widget(fact_para, fact_area);

    // Footer
    let footer_area = Rect {
        x: centered.x,
        y: fact_area.y + fact_area.height + 1,
        width: centered.width,
        height: 2,
    };
    let footer = Paragraph::new(vec![
        Line::from(Span::styled(
            "MISSION COMPLETE! Safe travels, Astronaut!",
            Style::default().fg(Color::Green).add_modifier(Modifier::BOLD),
        )),
        Line::from(Span::styled(
            "Press Q to quit  |  B: back to planets  |  R: reset",
            Style::default().fg(Color::DarkGray),
        )),
    ])
    .alignment(Alignment::Center);
    f.render_widget(footer, footer_area);
}

// ─── ENTRY POINT ───────────────────────────────────────────────────────────
fn main() -> io::Result<()> {
    enable_raw_mode()?;
    let mut out = stdout();
    execute!(out, EnterAlternateScreen)?;
    let backend = CrosstermBackend::new(out);
    let mut terminal = Terminal::new(backend)?;

    let result = run_app(&mut terminal);

    disable_raw_mode()?;
    execute!(terminal.backend_mut(), LeaveAlternateScreen)?;
    terminal.show_cursor()?;
    result
}

fn run_app(terminal: &mut Terminal<CrosstermBackend<Stdout>>) -> io::Result<()> {
    let mut app = App::new();
    terminal.hide_cursor()?;
    loop {
        terminal.draw(|f| ui(f, &app))?;

        if event::poll(Duration::from_millis(50))? {
            if let Event::Key(key) = event::read()? {
                if key.kind != KeyEventKind::Press {
                    continue;
                }
                if key.modifiers.contains(KeyModifiers::CONTROL)
                    && matches!(key.code, KeyCode::Char('c') | KeyCode::Char('C'))
                {
                    break;
                }
                app.handle_key(key.code);
            }
        }
        app.tick();
        if app.should_quit {
            break;
        }
    }
    Ok(())
}
