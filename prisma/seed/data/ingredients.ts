import { IngredientType, StorageType } from "@prisma/client";

export const meatItems = [
    // =====================
    // BEEF (COW)
    // =====================
    { name: "Beef", type: "food", storageType: "fridge" },
    { name: "Beef mince", type: "food", storageType: "fridge" },
    { name: "Sirloin steak", type: "food", storageType: "fridge" },
    { name: "Ribeye steak", type: "food", storageType: "fridge" },
    { name: "Rump steak", type: "food", storageType: "fridge" },
    { name: "Fillet steak", type: "food", storageType: "fridge" },
    { name: "Flat iron steak", type: "food", storageType: "fridge" },
    { name: "Roasting joint", type: "food", storageType: "fridge" },
    { name: "Brisket", type: "food", storageType: "fridge" },
    { name: "Shin", type: "food", storageType: "fridge" },
    { name: "Short ribs", type: "food", storageType: "fridge" },
    { name: "Beef burgers", type: "food", storageType: "fridge" },
    { name: "Corned beef", type: "food", storageType: "pantry" },
  
    // =====================
    // LAMB / MUTTON (SHEEP)
    // =====================
    { name: "Lamb mince", type: "food", storageType: "fridge" },
    { name: "Lamb chops", type: "food", storageType: "fridge" },
    { name: "Lamb steaks", type: "food", storageType: "fridge" },
    { name: "Lamb leg", type: "food", storageType: "fridge" },
    { name: "Lamb shoulder", type: "food", storageType: "fridge" },
    { name: "Lamb shanks", type: "food", storageType: "fridge" },
    { name: "Diced lamb", type: "food", storageType: "fridge" },
    { name: "Mutton", type: "food", storageType: "fridge" },
  
    // =====================
    // PORK (PIG)
    // =====================
    { name: "Pork", type: "food", storageType: "fridge" },
    { name: "Pork mince", type: "food", storageType: "fridge" },
    { name: "Pork chops", type: "food", storageType: "fridge" },
    { name: "Pork loin", type: "food", storageType: "fridge" },
    { name: "Pork belly", type: "food", storageType: "fridge" },
    { name: "Pork shoulder", type: "food", storageType: "fridge" },
    { name: "Pork steaks", type: "food", storageType: "fridge" },
    { name: "Pork sausages", type: "food", storageType: "fridge" },
    { name: "Chipolatas", type: "food", storageType: "fridge" },
    { name: "Back bacon", type: "food", storageType: "fridge" },
    { name: "Streaky bacon", type: "food", storageType: "fridge" },
    { name: "Gammon joint", type: "food", storageType: "fridge" },
    { name: "Ham slices", type: "food", storageType: "fridge" },
  
    // =====================
    // CHICKEN
    // =====================
    { name: "Chicken", type: "food", storageType: "fridge" },
    { name: "Whole chicken", type: "food", storageType: "fridge" },
    { name: "Chicken breast", type: "food", storageType: "fridge" },
    { name: "Chicken thighs", type: "food", storageType: "fridge" },
    { name: "Chicken drumsticks", type: "food", storageType: "fridge" },
    { name: "Chicken wings", type: "food", storageType: "fridge" },
    { name: "Chicken mince", type: "food", storageType: "fridge" },
    { name: "Diced chicken", type: "food", storageType: "fridge" },
  
    // =====================
    // TURKEY
    // =====================
    { name: "Turkey", type: "food", storageType: "fridge" },
    { name: "Turkey breast", type: "food", storageType: "fridge" },
    { name: "Turkey mince", type: "food", storageType: "fridge" },
    { name: "Turkey sausages", type: "food", storageType: "fridge" },
    { name: "Whole turkey", type: "food", storageType: "fridge" },
  
    // =====================
    // DUCK
    // =====================
    { name: "Duck", type: "food", storageType: "fridge" },
    { name: "Whole duck", type: "food", storageType: "fridge" },
    { name: "Duck breast", type: "food", storageType: "fridge" },
    { name: "Duck legs", type: "food", storageType: "fridge" },
  
    // =====================
    // GAME
    // =====================
    { name: "Venison steaks", type: "food", storageType: "fridge" },
    { name: "Venison mince", type: "food", storageType: "fridge" },
    { name: "Rabbit", type: "food", storageType: "fridge" },
    { name: "Pheasant", type: "food", storageType: "fridge" }
];
  
