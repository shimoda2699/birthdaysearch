/* ============================================================
   engine.js — 触らなくてOK
   役割：ボタン操作、画面表示の更新、quiz.py との連携
============================================================ */

// ===== Python(quiz.py) が登録する関数を受け取る場所 =====
let _startQuiz = function () {};
let _answerFn  = function () {};
let _answering = false;   // 連打防止

function registerQuiz(startFn, answerFn) {
  _startQuiz = startFn;
  _answerFn  = answerFn;
}

// ===== 質問を表示する（quiz.py から呼ばれる） =====
function showQuestion(text, questionNumber) {
  document.getElementById('question-text').textContent = text;
  document.getElementById('question-count').textContent =
    questionNumber + ' 回目の質問';
  document.getElementById('btn-yes').disabled = false;
  document.getElementById('btn-no').disabled  = false;
  _answering = false;
}

// ===== 月が確定したときの表示（quiz.py から呼ばれる） =====
function showMonthResult(month, count) {
  const area = document.getElementById('result-area');
  area.innerHTML =
    '<div class="result-line">🎉 誕生月は <b>' + month + ' 月</b> でした！' +
    '（質問 ' + count + ' 回で当てました）</div>';
  document.getElementById('phase-label').textContent = 'STEP: 誕生日をさがそう';
  addLog('月が確定: ' + month + '月 (' + count + '回)', 'result');
}

// ===== 最終結果（月と日の両方が確定したとき） =====
function showFinalResult(month, day, monthCount, dayCount) {
  const area = document.getElementById('result-area');
  area.innerHTML +=
    '<div class="final-line">🎂 先輩の誕生日は<br>' +
    '<span style="font-size:28px;">' + month + '月' + day + '日</span><br>' +
    '<span style="font-size:12px; color:#aaa;">月:' + monthCount + '回 / 日:' + dayCount + '回の質問で当てました</span>' +
    '</div>';
  document.getElementById('btn-yes').disabled = true;
  document.getElementById('btn-no').disabled  = true;
  document.getElementById('phase-label').textContent = 'クリア！';
  addLog('誕生日が確定: ' + month + '月' + day + '日', 'result');
}

// ===== 質問回数が多すぎて止まらないとき（バグ発見の合図） =====
function showStuck(phase, low, high, count) {
  const area = document.getElementById('result-area');
  const label = phase === 'month' ? '月' : '日';
  area.innerHTML =
    '<div class="stuck-line">⚠️ ' + count + '回 質問しても、まだ ' +
    label + 'が [' + low + ' か ' + high + '] のどちらかに絞れません。<br>' +
    '左のプログラムの <code>narrow_range</code> 関数を見直してみよう！</div>';
  document.getElementById('btn-yes').disabled = true;
  document.getElementById('btn-no').disabled  = true;
}

// ===== 質問ログに1行追加 =====
function addLog(text, kind) {
  const list = document.getElementById('log-list');
  const div = document.createElement('div');
  div.className = 'log-item' + (kind ? ' log-' + kind : '');
  div.textContent = text;
  list.appendChild(div);
  list.scrollTop = list.scrollHeight;
}

// ===== ボタン：このコードを反映する =====
document.getElementById('btn-apply').addEventListener('click', function () {
  const code = document.getElementById('code-text').value;
  document.getElementById('apply-msg').textContent = '反映中…';
  document.getElementById('result-area').innerHTML = '';

  if (window.runQuizCode) {
    window.runQuizCode(code);
    document.getElementById('apply-msg').textContent = '✓ 反映しました';
  } else {
    document.getElementById('apply-msg').textContent =
      'Python がまだ準備中です。少し待って再度押してください。';
    return;
  }

  // ゲームの状態を最初からにする（新しいコードで再スタート）
  document.getElementById('question-text').textContent = '「▶ スタート」を押してね';
  document.getElementById('question-count').textContent = '';
  document.getElementById('log-list').innerHTML = '';
  document.getElementById('phase-label').textContent = 'STEP: 誕生月をさがそう';
  document.getElementById('btn-yes').disabled = true;
  document.getElementById('btn-no').disabled  = true;
  _answering = false;
});

// ===== ボタン：元のコードに戻す =====
document.getElementById('btn-code-reset').addEventListener('click', function () {
  document.getElementById('code-text').value = window.QUIZ_CODE;
  document.getElementById('apply-msg').textContent = '';
});

// ===== ボタン：Yes / No =====
document.getElementById('btn-yes').addEventListener('click', function () {
  if (_answering) return;
  _answering = true;
  const q = document.getElementById('question-text').textContent;
  addLog(q + ' → はい', 'yes');
  document.getElementById('btn-yes').disabled = true;
  document.getElementById('btn-no').disabled  = true;
  _answerFn(true);
});

document.getElementById('btn-no').addEventListener('click', function () {
  if (_answering) return;
  _answering = true;
  const q = document.getElementById('question-text').textContent;
  addLog(q + ' → いいえ', 'no');
  document.getElementById('btn-yes').disabled = true;
  document.getElementById('btn-no').disabled  = true;
  _answerFn(false);
});

// ===== ボタン：スタート / リセット =====
document.getElementById('btn-quiz-start').addEventListener('click', function () {
  document.getElementById('result-area').innerHTML = '';
  document.getElementById('log-list').innerHTML = '';
  document.getElementById('phase-label').textContent = 'STEP: 誕生月をさがそう';
  document.getElementById('btn-yes').disabled = false;
  document.getElementById('btn-no').disabled  = false;
  _answering = false;
  _startQuiz();
});

