import React, { useState } from 'react';
import * as db from '../services/db.js';

const DIET_PRESETS = [
  { label: 'High Protein Athlete', calories: 2800, protein: 210, carbs: 280, fats: 75 },
  { label: 'Fat Loss & Shred', calories: 1800, protein: 180, carbs: 150, fats: 55 },
  { label: 'Muscle Gain (Bulk)', calories: 3200, protein: 240, carbs: 360, fats: 90 },
  { label: 'Balanced Maintenance', calories: 2200, protein: 160, carbs: 240, fats: 65 },
  { label: 'Keto / Low Carb', calories: 2000, protein: 170, carbs: 50, fats: 140 },
  { label: 'Vegetarian Performance', calories: 2400, protein: 130, carbs: 300, fats: 70 },
  { label: 'Metabolic Reset', calories: 1600, protein: 140, carbs: 120, fats: 55 },
  { label: 'Endurance Athlete', calories: 3000, protein: 160, carbs: 420, fats: 70 },
];

const FOOD_RECOMMENDATIONS = [
  { food: 'Grilled Chicken Breast', macro: 'High Protein', kcal: 165, note: 'Lean protein, low fat' },
  { food: 'Brown Rice', macro: 'Complex Carbs', kcal: 215, note: 'Slow digesting, sustained energy' },
  { food: 'Salmon Fillet', macro: 'Omega-3 + Protein', kcal: 208, note: 'Healthy fats, anti-inflammatory' },
  { food: 'Greek Yogurt', macro: 'Probiotic Protein', kcal: 100, note: 'Gut health, calcium rich' },
  { food: 'Sweet Potato', macro: 'Complex Carbs', kcal: 103, note: 'Rich in vitamins A & C' },
  { food: 'Eggs (whole)', macro: 'Complete Protein', kcal: 155, note: 'All 9 essential amino acids' },
  { food: 'Avocado', macro: 'Healthy Fats', kcal: 160, note: 'Monounsaturated fats, potassium' },
  { food: 'Oats', macro: 'Fiber + Carbs', kcal: 389, note: 'Beta-glucan for cholesterol' },
  { food: 'Lentils', macro: 'Plant Protein', kcal: 116, note: 'High fiber, iron rich' },
  { food: 'Broccoli', macro: 'Micronutrients', kcal: 34, note: 'Vitamin C, K, folate' },
  { food: 'Almonds', macro: 'Healthy Fats', kcal: 579, note: 'Vitamin E, magnesium' },
  { food: 'Cottage Cheese', macro: 'Casein Protein', kcal: 98, note: 'Slow-release night protein' },
];

