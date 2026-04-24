# EYEP - Vision-Correcting Assistive Portal

EYEP is a GPU-accelerated web application designed to assist users with refractive errors (nearsightedness, farsightedness) by "pre-distorting" on-screen content using custom GLSL shaders.

## 🚀 Quick Start

### 1. Supabase Setup
- Create a new project at [supabase.com](https://supabase.com).
- Open the **SQL Editor** in your Supabase dashboard.
- Copy the contents of `supabase.sql` and run it to set up the schema, RLS policies, and triggers.

### 2. Environment Variables
- Rename `.env.example` to `.env.local`.
- Add your Supabase URL and Anon Key:
  ```env
  VITE_SUPABASE_URL=your-project-url
  VITE_SUPABASE_ANON_KEY=your-anon-key
  ```

### 3. Installation
```bash
npm install
npm run dev
```

## 🛠 Tech Stack
- **Framework**: React 18 + Vite
- **Graphics**: WebGL / GLSL via `@react-three/fiber`
- **Styling**: Tailwind CSS
- **Backend**: Supabase (Auth + PostgreSQL)
- **Animations**: Framer Motion

## 🔬 How it Works
The `VisionEngine` component renders content inside a WebGL context. It applies a **Wiener Deconvolution-inspired** fragment shader that:
1. **Pre-distorts** text and images by applying a sharpening inverse PSF based on the user's Diopter (Sphere) setting.
2. **Simulates** the user's natural blur in "Standard Vision" mode for comparison.
3. **Optimizes** for 60FPS on mobile GPUs using low-tap filter approximations.

## ⚠️ Disclaimer
EYEP is an assistive software tool, not a medical device. It is intended for research and accessibility purposes. Always consult an optometrist for clinical vision correction.
