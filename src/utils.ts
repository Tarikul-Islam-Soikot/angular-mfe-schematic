import { Tree } from '@angular-devkit/schematics';

export function createOrOverwrite(tree: Tree, path: string, content: string, force?: boolean): void {
  if (tree.exists(path)) {
    if (force) {
      tree.overwrite(path, content);
    } else {
      throw new Error(`Path "${path}" already exist.`);
    }
  } else {
    tree.create(path, content);
  }
}
