import { mkdir as _mkdir } from 'node:fs/promises';
import path from 'node:path';
import { exit } from 'node:process';

import loadConfig from "./config.ts";
loadConfig();

import chalk from "chalk";


export async function mkdir(relativePath: string) {
    try {
        const absolutePath = path.resolve(process.cwd(), relativePath);
        await _mkdir(absolutePath, { recursive: true });
    } catch (e) {
        console.error(chalk.red(`Error creating directory: ${(e as Error).message}`));
        throw e;
    }
}

export function setupSIGINTHandler(): void {
    if ((process as any)._sigintHandlerSet) {
        return;
    }

    process.on('SIGINT', () => {
        // console.log(chalk.yellow("\n收到退出信号 (Ctrl+C)，正在退出..."));
        exit(1);
    });

    (process as any)._sigintHandlerSet = true;
}

export function extractImageUrlFromMarkdown(text: string): string | null {
    // 正则表达式匹配 Markdown 图片语法： ![...] (...)
    // !\[       匹配开头的 "![" (方括号需要转义)
    // .*?       匹配方括号内的任何字符 (alt text)，非贪婪模式
    // \]        匹配闭合的方括号 (需要转义)
    // \(        匹配开头的括号 (需要转义)
    // (         开始捕获组，用于提取 URL
    // https?:\/\/  匹配 "http://" 或 "https://"
    // [^\s)]+   匹配一个或多个非空白、非右括号的字符 (URL 本身)
    // )         结束捕获组
    // \)        匹配闭合的括号 (需要转义)
    const regex = /!\[.*?\]\((https?:\/\/[^\s)]+)\)/;
    const match = text.match(regex);

    // 如果匹配成功，match[1] 将包含捕获组的内容（即图片 URL）
    // 否则返回 null
    return match ? match[1] : null;
}

export function formatDuration(durationMs: number): string {
    if (isNaN(durationMs) || durationMs < 0) {
        return "N/A";
    }
    const totalSeconds = Math.round(durationMs / 1000);
    if (totalSeconds === 0 && durationMs > 0) {
        return "00:00";
    }
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;

    const durationStr = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
    const coloredDurationStr = chalk.yellow(durationStr);

    return coloredDurationStr;
}