export default function DieticianPortal({ currentUser, allUsers = [], nutritionPlans = [], onRefresh }) {
  const [selectedMember, setSelectedMember] = useState(null);
  const [search, setSearch] = useState('');
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [showRecommendModal, setShowRecommendModal] = useState(false);
  const [notification, setNotification] = useState('');

  // Assign form state
  const [dietType, setDietType] = useState('High Protein Athlete');
  const [dailyCalories, setDailyCalories] = useState(2800);
  const [proteinG, setProteinG] = useState(210);
  const [carbsG, setCarbsG] = useState(280);
  const [fatsG, setFatsG] = useState(75);

  // Recommend form state
  const [selectedFoods, setSelectedFoods] = useState([]);

  const showToast = (msg) => {
    setNotification(msg);
    setTimeout(() => setNotification(''), 4000);
  };

  // Only actual members (not staff roles)
  const members = (allUsers || []).filter(
    (u) => !['owner', 'gym_master', 'admin', 'dietician', 'consultant', 'trainer', 'gym_owner'].includes(u.role)
  );

  const filteredMembers = members.filter(
    (m) =>
      (m.name || '').toLowerCase().includes(search.toLowerCase()) ||
      (m.email || '').toLowerCase().includes(search.toLowerCase())
  );

  const applyPreset = (preset) => {
    setDietType(preset.label);
    setDailyCalories(preset.calories);
    setProteinG(preset.protein);
    setCarbsG(preset.carbs);
    setFatsG(preset.fats);
  };

  const handleAssign = (e) => {
    e.preventDefault();
    if (!selectedMember) return;
    db.assignNutritionToMember(selectedMember.user_id, {
      diet_type: dietType,
      daily_calories: dailyCalories,
      protein_g: proteinG,
      carbs_g: carbsG,
      fats_g: fatsG,
    });
    showToast('Food plan "' + dietType + '" assigned to ' + selectedMember.name + '!');
    setShowAssignModal(false);
    if (onRefresh) onRefresh();
  };

  const toggleFood = (food) => {
    setSelectedFoods((prev) =>
      prev.includes(food) ? prev.filter((f) => f !== food) : [...prev, food]
    );
  };

  const handleRecommend = (e) => {
    e.preventDefault();
    if (!selectedMember || selectedFoods.length === 0) return;
    const recText = selectedFoods.join(', ');
    const totalKcal = selectedFoods.reduce((sum, f) => {
      const item = FOOD_RECOMMENDATIONS.find((x) => x.food === f);
      return sum + (item ? item.kcal : 0);
    }, 0);
    db.assignNutritionToMember(selectedMember.user_id, {
      diet_type: 'Dietician Recommended: ' + recText,
      daily_calories: totalKcal || 2000,
      protein_g: 150,
      carbs_g: 200,
      fats_g: 60,
    });
    showToast('Food recommendations sent to ' + selectedMember.name + '!');
    setShowRecommendModal(false);
    setSelectedFoods([]);
    if (onRefresh) onRefresh();
  };

  const getMemberPlan = (memberId) =>
    (nutritionPlans || []).filter((p) => p.user_id === memberId).slice(-1)[0];

  return (
    <div className="page-container" style={{ padding: '24px 28px', maxWidth: '1300px', margin: '0 auto' }}>
      {/* Toast */}
      {notification && (
        <div style={{
          position: 'fixed', top: '24px', right: '24px',
          background: 'linear-gradient(135deg, #059669 0%, #047857 100%)',
          color: '#fff', padding: '14px 22px', borderRadius: '14px',
          fontWeight: 800, fontSize: '14px', zIndex: 99999,
          boxShadow: '0 12px 28px rgba(5, 150, 105, 0.4)',
          display: 'flex', alignItems: 'center', gap: '10px'
        }}>
          <span>{notification}</span>
        </div>
      )}

      {/* Hero Header */}
      <div className="card" style={{
        background: 'linear-gradient(135deg, #ecfdf5 0%, #d1fae5 60%, #a7f3d0 100%)',
        border: '1.5px solid #6ee7b7', borderRadius: '20px',
        padding: '24px 28px', marginBottom: '24px',
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        flexWrap: 'wrap', gap: '20px',
        boxShadow: '0 4px 20px rgba(5, 150, 105, 0.08)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '18px' }}>
          <div style={{
            width: '64px', height: '64px', borderRadius: '16px',
            background: 'linear-gradient(135deg, #059669 0%, #047857 100%)',
            color: '#fff', fontSize: '28px', fontWeight: 900,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 6px 16px rgba(5, 150, 105, 0.35)', border: '2px solid #fff'
          }}>
            {(currentUser?.name || 'D').charAt(0).toUpperCase()}
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
              <h1 style={{ fontSize: '22px', fontWeight: 900, margin: 0, color: '#064e3b' }}>
                {currentUser?.name || 'Gym Dietician'}
              </h1>
              <span style={{
                background: '#059669', color: '#fff',
                padding: '3px 10px', borderRadius: '8px',
                fontSize: '11px', fontWeight: 900, letterSpacing: '0.05em'
              }}>
                GYM DIETICIAN
              </span>
            </div>
            <p style={{ margin: '4px 0 0 0', fontSize: '13px', color: '#065f46', fontWeight: 600 }}>
              {currentUser?.gym_name || 'Smart Fitness Companion'} &bull;{' '}
              {currentUser?.specialty || 'Sports Dietician & Nutritionist'}
            </p>
          </div>
        </div>
        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          <div style={{
            background: '#fff', border: '1px solid #6ee7b7', borderRadius: '12px',
            padding: '10px 18px', textAlign: 'center'
          }}>
            <div style={{ fontSize: '22px', fontWeight: 900, color: '#059669' }}>{members.length}</div>
            <div style={{ fontSize: '11px', fontWeight: 800, color: '#065f46', textTransform: 'uppercase' }}>Members</div>
          </div>
          <div style={{
            background: '#fff', border: '1px solid #6ee7b7', borderRadius: '12px',
            padding: '10px 18px', textAlign: 'center'
          }}>
            <div style={{ fontSize: '22px', fontWeight: 900, color: '#059669' }}>{(nutritionPlans || []).length}</div>
            <div style={{ fontSize: '11px', fontWeight: 800, color: '#065f46', textTransform: 'uppercase' }}>Plans Assigned</div>
          </div>
        </div>
      </div>

      {/* Page Title + Search */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px', marginBottom: '20px' }}>
        <div>
          <h2 style={{ fontSize: '18px', fontWeight: 900, margin: 0, color: '#0f172a' }}>
            Gym Member Food Management
          </h2>
          <p style={{ margin: '3px 0 0', fontSize: '13px', color: '#64748b', fontWeight: 600 }}>
            Assign diet plans or recommend specific foods to each member
          </p>
        </div>
        <input
          type="text"
          placeholder="Search member..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{
            padding: '9px 14px', borderRadius: '10px',
            border: '1.5px solid #a7f3d0', fontSize: '13px',
            fontWeight: 700, outline: 'none', width: '220px'
          }}
        />
      </div>

      {/* Members Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
        gap: '18px'
      }}>
        {filteredMembers.map((member) => {
          const plan = getMemberPlan(member.user_id);
          return (
            <div key={member.user_id} style={{
              background: '#fff',
              border: '1.5px solid #e2e8f0',
              borderRadius: '16px',
              padding: '18px',
              boxShadow: '0 2px 8px rgba(0,0,0,0.03)',
              display: 'flex', flexDirection: 'column', gap: '14px',
              transition: 'all 0.15s ease'
            }}>
              {/* Member Info */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{
                  width: '46px', height: '46px', borderRadius: '12px',
                  background: 'linear-gradient(135deg, #059669 0%, #047857 100%)',
                  color: '#fff', fontWeight: 900, fontSize: '20px',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  boxShadow: '0 3px 8px rgba(5, 150, 105, 0.25)'
                }}>
                  {(member.name || 'M').charAt(0).toUpperCase()}
                </div>
                <div style={{ flex: 1 }}>
                  <strong style={{ display: 'block', fontSize: '15px', color: '#0f172a' }}>
                    {member.name}
                  </strong>
                  <span style={{ fontSize: '12px', color: '#64748b' }}>{member.email}</span>
                </div>
                <span style={{
                  background: '#ecfdf5', color: '#065f46',
                  padding: '3px 8px', borderRadius: '6px',
                  fontSize: '11px', fontWeight: 800, border: '1px solid #a7f3d0'
                }}>
                  {member.fitness_level || 'Member'}
                </span>
              </div>

              {/* Bio */}
              <div style={{
                display: 'flex', gap: '8px', flexWrap: 'wrap',
                fontSize: '12px', fontWeight: 700, color: '#475569',
                background: '#f8fafc', padding: '8px 12px',
                borderRadius: '8px', border: '1px solid #e2e8f0'
              }}>
                <span>Age: {member.age || 26} yrs</span>
                <span>|</span>
                <span>Weight: {member.weight || 68} kg</span>
                <span>|</span>
                <span>Height: {member.height || 175} cm</span>
              </div>

              {/* Current Plan */}
              <div style={{
                background: plan ? '#ecfdf5' : '#fef9c3',
                border: '1px solid ' + (plan ? '#a7f3d0' : '#fef08a'),
                borderRadius: '10px', padding: '10px 12px'
              }}>
                <div style={{ fontSize: '11px', fontWeight: 800, color: '#64748b', marginBottom: '4px', textTransform: 'uppercase' }}>
                  Current Food Plan
                </div>
                {plan ? (
                  <>
                    <div style={{ fontWeight: 900, fontSize: '13px', color: '#064e3b' }}>{plan.diet_type}</div>
                    <div style={{ fontSize: '12px', color: '#059669', fontWeight: 700, marginTop: '2px' }}>
                      {(plan.daily_calories || 0).toLocaleString()} kcal/day
                      {plan.protein_g ? ' | ' + plan.protein_g + 'g P / ' + plan.carbs_g + 'g C / ' + plan.fats_g + 'g F' : ''}
                    </div>
                  </>
                ) : (
                  <div style={{ fontSize: '12px', color: '#92400e', fontWeight: 700, fontStyle: 'italic' }}>
                    No plan assigned yet
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div style={{ display: 'flex', gap: '8px' }}>
                <button
                  onClick={() => { setSelectedMember(member); setShowAssignModal(true); }}
                  style={{
                    flex: 1, padding: '9px 0', borderRadius: '10px',
                    background: 'linear-gradient(135deg, #059669 0%, #047857 100%)',
                    color: '#fff', border: 'none', fontWeight: 800,
                    fontSize: '12px', cursor: 'pointer',
                    boxShadow: '0 3px 8px rgba(5, 150, 105, 0.25)'
                  }}
                >
                  Assign Food Plan
                </button>
                <button
                  onClick={() => { setSelectedMember(member); setShowRecommendModal(true); }}
                  style={{
                    flex: 1, padding: '9px 0', borderRadius: '10px',
                    background: 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)',
                    color: '#fff', border: 'none', fontWeight: 800,
                    fontSize: '12px', cursor: 'pointer',
                    boxShadow: '0 3px 8px rgba(2, 132, 199, 0.25)'
                  }}
                >
                  Recommend Foods
                </button>
              </div>
            </div>
          );
        })}

        {filteredMembers.length === 0 && (
          <div style={{
            gridColumn: '1 / -1', textAlign: 'center', padding: '60px 20px',
            color: '#94a3b8', fontWeight: 700, fontSize: '15px'
          }}>
            No members found matching your search.
          </div>
        )}
      </div>

      {/* ASSIGN FOOD PLAN MODAL */}
      {showAssignModal && selectedMember && (
        <div style={{
          position: 'fixed', inset: 0,
          background: 'rgba(0,0,0,0.55)', zIndex: 10000,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          padding: '20px'
        }}>
          <div style={{
            background: '#fff', borderRadius: '20px',
            width: '100%', maxWidth: '560px',
            maxHeight: '90vh', overflowY: 'auto',
            padding: '28px', boxShadow: '0 24px 60px rgba(0,0,0,0.2)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <div>
                <h2 style={{ margin: 0, fontSize: '18px', fontWeight: 900, color: '#0f172a' }}>
                  Assign Food Plan
                </h2>
                <p style={{ margin: '4px 0 0', fontSize: '13px', color: '#64748b', fontWeight: 600 }}>
                  Assigning to: <strong style={{ color: '#059669' }}>{selectedMember.name}</strong>
                </p>
              </div>
              <button
                onClick={() => setShowAssignModal(false)}
                style={{ background: 'none', border: 'none', fontSize: '22px', cursor: 'pointer', color: '#64748b' }}
              >x</button>
            </div>

            {/* Diet Presets */}
            <div style={{ marginBottom: '20px' }}>
              <div style={{ fontSize: '12px', fontWeight: 800, color: '#64748b', textTransform: 'uppercase', marginBottom: '10px' }}>
                Quick Diet Presets
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '8px' }}>
                {DIET_PRESETS.map((preset) => (
                  <button
                    key={preset.label}
                    onClick={() => applyPreset(preset)}
                    style={{
                      padding: '8px 12px', borderRadius: '10px', textAlign: 'left',
                      border: dietType === preset.label ? '2px solid #059669' : '1px solid #e2e8f0',
                      background: dietType === preset.label ? '#ecfdf5' : '#f8fafc',
                      cursor: 'pointer', fontSize: '12px', fontWeight: 700,
                      color: dietType === preset.label ? '#064e3b' : '#475569'
                    }}
                  >
                    {preset.label}
                    <span style={{ display: 'block', fontSize: '10px', color: '#94a3b8', marginTop: '2px' }}>
                      {preset.calories} kcal
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Custom Form */}
            <form onSubmit={handleAssign}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '14px' }}>
                <div style={{ gridColumn: '1 / -1' }}>
                  <label style={{ display: 'block', fontSize: '11px', fontWeight: 800, color: '#0f172a', textTransform: 'uppercase', marginBottom: '4px' }}>
                    Diet Type / Plan Name
                  </label>
                  <input
                    type="text"
                    value={dietType}
                    onChange={(e) => setDietType(e.target.value)}
                    required
                    placeholder="e.g. High Protein Athlete"
                    style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1.5px solid #cbd5e1', fontWeight: 700, fontSize: '13px', boxSizing: 'border-box' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '11px', fontWeight: 800, color: '#0f172a', textTransform: 'uppercase', marginBottom: '4px' }}>Daily Calories</label>
                  <input type="number" value={dailyCalories} onChange={(e) => setDailyCalories(Number(e.target.value))} required
                    style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1.5px solid #cbd5e1', fontWeight: 700, fontSize: '13px', boxSizing: 'border-box' }} />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '11px', fontWeight: 800, color: '#0f172a', textTransform: 'uppercase', marginBottom: '4px' }}>Protein (g)</label>
                  <input type="number" value={proteinG} onChange={(e) => setProteinG(Number(e.target.value))}
                    style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1.5px solid #cbd5e1', fontWeight: 700, fontSize: '13px', boxSizing: 'border-box' }} />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '11px', fontWeight: 800, color: '#0f172a', textTransform: 'uppercase', marginBottom: '4px' }}>Carbs (g)</label>
                  <input type="number" value={carbsG} onChange={(e) => setCarbsG(Number(e.target.value))}
                    style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1.5px solid #cbd5e1', fontWeight: 700, fontSize: '13px', boxSizing: 'border-box' }} />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '11px', fontWeight: 800, color: '#0f172a', textTransform: 'uppercase', marginBottom: '4px' }}>Fats (g)</label>
                  <input type="number" value={fatsG} onChange={(e) => setFatsG(Number(e.target.value))}
                    style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1.5px solid #cbd5e1', fontWeight: 700, fontSize: '13px', boxSizing: 'border-box' }} />
                </div>
              </div>

              {/* Macro Preview */}
              <div style={{
                background: '#f0fdf4', border: '1px solid #bbf7d0',
                borderRadius: '10px', padding: '12px 14px', marginBottom: '16px',
                display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '8px', textAlign: 'center'
              }}>
                <div>
                  <div style={{ fontSize: '18px', fontWeight: 900, color: '#059669' }}>{dailyCalories}</div>
                  <div style={{ fontSize: '10px', fontWeight: 800, color: '#65a30d' }}>KCAL</div>
                </div>
                <div>
                  <div style={{ fontSize: '18px', fontWeight: 900, color: '#ca8a04' }}>{proteinG}g</div>
                  <div style={{ fontSize: '10px', fontWeight: 800, color: '#92400e' }}>PROTEIN</div>
                </div>
                <div>
                  <div style={{ fontSize: '18px', fontWeight: 900, color: '#2563eb' }}>{carbsG}g</div>
                  <div style={{ fontSize: '10px', fontWeight: 800, color: '#1e40af' }}>CARBS</div>
                </div>
                <div>
                  <div style={{ fontSize: '18px', fontWeight: 900, color: '#7c3aed' }}>{fatsG}g</div>
                  <div style={{ fontSize: '10px', fontWeight: 800, color: '#5b21b6' }}>FATS</div>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '10px' }}>
                <button type="button" onClick={() => setShowAssignModal(false)}
                  style={{ flex: 1, padding: '11px', borderRadius: '10px', border: '1.5px solid #e2e8f0', background: '#f8fafc', fontWeight: 800, fontSize: '13px', cursor: 'pointer', color: '#475569' }}>
                  Cancel
                </button>
                <button type="submit"
                  style={{ flex: 2, padding: '11px', borderRadius: '10px', background: 'linear-gradient(135deg, #059669 0%, #047857 100%)', color: '#fff', border: 'none', fontWeight: 900, fontSize: '13px', cursor: 'pointer', boxShadow: '0 4px 12px rgba(5, 150, 105, 0.3)' }}>
                  Assign to {selectedMember.name}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* RECOMMEND FOODS MODAL */}
      {showRecommendModal && selectedMember && (
        <div style={{
          position: 'fixed', inset: 0,
          background: 'rgba(0,0,0,0.55)', zIndex: 10000,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          padding: '20px'
        }}>
          <div style={{
            background: '#fff', borderRadius: '20px',
            width: '100%', maxWidth: '580px',
            maxHeight: '90vh', overflowY: 'auto',
            padding: '28px', boxShadow: '0 24px 60px rgba(0,0,0,0.2)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <div>
                <h2 style={{ margin: 0, fontSize: '18px', fontWeight: 900, color: '#0f172a' }}>
                  Recommend Foods
                </h2>
                <p style={{ margin: '4px 0 0', fontSize: '13px', color: '#64748b', fontWeight: 600 }}>
                  For: <strong style={{ color: '#0284c7' }}>{selectedMember.name}</strong>
                </p>
              </div>
              <button onClick={() => { setShowRecommendModal(false); setSelectedFoods([]); }}
                style={{ background: 'none', border: 'none', fontSize: '22px', cursor: 'pointer', color: '#64748b' }}>x</button>
            </div>

            <p style={{ fontSize: '13px', color: '#64748b', fontWeight: 600, marginBottom: '16px' }}>
              Select foods to recommend. These will be saved as {selectedMember.name}'s dietary recommendation.
            </p>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '10px', marginBottom: '20px' }}>
              {FOOD_RECOMMENDATIONS.map((item) => {
                const isSelected = selectedFoods.includes(item.food);
                return (
                  <button key={item.food} onClick={() => toggleFood(item.food)}
                    style={{
                      padding: '10px 12px', borderRadius: '10px', textAlign: 'left',
                      border: isSelected ? '2px solid #0284c7' : '1px solid #e2e8f0',
                      background: isSelected ? '#eff6ff' : '#f8fafc',
                      cursor: 'pointer', transition: 'all 0.12s ease'
                    }}>
                    <div style={{ fontWeight: 800, fontSize: '13px', color: isSelected ? '#0369a1' : '#0f172a' }}>
                      {isSelected ? '✓ ' : ''}{item.food}
                    </div>
                    <div style={{ fontSize: '11px', color: '#64748b', fontWeight: 600, marginTop: '2px' }}>
                      {item.macro} — {item.kcal} kcal/100g
                    </div>
                    <div style={{ fontSize: '11px', color: '#94a3b8', marginTop: '1px' }}>{item.note}</div>
                  </button>
                );
              })}
            </div>

            {selectedFoods.length > 0 && (
              <div style={{ background: '#eff6ff', border: '1.5px solid #bfdbfe', borderRadius: '10px', padding: '12px', marginBottom: '16px' }}>
                <div style={{ fontSize: '11px', fontWeight: 800, color: '#1e40af', marginBottom: '6px' }}>
                  SELECTED ({selectedFoods.length}):
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                  {selectedFoods.map((f) => (
                    <span key={f} style={{ background: '#2563eb', color: '#fff', padding: '3px 10px', borderRadius: '20px', fontSize: '11px', fontWeight: 700 }}>{f}</span>
                  ))}
                </div>
              </div>
            )}

            <form onSubmit={handleRecommend}>
              <div style={{ display: 'flex', gap: '10px' }}>
                <button type="button" onClick={() => { setShowRecommendModal(false); setSelectedFoods([]); }}
                  style={{ flex: 1, padding: '11px', borderRadius: '10px', border: '1.5px solid #e2e8f0', background: '#f8fafc', fontWeight: 800, fontSize: '13px', cursor: 'pointer', color: '#475569' }}>
                  Cancel
                </button>
                <button type="submit" disabled={selectedFoods.length === 0}
                  style={{
                    flex: 2, padding: '11px', borderRadius: '10px',
                    background: selectedFoods.length > 0 ? 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)' : '#e2e8f0',
                    color: selectedFoods.length > 0 ? '#fff' : '#94a3b8',
                    border: 'none', fontWeight: 900, fontSize: '13px',
                    cursor: selectedFoods.length > 0 ? 'pointer' : 'not-allowed',
                    boxShadow: selectedFoods.length > 0 ? '0 4px 12px rgba(2, 132, 199, 0.3)' : 'none'
                  }}>
                  Send Recommendation to {selectedMember.name}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
