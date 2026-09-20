module.exports = {
  stores: [
    {
      id: "ROSE",
      name: "Rose Donuts",
      neighborhood: "Midtown Sacramento",
      type: "donut",
      treat: "mini donut",
      treatCapWeek: 10,
      family: true
    },
    {
      id: "711-J",
      name: "7-Eleven on J Street",
      neighborhood: "Midtown Sacramento",
      type: "cstore",
      treat: "small Slurpee",
      treatCapWeek: 10,
      family: true
    },
    {
      id: "OAK",
      name: "Oak Park Market",
      neighborhood: "Oak Park",
      type: "cstore",
      treat: "cookie",
      treatCapWeek: 10,
      family: true
    }
  ],
  puzzles: [
    {
      id: "p1",
      week: "2026-W38",
      title: "Box count",
      prompt: "A donut shop stacks pink boxes in twos. If there are 4 stacks, how many boxes?",
      choices: ["4", "6", "8", "12"],
      answer: "8",
      hint: "2 × 4"
    },
    {
      id: "p2",
      week: "2026-W38",
      title: "Slurp pattern",
      prompt: "Blue, red, blue, red, blue… what color is next?",
      choices: ["Blue", "Red", "Green", "Pink"],
      answer: "Red",
      hint: "It switches every time."
    },
    {
      id: "p3",
      week: "2026-W38",
      title: "Neighborhood letters",
      prompt: "How many letters in MIDTOWN?",
      choices: ["5", "6", "7", "8"],
      answer: "7",
      hint: "Count them out loud."
    }
  ],
  artists: [
    {
      id: "a1",
      name: "Humidity Glow",
      neighborhood: "Midtown Sacramento",
      song: "Porch Light",
      clip: "A hazy Midtown night drive. Demo clip — link out to Spotify in production.",
      stores: ["ROSE", "711-J"]
    },
    {
      id: "a2",
      name: "Clevers",
      neighborhood: "Sacramento",
      song: "Gather You",
      clip: "Local indie, bag-unlocked this week.",
      stores: ["ROSE", "OAK"]
    },
    {
      id: "a3",
      name: "Oak Park Kids",
      neighborhood: "Oak Park",
      song: "Stockton Line",
      clip: "Neighborhood sketch. Replace with a real streaming link.",
      stores: ["OAK"]
    }
  ]
};
