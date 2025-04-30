import * as dotenv from "dotenv";

export default function loadConfig() {
    dotenv.config({ override: true });
}