export const fishItems = [
    // =====================
    // WHITE FISH (FRESH / CHILLED)
    // =====================
    
    { name: "Cod fillets", type: "food", storageType: "fridge" },
    { name: "Cod loins", type: "food", storageType: "fridge" },
    { name: "Haddock fillets", type: "food", storageType: "fridge" },
    { name: "Haddock smoked", type: "food", storageType: "fridge" },
    { name: "Pollock fillets", type: "food", storageType: "fridge" },
    { name: "Hake fillets", type: "food", storageType: "fridge" },
    { name: "Plaice fillets", type: "food", storageType: "fridge" },
    { name: "Sole fillets", type: "food", storageType: "fridge" },
    { name: "Coleman fillets", type: "food", storageType: "fridge" },
    { name: "Whiting fillets", type: "food", storageType: "fridge" },
  
    // =====================
    // OILY FISH (FRESH)
    // =====================
    { name: "Salmon fillets", type: "food", storageType: "fridge" },
    { name: "Salmon portions", type: "food", storageType: "fridge" },
    { name: "Trout fillets", type: "food", storageType: "fridge" },
    { name: "Mackerel fillets", type: "food", storageType: "fridge" },
    { name: "Whole mackerel", type: "food", storageType: "fridge" },
    { name: "Tuna steaks", type: "food", storageType: "fridge" },
    { name: "Sardines (fresh)", type: "food", storageType: "fridge" },
    { name: "Herring", type: "food", storageType: "fridge" },
  
    // =====================
    // WHOLE FISH
    // =====================
    { name: "Whole salmon", type: "food", storageType: "fridge" },
    { name: "Whole trout", type: "food", storageType: "fridge" },
    { name: "Sea bass", type: "food", storageType: "fridge" },
    { name: "Sea bream", type: "food", storageType: "fridge" },
    { name: "Whole plaice", type: "food", storageType: "fridge" },
    { name: "Whole sole", type: "food", storageType: "fridge" },
  
    // =====================
    // FROZEN FISH
    // =====================
    { name: "Frozen cod fillets", type: "food", storageType: "freezer" },
    { name: "Frozen haddock fillets", type: "food", storageType: "freezer" },
    { name: "Frozen pollock fillets", type: "food", storageType: "freezer" },
    { name: "Frozen salmon fillets", type: "food", storageType: "freezer" },
    { name: "Frozen tuna steaks", type: "food", storageType: "freezer" },
    { name: "Fish fingers", type: "food", storageType: "freezer" },
    { name: "Breaded fish fillets", type: "food", storageType: "freezer" },
  
    // =====================
    // SMOKED FISH
    // =====================
    { name: "Smoked salmon", type: "food", storageType: "fridge" },
    { name: "Smoked trout", type: "food", storageType: "fridge" },
    { name: "Smoked mackerel", type: "food", storageType: "fridge" },
  
    // =====================
    // TINNED FISH & SEAFOOD
    // =====================
    { name: "Tinned tuna", type: "food", storageType: "pantry" },
    { name: "Tinned tuna in oil", type: "food", storageType: "pantry" },
    { name: "Tinned tuna in brine", type: "food", storageType: "pantry" },
    { name: "Tinned salmon", type: "food", storageType: "pantry" },
    { name: "Sardines", type: "food", storageType: "pantry" },
    { name: "Sardines in oil", type: "food", storageType: "pantry" },
    { name: "Mackerel (tinned)", type: "food", storageType: "pantry" },
    { name: "Anchovies", type: "food", storageType: "pantry" },
    { name: "Anchovies in oil", type: "food", storageType: "pantry" },
];

export const fruitItems = [
    { name: "Apples", type: "food", storageType: "fridge" },
    { name: "Bananas", type: "food", storageType: "fridge" },
    { name: "Oranges", type: "food", storageType: "fridge" },
    { name: "Pears", type: "food", storageType: "fridge" },
    { name: "Plums", type: "food", storageType: "fridge" },
    { name: "Pineapples", type: "food", storageType: "fridge" },
    { name: "Grapes", type: "food", storageType: "fridge" },
]
  
