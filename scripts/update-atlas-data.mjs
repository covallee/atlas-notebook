#!/usr/bin/env node

import { access, mkdir, readFile, rename, rm, writeFile } from 'node:fs/promises';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { randomUUID } from 'node:crypto';

const scriptDirectory = dirname(fileURLToPath(import.meta.url));
const projectDirectory = resolve(scriptDirectory, '..');
const dataFileNames = ['maps.json', 'monsters.json'];

function isRecord(value) {
  return value !== null && typeof value === 'object' && !Array.isArray(value);
}

function stableStringify(value) {
  if (Array.isArray(value)) {
    return `[${value.map(stableStringify).join(',')}]`;
  }

  if (isRecord(value)) {
    return `{${Object.keys(value)
      .sort()
      .map((key) => `${JSON.stringify(key)}:${stableStringify(value[key])}`)
      .join(',')}}`;
  }

  return JSON.stringify(value);
}

function difference(left, right) {
  return [...left].filter((value) => !right.has(value));
}

function formatList(values, limit = 20) {
  if (values.length === 0) {
    return 'none';
  }

  const displayed = values.slice(0, limit).join(', ');
  return values.length > limit ? `${displayed}, ... (${values.length - limit} more)` : displayed;
}

function compareMaps(previousMaps, nextMaps) {
  const previous = new Map(previousMaps.map((map) => [map.name, map]));
  const next = new Map(nextMaps.map((map) => [map.name, map]));
  const added = difference(next.keys(), previous);
  const removed = difference(previous.keys(), next);
  const changed = [];

  for (const [name, map] of next) {
    const oldMap = previous.get(name);
    if (!oldMap) {
      continue;
    }

    const fields = new Set([...Object.keys(oldMap), ...Object.keys(map)]);
    const changedFields = [...fields]
      .filter((field) => stableStringify(oldMap[field]) !== stableStringify(map[field]))
      .sort();

    if (changedFields.length > 0) {
      changed.push(`${name} (${changedFields.join(', ')})`);
    }
  }

  return { added, removed, changed };
}

function compareMonsters(previousMonsters, nextMonsters) {
  const previous = new Set(Object.keys(previousMonsters));
  const next = new Set(Object.keys(nextMonsters));
  const changed = [...next]
    .filter((id) => id in previousMonsters && previousMonsters[id] !== nextMonsters[id])
    .sort();

  return {
    added: difference(next, previous),
    removed: difference(previous, next),
    changed,
  };
}

export function validateData(maps, monsters, { knownExternalAtlasConnections = new Set() } = {}) {
  const errors = [];

  if (!Array.isArray(maps) || maps.length === 0) {
    errors.push('maps.json must contain a non-empty array.');
  }

  if (!isRecord(monsters) || Object.keys(monsters).length === 0) {
    errors.push('monsters.json must contain a non-empty object.');
  }

  if (errors.length > 0) {
    return errors;
  }

  for (const [id, name] of Object.entries(monsters)) {
    if (typeof id !== 'string' || id.length === 0 || typeof name !== 'string' || name.length === 0) {
      errors.push(`monsters.json entry "${id}" must map to a non-empty monster name.`);
    }
  }

  const mapNames = new Set();
  const mapIds = new Set();

  for (const [index, map] of maps.entries()) {
    const label = `maps.json entry ${index + 1}`;
    if (!isRecord(map)) {
      errors.push(`${label} must be an object.`);
      continue;
    }

    if (typeof map.name !== 'string' || map.name.length === 0) {
      errors.push(`${label} must have a non-empty name.`);
    } else if (mapNames.has(map.name)) {
      errors.push(`${label} duplicates map name "${map.name}".`);
    } else {
      mapNames.add(map.name);
    }

    if (!Array.isArray(map.ids) || map.ids.length === 0 || map.ids.some((id) => typeof id !== 'string' || id.length === 0)) {
      errors.push(`${label} (${map.name ?? 'unnamed'}) must have at least one non-empty ID.`);
    } else {
      for (const id of map.ids) {
        if (mapIds.has(id)) {
          errors.push(`${label} (${map.name ?? 'unnamed'}) duplicates map ID "${id}".`);
        } else {
          mapIds.add(id);
        }
      }
    }

    if (map.boss_ids !== undefined && (!Array.isArray(map.boss_ids) || map.boss_ids.some((value) => typeof value !== 'string' || value.length === 0))) {
      errors.push(`${label} (${map.name ?? 'unnamed'}) has an invalid boss_ids list.`);
    }

    if (map.connected !== undefined && (!Array.isArray(map.connected) || map.connected.some((value) => typeof value !== 'string'))) {
      errors.push(`${label} (${map.name ?? 'unnamed'}) has an invalid connected list.`);
    }

    if (map.atlas === true && Array.isArray(map.connected) && map.connected.some((value) => value.length === 0)) {
      errors.push(`${label} (${map.name ?? 'unnamed'}) has an empty atlas connection.`);
    }

    if (map.atlas === true && (!Number.isFinite(map.x) || !Number.isFinite(map.y))) {
      errors.push(`${label} (${map.name ?? 'unnamed'}) is an atlas map and must have numeric x and y coordinates.`);
    }
  }

  for (const map of maps) {
    if (!isRecord(map) || typeof map.name !== 'string') {
      continue;
    }

    if (map.atlas === true) {
      for (const connectedMap of map.connected ?? []) {
        if (
          typeof connectedMap === 'string' &&
          connectedMap.length > 0 &&
          !mapNames.has(connectedMap) &&
          !knownExternalAtlasConnections.has(connectedMap)
        ) {
          errors.push(`Atlas map "${map.name}" connects to unknown map "${connectedMap}".`);
        }
      }
    }

    for (const bossId of map.boss_ids ?? []) {
      if (typeof bossId === 'string' && !(bossId in monsters)) {
        errors.push(`Map "${map.name}" references unknown boss ID "${bossId}".`);
      }
    }
  }

  return errors;
}

