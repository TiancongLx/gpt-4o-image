# GPT-4o Image Generator

## Description

This is a command-line interface (CLI) tool written in TypeScript that uses the OpenAI GPT-4o model to generate images based on a prompt text. It reads prompts from a file, sends requests to the OpenAI API, extracts image URLs from the response, and downloads the images to a local directory. The tool supports concurrent requests for efficiency and includes features like timed requests, error handling, and colorful console output for better user experience.

- **Key Features**:
  - Generate images using GPT-4o model.
  - Configurable concurrency for multiple requests.
  - Supports proxy settings for image downloads.
  - CLI commands for printing prompts or generating images.
  - Configured via `.env` file for easy setup.

This project is designed for developers or users experimenting with AI image generation, with a focus on simplicity and reliability.

## Installation

1. Clone the repository:
   ```powershell
   git clone https://github.com/TiancongLx/gpt-4o-image.git
   cd gpt-4o-image
   ```

2. Install dependencies using pnpm (as specified in `package.json`):
   ```powershell
   pnpm install
   ```

   - **Requirements**:
     - Node.js version >= 22.15.0
     - pnpm version >= 10.10.0
     - Ensure you have pnpm installed; if not, install it via npm: `npm install -g pnpm`

## Configuration

The tool uses environment variables for configuration. Copy the example file and set your values:

1. Copy `.env.example` to `.env`:
   ```powershell
   cp .env.example .env
   ```

2. Edit `.env` with your settings:
   - `OPENAI_API_KEY`: Your OpenAI API key (e.g., `sk-*`).
   - `OPENAI_BASE_URL`: OpenAI API base URL (default: `https://api.openai.com/v1`). **Recommended API Providers: `https://api.tu-zi.com/v1`**
   - `GPT_4O_IMAGE_MODEL`: Model name (default: `gpt-4o-image`).
   - `TIMEOUT_MINUTES`: Request timeout in minutes (default: 5).
   - `PROMPT_FILENAME`: Path to the prompt file (default: `prompt.txt`).
   - `OUTPUT_DIR`: Directory for saving generated images (default: `output/Playground`).
   - `CONCURRENCY_NUM`: Number of concurrent requests (default: 1, can be overridden via CLI).
   - `HTTP_PROXY`: Optional proxy for image downloads (e.g., `http://127.0.0.1:1080`).

   **Security Note**: Handle `.env` files with care, as they may contain sensitive information like API keys. Never commit `.env` to version control.

## Usage

The tool uses a CLI built with `cac`. Run it directly with `tsx` (no need to compile TypeScript). Available commands:

1. **Print the current prompt**:
   ```powershell
   tsx src/main.ts print
   ```
   - This reads and displays the content of `prompt.txt`.

2. **Generate images**:
   ```powershell
   tsx src/main.ts generate -n <concurrency>
   ```
   - Example: `tsx src/main.ts generate -n 5` to generate 5 concurrent requests.
   - **Options**:
     - `-n, --concurrency <number>`: Set the number of concurrent requests (overrides `CONCURRENCY_NUM` in `.env`).
     - `--http-proxy <string>`: Set HTTP proxy for image downloads (e.g., `http://127.0.0.1:1080`). This overrides the `HTTP_PROXY` environment variable.
   - The tool will:
     - Read the prompt from `prompt.txt`.
     - Send requests to OpenAI.
     - Download images to the specified output directory.
     - Display success rate, timings, and errors with colored output.

**Example Workflow**:
- Create a `prompt.txt` file with your image generation prompt (e.g., "Generate an image of a futuristic city").
- Run `tsx src/main.ts generate -n 3`.
- Check the output directory for saved images.

## Directory Structure

The project is organized as follows (based on the included files):
- `.env.example`: Example environment configuration.
- `.repomixignore`: Ignore patterns for repository tools.
- `package.json`: Project metadata and dependencies.
- `src/app.ts`: Core logic for sending requests and downloading images.
- `src/commands.ts`: CLI command actions for print and generate.
- `src/config.ts`: Loads environment variables using dotenv.
- `src/main.ts`: CLI setup and entry point.
- `src/utils.ts`: Utility functions for file operations and formatting.
- `tsconfig.json`: TypeScript configuration.

## Notes

- **Security**: This tool handles sensitive data (e.g., API keys). Always use secure methods for storing and transmitting credentials. Disable any security checks at your own risk.
- **Dependencies**: Managed via pnpm; see `package.json` for a full list.
- **Error Handling**: The tool includes SIGINT handlers for graceful exits and logs errors with colors for better debugging.
- **Contributing**: Pull requests and issues are welcome. Please follow the code style (e.g., use TypeScript, keep functions concise) and run `pnpm install` before submitting changes.

For any issues or enhancements, feel free to open an issue on the repository.

