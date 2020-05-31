import * as core from '@actions/core';
import * as exec from '@actions/exec';
import * as io from '@actions/io';
import * as path from 'path';
import * as os from 'os';

async function run() {
  try {
    const version =
      core.getInput('version') == 'snapshot'
        ? 'master'
        : core.getInput('version');
    const archive_name =
      core.getInput('version') == 'snapshot' ? 'master.zip' : `v${version}.zip`;
    const home = os.homedir();
    const tmp = os.tmpdir();

    core.startGroup('Fetch Keg');
    await exec.exec('curl', [
      '-L',
      `https://github.com/conao3/keg.el/archive/${archive_name}`,
      '-o',
      `${tmp}/${archive_name}`
    ]);
    await exec.exec('unzip', [`${tmp}/${archive_name}`, '-d', `${tmp}`]);
    const options = {recursive: true, force: false};
    await io.mv(`${tmp}/keg-${version}`, `${home}/.keg`, options);
    core.addPath(`${home}/.keg/bin`);
    core.endGroup();

    core.startGroup('Install dependency');
    await exec.exec('keg', ['--version']);
    core.endGroup();

    // show Keg version
    await exec.exec('keg', ['--version']);
  } catch (err) {
    core.setFailed(err.message);
  }
}

run();
