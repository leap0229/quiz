// 利用するAPI情報元 https://opentdb.com/
const API_URL = 'https://opentdb.com/api.php?amount=10&type=multiple';

// クイズ全体の情報の管理
const gameState = {
    quizzes: [],
    currentIndex: 0,
    numberOfCorrects: 0
};

// HTMLのid値がセットされているDOMを取得する
const headerTextElement = document.getElementById('header-text');
const categoryElement = document.getElementById('category');
const difficultyElement = document.getElementById('difficulty');
const questionElement = document.getElementById('question');
const answersElement = document.getElementById('answers');
const restartButton = document.getElementById('restart-button');

/**
 * クイズデータの取得
 */
const fetchQuizData = async () => {

    fetch(API_URL)
    .then(response => response.json())
    .then(responseBody => {
      const quizzes = responseBody.results;
      gameState.quizzes = quizzes;
      gameState.currentIndex = 0;
      gameState.numberOfCorrects = 0;

      setNextQuiz();
    })
    .catch(_ => {
        questionElement.textContent = 'クイズデータを取得できませんでした';
        restartButton.style.display = 'block';
    });

    headerTextElement.textContent = '取得中';
    questionElement.textContent = '少々お待ちください';
    restartButton.style.display = 'none';
};

/**
 * 次の問題を始めるか、クイズの終了処理を行う
 */
const setNextQuiz = () => {
    questionElement.textContent = '';
    removeAllAnswers();

    if (gameState.currentIndex === gameState.quizzes.length) {
        finishQuiz();
    } else {
        headerTextElement.textContent = `問題 ${gameState.currentIndex + 1}`;

        const quiz = gameState.quizzes[gameState.currentIndex];
        makeQuiz(quiz);
    }
};

/**
 * クイズ終了時の処理
 */
const finishQuiz = () => {
    headerTextElement.textContent = `あなたの正解は${gameState.numberOfCorrects}/${gameState.quizzes.length}`;
    categoryElement.textContent = '';
    difficultyElement.textContent = '';
    questionElement.textContent = '再度チャレンジしたい場合は以下をクリック';
    
    restartButton.textContent = 'ホームに戻る';
    restartButton.removeEventListener('click', fetchQuizData);
    restartButton.addEventListener('click', initApp);
    restartButton.style.display = "block";
};

/**
 * 表示されている解答の選択肢を削除する
 */
const removeAllAnswers = () => {
    while (answersElement.firstChild) {
        answersElement.removeChild(answersElement.firstChild);
    }
};

/**
 * クイズの表示を行う
 * @param {Object} quiz 
 */
const makeQuiz = (quiz) => {
    categoryElement.textContent = `[ジャンル] ${unescapeHTML(quiz.category)}`;
    difficultyElement.textContent = `[難易度] ${unescapeHTML(quiz.difficulty)}`;
    questionElement.textContent = unescapeHTML(quiz.question);

    // quizオブジェクトの中にあるcorrect_answer, incorrect_answersを結合して
    // 正解・不正解の解答をシャッフルする。
    const shuffledAnswers = shuffle([quiz.correct_answer, ...quiz.incorrect_answers]);

    shuffledAnswers.forEach(answer => {
        const answerElement = document.createElement('li');
        answerElement.textContent = unescapeHTML(answer);

        answerElement.addEventListener('click', () => {
            gameState.currentIndex++;

            if (answer === quiz.correct_answer) {
                gameState.numberOfCorrects++;
            } 

            setNextQuiz();
        });

        answersElement.appendChild(answerElement);
    });
};

/**
 * 与えられた配列をシャッフルする
 * @param {Array} array 
 */
const shuffle = (array) => {
    const shffuledArray = array.slice();
    for (let i = shffuledArray.length - 1; i >= 0; i--) {
        const rand = Math.floor(Math.random() * (i + 1));

        [shffuledArray[i], shffuledArray[rand]] = [shffuledArray[rand], shffuledArray[i]];
    }

    return shffuledArray;
};

/**
 * 画面の初期表示とクイズ開始のクリックイベントを登録する
 */
const initApp = () => {
    headerTextElement.textContent = 'ようこそ';
    questionElement.textContent = '以下のボタンをクリック';

    restartButton.textContent = '開始';
    restartButton.removeEventListener('click', initApp);
    restartButton.addEventListener('click', fetchQuizData);
};

/**
 * HTMLエスケープされた文字列をアンエスケープする
 * 参考にしたサイト : http://blog.tojiru.net/article/211339637.html
 * @param {String} str 
 */
const unescapeHTML = (str) => {
    const div = document.createElement("div");
    div.innerHTML = str.replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/ /g, "&nbsp;")
      .replace(/\r/g, "&#13;")
      .replace(/\n/g, "&#10;");

    return div.textContent || div.innerText;
};

(() => {
    initApp();
})();