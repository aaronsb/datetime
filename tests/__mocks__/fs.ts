import { EventEmitter } from 'events';
import { Stats } from 'fs';

// Mock file system state
let mockFiles: { [path: string]: string } = {};

// Mock Stats object
class MockStats implements Stats {
  dev = 0;
  ino = 0;
  mode = 0;
  nlink = 0;
  uid = 0;
  gid = 0;
  rdev = 0;
  size = 0;
  blksize = 0;
  blocks = 0;
  atimeMs = 0;
  mtimeMs = 0;
  ctimeMs = 0;
  birthtimeMs = 0;
  atime = new Date();
  mtime = new Date();
  ctime = new Date();
  birthtime = new Date();
  isFile() { return true; }
  isDirectory() { return false; }
  isBlockDevice() { return false; }
  isCharacterDevice() { return false; }
  isSymbolicLink() { return false; }
  isFIFO() { return false; }
  isSocket() { return false; }
}

// Mock promises version of fs
export const promises = {
  readFile: async (path: string, encoding?: string): Promise<string> => {
    if (path in mockFiles) {
      return mockFiles[path];
    }
    throw new Error('ENOENT: no such file or directory');
  },

  writeFile: async (path: string, data: string): Promise<void> => {
    mockFiles[path] = data;
  },

  stat: async (path: string): Promise<Stats> => {
    if (path in mockFiles) {
      return new MockStats();
    }
    throw new Error('ENOENT: no such file or directory');
  },

  unlink: async (path: string): Promise<void> => {
    if (path in mockFiles) {
      delete mockFiles[path];
    }
  }
};

// Mock event emitter for file watching
class MockFSWatcher extends EventEmitter {
  close() {}
}

// Mock callback version of fs
export default {
  readFile: (path: string, encoding: string, callback: Function) => {
    if (path in mockFiles) {
      callback(null, mockFiles[path]);
    } else {
      callback(new Error('ENOENT: no such file or directory'));
    }
  },

  writeFile: (path: string, data: string, callback: Function) => {
    mockFiles[path] = data;
    callback(null);
  },

  watch: (path: string) => {
    return new MockFSWatcher();
  },

  // Helper methods for testing
  __setMockFiles: (files: { [path: string]: string }) => {
    mockFiles = { ...files };
  },

  __getMockFiles: () => {
    return { ...mockFiles };
  },

  __clearMockFiles: () => {
    mockFiles = {};
  }
};
