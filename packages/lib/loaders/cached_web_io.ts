import { WebIO } from '@gltf-transform/core';
import { fetchCachedAsset } from './asset_cache';

export class CachedWebIO extends WebIO {
  constructor(private readonly fetchConfig?: RequestInit) {
    super(fetchConfig);
  }

  protected override async readURI(uri: string, type: 'view'): Promise<Uint8Array<ArrayBuffer>>;
  protected override async readURI(uri: string, type: 'text'): Promise<string>;
  protected override async readURI(uri: string, type: 'view' | 'text'): Promise<Uint8Array<ArrayBuffer> | string> {
    const response = await fetchCachedAsset(uri, this.fetchConfig);
    if (!response.ok) {
      throw new Error(`Failed to load asset: ${response.status} ${response.statusText}`);
    }

    switch (type) {
      case 'view':
        return new Uint8Array(await response.arrayBuffer()) as Uint8Array<ArrayBuffer>;
      case 'text':
        return response.text();
    }
  }
}