export const vegItems = [
    // =====================
    // ROOT VEGETABLES
    // =====================
    { name: "Potatoes", type: "food", storageType: "pantry" },
    { name: "Sweet potatoes", type: "food", storageType: "pantry" },
    { name: "Carrots", type: "food", storageType: "fridge" },
    { name: "Parsnips", type: "food", storageType: "fridge" },
    { name: "Swede", type: "food", storageType: "fridge" },
    { name: "Turnips", type: "food", storageType: "fridge" },
    { name: "Beetroot", type: "food", storageType: "fridge" },
    { name: "Celeriac", type: "food", storageType: "fridge" },
    { name: "Radishes", type: "food", storageType: "fridge" },
  
    // =====================
    // ALLIUMS
    // =====================
    { name: "Onions", type: "food", storageType: "pantry" },
    { name: "Red onions", type: "food", storageType: "pantry" },
    { name: "White onions", type: "food", storageType: "pantry" },
    { name: "Shallots", type: "food", storageType: "pantry" },
    { name: "Garlic", type: "food", storageType: "pantry" },
    { name: "Spring onions", type: "food", storageType: "fridge" },
    { name: "Leeks", type: "food", storageType: "fridge" },
    { name: "Celery", type: "food", storageType: "fridge" },
  
    // =====================
    // LEAFY GREENS
    // =====================
    { name: "Iceberg lettuce", type: "food", storageType: "fridge" },
    { name: "Romaine lettuce", type: "food", storageType: "fridge" },
    { name: "Little gem lettuce", type: "food", storageType: "fridge" },
    { name: "Spinach", type: "food", storageType: "fridge" },
    { name: "Baby spinach", type: "food", storageType: "fridge" },
    { name: "Rocket", type: "food", storageType: "fridge" },
    { name: "Watercress", type: "food", storageType: "fridge" },
    { name: "Kale", type: "food", storageType: "fridge" },
    { name: "Swiss chard", type: "food", storageType: "fridge" },
    { name: "White Cabbage", type: "food", storageType: "fridge" },
    { name: "Red Cabbage", type: "food", storageType: "fridge" },
    { name: "Savoy cabbage", type: "food", storageType: "fridge" },
    { name: "Pak choi", type: "food", storageType: "fridge" },
  
    // =====================
    // CRUCIFEROUS
    // =====================
    { name: "Broccoli", type: "food", storageType: "fridge" },
    { name: "Tenderstem broccoli", type: "food", storageType: "fridge" },
    { name: "Cauliflower", type: "food", storageType: "fridge" },
    { name: "Brussels sprouts", type: "food", storageType: "fridge" },
  
    // =====================
    // NIGHTSHADES
    // =====================
    { name: "Tomatoes", type: "food", storageType: "fridge" },
    { name: "Cherry tomatoes", type: "food", storageType: "fridge" },
    { name: "Plum tomatoes", type: "food", storageType: "fridge" },
    { name: "Bell peppers", type: "food", storageType: "fridge" },
    { name: "Red peppers", type: "food", storageType: "fridge" },
    { name: "Green peppers", type: "food", storageType: "fridge" },
    { name: "Yellow peppers", type: "food", storageType: "fridge" },
    { name: "Chillies", type: "food", storageType: "fridge" },
    { name: "Aubergine", type: "food", storageType: "fridge" },
  
    // =====================
    // SQUASH & COURGETTES
    // =====================
    { name: "Courgette", type: "food", storageType: "fridge" },
    { name: "Butternut squash", type: "food", storageType: "pantry" },
    { name: "Acorn squash", type: "food", storageType: "pantry" },
    { name: "Pumpkin", type: "food", storageType: "pantry" },
  
    // =====================
    // LEGUMES & PODS (FRESH)
    // =====================
    { name: "Green beans", type: "food", storageType: "fridge" },
    { name: "Fine beans", type: "food", storageType: "fridge" },
    { name: "Runner beans", type: "food", storageType: "fridge" },
    { name: "Mangetout", type: "food", storageType: "fridge" },
    { name: "Sugar snap peas", type: "food", storageType: "fridge" },
    { name: "Peas (fresh)", type: "food", storageType: "fridge" },
    { name: "Broad beans", type: "food", storageType: "fridge" },
  
    // =====================
    // FUNGI
    // =====================
    { name: "Button mushrooms", type: "food", storageType: "fridge" },
    { name: "Chestnut mushrooms", type: "food", storageType: "fridge" },
    { name: "Portobello mushrooms", type: "food", storageType: "fridge" },
    { name: "Shiitake mushrooms", type: "food", storageType: "fridge" },
    { name: "Oyster mushrooms", type: "food", storageType: "fridge" },
  
    // =====================
    // SWEETCORN & SIMILAR
    // =====================
    { name: "Sweetcorn", type: "food", storageType: "fridge" },
    { name: "Sweetcorn on the cob", type: "food", storageType: "fridge" },
  
    // =====================
    // FROZEN VEGETABLES
    // =====================
    { name: "Frozen peas", type: "food", storageType: "freezer" },
    { name: "Frozen sweetcorn", type: "food", storageType: "freezer" },
    { name: "Frozen mixed vegetables", type: "food", storageType: "freezer" },
    { name: "Frozen spinach", type: "food", storageType: "freezer" },
    { name: "Frozen broccoli", type: "food", storageType: "freezer" },
  
    // =====================
    // TINNED VEGETABLES
    // =====================
    { name: "Tinned tomatoes", type: "food", storageType: "pantry" },
    { name: "Chopped tomatoes", type: "food", storageType: "pantry" },
    { name: "Tinned plum tomatoes", type: "food", storageType: "pantry" },
    { name: "Tinned Sweetcorn", type: "food", storageType: "pantry" },
    { name: "Tinned peas", type: "food", storageType: "pantry" },
    { name: "Tinned carrots", type: "food", storageType: "pantry" }
];

