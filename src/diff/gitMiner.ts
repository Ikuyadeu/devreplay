import * as git from 'simple-git/promise';
import { DefaultLogFields } from 'simple-git/src/lib/tasks/log';
import { ListLogLine } from 'simple-git/typings/response';

export type DetailedDiff = {
  log: (DefaultLogFields & ListLogLine),
  diff: string
}

export class Project {
  path: string
  localGit: git.SimpleGit

  constructor(path: string) {
    this.path = path;
    this.localGit = git(this.path);
  }
  
  async getDiffs (logLength: number) {
    const diffs: string[] = [];
    const hashes = this.getHashes(logLength);
    for (const hash of await hashes) {
      const diff = this.localGit.diff([hash]);
      diffs.push(await diff);
    }
    return diffs;
  }

  async getHashes(logLength: number) {
    const hashes: string[] = [];
    const log = await this.localGit.log({});
    for (let index = 0; index < Math.min(log.total, logLength); index++) {
      const logLine = log.all[index];
      hashes.push(logLine.hash);
    }
    return hashes;
  }

  async getDiffsDetail(logLength: number) {
    const diffs: DetailedDiff[] = [];
    const logs = await this.localGit.log({});
    for (let index = 0; index < Math.min(logs.total, logLength); index++) {
      const log = logs.all[index];
      const diff = await this.localGit.diff([log.hash]);

      diffs.push({ log, diff });
    }
    return diffs;
  }

  // async getChangedFilesWithHEAD (length: number, length2?: number): Promise<string[]> {  
  //   const diffLength = [];
  //   if (length2 !== undefined) {
  //     diffLength.push(`HEAD~${length2}..HEAD~${length}`);
  //   } else {
  //     diffLength.push(`HEAD~${length}`);
  //   }
  //   const diff = await this.localGit.diffSummary(diffLength);
  //   return diff.files
  //     .map(file => { return file.file; });
  // }

  // async getfiles(index: string): Promise<string>{
  //   return await this.localGit.catFile(['-p', index]);
  // }
}

export async function getChangedFilesWithHEAD (dirPath: string, length: number, length2?: number): Promise<string[]> {
  const localGit: git.SimpleGit = git(dirPath);

  const diffLength = [];
  if (length2 !== undefined) {
    diffLength.push(`HEAD~${length2}..HEAD~${length}`);
  } else {
    diffLength.push(`HEAD~${length}`);
  }
  const diff = await localGit.diffSummary(diffLength);
  return diff.files
    .map(file => { return file.file; });
}
