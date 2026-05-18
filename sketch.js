/*
Trinity-Sm
Final Version of Rolling in Dough
*/

let myFont;
let recipes;
let currentRecipe;

let totalMoney = 0;

let baseW = 400;
let baseH = 400;

let pointerCursor;
let handGrabCursor;
let cursorHotspot = {
  pointer: { x: 2, y: 2 },
  open: { x: 8, y: 8 },
  grab: { x: 8, y: 8 },
};

let stepIndex = 0;
let ingredients = [];
let ingredientImages = {};
let characterImg;
let mealImages = {};

let currentScreen = "startScreen";
let showRecipeBook = false;

let board;

let ovenTimer = 0;
let cooking = false;

let startTime = 0;
let totalTime = 0;
let mistakes = 0;

let feedbackText = "";
let feedbackTimer = 0;

let buttons = [];

let finishedItem = null;
let finishedDragging = false;

let titleImg;
let ovenImg;
let bowlImg;

// scaled mouse coords in base space
let mx = 0;
let my = 0;

let bgMusic;

function preload() {
  //load font
  myFont = loadFont("assets/PixelifySans-Regular.ttf");
  pointerCursor = loadImage("assets/cursor_pointer.png");
  handOpenCursor = loadImage("assets/cursor_hand_open.png");
  handGrabCursor = loadImage("assets/cursor_hand_grab.png");
  loadJSON("recipes.json", (data) => {
    recipes = data;
  });

  ingredientImages["flour"] = loadImage("assets/ingredients/flour.png");
  ingredientImages["water"] = loadImage("assets/ingredients/water.png");
  ingredientImages["yeast"] = loadImage("assets/ingredients/yeast.png");
  ingredientImages["milk"] = loadImage("assets/ingredients/milk.png");
  ingredientImages["egg"] = loadImage("assets/ingredients/egg.png");
  ingredientImages["vanilla"] = loadImage("assets/ingredients/vanilla.png");
  ingredientImages["butter"] = loadImage("assets/ingredients/butter.png");
  ingredientImages["sugar"] = loadImage("assets/ingredients/sugar.png");

  characterImg = loadImage("assets/character.png");
  
  // finished items images
mealImages["Bread"] = loadImage("assets/fullMeals/bread.png");
mealImages["Cake"] = loadImage("assets/fullMeals/cake.png");
mealImages["Cookies"] = loadImage("assets/fullMeals/cookies.png");
mealImages["Cupcakes"] = loadImage("assets/fullMeals/cupcake.png");
mealImages["Donuts"] = loadImage("assets/fullMeals/donuts.png");
  
  // other misc images
  titleImg = loadImage("assets/title.png");
ovenImg = loadImage("assets/oven.png");
bowlImg = loadImage("assets/bowl.png");
  
  //music
bgMusic = loadSound("assets/lofiewme-pixel-fantasia-355123.mp3");
  
  noStroke();
}

function setup() {
  createCanvas(windowWidth, windowHeight);
  textStyle(NORMAL);
  noCursor();
  textFont(myFont);
  rectMode(CENTER);

  board = {
    x: baseW / 2,
    y: baseH / 2 - 50,
    w: 175,
    h: 130,
  };

  buttons = [
    { label: "Start", x: baseW / 2, y: 200, w: 150, h: 40 },
    { label: "How To Play", x: baseW / 2, y: 250, w: 150, h: 40 },
  ];

  drawingContext.imageSmoothingEnabled = false;
  textFont(myFont);
  
  //music
  bgMusic.setLoop(true);
  bgMusic.setVolume(0.2);
try {
  bgMusic.play();
} catch(e) {
  // browser blocked it, will try on first click
}
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}

