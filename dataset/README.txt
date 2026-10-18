================================================================================
SMART FITNESS COMPANION - DATASET INDEX & DIRECTORY MANIFEST
================================================================================
Directory Path: /dataset/
Total Files: 7 Dataset Files + 1 Manifest
Format: Plain Text (.txt) UTF-8

Overview:
This directory contains structured text-based dataset files for the Smart Fitness
Companion application. The data covers exercises, workout protocols, sensor telemetry,
nutrition plans, sleep logs, user demographics, and AI coach knowledge base.

--------------------------------------------------------------------------------
FILE MANIFEST & DESCRIPTION
--------------------------------------------------------------------------------

1. exercises_dataset.txt
   - Contains detailed profiles for 10 core exercise routines across strength, HIIT, and cardio.
   - Fields: Exercise ID, Name, Category, Primary/Secondary Muscle Groups, Equipment,
     Difficulty, Recommended Sets & Reps, Calorie Burn rate, and Step-by-step Execution.

2. workout_plans_dataset.txt
   - Defines multi-week structured fitness plans (e.g. Summer Shred, Strength Foundations).
   - Includes daily routine schedules, target heart rate zones, assigned exercises, and energy expenditure.

3. health_telemetry_dataset.txt
   - Time-series wearable sensor logs spanning continuous tracking dates.
   - Fields: Timestamp, User ID, Heart Rate (BPM), Step Count, Blood Pressure (Sys/Dia), SpO2,
     Active Calories, and Stress Index.

4. nutrition_and_recipes_dataset.txt
   - Dietary guidelines, macro nutrient goals (Protein, Carbs, Fats), and athletic recipes.
   - Includes full ingredients list, macro breakdowns, preparation steps, and meal categories.

5. sleep_and_recovery_dataset.txt
   - Sleep hypnograms and nocturnal biometric recovery records.
   - Tracks total sleep duration, sleep score, deep/REM/light sleep stages, nocturnal HRV (RMSSD),
     and recovery readiness assessments.

6. user_profiles_and_goals.txt
   - User demographics, anthropometric body measurements progression, active fitness goals,
     and paired IoT hardware device status.

7. ai_coach_knowledge_base.txt
   - Domain knowledge base, safety rules, evidence-based recommendations, and response templates
     for the embedded AI Fitness Coach.

--------------------------------------------------------------------------------
USAGE INSTRUCTIONS
--------------------------------------------------------------------------------
- These text files can be ingested by data processing scripts, LLM prompt context windows,
  or converted into JSON/Database formats for application seeding and machine learning models.
================================================================================
