/*
 * Level 1
 * A level with fixed, unlabeled energy sources.
 * Winning involves issuing a contract.
 */
module.exports = {
  // The number of milliseconds after which a game is won.
  winAfter: 10000,
  // The amount of time(milliseconds) before a blackout
  blackoutDelay: 8000,
  // The starting time of day, 0<=t<1. 0 is 12:00 am, 0.5 is 12:00 pm.
  startTime: 0.5,
  // The length of a day in milliseconds, or a negative number for frozen time.
  dayLength: -1,
  // The amount of energy transferred by each contract.
  energyPerContract: 1,
  // The maximum energy in a contract made with a city.
  // Set to a non-positive number for an arbitrary number or contracts.
  maxEnergyPerContract: 1,
  // The amount of time in milliseconds that a contract remains open
  // Use a non-positive number for infinite time.
  contractLength: -1,
  // The amount of extra energy floating around
  extraEnergy: 0,
  players: [
    {
      supply: [
        {
          name: "",
          type: "fixed",
          amount: 5
        }
      ],
      // Relative demand will change based on energy conditions,
      // but ratios between cities will remain constant.
      relativeDemand: 4
    },
    {
      supply: [
        {
          name: "",
          type: "fixed",
          amount: 3
        }
      ],
      relativeDemand: 4
    },
    {
      supply: [
        {
          name: "",
          type: "fixed",
          amount: 5
        }
      ],
      relativeDemand: 4
    },

    {
      supply: [
        {
          name: "",
          type: "fixed",
          amount: 3
        }
      ],
      relativeDemand: 4
    }
  ]
};