export const dairyItems = [
    { name: "Milk", type: "food", storageType: "fridge" },
    { name: "Eggs", type: "food", storageType: "fridge" },
    { name: "Cheese", type: "food", storageType: "fridge" },
    { name: "Yogurt", type: "food", storageType: "fridge" },
    { name: "Cream", type: "food", storageType: "fridge" },
    { name: "Butter", type: "food", storageType: "fridge" },
    { name: "Sour cream", type: "food", storageType: "fridge" },
    { name: "Ricotta", type: "food", storageType: "fridge" },
    { name: "Cottage cheese", type: "food", storageType: "fridge" },
    { name: "Greek yogurt", type: "food", storageType: "fridge" },

];

export const seasoningsItems = [
    { name: "Salt", type: "food", storageType: "pantry" },
    { name: "Sea salt", type: "food", storageType: "pantry" },
    { name: "Seasoned salt", type: "food", storageType: "pantry" },
    { name: "Fine salt", type: "food", storageType: "pantry" },
    { name: "Kosher salt", type: "food", storageType: "pantry" },
    { name: "Pepper", type: "food", storageType: "pantry" },
    { name: "Black pepper", type: "food", storageType: "pantry" },
    { name: "White pepper", type: "food", storageType: "pantry" },
    { name: "Garlic salt", type: "food", storageType: "pantry" },
    { name: "Garlic powder", type: "food", storageType: "pantry" },
    { name: "Onion powder", type: "food", storageType: "pantry" },
    { name: "Paprika", type: "food", storageType: "pantry" },
    { name: "Cumin", type: "food", storageType: "pantry" },
];

export const sweetenersItems = [
    { name: "Maple syrup", type: "food", storageType: "pantry" },
    { name: "Honey", type: "food", storageType: "pantry" },
]

export const spicesItems = [
    { name: "Turmeric", type: "food", storageType: "pantry" },
    { name: "Cinnamon", type: "food", storageType: "pantry" },
    { name: "Nutmeg", type: "food", storageType: "pantry" },
    { name: "Ginger (ground)", type: "food", storageType: "pantry" },
    { name: "Smoked paprika", type: "food", storageType: "pantry" },
    { name: "Cayenne pepper", type: "food", storageType: "pantry" },
    { name: "Chili powder", type: "food", storageType: "pantry" },
    { name: "Chili flakes", type: "food", storageType: "pantry" },
    { name: "Chili paste", type: "food", storageType: "pantry" },
]

export const herbsItems = [
    { name: "Parsley", type: "food", storageType: "pantry" },
    { name: "Thyme", type: "food", storageType: "pantry" },
    { name: "Rosemary", type: "food", storageType: "pantry" },
    { name: "Oregano", type: "food", storageType: "pantry" },
    { name: "Basil", type: "food", storageType: "pantry" },
    { name: "Mint", type: "food", storageType: "pantry" },
    { name: "Coriander", type: "food", storageType: "pantry" },
    { name: "Dill", type: "food", storageType: "pantry" },
    { name: "Chives", type: "food", storageType: "pantry" },
]

