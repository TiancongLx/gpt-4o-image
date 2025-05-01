#!/usr/bin/env tsx

// Imports ====================================================================
import { exit } from "node:process";

import loadConfig from "./config.ts";
loadConfig();

import { setupSIGINTHandler } from "./utils.ts";

import chalk from "chalk";
import { cac } from "cac";

import * as commands from "./commands.ts";

// ============================================================================
function setupCLI() {
    const cli = cac("gpt-4o-image");

    cli.help();
    cli.version("0.1.0");

    cli.command("print", "print current prompt")
        .action(commands.printPromptTextAction);

    cli.command("generate", "generate images from prompt")
        .option('-n, --concurrency <number>', 'concurrency number')
        .option('--http-proxy <string>', 'HTTP proxy for image downloads, e.g., http://127.0.0.1:1080')
        .action(commands.generateAction);

    cli.parse();
}

async function main() {
    setupSIGINTHandler();
    setupCLI();
}

// Entry Point ================================================================

await main().catch(e => {
    console.error(chalk.red(`Oops! The main process panics: ${(e as Error).message}`));
    exit(1);
});

