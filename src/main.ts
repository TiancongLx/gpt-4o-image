#!/usr/bin/env tsx

// Imports ====================================================================
import { exit, env } from "node:process";

import loadConfig from "./config.ts";
loadConfig();

import { setupSIGINTHandler } from "./utils.ts";
import {
    readPromptFile,
    sendRequestsConcurrently
} from "./app.ts";

import chalk from "chalk";

import { cac } from "cac";

// Actions ====================================================================
async function printPromptTextAction() {
    console.log(chalk.dim(await readPromptFile()));
}


async function generateAction(options: any) {
    // 计算并发数，优先级：命令行 > 环境变量 > 默认值
    let concurrencyStr: string;
    if (options.concurrency !== undefined) {
        concurrencyStr = options.concurrency;
    } else if (env.CONCURRENCY_NUM !== undefined) {
        concurrencyStr = env.CONCURRENCY_NUM as string; // 确保类型一致
    } else {
        concurrencyStr = '1';
    }
    const concurrencyNum = parseInt(concurrencyStr, 10);

    if (isNaN(concurrencyNum) || concurrencyNum <= 0) {
        console.error(chalk.red('Invalid concurrency number, must be a positive integer'));
        exit(1);
    }

    // 获取 httpProxy，从命令行选项，如果未定义，则在 app.ts 中处理环境变量
    const httpProxyFromCli = options.httpProxy; // 从 CLI 获取，可能是 undefined

    await sendRequestsConcurrently(concurrencyNum, httpProxyFromCli);
}

// ============================================================================
function setupCLI() {
    const cli = cac("gpt-4o-image");

    cli.help();
    cli.version("0.1.0");

    cli.command("print", "print current prompt")
        .action(printPromptTextAction);

    cli.command("generate", "generate images from prompt")
        .option('-n, --concurrency <number>', 'concurrency number')
        .option('--http-proxy <string>', 'HTTP proxy for image downloads, e.g., http://127.0.0.1:1080')
        .action(generateAction);

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

