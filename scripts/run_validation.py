import os, subprocess,shutil,glob,sys
import argparse
from pathlib import Path


def run(args):
  repo_url = 'https://github.com/DassaultSystemes-Technology/EnterprisePBRShadingModel.git'
  outdir = 'validation/renderings'

  if os.path.isdir('validation'):
    shutil.rmtree('validation', ignore_errors=True)

  if os.path.isdir('EnterprisePBRShadingModel'):
    os.chdir('EnterprisePBRShadingModel')
    subprocess.call(["git", "pull"])
    os.chdir('../')
  else:
    subprocess.call(["git", "clone", repo_url])

  ibl_path = "../EnterprisePBRShadingModel/validation/scenes/ball/environment.hdr"

  scenarios = [
    "ball",
    "sphere",
    "sphere-ibl"
  ]

  if args.scenario: # only render specifi scenario
    if args.scenario in scenarios:
      scenarios = [args.scenario]
    else:
      raise ValueError("Provided scenario is not valid. Please check the list of valid scenarios")

  for scenario in scenarios:
    scenario_path = os.path.join("EnterprisePBRShadingModel/validation/scenes", scenario)
    os.makedirs(os.path.join(outdir, scenario), exist_ok=True)

    files = glob.glob(scenario_path + '/*.gltf')
    hdrs = glob.glob(scenario_path + '/*.hdr')

    if args.filter:
      files = [f for f in files if args.filter in f]
      print("Rendering filtered list of files: ", files)

    for file in files:
      if args.testcase and args.testcase != os.path.splitext(os.path.basename(file))[0]:
        continue;

      out_image = os.path.join(outdir, scenario, os.path.splitext(os.path.basename(file))[0])

      file  = file.replace('\\', '/')
      out_image  = out_image.replace('\\', '/')

      render_call = ['npm', 'run', 'render', '--', '--', "../"+ file, '--res', '400', '400', '--samples', '128', '-b', '32'];
      if len(hdrs) > 0:
        ibl_path = '../' + hdrs[0].replace('\\', '/')
        subprocess.run(render_call + ['--ibl', ibl_path], shell=True)
      else:
        subprocess.run(render_call, shell=True)

      print("copying file to: " + out_image)
      shutil.copyfile('output.png', out_image + '.png')

  os.chdir('EnterprisePBRShadingModel/validation/')
  subprocess.run(['python', 'validate.py', '-i', '../../'+outdir, '-m', 'only_gamma', '-t', '0.5', '-o', '../../validation/report'], shell=True)


if __name__ == "__main__":
  parser = argparse.ArgumentParser(description='Run renderer validation.')
  parser.add_argument('-s', '--scenario', type=str, help='A specific scenario to run [ball,sphere,sphere-ibl]')
  parser.add_argument('-t','--testcase', help='A specific testscase to run')
  parser.add_argument('-f','--filter', help='A string which is being used to match scene names to render')
  args = parser.parse_args()

  run(args)