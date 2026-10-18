import React, { useState, useRef } from 'react';
import * as aiService from '../services/aiService.js';

const RECIPE_PROCESSES = {
  1: {
    steps: [
      { step: 1, title: 'Fluff & Cook Quinoa Base', desc: 'Rinse 1 cup of quinoa in cold water. Bring 2 cups of water or vegetable broth to a boil, stir in quinoa, reduce heat to low, cover, and simmer for 15 minutes until tender and liquid is absorbed.' },
      { step: 2, title: 'Season & Sear Fresh Salmon', desc: 'Pat dry salmon fillet with paper towels. Season both sides with sea salt, cracked pepper, garlic powder, and lemon juice. Heat 1 tbsp olive oil in a skillet on medium-high. Sear skin-side down for 4-5 mins until crispy, flip and cook 3 mins until flaky.' },
      { step: 3, title: 'Steam Vegetables & Slice Avocado', desc: 'Steam fresh broccoli florets for 4 minutes until vibrant green and tender-crisp. Slice half a ripe Hass avocado.' },
      { step: 4, title: 'Assemble & Serve Bowl', desc: 'Spoon warm fluffy quinoa into a wide bowl, place seared salmon on top, arrange steamed broccoli and avocado slices alongside, and finish with fresh lemon juice and virgin olive oil.' }
    ],
    ingredients: ['Salmon Fillet (200g)', 'Quinoa (1 cup)', 'Fresh Broccoli (100g)', 'Hass Avocado (1/2)', 'Lemon Juice & Olive Oil', 'Garlic, Salt, Pepper']
  },
  2: {
    steps: [
      { step: 1, title: 'Prep Ingredients & Protein Isolate', desc: 'Measure 1 scoop of vanilla whey protein isolate and 1 cup of frozen blueberries.' },
      { step: 2, title: 'Combine in High-Speed Blender', desc: 'Add protein powder, blueberries, 1/2 cup Greek yogurt, 1 tbsp chia seeds, and 1 handful of fresh baby spinach into the blender pitcher.' },
      { step: 3, title: 'Liquid Base & Blend', desc: 'Pour in 1 cup of cold unsweetened almond milk. Blend on high speed for 60 seconds until completely smooth, silky, and thick.' },
      { step: 4, title: 'Garnish & Drink', desc: 'Pour into a tall chilled glass. Garnish with a few fresh berries and a sprinkle of chia seeds. Serve immediately.' }
    ],
    ingredients: ['Whey Protein Isolate (1 scoop)', 'Frozen Blueberries (1 cup)', 'Greek Yogurt (1/2 cup)', 'Chia Seeds (1 tbsp)', 'Almond Milk (1 cup)', 'Fresh Spinach']
  },
  3: {
    steps: [
      { step: 1, title: 'Dice Sweet Potatoes & Veggies', desc: 'Peel and cube 1 medium sweet potato into small 1/2-inch bites. Finely chop red bell pepper, onions, and minced garlic.' },
      { step: 2, title: 'Sauté Sweet Potato Cubes', desc: 'Heat 1 tbsp extra virgin olive oil in a large skillet. Add sweet potato cubes, cover with lid, and cook on medium heat for 10 minutes, stirring occasionally until tender.' },
      { step: 3, title: 'Brown Ground Turkey', desc: 'Push sweet potatoes to the side. Add 200g lean ground turkey breast, garlic, smoked paprika, ground cumin, sea salt, and black pepper. Break apart turkey with a spatula until fully browned and cooked through (6-8 mins).' },
      { step: 4, title: 'Toss & Garnish', desc: 'Combine sweet potatoes, turkey, and bell peppers in the skillet. Cook for 2 minutes together. Garnish with chopped fresh cilantro and serve hot.' }
    ],
    ingredients: ['Lean Ground Turkey (200g)', 'Medium Sweet Potato (1)', 'Red Bell Pepper (1)', 'Garlic & Smoked Paprika', 'Extra Virgin Olive Oil', 'Fresh Cilantro']
  },
  4: {
    steps: [
      { step: 1, title: 'Prepare Greek Yogurt Base', desc: 'Scoop 200g of plain non-fat Greek yogurt into a glass parfait jar or serving bowl.' },
      { step: 2, title: 'Layer Fresh Berries', desc: 'Wash and slice fresh raspberries and strawberries. Layer half of the berries over the Greek yogurt.' },
      { step: 3, title: 'Add Crunch & Nuts', desc: 'Sprinkle 2 tbsp of raw sliced almonds and chopped walnuts over the berry layer.' },
      { step: 4, title: 'Drizzle Honey & Serve', desc: 'Repeat with remaining yogurt and berries, then drizzle 1 tbsp of organic raw honey on top. Enjoy fresh!' }
    ],
    ingredients: ['Greek Yogurt (200g)', 'Mixed Berries (1/2 cup)', 'Raw Sliced Almonds (2 tbsp)', 'Organic Raw Honey (1 tbsp)']
  },
  5: {
    steps: [
      { step: 1, title: 'Toast Artisanal Sourdough', desc: 'Toast 2 slices of thick sourdough bread until golden brown and sturdy.' },
      { step: 2, title: 'Mash Avocado & Seasoning', desc: 'Scoop 1 ripe avocado into a bowl. Mash with a fork, mixing in 1 tsp lemon juice, sea salt, red chili flakes, and black pepper.' },
      { step: 3, title: 'Poach Organic Eggs', desc: 'Bring a small pot of water with 1 tsp vinegar to a gentle simmer. Create a vortex with a spoon, drop in 2 organic eggs, and poach for 3 minutes until whites are firm and yolks remain runny.' },
      { step: 4, title: 'Assemble Toast', desc: 'Spread mashed avocado evenly onto toasted sourdough, place poached eggs on top, garnish with hemp seeds and chili flakes.' }
    ],
    ingredients: ['Sourdough Bread (2 slices)', 'Ripe Avocado (1)', 'Organic Eggs (2)', 'Hemp Seeds & Chili Flakes', 'Lemon Juice & Sea Salt']
  },
  6: {
    steps: [
      { step: 1, title: 'Marinate Chicken Breast', desc: 'Coat 200g chicken breast in olive oil, lemon juice, minced garlic, dried oregano, salt, and black pepper. Rest for 15 minutes.' },
      { step: 2, title: 'Grill Chicken Fillet', desc: 'Heat grill pan on medium-high heat. Grill chicken for 6-7 minutes per side until internal temperature reaches 165°F (74°C). Rest for 5 minutes, then slice.' },
      { step: 3, title: 'Roast Veggies & Kale', desc: 'Roast sweet potato wedges at 400°F (200°C) for 20 minutes. Massage fresh kale leaves with olive oil and lemon juice.' },
      { step: 4, title: 'Assemble Power Bowl', desc: 'Arrange sliced grilled chicken, roasted sweet potatoes, and massaged kale in a bowl. Drizzle with creamy tahini dressing and toasted pumpkin seeds.' }
    ],
    ingredients: ['Chicken Breast (200g)', 'Sweet Potato (1/2)', 'Fresh Kale (1 cup)', 'Tahini Dressing & Lemon', 'Pumpkin Seeds']
  }
};

