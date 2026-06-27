# ============================================================
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
