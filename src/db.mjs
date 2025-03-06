// This file is for in-memory database for covergroups / coverpoints / crosses
// Every time the server is restarted, new data is generated

import { v4 as uuidv4 } from 'uuid';
import { faker } from '@faker-js/faker';
let { CG_COUNT, CP_COUNT, CROSS_COUNT } = process.env;

CG_COUNT = CG_COUNT || randomNumberBetween(10, 20);
CP_COUNT = CP_COUNT || randomNumberBetween(50, 100);
CROSS_COUNT = CROSS_COUNT || randomNumberBetween(25, 50);

const BIN_TYPES = ['NORMAL_BIN', 'IGNORE_BIN', 'ILLEGAL_BIN'];

export function randomNumberBetween(min, max) {
  return Math.floor(Math.random() * (max - min + 1) + min);
}

function randomArrIndex(max) {
  return randomNumberBetween(0, max - 1);
}

/**
 * @type {Covergroup[]}
 */
export const COVERGROUPS = Array.from({ length: CG_COUNT }, (_, i) => ({
  id: uuidv4(),
  name: `Covergroup ${i + 1}`,
  coverage: randomNumberBetween(0, 100),
  coverageIncrease: faker.number.float({
    max: 50,
    fractionDigits: 2
  }),
  coverpoints: [],
  crosses: [],
  clusters: [],
}));
const covergroupIds = COVERGROUPS.map(cg => cg.id);

/**
 * @type {Coverpoint[]}
 */
export const COVERPOINTS = Array.from({ length: CP_COUNT }, (_, i) => {
  return {
    id: uuidv4(),
    name: `Coverpoint ${i + 1}`,
    type: 'COVER_POINT',
    coverage: 0,
    bins: Array.from({ length: randomNumberBetween(2, 10) }, (_, j) => ({
      id: uuidv4(),
      label: `Bin ${i + 1}/${j + 1}`,
      type: BIN_TYPES[randomArrIndex(BIN_TYPES.length)],
      coverage: 0
    }))
  }
});

/**
 * @type {Cross[]}
 */
export const CROSSES = Array.from({ length: CROSS_COUNT }, (_, i) => {
  return {
    id: uuidv4(),
    name: `Cross ${i + 1}`,
    type: 'COVER_CROSS',
    coverage: 0,
    coverpoints: []
  }
});

// Loop on coverpoints to assign to covergroups
for (const cp of COVERPOINTS) {
  const cgId = covergroupIds[randomArrIndex(covergroupIds.length)];
  const cg = COVERGROUPS.find(cg => cg.id === cgId);
  cp.coverage = randomNumberBetween(0, cg.coverage);
  cp.bins.forEach(bin => {
    bin.coverage = randomNumberBetween(0, cp.coverage);
  });
  cg.coverpoints.push(cp);
}

// Loop on crosses to assign to covergroups
for (const cr of CROSSES) {
  const cgId = covergroupIds[randomArrIndex(covergroupIds.length)];
  const cg = COVERGROUPS.find(cg => cg.id === cgId);
  cr.coverage = randomNumberBetween(0, cg.coverage);
  cg.crosses.push(cr);
}

const toRemove = []

// Loop on covergroups and assign coverpoints to crosses and cluster crosses
for (const cg of COVERGROUPS) {
  // If no coverpoints or crosses, skip
  if (!cg.coverpoints.length || !cg.crosses.length) {
    toRemove.push(cg);
    continue;
  }

  if (cg.coverpoints.length < 2) {
    toRemove.push(cg);
    continue;
  }

  // Assign coverpoints to crosses
  // for (const cp of cg.coverpoints) {
  //   let cross;
  //   do {
  //     cross = cg.crosses[randomArrIndex(cg.crosses.length)];
  //   } while (cross.coverpoints.includes(cp));
  //   cross.coverpoints.push(cp);
  // }

  for (const cr of cg.crosses) {
    const numOfCoverpoints = randomNumberBetween(2, cg.coverpoints.length);
    for (let i = 0; i < numOfCoverpoints; i++) {
      let cp;
      do {
        cp = cg.coverpoints[randomArrIndex(cg.coverpoints.length)];
      } while (cr.coverpoints.includes(cp));
      cr.coverpoints.push(cp);
    }
  }

  // Cluster crosses
  const numOfClusters = randomNumberBetween(Math.max(1, Math.floor(cg.crosses.length / 2)), cg.crosses.length);
  for (let i = 0; i < numOfClusters; i++) {
    const cluster = {
      id: uuidv4(),
      name: `Cluster ${i + 1}`,
      crosses: []
    };
    const numOfCrosses = randomNumberBetween(1, Math.max(1, cg.crosses.length - 2));
    for (let j = 0; j < numOfCrosses; j++) {
      const cross = cg.crosses[randomArrIndex(cg.crosses.length)];
      cluster.crosses.push(cross);
    }
    cg.clusters.push(cluster);
  }
}

for (const rem of toRemove) {
  const i = COVERGROUPS.indexOf(rem);
  if (i !== -1) {
    COVERGROUPS.splice(i, 1);
  }
}