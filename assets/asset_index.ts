const scenes = [
  {
    "name": "metal-roughness-0.05",
    "url": "./assets/scenes/metal-roughness-0.05.gltf",
    "author": "Unknown",
    "source": "Enterprise PBR Validation Suite",
    "source_url":
      "https://github.com/DassaultSystemes-Technology/EnterprisePBRShadingModel/tree/master/validation",
    "license": "CC BY-SA 4.0",
    "license_url":
      "https://github.com/DassaultSystemes-Technology/EnterprisePBRShadingModel/blob/master/LICENSE.txt"
  },
  {
    "name": "refraction-base-and-specular-color",
    "url": "./assets/scenes/refraction-base-and-specular-color.gltf",
    "author": "Unknown",
    "source": "Enterprise PBR Validation Suite",
    "source_url":
      "https://github.com/DassaultSystemes-Technology/EnterprisePBRShadingModel/tree/master/validation",
    "license": "CC BY-SA 4.0",
    "license_url":
      "https://github.com/DassaultSystemes-Technology/EnterprisePBRShadingModel/blob/master/LICENSE.txt"
  },  
  {
    "name": "volume-translucency-and-specular-color",
    "url": "./assets/scenes/volume-translucency-and-specular-color.gltf",
    "author": "Unknown",
    "source": "Enterprise PBR Validation Suite",
    "source_url":
      "https://github.com/DassaultSystemes-Technology/EnterprisePBRShadingModel/tree/master/validation",
    "license": "CC BY-SA 4.0",
    "license_url":
      "https://github.com/DassaultSystemes-Technology/EnterprisePBRShadingModel/blob/master/LICENSE.txt"
  }
];

const ibls = [
  {
    "name": "Footprint Court",
    "url": "./assets/env/Footprint_Court_Env.hdr",
    "author": "Unknown",
    "source": "hdrlabs.com",
    "source_url": "http://www.hdrlabs.com/sibl/archive.html",
    "license": "CC BY-NC-SA 3.0",
    "license_url": "https://creativecommons.org/licenses/by-nc-sa/3.0/"
  },
  {
    "name": "Artist Workshop",
    "url": "./assets/env/artist_workshop_1k.hdr",
    "author": "Oliksiy Yakovlyev",
    "source": "hdrihaven.com",
    "source_url": "https://hdrihaven.com/",
    "license": "CC0",
    "license_url": "https://creativecommons.org/publicdomain/zero/1.0/"
  }
];


export function getScene(idx: number) {
  return scenes[idx];
}

export const scene_names = scenes.map(x => x.name);
export function getSceneByName(name: string) {
  return scenes[scene_names.indexOf(name)];
}

export function getIBL(idx) {
  return ibls[idx];
}

export const ibl_names = ibls.map(x => x.name);
export function getIBLByName(name: string) {
  return ibls[ibl_names.indexOf(name)];
}
