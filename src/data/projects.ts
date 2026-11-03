import { PAPER_URL, REGATTATRACK_BETA_URL } from './site';

export type Category = 'ml' | 'web' | 'apple' | 'automation';

export interface Project {
  id: string;
  title: string;
  year: string;
  categories: Category[];
  /** The full write-up, shown on the case study. */
  description: string[];
  /** A shorter list for the home page card, when the write-up runs long. */
  highlights?: string[];
  technologies: string[];
  githubUrl?: string;
  demoUrl?: string;
  demoLabel?: string;
  appStoreUrl?: string;
  paperUrl?: string;
  betaUrl?: string;
  /** Screenshots for the case study page, in public/projects/<folder>/. */
  shots?: Shot[];
  /** In Jason's words: what he's proudest of. Shown on the case study when set. */
  proud?: string;
  /** An overview paragraph in Jason's words, leading the case study. */
  summary?: string;
}

export interface Shot {
  src: string;
  width: number;
  height: number;
  alt: string;
  /** phone: an iPhone screen; desktop: a Mac screen; card: a small widget. */
  frame: 'phone' | 'desktop' | 'card';
}

export const filters: { id: Category | 'all'; label: string }[] = [
  { id: 'all', label: 'all' },
  { id: 'ml', label: 'machine learning' },
  { id: 'web', label: 'web' },
  { id: 'apple', label: 'ios / macos' },
  { id: 'automation', label: 'automation' },
];