export default function RecipeLibrary({ recipes = [], onAddToPlan, user }) {
  const [filterCat, setFilterCat] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');
  const [isScanning, setIsScanning] = useState(false);
  const [scannedRecipe, setScannedRecipe] = useState(null);
  const [selectedProcessRecipe, setSelectedProcessRecipe] = useState(null);
  const fileInputRef = useRef(null);

  const filtered = recipes.filter((r) => {
    const matchesCat = filterCat === 'All' || r.category === filterCat;
    const matchesSearch = r.title.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCat && matchesSearch;
  });

  const getProcessForRecipe = (recipe) => {
    if (!recipe) return null;
    if (RECIPE_PROCESSES[recipe.recipe_id]) {
      return RECIPE_PROCESSES[recipe.recipe_id];
    }
    // Dynamic process fallback for AI scanned / custom recipes
    return {
      ingredients: ['Primary Protein / Main Ingredient', 'Complex Carbs & Grains', 'Healthy Fats & Oil', 'Fresh Seasonings & Spices'],
      steps: [
        { step: 1, title: 'Ingredient Preparation', desc: `Clean and chop fresh ingredients for ${recipe.title}. Prepare seasonings and heat cooking surface.` },
        { step: 2, title: 'Primary Cooking Phase', desc: recipe.prep || `Cook main components thoroughly. Sauté or roast to optimal temperature.` },
        { step: 3, title: 'Flavor Balancing & Plating', desc: 'Season with sea salt, pepper, and fresh herbs. Plate neatly over warm base.' },
        { step: 4, title: 'Final Touch & Serving', desc: 'Garnish with seeds or fresh citrus squeeze and enjoy while hot!' }
      ]
    };
  };

  const handleScanMealImage = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (uploadEvent) => {
      const base64 = uploadEvent.target.result;
      setIsScanning(true);
      try {
        const recipe = await aiService.generateAiRecipeFromImage({ imageBase64: base64, user });
        setScannedRecipe({
          recipe_id: Date.now(),
          title: recipe.title || 'Scanned Meal',
          category: recipe.category || 'High Protein',
          calories: recipe.calories || 550,
          protein: recipe.protein || 40,
          carbs: recipe.carbs || 50,
          fats: recipe.fats || 15,
          prep: recipe.description || 'Meal scanned with Gemini AI Vision analysis.',
          time: 'Instant'
        });
      } catch (err) {
        alert(`AI Scanner Notice: ${err.message}`);
      } finally {
        setIsScanning(false);
      }
    };
    reader.readAsDataURL(file);
  };

  const activeProcess = getProcessForRecipe(selectedProcessRecipe);

  return (
    <div className="page-container" style={{ padding: '2rem' }}>
      <header className="page-header flex-between align-center flex-wrap gap-2 mb-4">
        <div>
          <div className="page-eyebrow" style={{ fontWeight: 800, color: '#ca8a04', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            RECIPES
          </div>
          <h1 className="page-title" style={{ fontSize: '1.75rem', fontWeight: 900, margin: '0.2rem 0' }}>
            Recipe & Meal Library
          </h1>
          <p className="page-subtitle" style={{ fontWeight: 600, color: '#64748b' }}>
            Explore recipes, macro details, and step-by-step cooking instructions.
          </p>
        </div>

        <div>
          <input
            type="file"
            ref={fileInputRef}
            accept="image/*"
            style={{ display: 'none' }}
            onChange={handleScanMealImage}
          />
          <button
            className="btn btn-primary text-xs flex align-center gap-1"
            onClick={() => fileInputRef.current?.click()}
            disabled={isScanning}
            style={{ fontWeight: 900, padding: '0.65rem 1.1rem', borderRadius: '8px', cursor: 'pointer' }}
          >
            {isScanning ? '⏳ Scanning Photo...' : '📷 AI Photo Meal Scanner'}
          </button>
        </div>
      </header>

      {/* Scanned Recipe Banner */}
      {scannedRecipe && (
        <div
          className="card mb-4 p-4"
          style={{
            border: '2px solid #ca8a04',
            borderRadius: '16px',
            background: 'linear-gradient(135deg, #fef9c3 0%, #ffffff 100%)',
            boxShadow: '0 4px 15px rgba(202,138,4,0.15)'
          }}
        >
          <div className="flex-between align-center mb-2">
            <span
              style={{
                fontSize: '0.78rem',
                fontWeight: 900,
                padding: '0.25rem 0.65rem',
                borderRadius: '6px',
                background: '#ca8a04',
                color: '#ffffff',
                textTransform: 'uppercase'
              }}
            >
              📸 Scanned Recipe Result
            </span>
            <button
              onClick={() => setScannedRecipe(null)}
              style={{ background: 'none', border: 'none', fontWeight: 900, cursor: 'pointer', fontSize: '1rem', color: '#0f172a' }}
            >
              ✕ Clear
            </button>
          </div>

          <h3 style={{ fontSize: '1.25rem', fontWeight: 900, color: '#0f172a', margin: '0.5rem 0 0.2rem 0' }}>
            {scannedRecipe.title}
          </h3>
          <p style={{ fontSize: '0.85rem', fontWeight: 700, color: '#475569', marginBottom: '1rem' }}>
            {scannedRecipe.prep}
          </p>

          {/* Macro Row */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(4, 1fr)',
              gap: '0.75rem',
              background: '#ffffff',
              border: '1px solid #e2e8f0',
              borderRadius: '10px',
              padding: '0.75rem',
              textAlign: 'center',
              marginBottom: '1rem'
            }}
          >
            <div>
              <div style={{ fontSize: '1.15rem', fontWeight: 900, color: '#0f172a' }}>{scannedRecipe.calories}</div>
              <div style={{ fontSize: '0.7rem', fontWeight: 900, color: '#64748b', textTransform: 'uppercase' }}>CALORIES</div>
            </div>
            <div>
              <div style={{ fontSize: '1.15rem', fontWeight: 900, color: '#2563eb' }}>{scannedRecipe.protein}g</div>
              <div style={{ fontSize: '0.7rem', fontWeight: 900, color: '#2563eb', textTransform: 'uppercase' }}>PROTEIN</div>
            </div>
            <div>
              <div style={{ fontSize: '1.15rem', fontWeight: 900, color: '#16a34a' }}>{scannedRecipe.carbs}g</div>
              <div style={{ fontSize: '0.7rem', fontWeight: 900, color: '#16a34a', textTransform: 'uppercase' }}>CARBS</div>
            </div>
            <div>
              <div style={{ fontSize: '1.15rem', fontWeight: 900, color: '#ca8a04' }}>{scannedRecipe.fats}g</div>
              <div style={{ fontSize: '0.7rem', fontWeight: 900, color: '#ca8a04', textTransform: 'uppercase' }}>FATS</div>
            </div>
          </div>

          <button
            className="btn btn-primary w-full text-xs"
            onClick={() => setSelectedProcessRecipe(scannedRecipe)}
            style={{ fontWeight: 900, padding: '0.75rem', borderRadius: '8px', width: '100%', cursor: 'pointer', background: '#ca8a04', border: 'none', color: '#ffffff', fontSize: '0.9rem' }}
          >
            🍳 The Process of Making That Food
          </button>
        </div>
      )}

      {/* Filter and Search Bar */}
      <div
        className="card mb-4 p-3 flex-between align-center flex-wrap gap-3"
        style={{ borderRadius: '14px', border: '1px solid #e2e8f0' }}
      >
        <div className="flex-gap align-center flex-wrap" style={{ gap: '0.6rem', display: 'flex', alignItems: 'center', width: '100%' }}>
          <input
            type="text"
            className="input-field"
            placeholder="🔍 Search recipes by title..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{
              padding: '0.55rem 1rem',
              borderRadius: '8px',
              border: '1px solid #cbd5e1',
              fontWeight: 800,
              flex: 1,
              minWidth: '220px'
            }}
          />

          <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
            {['All', 'High Protein', 'Breakfast', 'Dinner', 'Snack'].map((cat) => {
              const isActive = filterCat === cat;
              return (
                <button
                  key={cat}
                  onClick={() => setFilterCat(cat)}
                  style={{
                    padding: '0.55rem 0.95rem',
                    borderRadius: '8px',
                    border: isActive ? '2px solid #2563eb' : '1px solid #cbd5e1',
                    background: isActive ? '#2563eb' : '#ffffff',
                    color: isActive ? '#ffffff' : '#0f172a',
                    fontWeight: 900,
                    fontSize: '0.82rem',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease'
                  }}
                >
                  {cat}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Recipes Cards Grid */}
      <div className="grid grid-2 gap-4">
        {filtered.map((recipe) => (
          <div
            key={recipe.recipe_id}
            className="card recipe-card p-0 overflow-hidden"
            style={{
              borderRadius: '16px',
              border: '1px solid #e2e8f0',
              overflow: 'hidden',
              background: '#ffffff',
              boxShadow: '0 2px 10px rgba(0,0,0,0.03)',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between'
            }}
          >
            <div style={{ position: 'relative', height: '100px', width: '100%', background: 'linear-gradient(135deg, #2563eb 0%, #1e40af 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <span style={{ fontSize: '2.5rem' }}>🍲</span>
              <div style={{ position: 'absolute', top: 12, left: 12 }}>
                <span
                  style={{
                    background: '#ca8a04',
                    color: '#ffffff',
                    fontSize: '0.72rem',
                    fontWeight: 900,
                    padding: '0.25rem 0.65rem',
                    borderRadius: '6px',
                    textTransform: 'uppercase'
                  }}
                >
                  {recipe.category}
                </span>
              </div>
              <div
                style={{
                  position: 'absolute',
                  bottom: 12,
                  right: 12,
                  background: 'rgba(15,23,42,0.85)',
                  color: '#ffffff',
                  fontSize: '0.75rem',
                  fontWeight: 900,
                  padding: '0.25rem 0.65rem',
                  borderRadius: '6px'
                }}
              >
                ⏱ {recipe.time}
              </div>
            </div>

            <div className="p-4" style={{ padding: '1.25rem', flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
              <div>
                {!recipe.image && (
                  <div className="flex-between align-center mb-2" style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                    <span
                      style={{
                        background: '#ca8a04',
                        color: '#ffffff',
                        fontSize: '0.72rem',
                        fontWeight: 900,
                        padding: '0.2rem 0.55rem',
                        borderRadius: '6px',
                        textTransform: 'uppercase'
                      }}
                    >
                      {recipe.category}
                    </span>
                    <span style={{ fontSize: '0.75rem', fontWeight: 800, color: '#64748b' }}>⏱ {recipe.time}</span>
                  </div>
                )}

                <h3 style={{ fontSize: '1.15rem', fontWeight: 900, color: '#0f172a', margin: '0 0 0.4rem 0' }}>
                  {recipe.title}
                </h3>
                <p style={{ fontSize: '0.85rem', fontWeight: 700, color: '#475569', margin: '0 0 1rem 0', lineHeight: 1.45 }}>
                  {recipe.prep}
                </p>
              </div>

              <div>
                {/* High Contrast Macro Chips Row */}
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(4, 1fr)',
                    gap: '0.5rem',
                    background: '#f8fafc',
                    border: '1px solid #e2e8f0',
                    borderRadius: '10px',
                    padding: '0.65rem',
                    textAlign: 'center',
                    marginBottom: '1rem'
                  }}
                >
                  <div>
                    <div style={{ fontSize: '1rem', fontWeight: 900, color: '#0f172a' }}>{recipe.calories}</div>
                    <div style={{ fontSize: '0.68rem', fontWeight: 900, color: '#64748b', textTransform: 'uppercase' }}>KCAL</div>
                  </div>
                  <div>
                    <div style={{ fontSize: '1rem', fontWeight: 900, color: '#2563eb' }}>{recipe.protein}g</div>
                    <div style={{ fontSize: '0.68rem', fontWeight: 900, color: '#2563eb', textTransform: 'uppercase' }}>PROT</div>
                  </div>
                  <div>
                    <div style={{ fontSize: '1rem', fontWeight: 900, color: '#16a34a' }}>{recipe.carbs}g</div>
                    <div style={{ fontSize: '0.68rem', fontWeight: 900, color: '#16a34a', textTransform: 'uppercase' }}>CARB</div>
                  </div>
                  <div>
                    <div style={{ fontSize: '1rem', fontWeight: 900, color: '#ca8a04' }}>{recipe.fats}g</div>
                    <div style={{ fontSize: '0.68rem', fontWeight: 900, color: '#ca8a04', textTransform: 'uppercase' }}>FAT</div>
                  </div>
                </div>

                <button
                  onClick={() => setSelectedProcessRecipe(recipe)}
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    background: 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)',
                    color: '#ffffff',
                    border: 'none',
                    borderRadius: '10px',
                    fontWeight: 900,
                    fontSize: '0.88rem',
                    cursor: 'pointer',
                    boxShadow: '0 4px 12px rgba(37,99,235,0.25)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '0.5rem',
                    transition: 'all 0.15s ease'
                  }}
                >
                  <span>🍳</span> The Process of Making That Food
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* MODAL DIALOG: THE PROCESS OF MAKING THAT FOOD */}
      {selectedProcessRecipe && activeProcess && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(15, 23, 42, 0.75)',
            backdropFilter: 'blur(6px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 9999,
            padding: '1.5rem'
          }}
          onClick={() => setSelectedProcessRecipe(null)}
        >
          <div
            style={{
              background: '#ffffff',
              borderRadius: '20px',
              maxWidth: '650px',
              width: '100%',
              maxHeight: '90vh',
              overflowY: 'auto',
              padding: '2rem',
              boxShadow: '0 20px 40px rgba(0,0,0,0.2)',
              position: 'relative'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.25rem' }}>
              <div>
                <span
                  style={{
                    fontSize: '0.72rem',
                    fontWeight: 900,
                    padding: '0.2rem 0.6rem',
                    borderRadius: '6px',
                    background: '#ca8a04',
                    color: '#ffffff',
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em'
                  }}
                >
                  🍳 STEP-BY-STEP COOKING WORKFLOW
                </span>
                <h2 style={{ fontSize: '1.65rem', fontWeight: 900, color: '#0f172a', margin: '0.4rem 0 0.1rem 0' }}>
                  {selectedProcessRecipe.title}
                </h2>
                <div style={{ fontSize: '0.82rem', fontWeight: 700, color: '#64748b' }}>
                  Category: <strong>{selectedProcessRecipe.category}</strong> • Est. Time: <strong>{selectedProcessRecipe.time}</strong> • Calories: <strong>{selectedProcessRecipe.calories} kcal</strong>
                </div>
              </div>

              <button
                onClick={() => setSelectedProcessRecipe(null)}
                style={{
                  background: '#f1f5f9',
                  border: 'none',
                  width: '36px',
                  height: '36px',
                  borderRadius: '50%',
                  fontWeight: 900,
                  fontSize: '1.1rem',
                  cursor: 'pointer',
                  color: '#475569',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                ✕
              </button>
            </div>

            {/* INGREDIENTS CHECKLIST SECTION */}
            <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '1rem', marginBottom: '1.5rem' }}>
              <h4 style={{ margin: '0 0 0.5rem 0', fontWeight: 900, fontSize: '0.9rem', color: '#0f172a', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                🛒 Ingredients & Prep Materials Needed:
              </h4>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
                {activeProcess.ingredients.map((ing, idx) => (
                  <span key={idx} style={{ background: '#ffffff', border: '1px solid #cbd5e1', color: '#1e293b', fontWeight: 700, fontSize: '0.78rem', padding: '0.3rem 0.65rem', borderRadius: '6px' }}>
                    • {ing}
                  </span>
                ))}
              </div>
            </div>

            {/* THE PROCESS OF MAKING THAT FOOD - STEP-BY-STEP FLOW */}
            <h3 style={{ fontSize: '1.1rem', fontWeight: 900, color: '#0f172a', margin: '0 0 1rem 0', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span>👨‍🍳</span> THE PROCESS OF MAKING THAT FOOD:
            </h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '1.75rem' }}>
              {activeProcess.steps.map((st) => (
                <div
                  key={st.step}
                  style={{
                    display: 'flex',
                    gap: '1rem',
                    background: '#ffffff',
                    border: '1px solid #e2e8f0',
                    borderRadius: '12px',
                    padding: '1rem',
                    boxShadow: '0 2px 6px rgba(0,0,0,0.02)'
                  }}
                >
                  <div
                    style={{
                      width: '36px',
                      height: '36px',
                      borderRadius: '50%',
                      background: 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)',
                      color: '#ffffff',
                      fontWeight: 900,
                      fontSize: '1rem',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0
                    }}
                  >
                    {st.step}
                  </div>

                  <div style={{ flex: 1 }}>
                    <h4 style={{ margin: '0 0 0.3rem 0', fontWeight: 900, fontSize: '0.98rem', color: '#0f172a' }}>
                      {st.title}
                    </h4>
                    <p style={{ margin: 0, fontSize: '0.85rem', color: '#475569', lineHeight: 1.5, fontWeight: 500 }}>
                      {st.desc}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {/* MODAL BOTTOM ACTION BUTTONS */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
              <button
                onClick={() => {
                  if (onAddToPlan) onAddToPlan(selectedProcessRecipe);
                  alert(`Added "${selectedProcessRecipe.title}" to your Daily Nutrition Plan!`);
                  setSelectedProcessRecipe(null);
                }}
                style={{
                  padding: '0.8rem',
                  borderRadius: '10px',
                  border: 'none',
                  background: '#16a34a',
                  color: '#ffffff',
                  fontWeight: 900,
                  fontSize: '0.88rem',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.4rem'
                }}
              >
                🥗 Log Meal in Plan
              </button>

              <button
                onClick={() => setSelectedProcessRecipe(null)}
                style={{
                  padding: '0.8rem',
                  borderRadius: '10px',
                  border: '1px solid #cbd5e1',
                  background: '#f8fafc',
                  color: '#475569',
                  fontWeight: 900,
                  fontSize: '0.88rem',
                  cursor: 'pointer'
                }}
              >
                Close Process View
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
