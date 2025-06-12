[![Dependabot Updates](https://github.com/silrenan/studio/actions/workflows/dependabot/dependabot-updates/badge.svg?branch=main)](https://github.com/silrenan/studio/actions/workflows/dependabot/dependabot-updates)

# VoxDigest

VoxDigest is a Next.js application designed to transcribe and summarize audio files using AI. It leverages Genkit with Google's Gemini models for AI-powered transcription, summarization, image generation, and quote generation.

## Features

-   Upload .mp3 audio files.
-   AI-powered transcription of audio content.
-   Automatic AI-generated summary of the transcription, including:
    -   Key Concepts
    -   Important Quotes
    -   Key Facts
    -   "Latest on this Matter" (AI-generated context based on its knowledge)
    -   TL;DR Summary
-   Dynamic AI-generated visual inspiration (image) and a thought-provoking quote on each processing run.
-   Downloadable summary and transcription in Markdown format.

## Tech Stack

-   **Next.js (App Router)**: React framework for building the user interface.
-   **React**: JavaScript library for building user interfaces.
-   **TypeScript**: Superset of JavaScript for type safety.
-   **Tailwind CSS**: Utility-first CSS framework for styling.
-   **ShadCN UI**: Re-usable UI components.
-   **Genkit (v1.x)**: Framework for building AI-powered applications.
-   **Google Gemini Models**: Used for transcription, summarization, image, and quote generation.

## Getting Started

Follow these instructions to get a copy of the project up and running on your local machine for development and testing purposes.

### Prerequisites

-   [Node.js](https://nodejs.org/) (v18 or later recommended)
-   [npm](https://www.npmjs.com/) (comes with Node.js)
-   A Google Gemini API Key. You can obtain one from [Google AI Studio](https://aistudio.google.com/app/apikey).

### Setup Instructions

1.  **Clone the repository:**
    If you've cloned this project from GitHub or another source, navigate to the project directory.
    ```bash
    git clone <repository-url>
    cd VoxDigest
    ```

2.  **Install dependencies:**
    Install the necessary npm packages.
    ```bash
    npm install
    ```

3.  **Set up your Environment Variables:**
    You'll need to provide your Google Gemini API key. Create a new file named `.env` in the root of your project directory.
    ```bash
    touch .env
    ```
    Open the `.env` file and add your API key like this:
    ```env
    GOOGLE_API_KEY=YOUR_GEMINI_API_KEY_HERE
    ```
    Replace `YOUR_GEMINI_API_KEY_HERE` with your actual API key.

    **Important Security Note:** The `.env` file contains sensitive information. Ensure that `.env` is listed in your `.gitignore` file to prevent it from being committed to version control. A standard Next.js project usually includes this by default.

4.  **Run the Development Servers:**
    VoxDigest requires two development servers to be running concurrently:
    *   The Next.js development server for the frontend application.
    *   The Genkit development server for the AI flows.

    Open two separate terminal windows or tabs in your project's root directory.

    *   **In the first terminal, start the Next.js app:**
        ```bash
        npm run dev
        ```
        This will typically start the application on `http://localhost:9002`.

    *   **In the second terminal, start the Genkit development server:**
        For development with auto-reloading on changes to AI flows:
        ```bash
        npm run genkit:watch
        ```
        Or, to just start it once:
        ```bash
        npm run genkit:dev
        ```
        The Genkit server will start, usually on a different port (e.g., `http://localhost:3400`), and output logs for your AI flows. The Next.js app communicates with this server.

5.  **Open the application:**
    Once both servers are running, open your web browser and navigate to `http://localhost:9002` (or the port indicated by the `npm run dev` command).

You should now be able to use VoxDigest locally!

## How It Works

1.  The user uploads an .mp3 file through the interface.
2.  The Next.js frontend converts the file to a data URI.
3.  When "Transcribe & Summarize" is clicked:
    a.  A request is made to the `generateImageFlow` to create a new visual.
    b.  A request is made to the `generateInspirationalQuoteFlow` for a new quote.
    c.  The audio data URI is sent to the `transcribeAudioFlow` Genkit flow.
    d.  The Genkit flow uses a Gemini model to transcribe the audio to text.
    e.  If transcription is successful, the resulting text is automatically sent to the `summarizeTranscriptionFlow`.
    f.  This flow uses a Gemini model to generate a structured summary, including key concepts, quotes, facts, recent context ("Latest on this Matter"), and a TL;DR.
4.  The transcription and summary are displayed in the UI.
5.  The user can download the combined output as a Markdown file.

## Available Scripts

In the project directory, you can run:

-   `npm run dev`: Runs the Next.js app in development mode.
-   `npm run genkit:dev`: Starts the Genkit development server.
-   `npm run genkit:watch`: Starts the Genkit development server with file watching for AI flows.
-   `npm run build`: Builds the Next.js app for production.
-   `npm run start`: Starts a Next.js production server (after building).
-   `npm run lint`: Lints the codebase using Next.js's default ESLint configuration.
-   `npm run typecheck`: Runs TypeScript type checking.

## Contributing

Contributions are welcome! If you have suggestions or improvements, feel free to open an issue or submit a pull request.
```
