const mongoose = require('mongoose');

const LEVELS = [
  { min: 0,    max: 99,   level: 1, badge: 'Seedling',  emoji: '🌱' },
  { min: 100,  max: 299,  level: 2, badge: 'Sapling',   emoji: '🌿' },
  { min: 300,  max: 599,  level: 3, badge: 'Redwood',   emoji: '🌳' },
  { min: 600,  max: 999,  level: 4, badge: 'Ancient',   emoji: '🌲' },
  { min: 1000, max: Infinity, level: 5, badge: 'Guardian', emoji: '🌍' },
];

const getLevelFromXP = (xp) => {
  return LEVELS.find(l => xp >= l.min && xp <= l.max) || LEVELS[LEVELS.length - 1];
};

const userSchema = new mongoose.Schema(
  {
    firebaseUid: { type: String, required: true, unique: true, index: true },
    name:        { type: String, required: true },
    email:       { type: String, required: true, lowercase: true },
    avatar:      { type: String, default: '' },

    // Gamification
    totalXP:         { type: Number, default: 0, min: 0 },
    level:           { type: Number, default: 1 },
    badge:           { type: String, default: 'Seedling' },
    currentStreak:   { type: Number, default: 0 },
    longestStreak:   { type: Number, default: 0 },
    lastActivityDate:{ type: Date, default: null },

    // Goals
    monthlyGoal: { type: Number, default: 100 }, // kg CO2 per month

    // Total CO2 saved vs baseline
    totalCarbonLogged: { type: Number, default: 0 },
  },
  { timestamps: true }
);

// Auto-update level and badge when XP changes
userSchema.pre('save', function (next) {
  if (this.isModified('totalXP')) {
    const levelInfo = getLevelFromXP(this.totalXP);
    this.level = levelInfo.level;
    this.badge = levelInfo.badge;
  }
  next();
});

userSchema.methods.addXP = function (amount) {
  this.totalXP += amount;
  const levelInfo = getLevelFromXP(this.totalXP);
  this.level = levelInfo.level;
  this.badge = levelInfo.badge;
};

userSchema.statics.LEVELS = LEVELS;
userSchema.statics.getLevelFromXP = getLevelFromXP;

module.exports = mongoose.model('User', userSchema);
