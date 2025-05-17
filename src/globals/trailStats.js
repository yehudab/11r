let legs = {
  1: {trailDistance: [7.93]},
  2: {trailDistance: [13.2]},
  3: {trailDistance: [11]},
  4: {trailDistance: [12.7]},
  6: {trailDistance: [10.7]},
  7: {trailDistance: [12.4]},
  8: {trailDistance: [10.1]},
  9: {trailDistance: [8.85]},
  10: {trailDistance: [11.35]},
  11: {trailDistance: [9.41]},
  12: {trailDistance: [8.61]},
  13: {trailDistance: [11.9]},
  14: {trailDistance: [12.6]},
  15: {trailDistance: [10.9]},
  16: {trailDistance: [12.4]},
  17: {trailDistance: [14.7]},
  18: {trailDistance: [9.1]},
  19: {trailDistance: [12.6]},
  20: {trailDistance: [12.7]},
  21: {trailDistance: [13.9]},
  22: {trailDistance: [16.5]},
  23: {trailDistance: [12.6]},
  24: {trailDistance: [9.10]},
  25: {trailDistance: [8.8]},
  26: {trailDistance: [10.7]},
  27: {trailDistance: [8.68]},
  28: {trailDistance: [12.7]},
  29: {trailDistance: [10.9]},
};

let total = Object.values(legs).reduce((sum, leg) => {
  if (Array.isArray(leg.trailDistance)) {
    return sum + leg.trailDistance.reduce((s, d) => s + d, 0);
  }
  return sum;
}, 0);

console.log("Total trail distance:", Math.round(total * 100) / 100, "km");

export default {
  total: Math.round(total * 100) / 100
};