function draw() {
  background(240);

  let scaleFactor = min(width / baseW, height / baseH);
  let offsetX = (width - baseW * scaleFactor) / 2;
  let offsetY = (height - baseH * scaleFactor) / 2;

  // update global scaled mouse coords
  mx = (mouseX - offsetX) / scaleFactor;
  my = (mouseY - offsetY) / scaleFactor;

  push();
  translate(offsetX, offsetY);
  scale(scaleFactor);

  if (!recipes) {
    fill(0);
    text("Loading...", 150, 200);
    pop();
    return;
  }

  if (currentScreen === "startScreen") startScreen();
  if (currentScreen === "howTo") howToScreen();
  if (currentScreen === "counter") counter();
  if (currentScreen === "prepArea") prepArea();
  if (currentScreen === "oven") ovenScreen();
  if (currentScreen === "win") winScreen();

  // move finished item
  if (finishedDragging && finishedItem) {
    finishedItem.x = mx;
    finishedItem.y = my;
  }

  // timer + mistakes
  if (currentScreen === "prepArea" || currentScreen === "oven") {
    fill(0);
    let t = floor((millis() - startTime) / 1000);
    text("Time: " + t + "s", 10, 20);
    text("Mistakes: " + mistakes, 10, 40);
  }

  // feedback
  if (feedbackTimer > 0) {
    fill("red");
    textAlign(CENTER);
    textSize(20);
    text(feedbackText, baseW / 2, baseH / 2);
    textAlign(LEFT);
    feedbackTimer--;
  }

  // 📒 button
  if (currentScreen !== "startScreen" && currentScreen !== "howTo") {
    textSize(20);
    fill(0);
    textFont("sans-serif");
    text("📒", baseW - 30, 20);
    textFont(myFont);
  }

  // 📒 recipe book
  if (showRecipeBook && currentRecipe) {
    fill(255);
    rect(baseW / 2, baseH / 2, 300, 250);

    fill(0);
    textAlign(CENTER);
    text("Recipe: " + currentRecipe.name, baseW / 2, baseH / 2 - 90);

    textAlign(LEFT);
    for (let i = 0; i < currentRecipe.steps.length; i++) {
      let step = currentRecipe.steps[i];
      fill(i === stepIndex ? "green" : 0);
      text(
        "- " + step.type + " " + step.item,
        baseW / 2 - 120,
        baseH / 2 - 50 + i * 20
      );
    }
  }

  pop();


  // cursor is drawn in SCREEN space (after pop)
  drawCustomCursor();
}

// ---------------- SCREENS ----------------

function startScreen() {
  background("rgb(190,168,138)");

  textAlign(CENTER);
imageMode(CENTER);
let titleH = 140; //size
let titleW = (titleImg.width / titleImg.height) * titleH;
image(titleImg, baseW / 2, 100, titleW, titleH);
imageMode(CORNER);

  textSize(16);
  for (let b of buttons) {
    fill(255);
    rect(b.x, b.y, b.w, b.h);
    fill(0);
    text(b.label, b.x, b.y + 5);
  }

  textAlign(LEFT);
}

function howToScreen() {
  background(220);

  fill(0);
  textAlign(CENTER);

  textSize(20);
  text("How To Play", baseW / 2, 100);

  textSize(14);
  text("Drag ingredients", baseW / 2, 150);
  text("Follow steps (Tip: Use the Recipe Book!)", baseW / 2, 170);
  text("Bake in oven", baseW / 2, 190);
  text("Click to go back", baseW / 2, 260);

  textAlign(LEFT);
}

function counter() {
  background("white");

  fill(0);
  textAlign(CENTER);
  textSize(16);
  text("Click the customer to start!", baseW / 2, 30);
  text("💰 $" + totalMoney, baseW / 2, 55);
  textAlign(LEFT);

  // draw character
  imageMode(CENTER);
  let charH = 190;
  let charW = (characterImg.width / characterImg.height) * charH;
  image(characterImg, baseW / 2, 180, charW, charH);
  imageMode(CORNER);

  fill("tan");
  rect(baseW / 2, 325, baseW, 150);

  if (finishedItem) {
  imageMode(CENTER);
  if (finishedItem.img) {
    image(finishedItem.img, finishedItem.x, finishedItem.y, finishedItem.w, finishedItem.h);
  } else {
    // fallback white box if image missing
    fill(255);
    rect(finishedItem.x, finishedItem.y, finishedItem.w, finishedItem.h);
  }
  imageMode(CORNER);
}
}

function prepArea() {
  background("tan");

  imageMode(CENTER);
let bowlH = 200; // match board.h
let bowlW = (bowlImg.width / bowlImg.height) * bowlH;
image(bowlImg, board.x, board.y, bowlW, bowlH);

  for (let ing of ingredients) {
    if (ing.dragging) {
      ing.x = mx + ing.offsetX;
      ing.y = my + ing.offsetY;
    }

    imageMode(CENTER);
    image(ing.img, ing.x, ing.y, ing.w, ing.h);
  }
}

function ovenScreen() {
  background(180);

  // counter + floor
  fill("#FFE7C4"); // tan counter top
  rect(baseW / 2, baseH - 195, baseW + 50, 170);

  fill("#544539"); // brown floor/front
  rect(baseW / 2, baseH - 40, baseW + 50, 150);

  imageMode(CENTER);
let ovenH = 192;
let ovenW = (ovenImg.width / ovenImg.height) * ovenH;
image(ovenImg, baseW / 2, baseH / 2, ovenW, ovenH);
fill(0);
textAlign(CENTER);

  if (cooking) {
    ovenTimer++;
    text("Cooking...", baseW / 2 - 3, baseH / 2 - 100);
    if (ovenTimer > 120) {
      finishGame();
    }
  } else {
    text("Click oven", baseW / 2 - 3, baseH / 2 - 100)
  }

  textAlign(LEFT);
}

