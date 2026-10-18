/**
 * Automatic BMI & Age Fitness/Nutrition Analysis Engine
 * Calculates BMI, BMR, suggested Macros (Calories, Protein, Carbs, Fats),
 * and specific Exercise Recommendations tailored to user's BMI, Age & Fitness Level.
 */
export function calculatePersonalBmiAnalysis(user) {
  const weight = Number(user?.weight) || 72;
  const height = Number(user?.height) || 175; // in cm
  const age = Number(user?.age) || 26;
  const gender = user?.gender || 'male';

  const heightM = height / 100;
  const bmi = heightM > 0 ? Number((weight / (heightM * heightM)).toFixed(1)) : 22.5;

  // Mifflin-St Jeor BMR Equation factoring in Age
  const bmr = Math.round(10 * weight + 6.25 * height - 5 * age + (gender === 'female' ? -161 : 5));

  let bmiCategory = '';
  let bmiColor = '#16a34a';
  let bmiBg = '#dcfce7';
  let recommendedDiet = '';
  let targetCalories = 2200;
  let proteinG = 150;
  let carbsG = 210;
  let fatsG = 65;
  let recommendedExercises = [];
  let workoutFocus = '';
  let ageAdvice = '';

  if (bmi < 18.5) {
    bmiCategory = 'Underweight (BMI < 18.5)';
    bmiColor = '#ca8a04';
    bmiBg = '#fef9c3';
    recommendedDiet = 'High-Calorie Hypertrophy & Muscle Gain';
    targetCalories = Math.round(bmr * 1.45 + 300);
    proteinG = Math.round(weight * 2.2);
    carbsG = Math.round((targetCalories * 0.5) / 4);
    fatsG = Math.round((targetCalories * 0.25) / 9);
    workoutFocus = 'Hypertrophy & Heavy Progressive Overload';
    recommendedExercises = [
      { name: 'Barbell Deadlifts & Heavy Squats', sets: 4, reps: '8-10 reps', focus: 'Leg & Posterior Chain Mass' },
      { name: 'Incline Dumbbell Bench Press & Rows', sets: 4, reps: '10-12 reps', focus: 'Upper Body Hypertrophy' },
      { name: 'Weighted Bodyweight Pull Ups & Dips', sets: 3, reps: '8-10 reps', focus: 'Upper Body Thickness' }
    ];
    ageAdvice = age < 30
      ? `At age ${age}, your fast metabolism requires a structured 300-500 kcal surplus with high-density carbs and heavy compound lifting.`
      : `At age ${age}, balance progressive strength training with adequate recovery windows and high protein synthesis.`;
  } else if (bmi >= 18.5 && bmi < 25.0) {
    bmiCategory = 'Normal Weight (18.5 - 24.9)';
    bmiColor = '#16a34a';
    bmiBg = '#dcfce7';
    recommendedDiet = 'Balanced Performance & Iso-Caloric Maintenance';
    targetCalories = Math.round(bmr * 1.35);
    proteinG = Math.round(weight * 2.0);
    carbsG = Math.round((targetCalories * 0.45) / 4);
    fatsG = Math.round((targetCalories * 0.25) / 9);
    workoutFocus = 'Powerbuilding & Athletic Conditioning';
    recommendedExercises = [
      { name: 'HIIT Treadmill & Sprint Intervals', sets: 4, reps: '45s Sprint / 15s Rest', focus: 'Cardio Stamina & VO2 Max' },
      { name: 'Compound Barbell Clean & Press', sets: 4, reps: '8-10 reps', focus: 'Full-Body Powerbuilding' },
      { name: 'Plyometric Box Jumps & Core Tabata', sets: 4, reps: '20s / 10s', focus: 'Agility & Muscular Endurance' }
    ];
    ageAdvice = age < 30
      ? `At age ${age}, you are in a prime physical output window! Combine progressive heavy lifting with 2-3 HIIT cardio sessions weekly.`
      : `At age ${age}, focus on athletic longevity, maintaining lean muscle mass, and maintaining optimal hydration and sleep recovery.`;
  } else if (bmi >= 25.0 && bmi < 30.0) {
    bmiCategory = 'Overweight (25.0 - 29.9)';
    bmiColor = '#2563eb';
    bmiBg = '#dbeafe';
    recommendedDiet = 'High-Protein Caloric Deficit & Fat Shred';
    targetCalories = Math.round(bmr * 1.2 - 250);
    proteinG = Math.round(weight * 2.2);
    carbsG = Math.round((targetCalories * 0.35) / 4);
    fatsG = Math.round((targetCalories * 0.25) / 9);
    workoutFocus = 'Metabolic Resistance & Fat Oxidation';
    recommendedExercises = [
      { name: 'Kettlebell Swings & Dumbbell Thrusters', sets: 5, reps: '15-20 reps', focus: 'Fat Oxidation & High Heart Rate' },
      { name: 'Incline Treadmill Power Walk / Elliptical', sets: 1, reps: '35 mins', focus: 'Low-Impact Fat Burn' },
      { name: 'Bodyweight Push-Up & Core Plank Circuit', sets: 4, reps: '12-15 reps', focus: 'Core Density & Resistance' }
    ];
    ageAdvice = age < 35
      ? `At age ${age}, combine supersets with steady-state cardio to accelerate fat loss while building lean muscle definition.`
      : `At age ${age}, protect joint health with incline walking and high-protein intake to preserve lean muscle during fat loss.`;
  } else {
    bmiCategory = 'Obese Range (BMI ≥ 30.0)';
    bmiColor = '#dc2626';
    bmiBg = '#fef2f2';
    recommendedDiet = 'Metabolic Reset & Structured Deficit';
    targetCalories = Math.round(bmr * 1.1 - 400);
    proteinG = Math.round(weight * 2.0);
    carbsG = Math.round((targetCalories * 0.25) / 4);
    fatsG = Math.round((targetCalories * 0.30) / 9);
    workoutFocus = 'Low-Impact Cardio & Functional Mobility';
    recommendedExercises = [
      { name: 'Stationary Ergometer Bike & Rowing', sets: 1, reps: '30 mins', focus: 'Joint-Safe Aerobic Conditioning' },
      { name: 'Seated Overhead Dumbbell Press & Lat Pulldowns', sets: 3, reps: '12-15 reps', focus: 'Upper Body Postural Control' },
      { name: 'Wall Push-Ups & Assisted Step-Ups', sets: 3, reps: '10-12 reps', focus: 'Functional Mobility' }
    ];
    ageAdvice = `At age ${age}, focus on steady low-impact daily movement, hydration, and a sustainable 400-500 kcal deficit.`;
  }

  return {
    weight,
    height,
    age,
    bmi,
    bmr,
    bmiCategory,
    bmiColor,
    bmiBg,
    recommendedDiet,
    targetCalories,
    proteinG,
    carbsG,
    fatsG,
    workoutFocus,
    recommendedExercises,
    ageAdvice
  };
}
