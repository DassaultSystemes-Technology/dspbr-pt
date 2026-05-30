declare module 'simple-dropzone' {
  export class SimpleDropzone {
    constructor(element: HTMLElement, input: HTMLInputElement);
    on(event: 'dropstart', callback: () => void): void;
    on(event: 'drop', callback: (event: { files: Map<string, File> }) => void | Promise<void>): void;
  }
}
