import * as fs from "fs";

export async function tryReadFile(filename: string) {
    if (!fs.existsSync(filename)) {
        throw new Error(`Unable to open file: ${filename}`);
    }
    const buffer = Buffer.allocUnsafe(256);
    const fd = fs.openSync(filename, "r");
    try {
        fs.readSync(fd, buffer, 0, 256, 0);
        if (buffer.readInt8(0) === 0x47 && buffer.readInt8(188) === 0x47) {
            /* MPEG transport streams use the '.ts' file extension. They use 0x47 as the frame
            // separator, repeating every 188 bytes. It is unlikely to find that pattern in
            // TypeScript source, so tslint ignores files with the specific pattern.*/
            console.log(`${filename}: ignoring MPEG transport stream\n`);

            return undefined;
        }
    } finally {
        fs.closeSync(fd);
    }

    return fs.readFileSync(filename, "utf8");
}
