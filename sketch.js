/*
 * p5.js 程式設計測驗 v13.0 (手動確認回饋，最穩定版本 1400x900)
 * 特點: 題庫完整, 固定尺寸 (1400x900), 畫布在網頁中置中, 每題作答後手動點擊繼續。
 */

let allQuestions = [];       
let selectedQuestions = [];  
let currentQuestionIndex = 0; 
let userAnswers = [];        
const totalQuestions = 4;    
let lastAnswerCorrect = false; // 儲存上一題的答案是否正確

// 狀態機: 'INIT', 'QUIZ', 'FEEDBACK', 'RESULT'
let quizState = 'INIT'; 

// 由於改為手動點擊，feedbackTimer 和 FEEDBACK_DURATION 不再需要

// ---------------------------------------------------
// *** 題目數據：完整 ***
// ---------------------------------------------------
const quizData = [
  ["JavaScript 中，宣告一個變數但未賦值的預設值是?", "0", "null", "undefined", "C"],
  ["在 C/C++ 中，指標 (Pointer) 是用來儲存什麼的變數?", "數值", "記憶體位址", "字串內容", "B"],
  ["什麼是遞迴 (Recursion)?", "程式不斷重複執行", "函式呼叫自身", "資料的排序方法", "B"],
  ["網路協定 HTTP 的預設埠號 (Port) 是多少?", "21", "80", "443", "B"],
  ["以下哪種演算法的時間複雜度通常是 O(n^2)?", "Merge Sort", "Quick Sort", "Bubble Sort", "C"],
  ["Python 中，用來從檔案讀取一行文字的函式是?", "read()", "readLine()", "readline()", "C"],
  ["CSS 中，要將元素從標準文檔流中移除並定位，應使用哪個屬性?", "display: none", "position: absolute", "float: left", "B"],
  ["在資料庫 ACID 特性中，'I' 代表什麼?", "Integrity", "Isolation", "Index", "B"],
];
// ---------------------------------------------------

const CANVAS_WIDTH = 1400; 
const CANVAS_HEIGHT = 900; 

function setup() {
  let canvas = createCanvas(CANVAS_WIDTH, CANVAS_HEIGHT); 
  
  // 置中程式碼 (保持不變)
  let x = (windowWidth - CANVAS_WIDTH) / 2;
  let y = (windowHeight - CANVAS_HEIGHT) / 2;
  canvas.position(x, y);
  document.body.style.backgroundColor = '#eee'; 
  
  textAlign(CENTER, CENTER);
  rectMode(CENTER);
  
  loadBuiltinQuestions();
  selectRandomQuestions();
}

function windowResized() {
  // 保持畫布置中
  let x = (windowWidth - CANVAS_WIDTH) / 2;
  let y = (windowHeight - CANVAS_HEIGHT) / 2;
  select('canvas').position(x, y); 
}

function loadBuiltinQuestions() {
    for(let data of quizData) {
        allQuestions.push({
            Question: data[0],
            OptionA: data[1],
            OptionB: data[2],
            OptionC: data[3],
            Answer: data[4]
        });
    }
}

function draw() {
  background(240); 

  if (quizState === 'INIT') {
    displayInitScreen();
  } else if (quizState === 'QUIZ') {
    displayQuiz();
  } else if (quizState === 'FEEDBACK') {
    displayFeedback(); // 僅顯示回饋畫面，等待點擊
  } else if (quizState === 'RESULT') {
    displayResult();
  }
}

// ------------------- 啟動與作答控制 -------------------

function displayInitScreen() {
  fill(50);
  textSize(80); 
  text("💻 程式設計隨機測驗", width / 2, height * 0.3);
  
  let buttonW = 600; 
  let buttonH = 120;
  let buttonX = width / 2;
  let buttonY = height * 0.65;
  
  let isHovering = mouseX > buttonX - buttonW/2 && mouseX < buttonX + buttonW/2 && mouseY > buttonY - buttonH/2 && mouseY < buttonY + buttonH/2;
  
  if (isHovering) {
      fill(100, 150, 255); 
  } else {
      fill(150); 
  }
  rect(buttonX, buttonY, buttonW, buttonH, 25); 
  
  fill(255);
  textSize(50); 
  text("點擊開始測驗", buttonX, buttonY);
}

function mousePressed() {
  if (quizState === 'INIT') {
    let buttonW = 600;
    let buttonH = 120;
    let buttonX = width / 2;
    let buttonY = height * 0.65;
    let isClickingButton = mouseX > buttonX - buttonW/2 && mouseX < buttonX + buttonW/2 && mouseY > buttonY - buttonH/2 && mouseY < buttonY + buttonH/2;

    if(isClickingButton){
        quizState = 'QUIZ';
    }
  } 
  else if (quizState === 'RESULT') {
    // 點擊畫面任意處重新開始
    resetQuiz();
  } 
  else if (quizState === 'QUIZ') {
    handleAnswerClick();
  }
  else if (quizState === 'FEEDBACK') {
    // *** 關鍵修正：處理回饋畫面的「繼續」按鈕點擊 ***
    let buttonW = 400; 
    let buttonH = 100;
    let buttonX = width / 2;
    let buttonY = height * 0.85;

    let isClickingButton = mouseX > buttonX - buttonW/2 && mouseX < buttonX + buttonW/2 && mouseY > buttonY - buttonH/2 && mouseY < buttonY + buttonH/2;

    if(isClickingButton){
        // 點擊繼續，判斷是進入結果還是下一題
        if (currentQuestionIndex >= totalQuestions) {
            quizState = 'RESULT'; 
        } else {
            quizState = 'QUIZ'; 
        }
    }
  }
}