document.getElementById('btn-quiz-reset').addEventListener('click', function () {
  document.getElementById('question-text').textContent = '「▶ スタート」を押してね';
  document.getElementById('question-count').textContent = '';
  document.getElementById('result-area').innerHTML = '';
  document.getElementById('log-list').innerHTML = '';
  document.getElementById('phase-label').textContent = 'STEP: 誕生月をさがそう';
  document.getElementById('btn-yes').disabled = true;
  document.getElementById('btn-no').disabled  = true;
  _answering = false;
});

// ===== 最初はYes/Noボタンを無効化（スタート前） =====
window.addEventListener('load', function () {
  document.getElementById('btn-yes').disabled = true;
  document.getElementById('btn-no').disabled  = true;
});

// ===== window に公開（Pythonから呼ぶため） =====
Object.assign(window, {
  registerQuiz:    registerQuiz,
  showQuestion:    showQuestion,
  showMonthResult: showMonthResult,
  showFinalResult: showFinalResult,
  showStuck:       showStuck,
});

// ===== quiz.py の内容（コード表示パネル用・自動埋め込み） =====
window.QUIZ_CODE = `# ============================================================
# 誕生日当てゲーム ～ 二分探索（にぶんたんさく）で当てよう！ ～
#
# 今からプログラムが「Yes」「No」の質問をします。
# 高校生の先輩に答えてもらって、ボタンを押していくと、
# 最後には先輩の誕生日（月と日）がわかります。
#
# ところが、このプログラムには「バグ（まちがい）」が1ヶ所あります。
# そのままだと、質問の数が増えすぎたり、答えがズレたりします。
# 1ヶ所を直して、正しく動くようにしてみましょう！
# ============================================================

from browser import window


# ----------------------------------------------------------
# 二分探索で「1〜n の中のどの数字か」を当てる関数
#
#   low  … 今、考えられる範囲の「下のはし」
#   high … 今、考えられる範囲の「上のはし」
#   mid  … low と high のちょうど中間の数字（質問する数字）
#
#   答え（answer）が mid 以下なら → high を mid にする（範囲を半分に）
#   答え（answer）が mid より大きいなら → low を ??? にする
#
#   ★ここが今回のバグ★
#   「mid より大きい」とわかったのに low = mid にしてしまうと、
#   mid という数字が範囲に残ったままになってしまう。
#   （本当は mid はもう「違う」とわかっているので、外すべき）
# ----------------------------------------------------------
def narrow_range(low, high, answer_is_yes):
    mid = (low + high) // 2
    if answer_is_yes:
        # 「mid 以下」と答えた → 上のはしを mid まで下げる
        high = mid
    else:
        # 「mid より大きい」と答えた → 下のはしを mid にする
        #
        # 🐛 ここが直すところ！ 1ヶ所だけ！
        # 「mid より大きい」と分かったのだから、
        # mid 自身はもう範囲に入れなくていいはず……
        low = mid          # ← この行を直そう（ヒントは下の方）
        # low = mid + 1   （←直すとこうなる）

    return low, high


# ----------------------------------------------------------
# 質問の文章を作る関数
# ----------------------------------------------------------
def make_question(low, high, label):
    mid = (low + high) // 2
    return f"{label}は {mid} 以下ですか？"


# ----------------------------------------------------------
# ゲーム全体の状態（変数）
# ----------------------------------------------------------
state = {
    'phase':  'month',   # 'month' → 'day' → 'done'
    'low':    1,
    'high':   12,
    'count':  0,         # 質問した回数
    'month_answer': 0,   # 当てた月（あとで表示用）
    'day_low':  1,
    'day_high': 31,
    'day_count': 0,
}


def current_question():
    """今出すべき質問の文章を返す"""
    if state['phase'] == 'month':
        return make_question(state['low'], state['high'], '誕生月')
    elif state['phase'] == 'day':
        return make_question(state['day_low'], state['day_high'], '誕生日')
    else:
        return ''


def start_quiz():
    """ゲームを初期状態に戻す"""
    state['phase']  = 'month'
    state['low']    = 1
    state['high']   = 12
    state['count']  = 0
    state['day_low']  = 1
    state['day_high'] = 31
    state['day_count'] = 0
    window.showQuestion(current_question(), state['count'] + 1)


def answer(is_yes):
    """Yes(True) / No(False) ボタンが押されたときの処理"""

    if state['phase'] == 'month':
        state['count'] += 1
        low, high = narrow_range(state['low'], state['high'], is_yes)
        state['low']  = low
        state['high'] = high

        if low == high:
            # 月が確定した！
            state['month_answer'] = low
            window.showMonthResult(low, state['count'])
            state['phase'] = 'day'
            window.showQuestion(current_question(), 1)
        elif state['count'] >= 8:
            # 8回質問しても終わらない → どこかおかしい
            window.showStuck('month', low, high, state['count'])
        else:
            window.showQuestion(current_question(), state['count'] + 1)

    elif state['phase'] == 'day':
        state['day_count'] += 1
        low, high = narrow_range(state['day_low'], state['day_high'], is_yes)
        state['day_low']  = low
        state['day_high'] = high

        if low == high:
            # 日も確定した！ → ゲーム終了
            state['phase'] = 'done'
            window.showFinalResult(state['month_answer'], low,
                                    state['count'], state['day_count'])
        elif state['day_count'] >= 10:
            window.showStuck('day', low, high, state['day_count'])
        else:
            window.showQuestion(current_question(), state['day_count'] + 1)


# ----------------------------------------------------------
# engine.js にボタン処理を登録する（おまじない）
# ----------------------------------------------------------
window.registerQuiz(start_quiz, answer)
`;