export const projects: Project[] = [
  {
    id: 'regattatrack',
    title: 'RegattaTrack — Regatta Positioning System',
    year: '2026',
    categories: ['web', 'apple'],
    description: [
      'A course-plotting tool for one-design yacht racing: pick your club and the night’s mark list, build the course the way the Race Committee posted it, and get it plotted on a chart with true and magnetic headings and a distance for every leg.',
      'Ported a static single-club reference app into a full client/server platform any yacht club can run — an Angular front end (standalone components and signals) over a FastAPI and PostgreSQL backend with JWT auth, plus a club-admin console for mark list CRUD and spreadsheet uploads.',
      'Ships as a one-command Docker Compose stack and a Render blueprint, seeded with four Massachusetts Bay yacht clubs and their real mark data.',
    ],
    highlights: [
      'Course plotting for one-design racing: build the night’s course from the club’s mark list and get true and magnetic headings and a distance for every leg.',
      'Grew a single-club reference app into a platform any club can run: Angular over FastAPI and PostgreSQL, with JWT auth and a club-admin console.',
      'Ships as one Docker Compose stack, seeded with four Massachusetts Bay clubs’ real marks. iPhone app in TestFlight beta.',
    ],
    technologies: ['Angular', 'FastAPI', 'PostgreSQL', 'Docker', 'JWT', 'Render'],
    proud:
      'Sailors actually race with it. It started as a reference app for one club and is now a platform any club can run, with headings and distances people trust enough to sail by. The iPhone app, with its Leg screen, start countdown and Live Activity, is the part I’m happiest with.',
    betaUrl: REGATTATRACK_BETA_URL,
    shots: [
      { src: '/projects/regattatrack/leg.webp', width: 600, height: 1300, alt: 'The Leg screen: heading to the next mark in true and magnetic, distance, rounding side and point of sail', frame: 'phone' },
      { src: '/projects/regattatrack/countdown.webp', width: 600, height: 1300, alt: 'The start countdown at one minute to the gun, with sync and plus or minus one minute', frame: 'phone' },
      { src: '/projects/regattatrack/map.webp', width: 600, height: 1300, alt: 'The Map screen with the night\'s course plotted mark to mark', frame: 'phone' },
      { src: '/projects/regattatrack/live-activity.webp', width: 700, height: 297, alt: 'The lock-screen Live Activity: countdown, next leg, heading and wind', frame: 'card' },
    ],
  },
  {
    id: 'humanauth',
    title: 'HumanAuth — Replacing CAPTCHA with Real-Time Computer Vision',
    year: '2026',
    categories: ['ml', 'web'],
    description: [
      'Senior capstone with Jack Denholm: a web-based biometric system that tells humans from automated agents in real time, using continuous behavioral analysis instead of static challenge solving.',
      'An Angular front end streams webcam frames over a persistent WebSocket to a Python Flask backend, where MediaPipe face and hand landmark models feed six complementary liveness checks — micro-movement, 3D facial consistency, blink patterns, texture analysis, gesture challenge-response, and hand tracking.',
      'Across 50 trials with four participants: 3.3s average completion against 7.0s for traditional CAPTCHA, a 92% authentication success rate against 80%, and 76% of simulated presentation attacks blocked against 67%.',
    ],
    highlights: [
      'Senior capstone with Jack Denholm: tells humans from bots in real time with continuous behavioral checks instead of a CAPTCHA puzzle.',
      'Angular streams webcam frames over WebSocket to Flask, where MediaPipe face and hand landmarks feed six liveness checks.',
      'Beat traditional CAPTCHA in 50 trials: 3.3s vs 7.0s to complete, 92% vs 80% success, 76% vs 67% of spoofing attempts blocked.',
    ],
    technologies: ['Angular', 'Python', 'Flask', 'MediaPipe', 'WebSocket', 'Computer Vision'],
    proud:
      'We beat traditional CAPTCHA on both speed and accuracy, and the six liveness checks blocked more spoofing attempts than it did. Taking our capstone all the way to a written research paper with Jack is what I’m proudest of.',
    githubUrl: 'https://github.com/Dexteritize/HumanAuth',
    paperUrl: PAPER_URL,
    shots: [
      { src: '/projects/humanauth/arch.webp', width: 1925, height: 435, alt: 'System architecture from the paper: the Angular client sends frames to the Python WebSocket backend, where auth.py runs face landmarking, hand landmarking and the liveness checks, and returns the result', frame: 'desktop' },
      { src: '/projects/humanauth/results.webp', width: 935, height: 350, alt: 'Results from the paper: 3.3 s average completion against 7 s for traditional CAPTCHA, and 76% of spoofing attempts blocked against 67%', frame: 'desktop' },
    ],
  },
  {
    id: 'dankhome',
    title: 'DankHome — HomeKit Wall Panel for iPad and iPhone',
    year: '2026',
    categories: ['apple', 'automation'],
    description: [
      'A SwiftUI dashboard that turns a wall-mounted iPad into a smart-home panel: lights, thermostat, locks, garage door, shades, fans and outlets from HomeKit, plus a weather forecast and Apple Music, all on one screen that never scrolls. On iPhone it becomes its own scrolling dashboard of full-width cards, with rooms and scenes as chips and lights you swipe sideways to dim.',
      'An on-device assistant built on Apple’s Foundation Models framework runs the house and the app itself, so nothing leaves the device. Most requests never wait on the model: everyday commands, several commands in one sentence (“turn off the kitchen and lock the front door”) and common questions (“is the garage open?”, “what’s using power?”) are answered instantly from the home’s state. When the model is needed, each kind of request goes to a small session with only the tools it needs.',
      'Beyond devices, the assistant can change the app: “switch to the ocean background”, “go to the living room”, “save this as Movie Night” or “wake me up at 6:30 on weekdays”. Scene buttons can also be recorded by hand: tap record, set things the way you want, and DankHome keeps only what changed. Scenes and requests are available from Siri and Shortcuts through App Intents.',
      'Timers and routines: “turn off the lights in 30 minutes” or “every night at 10, run Good Night”. Routines that run a Home app scene are saved to the home hub as HomeKit triggers, so they fire even when the app is closed. A wake-up light fades a room from a warm glow to daylight by the alarm time, and adaptive lighting moves white lights with the sun.',
      'A What’s On view reads live watts and kWh from plugs that report them, shows how long everything has been on, and turns anything off in one tap. Plugs, fans and switches left on too long turn orange in the status line under the clock.',
      'Built for a screen that stays on: an idle night clock drifts each minute to avoid burn-in, dims the display and turns deep red after midnight, and unlocking a door or opening the garage always asks first. A demo mode with a fake home keeps it usable in the Simulator, and Swift Testing suites cover the schedules, lighting curves, quick commands and the unlock safety rule.',
    ],
    highlights: [
      'A SwiftUI smart-home panel for a wall-mounted iPad, with its own iPhone layout: HomeKit devices, weather, music and live power use on one screen.',
      'An on-device assistant on Apple’s Foundation Models runs the house and the app. Nothing leaves the device, and everyday commands skip the model entirely.',
      'Timers, routines saved as HomeKit triggers, a wake-up light, and a burn-in-safe night clock, with Swift Testing suites behind them.',
    ],
    technologies: ['Swift', 'SwiftUI', 'HomeKit', 'Foundation Models', 'App Intents', 'MusicKit', 'Speech', 'Swift Testing', 'Open-Meteo'],
    proud:
      'It’s on my wall and I use it every day. I can talk to my house without anything leaving the device, and most of what I ask happens instantly because it never has to wait on the model. The assistant can set up a routine or a wake-up light as easily as it turns off a lamp.',
    githubUrl: 'https://github.com/jdank417/DankHome',
    summary:
      'DankHome is a home dashboard for a wall-mounted iPad, with its own layout on iPhone. It reads and controls HomeKit accessories directly, shows the weather, what’s playing and what’s drawing power, runs timers and routines, and adds an assistant that runs entirely on the device, so you can talk to your house without sending a word to the cloud.',
  },
  {
    id: 'sailing-rules-assistant',
    title: 'AI Model Fine-Tuning — Sailing Rules Assistant',
    year: '2024',
    categories: ['ml'],
    description: [
      'Designed and implemented a Flan-T5 fine-tuning solution (Python-only codebase) to answer sailing rules questions and interpret racing scenarios.',
      'Trained on structured JSON of instructions, optional context, and expected outputs; wrote the training and evaluation pipelines.',
    ],
    technologies: ['Python', 'Flan-T5', 'NLP', 'Fine-tuning'],
    proud:
      'It brought together the two things I spend the most time on, racing and machine learning, and I wrote the training and evaluation pipelines end to end.',
    githubUrl: 'https://github.com/jdank417/Flan-t5-sailing-JasonDank',
    summary:
      'Fine-tuning a Flan-T5 model for answering questions about sailing rules and interpreting racing scenarios. The model is trained on JSON data containing instructions, optional context, and expected outputs to create an assistant that can answer questions about sailing rules.',
    shots: [{ src: '/projects/sailing-rules-assistant/rules-assistant.webp', width: 485, height: 319, alt: 'The Sailing Rules Assistant (2025–2028 rules): a question, optional context and the answer panel, with example questions below', frame: 'desktop' }],
  },
  {
    id: 'live-boston',
    title: 'Live Boston — Every T Train, Live in 3D',
    year: '2026',
    categories: ['web'],
    description: [
      'A live 3D map of Boston transit in the browser: every subway train, commuter rail train, Silver Line bus and harbor ferry, plus the Amtrak trains that share the MBTA’s tracks. Up close each train is a three.js model with the real number of cars the MBTA reports and true car dimensions, drawn in a MapLibre custom layer over a custom vector basemap; zoomed out, each one is a crisp dot in its line’s color.',
      'Built to be accurate, not just animated. Every position report is snapped onto the exact shape its trip runs, moved forward by how old the report is, then coasted at its measured speed, never past the stop it’s heading to. The drawn train follows that estimate under each line’s real top speed and a service-braking curve, so it eases into stations instead of jumping between reports. Amtrak’s positions are matched to the commuter rail tracks it runs on.',
      'An Alerts tab turns the MBTA’s service alerts into something you can see: suspended stretches and closed stations go amber on the map, outside causes like freight trains, drawbridges and Amtrak traffic are called out, and trains running bunched up are detected from their live positions. One search box finds any station, line, train number, ferry or Bluebikes dock.',
      'Where to? gives door-to-door directions from your GPS position to any station, address or spot on the map, planned entirely in the browser. A round-based search (RAPTOR) runs over the MBTA’s own trip patterns to find the fastest ways and ones with fewer changes, then times each leg with live predictions or the timetable, chaining one train’s arrival into the next connection. Ferries and commuter rail are tried as if one were about to leave and kept only if the real times agree, and you can plan ahead to leave at or arrive by any time.',
      'The trip is drawn on the map along real walking paths (from OpenStreetMap’s Valhalla router) and real track, while every other line and train fades to grey. Only the trains you’d catch keep their color, and each step says where your train is right now, with a button to watch it come. A preview flies the camera along the whole route in 3D. Save a trip as your commute and the top of the sidebar counts down to when to leave from wherever you are, then turns around for the way home when you get there.',
      'You can ride along behind any train or switch to the view from the cab, and the city’s sky and light follow the real sun and weather. It’s a static site with no backend, installable as an app on a phone.',
    ],
    highlights: [
      'A live 3D map of every Boston subway train, commuter rail train, Silver Line bus and ferry, plus Amtrak, drawn with three.js over MapLibre.',
      'Accurate between reports: each train is snapped to its trip’s track, projected forward from its report’s age, and eased into stops with real top speeds and braking.',
      'Door-to-door directions from your GPS, routed in the browser and timed leg by leg with live predictions, plus service alerts, bunching and a commute countdown that says when to leave.',
    ],
    technologies: ['TypeScript', 'three.js', 'MapLibre GL', 'Vite', 'MBTA V3 API', 'OpenStreetMap', 'PWA', 'GitHub Pages'],
    proud:
      'I use it to plan my commute. I type where I’m going and it shows me the whole trip, from my front door to theirs, with the train I need already moving toward me on the map. It even found me a ferry I didn’t know ran from the Seaport to North Station. And watching the whole system move across the city in 3D still hasn’t gotten old.',
    summary:
      'Live Boston is a live 3D map of Boston’s transit: every subway train, commuter rail train, Silver Line bus, ferry and nearby Amtrak train, drawn where it actually is right now. It gives door-to-door directions from wherever you are, shows what’s disrupting service, finds anything by name or number, and counts down to when you need to leave for your own commute.',
    demoUrl: 'https://jdank417.github.io/live-boston/',
    demoLabel: 'live site',
    shots: [
      { src: '/projects/live-boston/overview.webp', width: 1200, height: 750, alt: 'Every line and train across Boston at night, with live counts for each line in the sidebar', frame: 'desktop' },
      { src: '/projects/live-boston/directions.webp', width: 1200, height: 750, alt: 'Directions from Davis to Kenmore: the Red Line then the Green Line drawn on the map while every other line fades to grey, with when to leave and each step in the sidebar', frame: 'desktop' },
      { src: '/projects/live-boston/ride.webp', width: 1200, height: 750, alt: 'Riding along behind a Red Line train between 3D buildings, with its next stop, arrival and speed', frame: 'desktop' },
      { src: '/projects/live-boston/cab.webp', width: 1200, height: 750, alt: 'The cab view: looking down the Red Line track from the front of the train toward the skyline', frame: 'desktop' },
      { src: '/projects/live-boston/alerts.webp', width: 1200, height: 750, alt: 'The Alerts tab: disruptions, bunched trains and elevator outages, with each service alert by line', frame: 'desktop' },
      { src: '/projects/live-boston/directions-phone.webp', width: 600, height: 1298, alt: 'Directions on a phone: the route from Davis to Kenmore on the map, and leave in 2 minutes to arrive at 12:27 on the Red and Green lines', frame: 'phone' },
    ],
  },
  {
    id: 'lime',
    title: 'Lime — Convert and Edit Files Right from Finder',
    year: '2026',
    categories: ['apple', 'automation'],
    description: [
      'A free, open source macOS menu bar app that converts files where you already are. Hold Shift while dragging any file in Finder and a Liquid Glass wheel of formats opens under the pointer; drop the file on a slice and the converted copy is saved beside the original. Hold Option instead and the wheel fills with tools for that kind of file.',
      'Everything runs on the Mac with Apple’s own frameworks and the command-line tools macOS ships with: ImageIO and Core Image, AVFoundation, PDFKit, AppKit’s document readers, ditto, tar and hdiutil. Nothing is uploaded and there’s nothing extra to install. It converts images (PNG, JPG, HEIC, AVIF, TIFF, GIF, BMP, SVG, PDF and DOCX), video, audio, PDFs, documents, subtitles, archives and folders.',
      'The tools open small glass editor windows: compress a photo to an exact file size, adjust its light and color, crop, annotate, redact, add a background or read its QR codes; trim, crop, speed up, split or join video; trim audio on its waveform, normalize it or change its channels; reorder PDF pages; and read, edit or strip metadata. A pill at the top of the screen shows each job’s progress, then a button to show the result in Finder.',
      'Lime spots file drags anywhere on the Mac by watching the global mouse state and the drag pasteboard, so it needs no accessibility permission, and it shrinks Finder’s big drag preview over the wheel so the slices stay readable. It ships as a signed and notarized DMG on GitHub Releases, built by a script and a GitHub Actions workflow, with tests that run every converter and tool on generated files.',
    ],
    highlights: [
      'Hold Shift while dragging any file in Finder and a Liquid Glass wheel of formats opens under the pointer; Option brings up tools for that file.',
      'Converts images, video, audio, PDFs, documents, subtitles and archives entirely on the Mac, with editor windows to crop, trim, compress, redact and edit metadata.',
      'Free and open source, shipped as a signed and notarized DMG on GitHub Releases.',
    ],
    technologies: ['Swift', 'SwiftUI', 'AppKit', 'Liquid Glass', 'AVFoundation', 'Core Image', 'PDFKit', 'GitHub Actions'],
    githubUrl: 'https://github.com/jdank417/Lime',
    demoUrl: 'https://github.com/jdank417/Lime/releases/latest/download/Lime.dmg',
    demoLabel: 'download for Mac',
  },
  {
    id: 'bullbar',
    title: 'BullBar — SwiftUI macOS App',
    year: '2025',
    categories: ['apple', 'automation'],
    description: [
      'Built a lightweight SwiftUI macOS utility that floats above all windows with an always-on-top strip of real-time stock quotes.',
      'Routed market data through a secure Cloudflare Workers proxy so no user credentials are required, with clamped refresh intervals to stay inside free-tier limits.',
      'Implemented customizable display, adjustable scroll speed, light/dark theming, and a low-power mode for battery efficiency.',
    ],
    technologies: ['Swift', 'SwiftUI', 'macOS', 'Cloudflare Workers'],
    proud:
      'I took it all the way through App Store review, and it costs nothing to run: clamped refresh intervals keep the Worker inside Cloudflare’s free tier.',
    appStoreUrl: 'https://apps.apple.com/us/app/bullbar/id6745433379?mt=12',
    shots: [
      { src: '/projects/bullbar/ticker.webp', width: 828, height: 516, alt: 'BullBar\'s always-on-top strip of live stock quotes across the top of a Mac desktop', frame: 'desktop' },
      { src: '/projects/bullbar/settings.webp', width: 828, height: 516, alt: 'BullBar settings: tickers, scroll speed, refresh interval and low-power mode', frame: 'desktop' },
    ],
  },
  {
    id: 'bartender-gpt',
    title: 'Bartender-GPT — iOS App',
    year: '2025',
    categories: ['apple'],
    description: [
      'Built and published an iOS app in Swift, optimized for iPhone with full functionality on iPad.',
      'An ongoing project on the App Store that continues to receive feature updates.',
    ],
    technologies: ['Swift', 'iOS', 'iPadOS', 'App Store'],
    proud:
      'It was my first app on the App Store, and real people use it. Telling you what you can make from what’s already in your cabinet is my favorite feature, and it works as well on iPad as it does on iPhone.',
    appStoreUrl: 'https://apps.apple.com/us/app/bartender-gpt/id6743064352?platform=iphone',
    shots: [
      { src: '/projects/bartender-gpt/cabinet.webp', width: 390, height: 853, alt: 'The home screen: liquor cabinet, custom cocktails and favorites with what you can make', frame: 'phone' },
      { src: '/projects/bartender-gpt/search.webp', width: 390, height: 850, alt: 'Searching cocktails, each with ingredients and steps', frame: 'phone' },
      { src: '/projects/bartender-gpt/custom.webp', width: 390, height: 850, alt: 'Adding a custom cocktail with ingredients and a description', frame: 'phone' },
      { src: '/projects/bartender-gpt/grocery.webp', width: 390, height: 850, alt: 'The grocery list for missing ingredients', frame: 'phone' },
      { src: '/projects/bartender-gpt/stores.webp', width: 390, height: 850, alt: 'Finding liquor and grocery stores nearby on a map', frame: 'phone' },
    ],
  },
  {
    id: 'barcode-scanner',
    title: 'Barcode Scanning WebApp',
    year: '2023',
    categories: ['web', 'ml'],
    description: [
      'Led design and delivery as chief architect / service owner / PM, owning the product roadmap for ML-based barcode detection.',
      'Drove the full-stack integration effort and delivered a production-ready web application with 80%+ barcode detection accuracy.',
      'Managed Agile project management in GitLab; led DevOps and hosting and built the CI/CD pipelines.',
      'Implemented Excel-backed inventory uploads converted to SQLite, easing updates for non-technical stakeholders.',
    ],
    highlights: [
      'Led design and delivery as chief architect, service owner and PM, owning the roadmap for ML-based barcode detection.',
      'Shipped a production web app with 80%+ detection accuracy, with GitLab CI/CD, hosting and Agile delivery under my lead.',
      'Excel-backed inventory uploads, converted to SQLite, let non-technical staff keep the data current.',
    ],
    technologies: ['Flask', 'JavaScript', 'SQLite', 'Machine Learning', 'GitLab CI/CD'],
    proud:
      'I led the team as architect, service owner and PM, and we shipped it to production. I also made sure non-technical people could keep the inventory up to date with a simple Excel upload.',
    demoUrl: 'https://grocerybarcodescanner.onrender.com/',
    demoLabel: 'live demo',
  },
  {
    id: 'linux-device-monitor',
    title: "Linux Device Monitor — Dank's Squash Pie Monitor",
    year: '2023',
    categories: ['automation'],
    description: [
      'Created a Python/PyQt5 desktop application that monitors multiple Linux systems from macOS or Windows over SSH across custom VLANs.',
      'Polls CPU, memory, disk, and uptime metrics; deployed and active across Harvard Athletics and SEAS field support operations.',
    ],
    technologies: ['Python', 'PyQt5', 'SSH', 'Linux', 'Sub-processes'],
    proud:
      'I built it on the job to fix a real problem. Instead of SSHing into machines one at a time, everything is on one screen, and it flags a struggling or offline device before anyone notices.',
    summary:
      'DSPM (Dank\'s Squash Pie Monitor) is a Python-based GUI application that monitors multiple Linux systems from a macOS or Windows environment. Leveraging SSH connections, the application periodically retrieves critical system metrics such as CPU usage, memory consumption, disk usage, and system uptime.',
    shots: [{ src: '/projects/linux-device-monitor/dashboard.webp', width: 440, height: 289, alt: 'Dank\'s Squash Pie Monitor: a tile per host with CPU, memory, disk, uptime and last update (hostnames redacted)', frame: 'desktop' }],
  },
  {
    id: 'huit-chatbot',
    title: 'HUIT Training ChatBot',
    year: '2024',
    categories: ['ml'],
    description: [
      'Developed a Python NLP chatbot with a customtkinter GUI to solve documentation overload for new HUIT hires.',
      'Integrated fuzzy search, semantic search (BERT embeddings), and named entity recognition so technicians can ask questions conversationally instead of digging through a knowledge base.',
    ],
    technologies: ['Python', 'NLP', 'BERT', 'spaCy', 'customtkinter'],
    proud:
      'New hires actually used it, which meant fewer interruptions for senior techs and a way to keep what past technicians knew from getting lost. Under the hood it combines fuzzy search, BERT embeddings and entity recognition to find the right answer.',
    summary:
      'A chatbot utilizing Natural Language Processing to assist new hires at Harvard University Information Technology by referencing documented information from past technicians, using natural language in a conversational format rather than fishing through a knowledge base.',
    shots: [{ src: '/projects/huit-chatbot/chat.webp', width: 588, height: 384, alt: 'The HUIT chatbot answering questions in conversation, such as where to send Dell repairs', frame: 'desktop' }],
  },
  {
    id: 'remote-gpu-server',
    title: 'Remote Compute Environment for AI Fine-Tuning',
    year: '2024',
    categories: ['automation'],
    description: [
      'Engineered a reproducible WSL2-based Linux training environment with containerized workflows on an HP ZBook Fury.',
      "Solved WSL2's idle shutdown behaviour, configured persistent SSH over Tailscale, and set up GPU passthrough for CUDA workloads — enabling remote fine-tuning with zero idle shutdowns.",
    ],
    technologies: ['WSL2', 'Linux', 'CUDA', 'Tailscale', 'Docker', 'Windows', 'Ubuntu'],
    proud:
      'I turned a laptop into an always-on server. Beating WSL2’s idle shutdown and getting CUDA passthrough working were the hard parts, and now I can start a training run from anywhere over Tailscale.',
    demoUrl: 'https://drive.google.com/file/d/1kRTeivItPW3HBvMCnBD8cd3wxtmspbez/view?usp=sharing',
    demoLabel: 'watch walkthrough',
    summary:
      'Systematic transformation of an HP ZBook Fury laptop into a robust, always-on home server infrastructure. Solved critical challenges including WSL2\'s idle shutdown behavior, secure SSH-over-Tailscale connectivity, and GPU passthrough configuration for CUDA workloads.',
    shots: [{ src: '/projects/remote-gpu-server/server-motd.webp', width: 589, height: 388, alt: 'Logging in to the server: its banner and nvidia-smi showing the NVIDIA RTX A3000 laptop GPU available to CUDA', frame: 'desktop' }],
  },
  {
    id: 'stock-prediction',
    title: 'CNN-LSTM Stock Market Prediction',
    year: '2023',
    categories: ['ml'],
    description: [
      'Implemented a combined CNN and LSTM model in TensorFlow to forecast stock prices from historical data.',
      'Engineered technical indicators (RSI, MACD, Bollinger Bands) from yfinance data and added logging, model management, and actual-vs-predicted visualisation.',
    ],
    technologies: ['Python', 'TensorFlow', 'LSTM', 'CNN', 'yfinance'],
    proud:
      'Engineering features like RSI, MACD and Bollinger Bands from raw prices, and pairing a CNN for local patterns with an LSTM for the sequence, taught me a lot. So did learning how hard markets really are to predict.',
    githubUrl: 'https://github.com/jdank417/Deep-Learning-for-Stock-Market-Predictions',
    summary:
      'This project implements a Convolutional Neural Network (CNN) and Long Short-Term Memory (LSTM) model to predict stock prices. The model uses historical stock data, along with technical indicators, to forecast future stock prices.',
    shots: [{ src: '/projects/stock-prediction/forecast.webp', width: 440, height: 292, alt: 'Actual price (blue) against the model’s prediction (red)', frame: 'desktop' }],
  },
];