export const oilsItems = [
    { name: "Olive oil", type: "food", storageType: "pantry" },
    { name: "Sunflower oil", type: "food", storageType: "pantry" },
    { name: "Canola oil", type: "food", storageType: "pantry" },
    { name: "Sesame oil", type: "food", storageType: "pantry" },
    { name: "Peanut oil", type: "food", storageType: "pantry" },
    { name: "Coconut oil", type: "food", storageType: "pantry" },
    { name: "Vegetable oil", type: "food", storageType: "pantry" },
    { name: "Corn oil", type: "food", storageType: "pantry" },
    { name: "Soybean oil", type: "food", storageType: "pantry" },
    { name: "Grapeseed oil", type: "food", storageType: "pantry" },
]

export const fatsItems = [
    { name: "Lard", type: "food", storageType: "fridge" },
    { name: "Ghee", type: "food", storageType: "pantry" },
    { name: "Margarine", type: "food", storageType: "fridge" },
]

export const acidsItems = [
    { name: "White wine vinegar", type: "food", storageType: "pantry" },
    { name: "Red wine vinegar", type: "food", storageType: "pantry" },
    { name: "Apple cider vinegar", type: "food", storageType: "pantry" },
    { name: "Rice vinegar", type: "food", storageType: "pantry" },
    { name: "Balsamic vinegar", type: "food", storageType: "pantry" },
    { name: "Lemon juice", type: "food", storageType: "fridge" },
    { name: "Lemon Zest", type: "food", storageType: "fridge" },
    { name: "Lime juice", type: "food", storageType: "fridge" },
]

export const cookingSaucesItems = [
    { name: "Soy sauce", type: "food", storageType: "pantry" },
    { name: "Fish sauce", type: "food", storageType: "pantry" },
    { name: "Oyster sauce", type: "food", storageType: "pantry" },
    { name: "Curry paste", type: "food", storageType: "fridge" },
    { name: "Tomato paste", type: "food", storageType: "pantry" },
    { name: "Passata", type: "food", storageType: "pantry" },
    { name: "Tomato sauce", type: "food", storageType: "pantry" },
    { name: "Tomato puree", type: "food", storageType: "pantry" },
    { name: "Tomato ketchup", type: "food", storageType: "pantry" },
    { name: "Barbecue sauce", type: "food", storageType: "pantry" },
    { name: "BBQ sauce", type: "food", storageType: "pantry" },
    { name: "Hoisin sauce", type: "food", storageType: "pantry" },
    { name: "Teriyaki sauce", type: "food", storageType: "pantry" },
    { name: "Sriracha", type: "food", storageType: "pantry" },
]  

export const stockItems = [
    { name: "Chicken broth", type: "food", storageType: "pantry" },
    { name: "Chicken stock", type: "food", storageType: "pantry" },
    { name: "Beef broth", type: "food", storageType: "pantry" },
    { name: "Beef stock", type: "food", storageType: "pantry" },
    { name: "Vegetable broth", type: "food", storageType: "pantry" },
    { name: "Vegetable stock", type: "food", storageType: "pantry" },
    { name: "Stock cubes", type: "food", storageType: "pantry" },
]
  
export const grainsItems = [
    { name: "Brown rice", type: "food", storageType: "pantry" },
    { name: "Basmati rice", type: "food", storageType: "pantry" },
    { name: "White rice", type: "food", storageType: "pantry" },
    { name: "Pasta", type: "food", storageType: "pantry" },
    { name: "Noodles", type: "food", storageType: "pantry" },
    { name: "Couscous", type: "food", storageType: "pantry" },
    { name: "Quinoa", type: "food", storageType: "pantry" },
    { name: "Bread", type: "food", storageType: "pantry" },
    { name: "Wraps", type: "food", storageType: "pantry" },
]  

export const condimentsItems = [
    { name: "Mayonnaise", type: "condiment", storageType: "fridge" },
    { name: "Mustard", type: "condiment", storageType: "pantry" },
    { name: "Dijon mustard", type: "condiment", storageType: "pantry" },
    { name: "Yellow mustard", type: "condiment", storageType: "pantry" },
    { name: "Ketchup", type: "condiment", storageType: "pantry" },
    { name: "Relish", type: "condiment", storageType: "pantry" },
    { name: "Pickles", type: "condiment", storageType: "pantry" },
    { name: "Chutney", type: "condiment", storageType: "pantry" },
]

