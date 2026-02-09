# OrbitLab: Astronomy Simulation & Visualization

**OrbitLab** is an interactive web application designed to visualize planetary mechanics and cosmic scales. Built with modern web technologies, it bridges the gap between scientific accuracy and engaging user experience.

![OrbitLab Banner](https://via.placeholder.com/1200x400?text=OrbitLab+Astronomy+Visualization)

## 🚀 Features

### 1. 3D Solar System

- **Interactive Scene**: Navigate a 3D model of the solar system using React Three Fiber.
- **Real-Time Simulation**: Watch planets orbit based on their actual Keplerian periods.
- **Data-Driven**: Clicking a planet reveals scientific data (Mass, Radius, Semi-Major Axis).

### 2. Kepler Analysis Tool

- **Orbital Calculator**: compute orbital periods using variable mass and distance inputs.
- **Dynamic Graphing**: Visualizes Kepler's Third Law ($T^2 \propto r^3$) with real-time charts.

### 3. Cosmic Scale Comparator

- **Travel Time Calculator**: Compare how long it takes to travel vast distances (e.g., Earth to Mars) at the speed of Light, Voyager 1, a Jet, or a Car.

### 4. Scientific Documentation

- **Methods Page**: Detailed explanation of the physics models, assumptions, and constants used in the simulation.

## 🛠️ Tech Stack

- **Framework**: [Next.js 16](https://nextjs.org/) (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **3D Graphics**: [React Three Fiber](https://docs.pmnd.rs/react-three-fiber) (Three.js)
- **UI Components**: [shadcn/ui](https://ui.shadcn.com/)
- **Charts**: [Recharts](https://recharts.org/)
- **Icons**: Lucide React

## 📦 Installation

Clone the repository and install dependencies:

```bash
git clone https://github.com/your-username/orbitlab.git
cd orbitlab
npm install
```

Run the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## 🧪 Science & Accuracy

This project uses data from the **NASA Planetary Fact Sheet**.

- **Orbits**: approximated as circular for visual clarity (eccentricity = 0).
- **Scale**: Planet sizes are exaggerated relative to distances to ensure visibility.
- **Physics**: Period calculations utilize standard Keplerian mechanics.

## 📝 License

This project is open source and available under the [MIT License](LICENSE).
