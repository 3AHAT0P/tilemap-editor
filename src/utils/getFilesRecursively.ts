export const getFilesRecursively = async (
  accumulator: File[],
  entry: FileSystemFileHandle | FileSystemDirectoryHandle,
  options: { type: string },
) => {
  if (entry.kind === 'file') {
    const file = await entry.getFile();
    if (file !== null && file.type === options.type) accumulator.push(file);

  } else if (entry.kind === 'directory') {
    for await (const handle of entry.values()) {
      await getFilesRecursively(accumulator, handle, options);
    }
  }
};