function winScreen() {
  background(200);

  fill(255);
  rect(baseW / 2, baseH / 2, 300, 240);

  fill(0);
  textAlign(CENTER);

  let stars = getStars();
  let message = getStarText(stars);

  textSize(20);
  text("Customer Satisfaction", baseW / 2, baseH / 2 - 80);

  textSize(28);
  text("⭐".repeat(stars), baseW / 2, baseH / 2 - 30);

  textSize(16);
  text(message, baseW / 2, baseH / 2);

  textSize(14);
  text("Time: " + totalTime + "s", baseW / 2, baseH / 2 + 30);
  text("Mistakes: " + mistakes, baseW / 2, baseH / 2 + 50);
  let earned = floor(
    (currentRecipe.price || 0) * { 3: 1.0, 2: 0.6, 1: 0.3 }[getStars()]
  );
  text("Earned: $" + earned, baseW / 2, baseH / 2 + 70);

  text("Click to continue", baseW / 2, baseH / 2 + 90);

  textAlign(LEFT);
}

// ---------------- LOGIC ----------------

function mousePressed() {
  
  // sometimes doesn't auto play music, do it at press if not
if (bgMusic && !bgMusic.isPlaying()) {
  bgMusic.play();
}
  
  
  // 📒 toggle — check in base space
  if (
    currentScreen !== "startScreen" &&
    currentScreen !== "howTo" &&
    mx > baseW - 60 &&
    mx < baseW &&
    my > 0 &&
    my < 50
  ) {
    showRecipeBook = !showRecipeBook;
    return;
  }

  if (currentScreen === "startScreen") {
    for (let b of buttons) {
      if (
        mx > b.x - b.w / 2 &&
        mx < b.x + b.w / 2 &&
        my > b.y - b.h / 2 &&
        my < b.y + b.h / 2
      ) {
        if (b.label === "Start") currentScreen = "counter";
        if (b.label === "How To Play") currentScreen = "howTo";
      }
    }
    return;
  }

  if (currentScreen === "howTo") {
    currentScreen = "startScreen";
    return;
  }

  if (currentScreen === "counter" && finishedItem) {
    if (
      mx > finishedItem.x - finishedItem.w / 2 &&
      mx < finishedItem.x + finishedItem.w / 2 &&
      my > finishedItem.y - finishedItem.h / 2 &&
      my < finishedItem.y + finishedItem.h / 2
    ) {
      finishedDragging = true;
      return;
    }
  }

  if (currentScreen === "counter") {
    if (finishedItem) return;

    // only start if clicking on/near the character
    let charX = baseW / 2;
    let charY = 175;
    let charH = 175;
    let charW = (characterImg.width / characterImg.height) * charH;

    let onCharacter =
      mx > charX - charW / 2 &&
      mx < charX + charW / 2 &&
      my > charY - charH / 2 &&
      my < charY + charH / 2;

    if (onCharacter) {
      pickRecipe();
      startTime = millis();
      mistakes = 0;
      currentScreen = "prepArea";
    }
    return;
  }

  if (currentScreen === "prepArea") {
    for (let ing of ingredients) {
      if (
        mx > ing.x - ing.w / 2 &&
        mx < ing.x + ing.w / 2 &&
        my > ing.y - ing.h / 2 &&
        my < ing.y + ing.h / 2
      ) {
        ing.dragging = true;
        ing.offsetX = ing.x - mx;
        ing.offsetY = ing.y - my;
      }
    }
  }

  if (currentScreen === "oven") {
    cooking = true;
    ovenTimer = 0;
  }

  if (currentScreen === "win") {
    currentScreen = "counter";
  }
}

