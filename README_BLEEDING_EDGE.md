# The "Bleeding Edge" Stack Implementation

This workspace has been upgraded to the "God Tier" interface of late 2024/2025, incorporating:

## 1. The Engine: WebGPU (Three.js + TSL)
**File:** `components/WebGPUScene.tsx`

We replaced the legacy Canvas 2D particle system with a **WebGPU Compute Shader** particle simulation.
- **Technology:** `three/webgpu`, `three/tsl` (Three.js Shading Language).
- **Features:** 
  - 10,000 particles simulated on the GPU.
  - Compute Shaders handle physics updates (velocity, collision, noise) directly on the graphics card.
  - No CPU overhead for particle movement.
  - Uses TSL (Transpiled Shading Language) for future-proof shader code.

## 2. The Brain: Local AI (WebLLM)
**File:** `services/webLlmService.ts` & `components/NeuralInterface.tsx`

We integrated **WebLLM** to run a local Llama 3 model directly in the browser.
- **Technology:** `@mlc-ai/web-llm`.
- **Model:** `Llama-3.2-1B-Instruct` (Quantized).
- **Features:**
  - **Privacy:** No data leaves the browser.
  - **Latency:** Zero network latency after initial load.
  - **Neural Interface:** A floating terminal that connects you to the local node.

## 3. Generative UI (Foundation)
**File:** `components/NeuralInterface.tsx`

The Neural Interface serves as the command center where the Local AI can be prompted to assist with the interface.

## How to Test

1. **WebGPU:** Run the app. The background is now a 3D compute-shader driven particle swarm instead of a static grid/canvas.
2. **Local AI:** Click the **Neural Interface** button (bottom right, terminal icon).
   - It will initialize the Llama 3 model (check console for progress or the UI status).
   - Once connected (green light), chat with it locally.

## Requirements
- A browser with **WebGPU support** enabled (Chrome 113+, Edge, etc.).
- A GPU capable of running compute shaders.