export const seafoodItems = [
    // =====================
    // FRESH SHELLFISH & SEAFOOD
    // =====================
    { name: "Raw prawns", type: "food", storageType: "fridge" },
    { name: "Cooked prawns", type: "food", storageType: "fridge" },
    { name: "King prawns", type: "food", storageType: "fridge" },
    { name: "Langoustines", type: "food", storageType: "fridge" },
    { name: "Scallops", type: "food", storageType: "fridge" },
    { name: "Mussels", type: "food", storageType: "fridge" },
    { name: "Clams", type: "food", storageType: "fridge" },
    { name: "Cockles", type: "food", storageType: "fridge" },
    { name: "Crab (whole)", type: "food", storageType: "fridge" },
    { name: "Crab meat", type: "food", storageType: "fridge" },
    { name: "Lobster", type: "food", storageType: "fridge" },
    { name: "Squid", type: "food", storageType: "fridge" },
    { name: "Octopus", type: "food", storageType: "fridge" },

    // =====================
    // FROZEN SEAFOOD
    // =====================
    { name: "Frozen prawns", type: "food", storageType: "freezer" },
    { name: "Frozen mixed seafood", type: "food", storageType: "freezer" },

    // =====================
    // TINNED SEAFOOD
    // =====================
    { name: "Tinned mussels", type: "food", storageType: "pantry" },
    { name: "Tinned cockles", type: "food", storageType: "pantry" },
]

export const legumesItems = [
    // =====================
    // DRIED
    // =====================
    { name: "Red lentils", type: "food", storageType: "pantry" },
    { name: "Green lentils", type: "food", storageType: "pantry" },
    { name: "Puy lentils", type: "food", storageType: "pantry" },
    { name: "Dried chickpeas", type: "food", storageType: "pantry" },
    { name: "Dried kidney beans", type: "food", storageType: "pantry" },
    { name: "Dried black beans", type: "food", storageType: "pantry" },

    // =====================
    // TINNED
    // =====================
    { name: "Tinned chickpeas", type: "food", storageType: "pantry" },
    { name: "Tinned kidney beans", type: "food", storageType: "pantry" },
    { name: "Tinned black beans", type: "food", storageType: "pantry" },
    { name: "Tinned butter beans", type: "food", storageType: "pantry" },
    { name: "Tinned cannellini beans", type: "food", storageType: "pantry" },
    { name: "Tinned borlotti beans", type: "food", storageType: "pantry" },
    { name: "Tinned mixed beans", type: "food", storageType: "pantry" },
    { name: "Tinned lentils", type: "food", storageType: "pantry" },
    { name: "Baked beans", type: "food", storageType: "pantry" },
]

export const nutsAndSeedsItems = [
    // =====================
    // NUTS
    // =====================
    { name: "Almonds", type: "food", storageType: "pantry" },
    { name: "Flaked almonds", type: "food", storageType: "pantry" },
    { name: "Ground almonds", type: "food", storageType: "pantry" },
    { name: "Walnuts", type: "food", storageType: "pantry" },
    { name: "Cashews", type: "food", storageType: "pantry" },
    { name: "Peanuts", type: "food", storageType: "pantry" },
    { name: "Pecans", type: "food", storageType: "pantry" },
    { name: "Pistachios", type: "food", storageType: "pantry" },
    { name: "Hazelnuts", type: "food", storageType: "pantry" },
    { name: "Pine nuts", type: "food", storageType: "pantry" },
    { name: "Macadamia nuts", type: "food", storageType: "pantry" },
    { name: "Brazil nuts", type: "food", storageType: "pantry" },
    { name: "Mixed nuts", type: "food", storageType: "pantry" },

    // =====================
    // SEEDS
    // =====================
    { name: "Sesame seeds", type: "food", storageType: "pantry" },
    { name: "Sunflower seeds", type: "food", storageType: "pantry" },
    { name: "Pumpkin seeds", type: "food", storageType: "pantry" },
    { name: "Chia seeds", type: "food", storageType: "pantry" },
    { name: "Flaxseeds", type: "food", storageType: "pantry" },
    { name: "Poppy seeds", type: "food", storageType: "pantry" },

    // =====================
    // NUT BUTTERS
    // =====================
    { name: "Peanut butter", type: "food", storageType: "pantry" },
    { name: "Almond butter", type: "food", storageType: "pantry" },
    { name: "Tahini", type: "food", storageType: "pantry" },
]

