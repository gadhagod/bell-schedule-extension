##!/usr/bin/env python 
from json import dump, loads, dumps
from os.path import join
from pathlib import Path
from sys import argv
import utils

extension_path = Path(__file__).parent.resolve().parent.resolve()
manifest_path = join(extension_path, "manifest.json")
package_path = join(extension_path, "package.json")
args = argv[1:]

if(not args):
    print(f"""\nConfigures versioning files to list a new version
USAGE: python3 {join(utils.to_green(Path(__file__).parent.resolve()), utils.to_green(__file__))} [version]\n
{utils.to_red('No version argument supplied')}\n""")
    exit(1)

new_version = args[0]
manifest, package = loads(open(manifest_path, "r").read()), loads(open(package_path, "r").read())
manifest["version"] = package["version"] = new_version

open(manifest_path, "w+").write(dumps(manifest, indent=4))
open(package_path, "w+").write(dumps(package, indent=2))

print(utils.to_green(f"Set version to {new_version}"))