async function readJson(filePath) {
  let contents;
  try {
    contents = await readFile(filePath, 'utf8');
  } catch (error) {
    throw new Error(`Could not read ${filePath}: ${error.message}`);
  }

  try {
    return { contents, value: JSON.parse(contents) };
  } catch (error) {
    throw new Error(`Could not parse ${filePath}: ${error.message}`);
  }
}

async function readDataDirectory(directory) {
  const entries = await Promise.all(
    dataFileNames.map(async (fileName) => [fileName, await readJson(join(directory, fileName))]),
  );
  return Object.fromEntries(entries);
}

async function writeDataDirectory(destinationDirectory, sourceData) {
  await mkdir(destinationDirectory, { recursive: true });
  const temporaryFiles = [];

  try {
    for (const fileName of dataFileNames) {
      const temporaryPath = join(destinationDirectory, `.${fileName}.${randomUUID()}.tmp`);
      await writeFile(temporaryPath, sourceData[fileName].contents);
      temporaryFiles.push([temporaryPath, join(destinationDirectory, fileName)]);
    }

    for (const [temporaryPath, destinationPath] of temporaryFiles) {
      await rename(temporaryPath, destinationPath);
    }
  } finally {
    await Promise.all(
      temporaryFiles.map(async ([temporaryPath]) => {
        await rm(temporaryPath, { force: true });
      }),
    );
  }
}

export function createChangeReport(currentData, incomingData) {
  return {
    maps: compareMaps(currentData['maps.json'].value, incomingData['maps.json'].value),
    monsters: compareMonsters(currentData['monsters.json'].value, incomingData['monsters.json'].value),
  };
}

export function formatChangeReport(report) {
  return [
    'Atlas data change summary:',
    `  Maps: ${report.maps.added.length} added, ${report.maps.removed.length} removed, ${report.maps.changed.length} changed`,
    `    Added: ${formatList(report.maps.added)}`,
    `    Removed: ${formatList(report.maps.removed)}`,
    `    Changed: ${formatList(report.maps.changed)}`,
    `  Monsters: ${report.monsters.added.length} added, ${report.monsters.removed.length} removed, ${report.monsters.changed.length} changed`,
    `    Added: ${formatList(report.monsters.added)}`,
    `    Removed: ${formatList(report.monsters.removed)}`,
    `    Changed: ${formatList(report.monsters.changed)}`,
  ].join('\n');
}

function findExternalAtlasConnections(maps) {
  const mapNames = new Set(maps.filter(isRecord).map((map) => map.name));
  return new Set(
    maps
      .filter((map) => isRecord(map) && map.atlas === true)
      .flatMap((map) => map.connected ?? [])
      .filter((connection) => typeof connection === 'string' && connection.length > 0 && !mapNames.has(connection)),
  );
}

export async function runUpdate({
  sourceDirectory = projectDirectory,
  destinationDirectory = join(projectDirectory, 'src', 'lib', 'data'),
  dryRun = false,
  logger = console.log,
} = {}) {
  const incomingData = await readDataDirectory(sourceDirectory);
  const currentData = await readDataDirectory(destinationDirectory);
  const errors = validateData(incomingData['maps.json'].value, incomingData['monsters.json'].value, {
    knownExternalAtlasConnections: findExternalAtlasConnections(currentData['maps.json'].value),
  });

  if (errors.length > 0) {
    throw new Error(`Incoming atlas data is invalid:\n${errors.map((error) => `  - ${error}`).join('\n')}`);
  }

  const report = createChangeReport(currentData, incomingData);
  logger(formatChangeReport(report));

  if (dryRun) {
    logger('Dry run complete; application data was not changed.');
    return report;
  }

  await writeDataDirectory(destinationDirectory, incomingData);
  logger(`Updated ${join(destinationDirectory, 'maps.json')} and ${join(destinationDirectory, 'monsters.json')}.`);
  return report;
}

function parseArguments(argumentsList) {
  const options = {};

  for (let index = 0; index < argumentsList.length; index += 1) {
    const argument = argumentsList[index];
    if (argument === '--dry-run') {
      options.dryRun = true;
    } else if (argument === '--source-dir' || argument === '--destination-dir') {
      const directory = argumentsList[index + 1];
      if (!directory || directory.startsWith('--')) {
        throw new Error(`${argument} requires a directory path.`);
      }
      options[argument === '--source-dir' ? 'sourceDirectory' : 'destinationDirectory'] = resolve(directory);
      index += 1;
    } else if (argument === '--help') {
      return { help: true };
    } else {
      throw new Error(`Unknown option "${argument}".`);
    }
  }

  return options;
}

function printHelp() {
  console.log(`Usage: npm run update-atlas-data -- [options]

Validate root-level maps.json and monsters.json, report their changes, and
synchronize them into src/lib/data/.

Options:
  --dry-run                  Validate and report without copying files.
  --source-dir <directory>   Override the directory containing downloaded JSON.
  --destination-dir <dir>    Override the application data directory.
  --help                     Show this help message.`);
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  try {
    const options = parseArguments(process.argv.slice(2));
    if (options.help) {
      printHelp();
    } else {
      await runUpdate(options);
    }
  } catch (error) {
    console.error(`Atlas data update failed: ${error.message}`);
    process.exitCode = 1;
  }
}