function handleAnswerClick() {
  const buttonWidth = 800;
  const buttonHeight = 110;
  const startY = height * 0.45;
  const spacing = 160;
  const options = ['A', 'B', 'C'];
  
  for (let i = 0; i < options.length; i++) {
    let optionChar = options[i];
    let x = width / 2;
    let y = startY + i * spacing;

    if (mouseX > x - buttonWidth/2 && mouseX < x + buttonWidth/2 && 
        mouseY > y - buttonHeight/2 && mouseY < y + buttonHeight/2) {
      
      userAnswers[currentQuestionIndex] = optionChar;
      
      let currentQ = selectedQuestions[currentQuestionIndex];
      lastAnswerCorrect = (optionChar === currentQ.Answer);

      quizState = 'FEEDBACK';
      // *** 不再需要計時器 ***
      
      currentQuestionIndex++;

      break;
    }
  }
}

// ------------------- 核心功能 -------------------

function selectRandomQuestions() {
  selectedQuestions = []; 
  userAnswers = [];       
  currentQuestionIndex = 0; 
  
  let tempQuestions = [...allQuestions]; 
  
  for (let i = 0; i < totalQuestions; i++) {
    if (tempQuestions.length === 0) break;
    let randomIndex = floor(random(tempQuestions.length));
    selectedQuestions.push(tempQuestions[randomIndex]);
    tempQuestions.splice(randomIndex, 1);
  }
}

function displayQuiz() {
  let currentQ = selectedQuestions[currentQuestionIndex];
  if (!currentQ) return;

  fill(50);
  textSize(48); 
  text(`第 ${currentQuestionIndex + 1} 題 / 共 ${totalQuestions} 題`, width / 2, height * 0.1);

  textSize(60); 
  textWrap(WORD);
  text(currentQ.Question, width / 2, height * 0.25, width * 0.8); 
  
  const buttonWidth = 800; 
  const buttonHeight = 110;
  const startY = height * 0.45;
  const spacing = 160;
  const options = ['A', 'B', 'C'];
  
  for (let i = 0; i < options.length; i++) {
    let optionChar = options[i];
    let x = width / 2;
    let y = startY + i * spacing;

    let isHovering = mouseX > x - buttonWidth/2 && mouseX < x + buttonWidth/2 && 
                     mouseY > y - buttonHeight/2 && mouseY < y + buttonHeight/2;

    if (isHovering) {
      fill(100, 150, 255); 
    } else {
      fill(150); 
    }
    rect(x, y, buttonWidth, buttonHeight, 25); 

    fill(255);
    textSize(40); 
    let optionKey = `Option${optionChar}`;
    let optionText = `${optionChar}: ${currentQ[optionKey]}`;
    text(optionText, x, y);
  }
}

function displayFeedback() {
  let currentQ = selectedQuestions[currentQuestionIndex - 1]; 
  
  let feedbackText = lastAnswerCorrect ? "✅ 恭喜！答案正確！" : "❌ 遺憾，答案錯誤！";
  let colorFill = lastAnswerCorrect ? color(0, 150, 0) : color(200, 0, 0); 

  // 1. 顯示回饋標題
  fill(50);
  textSize(48); 
  text(`第 ${currentQuestionIndex - 1} 題 作答結果`, width / 2, height * 0.1);

  // 2. 顯示結果回饋
  textSize(120);
  fill(colorFill);
  text(feedbackText, width / 2, height * 0.35);

  // 3. 顯示正確答案
  textSize(40);
  fill(50);
  text(`正確答案是: ${currentQ.Answer}`, width / 2, height * 0.55);
  
  // 4. 繪製「繼續」按鈕
  let buttonW = 400; 
  let buttonH = 100;
  let buttonX = width / 2;
  let buttonY = height * 0.85; // 設置在畫面底部
  
  let isHovering = mouseX > buttonX - buttonW/2 && mouseX < buttonX + buttonW/2 && mouseY > buttonY - buttonH/2 && mouseY < buttonY + buttonH/2;
  
  if (isHovering) {
      fill(50, 200, 50); // 綠色懸停
  } else {
      fill(100, 255, 100); // 淺綠色
  }
  rect(buttonX, buttonY, buttonW, buttonH, 20);
  
  // 決定按鈕文字
  let buttonLabel = currentQuestionIndex >= totalQuestions ? "查看結果" : "繼續下一題";
  
  fill(50);
  textSize(40); 
  text(buttonLabel, buttonX, buttonY);
}

function displayResult() {
  let totalCorrect = 0;
  for (let i = 0; i < totalQuestions; i++) {
    if (userAnswers[i] === selectedQuestions[i].Answer) {
      totalCorrect++;
    }
  }

  let score = (totalCorrect / totalQuestions) * 100;
  
  let feedback = "";
  if (score === 100) {
    feedback = "🎉 滿分！您是程式設計大師！";
  } else if (score >= 75) {
    feedback = "👍 表現優異，程式設計概念扎實！";
  } else if (score >= 50) {
    feedback = "👏 基礎穩固，多實作能更上一層樓！";
  } else {
    feedback = "🤔 沒關係，繼續學習程式設計吧！";
  }

  fill(50);
  textSize(80); 
  text("測驗結束！", width / 2, height * 0.15);

  textSize(120); 
  fill(0, 150, 0); 
  text(`成績: ${score.toFixed(0)} 分`, width / 2, height * 0.35);

  textSize(60); 
  fill(0, 0, 150); 
  text(`答對 ${totalCorrect} 題 / 共 ${totalQuestions} 題`, width / 2, height * 0.55);

  textSize(40); 
  fill(100);
  text(feedback, width / 2, height * 0.75);

  textSize(30); 
  text("點擊畫面任意處可重新開始測驗", width / 2, height * 0.9);
}

function resetQuiz() {
  selectRandomQuestions();
  quizState = 'QUIZ'; 
}