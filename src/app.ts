import { env } from "node:process";
import { readFile, writeFile } from "node:fs/promises";
import path from 'node:path';
import { ProxyAgent, fetch as undiciFetch } from 'undici';

import OpenAI from "openai";

import chalk from "chalk";

import ora from "ora";
import cliSpinners from "cli-spinners";
import { nanoid } from "nanoid";

import {
    mkdir,
    extractImageUrlFromMarkdown,
    formatDuration
} from "./utils.ts"

import loadConfig from "./config.ts";
loadConfig();


let sharedSpinner: any;

const promptFileName: string = env.PROMPT_FILENAME as string;
const outputDir: string      = env.OUTPUT_DIR as string;

const timeoutMinutes: number = parseInt(env.TIMEOUT_MINUTES || "5", 10);

const openai = new OpenAI({
    apiKey:     env.OPENAI_API_KEY,
    baseURL:    env.OPENAI_BASE_URL,
    timeout:    1000 * 60 * timeoutMinutes,
    maxRetries: 0,
});


export async function readPromptFile(): Promise<string> {
    return await readFile(promptFileName, { encoding: "utf-8" });
}

async function sendRequest(promptText: string): Promise<{ url: string, duration: number } | never> {
    if (!sharedSpinner) {
        sharedSpinner = ora({ text: "Requesting...", spinner: cliSpinners.binary }).start();
    } else {
        sharedSpinner.text = "Requesting...";
    }

    try {
        const startTime = performance.now();
        const model: string = env.GPT_4O_IMAGE_MODEL as string;
        const response = await openai.chat.completions.create({
            model: model,
            messages: [
                {
                    role: "user",
                    content: [{ type: "text", text: promptText }],
                },
            ],
            stream: false,
        });

        const endTime = performance.now();
        const durationMs = endTime - startTime;
        const durationStr = formatDuration(durationMs);

        const content: string = response.choices[0].message.content as string;
        if (!content) {
            throw new Error("No content received (っ° Д °;)っ");
        }
        const url: string = extractImageUrlFromMarkdown(content) as string;
        if (!url) {
            throw new Error("No URL extracted (っ° Д °;)っ");
        }

        if (sharedSpinner) {
            sharedSpinner.stop();
        }
        console.log(`Request Succeeded! Time Used: ${durationStr}`);
        console.log(`Image URL: ${chalk.underline.cyan(url)}`);

        return { url: url, duration: durationMs };
    } catch (e) {
        if (sharedSpinner) {
            sharedSpinner.stop();
            // console.debug(chalk.red(`Debug: Error in sendRequest: ${(e as Error).message}`));
        }
        throw e;
    }
}

async function downloadImage(outputDir: string, url: string, index: number): Promise<void> {
    try {
        const proxy = "http://127.0.0.1:1080";
        const envHttpProxy: string = env.HTTP_PROXY as string ?? proxy;
        const agent = new ProxyAgent(envHttpProxy);
        const fetchResponse = await undiciFetch(url, { dispatcher: agent });

        if (!fetchResponse.ok) {
            throw new Error(`Error Fetching Image: ${fetchResponse.status} ${fetchResponse.statusText}`);
        }
        if (!fetchResponse.body) {
            throw new Error(`Error: Response body is empty.`);
        }

        const baseNameFromUrl = path.basename(new URL(url).pathname);
        const ext = path.extname(baseNameFromUrl);
        const baseName: string = ext ? baseNameFromUrl : `${nanoid(24)}.png`;

        await mkdir(outputDir);
        const localFilePath = path.join(outputDir, baseName);
        await writeFile(localFilePath, fetchResponse.body);

        console.log(`Request ${index + 1}: Image saved to: ${chalk.cyan(localFilePath)}`);
        console.log("");
    } catch (e) {
        console.error(chalk.red(`Download ${index + 1} Error for ${url}: ${(e as Error).message}`));
        throw e;
    }
}

export async function sendRequestsConcurrently(concurrencyNum: number): Promise<void> {
    const promptText = await readPromptFile();
    console.log("PROMPT:");
    console.log("------------------------------------------------------------");
    console.log(chalk.dim(promptText));
    console.log("------------------------------------------------------------");
    console.log("");

    console.log(`n = ${concurrencyNum}\n`);

    let successCount = 0;
    let totalDuration = 0;
    let minDuration = Number.MAX_SAFE_INTEGER;
    const startTime = performance.now();

    const promises = Array(concurrencyNum).fill(0).map(async (_, index) => {
        try {
            const result = await sendRequest(promptText);
            if (result && typeof result.duration === 'number') {
                successCount++;
                totalDuration += result.duration;
                if (result.duration < minDuration) {
                    minDuration = result.duration;
                }
                await downloadImage(outputDir, result.url, index);
            } else {
                console.error(chalk.red(`Invalid result for Request ${index + 1}: ${JSON.stringify(result)}`));
            }
        } catch (error) {
            console.error(chalk.red(`Request ${index + 1} Failed: ${(error as Error).message}\n`));
        }
    });

    await Promise.all(promises);

    const endTime = performance.now();
    const overallDurationMs = endTime - startTime;
    const overallDurationStr = formatDuration(overallDurationMs);
    const averageDurationStr = successCount > 0 ? formatDuration(totalDuration / successCount) : 'N/A';
    const minDurationStr = successCount > 0 ? formatDuration(minDuration) : 'N/A';

    console.log("------------------------------------------------------------");
    console.log("");
    console.log(chalk.blue(`Success Rate: ${chalk.green(successCount)}/${chalk.white(concurrencyNum)}`));
    console.log(chalk.blue(`Minimum Time: ${minDurationStr}`));
    console.log(chalk.blue(`Average Time: ${averageDurationStr}`));
    console.log(chalk.blue(`Total   Time: ${overallDurationStr}`));
    console.log("");
    console.log("------------------------------------------------------------");

    if (sharedSpinner) {
        sharedSpinner.stop();
    }
}

