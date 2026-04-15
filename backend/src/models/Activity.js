const mongoose = require('mongoose');

// CO2 emission factors (kg CO2 per unit)
const EMISSION_FACTORS = {
  Transport: {
    car:      { factor: 0.21,  unit: 'km',   label: 'Car (Petrol)'  },
    bus:      { factor: 0.089, unit: 'km',   label: 'Bus'           },
    flight:   { factor: 0.255, unit: 'km',   label: 'Flight'        },
    bicycle:  { factor: 0,     unit: 'km',   label: 'Bicycle 🚴'    },
    walking:  { factor: 0,     unit: 'km',   label: 'Walking 🚶'    },
    train:    { factor: 0.041, unit: 'km',   label: 'Train'         },
    ev:       { factor: 0.053, unit: 'km',   label: 'Electric Car'  },
  },
  Diet: {
    beef:       { factor: 27,  unit: 'kg',   label: 'Beef'          },
    chicken:    { factor: 6.9, unit: 'kg',   label: 'Chicken'       },
    fish:       { factor: 6.1, unit: 'kg',   label: 'Fish'          },
    pork:       { factor: 12,  unit: 'kg',   label: 'Pork'          },
    vegetarian: { factor: 2.5, unit: 'meal', label: 'Vegetarian'    },
    vegan:      { factor: 1.5, unit: 'meal', label: 'Vegan 🌱'      },
  },
  Power: {
    electricity: { factor: 0.233, unit: 'kWh', label: 'Electricity'     },
    gas:         { factor: 2.04,  unit: 'm3',  label: 'Natural Gas'     },
    solar:       { factor: 0,     unit: 'kWh', label: 'Solar Energy ☀️' },
    led_switch:  { factor: -0.05, unit: 'hr',  label: 'LED Lighting'    },
  },
  // ── New categories ──────────────────────────────────────────
  Waste: {
    recycled:   { factor: 0,    unit: 'kg',  label: 'Recycled Waste 🔄'  },
    composted:  { factor: 0,    unit: 'kg',  label: 'Composted 🌱'        },
    landfill:   { factor: 0.57, unit: 'kg',  label: 'Landfill Waste'      },
    reduced:    { factor: 0,    unit: 'kg',  label: 'Reduced Packaging'   },
  },
  Shopping: {
    secondhand:  { factor: 0,   unit: 'item', label: 'Secondhand Item ♻️'  },
    local:       { factor: 0,   unit: 'item', label: 'Local Product 🏪'    },
    sustainable: { factor: 0,   unit: 'item', label: 'Eco Brand 🌿'        },
    fast_fashion:{ factor: 15,  unit: 'item', label: 'Fast Fashion Item'   },
  },
  Eco: {
    tree_plant:  { factor: 0,   unit: 'tree', label: 'Planted a Tree 🌳'   },
    donation:    { factor: 0,   unit: 'usd',  label: 'Eco Donation 💚'     },
    volunteering:{ factor: 0,   unit: 'hr',   label: 'Volunteering 🌍'     },
    offset:      { factor: 0,   unit: 'kg',   label: 'Carbon Offset'       },
  },
};

const activitySchema = new mongoose.Schema(
  {
    userId:      { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    firebaseUid: { type: String, required: true, index: true },

    category:    { type: String, enum: ['Transport', 'Diet', 'Power', 'Waste', 'Shopping', 'Eco'], required: true },
    subType:     { type: String, required: true },
    description: { type: String, default: '' },
    value:       { type: Number, required: true, min: 0 },
    unit:        { type: String, required: true },
    carbonScore: { type: Number, required: true },
    xpEarned:    { type: Number, default: 10 },
    timestamp:   { type: Date, default: Date.now, index: true },
  },
  { timestamps: true }
);

// Static: get all emission factors
activitySchema.statics.EMISSION_FACTORS = EMISSION_FACTORS;

// Static: calculate carbon score
activitySchema.statics.calculateCarbon = (category, subType, value) => {
  const cat = EMISSION_FACTORS[category];
  if (!cat) throw new Error(`Unknown category: ${category}`);
  const sub = cat[subType];
  if (!sub) throw new Error(`Unknown subtype: ${subType}`);
  return parseFloat((sub.factor * value).toFixed(4));
};

// Static: calculate XP for an activity
activitySchema.statics.calculateXP = (category, subType, carbonScore) => {
  const ecoChoices = [
    'bicycle', 'walking', 'ev', 'train', 'vegan', 'vegetarian', 'solar', 'led_switch',
    // Waste eco choices
    'recycled', 'composted', 'reduced',
    // Shopping eco choices
    'secondhand', 'local', 'sustainable',
    // Eco project choices
    'tree_plant', 'donation', 'volunteering', 'offset',
  ];
  const isEco = ecoChoices.includes(subType);
  return 10 + (isEco ? 15 : 0);
};

module.exports = mongoose.model('Activity', activitySchema);
