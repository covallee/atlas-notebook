import assert from 'node:assert/strict';
import { mkdir, mkdtemp, readFile, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import test from 'node:test';

import { runUpdate } from '../scripts/update-atlas-data.mjs';

const validMaps = [
  {
    atlas: true,
    boss_ids: ['Metadata/Monsters/Boss'],
    connected: ['Second Map'],
    ids: ['MapOne'],
    name: 'First Map',
    x: 100,
    y: 200,
  },
  {
    ids: ['MapTwo'],
    name: 'Second Map',
  },
];

const validMonsters = {
  'Metadata/Monsters/Boss': 'Test Boss',
};

async function writeData(directory, maps = validMaps, monsters = validMonsters) {
  await writeFile(join(directory, 'maps.json'), JSON.stringify(maps, null, 2));
  await writeFile(join(directory, 'monsters.json'), JSON.stringify(monsters, null, 2));
}

async function createDirectories() {
  const root = await mkdtemp(join(tmpdir(), 'atlas-update-'));
  const sourceDirectory = join(root, 'source');
  const destinationDirectory = join(root, 'destination');
  await Promise.all([mkdir(sourceDirectory), mkdir(destinationDirectory)]);
  return { root, sourceDirectory, destinationDirectory };
}

test('synchronizes validated data and reports changes', async (t) => {
  const { root, sourceDirectory, destinationDirectory } = await createDirectories();
  t.after(() => rm(root, { recursive: true, force: true }));
  await writeData(sourceDirectory);
  await writeData(destinationDirectory, [{ ids: ['OldMap'], name: 'Old Map' }], {});
  const output = [];

  const report = await runUpdate({
    sourceDirectory,
    destinationDirectory,
    logger: (message) => output.push(message),
  });

  assert.deepEqual(JSON.parse(await readFile(join(destinationDirectory, 'maps.json'), 'utf8')), validMaps);
  assert.deepEqual(JSON.parse(await readFile(join(destinationDirectory, 'monsters.json'), 'utf8')), validMonsters);
  assert.deepEqual(report.maps.added.sort(), ['First Map', 'Second Map']);
  assert.deepEqual(report.maps.removed, ['Old Map']);
  assert.match(output[0], /Maps: 2 added, 1 removed, 0 changed/);
});

test('rejects invalid cross-references without changing application data', async (t) => {
  const { root, sourceDirectory, destinationDirectory } = await createDirectories();
  t.after(() => rm(root, { recursive: true, force: true }));
  const invalidMaps = [{ ...validMaps[0], connected: ['Missing Map'] }];
  await writeData(sourceDirectory, invalidMaps);
  await writeData(destinationDirectory);
  const before = await readFile(join(destinationDirectory, 'maps.json'), 'utf8');

  await assert.rejects(
    runUpdate({ sourceDirectory, destinationDirectory }),
    /Atlas map "First Map" connects to unknown map "Missing Map"/,
  );

  assert.equal(await readFile(join(destinationDirectory, 'maps.json'), 'utf8'), before);
});

test('rejects malformed JSON without changing application data', async (t) => {
  const { root, sourceDirectory, destinationDirectory } = await createDirectories();
  t.after(() => rm(root, { recursive: true, force: true }));
  await writeData(destinationDirectory);
  await writeFile(join(sourceDirectory, 'maps.json'), '{invalid JSON');
  await writeFile(join(sourceDirectory, 'monsters.json'), JSON.stringify(validMonsters));
  const before = await readFile(join(destinationDirectory, 'maps.json'), 'utf8');

  await assert.rejects(
    runUpdate({ sourceDirectory, destinationDirectory }),
    /Could not parse .*maps\.json/,
  );

  assert.equal(await readFile(join(destinationDirectory, 'maps.json'), 'utf8'), before);
});
