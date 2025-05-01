import { exit, env } from "node:process";
import chalk from "chalk";

import {
    readPromptFile,
    sendRequestsConcurrently
} from "./app.ts";

// 从 main.ts 移动过来的 action 函数

/**
 * Action to print the current prompt text.
 */
export async function printPromptTextAction() {
    console.log(chalk.dim(await readPromptFile()));
}

/**
 * Action to generate images based on the prompt.
 * @param options CLI options including concurrency and httpProxy.
 */
export async function generateAction(options: any) {
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

