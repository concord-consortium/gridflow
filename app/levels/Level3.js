module.exports = {
  // The number of milliseconds after which a game is won.
  winAfter: 90000,
  //The amount of time(milliseconds) before a blackout
  blackoutDelay: 10000,
  // The starting time of day, 0<=t<1. 0 is 12:00 am, 0.5 is 12:00 pm.
  startTime: 0.5,
  // The length of a day in milliseconds, or a negative number for frozen time.
  dayLength: 30000,
  // The amount of energy transferred by each contract.
  energyPerContract: 1,
  // The maximum energy in a contract made with a city.
  // Set to a non-positive number for an arbitrary number or contracts.
  maxEnergyPerContract: 1,
  // The amount of time in milliseconds that a contract remains open
  // Use a non-positive number for infinite time.
  contractLength: 10000,
  // The amount of extra energy floating around
  extraEnergy: 1,
  players: [
    {
      supply: [
        {
          name: "Wind",
          type: "random",
          amount: 5,
          // random starts at 3, and each update, has variation added or subracted from it.
          // However, the random number is kept within maxVariation of the given amount.
          variation: 0.2,
          maxVariation: 2
        }
      ],
      // Relative demand will change based on energy conditions,
      // but ratios between cities will remain constant.
      relativeDemand: 4
    },
    {
      supply: [
        {
          name: "Wind",
          type: "random",
          amount: 2,
          variation: 0.2,
          maxVariation: 1
        },
        {
          name: "Solar",
          type: "cycle",
          amount: 1,
          // cycle is computed the amount + cos(time) * variation.
          variation: 1
        }
      ],
      relativeDemand: 4
    },
    {
      supply: [
        {
          name: "Fossil",
          type: "random",
          amount: 2,
          variation: 0.1,
          maxVariation: 1
        },
        {
          name: "Wind",
          type: "random",
          amount: 3,
          variation: 0.2,
          maxVariation: 2
        }
      ],
      relativeDemand: 4
    },

    {
      supply: [
        {
          name: "Fossil",
          type: "random",
          amount: 1,
          variation: 0.02,
          maxVariation: 1
        },
        {
          name: "Solar",
          type: "cycle",
          amount: 2,
          variation: 2
        }
      ],
      relativeDemand: 4
    }
  ]
};