function mouseReleased() {
  if (currentScreen === "counter" && finishedItem && finishedDragging) {
    finishedDragging = false;

    let targetX = baseW / 2;
    let targetY = 175;

    let inCounter =
      finishedItem.x > targetX - 50 &&
      finishedItem.x < targetX + 50 &&
      finishedItem.y > targetY - 80 &&
      finishedItem.y < targetY + 80;

    if (inCounter) {
      finishedItem.x = targetX;
      finishedItem.y = targetY;
      setTimeout(() => {
        finishedItem = null;
        currentScreen = "win";
      }, 200);
    }

    return;
  }

  if (currentScreen !== "prepArea") return;

  let step = currentRecipe.steps[stepIndex];

  for (let i = ingredients.length - 1; i >= 0; i--) {
    let ing = ingredients[i];

    if (ing.dragging) {
      ing.dragging = false;

      let onBoard =
        ing.x > board.x - board.w / 2 &&
        ing.x < board.x + board.w / 2 &&
        ing.y > board.y - board.h / 2 &&
        ing.y < board.y + board.h / 2;

      if (onBoard && step.type === "add") {
        if (ing.name === step.item) {
          ingredients.splice(i, 1);
          stepIndex++;
        } else {
          mistakes++;
          feedbackText = "Wrong!";
          feedbackTimer = 30;
          resetIngredientPositions();
        }
      }
    }
  }

  let nextStep = currentRecipe.steps[stepIndex];
  if (nextStep && nextStep.type !== "add") {
    currentScreen = "oven";
  }
}
function finishGame() {
  totalTime = floor((millis() - startTime) / 1000);

  let stars = getStars();
  let basePrice = currentRecipe.price || 0;
  let multipliers = { 3: 1.0, 2: 0.6, 1: 0.3 };
  let earned = floor(basePrice * multipliers[stars]);
  totalMoney += earned;

  let mealImg = mealImages[currentRecipe.name];
  let mealH = 100;
  let mealW = mealImg ? (mealImg.width / mealImg.height) * mealH : 64;

  finishedItem = {
    name: currentRecipe.name,
    img: mealImg,
    x: baseW / 2,
    y: baseH / 2,
    w: mealW,
    h: mealH,
  };

  finishedDragging = false;
  currentScreen = "counter";
}

// ---------------- HELPERS/UTIL ----------------

function pickRecipe() {
  currentRecipe = random(recipes);
  stepIndex = 0;
  ingredients = [];
  cooking = false;

  let shuffled = [...currentRecipe.ingredients];
  for (let i = shuffled.length - 1; i > 0; i--) {
    let j = floor(random(i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }

  let spacing = 90;
  let totalWidth = shuffled.length * spacing;
  let startX = baseW / 2 - totalWidth / 2 + spacing / 2;
  let y = baseH - 60;

  for (let i = 0; i < shuffled.length; i++) {
    ingredients.push({
      name: shuffled[i],
      img: ingredientImages[shuffled[i]],
      x: startX + i * spacing,
      y: y,
      w: 64,
      h: 64,
      dragging: false,
      offsetX: 0,
      offsetY: 0,
    });
  }
}

function resetIngredientPositions() {
  let spacing = 110;
  let totalWidth = ingredients.length * spacing;
  let startX = baseW / 2 - totalWidth / 2 + spacing / 2;
  let y = baseH - 60;

  for (let i = 0; i < ingredients.length; i++) {
    ingredients[i].x = startX + i * spacing;
    ingredients[i].y = y;
  }
}

function getStars() {
  let optimal = currentRecipe.optimalTime || 20;
  let ratio = totalTime / optimal;
  if (mistakes === 0 && ratio <= 1) return 3;
  if (mistakes <= 2 && ratio <= 1.5) return 2;
  return 1;
}

function getStarText(stars) {
  if (stars === 3) return "Perfect!";
  if (stars === 2) return "Pretty Good!";
  return "Needs Improvement";
}

//Ingredient dragging/holding logic 
function isHoldingIngredient() {
  for (let ing of ingredients) {
    if (ing.dragging) return true;
  }
  return false;
}

function isDraggingSomething() {
  if (finishedDragging) return true;
  for (let ing of ingredients) {
    if (ing.dragging) return true;
  }
  return false;
}

function isHoveringIngredient() {
  for (let ing of ingredients) {
    if (
      mx > ing.x - ing.w / 2 &&
      mx < ing.x + ing.w / 2 &&
      my > ing.y - ing.h / 2 &&
      my < ing.y + ing.h / 2
    ) {
      return true;
    }
  }

  if (finishedItem) {
    if (
      mx > finishedItem.x - finishedItem.w / 2 &&
      mx < finishedItem.x + finishedItem.w / 2 &&
      my > finishedItem.y - finishedItem.h / 2 &&
      my < finishedItem.y + finishedItem.h / 2
    ) {
      return true;
    }
  }

  return false;
}

function drawCustomCursor() {
  let drawSize = 32;
  let cursorToDraw = pointerCursor;
  let hotspot = cursorHotspot.pointer;

  if (isDraggingSomething()) {
    cursorToDraw = handGrabCursor;
    hotspot = cursorHotspot.grab;
  } else if (isHoveringIngredient()) {
    cursorToDraw = handOpenCursor;
    hotspot = cursorHotspot.open;
  }

  // drawn in screen space using raw mouseX/mouseY
  image(
    cursorToDraw,
    mouseX - hotspot.x,
    mouseY - hotspot.y,
    drawSize,
    drawSize
  );
}
