import React, { useState } from 'react';
import * as aiService from '../services/aiService.js';

export default function NutritionPlan({ plans, onAdd, onDelete, user }) {
  const [form, setForm] = useState({ daily_calories: '', diet_type: '', protein_g: '', carbs_g: '', fats_g: '' });
  const [isGeneratingMeal, setIsGeneratingMeal] = useState(false);
  const [dietPref, setDietPref] = useState('High Protein Balanced');

  // Height and weight for live BMI calculation
  const [userWeight, setUserWeight] = useState(user?.weight || 72);
  const [userHeight, setUserHeight] = useState(user?.height || 175); // in cm

  // Calculate live BMI
  const heightM = userHeight / 100;
  const bmi = heightM > 0 ? (userWeight / (heightM * heightM)).toFixed(1) : 22.5;

  // Determine BMI category & automatic nutrition recommendations
  let bmiCategory = '';
  let bmiBadgeColor = '';
  let bmiBadgeBg = '';
  let suggestedDietType = '';
  let suggestedCalories = 2200;
  let suggestedProtein = 150;
  let suggestedCarbs = 210;
  let suggestedFats = 65;
  let bmiAdvice = '';

  if (bmi < 18.5) {
    bmiCategory = 'Underweight (BMI < 18.5)';
    bmiBadgeColor = '#ca8a04';
    bmiBadgeBg = '#fef9c3';
    suggestedDietType = 'High-Calorie Hypertrophy & Muscle Gain';
    suggestedCalories = Math.round(userWeight * 38);
    suggestedProtein = Math.round(userWeight * 2.2);
    suggestedCarbs = Math.round(suggestedCalories * 0.5 / 4);
    suggestedFats = Math.round(suggestedCalories * 0.25 / 9);
    bmiAdvice = 'Caloric surplus recommended to build lean muscle mass and support healthy weight gain.';
  } else if (bmi >= 18.5 && bmi < 25.0) {
    bmiCategory = 'Normal Weight (18.5 - 24.9)';
    bmiBadgeColor = '#16a34a';
    bmiBadgeBg = '#dcfce7';
    suggestedDietType = 'Balanced Athletic Performance & Maintenance';
    suggestedCalories = Math.round(userWeight * 32);
    suggestedProtein = Math.round(userWeight * 2.0);
    suggestedCarbs = Math.round(suggestedCalories * 0.45 / 4);
    suggestedFats = Math.round(suggestedCalories * 0.25 / 9);
    bmiAdvice = 'Optimal BMI range! Iso-caloric balanced diet to enhance workout endurance and athletic recovery.';
  } else if (bmi >= 25.0 && bmi < 30.0) {
    bmiCategory = 'Overweight (25.0 - 29.9)';
    bmiBadgeColor = '#2563eb';
    bmiBadgeBg = '#dbeafe';
    suggestedDietType = 'High-Protein Shred & Body Recomposition';
    suggestedCalories = Math.round(userWeight * 26);
    suggestedProtein = Math.round(userWeight * 2.2);
    suggestedCarbs = Math.round(suggestedCalories * 0.35 / 4);
    suggestedFats = Math.round(suggestedCalories * 0.25 / 9);
    bmiAdvice = 'Controlled moderate deficit with elevated protein to burn body fat while preserving lean muscle mass.';
  } else {
    bmiCategory = 'Obese (BMI ≥ 30.0)';
    bmiBadgeColor = '#dc2626';
    bmiBadgeBg = '#fef2f2';
    suggestedDietType = 'Metabolic Reset & Caloric Deficit';
    suggestedCalories = Math.round(userWeight * 22);
    suggestedProtein = Math.round(userWeight * 2.0);
    suggestedCarbs = Math.round(suggestedCalories * 0.25 / 4);
    suggestedFats = Math.round(suggestedCalories * 0.30 / 9);
    bmiAdvice = 'Structured caloric deficit with lower glycemic carbs to reset insulin sensitivity and accelerate fat loss.';
  }

  const handleApplyBmiRecommendation = () => {
    onAdd({
      daily_calories: suggestedCalories,
      diet_type: `📊 Auto-BMI: ${suggestedDietType}`,
      protein_g: suggestedProtein,
      carbs_g: suggestedCarbs,
      fats_g: suggestedFats
    });
    alert(`✅ Auto-Suggested BMI Nutrition Plan Applied!\nDaily Target: ${suggestedCalories} kcal\nDiet: ${suggestedDietType}\nMacros: ${suggestedProtein}g Protein / ${suggestedCarbs}g Carbs / ${suggestedFats}g Fats`);
  };

  const submitManual = (e) => {
    e.preventDefault();
    if (!form.diet_type) return;
    onAdd({
      daily_calories: Number(form.daily_calories) || 2000,
      diet_type: form.diet_type,
      protein_g: Number(form.protein_g) || 140,
      carbs_g: Number(form.carbs_g) || 200,
      fats_g: Number(form.fats_g) || 60
    });
    setForm({ daily_calories: '', diet_type: '', protein_g: '', carbs_g: '', fats_g: '' });
  };

  const handleAiGenerateMealPlan = async () => {
    setIsGeneratingMeal(true);
    try {
      const result = await aiService.generateAiMealPlan({
        dietType: dietPref,
        targetCalories: suggestedCalories,
        user
      });

      if (result && result.daily_calories) {
        onAdd({
          daily_calories: result.daily_calories,
          diet_type: `🤖 Gemini AI ${result.diet_type || dietPref} Plan (${result.protein_g || suggestedProtein}g P / ${result.carbs_g || suggestedCarbs}g C)`
        });
      }
    } catch (err) {
      onAdd({
        daily_calories: suggestedCalories,
        diet_type: `🤖 Gemini AI ${dietPref} Plan (${suggestedProtein}g P / ${suggestedCarbs}g C)`
      });
    } finally {
      setIsGeneratingMeal(false);
    }
  };

  return (
    <div className="page-container" style={{ padding: '2rem' }}>
      {/* Header */}
      <div className="page-head flex-between align-center flex-wrap gap-2 mb-4">
        <div>
          <div className="page-eyebrow" style={{ fontWeight: 800, color: '#ca8a04', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            NUTRITION
          </div>
          <h1 className="page-title" style={{ fontSize: '1.75rem', fontWeight: 900, margin: '0.2rem 0' }}>
            Nutrition Plan & Macro Targets
          </h1>
          <p className="page-desc" style={{ fontWeight: 600, color: '#64748b' }}>
            Caloric and macro targets tailored to your body composition and goals.
          </p>
        </div>

        <div className="flex align-center gap-2 flex-wrap">
          <input
            type="text"
            className="input-field-sm"
            style={{ width: '180px', padding: '0.55rem 0.8rem', borderRadius: '8px', border: '1px solid #cbd5e1', fontWeight: 700 }}
            placeholder="Diet Focus (e.g. Keto)"
            value={dietPref}
            onChange={(e) => setDietPref(e.target.value)}
          />
          <button
            className="btn btn-primary text-xs flex align-center gap-1"
            onClick={handleAiGenerateMealPlan}
            disabled={isGeneratingMeal}
            style={{ fontWeight: 900, padding: '0.65rem 1.1rem', borderRadius: '8px', cursor: 'pointer' }}
          >
            {isGeneratingMeal ? '⏳ Generating...' : '🥗 AI Generate Meal Plan'}
          </button>
        </div>
      </div>

      {/* AUTOMATIC BMI CALCULATOR & NUTRITION RECOMMENDATION CARD */}
      <div
        className="card mb-6"
        style={{
          background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)',
          border: `2.5px solid ${bmiBadgeColor}`,
          borderRadius: '16px',
          padding: '1.75rem',
          boxShadow: '0 4px 15px rgba(0,0,0,0.04)'
        }}
      >
        <div className="flex-between align-center flex-wrap gap-2 mb-3">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <span style={{ fontSize: '1.75rem' }}>🧮</span>
            <div>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 900, margin: 0, color: '#0f172a' }}>
                BMI Nutrition Recommendation
              </h2>
              <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#64748b' }}>
                Based on Weight ({userWeight} kg) & Height ({userHeight} cm)
              </span>
            </div>
          </div>

          {/* BMI Category Pill */}
          <div
            style={{
              padding: '0.4rem 1rem',
              borderRadius: '20px',
              background: bmiBadgeBg,
              border: `1.5px solid ${bmiBadgeColor}`,
              color: bmiBadgeColor,
              fontWeight: 900,
              fontSize: '0.9rem'
            }}
          >
            BMI: {bmi} • {bmiCategory}
          </div>
        </div>

        {/* Live Height & Weight Adjusters */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
            gap: '1rem',
            background: '#ffffff',
            border: '1px solid #e2e8f0',
            borderRadius: '12px',
            padding: '1rem',
            marginBottom: '1.25rem'
          }}
        >
          <div>
            <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 900, color: '#64748b', textTransform: 'uppercase', marginBottom: '0.3rem' }}>
              WEIGHT (KG)
            </label>
            <input
              type="number"
              step="0.5"
              value={userWeight}
              onChange={(e) => setUserWeight(Number(e.target.value) || 70)}
              style={{ width: '100%', padding: '0.55rem', borderRadius: '8px', border: '1px solid #cbd5e1', fontWeight: 800 }}
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 900, color: '#64748b', textTransform: 'uppercase', marginBottom: '0.3rem' }}>
              HEIGHT (CM)
            </label>
            <input
              type="number"
              value={userHeight}
              onChange={(e) => setUserHeight(Number(e.target.value) || 175)}
              style={{ width: '100%', padding: '0.55rem', borderRadius: '8px', border: '1px solid #cbd5e1', fontWeight: 800 }}
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 900, color: '#64748b', textTransform: 'uppercase', marginBottom: '0.3rem' }}>
              BMI SCORE
            </label>
            <div style={{ fontSize: '1.25rem', fontWeight: 900, color: bmiBadgeColor, paddingTop: '0.2rem' }}>
              {bmi} kg/m²
            </div>
          </div>
        </div>

        {/* SUGGESTED NUTRITION PLAN DETAILS BASED ON BMI */}
        <div
          style={{
            background: '#ffffff',
            border: '1.5px solid #cbd5e1',
            borderRadius: '12px',
            padding: '1.25rem',
            marginBottom: '1.25rem'
          }}
        >
          <div style={{ color: '#ca8a04', fontWeight: 900, fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.5rem' }}>
            💡 SUGGESTED DIET & TARGET MACROS FOR YOUR BMI:
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', marginBottom: '0.75rem' }}>
            <h3 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 900, color: '#0f172a' }}>
              {suggestedDietType}
            </h3>

            <div style={{ fontSize: '1.5rem', fontWeight: 900, color: '#2563eb' }}>
              {suggestedCalories.toLocaleString()} <span style={{ fontSize: '0.9rem', color: '#64748b' }}>kcal / day</span>
            </div>
          </div>

          <p style={{ fontSize: '0.88rem', fontWeight: 700, color: '#475569', margin: '0 0 1rem 0', lineHeight: 1.5 }}>
            "{bmiAdvice}"
          </p>

          {/* Macro Breakdown Pills */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.75rem', textAlign: 'center' }}>
            <div style={{ background: '#fef9c3', border: '1px solid #fef08a', borderRadius: '8px', padding: '0.65rem' }}>
              <div style={{ fontSize: '0.75rem', fontWeight: 900, color: '#854d0e' }}>PROTEIN</div>
              <div style={{ fontSize: '1.2rem', fontWeight: 900, color: '#ca8a04' }}>{suggestedProtein}g</div>
            </div>

            <div style={{ background: '#dbeafe', border: '1px solid #bfdbfe', borderRadius: '8px', padding: '0.65rem' }}>
              <div style={{ fontSize: '0.75rem', fontWeight: 900, color: '#1e40af' }}>CARBS</div>
              <div style={{ fontSize: '1.2rem', fontWeight: 900, color: '#2563eb' }}>{suggestedCarbs}g</div>
            </div>

            <div style={{ background: '#dcfce7', border: '1px solid #bbf7d0', borderRadius: '8px', padding: '0.65rem' }}>
              <div style={{ fontSize: '0.75rem', fontWeight: 900, color: '#166534' }}>HEALTHY FATS</div>
              <div style={{ fontSize: '1.2rem', fontWeight: 900, color: '#16a34a' }}>{suggestedFats}g</div>
            </div>
          </div>
        </div>

        {/* 1-CLICK APPLY SUGGESTED PLAN BUTTON */}
        <button
          onClick={handleApplyBmiRecommendation}
          style={{
            width: '100%',
            padding: '0.9rem',
            background: bmiBadgeColor,
            color: '#ffffff',
            border: 'none',
            borderRadius: '10px',
            fontWeight: 900,
            fontSize: '1rem',
            cursor: 'pointer',
            boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.5rem'
          }}
        >
          <span>⚡</span> APPLY SUGGESTED BMI NUTRITION PLAN ({suggestedCalories} KCAL/DAY)
        </button>
      </div>

      {/* ACTIVE NUTRITION PLANS LIST */}
      <h3 className="section-title mb-3" style={{ fontSize: '1.25rem', fontWeight: 900 }}>
        🥗 Active Nutrition Plans & Macro Targets
      </h3>

      <div className="grid grid-3 section mb-6">
        {plans.map((p) => (
          <div
            className="card p-4"
            key={p.nutrition_id}
            style={{
              borderRadius: '14px',
              border: '1px solid #e2e8f0',
              background: '#ffffff',
              boxShadow: '0 2px 8px rgba(0,0,0,0.03)',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between'
            }}
          >
            <div>
              <div style={{ fontSize: '0.75rem', fontWeight: 900, color: '#64748b', textTransform: 'uppercase' }}>
                Plan #{p.nutrition_id}
              </div>
              <div className="stat-value accent" style={{ fontSize: '2rem', fontWeight: 900, color: '#ca8a04', margin: '0.3rem 0' }}>
                {p.daily_calories.toLocaleString()} <span style={{ fontSize: '0.9rem', color: '#64748b' }}>kcal</span>
              </div>
              <div style={{ fontSize: '0.95rem', fontWeight: 800, color: '#0f172a', marginBottom: '0.5rem' }}>
                {p.diet_type}
              </div>

              {(p.protein_g || p.carbs_g) && (
                <div style={{ fontSize: '0.78rem', fontWeight: 700, color: '#475569', background: '#f8fafc', padding: '0.5rem', borderRadius: '6px', border: '1px solid #e2e8f0' }}>
                  🍗 {p.protein_g || 140}g Protein • 🍞 {p.carbs_g || 200}g Carbs • 🥑 {p.fats_g || 60}g Fats
                </div>
              )}
            </div>

            <div style={{ marginTop: '1rem', paddingTop: '0.5rem', borderTop: '1px solid #f1f5f9' }}>
              <button
                className="icon-btn"
                onClick={() => onDelete(p.nutrition_id)}
                style={{ color: '#dc2626', fontWeight: 900, cursor: 'pointer', background: 'none', border: 'none' }}
              >
                🗑️ Delete Plan
              </button>
            </div>
          </div>
        ))}
        {plans.length === 0 && (
          <div className="empty-state card p-4 text-center" style={{ gridColumn: 'span 3', borderRadius: '12px', color: '#64748b', fontWeight: 700 }}>
            No nutrition plans set — click "APPLY SUGGESTED BMI NUTRITION PLAN" above!
          </div>
        )}
      </div>

      {/* MANUAL CUSTOM PLAN FORM */}
      <div className="card p-4" style={{ borderRadius: '14px', border: '1px solid #e2e8f0', background: '#ffffff' }}>
        <h3 style={{ margin: '0 0 1rem 0', fontSize: '1.1rem', fontWeight: 900, color: '#0f172a' }}>
          ➕ Add Manual Custom Nutrition Plan
        </h3>

        <form onSubmit={submitManual} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '1rem', alignItems: 'end' }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 800, color: '#0f172a', marginBottom: '0.3rem' }}>
              DAILY CALORIES
            </label>
            <input
              type="number"
              value={form.daily_calories}
              onChange={(e) => setForm((f) => ({ ...f, daily_calories: e.target.value }))}
              placeholder="e.g. 2400"
              required
              style={{ width: '100%', padding: '0.65rem', borderRadius: '8px', border: '1px solid #cbd5e1', fontWeight: 700 }}
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 800, color: '#0f172a', marginBottom: '0.3rem' }}>
              DIET TYPE / GOAL
            </label>
            <input
              type="text"
              value={form.diet_type}
              onChange={(e) => setForm((f) => ({ ...f, diet_type: e.target.value }))}
              placeholder="e.g. High Protein Clean"
              required
              style={{ width: '100%', padding: '0.65rem', borderRadius: '8px', border: '1px solid #cbd5e1', fontWeight: 700 }}
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 800, color: '#0f172a', marginBottom: '0.3rem' }}>
              PROTEIN (G)
            </label>
            <input
              type="number"
              value={form.protein_g}
              onChange={(e) => setForm((f) => ({ ...f, protein_g: e.target.value }))}
              placeholder="e.g. 160"
              style={{ width: '100%', padding: '0.65rem', borderRadius: '8px', border: '1px solid #cbd5e1', fontWeight: 700 }}
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 800, color: '#0f172a', marginBottom: '0.3rem' }}>
              CARBS (G)
            </label>
            <input
              type="number"
              value={form.carbs_g}
              onChange={(e) => setForm((f) => ({ ...f, carbs_g: e.target.value }))}
              placeholder="e.g. 220"
              style={{ width: '100%', padding: '0.65rem', borderRadius: '8px', border: '1px solid #cbd5e1', fontWeight: 700 }}
            />
          </div>

          <button
            className="btn btn-primary"
            type="submit"
            style={{ padding: '0.65rem 1.25rem', borderRadius: '8px', fontWeight: 900, height: '42px' }}
          >
            + Add Custom Plan
          </button>
        </form>
      </div>
    </div>
  );
}
