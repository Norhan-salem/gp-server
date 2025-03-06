import express from "express";
import { COVERGROUPS, randomNumberBetween } from "./db.mjs";

const router = express.Router();


router.get("/cover-groups", (_req, res) => {
  const cvgs = COVERGROUPS.map(cg => {
    return {
      id: cg.id,
      name: cg.name,
      numOfClusters: cg.clusters.length,
      numOfCrosses: cg.crosses.length,
      numOfCoverpoints: cg.coverpoints.length,
      coverage: cg.coverage,
      coverageIncrease: cg.coverageIncrease
    }
  });
  return res.status(200).json(cvgs);
});

router.get("/covergroup-heatmap", (req, res) => {
  const { size } = req.query;
  const half = Math.floor(COVERGROUPS.length / 2);
  const threeFourth = Math.floor(COVERGROUPS.length / 3);
  size = size || half;
  size = Math.min(size, COVERGROUPS.length);

  const sorted = COVERGROUPS.sort((a, b) => b.coverageIncrease - a.coverageIncrease);
  const heatmap = sorted.slice(0, size).map(cg => {
    return {
      id: cg.id,
      name: cg.name,
      coverage: cg.coverage,
      coverageIncrease: cg.coverageIncrease
    }
  });
  return res.status(200).json(heatmap);
});

router.get("/cover-groups/:cgId/clusters", (req, res) => {
  const { cgId } = req.params;
  const cvg = COVERGROUPS.find(cg => cg.id === cgId);
  if (!cvg) {
    return res.status(404).json({
      error: 'Covergroup not found'
    });
  }

  const clusters = cvg.clusters.map(cl => {
    return {
      id: cl.id,
      name: cl.name,
      numOfCrosses: cl.crosses.length
    }
  });
  return res.status(200).json(clusters);
});

router.get("/cover-groups/:cgId/cluster/:clusterId", (req, res) => {
  const { cgId, clusterId } = req.params;
  const cvg = COVERGROUPS.find(cg => cg.id === cgId);
  if (!cvg) {
    return res.status(404).json({
      error: 'Covergroup not found'
    });
  }

  const cluster = cvg.clusters.find(cl => cl.id === clusterId);
  if (!cluster) {
    return res.status(404).json({
      error: 'Cluster not found in this covergroup'
    });
  }

  const links = [];
  const nodes = [];
  for (const cross of cluster.crosses) {
    nodes.push(cross);
    for (const cp of cross.coverpoints) {
      nodes.push(cp);
      links.push([cross.id, cp.id]);
    }
  }

  return res.status(200).json({
    nodes,
    links
  });
});


export default router;