export const bakingItems = [
    { name: "Plain flour", type: "food", storageType: "pantry" },
    { name: "Self-raising flour", type: "food", storageType: "pantry" },
    { name: "Strong bread flour", type: "food", storageType: "pantry" },
    { name: "Cornflour", type: "food", storageType: "pantry" },
    { name: "Caster sugar", type: "food", storageType: "pantry" },
    { name: "Granulated sugar", type: "food", storageType: "pantry" },
    { name: "Icing sugar", type: "food", storageType: "pantry" },
    { name: "Demerara sugar", type: "food", storageType: "pantry" },
    { name: "Brown sugar", type: "food", storageType: "pantry" },
    { name: "Baking powder", type: "food", storageType: "pantry" },
    { name: "Bicarbonate of soda", type: "food", storageType: "pantry" },
    { name: "Yeast", type: "food", storageType: "pantry" },
    { name: "Vanilla extract", type: "food", storageType: "pantry" },
    { name: "Cocoa powder", type: "food", storageType: "pantry" },
    { name: "Dark chocolate", type: "food", storageType: "pantry" },
    { name: "Milk chocolate", type: "food", storageType: "pantry" },
    { name: "Golden syrup", type: "food", storageType: "pantry" },
    { name: "Treacle", type: "food", storageType: "pantry" },
    { name: "Desiccated coconut", type: "food", storageType: "pantry" },
]

export const cannedAndPreservedItems = [
    { name: "Dill pickles", type: "food", storageType: "fridge" },
    { name: "Pickled onions", type: "food", storageType: "pantry" },
    { name: "Pickled beetroot", type: "food", storageType: "pantry" },
    { name: "Pickled gherkins", type: "food", storageType: "pantry" },
    { name: "Capers", type: "food", storageType: "pantry" },
    { name: "Sun-dried tomatoes", type: "food", storageType: "pantry" },
    { name: "Olives", type: "food", storageType: "pantry" },
    { name: "Coconut milk", type: "food", storageType: "pantry" },
    { name: "Coconut cream", type: "food", storageType: "pantry" },
    { name: "Tinned fruit cocktail", type: "food", storageType: "pantry" },
    { name: "Tinned peaches", type: "food", storageType: "pantry" },
    { name: "Tinned pineapple", type: "food", storageType: "pantry" },
]

/**
 * Maps each ingredient array to the category it belongs to.
 * Category names MUST match the `name` field in prisma/seed/data/categories.ts.
*/

export type AllowedIngredientCategory = 
"Meat" |
"Fish" | 
"Seafood" |
"Fruits" | 
"Vegetables" | 
"Dairy" | 
"Seasonings" | 
"Sweeteners" | 
"Herbs & Spices" | 
"Oils & Fats" | 
"Sauces" | 
"Grains" |
"Legumes" |
"Nuts & Seeds" |
"Baking" |
"Canned & Preserved" 

export type Ingredient = {
    name: string;
    type: IngredientType;
    storageType: StorageType;
}

export const ingredientsByCategory: { categoryName: AllowedIngredientCategory, items: typeof meatItems } [] = [
    { categoryName: "Meat", items: meatItems },
    { categoryName: "Fish", items: fishItems },
    { categoryName: "Seafood", items: seafoodItems },
    { categoryName: "Fruits", items: fruitItems },
    { categoryName: "Vegetables", items: vegItems },
    { categoryName: "Dairy", items: dairyItems },
    { categoryName: "Grains", items: grainsItems },
    { categoryName: "Legumes", items: legumesItems },
    { categoryName: "Nuts & Seeds", items: nutsAndSeedsItems },
    { categoryName: "Seasonings", items: seasoningsItems },
    { categoryName: "Sweeteners", items: sweetenersItems },
    { categoryName: "Herbs & Spices", items: [...spicesItems, ...herbsItems] },
    { categoryName: "Oils & Fats", items: [...oilsItems, ...fatsItems] },
    { categoryName: "Sauces", items: [...acidsItems, ...cookingSaucesItems, ...stockItems, ...condimentsItems] },
    { categoryName: "Baking", items: bakingItems },
    { categoryName: "Canned & Preserved", items: cannedAndPreservedItems },
];

/** Flat list of every ingredient (no category info). */
export const allItems = ingredientsByCategory.flatMap((g) => g.items);