# Voyara — Digital Travel Journal & Itinerary Planner

Voyara (formerly GlobeTrotter) is a modern web application designed for digital travelers. It allows users to build custom multi-stop trip itineraries, manage travel budgets, visualize expenses, check calendar schedules, query an interactive AI travel assistant, and share plans with a travel community.

---

## Key Features

- **Animated Splash Screen**: Immersive brand entry animated with `framer-motion`.
- **Responsive Navigation**: Collapsible, responsive sidebar with screen transitions and chevron toggle controls.
- **Trip Dashboard**: Unified cockpit showing active trips, recent timeline events, quick travel assistant prompts, and aggregate stats.
- **Itinerary & Route Builder**: Organizes sequential stops/cities and detailed activities with custom durations, costs, and categories.
- **Budget & Expense Visualizer**: Categorized expense tracking (Transport, Lodging, Meals, Activities, etc.) with clean budget progress bar indicators.
- **Interactive Calendar**: View monthly/daily distributions of planned stops and scheduled events.
- **AI Travel Assistant**: Integrated chat assistant module for smart travel recommendations.
- **Community Portal**: Discover publicly shared itineraries by other globetrotters and duplicate them into your own list.
- **Admin Control Panel**: View user registrations, database metrics, popular cities, and category distributions.

---

## Tech Stack & Dependencies

- **Frontend Core**: [React 19](https://react.dev/) & [Vite 8](https://vite.dev/) (fast HMR dev environment)
- **Database & Auth Integration**: [Supabase JS Client](https://supabase.com/)
- **Animations**: [Framer Motion](https://www.framer.com/motion/)
- **Icons**: [Lucide React](https://lucide.dev/)
- **Linting**: [Oxlint](https://oxc.rs/) (high-performance linting compiler)

---

## Architecture & Database Failover

Voyara features a robust **dual database client adapter** in [`supabaseClient.js`](file:///h:/OdooXLD/src/db/supabaseClient.js):

- **Real Supabase Mode**: If the local environment has active Supabase credentials, all authentication, trip builds, profiles, and budget items will be securely persisted on your Supabase tables.
- **Local Storage Mock Mode**: If Supabase parameters are missing, the system automatically falls back to an client-side `MockDatabase` backed by `localStorage` populated with seed mock data. This allows developers to run and test all application features immediately without needing database configurations.

---

## Getting Started

### Prerequisites

Make sure you have [Node.js](https://nodejs.org/) (v18.x or newer) installed.

### Setup Instructions

1. **Clone the repository**
   ```bash
   git clone https://github.com/gupta-heli/OddoXLD_review.git
   cd OddoXLD_review
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure Environment Variables (Optional)**
   If you want to connect to a live database, create a `.env` file in the root directory:
   ```env
   VITE_SUPABASE_URL="https://your-project-id.supabase.co"
   VITE_SUPABASE_ANON_KEY="your-anon-public-key"
   ```
   *Note: If these variables are omitted, the application will run in Mock Mode using LocalStorage.*

4. **Launch Development Server**
   ```bash
   npm run dev
   ```
   This will start the local server, typically available at [http://localhost:5173](http://localhost:5173).

---

## Available Scripts

In the project root, you can run:

- **`npm run dev`**: Starts the Vite development server with hot-reload.
- **`npm run build`**: Compiles the production-ready code into the `dist/` directory.
- **`npm run lint`**: Inspects code quality issues instantly using `oxlint`.
- **`npm run preview`**: Launches a local static server to preview the built production app.
