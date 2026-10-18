import React, { useState } from 'react';

export default function MacroCalculator({ user = {}, onSaveTarget }) {
  const [weight, setWeight] = useState(user.weight || 63.5);
  const [height, setHeight] = useState(user.height || 168);
  const [age, setAge] = useState(user.age || 28);
  const [gender, setGender] = useState('female');
  const [activity, setActivity] = useState(1.375);
  const [goal, setGoal] = useState('maintain');

  const bmrBase = 10 * weight + 6.25 * height - 5 * age;
  const bmr = Math.round(gender === 'male' ? bmrBase + 5 : bmrBase - 161);
  const tdee = Math.round(bmr * activity);

  let targetCalories = tdee;
  if (goal === 'cut') targetCalories = Math.round(tdee * 0.85);
  if (goal === 'bulk') targetCalories = Math.round(tdee * 1.15);

  const proteinGrams = Math.round(weight * 2.2);
  const fatsGrams = Math.round((targetCalories * 0.25) / 9);
  const carbsGrams = Math.round((targetCalories - (proteinGrams * 4 + fatsGrams * 9)) / 4);

  const handleApply = () => {
    if (onSaveTarget) {
      onSaveTarget({
        daily_calories: targetCalories,
        protein_g: proteinGrams,
        carbs_g: carbsGrams,
        fats_g: fatsGrams
      });
      alert(`Applied target: ${targetCalories} kcal (${proteinGrams}g Protein, ${carbsGrams}g Carbs, ${fatsGrams}g Fats) to your profile!`);
    }
  };

  return (
    <div className="page-container">
      <header className="page-header">
        <div>
          <h1 className="page-title">Calorie & Macro Calculator</h1>
          <p className="page-subtitle">Scientific BMR & TDEE estimation for customized macronutrient targets.</p>
        </div>
      </header>

      <div className="grid grid-2 gap-4 mb-4">
        <div className="card">
          <h3 className="section-title mb-3">Biometric Inputs</h3>
          <div className="form-grid">
            <div>
              <label className="input-label">Gender</label>
              <select className="select-input" value={gender} onChange={(e) => setGender(e.target.value)}>
                <option value="female">Female</option>
                <option value="male">Male</option>
              </select>
            </div>
            <div>
              <label className="input-label">Age (Years)</label>
              <input type="number" className="input-field" value={age} onChange={(e) => setAge(Number(e.target.value))} />
            </div>
            <div>
              <label className="input-label">Weight (kg)</label>
              <input type="number" step="0.1" className="input-field" value={weight} onChange={(e) => setWeight(Number(e.target.value))} />
            </div>
            <div>
              <label className="input-label">Height (cm)</label>
              <input type="number" className="input-field" value={height} onChange={(e) => setHeight(Number(e.target.value))} />
            </div>
            <div>
              <label className="input-label">Activity Level</label>
              <select className="select-input" value={activity} onChange={(e) => setActivity(Number(e.target.value))}>
                <option value={1.2}>Sedentary (Desk Job, little exercise)</option>
                <option value={1.375}>Lightly Active (1-3 days/wk)</option>
                <option value={1.55}>Moderately Active (3-5 days/wk)</option>
                <option value={1.725}>Very Active (6-7 days/wk)</option>
              </select>
            </div>
            <div>
              <label className="input-label">Fitness Goal</label>
              <select className="select-input" value={goal} onChange={(e) => setGoal(e.target.value)}>
                <option value="maintain">Maintain Weight</option>
                <option value="cut">Fat Loss (-15% Deficit)</option>
                <option value="bulk">Lean Muscle Gain (+15% Surplus)</option>
              </select>
            </div>
          </div>
        </div>

        <div className="card text-center flex-center flex-col">
          <span className="stat-lbl">ESTIMATED DAILY TDEE</span>
          <div className="stat-num text-3xl my-2 text-cyan">{tdee} kcal</div>
          <span className="stat-lbl mb-3">(BMR: {bmr} kcal/day)</span>

          <hr className="divider my-3 w-full" />

          <span className="stat-lbl">TARGET CALORIES FOR GOAL</span>
          <div className="score-ring-lg my-2 text-emerald">{targetCalories}</div>
          <p className="stat-lbl">kcal / day</p>

          <div className="grid grid-3 gap-2 w-full mt-3">
            <div className="macro-chip">
              <span className="stat-num text-sm text-cyan">{proteinGrams}g</span>
              <span className="stat-lbl text-xs">PROTEIN</span>
            </div>
            <div className="macro-chip">
              <span className="stat-num text-sm text-emerald">{carbsGrams}g</span>
              <span className="stat-lbl text-xs">CARBS</span>
            </div>
            <div className="macro-chip">
              <span className="stat-num text-sm text-amber">{fatsGrams}g</span>
              <span className="stat-lbl text-xs">FATS</span>
            </div>
          </div>

          <button className="btn btn-primary mt-4 w-full" onClick={handleApply}>
            Save Macro Plan to Profile
          </button>
        </div>
      </div>
    </div>
  );
}
