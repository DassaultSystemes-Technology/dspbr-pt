#!/usr/bin/env python
# @license
# Copyright 2020  Dassault Systemes - All Rights Reserved.
# Licensed under the Apache License, Version 2.0 (the "License");
# you may not use this file except in compliance with the License.
# You may obtain a copy of the License at
#
#     http://www.apache.org/licenses/LICENSE-2.0
#
# Unless required by applicable law or agreed to in writing, software
# distributed under the License is distributed on an "AS IS" BASIS,
# WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
# See the License for the specific language governing permissions and
# limitations under the License.

import os, glob
import json

path = "./assets/scenes/"

files = {}

glbs = glob.glob(path + "**/*.glb", recursive=True)
gltfs = glob.glob(path + "**/*.gltf", recursive=True)

paths = gltfs + glbs
paths.sort()

for f in paths:
    n = os.path.splitext(os.path.basename(f))[0]
    files[n] = f

data_str = json.dumps(files, indent=4)
data_str = data_str.replace('\\\\', '/')
print(data_str)

with open(path + 'scene_index.js', 'w') as outfile:
    outfile.write("var scene_index = ");
    outfile.write(data_str)
    outfile.write(";\n\n")
    outfile.write("export default scene_index;\n")
